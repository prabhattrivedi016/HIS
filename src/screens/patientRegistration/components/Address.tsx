import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { OptionItem, SelectStyles } from "@/components/customSelect";
import { ENDPOINTS } from "@/config/defaults";
import { Status } from "@/constants/constants";
import { AuthContext } from "@/context/AuthContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError } from "@/utils/alert";
import { allowOnlyNumbers } from "@/utils/inputValidationHandler";
import { useQuery } from "@tanstack/react-query";
import {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useFormContext } from "react-hook-form";
import Select, { SingleValue, StylesConfig } from "react-select";
import {
  BranchDetailsItem,
  CityItem,
  CountryItem,
  DistrictItem,
  PatientDataItem,
  StateItem,
} from "../types";

type AddressProps = {
  resetSignal?: number;
  prefillData?: PatientDataItem | null;
};

type LocationOption = { value: number; label: string };

const toOption = (id: number | undefined, name: string | undefined): LocationOption | null => {
  if (!id || !name) return null;
  return { value: Number(id), label: name };
};

const Address = ({ resetSignal = 0, prefillData = null }: AddressProps) => {
  const branchId = useContext(AuthContext)?.user?.branchId ?? 1;
  const { loading, fetchApi } = useGlobalApi();
  const skipCascadeDefaultsRef = useRef(false);
  const lastAppliedBranchDefaultsKeyRef = useRef("");
  const activePincodeLookupRef = useRef(0);
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext();

  const [countryList, setCountryList] = useState<CountryItem[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<SingleValue<OptionItem> | null>(null);

  const [stateList, setStateList] = useState<StateItem[]>([]);
  const [selectedState, setSelectedState] = useState<SingleValue<OptionItem> | null>(null);

  const [districtList, setDistrictList] = useState<DistrictItem[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<SingleValue<OptionItem> | null>(null);

  const [cityList, setCityList] = useState<CityItem[]>([]);
  const [selectedCity, setSelectedCity] = useState<SingleValue<OptionItem> | null>(null);

  const [pincode, setPincode] = useState<string>("");

  const getBranchDetails = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_BRANCH_DETAILS,
      {},
      { params: { branchId } },
      { component: "AddressOfPatientRegistartion" }
    );
    return (resp?.data?.[0] ?? {}) as BranchDetailsItem;
  };

  const { data: branchDetails } = useQuery({
    queryKey: ["getBranchDetails", branchId],
    queryFn: getBranchDetails,
  });

  const clearStateDistrictCity = useCallback(() => {
    setSelectedState(null);
    setSelectedDistrict(null);
    setSelectedCity(null);
    setStateList([]);
    setDistrictList([]);
    setCityList([]);
    setValue("StateId", 0);
    setValue("State", "");
    setValue("DistrictId", 0);
    setValue("District", "");

    setValue("CityId", 0);
    setValue("City", "");
  }, [setValue]);

  const clearAllLocationFields = useCallback(() => {
    setSelectedCountry(null);
    clearStateDistrictCity();
    setValue("CountryId", 0);
    setValue("Country", "");
  }, [clearStateDistrictCity, setValue]);

  const toLocationOption = (option: SingleValue<OptionItem>): LocationOption | null => {
    if (option?.value == null || !option.label) return null;
    return { value: Number(option.value), label: option.label };
  };

  const applyLocationSelection = useCallback(
    (field: "state" | "district" | "city", option: LocationOption | null) => {
      const idKey = `${field.charAt(0).toUpperCase()}${field.slice(1)}Id` as
        | "StateId"
        | "DistrictId"
        | "CityId";
      const nameKey = field.charAt(0).toUpperCase() + field.slice(1);

      if (!option) {
        if (field === "state") {
          setSelectedState(null);
        } else if (field === "district") {
          setSelectedDistrict(null);
        } else {
          setSelectedCity(null);
        }
        setValue(idKey, "");
        setValue(nameKey, "");
        return;
      }

      if (field === "state") {
        setSelectedState(option);
      } else if (field === "district") {
        setSelectedDistrict(option);
      } else {
        setSelectedCity(option);
      }
      setValue(idKey, option.value);
      setValue(nameKey, option.label);
    },
    [setValue]
  );

  const fetchStates = useCallback(async (countryId: number): Promise<StateItem[]> => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_STATE_MASTER,
      {},
      { params: { countryId } },
      { component: "AddressOfPatientRegistration" }
    );
    if (resp?.result === false) {
      setStateList([]);
      return [];
    }
    const states: StateItem[] = resp?.data ?? [];
    setStateList(states);
    return states;
  }, []);

  const fetchDistricts = useCallback(async (stateId: number): Promise<DistrictItem[]> => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DISTRICT_MASTER,
      {},
      { params: { stateId } },
      { component: "AddressOfPatientRegistration" }
    );
    if (resp?.result === false) {
      setDistrictList([]);
      return [];
    }
    const districts: DistrictItem[] = resp?.data ?? [];
    setDistrictList(districts);
    return districts;
  }, []);

  const fetchCities = useCallback(async (districtId: number): Promise<CityItem[]> => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CITY_MASTER,
      {},
      { params: { districtId } },
      { component: "AddressOfPatientRegistration" }
    );
    const cities: CityItem[] = resp?.data ?? [];
    setCityList(cities);
    return cities;
  }, []);

  const loadCascadeListsForLocation = useCallback(
    async (countryId: number, stateId: number, districtId: number): Promise<void> => {
      await fetchStates(countryId);
      await fetchDistricts(stateId);
      await fetchCities(districtId);
    },
    [fetchStates, fetchDistricts, fetchCities]
  );

  const applyBranchDefaultLocation = useCallback(async () => {
    if (!branchDetails || prefillData) return;

    const countryId = Number(branchDetails.defaultCountryId ?? 0);
    const stateId = Number(branchDetails.defaultStateId ?? 0);
    const districtId = Number(branchDetails.defaultDistrictId ?? 0);
    const cityId = Number(branchDetails.defaultCityId ?? 0);

    if (!countryId || !countryList.length) return;

    skipCascadeDefaultsRef.current = true;

    const country = countryList.find(c => Number(c.countryId) === countryId);
    if (country) {
      const countryOption = {
        label: country.countryName,
        value: Number(country.countryId),
      };
      setSelectedCountry(countryOption);
      setValue("CountryId", countryOption.value);
      setValue("Country", countryOption.label);
    }

    const states = await fetchStates(countryId);

    if (stateId) {
      const state = states.find(s => Number(s.stateId) === stateId);
      if (state) {
        applyLocationSelection("state", {
          value: Number(state.stateId),
          label: state.stateName,
        });

        const districts = await fetchDistricts(stateId);

        if (districtId) {
          const district = districts.find(d => Number(d.districtId) === districtId);
          if (district) {
            applyLocationSelection("district", {
              value: Number(district.districtId),
              label: district.districtName,
            });

            const cities = await fetchCities(districtId);

            if (cityId) {
              const city = cities.find(c => Number(c.cityId) === cityId);
              if (city) {
                applyLocationSelection("city", {
                  value: Number(city.cityId),
                  label: city.cityName,
                });
              }
            }
          }
        }
      }
    }

    skipCascadeDefaultsRef.current = false;
  }, [
    branchDetails,
    prefillData,
    countryList,
    fetchStates,
    fetchDistricts,
    fetchCities,
    applyLocationSelection,
    setValue,
  ]);

  const getCountry = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_COUNTRY_MASTER,
      {},
      { params: { isActive: Status.ACTIVE } },
      { component: "AddressOfPatientRegistration" }
    );
    if (resp?.result === false) {
      clearAllLocationFields();
      return;
    }
    setCountryList(resp?.data ?? []);
  };

  const countrySelectOption = useMemo(
    () =>
      countryList.map(c => ({
        label: c.countryName,
        value: Number(c.countryId),
      })),
    [countryList]
  );

  useEffect(() => {
    getCountry();
  }, []);

  useEffect(() => {
    if (!countryList.length || !branchDetails || prefillData) return;

    const defaultsKey = [
      resetSignal,
      branchId,
      branchDetails.defaultCountryId,
      branchDetails.defaultStateId,
      branchDetails.defaultDistrictId,
      branchDetails.defaultCityId,
    ].join("-");

    if (lastAppliedBranchDefaultsKeyRef.current === defaultsKey) return;
    lastAppliedBranchDefaultsKeyRef.current = defaultsKey;

    applyBranchDefaultLocation();
  }, [
    countryList,
    branchDetails,
    prefillData,
    resetSignal,
    branchId,
    applyBranchDefaultLocation,
  ]);

  useEffect(() => {
    if (resetSignal === 0) return;

    skipCascadeDefaultsRef.current = true;

    clearStateDistrictCity();
    setPincode("");
    setValue("Address", "");
    setValue("Pincode", "");
    lastAppliedBranchDefaultsKeyRef.current = "";

    skipCascadeDefaultsRef.current = false;
  }, [resetSignal, setValue, clearStateDistrictCity]);

  useEffect(() => {
    const loadPrefillData = async () => {
      if (!prefillData) return;

      skipCascadeDefaultsRef.current = true;

      const countryOption = toOption(prefillData.countryId, prefillData.country);
      const stateOption = toOption(prefillData.stateId, prefillData.state);
      const districtOption = toOption(prefillData.districtId, prefillData.district);
      const cityOption = toOption(prefillData.cityId, prefillData.city);

      if (countryOption) {
        setSelectedCountry(countryOption);
        setValue("CountryId", countryOption.value);
        setValue("Country", countryOption.label);
        await fetchStates(countryOption.value);
      }

      if (stateOption) {
        applyLocationSelection("state", stateOption);
        await fetchDistricts(stateOption.value);
      }

      if (districtOption) {
        applyLocationSelection("district", districtOption);
        await fetchCities(districtOption.value);
      }

      if (cityOption) {
        applyLocationSelection("city", cityOption);
      }

      skipCascadeDefaultsRef.current = false;
    };

    loadPrefillData();
  }, [prefillData, setValue, fetchStates, fetchDistricts, fetchCities, applyLocationSelection]);

  const countrySelectHandler = (option: SingleValue<OptionItem>) => {
    if (!option) {
      setSelectedCountry(null);
      clearStateDistrictCity();
      setValue("CountryId", "");
      setValue("Country", "");
      return;
    }

    skipCascadeDefaultsRef.current = true;
    setSelectedCountry(option);
    setValue("CountryId", option.value ?? "");
    setValue("Country", option.label ?? "");
    clearStateDistrictCity();
    fetchStates(Number(option.value)).finally(() => {
      skipCascadeDefaultsRef.current = false;
    });
  };

  const stateSelectOption = useMemo(
    () =>
      stateList.map(s => ({
        label: s.stateName,
        value: Number(s.stateId),
      })),
    [stateList]
  );

  const stateSelectHandler = (option: SingleValue<OptionItem>) => {
    if (!option) {
      applyLocationSelection("state", null);
      setSelectedDistrict(null);
      setSelectedCity(null);
      setDistrictList([]);
      setCityList([]);
      setValue("DistrictId", 0);
      setValue("District", "");
      setValue("CityId", 0);
      setValue("City", "");
      return;
    }

    skipCascadeDefaultsRef.current = true;
    applyLocationSelection("state", toLocationOption(option));
    setSelectedDistrict(null);
    setSelectedCity(null);
    setCityList([]);
    setValue("DistrictId", 0);
    setValue("District", "");
    setValue("CityId", 0);
    setValue("City", "");
    fetchDistricts(Number(option.value)).finally(() => {
      skipCascadeDefaultsRef.current = false;
    });
  };

  const districtSelectOption = useMemo(
    () =>
      districtList.map(d => ({
        label: d.districtName,
        value: Number(d.districtId),
      })),
    [districtList]
  );

  const districtSelectHandler = (option: SingleValue<OptionItem>) => {
    if (!option) {
      applyLocationSelection("district", null);
      setSelectedCity(null);
      setCityList([]);
      setValue("CityId", 0);
      setValue("City", "");
      return;
    }

    skipCascadeDefaultsRef.current = true;
    applyLocationSelection("district", toLocationOption(option));
    setSelectedCity(null);
    setCityList([]);
    setValue("CityId", 0);
    setValue("City", "");
    fetchCities(Number(option.value)).finally(() => {
      skipCascadeDefaultsRef.current = false;
    });
  };

  const citySelectOption = useMemo(
    () =>
      cityList.map(c => ({
        label: c.cityName,
        value: Number(c.cityId),
      })),
    [cityList]
  );

  const citySelectHandler = (option: SingleValue<OptionItem>) => {
    if (!option) {
      applyLocationSelection("city", null);
      return;
    }
    applyLocationSelection("city", toLocationOption(option));
  };

  const pincodeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    e.target.value = value;
    setPincode(value);
    setValue("Pincode", value);

    if (!value) {
      clearStateDistrictCity();
      return;
    }

    clearStateDistrictCity();
  };

  const searchLocationByPincode = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();

    const value = (e.target as HTMLInputElement).value.trim();

    if (value.length !== 6) {
      showError("Please enter six digits pincode");
      clearStateDistrictCity();
      return;
    }

    getLocationByPincode(value);
  };

  const getLocationByPincode = async (pincodeValue: string) => {
    const lookupId = ++activePincodeLookupRef.current;

    skipCascadeDefaultsRef.current = true;

    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_LOCATION_BY_PINCODE,
      {},
      { params: { pincode: pincodeValue, isAcitve: 1 } },
      { component: "AddressOfPatientRegistration" }
    );

    if (lookupId !== activePincodeLookupRef.current) return;

    if (!resp?.data) {
      clearStateDistrictCity();
      skipCascadeDefaultsRef.current = false;
      return;
    }

    const {
      countryId,
      countryName,
      stateId,
      stateName,
      districtId,
      districtName,
      cityId,
      cityName,
    } = resp.data;

    const countryOption = toOption(countryId, countryName);
    const stateOption = toOption(stateId, stateName);
    const districtOption = toOption(districtId, districtName);
    const cityOption = toOption(cityId, cityName);

    if (!countryOption || !stateOption || !districtOption) {
      showError("Incomplete location data for this pincode");
      clearStateDistrictCity();
      skipCascadeDefaultsRef.current = false;
      return;
    }

    setSelectedCountry(countryOption);
    setValue("CountryId", countryOption.value);
    setValue("Country", countryOption.label);

    await loadCascadeListsForLocation(countryOption.value, stateOption.value, districtOption.value);

    if (lookupId !== activePincodeLookupRef.current) return;

    applyLocationSelection("state", stateOption);
    applyLocationSelection("district", districtOption);
    if (cityOption) {
      applyLocationSelection("city", cityOption);
    } else {
      applyLocationSelection("city", null);
    }

    skipCascadeDefaultsRef.current = false;
  };

  return (
    <>
      <input type="hidden" {...register("CountryId")} />
      <input type="hidden" {...register("Country")} />
      <input type="hidden" {...register("StateId")} />
      <input type="hidden" {...register("State")} />
      <input type="hidden" {...register("DistrictId")} />
      <input type="hidden" {...register("District")} />
      <input type="hidden" {...register("CityId")} />
      <input type="hidden" {...register("City")} />

      <InputField label="Address">
        <textarea
          className="input-field"
          placeholder="Enter address"
          {...register("Address")}
          rows={1}
        />
      </InputField>
      <InputField label="Pincode">
        <input
          type="text"
          className="input-field"
          value={pincode}
          placeholder="Enter pincode and press enter to search"
          onChange={pincodeHandler}
          maxLength={6}
          onKeyDown={searchLocationByPincode}
          onInput={allowOnlyNumbers}
        />
        {errors.Pincode && <p className="input-field-error">{String(errors.Pincode.message)}</p>}
      </InputField>

      <InputField label="Country" required>
        <Select<OptionItem, false>
          value={selectedCountry}
          options={countrySelectOption}
          placeholder="Select country"
          isSearchable
          isClearable
          onChange={option => countrySelectHandler(option)}
          styles={SelectStyles as StylesConfig<OptionItem, false>}
          menuPortalTarget={document.body}
          menuPosition="fixed"
        />
        {errors.CountryId && (
          <p className="input-field-error">{String(errors.CountryId.message)}</p>
        )}
      </InputField>
      <InputField label="State" required>
        <Select<OptionItem, false>
          value={selectedState}
          options={stateSelectOption}
          placeholder="Select state"
          isSearchable
          isClearable
          isDisabled={!selectedCountry}
          onChange={option => stateSelectHandler(option)}
          styles={SelectStyles as StylesConfig<OptionItem, false>}
          menuPortalTarget={document.body}
          menuPosition="fixed"
        />
        {errors.StateId && <p className="input-field-error">{String(errors.StateId.message)}</p>}
      </InputField>
      <InputField label="District" required>
        <Select<OptionItem, false>
          value={selectedDistrict}
          options={districtSelectOption}
          placeholder="Select district"
          isSearchable
          isClearable
          isDisabled={!selectedState}
          onChange={option => districtSelectHandler(option)}
          styles={SelectStyles as StylesConfig<OptionItem, false>}
          menuPortalTarget={document.body}
          menuPosition="fixed"
        />
        {errors.DistrictId && (
          <p className="input-field-error">{String(errors.DistrictId.message)}</p>
        )}
      </InputField>
      <InputField label="City" required>
        <Select<OptionItem, false>
          value={selectedCity}
          options={citySelectOption}
          placeholder="Select city"
          isSearchable
          isClearable
          isDisabled={!selectedDistrict}
          onChange={option => citySelectHandler(option)}
          styles={SelectStyles as StylesConfig<OptionItem, false>}
          menuPortalTarget={document.body}
          menuPosition="fixed"
        />
        {errors.CityId && <p className="input-field-error">{String(errors.CityId.message)}</p>}
      </InputField>

      {!!loading && <CustomLoader isLoading={loading} />}
    </>
  );
};

export default Address;
