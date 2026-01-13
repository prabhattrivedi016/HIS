import { yupResolver } from "@hookform/resolvers/yup";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import Select from "react-select";
import { Spinner } from "../../../../assets/svgIcons";
import InputField from "../../../components/customInputField";
import CustomLoader from "../../../components/customLoader";
import { SelectStyles } from "../../../components/customSelect";
import { ErrorMessage, SuccessMessage } from "../../../components/infoText";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { usePickMaster } from "../../../hooks/usePickMaster";
import { branchMasterSchema } from "../../../validation/branchMasterSchema";
import {
  CityItem,
  CountryItem,
  DefaultCorporate,
  DistrictItem,
  InsuranceItem,
  SelectItem,
  StateItem,
} from "../types";

const BranchMasterDrawer = React.memo(
  ({ isOpen, onClose, buttonTitle, drawerTitle, branchId, onCloseDrawer }) => {
    const { loading, error, fetchApi } = useGlobalApi();

    /* -------------------- values for extracting for dropdown -------------------- */
    const [countryList, setCountryList] = useState<CountryItem[]>([]);
    const [stateList, setStateList] = useState<StateItem[]>([]);
    const [districtList, setDistrictList] = useState<DistrictItem[]>([]);
    const [cityList, setCityList] = useState<CityItem[]>([]);
    const [insuranceCompany, setInsuranceCompany] = useState<InsuranceItem[]>([]);
    const [defaultCorporate, setDefaultCorporate] = useState<DefaultCorporate[]>([]);

    /* -------------------- selected Ids-------------------- */
    const [monthId, setMonthId] = useState<string>("");
    const [countryId, setCountryId] = useState<number | null>(null);
    const [stateId, setStateId] = useState<number | null>(null);
    const [districtId, setDistrictId] = useState<number | null>(null);
    const [cityId, setCityId] = useState<number | null>(null);
    const [insuranceCompanyId, setInsuranceCompanyId] = useState<number | null>(null);
    const [corporateId, setCorporateId] = useState<number | null>(null);

    const [successMessage, setSuccessMessage] = useState("");

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    /* -------------------- drawer  form -------------------- */
    const {
      handleSubmit,
      register,
      reset,
      formState: { errors },
    } = useForm({
      resolver: yupResolver(branchMasterSchema),
      defaultValues: {
        branchId: 0,
        branchName: "",
        branchCode: "",
        email: "",
        contactNo1: "",
        contactNo2: "",
        address: "",
        isActive: null,
        fyStartFrom: "",
      },
    });

    /* -------------------- financial month start from -------------------- */
    const financialYear = usePickMaster({ fieldName: "FinancialYear" });

    /* -------------------- api handlers -------------------- */
    const getCountryName = useCallback(async () => {
      const res = await fetchApi(
        "GET",
        ENDPOINTS.GET_COUNTRY_MASTER,
        {},
        { params: { isActive: 0 } }
      );
      setCountryList(res?.data ?? []);
    }, []);

    const getStateName = useCallback(async (id: number) => {
      const res = await fetchApi(
        "GET",
        ENDPOINTS.GET_STATE_MASTER,
        {},
        { params: { countryId: id, isActive: 1 } }
      );
      setStateList(res?.data ?? []);
    }, []);

    const getDistrictName = useCallback(async (id: number) => {
      const res = await fetchApi(
        "GET",
        ENDPOINTS.GET_DISTRICT_MASTER,
        {},
        { params: { stateId: id, isActive: 1 } }
      );
      setDistrictList(res?.data ?? []);
    }, []);

    const getCityName = useCallback(async (id: number) => {
      const res = await fetchApi(
        "GET",
        ENDPOINTS.GET_CITY_MASTER,
        {},
        { params: { districtId: id, isActive: 1 } }
      );
      setCityList(res?.data ?? []);
    }, []);

    const getInsuranceCompanyName = useCallback(async () => {
      const res = await fetchApi("GET", ENDPOINTS.GET_ALL_INSURANCE_COMPANY_LIST);
      setInsuranceCompany(res?.data ?? []);
    }, []);

    const getDefaultCorporate = useCallback(async (id: number) => {
      const res = await fetchApi(
        "GET",
        ENDPOINTS.GET_CORPORATE_LIST_BY_INSURANCE_COMPANY_ID,
        {},
        { params: { insuranceCompanyId: id, isActive: 1 } }
      );
      setDefaultCorporate(res?.data ?? []);
    }, []);

    /* -------------------- initial load on mounting -------------------- */
    useEffect(() => {
      getCountryName();
      getInsuranceCompanyName();
    }, []);

    /* -------------------- edit load -------------------- */
    const loadBranchForEdit = useCallback(
      async (id: number) => {
        const res = await fetchApi(
          "GET",
          ENDPOINTS.GET_BRANCH_DETAILS,
          {},
          { params: { branchId: id } }
        );

        const b = res?.data?.[0];
        if (!b) return;

        setCountryId(b?.defaultCountryId);
        await getStateName(b?.defaultCountryId);

        setStateId(b?.defaultStateId);
        await getDistrictName(b?.defaultStateId);

        setDistrictId(b?.defaultDistrictId);
        await getCityName(b?.defaultDistrictId);

        setCityId(b?.defaultCityId);

        setInsuranceCompanyId(b?.defaultInsuranceCompanyId);
        await getDefaultCorporate(b?.defaultInsuranceCompanyId);

        setCorporateId(b?.defaultCorporateId);

        setMonthId(b?.fyStartMonth);

        reset({
          branchId: b?.branchId,
          branchName: b?.branchName,
          branchCode: b?.branchCode,
          email: b?.email,
          contactNo1: b?.contactNo1,
          contactNo2: b?.contactNo2,
          address: b?.address,
          isActive: b?.isActive,
          fyStartFrom: b?.fyStartFrom,
        });
      },

      [reset, getStateName, getDistrictName, getCityName, getDefaultCorporate]
    );

    useEffect(() => {
      if (branchId) loadBranchForEdit(branchId);
    }, [branchId, loadBranchForEdit]);

    /* -------------------- options -------------------- */

    const monthSelectOption = useMemo(
      () =>
        financialYear?.pickMasterValue?.data?.map(y => ({
          value: String(y.key),
          label: y.value,
        })) || [],
      [financialYear]
    );

    const countrySelectOption = countryList.map(c => ({
      value: c.countryId,
      label: c.countryName,
    }));
    const stateSelectOption = stateList.map(s => ({ value: s.stateId, label: s.stateName }));
    const districtSelectOption = districtList.map(d => ({
      value: d.districtId,
      label: d.districtName,
    }));
    const citySelectOption = cityList.map(c => ({ value: c.cityId, label: c.cityName }));
    const insuranceSelectOption = insuranceCompany.map(i => ({
      value: i.insuranceCompanyId,
      label: i.insuranceCompanyName,
    }));
    const defaultCorporateSelectOption = defaultCorporate.map(c => ({
      value: c.insuranceCompanyId,
      label: c.corporateName,
    }));

    const selectedMonthOption = monthSelectOption.find(o => o.value === monthId) || null;

    const selectedCountryOption = countrySelectOption.find(o => o.value === countryId) || null;
    const selectedStateOption = stateSelectOption.find(o => o.value === stateId) || null;
    const selectedDistrictOption = districtSelectOption.find(o => o.value === districtId) || null;
    const selectedCityOption = citySelectOption.find(o => o.value === cityId) || null;
    const selectedInsuranceOption =
      insuranceSelectOption.find(o => o.value === insuranceCompanyId) || null;
    const selectedCorporateOption =
      defaultCorporateSelectOption.find(o => o.value === corporateId) || null;

    /* -------------------- dropdown handlers -------------------- */

    const monthDropDownHandler = (option: SelectItem) => {
      const v = option?.value ?? "";
      setMonthId(v);
    };

    const countryDropDownHandler = (option: SelectItem) => {
      const v = option?.value ?? null;
      setCountryId(v);
      setStateId(null);
      setDistrictId(null);
      setCityId(null);
      setInsuranceCompanyId(null);
      setCorporateId(null);
      setStateList([]);
      setDistrictList([]);
      setCityList([]);
      setDefaultCorporate([]);
      if (v) getStateName(v);
    };

    const stateDropDownHandler = (option: SelectItem) => {
      const v = option?.value ?? null;
      setStateId(v);
      setDistrictId(null);
      setCityId(null);
      setDistrictList([]);
      setCityList([]);
      if (v) getDistrictName(v);
    };

    const distDropDownHandler = (option: SelectItem) => {
      const v = option?.value ?? null;
      setDistrictId(v);
      setCityId(null);
      setCityList([]);
      if (v) getCityName(v);
    };

    const cityDropDownHandler = (option: SelectItem) => setCityId(option?.value ?? null);

    const insuranceDropDownHandler = (option: SelectItem) => {
      const v = option?.value ?? null;
      setInsuranceCompanyId(v);
      setCorporateId(null);
      setDefaultCorporate([]);
      if (v) getDefaultCorporate(v);
    };

    const corporateDropDownHandler = (option: SelectItem) => setCorporateId(option?.value ?? null);

    /* -------------------- SUBMIT -------------------- */
    const onSubmit = async data => {
      setIsSubmitting(true);
      if (!monthId) return;
      const payload = {
        ...data,
        fyStartFrom: monthId,
        defaultCountryId: countryId,
        defaultStateId: stateId,
        defaultDistrictId: districtId,
        defaultCityId: cityId,
        defaultInsuranceCompanyId: insuranceCompanyId,
        defaultCorporateId: corporateId,
      };

      const res = await fetchApi("POST", ENDPOINTS.CREATE_UPDATE_BRANCH_MASTER, payload);
      if (!res) return;

      setSuccessMessage(res?.message);
      onCloseDrawer?.();
      setTimeout(onClose, 1200);
    };

    return (
      <>
        <div className="drawer-bg-fade opacity-100 visible  " onClick={onClose} />

        <div className="drawer-layout drawer-bg translate-x-0 lg:w-[1000px]">
          <div className="drawer-title-border ">
            <h2 className="drawer-title">{drawerTitle}</h2>
            <button onClick={onClose} className="drawer-close-btn">
              ×
            </button>
          </div>

          <div className="p-4">
            {/* success & error message*/}
            <div className="mb-2">
              {successMessage && <SuccessMessage text={successMessage} />}
              {error && <ErrorMessage text={error} />}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 ">
              <div className=" shadow-lg m-2 p-6 rounded-lg  -mt-6 ">
                <h1 className="mb-5 text-xl">Branch Details</h1>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <InputField label="Branch Name" required>
                    <input
                      placeholder="Enter Branch Name"
                      {...register("branchName")}
                      className="input-field"
                    />
                    {errors.branchName && (
                      <p className="input-field-error">{errors.branchName.message}</p>
                    )}
                  </InputField>

                  <InputField label="Branch Code" required>
                    <input
                      placeholder="Enter Branch Code"
                      {...register("branchCode")}
                      className="input-field"
                    />
                    {errors.branchCode && (
                      <p className="input-field-error">{errors.branchCode.message}</p>
                    )}
                  </InputField>

                  <InputField label="Email" required={false}>
                    <input
                      placeholder="Enter Email"
                      {...register("email")}
                      className="input-field"
                    />
                    {errors.email && <p className="input-field-error">{errors.email.message}</p>}
                  </InputField>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <InputField label="Contact Number-1" required>
                    <input
                      placeholder="Enter Contact Number"
                      {...register("contactNo1")}
                      className="input-field"
                    />
                    {errors.contactNo1 && (
                      <p className="input-field-error">{errors.contactNo1.message}</p>
                    )}
                  </InputField>

                  <InputField label="Contact Number-2" required={false}>
                    <input
                      placeholder="Enter Contact Number"
                      {...register("contactNo2")}
                      className="input-field"
                    />
                  </InputField>

                  <InputField label="Address" required={false}>
                    <input
                      placeholder="Enter Address"
                      {...register("address")}
                      className="input-field"
                    />
                  </InputField>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <InputField label="Status" required>
                    <select {...register("isActive")} className="input-field">
                      <option value="">Select</option>
                      <option value="1">Active</option>
                      <option value="0">Inactive</option>
                    </select>
                  </InputField>

                  <InputField label="Financial Year Start From" required>
                    <Select
                      options={monthSelectOption}
                      value={selectedMonthOption}
                      placeholder="Select..."
                      isSearchable
                      isClearable
                      classNames={SelectStyles}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      onChange={monthDropDownHandler}
                    />
                    {isSubmitting && !monthId && (
                      <p className="input-field-error">Month is required</p>
                    )}
                  </InputField>
                </div>
              </div>

              <div className="shadow-lg m-2 p-6 rounded-lg">
                <h1 className="mb-5 text-xl">Default Branch Setting</h1>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <InputField label="Default Country" required={false}>
                    <Select
                      options={countrySelectOption}
                      value={selectedCountryOption}
                      placeholder="Select..."
                      isSearchable
                      isClearable
                      onChange={countryDropDownHandler}
                      classNames={SelectStyles}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  </InputField>

                  <InputField label="Default State" required={false}>
                    <Select
                      options={stateSelectOption}
                      value={selectedStateOption}
                      placeholder="Select..."
                      isSearchable
                      isClearable
                      onChange={stateDropDownHandler}
                      classNames={SelectStyles}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  </InputField>

                  <InputField label="Default District " required={false}>
                    <Select
                      options={districtSelectOption}
                      value={selectedDistrictOption}
                      placeholder="Select..."
                      isSearchable
                      isClearable
                      onChange={distDropDownHandler}
                      classNames={SelectStyles}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  </InputField>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <InputField label="Default City" required={false}>
                    <Select
                      options={citySelectOption}
                      value={selectedCityOption}
                      placeholder="Select..."
                      isSearchable
                      isClearable
                      onChange={cityDropDownHandler}
                      classNames={SelectStyles}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  </InputField>

                  <InputField label="Default Insurance Company" required={false}>
                    <Select
                      options={insuranceSelectOption}
                      value={selectedInsuranceOption}
                      placeholder="Select..."
                      isSearchable
                      isClearable
                      onChange={insuranceDropDownHandler}
                      classNames={SelectStyles}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  </InputField>

                  <InputField label="Default Corporate" required={false}>
                    <Select
                      options={defaultCorporateSelectOption}
                      value={selectedCorporateOption}
                      placeholder="Select..."
                      isSearchable
                      isClearable
                      onChange={corporateDropDownHandler}
                      classNames={SelectStyles}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  </InputField>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 rounded mt-5 flex justify-center items-center font-medium active:scale-95 transition-colors ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-[#1e6da1] hover:bg-blue-600 text-white"
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Spinner /> Loading...
                  </span>
                ) : (
                  buttonTitle
                )}
              </button>
            </form>
          </div>
        </div>

        {loading ? <CustomLoader isLoading={loading} /> : <></>}
      </>
    );
  }
);

export default BranchMasterDrawer;
