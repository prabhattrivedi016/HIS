import BillingDetails from "@/components/BillingDetails";
import { BillingDetailsHandle, BillingValuesItem } from "@/components/BillingDetails/types";
import CustomDateInput from "@/components/customDateInput";
import InputField from "@/components/customInputField";
import { SelectStyles } from "@/components/customSelect";
import CommentIconButton from "@/components/globalButtons/CommentIconButton";
import ViewIconButton from "@/components/globalButtons/ViewIconButton";
import InputFieldModal from "@/components/inputFieldModal";
import IpdBillingReceipt from "@/components/reportTemplates/IpdBillingReceipt";
import { ENDPOINTS } from "@/config/defaults";
import { RoleContext } from "@/context/RoleContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { openReceiptInNewTab } from "@/screens/opdBilling/components/OpdReceiptNewTab";
import { PaymentModeItem } from "@/screens/opdBilling/types";
import { useAssignBranchRight } from "@/store/useAssignBranchRight";
import { SelectItem } from "@/types";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Select from "react-select";
import {
  CategoryItem,
  DoctorItem,
  IpdPatientItem,
  ServiceItemList,
  ServiceTableItem,
  SubCategoryItem,
  SubSubCategoryItem,
} from "../types";
import RemarkPopup from "./RemarkPopup";
import SeparateBillButton from "./SeparateBillButton";
import ServiceViewPopup from "./ServiceViewDetails";

const IpdBillingComponent = ({ patient }: { patient: IpdPatientItem }) => {
  const { loading, fetchApi } = useGlobalApi();

  const roleId = useContext(RoleContext)?.roleId ?? 0;

  const { rights: branchRights } = useAssignBranchRight();
  const isIPDCaseBilling = Number(branchRights?.IsIPDCaseBillingRequired);
  const isPerformingDoctor = Number(branchRights?.IsPerformingDoctorEnabled);

  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number>(0);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SelectItem | null>(null);
  const [selectedSubSubCategoryId, setSelectedSubSubCategoryId] = useState<number>(0);
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState<SelectItem | null>(null);

  const currentDate = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [fromDate, setFromDate] = useState<string>(currentDate);
  const [toDate, setToDate] = useState<string>(currentDate);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [serviceNameList, setServiceNameList] = useState<ServiceItemList[]>([]);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [activeServiceIndex, setActiveServiceIndex] = useState<number>(0);
  const [serviceDataTableItem, setServiceDataTableItem] = useState<ServiceTableItem[]>([]);

  const [selectedDoctor, setSelectedDoctor] = useState<SelectItem | null>(null);

  const [openPopup, setOpenPopup] = useState<boolean>(false);
  const [renderPopup, setRenderPopup] = useState<boolean>(false);

  const [openShowRemarkPopup, setOpenShowRemarkPopup] = useState<boolean>(false);
  const [renderRemarkPopup, setRenderRemarkPopup] = useState<boolean>(false);
  const [selectedServiceRemark, setSelectedServiceRemark] = useState<ServiceTableItem | null>(null);
  const [selectedRemarkIndex, setSelectedRemarkIndex] = useState<number | null>(null);

  const [showBillingDetailsForm, setShowBillingDetailsForm] = useState<boolean>(false);
  const billingDetailsRef = useRef<BillingDetailsHandle>(null);
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

  const billingPaymentDetails = useMemo(() => {
    const grossBillAmount = serviceDataTableItem.reduce(
      (sum, item) => sum + (item.qty ?? 1) * (item.rate ?? 0),
      0
    );
    const totalDiscAmtOnBill = serviceDataTableItem.reduce((sum, item) => sum + (item.dis ?? 0), 0);
    const totalDiscPerOnBill =
      grossBillAmount > 0 ? (totalDiscAmtOnBill / grossBillAmount) * 100 : 0;
    const netAmount = Math.round(grossBillAmount - totalDiscAmtOnBill);

    return {
      grossBillAmount,
      totalDiscPerOnBill,
      totalDiscAmtOnBill,
      netAmount,
    };
  }, [serviceDataTableItem]);

  const [renderServiceViewPopup, setRenderServiceViewPopup] = useState<boolean>(false);
  const [openServiceViewPopup, setServiceViewPopup] = useState<boolean>(false);

  const [patientReceiptDetails, setPatientReceiptDetails] = useState<any[]>([]);
  const [paymentModeList, setPaymentModeList] = useState<PaymentModeItem[]>([]);
  const [totalPaidAmount, setTotalPaidAmount] = useState<number>(0);

  //   doctor
  const getDoctorByBranchId = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_MASTER_LIST_BY_BRANCH_ID,
      {},
      { params: { branchId: patient?.BranchId, isDoctorUnit: 0 } },
      { component: "IpdBillingComponent" }
    );
    return resp?.data ?? [];
  };

  const { data: doctorLists } = useQuery({
    queryKey: ["doctor-lists"],
    queryFn: getDoctorByBranchId,
    enabled: !!patient?.BranchId,
  });

  const doctorSelectOption = useMemo(() => {
    return doctorLists?.map((doctor: DoctorItem) => ({
      value: doctor.doctorId,
      label: doctor.name,
    }));
  }, [doctorLists]);

  useEffect(() => {
    if (patient && doctorSelectOption) {
      const defaultDoc = doctorSelectOption?.find(
        (doc: SelectItem) => Number(doc?.value) === Number(patient.PrimaryDoctorId)
      );

      setSelectedDoctor(defaultDoc);
    } else {
      setSelectedDoctor(null);
    }
  }, [patient?.PrimaryDoctorId, doctorSelectOption, doctorLists]);

  const handleDoctorChange = (option: { value: number; label: string } | null) => {
    setSelectedDoctor(option);
  };

  const getPerformingDoctorOptions = (doctorDepartmentIds?: string) => {
    if (!doctorLists) return [];
    if (!doctorDepartmentIds || !doctorDepartmentIds.trim()) {
      return doctorLists.map((doc: DoctorItem) => ({
        value: doc.doctorId,
        label: doc.name,
      }));
    }
    const deptIds = doctorDepartmentIds.split(",").map(id => Number(id.trim()));
    const filtered = doctorLists.filter((doc: DoctorItem) =>
      deptIds.includes(Number(doc.departmentId))
    );
    return filtered.map((doc: DoctorItem) => ({
      value: doc.doctorId,
      label: doc.name,
    }));
  };

  const performingDoctorChangeHandler = (rowIndex: number, doctorId: number) => {
    const selectedDoc = doctorLists?.find(
      (doc: DoctorItem) => Number(doc.doctorId) === Number(doctorId)
    );
    setServiceDataTableItem(prev =>
      prev.map((item, index) =>
        index === rowIndex
          ? {
              ...item,
              performingDoctorId: doctorId,
              performingDoctorName: selectedDoc ? selectedDoc.name : "",
            }
          : item
      )
    );
  };

  const urgentChangeHandler = (rowIndex: number, checked: boolean) => {
    setServiceDataTableItem(prev =>
      prev.map((item, index) =>
        index === rowIndex ? { ...item, isUrgent: checked ? 1 : 0 } : item
      )
    );
  };

  const qtyChangeHandler = (rowIndex: number, val: string) => {
    const value = Math.max(1, Number(val) || 0);
    setServiceDataTableItem(prev =>
      prev.map((item, index) => {
        if (index === rowIndex) {
          const rate = item.rate ?? 0;
          const discountPer = item.discountPer ?? 0;
          const grossAmt = rate * value;
          const dis = grossAmt * (discountPer / 100);
          const netAmount = grossAmt - dis;
          return {
            ...item,
            qty: value,
            dis: Number(dis.toFixed(2)),
            netAmount: Number(netAmount.toFixed(2)),
          };
        }
        return item;
      })
    );
  };

  const rateChangeHandler = (rowIndex: number, val: string) => {
    const value = Math.max(0, Number(val) || 0);
    setServiceDataTableItem(prev =>
      prev.map((item, index) => {
        if (index === rowIndex) {
          const qty = item.qty ?? 1;
          const discountPer = item.discountPer ?? 0;
          const grossAmt = value * qty;
          const dis = grossAmt * (discountPer / 100);
          const netAmount = grossAmt - dis;
          return {
            ...item,
            rate: value,
            dis: Number(dis.toFixed(2)),
            netAmount: Number(netAmount.toFixed(2)),
          };
        }
        return item;
      })
    );
  };

  const discountPercentageChangeHandler = (rowIndex: number, val: string) => {
    const discountPer = Math.min(100, Math.max(0, Number(val) || 0));
    setServiceDataTableItem(prev =>
      prev.map((item, index) => {
        if (index === rowIndex) {
          const qty = item.qty ?? 1;
          const rate = item.rate ?? 0;
          const grossAmt = rate * qty;
          const dis = grossAmt * (discountPer / 100);
          const netAmount = grossAmt - dis;
          return {
            ...item,
            discountPer,
            dis: Number(dis.toFixed(2)),
            netAmount: Number(netAmount.toFixed(2)),
          };
        }
        return item;
      })
    );
  };

  const discountChangeHandler = (rowIndex: number, val: string) => {
    const dis = Math.max(0, Number(val) || 0);
    setServiceDataTableItem(prev =>
      prev.map((item, index) => {
        if (index === rowIndex) {
          const qty = item.qty ?? 1;
          const rate = item.rate ?? 0;
          const grossAmt = rate * qty;
          const finalDis = Math.min(grossAmt, dis);
          const discountPer = grossAmt > 0 ? (finalDis / grossAmt) * 100 : 0;
          const netAmount = grossAmt - finalDis;
          return {
            ...item,
            discountPer: Number(discountPer.toFixed(2)),
            dis: Number(finalDis.toFixed(2)),
            netAmount: Number(netAmount.toFixed(2)),
          };
        }
        return item;
      })
    );
  };

  //   category lists
  const getCategoryLists = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CATEGORY_LIST,
      {},
      { params: { categoryTypeIds: "2,3,4,5,8,10" } },
      { component: "IpdBillingComponent" }
    );
    return resp?.data ?? [];
  };

  const { data: categoryLists = [] } = useQuery({
    queryKey: ["category-lists"],
    queryFn: getCategoryLists,
  });

  //   category change handler
  const categoryChangeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    setSelectedCategoryId(value);
    setSelectedSubCategoryId(0);
    setSelectedSubCategory(null);
    setSelectedSubSubCategoryId(0);
    setSelectedSubSubCategory(null);
  };

  //   sub category
  const getSubCategoryByCategoryId = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SUB_CATEGORY_LIST,
      {},
      { params: { categoryIds: selectedCategoryId } },
      { component: "IpdBillingComponent" }
    );
    return resp?.data ?? [];
  };

  const { data: subCategoryLists } = useQuery({
    queryKey: ["sub-category-lists", selectedCategoryId],
    queryFn: getSubCategoryByCategoryId,
    enabled: !!selectedCategoryId,
  });

  const subCategorySelectOption = useMemo(() => {
    return subCategoryLists?.map((subCategory: SubCategoryItem) => ({
      value: subCategory.subCategoryId,
      label: subCategory.subCategoryName,
    }));
  }, [subCategoryLists]);

  //   sub category select handler
  const subCategoryChangeHandler = (option: SelectItem | null) => {
    if (option) {
      setSelectedSubCategoryId(Number(option.value));
      setSelectedSubCategory(option);
    } else {
      setSelectedSubCategoryId(0);
      setSelectedSubCategory(null);
    }
    setSelectedSubSubCategoryId(0);
    setSelectedSubSubCategory(null);
  };

  //   sub sub category
  const getSubSubCategoryList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SUB_SUB_CATEGORY_LIST,
      {},
      { params: { subCategoryIds: selectedSubCategoryId } },
      { component: "IpdBillingComponent" }
    );
    return resp?.data ?? [];
  };

  const { data: subSubCategoryLists } = useQuery({
    queryKey: ["sub-sub-category-lists", selectedSubCategoryId],
    queryFn: getSubSubCategoryList,
    enabled: !!selectedSubCategoryId,
  });

  const subSubCategorySelectOption = useMemo(() => {
    return subSubCategoryLists?.map((subSubCategory: SubSubCategoryItem) => ({
      value: subSubCategory.subSubCategoryId,
      label: subSubCategory.subSubCategoryName,
    }));
  }, [subSubCategoryLists]);

  //   sub sub category select handler
  const subSubCategoryChangeHandler = (option: SelectItem | null) => {
    if (option) {
      setSelectedSubSubCategoryId(Number(option.value));
      setSelectedSubSubCategory(option);
    } else {
      setSelectedSubSubCategoryId(0);
      setSelectedSubSubCategory(null);
    }
  };

  //   service item select handler
  const serviceItemHandler = async (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!value.trim()) {
      setServiceNameList([]);
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
              categoryId: selectedCategoryId || 0,
              subCategoryId: selectedSubCategoryId || 0,
              subSubCategoryId: selectedSubSubCategoryId || 0,
              isActive: 1,
            },
          },
          { component: "IpdBillingComponent" }
        );

        setServiceNameList(resp?.data ?? []);
        setShowPopup(true);
        setActiveServiceIndex(0);
      } catch (err) {
        console.error(err);
        setShowPopup(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategoryId, selectedSubCategoryId, selectedSubSubCategoryId]);

  const serviceInputKeyDownHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

  const selectedServiceHandler = async (item: ServiceItemList) => {
    setShowPopup(false);
    setSearchTerm("");

    const isAlreadyAdded = serviceDataTableItem.some(s => s?.serviceItemId === item?.serviceItemId);
    if (isAlreadyAdded) {
      alert("Service is already added, Please select another service");
      return;
    }

    const getDatesInRange = (fromStr: string, toStr: string) => {
      if (fromStr === toStr) {
        const parts = fromStr.split("-");
        if (parts.length === 3) {
          const [year, month, day] = parts;
          return [`${day}/${month}/${year}`];
        }
        return [fromStr];
      }

      const dates: string[] = [];
      const current = new Date(fromStr);
      const end = new Date(toStr);
      current.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      while (current <= end) {
        const day = String(current.getDate()).padStart(2, "0");
        const month = String(current.getMonth() + 1).padStart(2, "0");
        const year = current.getFullYear();
        dates.push(`${day}/${month}/${year}`);
        current.setDate(current.getDate() + 1);
      }
      return dates;
    };

    const datesList = getDatesInRange(fromDate, toDate);

    try {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_SERVICE_ALL_DETAILS_FOR_OPD_BILLING,
        {},
        {
          params: {
            branchId: patient?.BranchId,
            corporateId: patient?.CorporateId || 0,
            doctorId: selectedDoctor?.value || patient?.PrimaryDoctorId || 0,
            serviceItemId: item?.serviceItemId,
            categoryId: item?.categoryId,
            subCategoryId: item?.subCategoryId,
            subSubCategoryId: item?.subSubCategoryId,
            bedTypeId: 0,
          },
        },
        { component: "IpdBillingComponent" }
      );

      if (resp?.data) {
        const data = resp.data;
        const newRows = datesList.map(dateText => ({
          rate: Number(data.rate ?? 0),
          rateListId: Number(data.rateListId ?? 0),
          isRateEditable: Number(data.isRateEditable ?? 0),
          serviceName: data.serviceName || item.name,
          code: data.code || item.code,
          corporateAlias: data.corporateAlias || "",
          corporateCode: data.corporateCode || "",
          validityDays: Number(data.validityDays ?? 0),
          discountPer: 0,
          discountReason: "",
          isNonPayable: Number(data.isNonPayable ?? 0),
          serviceItemId: item.serviceItemId,
          corporateId: patient?.CorporateId || 0,
          categoryTypeId: Number(data.categoryTypeId ?? item.categoryTypeId),
          categoryId: item.categoryId,
          subCategoryId: item.subCategoryId,
          subSubCategoryId: item.subSubCategoryId,
          isCorporateDiscount: Number(data.isCorporateDiscount ?? 0),
          gstPer: Number(data.gstPer ?? 0),
          sampleTypeId: Number(data.sampleTypeId ?? 0),
          reportTypeId: Number(data.reportTypeId ?? 0),
          doctorDepartmentIds: data.doctorDepartmentIds || "",
          isRequiredSeparatePerformingDoctor: Number(data.isRequiredSeparatePerformingDoctor ?? 0),
          doctorId: Number(selectedDoctor?.value || patient?.PrimaryDoctorId || 0),
          doctorName: selectedDoctor?.label || patient?.PrimaryDoctor || "",
          performingDoctorId: 0,
          performingDoctorName: "",
          qty: 1,
          dis: 0,
          netAmount: Number(data.rate ?? 0),
          isUrgent: 0,
          isUnderPackage: 0,
          remarks: "",
          Billing: dateText,
          labTypeId: item?.labTypeId,
        }));

        setServiceDataTableItem(prev => [...prev, ...newRows]);
      }
    } catch (error) {
      console.error("Failed to load service details:", error);
    }
  };

  const deleteHandler = (index: number) => {
    setServiceDataTableItem(prev => prev.filter((_, i) => i !== index));
  };

  const minDate = useMemo(() => {
    if (!patient?.AdmissionDate) return undefined;
    const clean = patient.AdmissionDate.replace(/\//g, "-");
    const parts = clean.split("-");
    if (parts.length >= 3) {
      const [day, month, year] = parts;
      const cleanYear = year.split(" ")[0];
      const monthMap: Record<string, string> = {
        jan: "01",
        feb: "02",
        mar: "03",
        apr: "04",
        may: "05",
        jun: "06",
        jul: "07",
        aug: "08",
        sep: "09",
        oct: "10",
        nov: "11",
        dec: "12",
      };
      const cleanMonth = monthMap[month.trim().toLowerCase()] || month.trim().padStart(2, "0");
      return `${cleanYear.trim()}-${cleanMonth}-${day.trim().padStart(2, "0")}`;
    }
    return undefined;
  }, [patient?.AdmissionDate]);

  const maxDate = useMemo(() => {
    if (
      !patient?.DischargeDate ||
      patient.DischargeDate === "--" ||
      patient.DischargeDate === "null"
    )
      return undefined;
    const clean = patient.DischargeDate.replace(/\//g, "-");
    const parts = clean.split("-");
    if (parts.length >= 3) {
      const [day, month, year] = parts;
      const cleanYear = year.split(" ")[0];
      const monthMap: Record<string, string> = {
        jan: "01",
        feb: "02",
        mar: "03",
        apr: "04",
        may: "05",
        jun: "06",
        jul: "07",
        aug: "08",
        sep: "09",
        oct: "10",
        nov: "11",
        dec: "12",
      };
      const cleanMonth = monthMap[month.trim().toLowerCase()] || month.trim().padStart(2, "0");
      return `${cleanYear.trim()}-${cleanMonth}-${day.trim().padStart(2, "0")}`;
    }
    return undefined;
  }, [patient?.DischargeDate]);

  useEffect(() => {
    let defaultDate = currentDate;
    if (maxDate && defaultDate > maxDate) {
      defaultDate = maxDate;
    }
    if (minDate && defaultDate < minDate) {
      defaultDate = minDate;
    }
    setFromDate(defaultDate);
    setToDate(defaultDate);
  }, [minDate, maxDate, currentDate]);

  const handleFromDateChange = (date: string) => {
    let finalDate = date;
    if (minDate && date < minDate) {
      finalDate = minDate;
    }
    if (maxDate && date > maxDate) {
      finalDate = maxDate;
    }
    setFromDate(finalDate);
    if (toDate && finalDate > toDate) {
      setToDate(finalDate);
    }
  };

  const handleToDateChange = (date: string) => {
    let finalDate = date;
    const effectiveMin = fromDate || minDate;
    if (effectiveMin && date < effectiveMin) {
      finalDate = effectiveMin;
    }
    if (maxDate && date > maxDate) {
      finalDate = maxDate;
    }
    setToDate(finalDate);
  };

  // create paylaod
  const buildCompletePayload = (paymentType: "savePayload" | "generateSeparateBill") => {
    const grossBillAmount = serviceDataTableItem.reduce(
      (sum, item) => sum + (item.qty ?? 1) * (item.rate ?? 0),
      0
    );
    const totalDiscAmtOnBill = serviceDataTableItem.reduce((sum, item) => sum + (item.dis ?? 0), 0);
    const totalDiscPerOnBill =
      grossBillAmount > 0 ? (totalDiscAmtOnBill / grossBillAmount) * 100 : 0;

    const totalNet = grossBillAmount - totalDiscAmtOnBill;
    const roundedNet = Math.round(totalNet);
    const roundOff = roundedNet - totalNet;

    const visitDetails = {
      patientId: Number(patient?.PatientId) || 0,
      branchId: Number(patient?.BranchId) || 0,
      roleId: roleId,
      visitId: Number(patient?.VisitId) || 0,
      corporateId: Number(patient?.CorporateId) || 0,
      grossBillAmount: Number(grossBillAmount.toFixed(2)),
      totalDiscPerOnBill: Number(totalDiscPerOnBill.toFixed(2)),
      totalDiscAmtOnBill: Number(totalDiscAmtOnBill.toFixed(2)),
      roundOff: Number(roundOff.toFixed(2)),
      netAmount: roundedNet,
      discApprovedById: 0,
      discountReason: "",
      remarks: patient?.Remarks || "",
      uniqueId: "",
      isSupplementaryBill: paymentType === "generateSeparateBill" ? 1 : 0,
    };

    const billingItems = serviceDataTableItem.map((item: ServiceTableItem) => {
      const grossAmt = (item.qty ?? 1) * (item.rate ?? 0);
      return {
        serviceItemId: item.serviceItemId,
        subSubCategoryId: item?.subSubCategoryId,
        subCategoryId: item?.subCategoryId,
        categoryId: item?.categoryId,
        categoryTypeId: item?.categoryTypeId,
        labTypeId: item?.labTypeId ?? 0,
        serviceName: item?.serviceName,
        code: item?.code,
        remarks: item?.remarks || "",
        corporateAlias: item?.corporateAlias || "",
        corporateCode: item?.corporateCode || "",
        discountReason: item?.discountReason || "",
        isNonPayable: item?.isNonPayable ?? 0,
        rateListId: item?.rateListId ?? 0,
        doctorId: item?.doctorId ?? 0,
        performingDoctorId: item?.performingDoctorId ?? 0,
        qty: item?.qty ?? 1,
        rate: item?.rate ?? 0,
        discPer: item?.discountPer ?? 0,
        discAmt: item?.dis ?? 0,
        grossAmt: Number(grossAmt.toFixed(2)),
        netAmt: item?.netAmount ?? grossAmt,
        isUrgent: item?.isUrgent ?? 0,
        sampleTypeId: item?.sampleTypeId ?? 0,
        billingDate: item?.Billing || "",
      };
    });

    const paymentDetails =
      paymentType === "savePayload"
        ? []
        : [
            {
              paymentModeId: 1, // Cash
              paymentModeTypeId: 1,
              amount: roundedNet,
              isCopaymentReceipt: 0,
              isPatientAdvanceAmount: 0,
              bankId: 0,
              refNo: "",
              plutusTransactionReferenceID: "",
              transactionLogId: "",
            },
          ];

    return {
      visitDetails,
      billingItems,
      paymentDetails,
      isBillDiscount: totalDiscAmtOnBill > 0 ? 1 : 0,
    };
  };

  // null rate checker
  const nullRateChacker = (serviceDataTableItem: ServiceTableItem[]) => {
    if (!serviceDataTableItem || serviceDataTableItem.length === 0) {
      showWarning("No billing items found");
      return false;
    }
    const nullRateItems = serviceDataTableItem.some(
      (item: ServiceTableItem) =>
        item.rate === null || item.rate === undefined || Number(item?.rate) <= 0
    );
    if (nullRateItems) {
      showWarning("Please enter valid rate for all service items.");
      return false;
    }
    return true;
  };

  /*
  {
    "visitId": 7,
    "ftid": 27,
    "receiptId": 0,
    "isReceipt": false,
    "isLabInvestigations": true
}
  */
  const fetchAndPrintIpdBillAfterSave = async (responseData: Record<string, unknown>) => {
    let receiptData: any[] = [];
    let paymentModes: PaymentModeItem[] = [];

    const promises = [
      fetchApi(
        "GET",
        ENDPOINTS.GET_RECEIPT_DETAILS_BY_FTID,
        {},
        {
          params: {
            ftid: responseData?.ftid,
            isReceipt: responseData?.isReceipt === true ? 1 : 0,
            receiptId: responseData?.receiptId,
          },
        },
        { component: "IpdBilling" }
      ),
      fetchApi(
        "GET",
        ENDPOINTS.GET_OPD_RECEIPT_LIST,
        {},
        { params: { visitNo: responseData?.visitId } },
        { component: "IpdBilling" }
      ),
    ];

    const [receiptResult, paymentResult] = await Promise.allSettled(promises);

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

    const paidAmountFromApi = paymentModes.reduce(
      (sum, item) => sum + Number(item?.Amount ?? 0),
      0
    );
    const paidAmountFromReceipt = receiptData.reduce(
      (sum, item) => sum + Number(item?.NetAmt ?? item?.NetAmount ?? 0),
      0
    );
    const paidAmount =
      paidAmountFromApi > 0
        ? paidAmountFromApi
        : paidAmountFromReceipt > 0
          ? paidAmountFromReceipt
          : Number(responseData.netAmount ?? responseData.NetAmount ?? 0);

    setPatientReceiptDetails(receiptData);
    setPaymentModeList(paymentModes);
    setTotalPaidAmount(paidAmount);

    await new Promise(res => setTimeout(res, 120));

    if (!receiptData?.length) {
      showError("Billing saved, but receipt data is unavailable for printing.");
      return false;
    }

    openReceiptInNewTab(receiptData);
    return true;
  };

  // separate bill handler
  const saveSeparateBillHandler = async () => {
    try {
      if (!nullRateChacker(serviceDataTableItem ?? [])) {
        return;
      }

      const isValid = await billingDetailsRef.current?.validateForm?.();
      if (!isValid) {
        showWarning(
          "Validation failed! Please verify payment methods and match the net bill amount."
        );
        return;
      }

      const billingPayload = billingDetailsRef.current?.getPayload?.();
      if (!billingPayload) {
        alert("Unable to fetch payload from billing details.");
        return;
      }

      const grossBillAmount = Number(billingPayload.grossBillAmount ?? 0);
      const totalDiscAmtOnBill = Number(billingPayload.totalDiscAmtOnBill ?? 0);
      const totalDiscPerOnBill = Number(billingPayload.totalDiscPerOnBill ?? 0);
      const netAmount = Number(billingPayload.netAmount ?? 0);
      const roundOff = Number(billingPayload.roundOff ?? 0);

      const visitDetails = {
        patientId: Number(patient?.PatientId) || 0,
        branchId: Number(patient?.BranchId) || 0,
        roleId: roleId,
        visitId: Number(patient?.VisitId) || 0,
        corporateId: Number(patient?.CorporateId) || 0,
        grossBillAmount: Number(grossBillAmount.toFixed(2)),
        totalDiscPerOnBill: Number(totalDiscPerOnBill.toFixed(2)),
        totalDiscAmtOnBill: Number(totalDiscAmtOnBill.toFixed(2)),
        roundOff: Number(roundOff.toFixed(2)),
        netAmount: netAmount,
        discApprovedById: Number(billingPayload.discApprovedById ?? 0),
        discountReason: String(billingPayload.discountReason ?? ""),
        remarks: String(billingPayload.remarks || patient?.Remarks || ""),
        uniqueId: "",
        isSupplementaryBill: 1,
      };

      const billingItems = serviceDataTableItem.map((item: ServiceTableItem) => {
        const grossAmt = (item.qty ?? 1) * (item.rate ?? 0);
        return {
          serviceItemId: item.serviceItemId,
          subSubCategoryId: item?.subSubCategoryId,
          subCategoryId: item?.subCategoryId,
          categoryId: item?.categoryId,
          categoryTypeId: item?.categoryTypeId,
          labTypeId: item?.labTypeId ?? 0,
          serviceName: item?.serviceName,
          code: item?.code,
          remarks: item?.remarks || "",
          corporateAlias: item?.corporateAlias || "",
          corporateCode: item?.corporateCode || "",
          discountReason: item?.discountReason || "",
          isNonPayable: item?.isNonPayable ?? 0,
          rateListId: item?.rateListId ?? 0,
          doctorId: item?.doctorId ?? 0,
          performingDoctorId: item?.performingDoctorId ?? 0,
          qty: item?.qty ?? 1,
          rate: item?.rate ?? 0,
          discPer: item?.discountPer ?? 0,
          discAmt: item?.dis ?? 0,
          grossAmt: Number(grossAmt.toFixed(2)),
          netAmt: item?.netAmount ?? grossAmt,
          isUrgent: item?.isUrgent ?? 0,
          sampleTypeId: item?.sampleTypeId ?? 0,
          billingDate: item?.Billing || "",
        };
      });

      const paymentsList = Array.isArray(billingPayload.payments) ? billingPayload.payments : [];
      const paymentDetails = paymentsList.map((payment: any) => ({
        paymentModeId: Number(payment?.paymentModeId) || 0,
        paymentModeTypeId: Number(payment?.paymentModeTypeId) || 0,
        amount: Number(payment?.amount) || 0,
        isCopaymentReceipt: Number(payment?.isCopaymentReceipt ?? 0),
        isPatientAdvanceAmount: Number(payment?.isPatientAdvanceAmount ?? 0),
        bankId: Number(payment?.bankId) || 0,
        refNo: String(payment?.refNo ?? ""),
        plutusTransactionReferenceID: String(payment?.plutusTransactionReferenceID ?? ""),
        transactionLogId: String(payment?.transactionLogId ?? ""),
      }));

      const payload = {
        visitDetails,
        billingItems,
        paymentDetails,
        isBillDiscount: totalDiscAmtOnBill > 0 ? 1 : 0,
      };

      const resp = await fetchApi(
        "POST",
        ENDPOINTS.SAVE_IPD_BILLING,
        payload,
        {},
        { component: "IpdBillingComponent" }
      );
      if (!resp?.result) {
        showError(resp?.message ?? "Error while saving ipd billing");
        return;
      }
      showSuccess(resp?.message ?? "Data saved successfully");
      setServiceDataTableItem([]);
      setShowBillingDetailsForm(false);
      await fetchAndPrintIpdBillAfterSave(resp?.data?.[0] ?? resp?.data ?? {});
    } catch (err) {
      console.error("Error generating separate bill payload:", err);
      alert("Error generating payload: " + String(err));
    }
  };

  // save button click handler
  const saveButtonClickHandler = async (value: string) => {
    const isItemValid = nullRateChacker(serviceDataTableItem ?? []);
    if (!isItemValid) {
      return;
    }
    switch (value) {
      case "openPopup": {
        setOpenPopup(true);
        setRenderPopup(true);
        return;
      }
      case "savePayload": {
        const payload = buildCompletePayload("savePayload");
        const resp = await fetchApi(
          "POST",
          ENDPOINTS.SAVE_IPD_BILLING,
          payload,
          {},
          { component: "IpdBillingComponent" }
        );
        if (!resp?.result) {
          showError(resp?.message ?? "Error while saving ipd billing");
          return;
        }
        showSuccess(resp?.message ?? "Data saved successfully");
        setServiceDataTableItem([]);
        await fetchAndPrintIpdBillAfterSave(resp?.data?.[0] ?? resp?.data ?? {});
        return;
      }
    }
  };

  // close Button PopupHandler
  const closeButtonPopupHandler = useCallback(() => {
    setOpenPopup(false);
    setRenderPopup(false);
  }, []);

  // generate bill button handler
  const generateBillButtonHandler = async (value: string) => {
    switch (value) {
      case "generateSeparateBill": {
        setShowBillingDetailsForm(true);
        setOpenPopup(false);
        setRenderPopup(false);
        return;
      }
      case "addInMainBill": {
        const payload = buildCompletePayload("savePayload");

        const resp = await fetchApi(
          "POST",
          ENDPOINTS.SAVE_IPD_BILLING,
          payload,
          {},
          { component: "IpdBillingComponent" }
        );
        if (!resp?.result) {
          showError(resp?.message ?? "Error while saving ipd billing");
          return;
        }
        showSuccess(resp?.message ?? "Data saved successfully");
        setServiceDataTableItem([]);
        setOpenPopup(false);
        setRenderPopup(false);
        // await fetchAndPrintIpdBillAfterSave(resp?.data?.[0] ?? resp?.data ?? {});
        return;
      }
    }
  };

  // show remark popup handler
  const showRemarksPopupHandler = (item: ServiceTableItem, index: number) => {
    setSelectedServiceRemark(item);
    setSelectedRemarkIndex(index);
    setOpenShowRemarkPopup(true);
    setRenderRemarkPopup(true);
  };

  const closeShowRemarkPopupHandler = useCallback(() => {
    setOpenShowRemarkPopup(false);
    setRenderRemarkPopup(false);
    setSelectedServiceRemark(null);
    setSelectedRemarkIndex(null);
  }, []);

  // show remark popup handler
  const serviceViewPopupHandler = (item: ServiceTableItem) => {
    setSelectedServiceRemark(item);
    setServiceViewPopup(true);
    setRenderServiceViewPopup(true);
  };

  const closeServiceViewPopupHandler = useCallback(() => {
    setServiceViewPopup(false);
    setRenderServiceViewPopup(false);
    setSelectedServiceRemark(null);
  }, []);
  return (
    <div>
      <div className="form-grid-4">
        <InputField label="Doctor">
          <Select
            options={doctorSelectOption}
            name="doctorId"
            value={selectedDoctor}
            onChange={handleDoctorChange}
            placeholder="Select Doctor"
            styles={SelectStyles as any}
            isSearchable
            isClearable
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
        </InputField>

        <InputField label="Service Category" required>
          <select className="input-field" onChange={categoryChangeHandler}>
            <option value={0}>All Category</option>
            {categoryLists.map((c: CategoryItem) => (
              <option key={c?.categoryId} value={c?.categoryId}>
                {c?.categoryName}
              </option>
            ))}
          </select>
        </InputField>

        <InputField label="Service Sub Category" required>
          <Select
            options={subCategorySelectOption}
            name="subCategoryId"
            value={
              selectedSubCategoryId
                ? subCategorySelectOption?.find(
                    (opt: any) => Number(opt.value) === Number(selectedSubCategoryId)
                  ) || null
                : null
            }
            onChange={subCategoryChangeHandler}
            placeholder="Select Sub Category"
            styles={SelectStyles as any}
            isSearchable
            isClearable
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
        </InputField>

        <InputField label="Service Sub Sub Category" required>
          <Select
            options={subSubCategorySelectOption}
            name="subSubCategoryId"
            value={
              selectedSubSubCategoryId
                ? subSubCategorySelectOption?.find(
                    (opt: any) => Number(opt.value) === Number(selectedSubSubCategoryId)
                  ) || null
                : null
            }
            onChange={subSubCategoryChangeHandler}
            placeholder="Select Sub Sub Category"
            styles={SelectStyles as any}
            isSearchable
            isClearable
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
        </InputField>
        <InputField label="From Date">
          <CustomDateInput
            value={fromDate}
            onChange={handleFromDateChange}
            min={minDate}
            max={maxDate || currentDate}
          />
        </InputField>
        <InputField label="To Date">
          <CustomDateInput
            value={toDate}
            onChange={handleToDateChange}
            min={fromDate || minDate}
            max={maxDate || currentDate}
          />
        </InputField>
        <InputField label="Search Service">
          <div className="relative">
            <input
              type="text"
              className="input-field input-field-search-right"
              placeholder="Type to search services"
              value={searchTerm}
              onChange={serviceItemHandler}
              onKeyDown={serviceInputKeyDownHandler}
            />

            <InputFieldModal
              showPopup={showPopup}
              data={serviceNameList}
              activeIndex={activeServiceIndex}
              setActiveIndex={setActiveServiceIndex}
              onSelect={selectedServiceHandler}
              getLabel={item => item.name}
            />
          </div>
        </InputField>
      </div>
      <div className="m-1">
        {/* table */}
        <div className="w-full ">
          <div className="w-full">
            <div className="flex flex-wrap items-center gap-6 px-3 py-2 text-md justify-between">
              <div className="flex items-center gap-1 text-orange-500">
                <span className="w-3 h-3 rounded-full opd-zero-rate border border-orange-300"></span>
                Rate Not Set
              </div>

              {/* <div className="flex items-center gap-1 text-purple-500">
                <span className="w-3 h-3 rounded-full opd-package border border-purple-300"></span>
                Consultation Under Package
              </div> */}

              <div className="flex items-center gap-1 text-blue-500">
                <span className="w-3 h-3 rounded-full opd-non-payable border border-blue-300"></span>
                Corporate Non-Payable
              </div>

              <div className="flex items-center gap-1 text-gray-500">
                <span className="w-3 h-3 rounded-full opd-corporate-discount border border-gray-300"></span>
                Corporate Wise Discount
              </div>

              {/* <div className="flex items-center gap-1 text-pink-400">
                <span className="w-3 h-3 rounded-full opd-privileged-card-discount border border-pink-300"></span>
                Privileged Card Discount
                <span className="text-red-500 ml-1">ⓘ</span>
              </div> */}
            </div>

            <div className="overflow-x-auto">
              <div className="table-container ">
                <div className="table-scroll-wrapper ">
                  <div className="table-size lg:min-h-80 lg:max-h-80 w-full">
                    <table className="base-table ">
                      <thead className="table-head">
                        <tr>
                          {/* {OpdBillingServiceTableHeader.map((h, index) => (
                            <th key={index} className="table-th ">
                              {h}
                            </th>
                          ))} */}
                          <th className="table-th ">#</th>
                          <th className="table-th ">Billing Date</th>
                          <th className="table-th ">Service Name</th>
                          <th className="table-th ">Code</th>
                          <th className="table-th ">Doctor</th>
                          {isPerformingDoctor ? (
                            <th className="table-th ">Performing Doctor</th>
                          ) : (
                            <></>
                          )}
                          <th className="table-th ">QTY</th>
                          <th className="table-th ">Rate</th>
                          <th className="table-th ">Disc (%)</th>
                          <th className="table-th ">Disc</th>
                          <th className="table-th ">Net Amt</th>
                          <th className="table-th ">Remarks</th>
                          <th className="table-th ">Urgent</th>
                          {}
                          {/* <th className="table-th ">View</th> */}
                        </tr>
                      </thead>

                      <tbody>
                        {serviceDataTableItem?.length === 0 && (
                          <tr>
                            <td colSpan={13} className="table-empty">
                              No records found
                            </td>
                          </tr>
                        )}

                        {serviceDataTableItem.map((item, idx: number) => {
                          const isQtyFixed = [1, 3, 11].includes(Number(item?.categoryTypeId));
                          const isDiscountLocked = Number(item?.isDiscountLocked ?? 0) === 1;

                          const rowBgClass =
                            Number(item?.rate ?? 0) === 0
                              ? "opd-zero-rate"
                              : Number(item?.isNonPayable ?? 0) === 1
                                ? "opd-non-payable"
                                : Number(item?.isCorporateDiscount ?? 0) === 1
                                  ? "opd-corporate-discount"
                                  : "";

                          return (
                            <tr
                              key={idx}
                              className={`table-row ${rowBgClass}`}
                              onDoubleClick={e => {
                                const target = e.target as HTMLElement;
                                if (target.closest("input, select, textarea, button")) {
                                  return;
                                }
                                deleteHandler(idx);
                              }}
                            >
                              <td className="table-td">{idx + 1}</td>
                              <td className="table-td">{item?.Billing ?? "--"}</td>

                              <td className="table-td ">
                                <div className="flex items-center justify-between ">
                                  <span>{item?.serviceName || "-"}</span>
                                  {item?.reportTypeId === 1 ? (
                                    <ViewIconButton onClick={() => serviceViewPopupHandler(item)} />
                                  ) : (
                                    <></>
                                  )}
                                </div>
                              </td>
                              <td className="table-td">{item?.code || "-"}</td>
                              <td className="table-td max-w-35">{item?.doctorName || "-"}</td>

                              {isPerformingDoctor ? (
                                <td className="table-td wrap-break-word max-w-30">
                                  {Number(item?.isRequiredSeparatePerformingDoctor) === 1 ? (
                                    <select
                                      className="input-field max-w-50 max-h-10"
                                      value={Number(item?.performingDoctorId ?? 0)}
                                      onChange={e =>
                                        performingDoctorChangeHandler(idx, Number(e.target.value))
                                      }
                                    >
                                      <option value={0}>Select doctor</option>
                                      {getPerformingDoctorOptions(item?.doctorDepartmentIds).map(
                                        doctor => (
                                          <option key={doctor.value} value={doctor.value}>
                                            {doctor.label}
                                          </option>
                                        )
                                      )}
                                    </select>
                                  ) : (
                                    <></>
                                  )}
                                </td>
                              ) : (
                                <></>
                              )}

                              <td className="table-td">
                                <input
                                  className={`max-w-20 max-h-10 ${
                                    isQtyFixed
                                      ? "disabled-input-field cursor-not-allowed"
                                      : "input-field"
                                  }`}
                                  value={item?.qty ?? 1}
                                  onChange={e => qtyChangeHandler(idx, e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === "Enter") {
                                      e.currentTarget.blur();
                                    }
                                  }}
                                  disabled={isQtyFixed}
                                  readOnly={isQtyFixed}
                                />
                              </td>
                              <td className="table-td">
                                <input
                                  value={item?.rate ?? 0}
                                  onChange={e => rateChangeHandler(idx, e.target.value)}
                                  className={`max-w-20 max-h-10 ${
                                    item?.isRateEditable === 1
                                      ? "input-field "
                                      : "disabled-input-field cursor-not-allowed"
                                  }`}
                                  disabled={item?.isRateEditable !== 1}
                                />
                              </td>
                              <td className="table-td">
                                <input
                                  className={`${
                                    item?.discountPer === 1 || isDiscountLocked
                                      ? "disabled-input-field max-w-20 max-h-10"
                                      : "input-field max-w-20 max-h-10"
                                  }`}
                                  value={item?.discountPer ?? 0}
                                  onChange={e =>
                                    discountPercentageChangeHandler(idx, e.target.value)
                                  }
                                  disabled={
                                    isDiscountLocked || Number(item?.isDisabledItem ?? 0) === 1
                                  }
                                />
                              </td>
                              <td className="table-td">
                                <input
                                  className={`${
                                    isDiscountLocked
                                      ? "disabled-input-field max-w-20 max-h-10"
                                      : "input-field max-w-20 max-h-10"
                                  }`}
                                  value={item?.dis ?? 0}
                                  onChange={e => discountChangeHandler(idx, e.target.value)}
                                  disabled={
                                    isDiscountLocked || Number(item?.isDisabledItem ?? 0) === 1
                                  }
                                />
                              </td>
                              <td className="table-td input-field-error">
                                {item?.netAmount ?? item?.rate}
                              </td>

                              <td className="table-td">
                                <CommentIconButton
                                  onClick={() => showRemarksPopupHandler(item, idx)}
                                />
                              </td>
                              <td className="table-td">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4"
                                  checked={Boolean(item?.isUrgent)}
                                  onChange={e => urgentChangeHandler(idx, e.target.checked)}
                                />
                              </td>
                              {/* <td className="table-td">
                                {item?.reportTypeId === 1 ? (
                                  <ViewIconButton onClick={() => serviceViewPopupHandler(item)} />
                                ) : (
                                  <></>
                                )}
                              </td> */}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {showBillingDetailsForm && (
                  <div className="mt-1 card">
                    <BillingDetails
                      ref={billingDetailsRef}
                      setBillingValues={setBillingValues}
                      billingValues={billingValues}
                      paymentBilling={billingPaymentDetails}
                      showPaymentMode={true}
                      corporateId={patient?.CorporateId || 1}
                    />
                  </div>
                )}

                <div className="flex justify-end mt-2 pr-1">
                  {!showBillingDetailsForm ? (
                    <button
                      className="save-btn"
                      onClick={() =>
                        saveButtonClickHandler(isIPDCaseBilling ? "openPopup" : "savePayload")
                      }
                    >
                      Save
                    </button>
                  ) : (
                    <button className="save-btn" onClick={saveSeparateBillHandler}>
                      Save
                    </button>
                  )}
                </div>
              </div>
              {/* {!!showDuplicateError && <p className="input-field-error">{showDuplicateError}</p>}
                    {!!serviceValidationError && (
                      <p className="input-field-error">{serviceValidationError}</p>
                    )} */}
            </div>
          </div>
        </div>
      </div>

      {/* separate bill button */}
      {renderPopup && (
        <SeparateBillButton
          isOpen={openPopup}
          onClose={closeButtonPopupHandler}
          buttonClickHandler={generateBillButtonHandler}
        />
      )}

      {/* remark popup */}
      {renderRemarkPopup && (
        <RemarkPopup
          isOpen={openShowRemarkPopup}
          onClose={closeShowRemarkPopupHandler}
          serviceData={selectedServiceRemark}
          onSave={remarks => {
            if (selectedRemarkIndex !== null) {
              setServiceDataTableItem(prev =>
                prev.map((item, idx) => (idx === selectedRemarkIndex ? { ...item, remarks } : item))
              );
            }
            closeShowRemarkPopupHandler();
          }}
        />
      )}

      {/* service view popup */}
      {renderServiceViewPopup && (
        <ServiceViewPopup
          isOpen={openServiceViewPopup}
          onClose={closeServiceViewPopupHandler}
          serviceData={selectedServiceRemark}
          patientData={patient}
          buttonClickHandler={() => {}}
          //   buttonClickHandler={generateBillButtonHandler}
        />
      )}

      {/* hidden printable templates */}
      <div style={{ visibility: "hidden", position: "absolute", top: 0 }}>
        {patientReceiptDetails && patientReceiptDetails.length > 0 && (
          <IpdBillingReceipt
            data={patientReceiptDetails}
            printOnMount={false}
            paymentModeList={paymentModeList}
            paidAmt={totalPaidAmount}
          />
        )}
      </div>
    </div>
  );
};

export default IpdBillingComponent;
