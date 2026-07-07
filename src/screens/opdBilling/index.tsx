import { getDoctorMaster, getPatientDataByPatientId } from "@/api/globalApiCall";
import { BillingDetailsHandle } from "@/components/BillingDetails";
import { BillingValuesItem, PaymentBillingSummary } from "@/components/BillingDetails/types";
import CustomLoader from "@/components/customLoader";
import OpdCard from "@/components/reportTemplates/OpdCard";
import OpdDetailsBills from "@/components/reportTemplates/OpdDetailsBill";
import IpdOpdDocument from "@/components/SingledrawerAndPopup/components/IpdOpdDocument";
import UhidGlobalSearch from "@/components/SingledrawerAndPopup/components/UhidGlobalSearch";
import { IpdOpdDocumentHandle } from "@/components/SingledrawerAndPopup/types";
import { resolveVisitIdFromResponse } from "@/components/SingledrawerAndPopup/uploadVisitWiseDocuments";
import { ENDPOINTS } from "@/config/defaults";
import {
  IpdOpdTypeName,
  OPD_CATEGORY_IDs,
  OPDBillingTabName,
  PageType,
  PaymentTypeValues,
  Status,
} from "@/constants/constants";
import { AuthContext } from "@/context/AuthContext";
import { BillingAmountContext } from "@/context/BillingAmountContext";
import { RoleContext } from "@/context/RoleContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useAssignBranchRight } from "@/store/useAssignBranchRight";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { formatApiValidationMessage, getApiValidationFieldErrors } from "@/utils/errorUtils";
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
import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import { SingleValue } from "react-select";
import { InsuranceItem } from "../branchMaster/types";
import { buildIpdPatientSummary } from "../ipdAdmission/helpers";
import { markOpPaymentCollectionRefreshOnReturn } from "../opPaymentCollection/utils/opPaymentCollectionStateRef";
import { normalizePatientGenderForApi } from "../patientRegistration/components/dobHelper";
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
  applyQtyChange,
  applyRateChange,
  getServiceRowRemarks,
  normalizeQty,
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
  OpdBookingDetailsResponse,
  OpdBookingItemPayload,
  OpdBookingItemResponse,
  OpdBookingSavePayload,
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
import { isDiscountRequestButtonMode } from "./utils/billingUiRules";
import { getBookingDiscountPrefillFromDetails } from "./utils/bookingDiscountPrefill";

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

const pickBookingValue = <T,>(
  source: Record<string, unknown>,
  ...keys: string[]
): T | undefined => {
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null) {
      return value as T;
    }
  }
  return undefined;
};

const getBookingItemsFromDetails = (
  booking: OpdBookingDetailsResponse | Record<string, unknown>
): OpdBookingItemResponse[] => {
  const items =
    pickBookingValue<OpdBookingItemResponse[]>(
      booking as Record<string, unknown>,
      "bookingItems",
      "BookingItems",
      "billingItems",
      "BillingItems"
    ) ?? [];
  return Array.isArray(items) ? items : [];
};

const normalizeBookingDetailsResponse = (resp: unknown): OpdBookingDetailsResponse | null => {
  if (!resp || typeof resp !== "object") return null;

  const payload = resp as Record<string, unknown>;
  const data = payload.data;

  if (Array.isArray(data)) {
    return (data[0] ?? null) as OpdBookingDetailsResponse | null;
  }

  if (data && typeof data === "object") {
    return data as OpdBookingDetailsResponse;
  }

  if ("BookingId" in payload || "bookingId" in payload) {
    return payload as OpdBookingDetailsResponse;
  }

  return null;
};

const mapBookingItemToServiceRow = (
  item: OpdBookingItemResponse,
  doctorId: number,
  doctorName: string
): ServiceBindingItem => {
  const serviceItemId = Number(item.serviceItemId ?? item.ServiceItemId ?? 0);
  const rate = Number(item.rate ?? item.Rate ?? 0);
  const qty = Number(item.qty ?? item.Qty ?? 1);
  const discountPer = Number(item.discPer ?? item.DiscPer ?? 0);
  const dis = Number(item.discAmt ?? item.DiscAmt ?? 0);
  const grossAmt = Number(item.grossAmt ?? item.GrossAmt ?? rate * qty);
  const netAmount = Number(item.netAmt ?? item.NetAmt ?? grossAmt - dis);
  const performingDoctorId = Number(
    item.performingDoctorId ?? item.PerformingDoctorId ?? item.doctorId ?? item.DoctorId ?? doctorId
  );

  return {
    serviceItemId,
    serviceName: String(item.serviceName ?? item.ServiceName ?? ""),
    code: String(item.code ?? item.serviceCode ?? item.ServiceCode ?? ""),
    categoryId: Number(item.categoryId ?? item.CategoryId ?? 0),
    subCategoryId: Number(item.subCategoryId ?? item.SubCategoryId ?? 0),
    subSubCategoryId: Number(item.subSubCategoryId ?? item.SubSubCategoryId ?? 0),
    rate,
    rateListId: Number(item.rateListId ?? item.RateListId ?? 0),
    qty,
    discountPer,
    dis,
    netAmount,
    doctorId: performingDoctorId,
    doctorName,
    isUrgent: Number(item.isUrgent ?? item.IsUrgent ?? 0),
    remarks: String(item.remarks ?? item.Remarks ?? ""),
    isRateEditable: 0,
    corporateAlias: "",
    corporateCode: "",
    validityDays: 0,
    discountReason: "",
    isNonPayable: 0,
    corporateId: 0,
    categoryTypeId: 0,
    isCorporateDiscount: 0,
    gstPer: 0,
    sampleTypeId: 0,
    reportTypeId: 0,
    doctorDepartmentIds: "",
    isRequiredSeparatePerformingDoctor: 0,
  };
};

const getBookingItemServiceApiParams = (
  booking: OpdBookingDetailsResponse | Record<string, unknown>,
  item: OpdBookingItemResponse
) => {
  const bookingRecord = booking as Record<string, unknown>;

  return {
    branchId: Number(pickBookingValue(bookingRecord, "branchId", "BranchId") ?? 1),
    corporateId: Number(pickBookingValue(bookingRecord, "corporateId", "CorporateId") ?? 1),
    doctorId: Number(
      item.doctorId ?? item.DoctorId ?? item.performingDoctorId ?? item.PerformingDoctorId ?? 0
    ),
    serviceItemId: Number(item.serviceItemId ?? item.ServiceItemId ?? 0),
    categoryId: Number(item.categoryId ?? item.CategoryId ?? 0),
    subCategoryId: Number(item.subCategoryId ?? item.SubCategoryId ?? 0),
    subSubCategoryId: Number(item.subSubCategoryId ?? item.SubSubCategoryId ?? 0),
    bedTypeId: 0,
  };
};

const mergeBookingItemPrefillIntoServiceRow = (
  apiRow: ServiceBindingItem,
  bookingItem: OpdBookingItemResponse,
  performingDoctorName: string
): ServiceBindingItem => {
  const performingDoctorId = Number(
    bookingItem.performingDoctorId ??
      bookingItem.PerformingDoctorId ??
      bookingItem.doctorId ??
      bookingItem.DoctorId ??
      apiRow.doctorId ??
      0
  );
  const requiresPerformingDoctor = Number(apiRow.isRequiredSeparatePerformingDoctor) === 1;

  return {
    ...apiRow,
    serviceName: String(
      bookingItem.serviceName ?? bookingItem.ServiceName ?? apiRow.serviceName ?? ""
    ),
    code: String(
      bookingItem.serviceCode ?? bookingItem.ServiceCode ?? bookingItem.code ?? apiRow.code ?? ""
    ),
    rate: Number(bookingItem.rate ?? bookingItem.Rate ?? apiRow.rate ?? 0),
    qty: Number(bookingItem.qty ?? bookingItem.Qty ?? apiRow.qty ?? 1),
    discountPer: Number(bookingItem.discPer ?? bookingItem.DiscPer ?? apiRow.discountPer ?? 0),
    dis: Number(bookingItem.discAmt ?? bookingItem.DiscAmt ?? apiRow.dis ?? 0),
    netAmount: Number(bookingItem.netAmt ?? bookingItem.NetAmt ?? apiRow.netAmount ?? 0),
    isUrgent: Number(bookingItem.isUrgent ?? bookingItem.IsUrgent ?? apiRow.isUrgent ?? 0),
    rateListId: Number(bookingItem.rateListId ?? bookingItem.RateListId ?? apiRow.rateListId ?? 0),
    remarks: String(bookingItem.remarks ?? bookingItem.Remarks ?? apiRow.remarks ?? ""),
    doctorId: requiresPerformingDoctor ? performingDoctorId : apiRow.doctorId,
    doctorName: requiresPerformingDoctor ? performingDoctorName : apiRow.doctorName,
  };
};

const OpdBilling = () => {
  const { loading, fetchApi } = useGlobalApi();
  const navigate = useNavigate();

  const location = useLocation();
  const locationState = (location.state ?? {}) as {
    bookingId?: number;
    tokenNo?: string;
    uhid?: string;
    patientId?: number;
    fromPaymentCollection?: boolean;
  };

  const paymentCollectionBookingId = Number(locationState.bookingId) || 0;
  const paymentCollectionPatientId = Number(locationState.patientId) || 0;
  const isPaymentCollectionMode = paymentCollectionBookingId > 0;

  const roleId = Number(useContext(RoleContext)?.roleId) ?? 0;

  const { rights: branchRights } = useAssignBranchRight();
  const isDiscountApprovalRequired =
    Number(branchRights?.IsOPDBillingDiscountApprovalRequired) === 1 ? 1 : 0;
  const isSeparateCollectionCounterEnabled =
    Number(branchRights?.IsSeparateCollectionCounterEnabled) === 1 ? 1 : 0;
  const isDiscountRequestMode = isDiscountRequestButtonMode(
    isSeparateCollectionCounterEnabled,
    isDiscountApprovalRequired
  );
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

  const [activePatientId, setActivePatientId] = useState<number | null>(() => {
    if (paymentCollectionBookingId > 0 && paymentCollectionPatientId > 0) {
      return paymentCollectionPatientId;
    }
    return null;
  });
  const [activeTab, setActiveTab] = useState<string>(OPDBillingTabName.PATIENT_DETAILS);
  const [patientTabError, setPatientTabError] = useState<boolean>(false);
  const [billingTabError, setBillingTabError] = useState<boolean>(false);
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
  const serviceDataTableItemRef = useRef<ServiceBindingItem[]>([]);
  const serviceItemRemarksRef = useRef<Record<number, string>>({});

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

  const [billingPaymentDetails, setBillingPaymentDetails] = useState<PaymentBillingSummary>({});

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

  const [previousDues, setPreviousDues] = useState<{
    opd: number | null;
    ipd: number | null;
    pharmacy: number | null;
  }>({
    opd: null,
    ipd: null,
    pharmacy: null,
  });

  const [openIpdOpdPharmacyPopup, setOpenIpdOpdPharmacy] = useState<boolean>(false);
  const [renderIpdOpdPharmacyPopup, setRenderIpdOpdPharmacy] = useState<boolean>(false);

  const [creditCopayment, setCreditCopayment] = useState<boolean>(false);

  const paymentCollectionInitRef = useRef(false);
  const paymentCollectionInitializingRef = useRef(false);
  const referDoctorListRef = useRef<ReferDoctorItem[]>([]);

  useEffect(() => {
    paymentCollectionInitRef.current = false;
    paymentCollectionInitializingRef.current = false;
  }, [paymentCollectionBookingId]);

  const getBookingDetailsByBookingId = async (bookingId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_OPD_BOOKING_DETAILS_BY_BOOKING_ID,
      {},
      { params: { bookingId } },
      { component: "OpdBilling" }
    );
    return normalizeBookingDetailsResponse(resp);
  };

  const { data: bookingDetails } = useQuery({
    queryKey: ["bookingDetailsByBookingId", paymentCollectionBookingId],
    queryFn: () => getBookingDetailsByBookingId(paymentCollectionBookingId),
    enabled: isPaymentCollectionMode && paymentCollectionBookingId > 0,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
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

  const normalizeDueAmount = (value: unknown): number => {
    const amount = Number(value ?? 0);
    return Number.isFinite(amount) ? amount : 0;
  };

  const hasAnyPreviousDue = (opd: unknown, ipd: unknown, pharmacy: unknown): boolean =>
    normalizeDueAmount(opd) > 0 || normalizeDueAmount(ipd) > 0 || normalizeDueAmount(pharmacy) > 0;

  // autoFill patient data

  useEffect(() => {
    if (!patientRegistrationDetails?.PatientId) return;
    if (isPaymentCollectionMode) return;

    const fetchPatientData = async () => {
      SetServiceDataTableItem([]);
      serviceDataTableItemRef.current = [];
      serviceItemRemarksRef.current = {};
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

      const [opdResult, ipdResult, pharmacyResult] = await Promise.all([
        getPatientBalanceOpd(resp?.uhid),
        getPatientBalanceIpd(resp?.uhid),
        getPatientBalancePharmacy(resp?.uhid),
      ]);

      const opdDue = normalizeDueAmount(opdResult);
      const ipdDue = normalizeDueAmount(ipdResult);
      const pharmacyDue = normalizeDueAmount(pharmacyResult);

      setPreviousDues({
        opd: opdDue,
        ipd: ipdDue,
        pharmacy: pharmacyDue,
      });

      const patientHasPreviousDues = hasAnyPreviousDue(opdDue, ipdDue, pharmacyDue);

      setTimeout(() => {
        if (patientHasPreviousDues) {
          setRenderIpdOpdPharmacy(true);
          setOpenIpdOpdPharmacy(true);
        } else {
          setRenderIpdOpdPharmacy(false);
          setOpenIpdOpdPharmacy(false);
          setActiveTab(OPDBillingTabName.OPD_BILLING);
          setTimeout(() => {
            serviceInputRef.current?.focus();
          }, 100);
        }
      }, 300);
    };

    void fetchPatientData();
  }, [patientRegistrationDetails?.PatientId, isPaymentCollectionMode]);

  // close ipd opd pharmacy popup
  const closeIpdOpdPharmacyPopup = useCallback(() => {
    setOpenIpdOpdPharmacy(false);
  }, []);

  // handle ipd opd pharmacy popup button click
  const ipdOpdPharmacyPopupButtonHandler = useCallback((value: string) => {
    if (value === "continue") {
      setOpenIpdOpdPharmacy(false);
      setActiveTab(OPDBillingTabName.OPD_BILLING);
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
  const resolveServiceRemarks = (
    row: ServiceBindingItem | Record<string, unknown>,
    serviceItemId?: number
  ) => {
    const fromRow = getServiceRowRemarks(row);
    if (fromRow) return fromRow;

    const id = Number(serviceItemId ?? (row as ServiceBindingItem)?.serviceItemId ?? 0);
    return id > 0 ? String(serviceItemRemarksRef.current[id] ?? "") : "";
  };

  const updateServiceTableItem = (
    updater: ServiceBindingItem[] | ((prev: ServiceBindingItem[]) => ServiceBindingItem[])
  ) => {
    SetServiceDataTableItem(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      serviceDataTableItemRef.current = next;
      next.forEach(item => {
        const remarks = resolveServiceRemarks(item, item.serviceItemId);
        if (remarks && item.serviceItemId) {
          serviceItemRemarksRef.current[item.serviceItemId] = remarks;
        }
      });
      return next;
    });
  };

  useEffect(() => {
    serviceDataTableItemRef.current = serviceDataTableItem;
  }, [serviceDataTableItem]);

  const buildServiceRowFromApi = (
    apiData: ServiceBindingItem | Record<string, unknown> | null | undefined,
    overrides?: { doctorId?: number; doctorName?: string; remarks?: string }
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
      remarks: String(overrides?.remarks ?? getServiceRowRemarks(data)),
    };
  };

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

  const performingDoctorChangeHandler = (rowIndex: number, doctorId: number) => {
    const row = serviceDataTableItem[rowIndex];
    if (!row) {
      return;
    }

    if (!doctorId) {
      updateServiceTableItem(prev =>
        prev.map((item, index) =>
          index === rowIndex ? { ...item, doctorId: 0, doctorName: "" } : item
        )
      );
      setServiceValidationError("");
      return;
    }

    const options = getPerformingDoctorOptions(row?.doctorDepartmentIds);
    const selected = options.find(option => Number(option.value) === doctorId);

    updateServiceTableItem(prev =>
      prev.map((item, index) =>
        index === rowIndex
          ? {
              ...item,
              doctorId,
              doctorName: selected?.label ?? "",
            }
          : item
      )
    );
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

  const validateServiceDoctors = (): boolean =>
    validatePerformingDoctors() && validateBillingDoctorForServices();

  // Detects a discount applied either overall on the bill or service-wise.
  const hasBillingDiscount = () =>
    Number(billingValues?.totalDiscAmtOnBill ?? opdBillingFormData.totalDiscAmtOnBill ?? 0) > 0 ||
    Number(billingValues?.totalDiscPerOnBill ?? opdBillingFormData.totalDiscPerOnBill ?? 0) > 0 ||
    Number(billingPaymentDetails?.totalDiscAmtOnBill ?? 0) > 0 ||
    Number(billingPaymentDetails?.totalDiscPerOnBill ?? 0) > 0 ||
    serviceDataTableItem.some(item => {
      const dis = Number(item?.dis) || 0;
      const discPer = Number(item?.discountPer) || 0;
      return dis > 0 || discPer > 0;
    });

  const validateBillingDiscountBeforeSave = (): boolean => {
    if (!hasBillingDiscount()) {
      setBillingTabError(false);
      return true;
    }

    const isDiscountValid = billingDetailsRef.current?.validateDiscountFields?.() ?? true;
    if (!isDiscountValid) {
      setBillingTabError(true);
      setActiveTab(OPDBillingTabName.OPD_BILLING);
      showWarning("Please fill Discount Approved By, Discount Reason and Remark");
      return false;
    }

    setBillingTabError(false);
    return true;
  };

  useEffect(() => {
    if (paymentCollectionInitializingRef.current) return;

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

  const resolvePerformingDoctorId = (row: ServiceBindingItem | PackagePayloadItem): number =>
    Number(row?.doctorId) || 0;

  const mapServiceToOpdBillingItem = (s: ServiceBindingItem): OpdBillingItemPayload => {
    const qty = [1, 3, 11].includes(Number(s?.categoryTypeId)) ? 1 : normalizeQty(s?.qty);
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
      performingDoctorId: resolvePerformingDoctorId(s),
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
      remarks: resolveServiceRemarks(s, s?.serviceItemId),
    };
  };

  const mapServiceToOpdBookingItem = (s: ServiceBindingItem): OpdBookingItemPayload => {
    const qty = [1, 3, 11].includes(Number(s?.categoryTypeId)) ? 1 : normalizeQty(s?.qty);
    const rate = Number(s?.rate) || 0;
    const grossAmt = qty * rate;
    const discPer = Number(s?.discountPer) || 0;
    const discAmt = Number(s?.dis) || (grossAmt * discPer) / 100;
    const netAmt = Number(s?.netAmount) || Number((grossAmt - discAmt).toFixed(2));

    return {
      serviceItemId: s?.serviceItemId || 0,
      serviceName: s?.serviceName || "",
      code: s?.code || "",
      discAmt,
      discPer,
      doctorId: Number(s?.doctorId) || 0,
      grossAmt,
      isUrgent: Number(s?.isUrgent) || 0,
      netAmt,
      qty,
      rate,
      rateListId: resolveRateListIdForRow(s),
      subSubCategoryId: s?.subSubCategoryId || 0,
      remarks: resolveServiceRemarks(s, s?.serviceItemId),
      performingDoctorId: resolvePerformingDoctorId(s),
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
    performingDoctorId: resolvePerformingDoctorId(item),
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
    remarks: resolveServiceRemarks(item, item?.serviceItemId),
  });

  const mapPackageToOpdBookingItem = (item: PackagePayloadItem): OpdBookingItemPayload => ({
    serviceItemId: item?.serviceItemId || 0,
    serviceName: item?.serviceName || "",
    code: item?.code || "",
    discAmt: Number(item?.discAmt) || 0,
    discPer: Number(item?.discPer) || 0,
    doctorId: Number(item?.doctorId) || 0,
    grossAmt: Number(item?.grossAmt) || 0,
    isUrgent: Number(item?.isUrgent) || 0,
    netAmt: Number(item?.netAmt) || 0,
    qty: Number(item?.qty) || 1,
    rate: Number(item?.rate) || 0,
    rateListId: Number(item?.rateListId) || corporateOpdRateListIds[0] || 0,
    subSubCategoryId: item?.subSubCategoryId || 0,
    remarks: resolveServiceRemarks(item, item?.serviceItemId),
  });

  const createBillingItemsPayload = (): OpdBillingItemPayload[] => {
    const tableItems = serviceDataTableItemRef.current.map(mapServiceToOpdBillingItem);
    const packageItems = (packagePayload ?? []).map(mapPackageToBillingItem);
    return [...tableItems, ...packageItems];
  };

  const createBillingItemsPayloadForOpdBooking = (): OpdBookingItemPayload[] => {
    const tableItems = serviceDataTableItemRef.current.map(mapServiceToOpdBookingItem);
    const packageItems = (packagePayload ?? []).map(mapPackageToOpdBookingItem);
    return [...tableItems, ...packageItems];
  };

  // visit details payload for opd billing
  const buildVisitDetailsPayloadForOpdBilling = (
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
    roleId: roleId,
    corporateId: Number(opdBillingFormData.corporateId ?? selectedCorporate?.value ?? 0) || 0,
    referDoctorId: Number(opdBillingFormData.referDoctorId ?? selectedReferDoctor?.value ?? 0) || 0,
    doctorId: Number(selectedDoctor?.value ?? 0) || 0,
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
    discountReason: String(
      billingValues?.discountReason ?? opdBillingFormData.discountReason ?? ""
    ),
    uniqueId: opdBillingFormData.uniqueId ?? "",
    mlc: opdBillingFormData.mlc ?? "",
    pi: opdBillingFormData.pi ?? "",
    remarks: opdBillingFormData.remarks ?? "",
    remark: "",
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

  // visit details payload for opd booking
  const buildVisitDetailsPayloadForOpdBooking = (patientId: number, branchId: number) => ({
    patientId,
    branchId,
    insuranceCompanyId:
      Number(opdBillingFormData.insuranceCompanyId ?? selectedInsurance ?? 0) || 0,
    cardHolder: opdBillingFormData.cardHolder ?? "",
    corporateId: Number(opdBillingFormData.corporateId ?? selectedCorporate?.value ?? 0) || 0,
    discountApprovedID:
      Number(billingValues?.discApprovedById ?? opdBillingFormData.discApprovedById ?? 0) || 0,
    discountApprovedName: String(billingValues?.discApprovedName ?? ""),
    discountReason: String(
      billingValues?.discountReason ?? opdBillingFormData.discountReason ?? ""
    ),
    isDiscountApprovalRequired:
      isDiscountApprovalRequired && Number(billingValues?.totalDiscPerOnBill ?? 0) > 0 ? 1 : 0,
    expiryDate: opdBillingFormData.expiryDate ?? "",
    grossBillAmount:
      Number(billingValues?.grossBillAmount ?? opdBillingFormData.grossBillAmount) || 0,
    netAmount: Number(billingValues?.netAmount ?? opdBillingFormData.netAmount) || 0,
    policyCardNo: opdBillingFormData.policyCardNo ?? "",
    policyNo: opdBillingFormData.policyNo ?? "",
    referalDate: opdBillingFormData.referalDate ?? "",
    referalNo: opdBillingFormData.referalNo ?? "",
    referDoctorId: Number(opdBillingFormData.referDoctorId ?? selectedReferDoctor?.value ?? 0) || 0,
    remark: String(billingValues?.remarks ?? opdBillingFormData.remarks ?? ""),
    roleId: roleId,
    roundOff: Number(billingValues?.roundOff ?? opdBillingFormData.roundOff) || 0,
    totalDiscAmtOnBill:
      Number(billingValues?.totalDiscAmtOnBill ?? opdBillingFormData.totalDiscAmtOnBill) || 0,
    totalDiscPerOnBill:
      Number(billingValues?.totalDiscPerOnBill ?? opdBillingFormData.totalDiscPerOnBill) || 0,
  });

  const buildSavePayloadForOpdBooking = (
    patientId: number,
    branchId: number
  ): OpdBookingSavePayload => ({
    visitDetails: buildVisitDetailsPayloadForOpdBooking(patientId, branchId),
    billingItems: createBillingItemsPayloadForOpdBooking(),
  });

  const buildSavePayloadForOpdBilling = (
    patientId: number,
    branchId: number,
    patientRecord?: Record<string, unknown> | null
  ): OpdBillingSavePayload => ({
    visitDetails: buildVisitDetailsPayloadForOpdBilling(patientId, branchId, patientRecord),
    billingItems: createBillingItemsPayload(),
  });

  const registerPatientForBilling = async () => {
    const normalizedGender = normalizePatientGenderForApi(
      patientRegistrationDetails?.Gender ?? patientRegistrationDetails?.gender
    );

    if (!normalizedGender) {
      patientDataRef.current?.applyApiFieldErrors?.({
        Gender: ["Gender must be Male, Female, or Other"],
      });
      setPatientTabError(true);
      setActiveTab(OPDBillingTabName.PATIENT_DETAILS);
      showWarning("Gender must be Male, Female, or Other");
      return null;
    }

    const formData = new FormData();
    let hasGenderField = false;

    for (const key in patientRegistrationDetails) {
      if (key === "gender") continue;

      let value = patientRegistrationDetails[key];
      if (key === "Gender") {
        value = normalizedGender;
        hasGenderField = true;
      }

      if (value === null || value === undefined || value === "") {
        continue;
      }
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    }

    if (!hasGenderField) {
      formData.append("Gender", normalizedGender);
    }

    const registrationResp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_PATIENT_MASTER,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
      { component: "Opd Billing" }
    );

    const apiFieldErrors = getApiValidationFieldErrors(registrationResp);
    if (Object.keys(apiFieldErrors).length > 0) {
      patientDataRef.current?.applyApiFieldErrors?.(apiFieldErrors);
      setPatientTabError(true);
      setActiveTab(OPDBillingTabName.PATIENT_DETAILS);
      showError(formatApiValidationMessage(registrationResp, "Failed to register patient"));
      return null;
    }

    if (!registrationResp?.data) {
      showError(formatApiValidationMessage(registrationResp, "Failed to register patient"));
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

  const applyBookingDiscountPrefill = useCallback((prefill: Partial<BillingValuesItem>) => {
    setBillingValues(prev => ({ ...prev, ...prefill }));
    setOpdBillingFormData(prev => ({
      ...prev,
      grossBillAmount: Number(prefill.grossBillAmount ?? prev.grossBillAmount ?? 0),
      totalDiscPerOnBill: Number(prefill.totalDiscPerOnBill ?? prev.totalDiscPerOnBill ?? 0),
      totalDiscAmtOnBill: Number(prefill.totalDiscAmtOnBill ?? prev.totalDiscAmtOnBill ?? 0),
      roundOff: Number(prefill.roundOff ?? prev.roundOff ?? 0),
      netAmount: Number(prefill.netAmount ?? prev.netAmount ?? 0),
      discApprovedById: Number(prefill.discApprovedById ?? prev.discApprovedById ?? 0),
      discountReason: String(prefill.discountReason ?? prev.discountReason ?? ""),
      remarks: String(prefill.remarks ?? prev.remarks ?? ""),
    }));
    setTotalBillingAmount(Number(prefill.netAmount ?? 0));
    setBillingPaymentDetails({
      grossBillAmount: Number(prefill.grossBillAmount ?? 0),
      totalDiscPerOnBill: Number(prefill.totalDiscPerOnBill ?? 0),
      totalDiscAmtOnBill: Number(prefill.totalDiscAmtOnBill ?? 0),
      netAmount: Number(prefill.netAmount ?? 0),
    });
  }, []);

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
      setActiveTab(OPDBillingTabName.PATIENT_DETAILS);
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
      setActiveTab(OPDBillingTabName.PATIENT_DETAILS);
      return true;
    },
    [bindPatientToRegistration]
  );

  const handlePatientLoadedFromUhid = useCallback(() => {
    setActiveTab(OPDBillingTabName.PATIENT_DETAILS);
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
      setCreditCopayment(false);
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
    setCreditCopayment(false);

    setOpdBillingFormData(prev => ({
      ...prev,
      insuranceCompanyId: insuranceId,
    }));
  };
  // corporate list
  const getCorporateList = async (insuranceCompanyId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CORPORATE_LIST_BY_BRANCH_ID_AND_INSURANCE_COMPANY_ID,
      {},
      { params: { branchId, insuranceCompanyId } },
      { component: "OpdBilling" }
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
      setCreditCopayment(false);
      return;
    }
    setSelectedCorporate(option);

    const selected = corporateList.find(item => item.corporateId === Number(option?.value));
    if (selected?.paymentType == PaymentTypeValues.CREDIT) {
      setCreditCopayment(true);
    } else if (selected?.paymentType == PaymentTypeValues.BOTH) {
      setCreditCopayment(false);
    } else {
      setCreditCopayment(false);
    }

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
      ENDPOINTS.GET_CORPORATE_LIST_BY_BRANCH_ID_AND_INSURANCE_COMPANY_ID,
      {},
      { params: { branchId, insuranceCompanyId: selectedInsurance } },
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
    if (paymentCollectionInitializingRef.current) return;
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
  useEffect(() => {
    referDoctorListRef.current = referDoctorList;
  }, [referDoctorList]);

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

  const loadPaymentCollectionBooking = useCallback(async () => {
    if (
      !bookingDetails ||
      paymentCollectionInitRef.current ||
      paymentCollectionInitializingRef.current
    ) {
      return;
    }

    const bookingItems = getBookingItemsFromDetails(bookingDetails);
    if (!bookingItems.length) return;

    paymentCollectionInitializingRef.current = true;

    try {
      const bookingRecord = bookingDetails as Record<string, unknown>;
      const corporateId = Number(
        pickBookingValue(bookingRecord, "corporateId", "CorporateId") ?? 1
      );
      const insuranceCompanyId = Number(
        pickBookingValue(bookingRecord, "insuranceCompanyId", "InsuranceCompanyId") ?? 0
      );
      const referDoctorId = Number(
        pickBookingValue(bookingRecord, "referDoctorId", "ReferDoctorId") ?? 0
      );
      const bookingDoctorId = Number(bookingItems[0]?.doctorId ?? bookingItems[0]?.DoctorId ?? 0);

      setSelectedInsurance(insuranceCompanyId);
      if (insuranceCompanyId) {
        await getCorporateList(insuranceCompanyId);
      }

      const corporateOption =
        corporateId === defaultCorporate.value
          ? defaultCorporate
          : { value: corporateId, label: String(corporateId) };
      setSelectedCorporate(corporateOption);
      await loadCorporateOpdRateListIds(corporateId);

      let doctorOption: OptionItem | null = null;
      if (bookingDoctorId) {
        doctorOption = await getDoctorMaster(fetchApi, bookingDoctorId, "opdBilling");
        if (doctorOption?.value) {
          setSelectedDoctor(doctorOption);
        }
      }

      if (referDoctorId) {
        const referDoctor = referDoctorListRef.current.find(
          item => item.referDoctorId === referDoctorId
        );
        if (referDoctor) {
          setSelectedReferDoctor({
            value: referDoctor.referDoctorId,
            label: referDoctor.doctorName,
          });
        }
      }

      const grossBillAmount = Number(
        pickBookingValue(bookingRecord, "totalBillAmount", "TotalBillAmount") ?? 0
      );
      const totalDiscPerOnBill = Number(
        pickBookingValue(bookingRecord, "totalDiscountPerOnBill", "TotalDiscountPerOnBill") ?? 0
      );
      const totalDiscAmtOnBill = Number(
        pickBookingValue(bookingRecord, "totalDiscountAmountOnBill", "TotalDiscountAmountOnBill") ??
          0
      );
      const roundOff = Number(pickBookingValue(bookingRecord, "roundOff", "RoundOff") ?? 0);
      const netAmount = Number(
        pickBookingValue(bookingRecord, "totalPatientPayableAmount", "TotalPatientPayableAmount") ??
          0
      );

      const discountPrefill = getBookingDiscountPrefillFromDetails(bookingDetails);

      setOpdBillingFormData(prev => ({
        ...prev,
        corporateId,
        insuranceCompanyId,
        referDoctorId,
        grossBillAmount,
        totalDiscPerOnBill,
        totalDiscAmtOnBill,
        roundOff,
        netAmount,
        discApprovedById: Number(discountPrefill?.discApprovedById ?? 0),
        discountReason: String(discountPrefill?.discountReason ?? ""),
        remarks: String(discountPrefill?.remarks ?? ""),
        policyNo: String(pickBookingValue(bookingRecord, "policyNo", "PolicyNo") ?? ""),
        policyCardNo: String(pickBookingValue(bookingRecord, "policyCardNo", "PolicyCardNo") ?? ""),
        expiryDate: String(pickBookingValue(bookingRecord, "expiryDate", "ExpiryDate") ?? ""),
        cardHolder: String(pickBookingValue(bookingRecord, "cardHolder", "CardHolder") ?? ""),
        referalNo: String(pickBookingValue(bookingRecord, "referalNo", "ReferalNo") ?? ""),
        referalDate: String(pickBookingValue(bookingRecord, "referalDate", "ReferalDate") ?? ""),
      }));

      if (discountPrefill) {
        applyBookingDiscountPrefill(discountPrefill);
      }

      const doctorId = Number(doctorOption?.value ?? bookingDoctorId ?? 0);
      const doctorName = String(doctorOption?.label ?? "");
      const performingDoctorNameCache = new Map<number, string>();
      if (doctorId) {
        performingDoctorNameCache.set(doctorId, doctorName);
      }

      const resolvePerformingDoctorName = async (performingDoctorId: number): Promise<string> => {
        if (!performingDoctorId) return "";
        const cached = performingDoctorNameCache.get(performingDoctorId);
        if (cached) return cached;

        const perfDoctor = await getDoctorMaster(fetchApi, performingDoctorId, "opdBilling");
        const name = String(perfDoctor?.label ?? "");
        performingDoctorNameCache.set(performingDoctorId, name);
        return name;
      };

      const prefilledRows = bookingItems.map(item =>
        mapBookingItemToServiceRow(item, doctorId, doctorName)
      );
      prefilledRows.forEach(row => {
        if (row.remarks && row.serviceItemId) {
          serviceItemRemarksRef.current[row.serviceItemId] = row.remarks;
        }
      });

      const serviceRows = await Promise.all(
        bookingItems.map(async (item, index) => {
          const apiParams = getBookingItemServiceApiParams(bookingDetails, item);
          const baseRow =
            prefilledRows[index] ?? mapBookingItemToServiceRow(item, doctorId, doctorName);
          const performingDoctorId = apiParams.doctorId;
          const performingDoctorName = await resolvePerformingDoctorName(performingDoctorId);

          const resp = await fetchApi(
            "GET",
            ENDPOINTS.GET_SERVICE_ALL_DETAILS_FOR_OPD_BILLING,
            {},
            { params: apiParams },
            { component: "OpdBilling", silent: true }
          );

          if (!resp?.data) {
            return {
              ...baseRow,
              rateListId: resolveRateListIdForRow(baseRow),
            };
          }

          const requiresPerformingDoctor =
            Number(resp.data?.isRequiredSeparatePerformingDoctor) === 1;
          const apiRow = buildServiceRowFromApi(resp.data, {
            doctorId: requiresPerformingDoctor ? performingDoctorId : doctorId,
            doctorName: requiresPerformingDoctor ? performingDoctorName : doctorName,
            remarks: baseRow.remarks,
          });
          const mergedRow = mergeBookingItemPrefillIntoServiceRow(
            apiRow,
            item,
            performingDoctorName
          );

          return {
            ...mergedRow,
            rateListId: resolveRateListIdForRow(mergedRow),
          };
        })
      );

      await Promise.all(
        serviceRows.map(row =>
          Number(row.isRequiredSeparatePerformingDoctor) === 1 && row.doctorDepartmentIds
            ? loadPerformingDoctorsForDepartments(row.doctorDepartmentIds)
            : Promise.resolve()
        )
      );

      updateServiceTableItem(serviceRows);

      if (discountPrefill) {
        applyBookingDiscountPrefill(discountPrefill);
      }

      setActiveTab(OPDBillingTabName.OPD_BILLING);
      paymentCollectionInitRef.current = true;
    } catch (error) {
      paymentCollectionInitRef.current = false;
      console.error("Failed to load payment collection booking:", error);
      showError("Failed to load booking services. Please try again.");
    } finally {
      paymentCollectionInitializingRef.current = false;
    }
  }, [
    bookingDetails,
    loadCorporateOpdRateListIds,
    loadPerformingDoctorsForDepartments,
    resolveRateListIdForRow,
    updateServiceTableItem,
    applyBookingDiscountPrefill,
  ]);

  useEffect(() => {
    if (!isPaymentCollectionMode || !bookingDetails) return;
    if (paymentCollectionInitRef.current) return;

    const loadedPatientId = Number(
      patientRegistrationDetails?.PatientId ?? patientRegistrationDetails?.patientId ?? 0
    );
    if (!loadedPatientId || loadedPatientId !== paymentCollectionPatientId) return;

    const referDoctorId = Number(
      pickBookingValue(
        bookingDetails as Record<string, unknown>,
        "referDoctorId",
        "ReferDoctorId"
      ) ?? 0
    );
    if (referDoctorId > 0 && referDoctorList.length === 0) return;

    void loadPaymentCollectionBooking();
  }, [
    isPaymentCollectionMode,
    bookingDetails,
    patientRegistrationDetails?.PatientId,
    patientRegistrationDetails?.patientId,
    paymentCollectionPatientId,
    referDoctorList.length,
    loadPaymentCollectionBooking,
  ]);

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
        remarks: "",
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
          branchId,
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
          branchId,
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
      showWarning("Service is already added, Please select another service");
      setShowDuplicateError("Service is already added, Please select another service");
      setSearchTerm("");
      setTimeout(() => serviceInputRef.current?.focus(), 0);
      return;
    }

    setShowDuplicateError("");
    const serviceRow = finalizeServiceRow(resp?.data);
    const updatedServices = [...serviceDataTableItem, serviceRow];

    if (serviceRow?.categoryTypeId === 11) {
      getTestPackages(Number(serviceRow?.serviceItemId));
    }
    SetServiceDataTableItem(updatedServices);
    setSearchTerm("");
    setActiveServiceIndex(0);
    setTimeout(() => {
      calculateAndUpdateBillingDetails(updatedServices);
      serviceInputRef.current?.focus();
    }, 0);
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
  const calculateAndUpdateBillingDetails = useCallback(
    (items: ServiceBindingItem[]) => {
      if (!items || items.length === 0) {
        if (isPaymentCollectionMode && bookingDetails) {
          return;
        }

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

      if (isPaymentCollectionMode && bookingDetails) {
        const discountPrefill = getBookingDiscountPrefillFromDetails(bookingDetails);
        if (discountPrefill) {
          applyBookingDiscountPrefill(discountPrefill);
          return;
        }
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
        const discPer =
          Number((item as { discountPer?: number | string | null })?.discountPer) || 0;
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
    },
    [applyBookingDiscountPrefill, bookingDetails, isPaymentCollectionMode]
  );

  // Recalculate billing when service items change
  useEffect(() => {
    if (serviceDataTableItem && serviceDataTableItem.length > 0) {
      calculateAndUpdateBillingDetails(serviceDataTableItem);
    } else {
      calculateAndUpdateBillingDetails([]);
    }
  }, [calculateAndUpdateBillingDetails, serviceDataTableItem]);

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

  const qtyChangeHandler = (rowIndex: number, nextQtyInput: number | string) => {
    const row = serviceDataTableItem[rowIndex];
    if ([1, 3, 11].includes(Number(row?.categoryTypeId))) return;

    const nextQty = normalizeQty(String(nextQtyInput).replace(/\D/g, ""));

    SetServiceDataTableItem(prev => {
      const updated = applyQtyChange(prev, rowIndex, nextQty);
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

  // remarks change handler
  const remarksChangeHandler = (e: ChangeEvent<HTMLInputElement>, rowIndex: number) => {
    const value = e.target.value;
    updateServiceTableItem(prev =>
      prev.map((row, index) => {
        if (index !== rowIndex) return row;
        if (row.serviceItemId) {
          serviceItemRemarksRef.current[row.serviceItemId] = value;
        }
        return { ...row, remarks: value };
      })
    );
  };

  // urgent change handler
  const urgentChangeHandler = (e: ChangeEvent<HTMLInputElement>, rowIndex: number) => {
    const checked = e.target.checked ? 1 : 0;

    SetServiceDataTableItem(prev => {
      const selectedRow = prev[rowIndex];

      //  Only package category controls global urgent
      if (Number(selectedRow?.categoryTypeId) === 11) {
        setIsPackageUrgent(checked);
      }

      return prev.map((row, index) => (index === rowIndex ? { ...row, isUrgent: checked } : row));
    });
  };

  // delete service handler
  const deleteHandler = (rowIndex: number) => {
    const removedItem = serviceDataTableItem[rowIndex];
    if (removedItem?.serviceItemId) {
      delete serviceItemRemarksRef.current[removedItem.serviceItemId];
    }

    const updatedItems = serviceDataTableItem.filter((_, index) => index !== rowIndex);
    serviceDataTableItemRef.current = updatedItems;
    SetServiceDataTableItem(updatedItems);
    setShowDuplicateError("");
    setIsPackageUrgent(0);
    calculateAndUpdateBillingDetails(updatedItems);
  };

  // refer doctor popup handler
  const referDoctorPopUpHandler = () => {
    setRenderReferDoctorPopup(true);
    setTimeout(() => setOpenReferDoctorPopup(true), 0);
  };

  const closeReferDoctorHandler = useCallback(() => {
    setOpenReferDoctorPopup(false);
    setTimeout(() => {
      setRenderReferDoctorPopup(false);
    }, 300);
  }, []);

  // Reset form to initial state
  const resetForm = () => {
    paymentCollectionInitRef.current = false;
    paymentCollectionInitializingRef.current = false;
    billingDetailsRef.current?.reset?.();

    // Reset patient registration
    setPatientRegistrationDetails({});

    // Reset insurance and corporate
    setSelectedInsurance(0);
    setCorporateList([]);
    setSelectedCorporate(defaultCorporate);
    setSelectedCorporateError("");
    setCreditCopayment(false);

    // Reset doctor
    setSelectedDoctor(null);
    setSelectDoctorError("");

    // Reset refer doctor
    setSelectedReferDoctor(null);

    // Reset services
    SetServiceDataTableItem([]);
    serviceDataTableItemRef.current = [];
    serviceItemRemarksRef.current = {};
    SetServiceItemList([]);
    setSearchTerm("");
    setShowPopup(false);
    setShowDuplicateError("");
    setServiceValidationError("");
    setPerformingDoctorsCache({});

    // Reset category and subcategories
    setSelectedCategory("1, 3, 4, 5, 8, 11");
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
      discApprovedName: "",
      discountReason: "",
      remarks: "",
    });

    // Reset other states
    setIsBillingDiscount(0);
    setActivePatientId(null);
    setActiveTab(OPDBillingTabName.PATIENT_DETAILS);
    setPatientTabError(false);
    setBillingTabError(false);
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
    setRenderDueAmountPopup(false);
    setOpenDueAmountPopup(false);
    setDueAmount(0);
    setRenderIpdOpdPharmacy(false);
    setOpenIpdOpdPharmacy(false);
    setPreviousDues({ opd: null, ipd: null, pharmacy: null });
    setCanProceedBilling(false);

    // Force re-mount children with internal form state (PatientData + BillingDetails).
    setFormResetKey(prev => prev + 1);
  };

  const resetFormAndClearNavigation = (fromPaymentCollection = false) => {
    resetForm();

    if (fromPaymentCollection) {
      markOpPaymentCollectionRefreshOnReturn();
      navigate("/op-payment-collection", { replace: true });
      return;
    }

    navigate("/opd-billing", { replace: true, state: null });
  };

  const resolveBookingIdFromSaveResponse = (
    responseData: Record<string, unknown> | null | undefined,
    fallbackBookingId: number
  ): number => Number(responseData?.bookingId ?? responseData?.BookingId ?? fallbackBookingId) || 0;

  const fetchAndPrintOpdBillAfterSave = async (responseData: Record<string, unknown>) => {
    const ftid = Number(responseData.ftid || 0);
    const resolvedVisitId =
      resolveVisitIdFromResponse(responseData) || Number(responseData.visitId || 0);
    const receiptId = Number(responseData.receiptId || 0);
    const isDoctorAppointment = responseData?.isDoctorAppointment === true;
    const isReceipt = responseData?.isReceipt === true ? 1 : 0;

    let opdData = null;
    let receiptData: PatientReceiptItem[] = [];
    let paymentModes: PaymentModeItem[] = [];

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

    setOpdCardDetails(opdData);
    setPatientReceiptDetails(receiptData);
    setPaymentModeList(paymentModes);

    await new Promise(res => setTimeout(res, 120));

    if (isDoctorAppointment) {
      openOpdPrintInNewTab();
      return true;
    }

    if (!receiptData?.length) {
      showError("Billing saved, but receipt data is unavailable for printing.");
      return false;
    }

    openReceiptInNewTab(receiptData);
    return true;
  };

  const handlePaymentCollectionAfterSave = async (
    saveBillingResp: Record<string, unknown>,
    patientData: {
      patientId: number;
      registrationResp: Record<string, unknown>;
    },
    responseData: Record<string, unknown>
  ) => {
    const savedPatientId = Number(
      (patientData.registrationResp as { data?: { patientId?: number } })?.data?.patientId ?? 0
    );
    const visitId = resolveVisitIdFromResponse(responseData);

    if (savedPatientId > 0 && visitId > 0) {
      const documentsUploaded = await ipdOpdDocumentRef.current?.uploadDocuments(
        savedPatientId,
        visitId
      );

      if (documentsUploaded === false) {
        showWarning("Billing saved, but document upload failed");
      }
    }

    const collectedBookingId = resolveBookingIdFromSaveResponse(
      responseData,
      paymentCollectionBookingId
    );

    if (!collectedBookingId) {
      showError("Billing saved, but booking ID was not returned for payment collection.");
      return null;
    }

    const paymentCollectedResp = await fetchApi(
      "PATCH",
      ENDPOINTS.PAYMENT_COLLECTED_FOR_OPD_BOOKING,
      {},
      { params: { bookingId: collectedBookingId } },
      { component: "opdBilling" }
    );

    const paymentCollectedErrors = getApiValidationFieldErrors(paymentCollectedResp);
    if (Object.keys(paymentCollectedErrors).length > 0 || paymentCollectedResp?.result === false) {
      showError(
        formatApiValidationMessage(
          paymentCollectedResp,
          paymentCollectedResp?.message || "Failed to mark payment as collected"
        )
      );
      return null;
    }

    await showSuccess(
      paymentCollectedResp?.message ?? "Payment collected for OPD booking successfully"
    );

    await fetchAndPrintOpdBillAfterSave(responseData);

    setTimeout(() => {
      resetFormAndClearNavigation(Boolean(locationState.fromPaymentCollection));
    }, 300);

    return paymentCollectedResp;
  };

  // due button click handler
  const dueAmountButtonClickHandler = (value: string) => {
    switch (value) {
      case "continue": {
        setCanProceedBilling(true);
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
    const dueAmountValue = normalizeDueAmount(resp?.data?.[0]?.TotalBalanceAmount);

    setDueAmount(dueAmountValue);

    if (dueAmountValue > 0) {
      setRenderDueAmountPopup(true);
      setOpenDueAmountPopup(true);
    } else {
      setRenderDueAmountPopup(false);
      setOpenDueAmountPopup(false);
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
    if (value === "back") {
      if (isPaymentCollectionMode && locationState.fromPaymentCollection) {
        navigate("/op-payment-collection");
      }
      return;
    }

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
      if (isDiscountRequestMode && hasBillingDiscount()) {
        showWarning("Save is not allowed when discount is applied. Please use Request Discount.");
        return;
      }

      const isValid = await patientDataRef.current?.validateForm();

      if (!isValid) {
        setPatientTabError(true);
        setActiveTab(OPDBillingTabName.PATIENT_DETAILS);
        return;
      }

      setPatientTabError(false);

      if (!validateBillingDiscountBeforeSave()) {
        return;
      }

      await getPatientPreviousDues();
    }

    if (value === "saveAsDraft") {
      if (isDiscountRequestMode && !hasBillingDiscount()) {
        showWarning("Please apply a discount before requesting discount approval.");
        return;
      }

      const isValid = await patientDataRef.current?.validateForm();

      if (!isValid) {
        setPatientTabError(true);
        setActiveTab(OPDBillingTabName.PATIENT_DETAILS);
        return;
      }

      setPatientTabError(false);

      if (!validateBillingDiscountBeforeSave()) {
        return;
      }

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

      const completePayload = buildSavePayloadForOpdBooking(
        patientData.patientId,
        patientData.branchId
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
        showWarning("Please set rate of the service");
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

      if (!validateBillingDiscountBeforeSave()) {
        return null;
      }

      const isBillingFormValid = (await billingDetailsRef.current?.validateForm?.()) ?? true;
      if (!isBillingFormValid) {
        setBillingTabError(true);
        setActiveTab(OPDBillingTabName.OPD_BILLING);
        showWarning("Please complete required billing details");
        return null;
      }

      setBillingTabError(false);

      const patientData = await registerPatientForBilling();
      if (!patientData) {
        return;
      }

      const billingPayload = billingDetailsRef.current?.getPayload?.();
      const paymentList = Array.isArray(billingPayload?.payments)
        ? (billingPayload?.payments as Array<Record<string, unknown>>)
        : [];
      const allPaymentDetails = paymentList.map(payment => ({
        paymentModeId: Number(payment?.paymentModeId) || 0,
        paymentModeTypeId: Number(payment?.paymentModeTypeId) || 0,
        amount: Number(payment?.amount) || 0,
        bankId: Number(payment?.bankId) || 0,
        refNo: String(payment?.refNo ?? ""),
        isCopaymentReceipt: Number(payment?.isCopaymentReceipt ?? 0),
        plutusTransactionReferenceID: String(payment?.plutusTransactionReferenceID ?? ""),
        transactionLogId: String(payment?.transactionLogId ?? ""),
      }));

      const completePayload = {
        ...buildSavePayloadForOpdBilling(
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

      const responseData = (saveBillingResp?.data ?? null) as Record<string, unknown> | null;
      if (!responseData) {
        showError("Billing saved, but response data is unavailable.");
        return null;
      }

      if (isPaymentCollectionMode) {
        return handlePaymentCollectionAfterSave(saveBillingResp, patientData, responseData);
      }

      // success
      await showSuccess(saveBillingResp?.message ?? "OPD Billing saved successfully");

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
      await fetchAndPrintOpdBillAfterSave(responseData);

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
    qtyChangeHandler,
    discountPercentageChangeHandler,
    discountChangeHandler,
    remarksChangeHandler,
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
    creditCopayment,
    showPaymentMode: isPaymentCollectionMode,
    hasDiscountApplied: hasBillingDiscount(),
    bookingDetails: isPaymentCollectionMode ? (bookingDetails ?? null) : null,
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

          <button className="save-btn">Map PRO </button>
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
            billingTabError
              ? "border-2 input-field-error"
              : activeTab === OPDBillingTabName.OPD_BILLING
                ? "tab-btn-active"
                : "tab-btn-inactive"
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
        <OpdBillingSection
          {...billingSectionProps}
          creditCopayment={creditCopayment}
          isSeparateCollectionCounterEnabled={isSeparateCollectionCounterEnabled}
        />
      </div>

      <div className={activeTab === OPDBillingTabName.OPD_DOCUMENT ? "" : "hidden"}>
        <IpdOpdDocument ref={ipdOpdDocumentRef} type={IpdOpdTypeName.OPD} />
      </div>

      <Buttons
        onButtonClick={buttonClickHandler}
        pageType={PageType?.OPD_BILLING}
        hasDiscountApplied={hasBillingDiscount()}
        paymentCollectionMode={isPaymentCollectionMode}
      />

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
