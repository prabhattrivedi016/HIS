import BillingDetails from "@/components/BillingDetails";
import { BillingDetailsHandle, BillingValuesItem } from "@/components/BillingDetails/types";
import CustomDateInput from "@/components/customDateInput";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { OptionItem, SelectStyles } from "@/components/customSelect";
import SubmitButton from "@/components/globalButtons/SubmitButton";
import InputFieldModal from "@/components/inputFieldModal";
import UhidGlobalSearch from "@/components/SingledrawerAndPopup/components/UhidGlobalSearch";
import { ENDPOINTS } from "@/config/defaults";
import { BranchContext } from "@/context/BranchContext";
import { RoleContext } from "@/context/RoleContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { PickMasterItem } from "@/types";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { allowOnlyNumbers } from "@/utils/inputValidationHandler";
import {
  defaultPatientRegistrationValues,
  patientRegistrationSchema,
} from "@/validation/patientRegistrationSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
import Select, { StylesConfig } from "react-select";
import {
  getAgeFromDob,
  getDobFromAge,
  normalizePatientGenderForApi,
  resolvePickValue,
} from "../patientRegistration/components/dobHelper";
import SearchPatientPopup from "../patientRegistration/components/SearchPatientPopup";
import {
  BranchDetailsItem,
  CityItem,
  CountryItem,
  DistrictItem,
  InsuranceListItem,
  PatientListItem,
  StateItem,
  VisitListItem,
} from "./types";

const OpdAppointment = () => {
  const { loading, fetchApi } = useGlobalApi();
  const { branchId } = useContext(BranchContext);

  const titleList = usePickMaster("Title")?.pickMasterValue ?? [];

  const genderList = usePickMaster("Gender")?.pickMasterValue ?? [];
  const roleId = useContext(RoleContext)?.roleId;

  const [visitDetailsPayload, setVisitDetailsPaylaod] = useState({
    patientId: 0,
    branchId,
    doctorId: 0,
    appDateTime: "2026-08-10T05:49:05.078Z",
    roleId,
    insuranceCompanyId: 0,
    corporateId: 0,
    serviceItemId: 0,
    serviceName: "",
    amount: 0,
    slotId: 0,
    sourceType: "",
  });

  const [showPaymentDetailsSection, setShowPaymentDetailsSection] = useState(false);
  const billingDetailsRef = useRef<BillingDetailsHandle | null>(null);

  const [billingValues, setBillingValues] = useState<BillingValuesItem>({
    grossBillAmount: 0,
    totalDiscPerOnBill: 0,
    totalDiscAmtOnBill: 0,
    roundOff: 0,
    netAmount: 0,
    balanceAmount: 0,
    discApprovedById: 0,
    discApprovedName: "",
    discountReason: "",
    remarks: "",
  });

  // branch details
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

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(patientRegistrationSchema),
    defaultValues: defaultPatientRegistrationValues,
  });

  const [showPopup, setShowPopup] = useState(false);
  const [patientList, setPatientList] = useState<PatientListItem[]>([]);
  const [activePatientIndex, setActivePatientIndex] = useState(0);
  const searchTimeoutRef = useRef<any>(null);

  const [slots, setSlots] = useState("");
  const [source, setSource] = useState("Telephonic");
  const [visitType, setVisitType] = useState<number | string>("");
  const collectPrePaymentRef = useRef(false);
  const isUpdatingAgeDob = useRef(false);

  // auto filling gender on the basis of title
  const watchedTitle = watch("Title");
  const lockedGenderByTitle = useMemo(() => {
    if (!watchedTitle || !titleList.length) return "";
    const matchedTitle = titleList.find((t: any) => t.value === watchedTitle);
    if (matchedTitle) {
      if (matchedTitle.key === "M") return "Male";
      if (matchedTitle.key === "F") return "Female";
    }
    return "";
  }, [watchedTitle, titleList]);

  useEffect(() => {
    if (lockedGenderByTitle) {
      setValue("Gender", lockedGenderByTitle, { shouldDirty: true, shouldValidate: true });
    }
  }, [lockedGenderByTitle, setValue]);

  // auto-selecting Mr. as default title on initial load
  useEffect(() => {
    if (!titleList.length) return;
    if (!watchedTitle) {
      const defaultTitle = titleList.find(item => item.value === "Mr.") || null;
      if (defaultTitle?.value) {
        setValue("Title", defaultTitle.value, { shouldDirty: false, shouldValidate: true });
      }
    }
  }, [titleList, watchedTitle, setValue]);

  // dob to age
  useEffect(() => {
    if (isUpdatingAgeDob.current) return;

    const dob = watch("Dob");
    if (!dob) return;

    const age = getAgeFromDob(dob);
    if (!age) return;

    isUpdatingAgeDob.current = true;

    setValue("AgeYears", Number(age.years));
    setValue("AgeMonths", Number(age.months));
    setValue("AgeDays", Number(age.days));

    isUpdatingAgeDob.current = false;
  }, [watch("Dob"), setValue]);

  // age to dob
  useEffect(() => {
    if (isUpdatingAgeDob.current) return;

    const age = watch("AgeYears");
    const months = watch("AgeMonths");
    const days = watch("AgeDays");

    if (!age && !months && !days) {
      isUpdatingAgeDob.current = true;
      setValue("Dob", "");
      isUpdatingAgeDob.current = false;
      return;
    }

    const dob = getDobFromAge(Number(age || 0), Number(months || 0), Number(days || 0));

    if (!dob) return;

    isUpdatingAgeDob.current = true;
    setValue("Dob", dob);

    isUpdatingAgeDob.current = false;
  }, [watch("AgeYears"), watch("AgeMonths"), watch("AgeDays"), setValue]);

  const [openSearchPatientPopup, setOpenSearchPatientPopup] = useState(false);
  const [renderSearchPatientPopup, setRenderSearchPatientPopup] = useState(false);
  const [uhidSearchResetKey, setUhidSearchResetKey] = useState(0);
  const [showTable, setShowTable] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<OptionItem | null>(null);
  const [doctorError, setDoctorError] = useState("");
  const [visitTypeError, setVisitTypeError] = useState("");

  const sourceTypeList = usePickMaster("OPDAppointmentSourceType")?.pickMasterValue ?? [];

  useEffect(() => {
    if (sourceTypeList.length > 0) {
      const hasTelephonic = sourceTypeList.some(
        (item: PickMasterItem) => item.value === "Telephonic"
      );
      if (hasTelephonic) {
        setSource("Telephonic");
      }
    }
  }, [sourceTypeList]);

  // visit type
  const getVisitTypeList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SERVICE_ITEM_LIST,
      {},
      { params: { categoryTypeId: 1, isActive: 1 } },
      { component: "OpdAppointment" }
    );
    return resp?.data ?? [];
  };

  const { data: visitList } = useQuery({
    queryKey: ["getVisitTypeList"],
    queryFn: getVisitTypeList,
  });

  // insurance
  const getInsuranceList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_INSURANCE_COMPANY_MASTER_LIST,
      {},
      {},
      { component: "OpdAppointment" }
    );
    return resp?.data ?? [];
  };

  const { data: insuranceList } = useQuery({
    queryKey: ["getInsuranceList"],
    queryFn: getInsuranceList,
  });

  // search using contact number

  // Corporate
  const getCorporateList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CORPORATE_LIST_BY_BRANCH_ID_AND_INSURANCE_COMPANY_ID,
      {},
      { params: { branchId, insuranceCompanyId: Number(watch("InsuranceCompanyId") || 0) } },
      { component: "OpdAppointment" }
    );
    return resp?.data ?? [];
  };

  const { data: corporateList } = useQuery({
    queryKey: ["getCorporateList", watch("InsuranceCompanyId")],
    queryFn: getCorporateList,
  });

  // get patient address by contact
  const getPatientAddressByContact = async (contactNumber: string) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.SEARCH_PATIENT_MASTER,
      {},
      { params: { contactNumber, branchId } },
      { component: "OpdAppointment" }
    );
    const data = resp?.data ?? [];
    if (data.length > 0) {
      setPatientList(data);
      setShowPopup(true);
      setActivePatientIndex(0);
    } else {
      setPatientList([]);
      setShowPopup(false);
    }
  };

  // contcat search handler
  const contactChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.length === 10) {
      searchTimeoutRef.current = setTimeout(() => {
        void getPatientAddressByContact(value);
      }, 500);
    } else {
      setPatientList([]);
      setShowPopup(false);
    }
  };

  // country
  const getCountry = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_COUNTRY_MASTER,
      {},
      { params: { isActive: 1 } },
      { component: "OpdAppointment" }
    );
    const list = (resp?.data ?? []) as CountryItem[];
    setCountryList(list);
    return list;
  };

  // state
  const getState = async (countryId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_STATE_MASTER,
      {},
      { params: { countryId, isActive: 1 } },
      { component: "OpdAppointment" }
    );
    const list = (resp?.data ?? []) as StateItem[];
    setStateList(list);
    return list;
  };

  // district
  const getDistrict = async (stateId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DISTRICT_MASTER,
      {},
      { params: { stateId, isActive: 1 } },
      { component: "OpdAppointment" }
    );
    const list = (resp?.data ?? []) as DistrictItem[];
    setDistrictList(list);
    return list;
  };

  // city
  const getCity = async (districtId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CITY_MASTER,
      {},
      { params: { districtId, isActive: 1 } },
      { component: "OpdAppointment" }
    );
    const list = (resp?.data ?? []) as CityItem[];
    setCityList(list);
    return list;
  };

  const [countryList, setCountryList] = useState<CountryItem[]>([]);
  const [stateList, setStateList] = useState<StateItem[]>([]);
  const [districtList, setDistrictList] = useState<DistrictItem[]>([]);
  const [cityList, setCityList] = useState<CityItem[]>([]);

  const fetchLocationByPincode = async (pincodeValue: string) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_LOCATION_BY_PINCODE,
      {},
      { params: { pincode: pincodeValue, isActive: 1, isAcitve: 1 } },
      { component: "OpdAppointment" }
    );

    if (resp?.data) {
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

      setValue("CountryId", Number(countryId || 0));
      setValue("Country", countryName || "");
      setValue("StateId", Number(stateId || 0));
      setValue("State", stateName || "");
      setValue("DistrictId", Number(districtId || 0));
      setValue("District", districtName || "");
      setValue("CityId", Number(cityId || 0));
      setValue("City", cityName || "");

      if (countryId) void getState(Number(countryId));
      if (stateId) void getDistrict(Number(stateId));
      if (districtId) void getCity(Number(districtId));
    }
  };

  const searchLocationByPincode = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const pincodeValue = watch("Pincode") || "";
      if (pincodeValue.length === 6) {
        void fetchLocationByPincode(pincodeValue);
      }
    }
  };

  // country change handler
  const countryChangeHandler = (option: OptionItem | null) => {
    const val = option ? Number(option.value) : 0;
    const label = option ? option.label : "";
    setValue("CountryId", val);
    setValue("Country", label);
    setValue("StateId", 0);
    setValue("State", "");
    setValue("DistrictId", 0);
    setValue("District", "");
    setValue("CityId", 0);
    setValue("City", "");

    setStateList([]);
    setDistrictList([]);
    setCityList([]);
    if (val) void getState(val);
  };

  const stateChangeHandler = (option: OptionItem | null) => {
    const val = option ? Number(option.value) : 0;
    const label = option ? option.label : "";
    setValue("StateId", val);
    setValue("State", label);
    setValue("DistrictId", 0);
    setValue("District", "");
    setValue("CityId", 0);
    setValue("City", "");

    setDistrictList([]);
    setCityList([]);
    if (val) void getDistrict(val);
  };

  const districtChangeHandler = (option: OptionItem | null) => {
    const val = option ? Number(option.value) : 0;
    const label = option ? option.label : "";
    setValue("DistrictId", val);
    setValue("District", label);
    setValue("CityId", 0);
    setValue("City", "");

    setCityList([]);
    if (val) void getCity(val);
  };

  const cityChangeHandler = (option: OptionItem | null) => {
    const val = option ? Number(option.value) : 0;
    const label = option ? option.label : "";
    setValue("CityId", val);
    setValue("City", label);
  };

  const insuranceChangeHandler = (option: OptionItem | null) => {
    const val = option ? Number(option.value) : 0;
    setValue("InsuranceCompanyId", val);
    setValue("CorporateId", 0);
  };

  const corporateChangeHandler = (option: OptionItem | null) => {
    const val = option ? Number(option.value) : 0;
    setValue("CorporateId", val);
  };

  // select patient complete details
  const handleSelectPatient = async (patient: PatientListItem) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PATIENT_MASTER,
      {},
      { params: { patientId: patient?.PatientId, uhid: patient?.UHID } },
      { component: "OpdAppointment" }
    );
    const details = resp?.data?.[0] || {};

    const countryId = Number(details?.CountryId ?? details?.countryId ?? 0);
    const stateId = Number(details?.StateId ?? details?.stateId ?? 0);
    const districtId = Number(details?.DistrictId ?? details?.districtId ?? 0);
    const cityId = Number(details?.CityId ?? details?.cityId ?? 0);

    const mappedTitle = resolvePickValue(titleList, details?.Title ?? details?.title, {
      mr: ["mr", "Mr"],
      mrs: ["mrs", "Mrs"],
      miss: ["miss", "ms"],
      dr: ["dr", "doctor", "doc"],
      master: ["master"],
      mx: ["mx"],
      bo: ["bo", "babyof", "sonof", "daughterof", "wardof", "careof", "co"],
    });

    const mappedGender = resolvePickValue(genderList, details?.Gender ?? details?.gender, {
      male: ["male", "MALE"],
      female: ["female", "FEMALE"],
      other: ["other", "OTHER", "OTHERS", "others"],
    });

    reset({
      PatientId: Number(details?.PatientId ?? details?.patientId ?? 0),
      UhidOrBarcode: details?.UHID ?? details?.uhid ?? "",
      Title: mappedTitle,
      FirstName: details?.FirstName ?? details?.firstName ?? "",
      MiddleName: details?.MiddleName ?? details?.middleName ?? "",
      LastName: details?.LastName ?? details?.lastName ?? "",
      AgeYears: Number(details?.AgeYears ?? details?.ageYears ?? 0),
      AgeMonths: Number(details?.AgeMonths ?? details?.ageMonths ?? 0),
      AgeDays: Number(details?.AgeDays ?? details?.ageDays ?? 0),
      Dob: (details?.DOB ?? details?.dob) ? (details.DOB ?? details.dob).split("T")[0] : "",
      Gender: normalizePatientGenderForApi(mappedGender || (details?.Gender ?? details?.gender)),
      MaritalStatus: details?.MaritalStatus ?? details?.maritalStatus ?? "",
      SelfContactNumber: details?.ContactNumber ?? details?.contactNumber ?? "",
      Address:
        details?.Address ?? details?.address ?? details?.FullAddress ?? details?.fullAddress ?? "",
      Pincode: details?.Pincode ?? details?.pincode ?? "",
      CountryId: countryId,
      Country: details?.Country ?? details?.country ?? "",
      StateId: stateId,
      State: details?.State ?? details?.state ?? "",
      DistrictId: districtId,
      District: details?.District ?? details?.district ?? "",
      CityId: cityId,
      City: details?.City ?? details?.city ?? "",
      InsuranceCompanyId: Number(details?.InsuranceCompanyId ?? details?.insuranceCompanyId ?? 0),
      CorporateId: Number(details?.CorporateId ?? details?.corporateId ?? 0),
    });

    if (countryId) void getState(countryId);
    if (stateId) void getDistrict(stateId);
    if (districtId) void getCity(districtId);

    setShowPopup(false);
  };

  const getLabel = (item: PatientListItem) => {
    return `${item?.PatientName} (${item?.UHID})`;
  };

  const handleSelectPatientFromPopup = async (patient: any) => {
    const mappedPatient = {
      PatientId: patient.patientId ?? patient.PatientId,
      UHID: patient.uhid ?? patient.UHID,
      PatientName: patient.patientName ?? patient.PatientName ?? "",
      Title: patient.title ?? patient.Title ?? "",
      FirstName: patient.firstName ?? patient.FirstName ?? "",
      MiddleName: patient.middleName ?? patient.MiddleName ?? "",
      LastName: patient.lastName ?? patient.LastName ?? "",
      AgeYears: patient.ageYears ?? patient.AgeYears ?? 0,
      AgeMonths: patient.ageMonths ?? patient.AgeMonths ?? 0,
      AgeDays: patient.ageDays ?? patient.AgeDays ?? 0,
      DOB: patient.dob ?? patient.DOB ?? "",
      Gender: patient.gender ?? patient.Gender ?? "",
      ContactNumber: patient.contactNumber ?? patient.ContactNumber ?? "",
      FullAddress: patient.fullAddress ?? patient.FullAddress ?? "",
    } as PatientListItem;

    await handleSelectPatient(mappedPatient);
    return true;
  };

  const handleUhidPatientSelect = async (patientId: number) => {
    if (!patientId) {
      showWarning("Invalid patient selected.");
      return;
    }
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PATIENT_MASTER,
      {},
      { params: { patientId } },
      { component: "OpdAppointment" }
    );
    const details = resp?.data?.[0];
    if (details) {
      const mappedPatient = {
        PatientId: details.patientId ?? details.PatientId,
        UHID: details.uhid ?? details.UHID,
        PatientName: details.patientName ?? details.PatientName ?? "",
        Title: details.title ?? details.Title ?? "",
        FirstName: details.firstName ?? details.FirstName ?? "",
        MiddleName: details.middleName ?? details.MiddleName ?? "",
        LastName: details.lastName ?? details.LastName ?? "",
        AgeYears: details.ageYears ?? details.AgeYears ?? 0,
        AgeMonths: details.ageMonths ?? details.AgeMonths ?? 0,
        AgeDays: details.ageDays ?? details.AgeDays ?? 0,
        DOB: details.dob ?? details.DOB ?? "",
        Gender: details.gender ?? details.Gender ?? "",
        ContactNumber: details.contactNumber ?? details.ContactNumber ?? "",
        FullAddress: details.fullAddress ?? details.FullAddress ?? "",
        Pincode: details.pincode ?? details.Pincode ?? "",
      } as PatientListItem;

      await handleSelectPatient(mappedPatient);
    }
  };

  const handleOpenSearchPatientPopup = () => {
    setOpenSearchPatientPopup(true);
    setRenderSearchPatientPopup(true);
  };

  const closeSearchPatientHandler = () => {
    setOpenSearchPatientPopup(false);
    setTimeout(() => {
      setRenderSearchPatientPopup(false);
    }, 300);
  };

  // option selectors
  const countrySelectOption = useMemo(() => {
    return countryList.map(c => ({
      value: Number(c.countryId),
      label: c.countryName,
    }));
  }, [countryList]);

  const stateSelectOption = useMemo(() => {
    return stateList.map(s => ({
      value: Number(s.stateId),
      label: s.stateName,
    }));
  }, [stateList]);

  const districtSelectOption = useMemo(() => {
    return districtList.map(d => ({
      value: Number(d.districtId),
      label: d.districtName,
    }));
  }, [districtList]);

  const citySelectOption = useMemo(() => {
    return cityList.map(c => ({
      value: Number(c.cityId),
      label: c.cityName,
    }));
  }, [cityList]);

  const insuranceSelectOption = useMemo(() => {
    return (insuranceList ?? []).map((i: InsuranceListItem) => ({
      value: Number(i.insuranceCompanyId),
      label: i.insuranceCompanyName,
    }));
  }, [insuranceList]);

  const corporateSelectOption = useMemo(() => {
    return (corporateList ?? []).map((c: any) => ({
      value: Number(c.corporateId ?? c.CorporateId),
      label: c.corporateName ?? c.CorporateName,
    }));
  }, [corporateList]);

  const watchedCountryId = watch("CountryId");
  const watchedStateId = watch("StateId");
  const watchedDistrictId = watch("DistrictId");
  const watchedCityId = watch("CityId");
  const watchedInsuranceCompanyId = watch("InsuranceCompanyId");

  const watchedCorporateId = watch("CorporateId");

  const selectedCountry = useMemo(() => {
    return countrySelectOption.find(c => Number(c.value) === Number(watchedCountryId)) || null;
  }, [countrySelectOption, watchedCountryId]);

  const selectedState = useMemo(() => {
    return stateSelectOption.find(s => Number(s.value) === Number(watchedStateId)) || null;
  }, [stateSelectOption, watchedStateId]);

  const selectedDistrict = useMemo(() => {
    return districtSelectOption.find(d => Number(d.value) === Number(watchedDistrictId)) || null;
  }, [districtSelectOption, watchedDistrictId]);

  const selectedCity = useMemo(() => {
    return citySelectOption.find(c => Number(c.value) === Number(watchedCityId)) || null;
  }, [citySelectOption, watchedCityId]);

  const selectedInsurance = useMemo(() => {
    return (
      insuranceSelectOption.find(i => Number(i.value) === Number(watchedInsuranceCompanyId)) || null
    );
  }, [insuranceSelectOption, watchedInsuranceCompanyId]);

  const selectedCorporate = useMemo(() => {
    return corporateSelectOption.find(c => Number(c.value) === Number(watchedCorporateId)) || null;
  }, [corporateSelectOption, watchedCorporateId]);

  useEffect(() => {
    const loadDefaults = async () => {
      const countries = await getCountry();
      if (branchDetails?.defaultCountryId) {
        const countryId = Number(branchDetails.defaultCountryId);
        const stateId = Number(branchDetails.defaultStateId);
        const districtId = Number(branchDetails.defaultDistrictId);
        const cityId = Number(branchDetails.defaultCityId);
        const insuranceId = Number(branchDetails.defaultInsuranceCompanyId);
        const corporateId = Number(branchDetails.defaultCorporateId);

        const stateListResult = await getState(countryId);
        const districtListResult = await getDistrict(stateId);
        const cityListResult = await getCity(districtId);

        const countryName =
          countries.find(c => Number(c.countryId) === countryId)?.countryName || "";
        const stateName = stateListResult.find(s => Number(s.stateId) === stateId)?.stateName || "";
        const districtName =
          districtListResult.find(d => Number(d.districtId) === districtId)?.districtName || "";
        const cityName = cityListResult.find(c => Number(c.cityId) === cityId)?.cityName || "";

        setValue("CountryId", countryId);
        setValue("Country", countryName);
        setValue("StateId", stateId);
        setValue("State", stateName);
        setValue("DistrictId", districtId);
        setValue("District", districtName);
        setValue("CityId", cityId);
        setValue("City", cityName);
        setValue("InsuranceCompanyId", insuranceId);
        setValue("CorporateId", corporateId);
      }
    };
    if (branchDetails) {
      void loadDefaults();
    } else {
      void getCountry();
    }
  }, [branchDetails]);

  // doctor lists
  const getDoctorList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_MASTER,
      {},
      { params: { isActive: 1 } },
      { component: "OpdAppointment" }
    );
    return resp?.data ?? [];
  };

  const { data: doctorLists } = useQuery({
    queryKey: ["getDoctorList"],
    queryFn: getDoctorList,
  });

  const resetForm = () => {
    reset(defaultPatientRegistrationValues);
    setSource("");
    setSlots("");
    setVisitType("");
    setSelectedDoctor(null);
    setStateList([]);
    setDistrictList([]);
    setCityList([]);
    setShowPaymentDetailsSection(false);
    setUhidSearchResetKey(prev => prev + 1);
  };

  const doctorSelectOption = useMemo(() => {
    if (!doctorLists) return [];
    return doctorLists.map((d: any) => ({
      value: d?.doctorId,
      label: d?.completeName || d?.name || "",
    }));
  }, [doctorLists]);

  const doctorChangeHandler = (val: OptionItem | null) => {
    setSelectedDoctor(val);
  };

  const selectedVisit = useMemo(() => {
    return (
      visitList?.find((item: VisitListItem) => Number(item.serviceItemId) === Number(visitType)) ||
      null
    );
  }, [visitList, visitType]);

  // get price list
  const getPriceList = async () => {
    if (!visitType) return null;
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SERVICE_ALL_DETAILS_FOR_OPD_BILLING,
      {},
      {
        params: {
          doctorId: selectedDoctor ? Number(selectedDoctor.value) : 0,
          branchId,
          corporateId: Number(watchedCorporateId || 0),
          serviceItemId: selectedVisit ? Number(selectedVisit.serviceItemId) : 0,
          categoryId: selectedVisit ? Number(selectedVisit.categoryId) : 0,
          subCategoryId: selectedVisit ? Number(selectedVisit.subCategoryId) : 0,
          subSubCategoryId: selectedVisit ? Number(selectedVisit.subSubCategoryId) : 0,
          bedTypeId: 0,
        },
      },
      { component: "OpdAppointment" }
    );
    return resp?.data || null;
  };

  const { data: priceList } = useQuery({
    queryKey: [
      "getPriceList",
      selectedDoctor?.value,
      branchId,
      watchedCorporateId,
      selectedVisit?.serviceItemId,
      selectedVisit?.categoryId,
      selectedVisit?.subCategoryId,
      selectedVisit?.subSubCategoryId,
    ],
    queryFn: getPriceList,
    enabled: Boolean(visitType),
  });

  const watchedPatientId = watch("PatientId");

  useEffect(() => {
    setVisitDetailsPaylaod(prev => ({
      ...prev,
      patientId: Number(watchedPatientId || 0),
      branchId: Number(branchId || 1),
      doctorId: selectedDoctor ? Number(selectedDoctor.value) : 0,
      appDateTime: "2026-08-10T05:49:05.078Z",
      roleId: Number(roleId || 0),
      insuranceCompanyId: Number(watchedInsuranceCompanyId || 0),
      corporateId: Number(watchedCorporateId || 0),
      serviceItemId: selectedVisit ? Number(selectedVisit.serviceItemId) : 0,
      serviceName: selectedVisit ? String(selectedVisit.name) : "",
      amount: priceList?.rate !== undefined ? Number(priceList.rate) : 0,
      slotId: slots ? Number(slots) : 0,
      sourceType: source || "",
    }));
  }, [
    watchedPatientId,
    branchId,
    selectedDoctor,
    roleId,
    watchedInsuranceCompanyId,
    watchedCorporateId,
    selectedVisit,
    priceList,
    slots,
    source,
  ]);

  const billingPaymentDetails = useMemo(() => {
    return {
      grossBillAmount: Number(priceList?.rate || 0),
      netAmount: Number(priceList?.rate || 0),
    };
  }, [priceList]);

  useEffect(() => {
    const rate = Number(priceList?.rate || 0);
    setBillingValues(prev => ({
      ...prev,
      grossBillAmount: rate,
      netAmount: rate,
      balanceAmount: rate,
    }));
  }, [priceList]);

  // create paylaod
  const createPayload = (patientPayload: any) => {
    return {
      PatientId: Number(patientPayload.PatientId || 0),
      BranchId: Number(branchId || 1),

      Title: patientPayload.Title || "",
      FirstName: patientPayload.FirstName || "",
      MiddleName: patientPayload.MiddleName || "",
      LastName: patientPayload.LastName || "",

      AgeYears: Number(patientPayload.AgeYears || 0),
      AgeMonths: Number(patientPayload.AgeMonths || 0),
      AgeDays: Number(patientPayload.AgeDays || 0),

      Dob: patientPayload.Dob || "",
      Gender: patientPayload.Gender || "",

      MaritalStatus: patientPayload.MaritalStatus || "",
      Relation: patientPayload.Relation || "",
      RelativeName: patientPayload.RelativeName || "",

      IdProofName: patientPayload.IdProofName || "",
      IdProofNumber: patientPayload.IdProofNumber || "",

      SelfContactNumber: patientPayload.SelfContactNumber || "",
      EmergencyContactNumber: patientPayload.EmergencyContactNumber || "",

      Email: patientPayload.Email || "",
      PrivilegedCardNumber: patientPayload.PrivilegedCardNumber || "",

      Address: patientPayload.Address || "",

      CountryId: Number(patientPayload.CountryId || 0),
      Country: patientPayload.Country || "",

      StateId: Number(patientPayload.StateId || 0),
      State: patientPayload.State || "",

      DistrictId: Number(patientPayload.DistrictId || 0),
      District: patientPayload.District || "",

      CityId: Number(patientPayload.CityId || 0),
      City: patientPayload.City || "",

      InsuranceCompanyId: Number(patientPayload.InsuranceCompanyId || 0),
      CorporateId: Number(patientPayload.CorporateId || 0),

      CardNo: patientPayload.CardNo || "",

      PatientImageFile: patientPayload.PatientImageFile || null,

      IsVaccination: Number(patientPayload.IsVaccination || 0),

      VipPatient: patientPayload.VipPatient || "",

      PolicyNo: patientPayload.PolicyNo || "",
      PolicyCardNo: patientPayload.PolicyCardNo || "",
      ExpiryDate: patientPayload.ExpiryDate || "",
      CardHolder: patientPayload.CardHolder || "",
      ReferalDate: patientPayload.ReferalDate || "",
      ReferalNo: patientPayload.ReferalNo || "",
      OnlinePtId: Number(patientPayload.OnlinePtId || 0),
      HealthId: patientPayload.HealthId || "",
      HealthIdNumber: patientPayload.HealthIdNumber || "",
      LandlineNo: patientPayload.LandlineNo || "",
      BirthPlace: patientPayload.BirthPlace || "",
      Religion: patientPayload.Religion || "",
      RelationPhone: patientPayload.RelationPhone || "",
      RelationAge: patientPayload.RelationAge || "",
      RelationGender: patientPayload.RelationGender || "",
      EMG_FirstName: patientPayload.EMG_FirstName || "",
      EMG_LastName: patientPayload.EMG_LastName || "",
      EMG_Relation: patientPayload.EMG_Relation || "",
      EMG_MobileNo: patientPayload.EMG_MobileNo || "",
      EMG_ResidentNo: patientPayload.EMG_ResidentNo || "",
      EMG_Address: patientPayload.EMG_Address || "",
      IsInternational: Number(patientPayload.IsInternational || 0),
      Locality: patientPayload.Locality || "",
      PassportNumber: patientPayload.PassportNumber || "",
      InternationalNo: patientPayload.InternationalNo || "",
      MembershipNo: patientPayload.MembershipNo || "",
      PatientType: patientPayload.PatientType || "",
      IdentityMark: patientPayload.IdentityMark || "",
      IdentityMark2: patientPayload.IdentityMark2 || "",
      ReferenceType: patientPayload.ReferenceType || "",
      Remarks: patientPayload.Remarks || "",
      ipdNumber: patientPayload.ipdNumber || "",
      Pincode: patientPayload.Pincode || "",
      UniqueId: patientPayload.UniqueId || "",
      UhidOrBarcode: patientPayload.UhidOrBarcode || "",
    };
  };

  // create appointment paylaod
  const createAppointmentPaylaod = (newPatientId: number) => {
    return {
      visitDetails: {
        ...visitDetailsPayload,
        patientId: newPatientId,
      },
      paymentDetails: [],
    };
  };

  const saveButtonHandler = async (type: string) => {
    let hasError = false;
    if (!selectedDoctor) {
      setDoctorError("Doctor is required.");
      hasError = true;
    } else {
      setDoctorError("");
    }

    if (!visitType) {
      setVisitTypeError("Visit Type is required.");
      hasError = true;
    } else {
      setVisitTypeError("");
    }

    switch (type) {
      case "withoutPayment": {
        void handleSubmit(
          async (patientPayload: any) => {
            if (hasError) {
              showWarning("Please fill in all required fields.");
              return;
            }
            try {
              const payload = createPayload(patientPayload);

              const formData = new FormData();
              Object.entries(payload).forEach(([key, value]) => {
                formData.append(key, value === null || value === undefined ? "" : String(value));
              });

              const regResp = await fetchApi(
                "POST",
                ENDPOINTS.CREATE_UPDATE_PATIENT_MASTER,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } },
                { component: "OpdAppointment" }
              );

              if (!regResp?.result) {
                showWarning(regResp?.message ?? "Failed to save patient registration.");
                return;
              }

              const newPatientId = Number(regResp?.data?.patientId || patientPayload.PatientId);

              const appointmentPayload = createAppointmentPaylaod(newPatientId);

              const saveResp = await fetchApi(
                "POST",
                ENDPOINTS.SAVE_OPD_APPOINTMENT,
                appointmentPayload,
                {},
                { component: "OpdAppointment" }
              );

              if (!saveResp?.result) {
                showWarning(saveResp?.message ?? "Failed to save appointment.");
                return;
              }
              showSuccess(saveResp?.message ?? "Data saved successfully");
              resetForm();
            } catch (err) {
              console.error(err);
              showError("An error occurred while saving the appointment.");
            }
          },
          validationErrors => {
            console.log("validationErrors", validationErrors);
            showWarning("Please fill in all required fields.");
          }
        )();
        break;
      }
      case "collectPrePayment": {
        if (hasError) {
          showWarning("Please fill in all required fields.");
          return;
        }

        if (!showPaymentDetailsSection) {
          setShowPaymentDetailsSection(true);
          break;
        }

        // Submitting with payment details
        const isBillingFormValid = (await billingDetailsRef.current?.validateForm?.()) ?? true;
        if (!isBillingFormValid) {
          showWarning("Please fill in payment details correctly.");
          return;
        }

        void handleSubmit(
          async (patientPayload: any) => {
            try {
              const payload = createPayload(patientPayload);

              const formData = new FormData();
              Object.entries(payload).forEach(([key, value]) => {
                formData.append(key, value === null || value === undefined ? "" : String(value));
              });

              const regResp = await fetchApi(
                "POST",
                ENDPOINTS.CREATE_UPDATE_PATIENT_MASTER,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } },
                { component: "OpdAppointment" }
              );

              if (!regResp?.result) {
                showWarning(regResp?.message ?? "Failed to save patient registration.");
                return;
              }

              const newPatientId = Number(regResp?.data?.patientId || patientPayload.PatientId);

              const billingPayload = billingDetailsRef.current?.getPayload?.();
              const paymentDetails = ((billingPayload?.payments as any[]) || []).map(payment => ({
                ...payment,
                isPatientAdvanceAmount: 1,
              }));

              const appointmentPayload = {
                visitDetails: {
                  ...visitDetailsPayload,
                  patientId: newPatientId,
                },
                paymentDetails,
              };

              const saveResp = await fetchApi(
                "POST",
                ENDPOINTS.SAVE_OPD_APPOINTMENT,
                appointmentPayload,
                {},
                { component: "OpdAppointment" }
              );
              console.log("resp", saveResp);

              if (!saveResp?.result) {
                showWarning(saveResp?.message ?? "Failed to save appointment.");
                return;
              }
              showSuccess(saveResp?.message ?? "Data saved successfully");
              resetForm();
            } catch (err) {
              console.error(err);
              showError("An error occurred while saving the appointment.");
            }
          },
          validationErrors => {
            console.log("validationErrors", validationErrors);
            showWarning("Please fill in all required fields.");
          }
        )();
        break;
      }
      default: {
        console.log("invalid type");
        break;
      }
    }
  };

  return (
    <div className="page-container">
      <div>
        <div className="flex items-center justify-between w-full flex-col lg:flex-row gap-3">
          <div className="flex-1">
            <h1 className="page-heading">OPD Appointment</h1>

            <nav className="helper-text">
              <NavLink to="/dashboard" className="hover:underline">
                Home
              </NavLink>
              <span>››</span>
              <span>Opd Appointment</span>
            </nav>
          </div>

          <div className="flex justify-center flex-1">
            <UhidGlobalSearch
              onPatientSelect={handleUhidPatientSelect}
              resetKey={uhidSearchResetKey}
              className="mt-1"
            />
          </div>

          <div className="flex justify-end flex-1">
            <button type="button" className="save-btn" onClick={handleOpenSearchPatientPopup}>
              Search Old Patient
            </button>
          </div>
        </div>
        <div className="card flex flex-col">
          {/* <h2 className="card-title">Patient Details</h2> */}

          <div className="form-grid-4">
            {/* Title + First Name */}
            <div className="flex gap-2">
              <div className="w-1/3">
                <InputField label="Title" required>
                  <select className="input-field" {...register("Title")}>
                    <option value="">Select</option>
                    {titleList.map((t: PickMasterItem) => (
                      <option value={t?.value} key={t?.value}>
                        {t?.value}
                      </option>
                    ))}
                  </select>
                  {errors.Title?.message && (
                    <p className="input-field-error">{errors.Title?.message}</p>
                  )}
                </InputField>
              </div>

              <div className="w-2/3">
                <InputField label="First Name" required>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter First Name"
                    maxLength={120}
                    {...register("FirstName")}
                  />

                  {errors.FirstName?.message && (
                    <p className="input-field-error">{errors.FirstName?.message}</p>
                  )}
                </InputField>
              </div>
            </div>

            {/* Middle Name */}
            <InputField label="Middle Name">
              <input
                type="text"
                className="input-field"
                placeholder="Enter Middle Name"
                maxLength={120}
                {...register("MiddleName")}
              />
            </InputField>

            {/* Last Name */}
            <InputField label="Last Name">
              <input
                type="text"
                className="input-field"
                placeholder="Enter Last Name"
                maxLength={120}
                {...register("LastName")}
              />
            </InputField>

            {/* Age */}
            <div className="flex gap-2">
              <InputField label="Age (Yrs)" required>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Years"
                  maxLength={3}
                  {...register("AgeYears")}
                />
                {errors.AgeYears?.message && (
                  <p className="input-field-error">{errors.AgeYears?.message}</p>
                )}
              </InputField>

              <InputField label="Months">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Months"
                  maxLength={2}
                  {...register("AgeMonths")}
                />
                {errors.AgeMonths?.message && (
                  <p className="input-field-error">{errors.AgeMonths?.message}</p>
                )}
              </InputField>

              <InputField label="Days">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Days"
                  maxLength={2}
                  {...register("AgeDays")}
                />
                {errors.AgeDays?.message && (
                  <p className="input-field-error">{errors.AgeDays?.message}</p>
                )}
              </InputField>
            </div>

            {/* DOB */}
            <InputField label="DOB" required>
              <CustomDateInput
                name="Dob"
                value={watch("Dob") || ""}
                onChange={(val: string) => {
                  setValue("Dob", val);
                }}
              />
              {errors.Dob?.message && <p className="input-field-error">{errors.Dob?.message}</p>}
            </InputField>

            {/* Gender */}
            <InputField label="Gender" required>
              <select
                className={lockedGenderByTitle ? "disabled-input-field" : "input-field"}
                disabled={Boolean(lockedGenderByTitle)}
                {...register("Gender")}
              >
                <option value="">--Select--</option>
                {genderList.map((g: PickMasterItem) => (
                  <option value={g.value} key={g.key}>
                    {g.value}
                  </option>
                ))}
              </select>
              {errors.Gender?.message && (
                <p className="input-field-error">{errors.Gender?.message}</p>
              )}
            </InputField>

            {/* Contacts*/}
            <InputField label="Contact" required>
              <div className="relative w-full">
                <input
                  type="text"
                  className="input-field"
                  onInput={allowOnlyNumbers}
                  minLength={10}
                  maxLength={10}
                  placeholder="Enter Contact number"
                  {...register("SelfContactNumber", {
                    onChange: contactChangeHandler,
                  })}
                />

                <InputFieldModal<PatientListItem>
                  showPopup={showPopup}
                  data={patientList}
                  activeIndex={activePatientIndex}
                  setActiveIndex={setActivePatientIndex}
                  onSelect={handleSelectPatient}
                  getLabel={getLabel}
                />
              </div>
              {errors.SelfContactNumber?.message && (
                <p className="input-field-error">{errors.SelfContactNumber?.message}</p>
              )}
            </InputField>

            <InputField label="Address">
              <input
                type="text"
                className="input-field"
                placeholder="Enter address"
                {...register("Address")}
              />
            </InputField>

            <InputField label="Pin Code">
              <input
                type="text"
                className="input-field"
                onKeyDown={searchLocationByPincode}
                onInput={allowOnlyNumbers}
                maxLength={6}
                placeholder="Enter pincode and press Enter"
                {...register("Pincode")}
              />
            </InputField>

            {/* Country*/}
            <InputField label="Country" required>
              <Select<OptionItem, false>
                value={selectedCountry}
                options={countrySelectOption}
                placeholder="Select country"
                isSearchable
                isClearable
                onChange={countryChangeHandler}
                styles={SelectStyles as StylesConfig<OptionItem, false>}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
              {errors.CountryId?.message && (
                <p className="input-field-error">{errors.CountryId?.message}</p>
              )}
            </InputField>
            {/* State*/}
            <InputField label="State" required>
              <Select<OptionItem, false>
                value={selectedState}
                options={stateSelectOption}
                placeholder="Select state"
                isSearchable
                isClearable
                isDisabled={!selectedCountry}
                onChange={stateChangeHandler}
                styles={SelectStyles as StylesConfig<OptionItem, false>}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
              {errors.StateId?.message && (
                <p className="input-field-error">{errors.StateId?.message}</p>
              )}
            </InputField>
            {/* District*/}
            <InputField label="District" required>
              <Select<OptionItem, false>
                value={selectedDistrict}
                options={districtSelectOption}
                placeholder="Select district"
                isSearchable
                isClearable
                isDisabled={!selectedState}
                onChange={districtChangeHandler}
                styles={SelectStyles as StylesConfig<OptionItem, false>}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
              {errors.DistrictId?.message && (
                <p className="input-field-error">{errors.DistrictId?.message}</p>
              )}
            </InputField>
            {/* City*/}
            <InputField label="City" required>
              <Select<OptionItem, false>
                value={selectedCity}
                options={citySelectOption}
                placeholder="Select city"
                isSearchable
                isClearable
                isDisabled={!selectedDistrict}
                onChange={cityChangeHandler}
                styles={SelectStyles as StylesConfig<OptionItem, false>}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
              {errors.CityId?.message && (
                <p className="input-field-error">{errors.CityId?.message}</p>
              )}
            </InputField>
          </div>
        </div>
      </div>
      <div className="card mt-1 ">
        <div className="form-grid-4">
          <InputField label="Doctor" required>
            <Select<OptionItem, false>
              value={selectedDoctor}
              options={doctorSelectOption}
              placeholder="Select doctor"
              isSearchable
              isClearable
              onChange={val => {
                doctorChangeHandler(val);
                if (val) setDoctorError("");
              }}
              styles={SelectStyles as StylesConfig<OptionItem, false>}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
            {doctorError && <p className="input-field-error">{doctorError}</p>}
          </InputField>
          <InputField label="Slots">
            <input
              type="text"
              className="input-field"
              value={slots}
              onChange={e => setSlots(e.target.value)}
              placeholder="Enter slots"
            />
          </InputField>
          <InputField label="Source Type">
            <select
              className="input-field"
              value={source}
              onChange={e => setSource(e.target.value)}
            >
              <option value="">--Select--</option>
              {sourceTypeList?.map((item: PickMasterItem) => (
                <option key={item.key} value={item.value}>
                  {item.value}
                </option>
              ))}
            </select>
          </InputField>

          {/* Insurance Company*/}
          <InputField label="Insurance Company">
            <Select<OptionItem, false>
              value={selectedInsurance}
              options={insuranceSelectOption}
              placeholder="Select insurance"
              isSearchable
              isClearable
              onChange={insuranceChangeHandler}
              styles={SelectStyles as StylesConfig<OptionItem, false>}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </InputField>
          {/* Corporate*/}
          <InputField label="Corporate">
            <Select<OptionItem, false>
              value={selectedCorporate}
              options={corporateSelectOption}
              placeholder="Select corporate"
              isSearchable
              isClearable
              onChange={corporateChangeHandler}
              styles={SelectStyles as StylesConfig<OptionItem, false>}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </InputField>
          {/* Visit type*/}
          <InputField label="Visit Type" required>
            <select
              className="input-field"
              value={visitType}
              onChange={e => {
                setVisitType(e.target.value);
                if (e.target.value) setVisitTypeError("");
              }}
            >
              <option value="">--Select--</option>
              {visitList?.map((item: VisitListItem) => (
                <option key={item.serviceItemId} value={item?.serviceItemId}>
                  {item?.name}
                </option>
              ))}
            </select>
            {visitTypeError && <p className="input-field-error">{visitTypeError}</p>}
          </InputField>
          {/* Amount */}
          <InputField label="Amount">
            <input
              type="text"
              className="input-field"
              value={priceList?.rate !== undefined ? String(priceList.rate) : "0"}
              disabled
              placeholder="0"
            />
          </InputField>
        </div>

        <div className="form-actions-responsive mt-5">
          <SubmitButton
            label={"Save Without Payment"}
            className="save-btn-color"
            type="button"
            onClick={() => saveButtonHandler("withoutPayment")}
          />

          <SubmitButton
            label={"Collect Pre Payment"}
            className="save-btn-color"
            type="button"
            onClick={() => saveButtonHandler("collectPrePayment")}
          />
        </div>
      </div>

      {showPaymentDetailsSection && (
        <>
          <div className="card mt-1">
            <BillingDetails
              ref={billingDetailsRef}
              showPaymentMode={true}
              paymentBilling={billingPaymentDetails}
              billingValues={billingValues}
              setBillingValues={setBillingValues}
              relaxPaymentAmountLimit={false}
            />
          </div>
          <div className="form-actions-responsive mt-5">
            <SubmitButton
              label={"Save"}
              className="save-btn-color"
              type="button"
              onClick={() => saveButtonHandler("collectPrePayment")}
            />
          </div>
        </>
      )}
      {loading && <CustomLoader isLoading={loading} />}

      {renderSearchPatientPopup && (
        <SearchPatientPopup
          isOpen={openSearchPatientPopup}
          onClose={closeSearchPatientHandler}
          showTable={showTable}
          setShowTable={setShowTable}
          onSelectPatient={handleSelectPatientFromPopup}
        />
      )}
    </div>
  );
};

export default OpdAppointment;
