import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { OptionItem, SelectStyles } from "@/components/customSelect";
import { ENDPOINTS } from "@/config/defaults";
import { Status } from "@/constants/constants";
import useGetBranchList from "@/hooks/useGetBranchList";
import useGlobalApi from "@/hooks/useGlobalApi";
import {
  CityItem,
  CountryItem,
  DefaultCorporate,
  DistrictItem,
  StateItem,
} from "@/screens/branchMaster/types";
import { InsuranceCompanyItem } from "@/screens/corporateMaster/types";
import { showSuccess, showWarning } from "@/utils/alert";
import { branchSettingSchema } from "@/validation/branchSettingSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Select, { SingleValue } from "react-select";
import { InferType } from "yup";
import { BranchDefaultSettingItem } from "../types";

const defaultFormValues = {
  branchId: 0,
  defaultCountryId: 0,
  defaultStateId: 0,
  defaultDistrictId: 0,
  defaultCityId: 0,
  defaultInsuranceCompanyId: 0,
  defaultCorporateId: 0,
};

const toSelectOption = (
  label: string | undefined,
  value: number | null | undefined
): OptionItem | null => {
  const numericValue = Number(value ?? 0);
  if (!numericValue) return null;

  return {
    label: label?.trim() || String(numericValue),
    value: numericValue,
  };
};

const BranchDefaultSetting = () => {
  const { loading, fetchApi } = useGlobalApi();
  const branches = useGetBranchList()?.branchList?.data ?? [];
  const loadRequestRef = useRef(0);

  const [countryList, setCountryList] = useState<CountryItem[]>([]);
  const [stateList, setStateList] = useState<StateItem[]>([]);
  const [districtList, setDistrictList] = useState<DistrictItem[]>([]);
  const [cityList, setCityList] = useState<CityItem[]>([]);
  const [insuranceCompanyList, setInsuranceCompanyList] = useState<InsuranceCompanyItem[]>([]);
  const [corporateList, setCorporateList] = useState<DefaultCorporate[]>([]);

  const [selectedCountry, setSelectedCountry] = useState<OptionItem | null>(null);
  const [selectedState, setSelectedState] = useState<OptionItem | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<OptionItem | null>(null);
  const [selectedCity, setSelectedCity] = useState<OptionItem | null>(null);
  const [selectedInsuranceCompany, setSelectedInsuranceCompany] = useState<OptionItem | null>(null);
  const [selectedCorporate, setSelectedCorporate] = useState<OptionItem | null>(null);

  const {
    reset,
    formState: { errors },
    handleSubmit,
    register,
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(branchSettingSchema),
    defaultValues: defaultFormValues,
  });

  const branchId = Number(watch("branchId") ?? 0);
  const buttonTitle = branchId ? "Update" : "Save";

  const clearLocationSelections = () => {
    setSelectedState(null);
    setSelectedDistrict(null);
    setSelectedCity(null);
    setStateList([]);
    setDistrictList([]);
    setCityList([]);
    setValue("defaultStateId", 0);
    setValue("defaultDistrictId", 0);
    setValue("defaultCityId", 0);
  };

  const clearCorporateSelection = () => {
    setSelectedCorporate(null);
    setCorporateList([]);
    setValue("defaultCorporateId", 0);
  };

  const clearAllSelections = () => {
    setSelectedCountry(null);
    setSelectedInsuranceCompany(null);
    clearLocationSelections();
    clearCorporateSelection();
    setValue("defaultCountryId", 0);
    setValue("defaultInsuranceCompanyId", 0);
  };

  //   country list
  const getCountryName = async () => {
    const res = await fetchApi(
      "GET",
      ENDPOINTS.GET_COUNTRY_MASTER,
      {},
      { params: { isActive: Status?.ACTIVE } }
    );
    const data = (res?.data ?? []) as CountryItem[];
    setCountryList(data);
    return data;
  };

  const countrySelectOption = useMemo<OptionItem[]>(() => {
    return [
      ...countryList.map(c => ({
        label: c.countryName,
        value: c.countryId,
      })),
    ];
  }, [countryList]);

  const countryDropDownHandler = (option: SingleValue<OptionItem>) => {
    const v = option?.value ?? null;
    setSelectedCountry(option);
    setValue("defaultCountryId", Number(v));
    clearLocationSelections();
    if (v) {
      getStateName(Number(v));
    }
  };

  //   state list
  const getStateName = async (id: number) => {
    if (!id) {
      setStateList([]);
      return [] as StateItem[];
    }

    const res = await fetchApi(
      "GET",
      ENDPOINTS.GET_STATE_MASTER,
      {},
      { params: { countryId: id, isActive: 1 } }
    );
    const data = (res?.data ?? []) as StateItem[];
    setStateList(data);
    return data;
  };

  const stateSelectOption = useMemo<OptionItem[]>(() => {
    return [
      ...stateList.map(s => ({
        label: s.stateName,
        value: s.stateId,
      })),
    ];
  }, [stateList]);

  const stateDropDownHandler = (option: SingleValue<OptionItem>) => {
    const v = option?.value ?? null;
    setSelectedState(option);
    setValue("defaultStateId", Number(v));
    setSelectedDistrict(null);
    setSelectedCity(null);
    setDistrictList([]);
    setCityList([]);
    setValue("defaultDistrictId", 0);
    setValue("defaultCityId", 0);
    if (v) {
      getDistrictName(Number(v));
    }
  };

  //   district list
  const getDistrictName = async (id: number) => {
    if (!id) {
      setDistrictList([]);
      return [] as DistrictItem[];
    }

    const res = await fetchApi(
      "GET",
      ENDPOINTS.GET_DISTRICT_MASTER,
      {},
      { params: { stateId: id, isActive: 1 } }
    );
    const data = (res?.data ?? []) as DistrictItem[];
    setDistrictList(data);
    return data;
  };

  const districtSelectOption = useMemo<OptionItem[]>(() => {
    return [
      ...districtList.map(d => ({
        label: d.districtName,
        value: d.districtId,
      })),
    ];
  }, [districtList]);

  const districtDropDownHandler = (option: SingleValue<OptionItem>) => {
    const v = option?.value ?? null;
    setSelectedDistrict(option);
    setValue("defaultDistrictId", Number(v));
    setSelectedCity(null);
    setCityList([]);
    setValue("defaultCityId", 0);
    if (v) {
      getCityName(Number(v));
    }
  };

  //   city
  const getCityName = async (id: number) => {
    if (!id) {
      setCityList([]);
      return [] as CityItem[];
    }

    const res = await fetchApi(
      "GET",
      ENDPOINTS.GET_CITY_MASTER,
      {},
      { params: { districtId: id, isActive: 1 } }
    );
    const data = (res?.data ?? []) as CityItem[];
    setCityList(data);
    return data;
  };

  const citySelectOption = useMemo<OptionItem[]>(() => {
    return [
      ...cityList.map(c => ({
        label: c.cityName,
        value: c.cityId,
      })),
    ];
  }, [cityList]);

  const cityDropDownHandler = (option: SingleValue<OptionItem>) => {
    const v = option?.value ?? null;
    setSelectedCity(option);
    setValue("defaultCityId", Number(v));
  };

  //   insurance company list
  const getInsuranceCompanyName = async () => {
    const res = await fetchApi("GET", ENDPOINTS.GET_ALL_INSURANCE_COMPANY_LIST);
    const data = (res?.data ?? []) as InsuranceCompanyItem[];
    setInsuranceCompanyList(data);
    return data;
  };

  const insuranceCompanySelectOption = useMemo<OptionItem[]>(() => {
    return [
      ...insuranceCompanyList.map(i => ({
        label: i.insuranceCompanyName,
        value: i.insuranceCompanyId,
      })),
    ];
  }, [insuranceCompanyList]);

  const insuranceCompanyDropDownHandler = (option: SingleValue<OptionItem>) => {
    const v = option?.value ?? null;
    setSelectedInsuranceCompany(option);
    setValue("defaultInsuranceCompanyId", Number(v));
    clearCorporateSelection();
    if (v) {
      getCorporateName(Number(v), branchId);
    }
  };

  //   corporate list
  const getCorporateName = async (insuranceCompanyId: number, selectedBranchId?: number) => {
    const resolvedBranchId = Number(selectedBranchId ?? branchId ?? 0);
    if (!insuranceCompanyId || !resolvedBranchId) {
      setCorporateList([]);
      return [] as DefaultCorporate[];
    }

    const res = await fetchApi(
      "GET",
      ENDPOINTS.GET_CORPORATE_LIST_BY_BRANCH_ID_AND_INSURANCE_COMPANY_ID,
      {},
      { params: { branchId: resolvedBranchId, insuranceCompanyId } }
    );
    const rawData = Array.isArray(res?.data) ? res.data : [];
    const data = rawData
      .map((item: Record<string, unknown>) => ({
        corporateId: Number(item.corporateId ?? item.CorporateId ?? 0),
        corporateName: String(item.corporateName ?? item.CorporateName ?? ""),
        insuranceCompanyId: Number(item.insuranceCompanyId ?? item.InsuranceCompanyId ?? 0),
        isActive: Number(item.isActive ?? item.IsActive ?? 1),
      }))
      .filter((c: DefaultCorporate) => c.corporateId > 0) as DefaultCorporate[];
    setCorporateList(data);
    return data;
  };

  const corporateSelectOption = useMemo<OptionItem[]>(() => {
    return [
      ...corporateList.map(c => ({
        label: c.corporateName,
        value: c.corporateId,
      })),
    ];
  }, [corporateList]);

  const corporateDropDownHandler = (option: SingleValue<OptionItem>) => {
    const v = option?.value ?? null;
    setSelectedCorporate(option);
    setValue("defaultCorporateId", Number(v));
  };

  useEffect(() => {
    getInsuranceCompanyName();
    getCountryName();
  }, []);

  //   edit branch default setting
  const getBranchDetails = async (selectedBranchId: number) => {
    const requestId = ++loadRequestRef.current;

    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_BRANCH_DETAILS,
      {},
      { params: { branchId: selectedBranchId } }
    );

    if (requestId !== loadRequestRef.current) return;

    const branchValue = resp?.data?.[0] as BranchDefaultSettingItem | undefined;
    if (!branchValue) {
      clearAllSelections();
      reset({ ...defaultFormValues, branchId: selectedBranchId });
      return;
    }

    const countryId = Number(branchValue.defaultCountryId ?? 0);
    const stateId = Number(branchValue.defaultStateId ?? 0);
    const districtId = Number(branchValue.defaultDistrictId ?? 0);
    const cityId = Number(branchValue.defaultCityId ?? 0);
    const insuranceCompanyId = Number(branchValue.defaultInsuranceCompanyId ?? 0);
    const corporateId = Number(branchValue.defaultCorporateId ?? 0);

    reset({
      branchId: selectedBranchId,
      defaultCountryId: countryId,
      defaultStateId: stateId,
      defaultDistrictId: districtId,
      defaultCityId: cityId,
      defaultInsuranceCompanyId: insuranceCompanyId,
      defaultCorporateId: corporateId,
    });

    const countries = countryList.length ? countryList : await getCountryName();
    if (requestId !== loadRequestRef.current) return;

    const insurances = insuranceCompanyList.length
      ? insuranceCompanyList
      : await getInsuranceCompanyName();
    if (requestId !== loadRequestRef.current) return;

    const selectedCountryItem = countries.find(c => Number(c.countryId) === countryId);
    setSelectedCountry(toSelectOption(selectedCountryItem?.countryName, countryId));
    setValue("defaultCountryId", countryId);

    const loadedStateList = countryId ? await getStateName(countryId) : [];
    if (requestId !== loadRequestRef.current) return;

    const selectedStateItem = loadedStateList.find(s => Number(s.stateId) === stateId);
    setSelectedState(toSelectOption(selectedStateItem?.stateName, stateId));
    setValue("defaultStateId", stateId);

    const loadedDistrictList = stateId ? await getDistrictName(stateId) : [];
    if (requestId !== loadRequestRef.current) return;

    const selectedDistrictItem = loadedDistrictList.find(d => Number(d.districtId) === districtId);
    setSelectedDistrict(toSelectOption(selectedDistrictItem?.districtName, districtId));
    setValue("defaultDistrictId", districtId);

    const loadedCityList = districtId ? await getCityName(districtId) : [];
    if (requestId !== loadRequestRef.current) return;

    const selectedCityItem = loadedCityList.find(c => Number(c.cityId) === cityId);
    setSelectedCity(toSelectOption(selectedCityItem?.cityName, cityId));
    setValue("defaultCityId", cityId);

    const selectedInsuranceItem = insurances.find(
      i => Number(i.insuranceCompanyId) === insuranceCompanyId
    );
    setSelectedInsuranceCompany(
      toSelectOption(selectedInsuranceItem?.insuranceCompanyName, insuranceCompanyId)
    );
    setValue("defaultInsuranceCompanyId", insuranceCompanyId);

    const loadedCorporateList = insuranceCompanyId
      ? await getCorporateName(insuranceCompanyId, selectedBranchId)
      : [];
    if (requestId !== loadRequestRef.current) return;

    const selectedCorporateItem = loadedCorporateList.find(
      c => Number(c.corporateId) === corporateId
    );
    setSelectedCorporate(toSelectOption(selectedCorporateItem?.corporateName, corporateId));
    setValue("defaultCorporateId", corporateId);
  };

  //   handle branch change
  const branchChangeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedBranchId = Number(e.target.value);
    setValue("branchId", selectedBranchId);

    if (!selectedBranchId) {
      clearAllSelections();
      reset(defaultFormValues);
      return;
    }

    void getBranchDetails(selectedBranchId);
  };

  const { onChange: branchIdOnChange, ...branchIdRegister } = register("branchId", {
    valueAsNumber: true,
  });

  const onSubmit = async (formData: InferType<typeof branchSettingSchema>) => {
    const resp = await fetchApi("PATCH", ENDPOINTS.UPDATE_DEFAULT_BRANCH_SETTING, formData);
    if (!resp?.result) {
      showWarning(resp?.message ?? "Failed to update branch default setting");
      return;
    }

    showSuccess(resp?.message ?? "Branch default setting updated successfully");
    loadRequestRef.current += 1;
    reset(defaultFormValues);
    clearAllSelections();
  };

  return (
    <div className="card mt-1">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-grid-4">
          <InputField label="Branch" required>
            <select
              className="input-field"
              {...branchIdRegister}
              onChange={e => {
                branchIdOnChange(e);
                branchChangeHandler(e);
              }}
            >
              <option value={0}>--Select--</option>
              {branches.map(b => (
                <option key={b.branchId} value={b.branchId}>
                  {b.branchName}
                </option>
              ))}
            </select>
            {errors.branchId && <p className="input-field-error">{errors.branchId.message}</p>}
          </InputField>

          <InputField label="Default Country" required>
            <Select<OptionItem, false>
              options={countrySelectOption}
              value={selectedCountry}
              placeholder="Select country"
              isSearchable
              isClearable
              styles={SelectStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              onChange={(option: SingleValue<OptionItem>) => countryDropDownHandler(option)}
            />
            {errors.defaultCountryId && (
              <p className="input-field-error">{errors.defaultCountryId.message}</p>
            )}
          </InputField>

          <InputField label="Default State" required>
            <Select<OptionItem, false>
              options={stateSelectOption}
              value={selectedState}
              placeholder="Select state"
              isSearchable
              isClearable
              styles={SelectStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              onChange={(option: SingleValue<OptionItem>) => stateDropDownHandler(option)}
            />
            {errors.defaultStateId && (
              <p className="input-field-error">{errors.defaultStateId.message}</p>
            )}
          </InputField>

          <InputField label="Default District" required>
            <Select<OptionItem, false>
              options={districtSelectOption}
              value={selectedDistrict}
              placeholder="Select district"
              isSearchable
              isClearable
              styles={SelectStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              onChange={(option: SingleValue<OptionItem>) => districtDropDownHandler(option)}
            />
            {errors.defaultDistrictId && (
              <p className="input-field-error">{errors.defaultDistrictId.message}</p>
            )}
          </InputField>

          <InputField label="Default City" required>
            <Select<OptionItem, false>
              options={citySelectOption}
              value={selectedCity}
              placeholder="Select city"
              isSearchable
              isClearable
              styles={SelectStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              onChange={(option: SingleValue<OptionItem>) => cityDropDownHandler(option)}
            />
            {errors.defaultCityId && (
              <p className="input-field-error">{errors.defaultCityId.message}</p>
            )}
          </InputField>

          <InputField label="Default Insurance Company" required>
            <Select<OptionItem, false>
              options={insuranceCompanySelectOption}
              value={selectedInsuranceCompany}
              placeholder="Select insurance company"
              isSearchable
              isClearable
              styles={SelectStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              onChange={(option: SingleValue<OptionItem>) =>
                insuranceCompanyDropDownHandler(option)
              }
            />
            {errors.defaultInsuranceCompanyId && (
              <p className="input-field-error">{errors.defaultInsuranceCompanyId.message}</p>
            )}
          </InputField>

          <InputField label="Default Corporate" required>
            <Select<OptionItem, false>
              options={corporateSelectOption}
              value={selectedCorporate}
              placeholder="Select corporate"
              isSearchable
              isClearable
              styles={SelectStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              onChange={(option: SingleValue<OptionItem>) => corporateDropDownHandler(option)}
            />
            {errors.defaultCorporateId && (
              <p className="input-field-error">{errors.defaultCorporateId.message}</p>
            )}
          </InputField>
        </div>

        <div className="form-actions-responsive mt-5">
          <button type="submit" className="save-btn">
            {buttonTitle}
          </button>
        </div>
      </form>

      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default BranchDefaultSetting;
