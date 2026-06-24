import { getDoctorMaster, getPatientDataByPatientId } from "@/api/globalApiCall";
import { BillingDetailsHandle } from "@/components/BillingDetails";
import { BillingFormValues } from "@/components/BillingDetails/types";
import CustomLoader from "@/components/customLoader";
import OpdCard from "@/components/reportTemplates/OpdCard";
import OpdDetailsBills from "@/components/reportTemplates/OpdDetailsBill";
import IpdOpdDocument from "@/components/SingledrawerAndPopup/components/IpdOpdDocument";
import UhidGlobalSearch from "@/components/SingledrawerAndPopup/components/UhidGlobalSearch";
import { IpdOpdDocumentHandle } from "@/components/SingledrawerAndPopup/types";
import { resolveVisitIdFromResponse } from "@/components/SingledrawerAndPopup/uploadVisitWiseDocuments";
import { ENDPOINTS } from "@/config/defaults";
import { IpdOpdTypeName, OPDBillingTabName, OPD_CATEGORY_IDs, Status } from "@/constants/constants";
import { AuthContext } from "@/context/AuthContext";
import { BillingAmountContext } from "@/context/BillingAmountContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess, showWarning } from "@/utils/alert";
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
import { NavLink, useParams } from "react-router-dom";
import { SingleValue } from "react-select";
import { InsuranceItem } from "../branchMaster/types";
import { buildIpdPatientSummary } from "../ipdAdmission/helpers";
import PatientData from "../patientRegistration/components/PatientData";
import SearchPatientPopup from "../patientRegistration/components/SearchPatientPopup";
import {
  CorporateItem,
  PatientDataHandle,
  SearchedPatientItem,
} from "../patientRegistration/types";
import Buttons from "./components/Buttons";
import CollectOnDevice from "./components/CollectOnDevice";
import DuesAmountPopup from "./components/DuesAmountPopup";
import DuplicateServicePopup from "./components/DuplicateServicePopup";
import {
  applyDiscountAmountChange,
  applyDiscountPercentageChange,
  applyRateChange,
  recalculateFromDiscountPercentage,
} from "./components/helperFunction";
import IpdOpdPharmacyDueAmount from "./components/IpdOpdPharmacyDueAmount";
import OpdBillingSection from "./components/OpdBillingSection";
import { openOpdPrintInNewTab, openReceiptInNewTab } from "./components/OpdReceiptNewTab";
import PackagePopup from "./components/PackagePopup";
import ReferDoctorPopup from "./components/ReferDoctorPopup";
import {
  CategoryItem,
  DoctorMasterItem,
  DuplicateServiceDataItem,
  OpdBillingFormData,
  OpdBillingItemPayload,
  OpdBillingSavePayload,
  OpdBillingVisitDetailsPayload,
  OpdCardDetailItem,
  OptionItem,
  PackageItems,
  PackagePayloadItem,
  PatientReceiptItem,
  PaymentModeItem,
  ReferDoctorItem,
  ServiceBindingItem,
  ServiceItemList,
  SubCategoryItem,
  SubSubCategoryItem,
} from "./types";

const parseDepartmentIds = (value?: string) =>
  (value ?? "")
    .split(",")
    .map(v => Number(v.trim()))
    .filter(v => Number.isFinite(v) && v > 0);

const getPerformingDoctorsCacheKey = (doctorDepartmentIds?: string) =>
  [...parseDepartmentIds(doctorDepartmentIds)].sort((a, b) => a - b).join(",");

const buildCurrentAgeFromDetails = (details?: Record<string, unknown> | null): string => {
  if (!details) return "";

  const age = String(details.age ?? details.Age ?? "").trim();
  if (age) return age;

  const years = Number(details.ageYears ?? details.AgeYears ?? 0);
  const months = Number(details.ageMonths ?? details.AgeMonths ?? 0);
  const days = Number(details.ageDays ?? details.AgeDays ?? 0);

  if (years || months || days) {
    return `${years}Y ${months}M ${days}D`;
  }

  return "";
};

const resolvePatientUhid = (
  patientRecord?: Record<string, unknown> | null,
  patientRegistrationDetails?: Record<string, unknown>,
  fallbackUhid = ""
): string =>
  String(
    patientRecord?.uhid ??
      patientRegistrationDetails?.UhidOrBarcode ??
      patientRegistrationDetails?.uhid ??
      fallbackUhid ??
      ""
  ).trim();

const resolveRateListIdFromApiData = (
  data?: ServiceBindingItem | Record<string, unknown> | null
): number =>
  Number(
    (data as ServiceBindingItem)?.rateListId ?? (data as Record<string, unknown>)?.RateListId ?? 0
  ) || 0;

const OpdBilling = () => {
  const { loading, fetchApi } = useGlobalApi();
  const branchId = useContext(AuthContext)?.user?.branchId ?? 1;
  const userId = useContext(AuthContext)?.user?.userId ?? 0;
  const { totalBillingAmount, setTotalBillingAmount } = useContext(BillingAmountContext);
  const billingDetailsRef = useRef<BillingDetailsHandle>(null);
  const patientDataRef = useRef<PatientDataHandle>(null);
  const ipdOpdDocumentRef = useRef<IpdOpdDocumentHandle>(null);
  const patientID = useParams();
  const pId = Number(patientID?.patientId);
  const defaultCorporate: OptionItem = { label: "CASH", value: 1 };

  const [openSearchPatientPopup, setOpenSearchPatientPopup] = useState<boolean>(false);
  const [renderSearchPatientPopup, setRenderSearchPatientPopup] = useState<boolean>(false);

  const [insuranceList, setInsuranceList] = useState<InsuranceItem[]>([]);
  const [selectedInsurance, setSelectedInsurance] = useState<number | null>(0);

  const [corporateList, setCorporateList] = useState<CorporateItem[]>([]);
  const [selectedCorporate, setSelectedCorporate] = useState<OptionItem | null>(defaultCorporate);
  const [selectedCorporateError, setSelectedCorporateError] = useState<string>("");
  const [corporateOpdRateListIds, setCorporateOpdRateListIds] = useState<number[]>([]);

  const [activePatientId, setActivePatientId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>(OPDBillingTabName.PATIENT_DETAILS);
  const [patientTabError, setPatientTabError] = useState<boolean>(false);
  const [documentTabError, setDocumentTabError] = useState<boolean>(false);
  const [searchPatientError, setSearchPatientError] = useState<string>("");

  const [referDoctorList, setReferDoctorList] = useState<ReferDoctorItem[]>([]);
  const [selectedReferDoctor, setSelectedReferDoctor] = useState<OptionItem | null>(null);

  const [serviceNameList, SetServiceItemList] = useState<ServiceItemList[]>([]);

  const [doctorList, setDoctorList] = useState<DoctorMasterItem[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<OptionItem | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [selectDoctorError, setSelectDoctorError] = useState<string>("");

  const [serviceDataTableItem, SetServiceDataTableItem] = useState<ServiceBindingItem[]>([]);

  const [showTable, setShowTable] = useState<boolean>(false);

  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [activeServiceIndex, setActiveServiceIndex] = useState<number>(0);

  const [showDuplicateError, setShowDuplicateError] = useState<string>("");
  const [serviceValidationError, setServiceValidationError] = useState<string>("");
  const [performingDoctorsCache, setPerformingDoctorsCache] = useState<
    Record<string, DoctorMasterItem[]>
  >({});
  const performingDoctorsLoadingRef = useRef<Set<string>>(new Set());

  const [categoryList, setCategoryList] = useState<CategoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("1, 3, 4, 5, 8, 11");
  const [subCategoryList, setSubCategoryList] = useState<SubCategoryItem[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState<OptionItem | null>(null);

  const [subSubCategoryList, setSubSubCategoryList] = useState<SubSubCategoryItem[]>([]);
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState<OptionItem | null>(null);

  const [openReferDoctorPopup, setOpenReferDoctorPopup] = useState<boolean>(false);
  const [renderReferDoctorPopup, setRenderReferDoctorPopup] = useState<boolean>(false);

  const [renderCollectOnDevice, setRenderCollectOnDevice] = useState<boolean>(false);
  const [openCollectOnDevice, setOpenCollectOnDevice] = useState<boolean>(false);

  const [renderPackagePopup, setRenderPackagePopup] = useState<boolean>(false);
  const [openPackagePopup, setOpenPackagePopup] = useState<boolean>(false);
  const [selectedPackage, setSelectedPackage] = useState<number>(0);

  const [selectedServiceId, setSelectedServiceId] = useState<number>(0);

  const [collectOnDeviceAmount, setCollectOnDeviceAmount] = useState<number>(0);
  const [patientRegistrationDetails, setPatientRegistrationDetails] = useState<
    Record<string, unknown>
  >({});

  const [paymentDetails, setPaymentDetails] = useState<any[]>([]);
  const [formResetKey, setFormResetKey] = useState<number>(0);

  const [billingPaymentDetails, setBillingPaymentDetails] = useState({});

  const [patientReceiptDetails, setPatientReceiptDetails] = useState<PatientReceiptItem[]>([]);

  const [paymentModeList, setPaymentModeList] = useState<PaymentModeItem[]>([]);

  const [opdCardDetails, setOpdCardDetails] = useState<OpdCardDetailItem | null>(null);
  const [pendingCombinedPrint, setPendingCombinedPrint] = useState<boolean>(false);
  const [pendingDoctorAppointmentPrint, setPendingDoctorAppointmentPrint] =
    useState<boolean>(false);

  const [totalPaidAmount, setTotalPaidAmount] = useState<number>(0);

  const [isPackageUrgent, setIsPackageUrgent] = useState<number>(0);

  const [packagePayload, setPackagePayload] = useState<PackagePayloadItem[]>([]);

  const doctorRef = useRef<any>(null);

  const serviceInputRef = useRef<HTMLInputElement | null>(null);

  const [openDuplicateServicePopup, setOpenDuplicateServicePopup] = useState<boolean>(false);
  const [renderDuplicateServicePopup, setRenderDuplicateServicePopup] = useState<boolean>(false);

  const [duplicateData, setDuplicateData] = useState<DuplicateServiceDataItem | null>(null);

  const [pendingService, setPendingService] = useState<ServiceItemList | null>(null);

  const [renderDueAmountPopup, setRenderDueAmountPopup] = useState<boolean>(false);
  const [openDueAmountPopup, setOpenDueAmountPopup] = useState<boolean>(false);
  const [dueAmount, setDueAmount] = useState<number>(0);

  const [canProceedBilling, setCanProceedBilling] = useState<boolean>(false);

  const [previousDues, setPreviousDues] = useState({
    opd: null,
    ipd: null,
    pharmacy: null,
  });

  const [openIpdOpdPharmacyPopup, setOpenIpdOpdPharmacy] = useState<boolean>(false);
  const [renderIpdOpdPharmacyPopup, setRenderIpdOpdPharmacy] = useState<boolean>(false);

  // get discount % user wise
  const getDiscountPerc = async (userId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_USER_DISCOUNT_RIGHTS,
      {},
      { params: { userId } },
      { component: "OpdBilling" }
    );
    return Number(resp?.data?.[0]?.DiscPerOPD) ?? 100;
  };

  const { data } = useQuery({
    queryKey: ["opdDiscount"],
    queryFn: () => getDiscountPerc(userId),
  });

  // previous dues

  const getPatientBalanceOpd = async (uhid: string) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PATIENT_BALANCE_AMOUNT_OPD,
      {},
      { params: { uhid } },
      { component: "OpdBilling" }
    );
    return resp?.data?.[0]?.TotalBalanceAmountOPD;
  };

  const getPatientBalanceIpd = async (uhid: string) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PATIENT_BALANCE_AMOUNT_IPD,
      {},
      { params: { uhid } },
      { component: "OpdBilling" }
    );
    return resp?.data?.[0]?.TotalBalanceAmountIPD;
  };

  const getPatientBalancePharmacy = async (uhid: string) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PATIENT_BALANCE_AMOUNT_IPD,
      {},
      { params: { uhid } },
      { component: "OpdBilling" }
    );
    return resp?.data?.[0]?.TotalBalanceAmountPharmacy;
  };

  // autoFill patient data

  useEffect(() => {
    if (patientRegistrationDetails?.PatientId) {
      const fetchPatientData = async () => {
        // clear previous patient billing data
        SetServiceDataTableItem([]);
        SetServiceItemList([]);
        setSearchTerm("");
        setShowPopup(false);
        setShowDuplicateError("");
        setPackagePayload([]);
        setIsPackageUrgent(0);
        setSelectDoctorError("");

        calculateAndUpdateBillingDetails([]);

        const resp = await getPatientDataByPatientId(
          fetchApi,
          Number(patientRegistrationDetails?.PatientId),
          "opdBilling"
        );

        if (!resp || Object.keys(resp).length === 0) return;

        setPatientRegistrationDetails(prev => ({
          ...prev,
          ...resp,
        }));

        if (resp?.doctorId) {
          const doctor = await getDoctorMaster(fetchApi, Number(resp.doctorId), "opdBilling");

          if (doctor) {
            setSelectedDoctor(doctor);
          }
        }

        // bind patient dues

        const [opdResult, ipdResult, pharmacyResult] = await Promise.all([
          getPatientBalanceOpd(resp?.uhid),
          getPatientBalanceIpd(resp?.uhid),
          getPatientBalancePharmacy(resp?.uhid),
        ]);

        setPreviousDues({
          opd: opdResult,
          ipd: ipdResult,
          pharmacy: pharmacyResult,
        });

        setTimeout(() => {
          if (opdResult !== null || ipdResult !== null || pharmacyResult !== null) {
            setOpenIpdOpdPharmacy(true);
            setRenderIpdOpdPharmacy(true);
          } else {
            // If no dues, focus service search input immediately
            serviceInputRef.current?.focus();
          }
        }, 300);
      };

      fetchPatientData();
    }
  }, [patientRegistrationDetails?.PatientId]);

  // close ipd opd pharmacy popup
  const closeIpdOpdPharmacyPopup = useCallback(() => {
    setOpenIpdOpdPharmacy(false);
  }, []);

  // handle ipd opd pharmacy popup button click
  const ipdOpdPharmacyPopupButtonHandler = useCallback((value: string) => {
    if (value === "continue") {
      setOpenIpdOpdPharmacy(false);
      setTimeout(() => {
        serviceInputRef.current?.focus();
      }, 100);
    } else if (value === "cancel") {
      setOpenIpdOpdPharmacy(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDoctor?.value && selectDoctorError) {
      setSelectDoctorError("");
    }
  }, [selectedDoctor?.value, selectDoctorError]);

  useEffect(() => {
    if (selectDoctorError && patientRegistrationDetails?.PatientId) {
      setSelectDoctorError("");
    }
  }, [patientRegistrationDetails?.PatientId, selectDoctorError]);

  useEffect(() => {
    if (
      selectDoctorError &&
      (patientRegistrationDetails?.FirstName ||
        patientRegistrationDetails?.MiddleName ||
        patientRegistrationDetails?.LastName)
    ) {
      setSelectDoctorError("");
    }
  }, [
    patientRegistrationDetails?.FirstName,
    patientRegistrationDetails?.MiddleName,
    patientRegistrationDetails?.LastName,
    selectDoctorError,
  ]);

  const [isBillingDiscount, setIsBillingDiscount] = useState<number>(0);

  //visit details payload
  const [opdBillingFormData, setOpdBillingFormData] = useState<OpdBillingFormData>({
    patientId: 0,
    uhid: "",
    branchId: 0,
    currentAge: "",
    insuranceCompanyId: 0,
    corporateId: 1,
    referDoctorId: 0,
    grossBillAmount: 0,
    totalDiscPerOnBill: 0,
    totalDiscAmtOnBill: 0,
    roundOff: 0,
    netAmount: 0,
    discApprovedById: 0,
    discountReason: "",
    remarks: "",
    uniqueId: "",
    mlc: "",
    pi: "",
    remark: "",
    policyNo: "",
    policyCardNo: "",
    expiryDate: "",
    cardHolder: "",
    referalNo: "",
    referalDate: "",
    diagnosisId: 0,
    proId: 0,
    proName: "",
    isSendMRD: 0,
  });

  //billing details payload
  const buildServiceRowFromApi = (
    apiData: ServiceBindingItem | Record<string, unknown> | null | undefined,
    overrides?: { doctorId?: number; doctorName?: string }
  ): ServiceBindingItem => {
    const data = (apiData ?? {}) as ServiceBindingItem & Record<string, unknown>;
    const requiresPerformingDoctor = Number(data?.isRequiredSeparatePerformingDoctor) === 1;
    const doctorId =
      overrides?.doctorId ?? (requiresPerformingDoctor ? 0 : Number(selectedDoctor?.value ?? 0));
    const doctorName =
      overrides?.doctorName ??
      (requiresPerformingDoctor ? "" : String(selectedDoctor?.label ?? ""));

    return {
      ...data,
      rateListId: resolveRateListIdFromApiData(data),
      qty: data?.qty ?? 1,
      doctorId,
      doctorName,
    };
  };

  const fetchServiceDetailsForRow = useCallback(
    async (row: ServiceBindingItem, doctorId: number) => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_SERVICE_ALL_DETAILS_FOR_OPD_BILLING,
        {},
        {
          params: {
            corporateId: selectedCorporate?.value ?? row.corporateId,
            doctorId,
            serviceItemId: row.serviceItemId,
            categoryId: row.categoryId,
            subCategoryId: row.subCategoryId,
            subSubCategoryId: row.subSubCategoryId,
            bedTypeId: 0,
          },
        },
        { component: "OpdBilling", silent: true }
      );

      return resp?.data;
    },
    [fetchApi, selectedCorporate?.value]
  );

  const resolveRateListIdForRow = useCallback(
    (row: ServiceBindingItem): number => {
      const rowRateListId = resolveRateListIdFromApiData(row);
      if (rowRateListId > 0) {
        return rowRateListId;
      }

      return corporateOpdRateListIds[0] ?? 0;
    },
    [corporateOpdRateListIds]
  );

  const finalizeServiceRow = (
    apiData: ServiceBindingItem | Record<string, unknown> | null | undefined
  ): ServiceBindingItem => {
    const row = buildServiceRowFromApi(apiData);
    return {
      ...row,
      rateListId: resolveRateListIdForRow(row),
    };
  };

  const loadPerformingDoctorsForDepartments = useCallback(async (doctorDepartmentIds?: string) => {
    const cacheKey = getPerformingDoctorsCacheKey(doctorDepartmentIds);
    if (!cacheKey || performingDoctorsLoadingRef.current.has(cacheKey)) {
      return;
    }

    performingDoctorsLoadingRef.current.add(cacheKey);

    try {
      const departmentIds = parseDepartmentIds(doctorDepartmentIds);
      const responses = await Promise.all(
        departmentIds.map(departmentId =>
          fetchApi(
            "GET",
            ENDPOINTS.GET_DOCTOR_MASTER,
            {},
            { params: { doctorDepartmentId: departmentId, isActive: 1, isDoctorUnit: 0 } },
            { component: "OpdBilling", silent: true }
          )
        )
      );

      const merged = responses.flatMap(resp => resp?.data ?? []);
      const uniqueDoctors = Array.from(
        new Map(merged.map((doctor: DoctorMasterItem) => [doctor.doctorId, doctor])).values()
      );

      setPerformingDoctorsCache(prev => ({ ...prev, [cacheKey]: uniqueDoctors }));
    } finally {
      performingDoctorsLoadingRef.current.delete(cacheKey);
    }
  }, []);

  const getPerformingDoctorOptions = useCallback(
    (doctorDepartmentIds?: string): OptionItem[] => {
      const cacheKey = getPerformingDoctorsCacheKey(doctorDepartmentIds);
      return (performingDoctorsCache[cacheKey] ?? []).map(doctor => ({
        value: doctor.doctorId,
        label: doctor.completeName || doctor.name,
      }));
    },
    [performingDoctorsCache]
  );

  const performingDoctorChangeHandler = async (rowIndex: number, doctorId: number) => {
    const row = serviceDataTableItem[rowIndex];
    if (!row) {
      return;
    }

    if (!doctorId) {
      SetServiceDataTableItem(prev =>
        prev.map((item, index) =>
          index === rowIndex ? { ...item, doctorId: 0, doctorName: "", rateListId: 0 } : item
        )
      );
      setServiceValidationError("");
      return;
    }

    const options = getPerformingDoctorOptions(row?.doctorDepartmentIds);
    const selected = options.find(option => Number(option.value) === doctorId);
    const apiData = await fetchServiceDetailsForRow(row, doctorId);
    const updatedRow = buildServiceRowFromApi(apiData, {
      doctorId,
      doctorName: selected?.label ?? "",
    });
    const mergedRow = recalculateFromDiscountPercentage(
      {
        ...row,
        ...updatedRow,
        qty: row.qty ?? updatedRow.qty ?? 1,
      },
      Number(row.discountPer ?? 0),
      Number(updatedRow.rate ?? row.rate ?? 0)
    );
    mergedRow.rateListId = resolveRateListIdForRow(mergedRow);

    SetServiceDataTableItem(prev => {
      const updated = prev.map((item, index) => (index === rowIndex ? mergedRow : item));
      setTimeout(() => calculateAndUpdateBillingDetails(updated), 0);
      return updated;
    });
    setServiceValidationError("");
  };

  const validatePerformingDoctors = (): boolean => {
    const missingPerformingDoctor = serviceDataTableItem.some(
      item => Number(item.isRequiredSeparatePerformingDoctor) === 1 && !Number(item.doctorId)
    );

    if (missingPerformingDoctor) {
      const message = "Please select performing doctor for all required services";
      setServiceValidationError(message);
      showWarning(message);
      setActiveTab(OPDBillingTabName.OPD_BILLING);
      return false;
    }

    setServiceValidationError("");
    return true;
  };

  const validateBillingDoctorForServices = (): boolean => {
    const missingBillingDoctor = serviceDataTableItem.some(
      item => Number(item.isRequiredSeparatePerformingDoctor) !== 1 && !Number(item.doctorId)
    );

    if (missingBillingDoctor) {
      const message = "Please select doctor for services that require billing doctor";
      setSelectDoctorError(message);
      showWarning(message);
      setActiveTab(OPDBillingTabName.OPD_BILLING);
      doctorRef.current?.focus();
      return false;
    }

    setSelectDoctorError("");
    return true;
  };

  const validateRateListIds = (): boolean => {
    const missingRateList = serviceDataTableItem.some(item => resolveRateListIdForRow(item) <= 0);

    if (missingRateList) {
      const message =
        "Rate list is not configured for one or more services. Please re-select performing doctor.";
      setServiceValidationError(message);
      showWarning(message);
      setActiveTab(OPDBillingTabName.OPD_BILLING);
      return false;
    }

    return true;
  };

  const validateServiceDoctors = (): boolean =>
    validatePerformingDoctors() && validateBillingDoctorForServices() && validateRateListIds();

  const isHeaderDoctorRequired = useMemo(
    () => serviceDataTableItem.some(item => Number(item.isRequiredSeparatePerformingDoctor) !== 1),
    [serviceDataTableItem]
  );

  useEffect(() => {
    serviceDataTableItem.forEach(item => {
      if (Number(item.isRequiredSeparatePerformingDoctor) !== 1) {
        return;
      }

      const cacheKey = getPerformingDoctorsCacheKey(item.doctorDepartmentIds);
      if (!cacheKey || performingDoctorsCache[cacheKey]) {
        return;
      }

      void loadPerformingDoctorsForDepartments(item.doctorDepartmentIds);
    });
  }, [serviceDataTableItem, performingDoctorsCache, loadPerformingDoctorsForDepartments]);

  const mapServiceToBillingItem = (s: ServiceBindingItem): OpdBillingItemPayload => {
    const qty = Number(s?.qty) || 1;
    const rate = Number(s?.rate) || 0;
    const grossAmt = qty * rate;
    const discPer = Number(s?.discountPer) || 0;
    const discAmt = Number(s?.dis) || (grossAmt * discPer) / 100;
    const netAmt = Number(s?.netAmount) || Number((grossAmt - discAmt).toFixed(2));

    return {
      serviceItemId: s?.serviceItemId || 0,
      subSubCategoryId: s?.subSubCategoryId || 0,
      subCategoryId: s?.subCategoryId || 0,
      categoryId: s?.categoryId || 0,
      serviceName: s?.serviceName || "",
      code: s?.code || "",
      corporateAlias: s?.corporateAlias || "",
      corporateCode: s?.corporateCode || "",
      discountReason: s?.discountReason || "",
      isNonPayable: Number(s?.isNonPayable) || 0,
      rateListId: resolveRateListIdForRow(s),
      validityDays: Number(s?.validityDays) || 0,
      doctorId: Number(s?.doctorId) || 0,
      qty,
      rate,
      discPer,
      discAmt,
      grossAmt,
      netAmt,
      isUnderPackage: Number(s?.isUnderPackage) || 0,
      packageId: 0,
      isUrgent: Number(s?.isUrgent) || 0,
      sampleTypeId: Number(s?.sampleTypeId) || 0,
    };
  };

  const mapPackageToBillingItem = (item: PackagePayloadItem): OpdBillingItemPayload => ({
    serviceItemId: item?.serviceItemId || 0,
    subSubCategoryId: item?.subSubCategoryId || 0,
    subCategoryId: item?.subCategoryId || 0,
    categoryId: item?.categoryId || 0,
    serviceName: item?.serviceName || "",
    code: item?.code || "",
    corporateAlias: item?.corporateAlias || "",
    corporateCode: item?.corporateCode || "",
    discountReason: item?.discountReason || "",
    isNonPayable: Number(item?.isNonPayable) || 0,
    rateListId: Number(item?.rateListId) || corporateOpdRateListIds[0] || 0,
    validityDays: Number(item?.validityDays) || 0,
    doctorId: Number(item?.doctorId) || 0,
    qty: Number(item?.qty) || 1,
    rate: Number(item?.rate) || 0,
    discPer: Number(item?.discPer) || 0,
    discAmt: Number(item?.discAmt) || 0,
    grossAmt: Number(item?.grossAmt) || 0,
    netAmt: Number(item?.netAmt) || 0,
    isUnderPackage: Number(item?.isUnderPackage) || 0,
    packageId: Number(item?.packageId) || 0,
    isUrgent: Number(item?.isUrgent) || 0,
    sampleTypeId: Number(item?.sampleTypeId) || 0,
  });

  const createBillingItemsPayload = (): OpdBillingItemPayload[] => {
    const tableItems = serviceDataTableItem.map(mapServiceToBillingItem);
    const packageItems = (packagePayload ?? []).map(mapPackageToBillingItem);
    return [...tableItems, ...packageItems];
  };

  const buildVisitDetailsPayload = (
    patientId: number,
    branchId: number,
    patientRecord?: Record<string, unknown> | null
  ): OpdBillingVisitDetailsPayload => ({
    patientId,
    uhid: resolvePatientUhid(patientRecord, patientRegistrationDetails, opdBillingFormData.uhid),
    branchId,
    currentAge:
      buildCurrentAgeFromDetails(patientRecord) ||
      buildCurrentAgeFromDetails(patientRegistrationDetails) ||
      opdBillingFormData.currentAge ||
      "",
    insuranceCompanyId:
      Number(opdBillingFormData.insuranceCompanyId ?? selectedInsurance ?? 0) || 0,
    corporateId: Number(opdBillingFormData.corporateId ?? selectedCorporate?.value ?? 0) || 0,
    referDoctorId: Number(opdBillingFormData.referDoctorId ?? selectedReferDoctor?.value ?? 0) || 0,
    isDiscountApprovalRequired: 0,
    grossBillAmount:
      Number(billingValues?.grossBillAmount ?? opdBillingFormData.grossBillAmount) || 0,
    totalDiscPerOnBill:
      Number(billingValues?.totalDiscPerOnBill ?? opdBillingFormData.totalDiscPerOnBill) || 0,
    totalDiscAmtOnBill:
      Number(billingValues?.totalDiscAmtOnBill ?? opdBillingFormData.totalDiscAmtOnBill) || 0,
    roundOff: Number(billingValues?.roundOff ?? opdBillingFormData.roundOff) || 0,
    netAmount: Number(billingValues?.netAmount ?? opdBillingFormData.netAmount) || 0,
    discApprovedById:
      Number(billingValues?.discApprovedById ?? opdBillingFormData.discApprovedById ?? 0) || 0,
    discountReason: billingValues?.discountReason ?? opdBillingFormData.discountReason ?? "",
    remarks: billingValues?.remarks ?? opdBillingFormData.remarks ?? "",
    uniqueId: opdBillingFormData.uniqueId ?? "",
    mlc: opdBillingFormData.mlc ?? "",
    pi: opdBillingFormData.pi ?? "",
    remark: opdBillingFormData.remark ?? "",
    policyNo: opdBillingFormData.policyNo ?? "",
    policyCardNo: opdBillingFormData.policyCardNo ?? "",
    expiryDate: opdBillingFormData.expiryDate ?? "",
    cardHolder: opdBillingFormData.cardHolder ?? "",
    referalNo: opdBillingFormData.referalNo ?? "",
    referalDate: opdBillingFormData.referalDate ?? "",
    diagnosisId: Number(opdBillingFormData.diagnosisId ?? 0) || 0,
    proId: Number(opdBillingFormData.proId ?? 0) || 0,
    proName: opdBillingFormData.proName ?? "",
    isSendMRD: Number(opdBillingFormData.isSendMRD ?? 0) || 0,
  });

  const buildOpdBillingSavePayload = (
    patientId: number,
    branchId: number,
    patientRecord?: Record<string, unknown> | null
  ): OpdBillingSavePayload => ({
    visitDetails: buildVisitDetailsPayload(patientId, branchId, patientRecord),
    billingItems: createBillingItemsPayload(),
  });

  const registerPatientForBilling = async () => {
    const formData = new FormData();
    for (const key in patientRegistrationDetails) {
      const value = patientRegistrationDetails[key];
      if (value === null || value === undefined || value === "") {
        continue;
      }
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    }

    const registrationResp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_PATIENT_MASTER,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
      { component: "Opd Billing" }
    );

    if (!registrationResp?.data) {
      showError("Failed to register patient");
      return null;
    }

    const patientResponse = await fetchApi(
      "GET",
      ENDPOINTS.GET_PATIENT_MASTER,
      {},
      { params: { patientId: registrationResp?.data?.patientId } },
      { component: "opdBilling" }
    );

    if (!patientResponse?.data) {
      showError("Failed to fetch patient details");
      return null;
    }

    return {
      patientId: Number(registrationResp?.data?.patientId ?? 0),
      branchId: Number(patientResponse?.data?.[0]?.branchId ?? opdBillingFormData.branchId ?? 1),
      registrationResp,
      patientRecord: (patientResponse?.data?.[0] ?? null) as Record<string, unknown> | null,
    };
  };

  // billing discount details
  const [billingValues, setBillingValues] = useState<BillingFormValues>({
    grossBillAmount: 0,
    totalDiscPerOnBill: 0,
    totalDiscAmtOnBill: 0,
    roundOff: 0,
    netAmount: 0,
    balanceAmount: 0,
    discApprovedById: 0,
    discountReason: "",
    remarks: "",
  });

  // payment paid amount
  useEffect(() => {
    const paidAmountFromAPI = paymentModeList?.reduce((acc, cur) => acc + Number(cur?.Amount), 0);

    const finalPaidAmount =
      paidAmountFromAPI > 0 ? paidAmountFromAPI : Number(billingValues?.netAmount ?? 0);

    setTotalPaidAmount(finalPaidAmount);
  }, [paymentModeList, billingValues?.netAmount]);

  useEffect(() => {
    if (billingValues?.totalDiscPerOnBill || billingValues?.totalDiscAmtOnBill) {
      setIsBillingDiscount(1);
    }
  }, [billingValues?.totalDiscPerOnBill, billingValues?.totalDiscAmtOnBill]);

  // Auto-calculate balance amount whenever payment details or net amount changes
  // Balance = Net Amount - Total Payment
  // Can be negative if overpaid, positive if pending, zero if fully paid
  useEffect(() => {
    const billingPayload = billingDetailsRef.current?.getPayload?.();
    const payments = (billingPayload?.payments ?? []) as Array<{ amount?: unknown }>;

    const totalPayment = payments.reduce((acc: number, curr) => acc + Number(curr?.amount || 0), 0);
    const balanceAmount = Number(billingValues?.netAmount ?? 0) - totalPayment;

    setBillingValues(prev => ({
      ...prev,
      balanceAmount: Number(balanceAmount.toFixed(2)),
    }));
  }, [paymentDetails, billingValues?.netAmount]);

  // payment details payload

  const hasSelectedService = serviceDataTableItem.length > 0;

  const showRegistrationButton = false;

  const routePatientId = Number.isFinite(pId) && pId > 0 ? pId : null;
  const resolvedPatientId = activePatientId ?? routePatientId;

  useEffect(() => {
    if (routePatientId && activePatientId === null) {
      setActivePatientId(routePatientId);
    }
  }, [routePatientId, activePatientId]);

  const bindPatientToRegistration = useCallback(async (patientId: number) => {
    setActivePatientId(patientId);
    setPatientTabError(false);
    await patientDataRef.current?.loadPatientById(patientId);
  }, []);

  const handleSelectPatient = useCallback(
    async (item: SearchedPatientItem) => {
      const patientId = Number(item?.patientId ?? 0);

      if (!patientId) {
        setSearchPatientError("Invalid patient selected.");
        return false;
      }

      setSearchPatientError("");
      await bindPatientToRegistration(patientId);
      setActiveTab(OPDBillingTabName.OPD_BILLING);
      return true;
    },
    [bindPatientToRegistration]
  );

  const handleUhidPatientSelect = useCallback(
    async (patientId: number) => {
      if (!patientId) {
        showWarning("Invalid patient selected.");
        return false;
      }

      await bindPatientToRegistration(patientId);
      setActiveTab(OPDBillingTabName.OPD_BILLING);
      return true;
    },
    [bindPatientToRegistration]
  );

  const handlePatientLoadedFromUhid = useCallback(() => {
    setActiveTab(OPDBillingTabName.OPD_BILLING);
  }, []);

  const SearchOldPatientHandler = () => {
    setSearchPatientError("");
    setOpenSearchPatientPopup(true);
    setRenderSearchPatientPopup(true);
  };

  const closeSearchPatientHandler = useCallback(() => {
    setSearchPatientError("");
    setOpenSearchPatientPopup(false);

    setTimeout(() => {
      setRenderSearchPatientPopup(false);
    }, 300);
  }, []);

  // insurance company list
  const getInsuranceList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_INSURANCE_COMPANY_MASTER_LIST,
      {},
      {},
      { component: "Patient Registration" }
    );
    setInsuranceList(resp?.data ?? []);
  };

  // insurance select handler
  const insuranceSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const insuranceId = Number(e.target.value);

    if (!insuranceId) {
      setCorporateList([]);
      setSelectedCorporate(defaultCorporate);
      setSelectedInsurance(0);

      setOpdBillingFormData(prev => ({
        ...prev,
        insuranceCompanyId: 0,
      }));

      return;
    }

    setSelectedInsurance(insuranceId);
    getCorporateList(insuranceId);
    setSelectedCorporate(null);

    setOpdBillingFormData(prev => ({
      ...prev,
      insuranceCompanyId: insuranceId,
    }));
  };
  // corporate list
  const getCorporateList = async (corporateId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CORPORATE_MASTER_LIST,
      {},
      { params: { insuranceCompanyId: corporateId, isActive: Status?.ACTIVE } },
      { component: "Patient Registration" }
    );
    setCorporateList(resp?.data ?? []);
  };

  const corporateSelectOption = useMemo(() => {
    const corporateOptions = corporateList.map(item => ({
      value: item.corporateId,
      label: item.corporateName,
    }));

    // Keep CASH visible for self-insurance/default flow.
    if (!selectedInsurance) {
      return [
        defaultCorporate,
        ...corporateOptions.filter(item => item.value !== defaultCorporate.value),
      ];
    }

    return corporateOptions;
  }, [corporateList, selectedInsurance]);

  // corporate select handler
  const corporateSelectHandler = (option: OptionItem | null) => {
    setSelectedCorporateError("");
    if (!option) {
      setSelectedCorporate(null);
      return;
    }
    setSelectedCorporate(option);

    setOpdBillingFormData(prev => ({
      ...prev,
      corporateId: Number(option?.value || 1),
    }));
    void loadCorporateOpdRateListIds(Number(option.value));
  };

  const loadCorporateOpdRateListIds = useCallback(async (corporateId: number) => {
    if (!corporateId) {
      setCorporateOpdRateListIds([]);
      return;
    }

    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CORPORATE_MASTER_LIST,
      {},
      { params: { corporateId } },
      { component: "OpdBilling", silent: true }
    );

    const rateListIdOPD = String(
      resp?.data?.[0]?.rateListIdOPD ?? resp?.data?.[0]?.RateListIdOPD ?? ""
    );
    const ids = rateListIdOPD
      .split(",")
      .map(value => Number(value.trim()))
      .filter(value => Number.isFinite(value) && value > 0);

    setCorporateOpdRateListIds(ids);
  }, []);

  useEffect(() => {
    void loadCorporateOpdRateListIds(Number(selectedCorporate?.value ?? defaultCorporate.value));
  }, [loadCorporateOpdRateListIds, selectedCorporate?.value]);

  const defaultSubCategory = { label: "All Sub Category", value: 0 };
  const defaultSubSubCategory = { label: "All Sub Sub Category", value: 0 };

  useEffect(() => {
    if (!selectedInsurance) {
      setSelectedCorporate(defaultCorporate);
    }
  }, [selectedInsurance]);

  useEffect(() => {
    setSelectedSubCategory(defaultSubCategory);
    setSelectedSubSubCategory(defaultSubSubCategory);
  }, [selectedCategory]);

  // refer doctor
  const getReferDoctor = useCallback(async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_REFER_DOCTOR_LIST,
      {},
      {},
      { component: "OpdBilling" }
    );
    setReferDoctorList(resp?.data ?? []);
  }, []);

  const referDoctorSelectOption = useMemo(() => {
    return referDoctorList.map(item => ({
      value: item?.referDoctorId,
      label: item?.doctorName,
    }));
  }, [referDoctorList]);

  const referDoctorSelectHandler = (option: SingleValue<OptionItem>) => {
    if (!option) return;
    setSelectedReferDoctor(option);
    setOpdBillingFormData(prev => ({
      ...prev,
      referDoctorId: Number(option?.value || 0),
    }));
  };

  // doctor list
  const getDoctorsLists = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_MASTER,
      {},
      { params: { isDoctorUnit: Status.INACTIVE } },
      { component: "DoctorMaster" }
    );
    setDoctorList(resp?.data ?? []);
  };

  const doctorSelectOption = useMemo(() => {
    return doctorList.map(item => ({
      value: item?.doctorId,
      label: item?.completeName,
    }));
  }, [doctorList]);

  const doctorSelectHandler = (option: OptionItem | null) => {
    if (!option) {
      setSelectedDoctor(null);
      return;
    }
    setSelectDoctorError("");
    setSelectedDoctor(option);
  };

  useEffect(() => {
    getInsuranceList();
    getReferDoctor();
    getDoctorsLists();
    getCategory();
  }, []);

  const prescribeButtonHandler = async (value: string) => {
    if (value === "prescribe" && pendingService) {
      await addServiceToTable(pendingService);

      setPendingService(null);
      setDuplicateData(null);

      setSearchTerm("");
      SetServiceItemList([]);
      setShowPopup(false);

      setOpenDuplicateServicePopup(false);
      setRenderDuplicateServicePopup(false);

      serviceInputRef.current?.focus();

      return;
    }

    if (value === "cancel") {
      setPendingService(null);
      setDuplicateData(null);

      setSearchTerm("");
      SetServiceItemList([]);
      setShowPopup(false);

      setOpenDuplicateServicePopup(false);
      setRenderDuplicateServicePopup(false);

      serviceInputRef.current?.focus();

      return;
    }
  };

  // service item select handler
  const serviceItemHandler = async (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!value.trim()) {
      SetServiceItemList([]);
      setShowPopup(false);
      setActiveServiceIndex(0);
      return;
    }
    setShowPopup(true);
    setActiveServiceIndex(0);
  };

  // debounced api call
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 3) return;

    const timer = setTimeout(async () => {
      try {
        const resp = await fetchApi(
          "GET",
          ENDPOINTS.GET_SERVICE_ITEM_LIST,
          {},
          {
            params: {
              serviceName: searchTerm,
              categoryId: selectedCategory,
              subCategoryId: selectedSubCategory?.value,
              subSubCategoryId: selectedSubSubCategory?.value,
            },
          },
          { component: "OpdBilling" }
        );

        SetServiceItemList(resp?.data ?? []);
        setShowPopup(true);
        setActiveServiceIndex(0);
      } catch (err) {
        console.error(err);
        setShowPopup(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const serviceInputKeyDownHandler = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showPopup || serviceNameList.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveServiceIndex(prev => (prev + 1) % serviceNameList.length);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveServiceIndex(prev => (prev - 1 + serviceNameList.length) % serviceNameList.length);
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const selectedService = serviceNameList[activeServiceIndex];
      if (selectedService) {
        selectedServiceHandler(selectedService);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setShowPopup(false);
      setActiveServiceIndex(0);
    }
  };

  useEffect(() => {
    SetServiceDataTableItem(prev =>
      prev.map(row => (row?.isUnderPackage === 1 ? { ...row, isUrgent: isPackageUrgent } : row))
    );
  }, [isPackageUrgent]);

  // test packages items
  const getTestPackages = async (packageId: number) => {
    try {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_PACKAGE_ALL_DETAILS,
        {},
        { params: { packageId } },
        { component: "OpdBilling" }
      );

      if (!resp?.data || !Array.isArray(resp.data)) return;

      const packPayload: PackagePayloadItem[] = resp.data.map((item: PackageItems) => ({
        serviceItemId: item?.packageServiceId ?? 0,
        serviceName: item?.packageServiceName ?? "",
        code: item?.packageServiceCode ?? "",
        categoryId: item?.packageServiceCategoryId ?? 0,
        subCategoryId: item?.packageServiceSubCategoryId ?? 0,
        subSubCategoryId: item?.packageServiceSubSubCategoryId ?? 0,
        corporateAlias: "",
        corporateCode: "",

        qty: 1,
        rate: 0.0,
        grossAmt: 0.0,

        discPer: 0.0,
        discAmt: 0.0,
        discountReason: "",

        netAmt: 0,

        doctorId: selectedDoctor?.value ?? 0,
        rateListId: 0,
        validityDays: 0,
        sampleTypeId: 0,

        isNonPayable: 0,
        isUnderPackage: 1,
        packageId: item?.packageId,

        isUrgent: isPackageUrgent,
      }));

      setPackagePayload(packPayload);
    } catch (err) {
      console.error("Error fetching package:", err);
    }
  };

  useEffect(() => {
    setPackagePayload(prev =>
      prev.map(item => ({
        ...item,
        isUrgent: isPackageUrgent,
      }))
    );
  }, [isPackageUrgent]);

  // add duplicate service to table
  const addServiceToTable = async (item: ServiceItemList) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SERVICE_ALL_DETAILS_FOR_OPD_BILLING,
      {},
      {
        params: {
          corporateId: selectedCorporate?.value,
          doctorId: selectedDoctor?.value ?? 0,
          serviceItemId: item?.serviceItemId,
          categoryId: item?.categoryId,
          subCategoryId: item?.subCategoryId,
          subSubCategoryId: item?.subSubCategoryId,
          bedTypeId: 0,
        },
      }
    );

    const requiresPerformingDoctor = Number(resp?.data?.isRequiredSeparatePerformingDoctor) === 1;

    if (!requiresPerformingDoctor && !selectedDoctor?.value) {
      setSelectDoctorError("Please select any one doctor");
      showWarning("Please select any one doctor");
      doctorRef.current?.focus();
      return;
    }

    const serviceRow = finalizeServiceRow(resp?.data);
    const updatedServices = [...serviceDataTableItem, serviceRow];

    SetServiceDataTableItem(updatedServices);
    calculateAndUpdateBillingDetails(updatedServices);
  };

  // service handler
  const selectedServiceHandler = async (item: ServiceItemList) => {
    setShowPopup(false);
    setSelectDoctorError("");

    const dupResp = await fetchApi(
      "GET",
      ENDPOINTS.FIND_DUPLICATE_SERVICE,
      {},
      {
        params: {
          patientId: patientRegistrationDetails?.PatientId,
          serviceItemId: item?.serviceItemId,
        },
      },
      { component: "OpdBilling" }
    );

    if (dupResp?.result) {
      setPendingService(item);
      setDuplicateData(dupResp?.data?.[0]);
      setOpenDuplicateServicePopup(true);
      setRenderDuplicateServicePopup(true);
      return;
    }

    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SERVICE_ALL_DETAILS_FOR_OPD_BILLING,
      {},
      {
        params: {
          corporateId: selectedCorporate?.value,
          doctorId: selectedDoctor?.value ?? 0,
          serviceItemId: item?.serviceItemId,
          categoryId: item?.categoryId,
          subCategoryId: item?.subCategoryId,
          subSubCategoryId: item?.subSubCategoryId,
          bedTypeId: 0,
        },
      },
      { component: "OpdBilling" }
    );

    const requiresPerformingDoctor = Number(resp?.data?.isRequiredSeparatePerformingDoctor) === 1;

    if (!requiresPerformingDoctor && !selectedDoctor?.value) {
      setSelectDoctorError("Please select any one doctor");
      showWarning("Please select any one doctor");
      doctorRef.current?.focus();
      return;
    }

    setSearchTerm("");
    const filterItem = serviceDataTableItem.find(
      s => s?.serviceItemId === resp?.data?.serviceItemId
    );
    if (filterItem) {
      setShowDuplicateError("Service is already added, Please select another service");
      return;
    }

    setShowDuplicateError("");
    const serviceRow = finalizeServiceRow(resp?.data);
    const updatedServices = [...serviceDataTableItem, serviceRow];

    if (serviceRow?.categoryId === 11) {
      getTestPackages(Number(serviceRow?.serviceItemId));
    }
    SetServiceDataTableItem(updatedServices);
    setSearchTerm("");
    setTimeout(() => calculateAndUpdateBillingDetails(updatedServices), 0);
  };

  // category
  const getCategory = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CATEGORY_LIST,
      {},
      { params: { categoryIds: OPD_CATEGORY_IDs?.CategoryIds } }
    );
    setCategoryList(resp?.data ?? []);
  };

  const categorySelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = String(e.target.value);
    if (!value) {
      setSelectedCategory("1,3,4,5,8,11");
      return;
    }
    setSelectedCategory(value);
    getSubCategory(Number(value));
    setSelectedSubCategory(null);
    setSelectedSubSubCategory(null);
  };

  // sub category
  const getSubCategory = async (categoryIds: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SUB_CATEGORY_LIST,
      {},
      { params: { categoryIds } },
      { component: "OpdBilling" }
    );
    setSubCategoryList(resp?.data ?? []);
  };

  const subCategorySelectOption = useMemo(() => {
    return subCategoryList?.map(s => ({
      label: s?.subCategoryName,
      value: s?.subCategoryId,
    }));
  }, [subCategoryList]);

  const subCategorySelectHandler = (option: OptionItem | null) => {
    if (!option) {
      setSelectedSubCategory(null);
      return;
    }
    setSelectedSubCategory(option);
    getSubSubCategory(Number(option?.value));
    setSelectedSubSubCategory(null);
  };

  // sub sub category
  const getSubSubCategory = async (subCategoryIds: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SUB_SUB_CATEGORY_LIST,
      {},
      { params: { subCategoryIds } },
      { component: "OpdBilling" }
    );

    setSubSubCategoryList(resp?.data ?? []);
  };

  const subSubCategorySelectOption = useMemo(() => {
    return subSubCategoryList?.map(s => ({
      label: s?.subSubCategoryName,
      value: s?.subSubCategoryId,
    }));
  }, [subSubCategoryList]);

  const subSubCategorySelectHandler = (option: OptionItem | null) => {
    if (!option) return;
    setSelectedSubSubCategory(option);
  };

  // Calculate and update billing details from service items
  const calculateAndUpdateBillingDetails = (items: ServiceBindingItem[]) => {
    if (!items || items.length === 0) {
      // Reset billing details if no services
      setOpdBillingFormData(prev => ({
        ...prev,
        grossBillAmount: 0,
        totalDiscPerOnBill: 0,
        totalDiscAmtOnBill: 0,
        netAmount: 0,
        roundOff: 0,
      }));
      setTotalBillingAmount(0);
      setBillingPaymentDetails({});
      return;
    }

    // Calculate total gross amount from all services
    let totalGrossAmount = 0;
    let totalDiscountAmount = 0;

    items.forEach(item => {
      const qty = Number((item as { qty?: number | string | null })?.qty) || 1;
      const rate = Number(item?.rate) || 0;
      const grossAmt = rate * qty;

      // Get discount amount
      const dis = Number((item as { dis?: number | string | null })?.dis) || 0;
      const discPer = Number((item as { discountPer?: number | string | null })?.discountPer) || 0;
      const discountAmt = dis > 0 ? dis : (grossAmt * discPer) / 100;

      totalGrossAmount += grossAmt;
      totalDiscountAmount += discountAmt;
    });

    // Calculate net amount
    const netAmount = totalGrossAmount - totalDiscountAmount;
    const roundOff = Math.round(netAmount) - netAmount;
    const finalNetAmount = Math.round(netAmount);

    setTotalBillingAmount(finalNetAmount);

    // Update billing form data with calculated values
    setOpdBillingFormData(prev => ({
      ...prev,
      grossBillAmount: Number(totalGrossAmount.toFixed(2)),
      totalDiscAmtOnBill: Number(totalDiscountAmount.toFixed(2)),
      totalDiscPerOnBill:
        totalGrossAmount > 0
          ? Number(((totalDiscountAmount / totalGrossAmount) * 100).toFixed(2))
          : 0,
      roundOff: Number(roundOff.toFixed(2)),
      netAmount: Number(finalNetAmount.toFixed(2)),
    }));

    const details = {
      grossBillAmount: totalGrossAmount,
      totalDiscAmtOnBill: totalDiscountAmount,
      totalDiscPerOnBill:
        totalGrossAmount > 0
          ? Number(((totalDiscountAmount / totalGrossAmount) * 100).toFixed(2))
          : 0,
      netAmount: finalNetAmount,
    };
    setBillingPaymentDetails(details);
  };

  // Recalculate billing when service items change
  useEffect(() => {
    if (serviceDataTableItem && serviceDataTableItem.length > 0) {
      calculateAndUpdateBillingDetails(serviceDataTableItem);
    } else {
      calculateAndUpdateBillingDetails([]);
    }
  }, [serviceDataTableItem]);

  // rate and discount calculation
  const isPackageService = (serviceName: unknown) =>
    String(serviceName ?? "")
      .toLowerCase()
      .includes("package");

  const rateChangeHandler = (e: ChangeEvent<HTMLInputElement>, rowIndex: number) => {
    SetServiceDataTableItem(prev => {
      const updated = applyRateChange(prev, rowIndex, e.target.value);
      // Recalculate billing after rate change
      setTimeout(() => calculateAndUpdateBillingDetails(updated), 0);
      return updated;
    });
  };

  // discount change handler
  const discountChangeHandler = (e: ChangeEvent<HTMLInputElement>, rowIndex: number) => {
    const value = Number(e.target.value);

    // max discount validation
    if (value > Number(data ?? 0)) {
      showWarning(`You cannot give more than ${data}% discount`);
      return;
    }
    SetServiceDataTableItem(prev => {
      const updated = applyDiscountAmountChange(prev, rowIndex, e.target.value);
      // Recalculate billing after discount change
      setTimeout(() => calculateAndUpdateBillingDetails(updated), 0);
      return updated;
    });
  };

  // discount % change handler
  const discountPercentageChangeHandler = (e: ChangeEvent<HTMLInputElement>, rowIndex: number) => {
    // max discount validation
    const discountAmt = Number(e.target.value);

    const row = serviceDataTableItem[rowIndex];

    const grossAmount = (Number(row?.rate) || 0) * (Number(row?.qty) || 1);

    const discountPer = grossAmount > 0 ? (discountAmt / grossAmount) * 100 : 0;

    if (discountPer > Number(data ?? 0)) {
      showWarning(`You cannot give more than ${data}% discount`);
      return;
    }
    SetServiceDataTableItem(prev => {
      const updated = applyDiscountPercentageChange(prev, rowIndex, e.target.value);
      // Recalculate billing after discount percentage change
      setTimeout(() => calculateAndUpdateBillingDetails(updated), 0);
      return updated;
    });
  };

  // urgent change handler

  const urgentChangeHandler = (e: ChangeEvent<HTMLInputElement>, rowIndex: number) => {
    const checked = e.target.checked ? 1 : 0;

    SetServiceDataTableItem(prev => {
      const selectedRow = prev[rowIndex];

      //  Only package category controls global urgent
      if (Number(selectedRow?.categoryId) === 11) {
        setIsPackageUrgent(checked);
      }

      return prev.map((row, index) => (index === rowIndex ? { ...row, isUrgent: checked } : row));
    });
  };

  // delete service handler
  const deleteHandler = (rowIndex: number) => {
    SetServiceDataTableItem(prev => prev.filter((_, index) => index !== rowIndex));
    setShowDuplicateError("");
    setIsPackageUrgent(0);
    // Recalculate billing amounts after deleting a service
    calculateAndUpdateBillingDetails(serviceDataTableItem.filter((_, index) => index !== rowIndex));
  };

  // refer doctor popup handler
  const referDoctorPopUpHandler = () => {
    setRenderReferDoctorPopup(true);
    setOpenReferDoctorPopup(true);
  };

  const closeReferDoctorHandler = useCallback(() => {
    setOpenReferDoctorPopup(false);
    setRenderReferDoctorPopup(false);
  }, []);

  // Reset form to initial state
  const resetForm = () => {
    billingDetailsRef.current?.reset?.();

    // Reset patient registration
    setPatientRegistrationDetails({});

    // Reset insurance and corporate
    setSelectedInsurance(0);
    setCorporateList([]);
    setSelectedCorporate(defaultCorporate);
    setSelectedCorporateError("");

    // Reset doctor
    setSelectedDoctor(null);
    setSelectDoctorError("");

    // Reset refer doctor
    setSelectedReferDoctor(null);

    // Reset services
    SetServiceDataTableItem([]);
    SetServiceItemList([]);
    setSearchTerm("");
    setShowPopup(false);
    setShowDuplicateError("");
    setServiceValidationError("");
    setPerformingDoctorsCache({});

    // Reset category and subcategories
    setSelectedCategory("");
    setSelectedSubCategory(null);
    setSelectedSubSubCategory(null);

    // Reset billing form data
    setOpdBillingFormData({
      patientId: 0,
      uhid: "",
      branchId: 0,
      currentAge: "",
      insuranceCompanyId: 0,
      corporateId: 1,
      referDoctorId: 0,
      grossBillAmount: 0,
      totalDiscPerOnBill: 0,
      totalDiscAmtOnBill: 0,
      roundOff: 0,
      netAmount: 0,
      discApprovedById: 0,
      discountReason: "",
      remarks: "",
      uniqueId: "",
      mlc: "",
      pi: "",
      remark: "",
      policyNo: "",
      policyCardNo: "",
      expiryDate: "",
      cardHolder: "",
      referalNo: "",
      referalDate: "",
      diagnosisId: 0,
      proId: 0,
      proName: "",
      isSendMRD: 0,
    });

    // Reset billing values
    setBillingValues({
      grossBillAmount: 0,
      totalDiscPerOnBill: 0,
      totalDiscAmtOnBill: 0,
      roundOff: 0,
      netAmount: 0,
      balanceAmount: 0,
      discApprovedById: 0,
      discountReason: "",
      remarks: "",
    });

    // Reset other states
    setIsBillingDiscount(0);
    setActivePatientId(null);
    setActiveTab(OPDBillingTabName.PATIENT_DETAILS);
    setPatientTabError(false);
    setDocumentTabError(false);
    setSearchPatientError("");
    ipdOpdDocumentRef.current?.resetForm();
    setPaymentDetails([]);
    setTotalBillingAmount(0);
    setPatientReceiptDetails([]);
    setPaymentModeList([]);
    setOpdCardDetails(null);
    setBillingPaymentDetails({});
    setCollectOnDeviceAmount(0);
    setOpenCollectOnDevice(false);
    setRenderCollectOnDevice(false);
    setOpenPackagePopup(false);
    setRenderPackagePopup(false);
    setOpenReferDoctorPopup(false);
    setRenderReferDoctorPopup(false);
    setOpenSearchPatientPopup(false);
    setRenderSearchPatientPopup(false);
    setPendingCombinedPrint(false);
    setPendingDoctorAppointmentPrint(false);

    // Force re-mount children with internal form state (PatientData + BillingDetails).
    setFormResetKey(prev => prev + 1);
  };

  // due button click handler
  const dueAmountButtonClickHandler = (value: string) => {
    switch (value) {
      case "continue": {
        if (dueAmount) {
          setCanProceedBilling(true);
          setOpenDueAmountPopup(false);
        }
        setOpenDueAmountPopup(false);

        break;
      }

      case "cancel": {
        setCanProceedBilling(false);
        setOpenDueAmountPopup(false);
        break;
      }

      default:
        break;
    }
  };

  // get patient previous dues
  const getPatientPreviousDues = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PATIENT_PREVIOUS_DUES,
      {},
      { params: { branchId, patientId: patientRegistrationDetails?.PatientId } },
      { component: "OpdBilling" }
    );
    const dueAmountValue = resp?.data?.[0]?.TotalBalanceAmount ?? 0;
    setDueAmount(dueAmountValue);

    if (dueAmountValue > 0) {
      setRenderDueAmountPopup(true);
      setOpenDueAmountPopup(true);
    } else {
      // No due amount, proceed directly with billing
      setCanProceedBilling(true);
    }
  };

  const closeDueAmountHandler = useCallback(() => {
    setOpenDueAmountPopup(false);
  }, []);

  useEffect(() => {
    if (!canProceedBilling) return;

    const proceedBilling = async () => {
      setCanProceedBilling(false);

      await getUserRegistrationResponse();
    };

    proceedBilling();
  }, [canProceedBilling]);

  // button click handler
  const buttonClickHandler = async (value: string) => {
    if (value === "collectOnDevice") {
      if (!totalBillingAmount) return;
      const netAmount = billingDetailsRef.current?.getNetAmount() ?? totalBillingAmount;
      setCollectOnDeviceAmount(netAmount);
      setRenderCollectOnDevice(true);
      setOpenCollectOnDevice(true);
    }

    if (value === "cancel") {
      resetForm();
    }

    if (value === "save") {
      const isValid = await patientDataRef.current?.validateForm();

      if (!isValid) {
        setPatientTabError(true);
        setActiveTab(OPDBillingTabName.PATIENT_DETAILS);
        return;
      }

      setPatientTabError(false);
      await getPatientPreviousDues();
    }

    if (value === "saveAsDraft") {
      const isValid = await patientDataRef.current?.validateForm();

      if (!isValid) {
        setPatientTabError(true);
        setActiveTab(OPDBillingTabName.PATIENT_DETAILS);
        return;
      }

      setPatientTabError(false);
      await saveOpdBillingAsDraft();
    }
  };

  const saveOpdBillingAsDraft = async () => {
    try {
      if (!validateServiceDoctors()) {
        return;
      }

      const billingItems = createBillingItemsPayload();

      if (!billingItems.length) {
        showError("Please add some services to continue");
        setActiveTab(OPDBillingTabName.OPD_BILLING);
        return;
      }

      const patientData = await registerPatientForBilling();
      if (!patientData) {
        return;
      }

      const completePayload = buildOpdBillingSavePayload(
        patientData.patientId,
        patientData.branchId,
        patientData.patientRecord
      );

      const saveOpdDraft = await fetchApi(
        "POST",
        ENDPOINTS.SAVE_OPD_BOOKING,
        completePayload,
        {},
        { component: "opdBilling" }
      );

      if (!saveOpdDraft?.result) {
        showError(saveOpdDraft?.message || "Failed to save OPD billing draft");
        return;
      }

      showSuccess(saveOpdDraft?.message ?? "OPD Billing saved as draft successfully");

      setTimeout(() => {
        resetForm();
      }, 300);
    } catch (error) {
      console.error("Error saving OPD billing draft:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      showError(`Failed to save draft: ${errorMessage}`);
    }
  };

  const getUserRegistrationResponse = async () => {
    try {
      // step 1: Validate rate first
      const hasInvalidRate = serviceDataTableItem.some(s => !s?.rate || Number(s?.rate) <= 0);

      if (hasInvalidRate) {
        showError("Please set rate of the service");
        return;
      }

      if (!validateServiceDoctors()) {
        return;
      }

      const billingItems = createBillingItemsPayload();

      if (!billingItems || billingItems.length === 0) {
        showError("Please add some services to continue");
        setActiveTab(OPDBillingTabName.OPD_BILLING);
        return;
      }

      const areDocumentsValid = await ipdOpdDocumentRef.current?.validateMandatoryDocuments();

      if (!areDocumentsValid) {
        setDocumentTabError(true);
        setActiveTab(OPDBillingTabName.OPD_DOCUMENT);
        return null;
      }

      setDocumentTabError(false);

      const patientData = await registerPatientForBilling();
      if (!patientData) {
        return;
      }

      const billingPayload = billingDetailsRef.current?.getPayload?.();
      const allPaymentDetails = billingPayload?.payments || [];

      const completePayload = {
        ...buildOpdBillingSavePayload(
          patientData.patientId,
          patientData.branchId,
          patientData.patientRecord
        ),
        paymentDetails: allPaymentDetails,
        isBillDiscount: isBillingDiscount,
      };

      const saveBillingResp = await fetchApi(
        "POST",
        ENDPOINTS.SAVE_OPD_BILLING,
        completePayload,
        {},
        { component: "opdBilling" }
      );

      const registrationResp = patientData.registrationResp;

      // handle failure
      if (!saveBillingResp?.result) {
        const errorMsg = saveBillingResp?.message || "Failed to save OPD billing";
        showError(errorMsg);
        return null;
      }

      // success
      await showSuccess(saveBillingResp?.message ?? "OPD Billing saved successfully");

      const responseData = saveBillingResp?.data;
      if (!responseData) {
        return null;
      }

      const savedPatientId = Number(registrationResp?.data?.patientId ?? 0);
      const visitId = resolveVisitIdFromResponse(responseData);

      if (savedPatientId > 0 && visitId > 0) {
        const documentsUploaded = await ipdOpdDocumentRef.current?.uploadDocuments(
          savedPatientId,
          visitId
        );

        if (documentsUploaded === false) {
          showWarning("OPD billing saved, but document upload failed");
          return saveBillingResp;
        }
      }

      //  extract response
      const ftid = Number(responseData.ftid || 0);
      const resolvedVisitId = visitId || Number(responseData.visitId || 0);
      const receiptId = Number(responseData.receiptId || 0);
      const isDoctorAppointment = responseData?.isDoctorAppointment === true;
      const isReceipt = responseData?.isReceipt === true ? 1 : 0;

      // fetch required data
      let opdData = null;
      let receiptData: any[] = [];
      let paymentModes: any[] = [];

      const promises = [
        isDoctorAppointment && ftid > 0
          ? fetchApi(
              "GET",
              ENDPOINTS.GET_OPD_CARD_DETAILS,
              {},
              { params: { ftid } },
              { component: "OpdBilling" }
            )
          : Promise.resolve(null),

        fetchApi(
          "GET",
          ENDPOINTS.GET_RECEIPT_DETAILS_BY_FTID,
          {},
          { params: { ftid, isReceipt, receiptId } },
          { component: "OpdBilling" }
        ),

        fetchApi(
          "GET",
          ENDPOINTS.GET_OPD_RECEIPT_LIST,
          {},
          { params: { visitNo: resolvedVisitId } },
          { component: "OpdBilling" }
        ),
      ];

      const [opdResult, receiptResult, paymentResult] = await Promise.allSettled(promises);

      if (opdResult.status === "fulfilled") {
        opdData = opdResult.value?.data?.[0] ?? null;
      }

      if (receiptResult.status === "fulfilled") {
        receiptData = receiptResult.value?.data ?? [];
      } else {
        console.error("Receipt details fetch failed:", receiptResult.reason);
      }

      if (paymentResult.status === "fulfilled") {
        paymentModes = paymentResult.value?.data ?? [];
      } else {
        console.error("Payment mode list fetch failed:", paymentResult.reason);
      }

      //  update state
      setOpdCardDetails(opdData);
      setPatientReceiptDetails(receiptData);
      setPaymentModeList(paymentModes);

      // wait for dom render
      await new Promise(res => setTimeout(res, 120));

      // Print on a dedicated blank page only after successful save + success toast.
      if (isDoctorAppointment) {
        openOpdPrintInNewTab();
      } else {
        if (!receiptData?.length) {
          showError("Billing saved, but receipt data is unavailable for printing.");
          return saveBillingResp;
        }
        openReceiptInNewTab(receiptData);
      }

      // reset after print
      setTimeout(() => {
        resetForm();
      }, 300);

      return saveBillingResp;
    } catch (error) {
      console.error("Error in OPD billing submission:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      showError(`Failed to process billing: ${errorMessage}`);
      return null;
    }
  };

  //  close collect on close handler
  const closeCollectOnDeviceHandler = useCallback(() => {
    setRenderCollectOnDevice(false);
    setOpenCollectOnDevice(false);
  }, []);

  // input handler
  const inputFieldHandler = (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;

    setOpdBillingFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // expiry date change handler
  const expiryDateChangeHandler = (value: string) => {
    if (!value) return;

    setOpdBillingFormData(prev => ({
      ...prev,
      expiryDate: value,
    }));
  };

  // referral date change handler
  const referralDateChangeHandler = (value: string) => {
    if (!value) return;

    setOpdBillingFormData(prev => ({
      ...prev,
      referalDate: value,
    }));
  };

  // package Popup handler
  const packagePopupHandler = (packageId: number) => {
    if (!packageId) return;
    setSelectedPackage(packageId);
    setOpenPackagePopup(true);
    setRenderPackagePopup(true);
    setSelectedServiceId(0);
  };

  // service popup handler
  const servicePopupHandler = (service: any) => {
    setSelectedServiceId(service?.serviceItemId || 0);
    setOpenPackagePopup(true);
    setRenderPackagePopup(true);
    setSelectedPackage(0);
  };

  const closePackageHandler = useCallback(() => {
    setOpenPackagePopup(false);
  }, []);

  const closeDuplicateServiceHandler = useCallback(() => {
    setOpenDuplicateServicePopup(false);
    setDuplicateData(null);
  }, []);

  const patientSummary = useMemo(
    () => buildIpdPatientSummary(patientRegistrationDetails),
    [patientRegistrationDetails]
  );

  const saveButtonLabel = useMemo(() => {
    const patientId = Number(patientRegistrationDetails?.PatientId ?? 0);
    return patientId > 0 ? "Update" : "Create";
  }, [patientRegistrationDetails?.PatientId]);

  const billingSectionProps = {
    formResetKey,
    billingDetailsRef,
    insuranceList,
    hasSelectedService,
    insuranceSelectHandler,
    selectedInsurance,
    selectedCorporate,
    corporateSelectOption,
    corporateSelectHandler,
    selectedCorporateError,
    doctorRef,
    selectedDoctor,
    doctorSelectOption,
    doctorSelectHandler,
    selectDoctorError,
    inputFieldHandler,
    expiryDateChangeHandler,
    referralDateChangeHandler,
    selectedReferDoctor,
    referDoctorSelectOption,
    referDoctorSelectHandler,
    referDoctorPopUpHandler,
    categoryList,
    categorySelectHandler,
    selectedSubCategory,
    subCategorySelectOption,
    subCategorySelectHandler,
    selectedSubSubCategory,
    subSubCategorySelectOption,
    subSubCategorySelectHandler,
    serviceInputRef,
    searchTerm,
    serviceItemHandler,
    serviceInputKeyDownHandler,
    showPopup,
    serviceNameList,
    activeServiceIndex,
    setActiveServiceIndex,
    selectedServiceHandler,
    serviceDataTableItem,
    showDuplicateError,
    serviceValidationError,
    deleteHandler,
    rateChangeHandler,
    discountPercentageChangeHandler,
    discountChangeHandler,
    urgentChangeHandler,
    isPackageService,
    packagePopupHandler,
    servicePopupHandler,
    getPerformingDoctorOptions,
    performingDoctorChangeHandler,
    setOpdBillingFormData,
    setBillingValues,
    billingValues,
    billingPaymentDetails,
    maxDiscountPercentage: data,
  };

  return (
    <div className="page-container">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 w-full">
        <div>
          <h1 className="page-heading">Patient OPD Billing</h1>

          <nav className="helper-text flex items-center gap-1">
            <NavLink to="/dashboard">Home</NavLink>
            <span>»</span>
            <span>Patient OPD Billing</span>
          </nav>
        </div>

        <div className="flex flex-col lg:flex-row md:flex-row items-center gap-2">
          <div className="mr-20">
            <UhidGlobalSearch
              onPatientSelect={handleUhidPatientSelect}
              resetKey={formResetKey}
              className="mt-1"
            />
          </div>

          <button className="save-btn">Map PRO Patient</button>
          <button className="save-btn">Order Set</button>
          <button className="save-btn">Billing Details</button>
          <button className="save-btn" onClick={SearchOldPatientHandler}>
            Search Old Patient
          </button>
        </div>
      </div>

      {patientSummary && (
        <div className="flex flex-col md:flex-row lg:flex-row gap-10 card w-full mb-1">
          <div className="flex flex-row">
            <h1 className="name-header ml-2">UHID :</h1>
            <span>{patientSummary.uhid}</span>
          </div>

          <div className="flex flex-row">
            <h1 className="name-header ml-2">Patient Name :</h1>
            <span>{patientSummary.patientName}</span>
          </div>

          <div className="flex flex-row">
            <h1 className="name-header ml-2">Age / Sex :</h1>
            <span>{patientSummary.ageSex}</span>
          </div>

          <div className="flex flex-row">
            <h1 className="name-header ml-2">Contact No :</h1>
            <span>{patientSummary.contactNumber}</span>
          </div>
        </div>
      )}

      <div className="tab-card rounded-lg mb-1">
        <button
          type="button"
          onClick={() => setActiveTab(OPDBillingTabName.PATIENT_DETAILS)}
          className={`tab-btn transition rounded ${
            patientTabError
              ? "border-2 input-field-error"
              : activeTab === OPDBillingTabName.PATIENT_DETAILS
                ? "tab-btn-active"
                : "tab-btn-inactive"
          }`}
        >
          {OPDBillingTabName.PATIENT_DETAILS}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(OPDBillingTabName.OPD_BILLING)}
          className={`tab-btn transition ${
            activeTab === OPDBillingTabName.OPD_BILLING ? "tab-btn-active" : "tab-btn-inactive"
          }`}
        >
          {OPDBillingTabName.OPD_BILLING}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(OPDBillingTabName.OPD_DOCUMENT)}
          className={`tab-btn transition ${
            documentTabError
              ? "border-2 input-field-error"
              : activeTab === OPDBillingTabName.OPD_DOCUMENT
                ? "tab-btn-active"
                : "tab-btn-inactive"
          }`}
        >
          {OPDBillingTabName.OPD_DOCUMENT}
        </button>
      </div>

      <div className={activeTab === OPDBillingTabName.PATIENT_DETAILS ? "" : "hidden"}>
        <PatientData
          key={`patient-data-${formResetKey}`}
          ref={patientDataRef}
          selectedPatientId={resolvedPatientId}
          showRegistrationButton={showRegistrationButton}
          onPayloadChange={setPatientRegistrationDetails}
          onPatientLoaded={handlePatientLoadedFromUhid}
        />
      </div>

      <div className={activeTab === OPDBillingTabName.OPD_BILLING ? "" : "hidden"}>
        <OpdBillingSection {...billingSectionProps} />
      </div>

      <div className={activeTab === OPDBillingTabName.OPD_DOCUMENT ? "" : "hidden"}>
        <IpdOpdDocument ref={ipdOpdDocumentRef} type={IpdOpdTypeName.OPD} />
      </div>

      <Buttons onButtonClick={buttonClickHandler} saveLabel={saveButtonLabel} />

      {!!loading && <CustomLoader isLoading={loading} />}

      {renderSearchPatientPopup && (
        <SearchPatientPopup
          isOpen={openSearchPatientPopup}
          onClose={closeSearchPatientHandler}
          showTable={showTable}
          setShowTable={setShowTable}
          onSelectPatient={handleSelectPatient}
          selectionErrorMessage={searchPatientError}
        />
      )}

      {/* refer doctor popup */}
      {!!renderReferDoctorPopup && (
        <ReferDoctorPopup
          isOpen={openReferDoctorPopup}
          onClose={closeReferDoctorHandler}
          data={selectedReferDoctor}
          refreshDoctor={getReferDoctor}
        />
      )}

      {/* collect on device popup */}

      {!!renderCollectOnDevice && (
        <CollectOnDevice
          isOpen={openCollectOnDevice}
          onClose={closeCollectOnDeviceHandler}
          totalAmount={collectOnDeviceAmount}
        />
      )}

      {/* package popup */}
      {!!renderPackagePopup && (
        <PackagePopup
          isOpen={openPackagePopup}
          onClose={closePackageHandler}
          packageId={selectedPackage}
          serviceId={selectedServiceId}
          patientDetails={patientRegistrationDetails}
        />
      )}

      {/* hidden printable templates */}
      <div style={{ visibility: "hidden", position: "absolute", top: 0 }}>
        {patientReceiptDetails && patientReceiptDetails.length > 0 && (
          <OpdDetailsBills
            data={patientReceiptDetails}
            printOnMount={false}
            paymentModeList={paymentModeList}
            paidAmt={totalPaidAmount}
          />
        )}
        <div id="opd-card-print-wrapper">
          <OpdCard patient={opdCardDetails ?? undefined} />
        </div>
      </div>

      {/* duplicate service popup */}
      {!!renderDuplicateServicePopup && (
        <DuplicateServicePopup
          isOpen={openDuplicateServicePopup}
          onClose={closeDuplicateServiceHandler}
          data={duplicateData}
          onButtonClick={prescribeButtonHandler}
        />
      )}

      {/* due amount popup */}
      {!!renderDueAmountPopup && (
        <DuesAmountPopup
          isOpen={openDueAmountPopup}
          onClose={closeDueAmountHandler}
          amount={dueAmount}
          onButtonClick={dueAmountButtonClickHandler}
        />
      )}

      {/* ipd opd pharmacy due amount */}
      {!!renderIpdOpdPharmacyPopup && (
        <IpdOpdPharmacyDueAmount
          isOpen={openIpdOpdPharmacyPopup}
          onClose={closeIpdOpdPharmacyPopup}
          amount={previousDues}
          onButtonClick={ipdOpdPharmacyPopupButtonHandler}
        />
      )}
    </div>
  );
};

export default OpdBilling;
