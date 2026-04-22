import { getDoctorMaster, getPatientDataByPatientId } from "@/api/globalApiCall";
import BillingDetails, { BillingDetailsHandle } from "@/components/BillingDetails";
import { BillingFormValues } from "@/components/BillingDetails/types";
import CustomDateInput from "@/components/customDateInput";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { SelectStyles } from "@/components/customSelect";
import OpdCard from "@/components/reportTemplates/OpdCard";
import OpdDetailsBills from "@/components/reportTemplates/OpdDetailsBill";
import { ENDPOINTS } from "@/config/defaults";
import { OPD_CATEGORY_IDs, Status } from "@/constants/constants";
import { OpdBillingServiceTableHeader } from "@/constants/tableHeaders";
import { BillingAmountContext } from "@/context/BillingAmountContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess } from "@/utils/alert";
import { allowOnlyText } from "@/utils/inputValidationHandler";
import { ChangeEvent, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import Select, { SingleValue, StylesConfig } from "react-select";
import { InsuranceItem } from "../branchMaster/types";
import PatientData from "../patientRegistration/components/PatientData";
import SearchPatientPopup from "../patientRegistration/components/SearchPatientPopup";
import { CorporateItem, PatientDataHandle } from "../patientRegistration/types";
import Buttons from "./components/Buttons";
import CollectOnDevice from "./components/CollectOnDevice";
import {
  applyDiscountAmountChange,
  applyDiscountPercentageChange,
  applyRateChange,
} from "./components/helperFunction";
import { openOpdPrintInNewTab, openReceiptInNewTab } from "./components/OpdReceiptNewTab";
import PackagePopup from "./components/PackagePopup";
import ReferDoctorPopup from "./components/ReferDoctorPopup";
import {
  CategoryItem,
  DoctorMasterItem,
  OpdCardDetailItem,
  OptionItem,
  PatientReceiptItem,
  PaymentModeItem,
  ReferDoctorItem,
  ServiceBindingItem,
  ServiceItemList,
  SubCategoryItem,
  SubSubCategoryItem,
} from "./types";

const OpdBilling = () => {
  const { loading, error, fetchApi } = useGlobalApi();
  const { totalBillingAmount, setTotalBillingAmount } = useContext(BillingAmountContext);
  const billingDetailsRef = useRef<BillingDetailsHandle>(null);
  const patientDataRef = useRef<PatientDataHandle>(null);
  const receiptPrintWindowRef = useRef<Window | null>(null);
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

  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

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

  const [showDuplicateError, setShowDuplicateError] = useState<string>("");
  const [serviceValidationError] = useState<string>("");

  const [categoryList, setCategoryList] = useState<CategoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
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

  const [collectOnDeviceAmount, setCollectOnDeviceAmount] = useState<number>(0);
  const [finalPayloadPreview] = useState<string>("");
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

  const [packagePayload, setPackagePayload] = useState([]);

  const doctorRef = useRef<any>(null);

  // autoFill patient data

  useEffect(() => {
    if (patientRegistrationDetails?.PatientId) {
      const fetchPatientData = async () => {
        const resp = await getPatientDataByPatientId(
          fetchApi,
          Number(patientRegistrationDetails?.PatientId),
          "opdBilling"
        );

        if (!resp || Object.keys(resp).length === 0) return;

        setPatientRegistrationDetails(prev => ({
          ...prev,
          ...resp, // auto-fill
        }));

        if (resp?.doctorId) {
          const doctor = await getDoctorMaster(fetchApi, Number(resp.doctorId), "opdBilling");
          if (doctor) {
            setSelectedDoctor(doctor);
          }
        }
      };

      fetchPatientData();
    }
  }, [patientRegistrationDetails?.PatientId]);

  const [isBillingDiscount, setIsBillingDiscount] = useState<number>(0);

  //visit details payload
  const [opdBillingFormData, setOpdBillingFormData] = useState({
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
  const createBillingItemsPayload = () => {
    return serviceDataTableItem.map(s => {
      const qty = Number(s?.qty) || 1;
      const rate = Number(s?.rate) || 0;
      const grossAmt = qty * rate;

      const discPer = Number(s?.discountPer) || 0;
      const discAmt = Number(s?.dis) || (grossAmt * discPer) / 100;

      const netAmt = Number(s?.netAmount) || Number((grossAmt - discAmt).toFixed(2));

      return {
        serviceItemId: s?.serviceItemId || 0,
        serviceName: s?.serviceName || "",
        code: s?.code || "",

        categoryId: s?.categoryId || 0,
        subCategoryId: s?.subCategoryId || 0,
        subSubCategoryId: s?.subSubCategoryId || 0,

        corporateAlias: s?.corporateAlias || "",
        corporateCode: s?.corporateCode || "",

        qty,
        rate,
        grossAmt,

        discPer,
        discAmt,
        discountReason: s?.discountReason || "",

        netAmt,

        doctorId: s?.doctorId || 0,
        rateListId: s?.rateListId || 0,
        validityDays: s?.validityDays || 0,
        sampleTypeId: s?.sampleTypeId || 0,

        isNonPayable: s?.isNonPayable || 0,
        isUnderPackage: 0,
        packageId: 0,

        isUrgent: Number(s?.isUrgent) || 0,
      };
    });
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
      paidAmountFromAPI > 0 ? paidAmountFromAPI : billingValues?.netAmount || 0;

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
    const payments = billingPayload?.payments || [];

    if (payments && payments.length >= 0) {
      const totalPayment = payments.reduce((acc, curr) => acc + Number(curr?.amount || 0), 0);
      const balanceAmount = billingValues?.netAmount - totalPayment;

      setBillingValues(prev => ({
        ...prev,
        balanceAmount: Number(balanceAmount.toFixed(2)),
      }));
    }
  }, [paymentDetails]);

  // payment details payload

  const hasSelectedService = serviceDataTableItem.length > 0;

  const showRegistrationButton = false;

  const routePatientId = Number.isFinite(pId) && pId > 0 ? pId : null;
  const activePatientId = selectedPatientId ?? routePatientId;

  const SearchOldPatientHandler = () => {
    setOpenSearchPatientPopup(true);
    setRenderSearchPatientPopup(true);
  };

  // close handler
  const closeHandler = useCallback(() => {
    setOpenSearchPatientPopup(false);
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
  };

  const defaultSubCategory = { label: "All Sub Category", value: 0 };
  const defaultSubSubCategory = { label: "All Sub Category", value: 0 };

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

  // service item select handler
  const serviceItemHandler = async (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!value.trim()) {
      SetServiceItemList([]);
      setShowPopup(false);
      return;
    }
    setShowPopup(true);
  };

  // debounced api call
  useEffect(() => {
    if (!searchTerm) return;

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
      } catch (err) {
        console.error(err);
        setShowPopup(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchTerm]);

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

      const packPayload = resp.data.map((item: any) => ({
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

  // service handler
  const selectedServiceHandler = async (item: ServiceItemList) => {
    setShowPopup(false);

    if (!selectedDoctor?.value) {
      setSelectDoctorError("");
      setSelectDoctorError("Please select any one doctor");
      showError("Please select any one doctor");
      doctorRef.current?.focus();
      return;
    }
    setSelectDoctorError("");
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SERVICE_ALL_DETAILS_FOR_OPD_BILLING,
      {},
      {
        params: {
          corporateId: selectedCorporate?.value,
          doctorId: selectedDoctor?.value,
          serviceItemId: item?.serviceItemId,
          categoryId: item?.categoryId,
          subCategoryId: item?.subCategoryId,
          subSubCategoryId: item?.subSubCategoryId,
          bedTypeId: 0,
        },
      },
      { component: "OpdBilling" }
    );

    setSearchTerm("");
    const filterItem = serviceDataTableItem.find(
      s => s?.serviceItemId === resp?.data?.serviceItemId
    );
    if (filterItem) {
      setShowDuplicateError("Service is already added, Please select another service");
      return;
    }

    setShowDuplicateError("");
    const serviceRow = {
      ...resp?.data,
      doctorId: selectedDoctor?.value ?? 0,
      doctorName: selectedDoctor?.label ?? "",
    };
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
    const value = Number(e.target.value);
    if (!value) {
      return;
    }
    setSelectedCategory(value);
    getSubCategory(value);
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
      value: s?.categoryId,
    }));
  }, [subCategoryList]);

  const subCategorySelectHandler = (option: OptionItem | null) => {
    if (!option) return;
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
    SetServiceDataTableItem(prev => {
      const updated = applyDiscountAmountChange(prev, rowIndex, e.target.value);
      // Recalculate billing after discount change
      setTimeout(() => calculateAndUpdateBillingDetails(updated), 0);
      return updated;
    });
  };

  // discount % change handler
  const discountPercentageChangeHandler = (e: ChangeEvent<HTMLInputElement>, rowIndex: number) => {
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

    // Reset category and subcategories
    setSelectedCategory(0);
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
    setSelectedPatientId(null);
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
      // Validate patient registration form using PatientData validation
      const isValid = await patientDataRef.current?.validateForm();

      if (!isValid) {
        return;
      }

      // If userRegistration fails or errors internal function will show errors
      const registrationResult = await getUserRegistrationResponse();

      // If result is somehow explicitly null (handled error)
      if (registrationResult === null) {
        return;
      }
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
      // Step 2: Register patient
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
        return;
      }

      // Step 3: Fetch updated patient details
      const patientResponse = await fetchApi(
        "GET",
        ENDPOINTS.GET_PATIENT_MASTER,
        {},
        { params: { patientId: registrationResp?.data?.patientId } },
        { component: "opdBilling" }
      );

      if (!patientResponse?.data) {
        showError("Failed to fetch patient details");
        return;
      }

      // Step 4: Build complete visitDetails with all required fields
      const visitDetails = {
        patientId: registrationResp?.data?.patientId || 0,
        uhid: patientResponse?.data?.[0]?.uhid || "",
        branchId: patientResponse?.data?.[0]?.branchId || opdBillingFormData.branchId || 0,
        currentAge: String(patientResponse?.data?.[0]?.age || opdBillingFormData.currentAge || ""),
        insuranceCompanyId: opdBillingFormData.insuranceCompanyId,
        corporateId: opdBillingFormData.corporateId,
        referDoctorId: opdBillingFormData.referDoctorId,
        grossBillAmount: billingValues?.grossBillAmount,
        totalDiscPerOnBill: billingValues?.totalDiscPerOnBill,
        totalDiscAmtOnBill: billingValues?.totalDiscAmtOnBill,
        roundOff: billingValues?.roundOff,
        netAmount: billingValues?.netAmount,
        discApprovedById: billingValues?.discApprovedById,
        discountReason: billingValues?.discountReason,
        remarks: billingValues?.remarks,
        uniqueId: opdBillingFormData.uniqueId,
        mlc: opdBillingFormData.mlc,
        pi: opdBillingFormData.pi,
        remark: opdBillingFormData.remark,
        policyNo: opdBillingFormData.policyNo,
        policyCardNo: opdBillingFormData.policyCardNo,
        expiryDate: opdBillingFormData.expiryDate,
        cardHolder: opdBillingFormData.cardHolder,
        referalNo: opdBillingFormData.referalNo,
        referalDate: opdBillingFormData.referalDate,
        diagnosisId: opdBillingFormData.diagnosisId,
        proId: opdBillingFormData.proId,
        proName: opdBillingFormData.proName,
        isSendMRD: opdBillingFormData.isSendMRD,
      };

      // Step 5: Build billing items payload
      const billingItems = createBillingItemsPayload();

      if (!billingItems || billingItems.length === 0) {
        showError("Please add some services to continue");
        return;
      }

      // Step 6: Construct complete billing payload with all 4 parts including payment summary
      const billingPayload = billingDetailsRef.current?.getPayload?.();
      const allPaymentDetails = billingPayload?.payments || [];

      const completePayload = {
        visitDetails,
        billingItems: [...billingItems, ...(packagePayload || [])],
        paymentDetails: allPaymentDetails,
        isBillDiscount: isBillingDiscount,
      };

      //step 7:  save opd billing
      const saveBillingResp = await fetchApi(
        "POST",
        ENDPOINTS.SAVE_OPD_BILLING,
        completePayload,
        {},
        { component: "opdBilling" }
      );

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

      //  extract response
      const ftid = Number(responseData.ftid || 0);
      const visitId = Number(responseData.visitId || 0);
      const receiptId = Number(responseData.receiptId || 0);
      const isDoctorAppointment = responseData?.isDoctorAppointment === true;
      const isReceipt = responseData?.isReceipt === true ? 1 : 0;

      // fetch required data
      let opdData = null;
      let receiptData: any[] = [];
      let paymentModes: any[] = [];

      if (isDoctorAppointment && ftid > 0) {
        const resp = await fetchApi(
          "GET",
          ENDPOINTS.GET_OPD_CARD_DETAILS,
          {},
          { params: { ftid } },
          { component: "OpdBilling" }
        );
        opdData = resp?.data?.[0] ?? null;
      }

      const receiptResp = await fetchApi(
        "GET",
        ENDPOINTS.GET_RECEIPT_DETAILS_BY_FTID,
        {},
        { params: { ftid, isReceipt, receiptId } },
        { component: "OpdBilling" }
      );

      receiptData = receiptResp?.data ?? [];

      const paymentResp = await fetchApi(
        "GET",
        ENDPOINTS.GET_OPD_RECEIPT_LIST,
        {},
        { params: { visitNo: visitId } },
        { component: "OpdBilling" }
      );

      paymentModes = paymentResp?.data ?? [];

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
  };

  const closePackageHandler = useCallback(() => {
    setRenderPackagePopup(false);
  }, []);

  return (
    <div className="page-container">
      <div className="flex flex-col lg:flex-row md:flex-row   gap-4 items-center justify-between w-full">
        <div>
          <h1 className="page-heading">Patient OPD Billing</h1>

          <nav className="helper-text">
            <NavLink to="/dashboard" className="hover:underline">
              Home
            </NavLink>
            <span>››</span>
            <span>Patient OPD Billing</span>
          </nav>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row md:flex-row">
          <button className="save-btn">Map PRO Patient</button>

          <button className="save-btn">Order Set</button>
          <button className="save-btn">Billing Details</button>
          <button className="save-btn">Back Page</button>
          <button className="save-btn" onClick={SearchOldPatientHandler}>
            search Old Patient
          </button>
        </div>
      </div>

      <PatientData
        key={`patient-data-${formResetKey}`}
        ref={patientDataRef}
        selectedPatientId={activePatientId}
        showRegistrationButton={showRegistrationButton}
        onPayloadChange={setPatientRegistrationDetails}
      />

      <div className="card mt-1">
        {/* corporate details */}
        <div className="form-grid-4">
          {/* insurance */}
          <InputField label="Insurance Company">
            <select
              name="insuranceCompanyId"
              onChange={insuranceSelectHandler}
              className={hasSelectedService ? "disabled-input-field" : "input-field"}
              disabled={hasSelectedService}
            >
              <option value={0}>Self</option>
              {insuranceList.map(item => (
                <option key={item?.insuranceCompanyId} value={item?.insuranceCompanyId}>
                  {item?.insuranceCompanyName}
                </option>
              ))}
            </select>
          </InputField>
          {/* corporate */}
          <InputField label="Corporate">
            <Select<OptionItem, false>
              value={selectedCorporate}
              options={corporateSelectOption}
              placeholder="Select corporate"
              isSearchable={!hasSelectedService}
              isClearable={!hasSelectedService}
              isDisabled={hasSelectedService}
              onChange={option => corporateSelectHandler(option)}
              styles={
                hasSelectedService ? undefined : (SelectStyles as StylesConfig<OptionItem, false>)
              }
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
            {!!selectedCorporateError && (
              <p className="input-field-error">{selectedCorporateError}</p>
            )}
          </InputField>
          {/* doctor */}
          <InputField label="Doctor">
            <Select<OptionItem, false>
              ref={doctorRef}
              value={selectedDoctor}
              options={doctorSelectOption}
              placeholder="Select doctor"
              isSearchable
              isClearable
              onChange={option => doctorSelectHandler(option)}
              styles={SelectStyles as StylesConfig<OptionItem, false>}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
            {!!selectDoctorError && <p className="input-field-error">{selectDoctorError}</p>}
          </InputField>

          {!!selectedInsurance && (
            <>
              {/* policy number */}
              <InputField label="Policy Number">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter policy number"
                  name="policyNo"
                  onChange={inputFieldHandler}
                  maxLength={20}
                />
              </InputField>
              {/* policy card number */}
              <InputField label="Policy Card Number">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter policy card number"
                  name="policyCardNo"
                  onChange={inputFieldHandler}
                  maxLength={20}
                />
              </InputField>
              {/* expiry date */}
              <InputField label="Expiry Date">
                <CustomDateInput
                  name="expiryDate"
                  onChange={(value: string) => expiryDateChangeHandler(value)}
                />
              </InputField>
              {/* card holder name */}
              <InputField label="Card Holder Name">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter card holder name"
                  name="cardHolder"
                  onChange={inputFieldHandler}
                  maxLength={100}
                  onInput={allowOnlyText}
                />
              </InputField>
              {/* referral number */}
              <InputField label="Referral Number">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter referral number"
                  name="referalNo"
                  onChange={inputFieldHandler}
                  maxLength={100}
                />
              </InputField>
              {/* referral date */}
              <InputField label="Referal Date">
                <CustomDateInput
                  name="referalDate"
                  onChange={(value: string) => referralDateChangeHandler(value)}
                />
              </InputField>
            </>
          )}
        </div>

        {/* category & details */}
        <div className="flex flex-col md:flex-row gap-4 w-full">
          {/* left  side */}
          <div className="w-full md:w-1/3 flex flex-col gap-2">
            <InputField label="Referred By">
              <div className="flex gap-2 items-center">
                <Select<OptionItem, false>
                  value={selectedReferDoctor}
                  options={referDoctorSelectOption}
                  placeholder="Select referred doctor"
                  isSearchable
                  isClearable
                  onChange={option => referDoctorSelectHandler(option)}
                  styles={SelectStyles as StylesConfig<OptionItem, false>}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
                <button onClick={referDoctorPopUpHandler}>
                  <i className="fa-solid fa-circle-plus fa-xl active:scale-95"></i>
                </button>
              </div>
            </InputField>

            <InputField>
              <select className="input-field" onChange={categorySelectHandler}>
                <option>All category</option>
                {categoryList.map(c => (
                  <option key={c?.categoryId} value={c?.categoryId}>
                    {c?.categoryName}
                  </option>
                ))}
              </select>
            </InputField>

            <InputField>
              <Select<OptionItem, false>
                value={selectedSubCategory}
                options={subCategorySelectOption}
                placeholder="Select sub category"
                isSearchable
                isClearable
                onChange={option => subCategorySelectHandler(option)}
                styles={SelectStyles as StylesConfig<OptionItem, false>}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </InputField>

            <InputField>
              <Select<OptionItem, false>
                value={selectedSubSubCategory}
                options={subSubCategorySelectOption}
                placeholder="Select sub sub category"
                isSearchable
                isClearable
                onChange={option => subSubCategorySelectHandler(option)}
                styles={SelectStyles as StylesConfig<OptionItem, false>}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </InputField>

            <div>
              <InputField>
                <div className="relative w-full">
                  <input
                    className="input-field"
                    placeholder="Type to search services"
                    value={searchTerm}
                    onChange={serviceItemHandler}
                  />

                  {showPopup && serviceNameList?.length > 0 && (
                    <div className="absolute top-full left-0  w-full bg-white border border-gray-300 rounded-md shadow-md z-50 max-h-60 overflow-y-auto">
                      {serviceNameList.map((s, index) => (
                        <div
                          key={index}
                          className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                          onClick={() => selectedServiceHandler(s)}
                        >
                          {s?.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </InputField>
              <div className="flex flex-row gap-2 justify-center items-center">
                <button className="save-btn text-sm">Investigation</button>
                <button className="save-btn text-sm">Consultation</button>
              </div>
            </div>
          </div>

          {/* table */}
          <div className="flex flex-col md:flex-row gap-4 w-full">
            {/* RIGHT PANEL */}
            <div className=" w-full ">
              {/* TOP STATUS LABELS */}
              <div className="flex flex-wrap items-center gap-6 px-3 py-2 text-md justify-between">
                <div className="flex items-center gap-1 text-orange-500">
                  <span className="w-3 h-3 rounded-full bg-orange-400"></span>
                  Rate Not Set
                </div>

                <div className="flex items-center gap-1 text-blue-500">
                  <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                  Corporate Non-Payable
                </div>

                <div className="flex items-center gap-1 text-gray-500">
                  <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                  Corporate Wise Discount
                </div>

                <div className="flex items-center gap-1 text-pink-400">
                  <span className="w-3 h-3 rounded-full bg-pink-300"></span>
                  Privileged Card Discount
                  <span className="text-red-500 ml-1">ⓘ</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="table-container ">
                  <div className="table-scroll-wrapper ">
                    <div className="table-size lg:min-h-80 lg:max-h-80 lg:max-w-260">
                      <table className="base-table ">
                        <thead className="table-head">
                          <tr>
                            {OpdBillingServiceTableHeader.map((h, index) => (
                              <th key={index} className="table-th ">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody>
                          {serviceDataTableItem?.length === 0 && (
                            <tr>
                              <td
                                colSpan={OpdBillingServiceTableHeader.length}
                                className="table-empty"
                              >
                                No records found
                              </td>
                            </tr>
                          )}

                          {serviceDataTableItem.map((item, idx) => (
                            <tr key={idx} className="table-row">
                              <td className="table-td ">
                                <button type="button" onClick={() => deleteHandler(idx)}>
                                  <i className="fa-solid fa-trash icon-color-delete cursor-pointer"></i>
                                </button>
                              </td>
                              <td className="table-td">{idx + 1}</td>
                              <td className="table-td wrap-break-word max-w-30">
                                <div className="flex items-center justify-between gap-2">
                                  <span>{item?.serviceName || "-"}</span>
                                  {isPackageService(item?.serviceName) && (
                                    <i
                                      className="fa-solid fa-magnifying-glass text-blue-700"
                                      title="Package service"
                                      onClick={() => packagePopupHandler(item?.serviceItemId)}
                                    ></i>
                                  )}
                                </div>
                              </td>
                              <td className="table-td">{item?.code || "-"}</td>
                              <td className="table-td wrap-break-word max-w-30">
                                {item?.doctorName || "-"}
                              </td>
                              <td className="table-td">{item?.qty ?? 1}</td>
                              <td className="table-td">
                                <input
                                  value={item?.rate ?? 0}
                                  onChange={e => rateChangeHandler(e, idx)}
                                  className={`max-w-20 max-h-8 ${
                                    item?.isRateEditable === 1
                                      ? "input-field"
                                      : "disabled-input-field"
                                  }`}
                                  disabled={item?.isRateEditable !== 1}
                                />
                              </td>
                              <td className="table-td">
                                <input
                                  className={`${
                                    item?.discountPer === 1
                                      ? "disabled-input-field max-w-20 max-h-8"
                                      : "input-field max-w-20 max-h-8"
                                  }`}
                                  value={item?.discountPer ?? 0}
                                  onChange={e => discountPercentageChangeHandler(e, idx)}
                                />
                              </td>
                              <td className="table-td">
                                <input
                                  className="input-field max-w-20 max-h-8"
                                  value={item?.dis ?? 0}
                                  onChange={e => discountChangeHandler(e, idx)}
                                />
                              </td>
                              <td className="table-td text-red-500">
                                {item?.netAmount ?? item?.rate}
                              </td>

                              <td className="table-td">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4"
                                  checked={Boolean(
                                    (item as { isUrgent?: number | string | null })?.isUrgent
                                  )}
                                  onChange={e => urgentChangeHandler(e, idx)}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                {!!showDuplicateError && <p className="input-field-error">{showDuplicateError}</p>}
                {!!serviceValidationError && (
                  <p className="input-field-error">{serviceValidationError}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* billing details */}
        <div className="payment details">
          <BillingDetails
            key={`billing-details-${formResetKey}`}
            ref={billingDetailsRef}
            setOpdBilling={setOpdBillingFormData}
            setBillingValues={setBillingValues}
            billingValues={billingValues!}
            paymentBilling={billingPaymentDetails}
          />
        </div>

        {/* buttons */}
        <Buttons onButtonClick={buttonClickHandler} />
      </div>

      {!!loading && <CustomLoader isLoading={loading} />}

      {/* search patient popup */}
      {renderSearchPatientPopup && (
        <SearchPatientPopup
          isOpen={openSearchPatientPopup}
          onClose={closeHandler}
          showTable={showTable}
          setShowTable={setShowTable}
          onSelectPatientId={setSelectedPatientId}
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
    </div>
  );
};

export default OpdBilling;

/*

{
    "packageId": 133956,
    "packageName": "Test package",
    "packageCode": "",
    "isActive": 1,
    "subSubCategoryId": 24123,
    "subCategoryId": 20867,
    "categoryId": 11,
    "startsFrom": "04-11-2025",
    "expiresOn": "30-11-2025",
    "packageServiceNameCode": ":ABG + ELECTROLYTE",
    "packageServiceName": "ABG + ELECTROLYTE",
    "packageServiceId": 126,
    "qty": 1,
    "packageServiceCategory": "Investigations",
    "packageServiceSubCategoryId": 1,
    "packageServiceSubSubCategoryId": 10,
    "packageServiceCode": "",
    "packageServiceCategoryId": 3
}

*/
