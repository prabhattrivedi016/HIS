import { BillingDetailsHandle, BillingValuesItem } from "@/components/BillingDetails/types";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import CancelButton from "@/components/globalButtons/CancelButton";
import GlobalFooterButtons from "@/components/globalButtons/GlobalFooterButtons";
import SubmitButton, { SubmitClickHandler } from "@/components/globalButtons/SubmitButton";
import RefundBillingDetails from "@/components/RefundBillingDetails";
import OpdRefundReceipt from "@/components/reportTemplates/OpdRefund";
import { ENDPOINTS } from "@/config/defaults";
import { PageType } from "@/constants/constants";
import { OpdRefundServiceTableHeader } from "@/constants/tableHeaders";
import { AuthContext } from "@/context/AuthContext";
import { RoleContext } from "@/context/RoleContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { PatientReceiptItem, PaymentModeItem } from "@/screens/opdBilling/types";
import { useAssignBranchRight } from "@/store/useAssignBranchRight";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { formatApiValidationMessage } from "@/utils/errorUtils";
import { allowOnlyNumbers } from "@/utils/inputValidationHandler";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { markOpRefundPaymentRefreshOnReturn } from "../opRefundPayment/utils/opRefundPaymentStateRef";
import OpdRefundMultipleBillPopup from "./components/OpdRefundMultipleBillPopup";
import { BillDetailsToRefundItem, BillToRefundItem } from "./types";
import { fetchAndPrintOpdRefundReceiptAfterSave } from "./utils/opdRefundReceiptUtils";
import {
  buildOpdRefundRequestApprovalPayload,
  buildOpdRefundSavePayload,
  calculateRefundBillingTotals,
  getRefundDiscountAmount,
  getRefundNetAmount,
  mapRefundRequestDetailsToBillRows,
  mergeRefundQtyOntoBillDetails,
  resolveCurrentAge,
} from "./utils/opdRefundUtils";

const defaultBillingValues: BillingValuesItem = {
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
};

const OpdRefund = () => {
  const { loading, fetchApi } = useGlobalApi();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state ?? {}) as {
    refundId?: number;
    visitId?: number;
    tokenNo?: string;
    uhid?: string;
    patientId?: number;
    patientName?: string;
    age?: string;
    fromRefundPayment?: boolean;
  };

  const refundPaymentRefundId = Number(locationState.refundId) || 0;
  const isRefundPaymentMode = Boolean(locationState.fromRefundPayment) && refundPaymentRefundId > 0;

  const { rights: branchRights } = useAssignBranchRight();
  const isRefundApprovalRequired =
    !isRefundPaymentMode && Number(branchRights?.IsOPDRefundApprovalRequired) === 1;
  const branchId = Number(useContext(AuthContext)?.user?.branchId ?? 1);
  const roleId = Number(useContext(RoleContext)?.roleId ?? 2);

  const billingDetailsRef = useRef<BillingDetailsHandle>(null);
  const [formResetKey, setFormResetKey] = useState(0);
  const refundPaymentInitRef = useRef(false);

  const [patientDetails, setPatientDetails] = useState({
    UHID: "",
    PatientName: "",
    DOB: "",
    currentAge: "",
    CorporateName: "",
    BillNo: "",
    BillDate: "",
  });
  const [selectedBillToRefund, setSelectedBillToRefund] = useState<BillToRefundItem | null>(null);
  const [patientBillDetailsToRefund, setPatientBillDetailsToRefund] = useState<
    BillDetailsToRefundItem[]
  >([]);
  const [multipleBillToRefund, setMultipleBillToRefund] = useState<BillToRefundItem[]>([]);
  const [searchFormQuery, setSearchFormQuery] = useState({
    receiptNo: "",
    billNo: "",
    uhid: locationState.uhid ?? "",
    patientName: "",
  });
  const [billingValues, setBillingValues] = useState<BillingValuesItem>(defaultBillingValues);
  const [billingPaymentDetails, setBillingPaymentDetails] = useState({
    grossBillAmount: 0,
    totalDiscPerOnBill: 0,
    totalDiscAmtOnBill: 0,
    netAmount: 0,
  });

  const [isOpenMultipleBillPopup, setIsOpenMultipleBillPopup] = useState(false);
  const [renderMultipleBillPopup, setRenderMultipleBillPopup] = useState(false);
  const [patientReceiptDetails, setPatientReceiptDetails] = useState<PatientReceiptItem[]>([]);
  const [paymentModeList, setPaymentModeList] = useState<PaymentModeItem[]>([]);
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);

  const getOpdPackageServices = useCallback(async (visitId: number, serviceItemId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_OPD_PACKAGE_SERVICES_FOR_REFUND,
      {},
      { params: { visitId, serviceItemId } },
      { component: "OpdRefund" }
    );

    return resp?.data ?? [];
  }, []);

  const calculateAndUpdateBillingDetails = useCallback((items: BillDetailsToRefundItem[]) => {
    const totals = calculateRefundBillingTotals(items);

    setBillingValues(prev => ({
      ...prev,
      grossBillAmount: totals.grossBillAmount,
      totalDiscPerOnBill: totals.totalDiscPerOnBill,
      totalDiscAmtOnBill: totals.totalDiscAmtOnBill,
      roundOff: totals.roundOff,
      netAmount: totals.netAmount,
      balanceAmount: totals.balanceAmount,
    }));

    setBillingPaymentDetails({
      grossBillAmount: totals.grossBillAmount,
      totalDiscPerOnBill: totals.totalDiscPerOnBill,
      totalDiscAmtOnBill: totals.totalDiscAmtOnBill,
      netAmount: totals.netAmount,
    });
  }, []);

  const applyRefundRowsToScreen = useCallback(
    (rows: BillDetailsToRefundItem[], bill?: BillToRefundItem | null) => {
      const headerRow = rows[0]
        ? {
            ...rows[0],
            Age: rows[0].Age || locationState.age || "",
            PatientName: rows[0].PatientName || locationState.patientName || "",
            UHID: rows[0].UHID || locationState.uhid || bill?.UHID || "",
          }
        : null;

      const nextRows = headerRow && rows.length > 0 ? [headerRow, ...rows.slice(1)] : rows;

      setPatientDetails({
        UHID: headerRow?.UHID || bill?.UHID || locationState.uhid || "",
        PatientName: headerRow?.PatientName || locationState.patientName || "",
        DOB: headerRow?.DOB || "",
        currentAge: resolveCurrentAge(headerRow ?? undefined) || locationState.age || "",
        CorporateName: headerRow?.CorporateName || "",
        BillNo: headerRow?.BillNo || bill?.BillNo || "",
        BillDate: headerRow?.BillDate || bill?.BillDate || "",
      });
      setPatientBillDetailsToRefund(nextRows);
      calculateAndUpdateBillingDetails(nextRows);
      billingDetailsRef.current?.reset?.();
      setFormResetKey(prev => prev + 1);
    },
    [
      calculateAndUpdateBillingDetails,
      locationState.age,
      locationState.patientName,
      locationState.uhid,
    ]
  );

  const resetRefundScreen = useCallback(() => {
    setSearchFormQuery({
      receiptNo: "",
      billNo: "",
      uhid: "",
      patientName: "",
    });
    setPatientBillDetailsToRefund([]);
    setSelectedBillToRefund(null);
    setMultipleBillToRefund([]);
    setPatientDetails({
      UHID: "",
      PatientName: "",
      DOB: "",
      currentAge: "",
      CorporateName: "",
      BillNo: "",
      BillDate: "",
    });
    setBillingValues(defaultBillingValues);
    setBillingPaymentDetails({
      grossBillAmount: 0,
      totalDiscPerOnBill: 0,
      totalDiscAmtOnBill: 0,
      netAmount: 0,
    });
    billingDetailsRef.current?.reset?.();
    setFormResetKey(prev => prev + 1);
    setPatientReceiptDetails([]);
    setPaymentModeList([]);
    setTotalPaidAmount(0);
  }, []);

  const resetFormAndClearNavigation = useCallback(
    (fromRefundPayment = false) => {
      resetRefundScreen();

      if (fromRefundPayment) {
        markOpRefundPaymentRefreshOnReturn();
        navigate("/op-refund-payment", { replace: true });
        return;
      }

      navigate("/opd-refund", { replace: true, state: null });
    },
    [navigate, resetRefundScreen]
  );

  const markRefundPaymentCollected = useCallback(async (refundId: number) => {
    console.log("refundId", refundId);
    const payload = { refundId: Number(refundId) };
    console.log("params", payload);

    const paymentCollectedResp = await fetchApi(
      "PATCH",
      ENDPOINTS.PAYMENT_OPD_REFUND_REQUEST,
      payload,
      {},
      { component: "OpdRefund" }
    );

    if (!paymentCollectedResp?.result) {
      showError(
        formatApiValidationMessage(
          paymentCollectedResp,
          paymentCollectedResp?.message || "Failed to mark refund payment as collected"
        )
      );
      return false;
    }

    return true;
  }, []);

  const saveOpdRefundBilling = useCallback(async () => {
    const hasRefundQty = patientBillDetailsToRefund.some(item => Number(item.RefundQty ?? 0) > 0);
    if (!hasRefundQty) {
      showWarning("Please enter refund quantity for at least one service.");
      return;
    }

    const isBillingFormValid = (await billingDetailsRef.current?.validateForm?.()) ?? false;
    if (!isBillingFormValid) {
      showWarning("Please complete required billing and payment details.");
      return;
    }

    const billingPayload = billingDetailsRef.current?.getPayload?.();
    const paymentList = Array.isArray(billingPayload?.payments)
      ? (billingPayload.payments as Array<Record<string, unknown>>)
      : [];

    const headerItem = patientBillDetailsToRefund[0]
      ? {
          ...patientBillDetailsToRefund[0],
          Age:
            patientBillDetailsToRefund[0].Age ||
            patientDetails.currentAge ||
            locationState.age ||
            "",
          DOB: patientBillDetailsToRefund[0].DOB || patientDetails.DOB || "",
        }
      : null;

    const payload = await buildOpdRefundSavePayload({
      headerItem,
      refundRows: patientBillDetailsToRefund,
      billingValues,
      payments: paymentList,
      branchId,
      roleId,
      fetchPackageServices: getOpdPackageServices,
      currentAgeFallback: patientDetails.currentAge || locationState.age || "",
    });

    if (!payload.visitDetails.currentAge) {
      showWarning("Patient age is required to save refund payment.");
      return;
    }

    if (!payload.refundItems.length) {
      showWarning("Please enter refund quantity for at least one service.");
      return;
    }

    if (!payload.paymentDetails.length) {
      showWarning("Please enter refund payment details.");
      return;
    }

    const totalCollected = payload.paymentDetails.reduce((sum, item) => sum + item.amount, 0);
    if (totalCollected !== payload.visitDetails.netAmount) {
      showWarning("Refund payment amount must match net refund amount.");
      return;
    }

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.SAVE_OPD_REFUND_BILLING,
      payload,
      {},
      { component: "OpdRefund" }
    );

    if (!resp?.result) {
      showError(formatApiValidationMessage(resp, "Failed to save OPD refund."));
      return;
    }

    const responseData = (resp?.data ?? null) as Record<string, unknown> | null;
    if (!responseData) {
      showError("Refund saved, but response data is unavailable.");
      return;
    }

    if (isRefundPaymentMode) {
      const marked = await markRefundPaymentCollected(refundPaymentRefundId);
      if (!marked) return;
    }

    await showSuccess(resp?.message ?? "OPD refund saved successfully.");

    const printed = await fetchAndPrintOpdRefundReceiptAfterSave(
      fetchApi,
      responseData,
      ({ receiptData, paymentModes, totalPaidAmount: paidAmount }) => {
        setPatientReceiptDetails(receiptData);
        setPaymentModeList(paymentModes);
        setTotalPaidAmount(paidAmount);
      }
    );

    if (!printed) {
      showError("Refund saved, but receipt data is unavailable for printing.");
    }

    window.setTimeout(() => {
      resetFormAndClearNavigation(isRefundPaymentMode);
    }, 300);
  }, [
    billingValues,
    branchId,
    fetchApi,
    getOpdPackageServices,
    isRefundPaymentMode,
    locationState.age,
    markRefundPaymentCollected,
    patientBillDetailsToRefund,
    patientDetails.DOB,
    patientDetails.currentAge,
    refundPaymentRefundId,
    resetFormAndClearNavigation,
    roleId,
  ]);

  const sendOpdRefundRequestApproval = useCallback(async () => {
    const hasRefundQty = patientBillDetailsToRefund.some(item => Number(item.RefundQty ?? 0) > 0);
    if (!hasRefundQty) {
      showWarning("Please enter refund quantity for at least one service.");
      return;
    }

    const isBillingFormValid = (await billingDetailsRef.current?.validateForm?.()) ?? false;
    if (!isBillingFormValid) {
      showWarning("Please complete required refund approval details.");
      return;
    }

    const payload = buildOpdRefundRequestApprovalPayload({
      headerItem: patientBillDetailsToRefund[0] ?? null,
      refundRows: patientBillDetailsToRefund,
      billingValues,
      branchId,
      roleId,
    });

    if (!payload.billingItems.length) {
      showWarning("Please enter refund quantity for at least one service.");
      return;
    }

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.SAVE_OPD_REFUND_REQUEST_APPROVAL,
      payload,
      {},
      { component: "OpdRefund" }
    );

    if (!resp?.result) {
      showError(formatApiValidationMessage(resp, "Failed to send refund request for approval."));
      return;
    }

    await showSuccess(resp?.message ?? "OPD refund request sent for approval successfully.");
    resetRefundScreen();
  }, [billingValues, branchId, fetchApi, patientBillDetailsToRefund, resetRefundScreen, roleId]);

  const handleGlobalFooterButtonClick = (action: string) => {
    switch (action) {
      case "save":
        void saveOpdRefundBilling();
        break;
      case "sendForApproval":
        void sendOpdRefundRequestApproval();
        break;
      case "cancel":
        if (isRefundPaymentMode) {
          resetFormAndClearNavigation(true);
        } else {
          resetRefundScreen();
        }
        break;
      default:
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchFormQuery(prev => ({ ...prev, [name]: value.trim() }));
  };

  const getRefundBillDetails = useCallback(
    async (visitId: number, bill?: BillToRefundItem | null) => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_BILL_DETAILS_TO_REFUND,
        {},
        { params: { visitId } },
        { component: "OpdRefund" }
      );

      if (!resp?.result) {
        showWarning(resp?.message ?? "No bills found for refund");
        setPatientBillDetailsToRefund([]);
        setPatientDetails({
          UHID: "",
          PatientName: "",
          DOB: "",
          currentAge: "",
          CorporateName: "",
          BillNo: "",
          BillDate: "",
        });
        setSelectedBillToRefund(null);
        return;
      }

      const rows = (resp?.data ?? []).map((item: BillDetailsToRefundItem) => ({
        ...item,
        RefundQty: item.RefundQty ?? 0,
      }));

      applyRefundRowsToScreen(rows, bill);
      setSelectedBillToRefund(bill ?? null);
    },
    [applyRefundRowsToScreen, fetchApi]
  );

  const loadRefundPaymentDetails = useCallback(async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_OPD_REFUND_REQUEST_DETAILS_BY_REFUND_ID,
      {},
      { params: { refundId: refundPaymentRefundId } },
      { component: "OpdRefund" }
    );

    if (!resp?.result) {
      showWarning(resp?.message ?? "No refund request details found");
      return;
    }

    const refundRows = mapRefundRequestDetailsToBillRows(resp?.data);
    const approvalHeader = Array.isArray(resp?.data)
      ? (resp.data[0] as Record<string, unknown> | undefined)
      : (resp?.data as Record<string, unknown> | null);

    const visitId =
      Number(refundRows[0]?.VisitId) ||
      Number(approvalHeader?.VisitId ?? approvalHeader?.visitId) ||
      Number(locationState.visitId) ||
      0;

    setBillingValues(prev => ({
      ...prev,
      discApprovedById: Number(
        approvalHeader?.RefundApprovedID ??
          approvalHeader?.refundApprovedID ??
          prev.discApprovedById
      ),
      discApprovedName: String(
        approvalHeader?.RefundApprovedName ??
          approvalHeader?.refundApprovedName ??
          prev.discApprovedName ??
          ""
      ),
      discountReason: String(
        approvalHeader?.RefundReason ?? approvalHeader?.refundReason ?? prev.discountReason ?? ""
      ),
      remarks: String(
        approvalHeader?.RefundRemark ?? approvalHeader?.refundRemark ?? prev.remarks ?? ""
      ),
    }));

    if (visitId > 0) {
      const billResp = await fetchApi(
        "GET",
        ENDPOINTS.GET_BILL_DETAILS_TO_REFUND,
        {},
        { params: { visitId } },
        { component: "OpdRefund" }
      );

      if (billResp?.result && Array.isArray(billResp?.data) && billResp.data.length > 0) {
        const billRows = (billResp.data as BillDetailsToRefundItem[]).map(item => {
          const source = item as BillDetailsToRefundItem & {
            Age?: string;
            age?: string;
            CurrentAge?: string;
            currentAge?: string;
          };

          return {
            ...item,
            Age: source.Age || source.age || source.CurrentAge || source.currentAge || "",
            RefundQty: item.RefundQty ?? 0,
          };
        });

        const mergedRows =
          refundRows.length > 0 ? mergeRefundQtyOntoBillDetails(billRows, refundRows) : billRows;

        setSearchFormQuery(prev => ({
          ...prev,
          uhid: mergedRows[0]?.UHID || locationState.uhid || prev.uhid,
          billNo: mergedRows[0]?.BillNo || prev.billNo,
        }));

        applyRefundRowsToScreen(mergedRows);
        return;
      }
    }

    if (!refundRows.length) {
      showWarning("No refund service items found for this request.");
      return;
    }

    setSearchFormQuery(prev => ({
      ...prev,
      uhid: refundRows[0]?.UHID || locationState.uhid || prev.uhid,
      billNo: refundRows[0]?.BillNo || prev.billNo,
    }));

    applyRefundRowsToScreen(refundRows);
  }, [applyRefundRowsToScreen, locationState.uhid, locationState.visitId, refundPaymentRefundId]);

  const searchBillsForRefund = useCallback(async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_BILL_TO_REFUND,
      {},
      { params: searchFormQuery },
      { component: "OpdRefund" }
    );

    if (!resp?.result) {
      showWarning(resp?.message ?? "No bills found for refund");
      setPatientBillDetailsToRefund([]);
      setMultipleBillToRefund([]);
      setSelectedBillToRefund(null);
      return;
    }

    if (resp?.data?.length === 1) {
      setSelectedBillToRefund(resp.data[0] as BillToRefundItem);
      setIsOpenMultipleBillPopup(false);
      setRenderMultipleBillPopup(false);
      return;
    }

    setIsOpenMultipleBillPopup(true);
    setRenderMultipleBillPopup(true);
    setMultipleBillToRefund(resp?.data ?? []);
  }, [searchFormQuery]);

  const handleSearchSubmit: SubmitClickHandler = useCallback(
    e => {
      e?.preventDefault();
      if (isRefundPaymentMode) return;
      void searchBillsForRefund();
    },
    [isRefundPaymentMode, searchBillsForRefund]
  );

  useEffect(() => {
    if (isRefundPaymentMode) return;
    if (!selectedBillToRefund?.VisitId) return;
    void getRefundBillDetails(selectedBillToRefund.VisitId, selectedBillToRefund);
  }, [selectedBillToRefund?.VisitId, isRefundPaymentMode]);

  useEffect(() => {
    if (!isRefundPaymentMode || refundPaymentInitRef.current) return;
    refundPaymentInitRef.current = true;
    void loadRefundPaymentDetails();
  }, [isRefundPaymentMode, loadRefundPaymentDetails]);

  const handleRefundQtyChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    selectedItem: BillDetailsToRefundItem
  ) => {
    if (isRefundPaymentMode) return;

    const value = e.target.value;

    if (value !== "") {
      const qty = Number(value);
      if (qty > selectedItem.Qty) {
        showWarning("Refund quantity cannot be greater than the original quantity");
        return;
      }
    }

    setPatientBillDetailsToRefund(prev => {
      const updated = prev.map(row => {
        if (row.ServiceItemId !== selectedItem.ServiceItemId) return row;

        if (value === "") {
          return {
            ...row,
            RefundQty: 0,
          };
        }

        return {
          ...row,
          RefundQty: Number(value),
        };
      });

      calculateAndUpdateBillingDetails(updated);
      return updated;
    });
  };

  const handleSearchCancel = () => {
    if (isRefundPaymentMode) return;
    setSearchFormQuery({
      receiptNo: "",
      billNo: "",
      uhid: "",
      patientName: "",
    });
  };

  const showRefundDetails = patientBillDetailsToRefund.length > 0;

  return (
    <div className="page-container">
      <div className="flex items-center justify-between w-full flex-col lg:flex-row gap-3">
        <div className="flex-1">
          <h1 className="page-heading">Opd Refund</h1>

          <nav className="helper-text">
            <NavLink to="/dashboard" className="hover:underline">
              Home
            </NavLink>
            <span>››</span>
            <span>Opd Refund</span>
          </nav>
        </div>
      </div>

      {!isRefundPaymentMode && (
        <div className="card">
          <form onSubmit={handleSearchSubmit}>
            <div className="form-grid-4">
              <InputField label="Receipt Number">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter receipt number "
                  name="receiptNo"
                  value={searchFormQuery.receiptNo}
                  onChange={handleInputChange}
                />
              </InputField>

              <InputField label="Bill Number">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter bill number "
                  name="billNo"
                  value={searchFormQuery.billNo}
                  onChange={handleInputChange}
                />
              </InputField>

              <InputField label="UHID">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter UHID "
                  name="uhid"
                  value={searchFormQuery.uhid}
                  onChange={handleInputChange}
                />
              </InputField>
              <InputField label="Patient Name">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter Patient Name "
                  name="patientName"
                  value={searchFormQuery.patientName}
                  onChange={handleInputChange}
                />
              </InputField>
            </div>

            <div className="form-actions-responsive mt-5">
              <SubmitButton
                label="Search"
                className="save-btn-color"
                type="submit"
                onClick={handleSearchSubmit}
              />

              <CancelButton
                label="Cancel"
                className="cancel-btn-color"
                type="button"
                onClick={handleSearchCancel}
              />
            </div>
          </form>
        </div>
      )}

      {showRefundDetails && (
        <div className="card mt-1">
          <div className="w-full form-grid-3">
            <div className="flex flex-row gap-1">
              <span className="name-header whitespace-nowrap">UHID:</span>
              <span className="truncate">{patientDetails?.UHID ?? ""}</span>
            </div>

            <div className="flex flex-row gap-1">
              <span className="name-header whitespace-nowrap">Bill Number:</span>
              <span className="truncate">{patientDetails?.BillNo ?? ""}</span>
            </div>
            <div className="flex flex-row gap-1">
              <span className="name-header whitespace-nowrap">Bill Date:</span>
              <span className="truncate">{patientDetails?.BillDate ?? ""}</span>
            </div>
            <div className="flex flex-row gap-1">
              <span className="name-header whitespace-nowrap">DOB:</span>
              <span className="truncate">{patientDetails?.DOB ?? ""}</span>
            </div>

            <div className="flex flex-row gap-1">
              <span className="name-header whitespace-nowrap">Name:</span>
              <span className="truncate">{patientDetails?.PatientName ?? ""}</span>
            </div>
            <div className="flex flex-row gap-1">
              <span className="name-header whitespace-nowrap">Corporate:</span>
              <span className="truncate">{patientDetails?.CorporateName ?? ""}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="table-container">
              <div className="table-scroll-wrapper">
                <div className="table-size lg:min-h-40 w-full">
                  <table className="base-table">
                    <thead className="table-head">
                      <tr>
                        {OpdRefundServiceTableHeader.map((h, index) => (
                          <th key={index} className="table-th">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {patientBillDetailsToRefund.length === 0 ? (
                        <tr>
                          <td colSpan={OpdRefundServiceTableHeader.length} className="table-empty">
                            No records found
                          </td>
                        </tr>
                      ) : (
                        patientBillDetailsToRefund.map((item, idx) => (
                          <tr key={`${item.ServiceItemId}-${idx}`}>
                            <td className="table-td">{idx + 1}</td>
                            <td className="table-td">{item.ServiceName}</td>
                            <td className="table-td">{item.DoctorName}</td>
                            <td className="table-td">{item.Rate}</td>
                            <td className="table-td">{item.DiscPer}</td>
                            <td className="table-td">{item.Qty}</td>
                            <td className="table-td">
                              {isRefundPaymentMode ? (
                                <span>{item.RefundQty ?? 0}</span>
                              ) : (
                                <input
                                  type="text"
                                  className="input-field max-w-20 max-h-10"
                                  value={item.RefundQty ?? ""}
                                  onChange={e => handleRefundQtyChange(e, item)}
                                  onInput={allowOnlyNumbers}
                                />
                              )}
                            </td>
                            <td className="table-td">
                              {getRefundDiscountAmount(
                                item.RefundQty ?? 0,
                                item.Rate,
                                item.DiscPer
                              )}
                            </td>
                            <td className="table-td">
                              {getRefundNetAmount(item.RefundQty ?? 0, item.Rate, item.DiscPer)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2">
            <RefundBillingDetails
              key={`opd-refund-billing-${formResetKey}`}
              ref={billingDetailsRef}
              setBillingValues={setBillingValues}
              billingValues={billingValues}
              paymentBilling={billingPaymentDetails}
              showPaymentMode={!isRefundApprovalRequired || isRefundPaymentMode}
              corporateId={Number(patientBillDetailsToRefund[0]?.CorporateId ?? 0) || 1}
            />
          </div>

          <GlobalFooterButtons
            onButtonClick={handleGlobalFooterButtonClick}
            pageType={PageType.OPD_REFUND}
            paymentCollectionMode={isRefundPaymentMode}
          />
        </div>
      )}

      {renderMultipleBillPopup && (
        <OpdRefundMultipleBillPopup
          isOpen={isOpenMultipleBillPopup}
          onClose={() => setIsOpenMultipleBillPopup(false)}
          multipleBillToRefund={multipleBillToRefund}
          setSelectedBillToRefund={setSelectedBillToRefund}
        />
      )}

      {loading && <CustomLoader isLoading={loading} />}

      <div style={{ visibility: "hidden", position: "absolute", top: 0 }}>
        {patientReceiptDetails.length > 0 && (
          <OpdRefundReceipt
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

export default OpdRefund;
