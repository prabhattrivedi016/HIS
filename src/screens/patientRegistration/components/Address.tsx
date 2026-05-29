import InputField from "@/components/customInputField";
import { OptionItem, SelectStyles } from "@/components/customSelect";
import { ENDPOINTS } from "@/config/defaults";
import { DefaultAddress, Status } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError } from "@/utils/alert";
import { allowOnlyNumbers } from "@/utils/inputValidationHandler";
import { ChangeEvent, KeyboardEvent, useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import Select, { SingleValue, StylesConfig } from "react-select";
import { CityItem, CountryItem, DistrictItem, PatientDataItem, StateItem } from "../types";

type AddressProps = {
  resetSignal?: number;
  prefillData?: PatientDataItem | null;
};

const Address = ({ resetSignal = 0, prefillData = null }: AddressProps) => {
  const { loading, fetchApi } = useGlobalApi();
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

  //   country
  const getCountry = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_COUNTRY_MASTER,
      {},
      { params: { isActive: Status.ACTIVE } },
      { component: "AddressOfPatientRegistration" }
    );
    if (resp?.result === false) {
      setSelectedState(null);
      setSelectedDistrict(null);
      setSelectedCity(null);
      return;
    }
    setCountryList(resp?.data ?? []);
  };

  //   country select option
  const countrySelectOption = useMemo(() => {
    return countryList?.map(c => ({
      label: c?.countryName,
      value: Number(c?.countryId),
    }));
  }, [countryList]);

  // default address
  useEffect(() => {
    if (!countryList?.length) return;

    const defaultCountry = countryList.find(
      c => c.countryName?.toLowerCase() === DefaultAddress?.COUNTRY?.toLowerCase()
    );

    if (!defaultCountry) return;

    const option = {
      label: defaultCountry.countryName,
      value: Number(defaultCountry.countryId),
    };

    setSelectedCountry(option);

    setValue("CountryId", option.value);
    setValue("Country", option.label);

    getState(option.value);
  }, [countryList]);

  useEffect(() => {
    // getAddressByBranch();
    getCountry();
  }, []);

  useEffect(() => {
    setSelectedCountry(null);
    setSelectedState(null);
    setSelectedDistrict(null);
    setSelectedCity(null);
    setStateList([]);
    setDistrictList([]);
    setCityList([]);
    setPincode("");
    setValue("Address", "");
    setValue("Pincode", "");
    setValue("CountryId", "");
    setValue("Country", "");
    setValue("StateId", "");
    setValue("State", "");
    setValue("DistrictId", "");
    setValue("District", "");
    setValue("CityId", "");
    setValue("City", "");
  }, [resetSignal]);

  useEffect(() => {
    if (!prefillData) return;

    if (prefillData.countryId) {
      setSelectedCountry({
        value: Number(prefillData.countryId),
        label: prefillData.country || "",
      });
      getState(Number(prefillData.countryId));
    }

    if (prefillData.stateId) {
      setSelectedState({
        value: Number(prefillData.stateId),
        label: prefillData.state || "",
      });
      getDistrict(Number(prefillData.stateId));
    }

    if (prefillData.districtId) {
      setSelectedDistrict({
        value: Number(prefillData.districtId),
        label: prefillData.district || "",
      });
      getCity(Number(prefillData.districtId));
    }

    if (prefillData.cityId) {
      setSelectedCity({
        value: Number(prefillData.cityId),
        label: prefillData.city || "",
      });
    }
  }, [prefillData]);

  //   country select handler
  const countrySelectHandler = (option: SingleValue<OptionItem>) => {
    if (!option) {
      setSelectedCountry(null);
      setSelectedState(null);
      setSelectedDistrict(null);
      setSelectedCity(null);
      setStateList([]);
      setDistrictList([]);
      setCityList([]);
      setValue("CountryId", "");
      setValue("Country", "");
      setValue("StateId", "");
      setValue("State", "");
      setValue("DistrictId", "");
      setValue("District", "");
      setValue("CityId", "");
      setValue("City", "");
      return;
    }
    setSelectedCountry(option);
    setValue("CountryId", option?.value ?? "");
    setValue("Country", option?.label ?? "");
    setSelectedState(null);
    setSelectedDistrict(null);
    setSelectedCity(null);
    setStateList([]);
    setDistrictList([]);
    setCityList([]);
    setValue("StateId", "");
    setValue("State", "");
    setValue("DistrictId", "");
    setValue("District", "");
    setValue("CityId", "");
    setValue("City", "");

    getState(Number(option?.value));
  };

  //   state
  const getState = async (countryId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_STATE_MASTER,
      {},
      { params: { countryId } },
      {
        component: "AddressOfPatientRegistration",
      }
    );
    if (resp?.result === false) {
      setSelectedDistrict(null);
      setSelectedCity(null);
      return;
    }
    setStateList(resp?.data ?? []);
  };

  //   state select option
  const stateSelectOption = useMemo(() => {
    return stateList?.map(s => ({
      label: s?.stateName,
      value: Number(s?.stateId),
    }));
  }, [stateList]);

  // default state
  useEffect(() => {
    if (!stateList?.length || !selectedCountry) return;

    const defaultState = stateList.find(
      s => s.stateName?.toLowerCase() === DefaultAddress?.STATE?.toLowerCase()
    );

    if (!defaultState) return;

    const option = {
      label: defaultState.stateName,
      value: Number(defaultState.stateId),
    };

    setSelectedState(option);
    setValue("StateId", option.value);
    setValue("State", option.label);

    getDistrict(option.value);
  }, [stateList]);

  //   state select handler
  const stateSelectHandler = (option: SingleValue<OptionItem>) => {
    if (!option) {
      setSelectedState(null);
      setSelectedDistrict(null);
      setSelectedCity(null);
      setDistrictList([]);
      setCityList([]);
      setValue("StateId", "");
      setValue("State", "");
      setValue("DistrictId", "");
      setValue("District", "");
      setValue("CityId", "");
      setValue("City", "");
      return;
    }
    setSelectedState(option);
    setValue("StateId", option?.value ?? "");
    setValue("State", option?.label ?? "");
    setSelectedDistrict(null);
    setSelectedCity(null);
    setDistrictList([]);
    setCityList([]);
    setValue("DistrictId", "");
    setValue("District", "");
    setValue("CityId", "");
    setValue("City", "");

    getDistrict(Number(option?.value));
  };

  //   district
  const getDistrict = async (stateId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DISTRICT_MASTER,
      {},
      { params: { stateId } },
      {
        component: "AddressOfPatientRegistration",
      }
    );
    if (resp?.result === false) {
      setSelectedCity(null);
      return;
    }

    setDistrictList(resp?.data ?? []);
  };

  //   district select option
  const districtSelectOption = useMemo(() => {
    return districtList?.map(d => ({
      label: d?.districtName,
      value: Number(d?.districtId),
    }));
  }, [districtList]);

  // default district
  useEffect(() => {
    if (!districtList?.length) return;

    const defaultDistrict = districtList.find(
      d => d.districtName?.toLowerCase() === DefaultAddress?.DISTRICT?.toLowerCase()
    );

    if (!defaultDistrict) return;

    const option = {
      label: defaultDistrict.districtName,
      value: Number(defaultDistrict.districtId),
    };

    setSelectedDistrict(option);

    setValue("DistrictId", option.value);
    setValue("District", option.label);

    getCity(option.value);
  }, [districtList]);
  //   district select handler
  const districtSelectHandler = (option: SingleValue<OptionItem>) => {
    if (!option) {
      setSelectedDistrict(null);
      setSelectedCity(null);
      setCityList([]);
      setValue("DistrictId", "");
      setValue("District", "");
      setValue("CityId", "");
      setValue("City", "");
      return;
    }
    setSelectedDistrict(option);
    setValue("DistrictId", option?.value ?? "");
    setValue("District", option?.label ?? "");
    setSelectedCity(null);
    setCityList([]);
    setValue("CityId", "");
    setValue("City", "");

    getCity(Number(option?.value));
  };

  //   city
  const getCity = async (districtId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CITY_MASTER,
      {},
      { params: { districtId } },
      {
        component: "AddressOfPatientRegistration",
      }
    );
    setCityList(resp?.data ?? []);
  };
  //   city select option
  const citySelectOption = useMemo(() => {
    return cityList?.map(c => ({
      label: c?.cityName,
      value: Number(c?.cityId),
    }));
  }, [cityList]);

  // default city
  useEffect(() => {
    if (!cityList?.length) return;

    const defaultCity = cityList.find(
      d => d?.cityName?.toLowerCase() === DefaultAddress?.City?.toLowerCase()
    );

    if (!defaultCity) return;

    const option = {
      label: defaultCity.cityName,
      value: Number(defaultCity.cityId),
    };

    setSelectedCity(option);

    setValue("CityId", option.value);
    setValue("City", option.label);

    // getCity(option.value);
  }, [cityList]);

  //   city select handler
  const citySelectHandler = (option: SingleValue<OptionItem>) => {
    if (!option) {
      setSelectedCity(null);
      setValue("CityId", "");
      setValue("City", "");
      return;
    }
    setSelectedCity(option);
    setValue("CityId", option?.value ?? "");
    setValue("City", option?.label ?? "");
  };

  //   pincode handler
  const pincodeHanlder = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    e.target.value = value;
    setPincode(value);
    if (!value) {
      setValue("Pincode", "");
      return;
    }
    setValue("Pincode", value);
  };
  //   get location by pincode

  const searchLocationByPincode = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const value = (e.target as HTMLInputElement).value;

      if (value.length === 6) {
        getLocation(value);
      } else {
        showError("Please enter six digits pincode");
        setSelectedCountry(null);
        setSelectedState(null);
        setSelectedDistrict(null);
        setSelectedCity(null);
        return;
      }
    }
  };

  const getLocation = async (pincode: string) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_LOCATION_BY_PINCODE,
      {},
      { params: { pincode, isAcitve: 1 } },
      {
        component: "AddressOfPatientRegistration",
      }
    );
    if (!resp) {
      setSelectedCountry(null);
      setSelectedState(null);
      setSelectedDistrict(null);
      setSelectedCity(null);
      setValue("CountryId", "");
      setValue("Country", "");
      setValue("StateId", "");
      setValue("State", "");
      setValue("DistrictId", "");
      setValue("District", "");
      setValue("CityId", "");
      setValue("City", "");
      return;
    }
    const countryOption = { value: resp?.data?.countryId, label: resp?.data?.countryName };
    setSelectedCountry(countryOption);
    setValue("CountryId", resp?.data?.countryId ?? "");
    setValue("Country", resp?.data?.countryName ?? "");

    const stateOption = { value: resp?.data?.stateId, label: resp?.data?.stateName };
    setSelectedState(stateOption);
    setValue("StateId", resp?.data?.stateId ?? "");
    setValue("State", resp?.data?.stateName ?? "");

    const districtOption = { value: resp?.data?.districtId, label: resp?.data?.districtName };
    setSelectedDistrict(districtOption);
    setValue("DistrictId", resp?.data?.districtId ?? "");
    setValue("District", resp?.data?.districtName ?? "");

    const cityOption = { value: resp?.data?.cityId, label: resp?.data?.cityName };
    setSelectedCity(cityOption);
    setValue("CityId", resp?.data?.cityId ?? "");
    setValue("City", resp?.data?.cityName ?? "");
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
          onChange={pincodeHanlder}
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
      </InputField>
      <InputField label="State" required>
        <Select<OptionItem, false>
          value={selectedState}
          options={stateSelectOption}
          placeholder="Select state"
          isSearchable
          isClearable
          onChange={option => stateSelectHandler(option)}
          styles={SelectStyles as StylesConfig<OptionItem, false>}
          menuPortalTarget={document.body}
          menuPosition="fixed"
        />
      </InputField>
      <InputField label="District" required>
        <Select<OptionItem, false>
          value={selectedDistrict}
          options={districtSelectOption}
          placeholder="Select district"
          isSearchable
          isClearable
          onChange={option => districtSelectHandler(option)}
          styles={SelectStyles as StylesConfig<OptionItem, false>}
          menuPortalTarget={document.body}
          menuPosition="fixed"
        />
      </InputField>
      <InputField label="City" required>
        <Select<OptionItem, false>
          value={selectedCity}
          options={citySelectOption}
          placeholder="Select city"
          isSearchable
          isClearable
          onChange={option => citySelectHandler(option)}
          styles={SelectStyles as StylesConfig<OptionItem, false>}
          menuPortalTarget={document.body}
          menuPosition="fixed"
        />
      </InputField>
    </>
  );
};

export default Address;
