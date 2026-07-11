import { ENDPOINTS } from "@/config/defaults";
import { Status } from "@/constants/constants";
import { BillingPaymentTableHeader } from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import { shouldShowOpdPaymentMode } from "@/screens/opdBilling/utils/billingUiRules";
import {
  getBookingDiscountPrefillFromDetails,
  hasBookingDiscountPrefillData,
} from "@/screens/opdBilling/utils/bookingDiscountPrefill";
import {
  buildPatientAdvancePaymentEntry,
  getDefaultPatientAdvanceUsed,
  getMaxPatientAdvanceUsable,
  getRegularPaymentsTotal,
  getTotalCollectedAmount,
  roundPaymentAmount,
} from "@/screens/opdBilling/utils/patientAdvancePayment";
import { useAssignBranchRight } from "@/store/useAssignBranchRight";
import { showError, showWarning } from "@/utils/alert";
import { allowOnlyNumbers } from "@/utils/inputValidationHandler";
import {
  ChangeEvent,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import InputField from "../customInputField";
import CustomLoader from "../customLoader";
import {
  BankItems,
  BillingDetailsHandle,
  BillingDetailsProps,
  BillingValuesItem,
  DiscountApproveItem,
  PaymentItems,
} from "./types";

const BillingDetails = forwardRef<BillingDetailsHandle, BillingDetailsProps>(
  (
    {
      setOpdBilling,
      setBillingValues,
      billingValues: initialBillingValues,
      paymentBilling,
      maxDiscountPercentage,
      creditCopayment = false,
      showPaymentMode = false,
      hasDiscountApplied = false,
      bookingDetails = null,
      hideBillingSection = false,
      relaxPaymentAmountLimit = false,
      maxPaymentAmount = null,
      paymentAmountExceededMessage,
      patientAdvanceEnabled = false,
      patientAdvanceAmount = 0,
      disableDiscountEditing = false,
    },
    ref
  ) => {
    const { loading, fetchApi } = useGlobalApi();
    const availablePatientAdvance = Math.max(0, Number(patientAdvanceAmount) || 0);
    const showPatientAdvanceRow = patientAdvanceEnabled && availablePatientAdvance > 0;
    const [patientAdvanceUsed, setPatientAdvanceUsed] = useState(0);
    const bookingDiscountPrefill = useMemo(
      () => getBookingDiscountPrefillFromDetails(bookingDetails),
      [bookingDetails]
    );
    const isPaymentCollectionPrefill = hasBookingDiscountPrefillData(bookingDiscountPrefill);
    const { rights: branchRights } = useAssignBranchRight();
    const isSeparateCollectionCounterEnabled =
      Number(branchRights?.IsSeparateCollectionCounterEnabled) === 1 ? 1 : 0;
    const isDiscountApprovalRequired =
      Number(branchRights?.IsOPDBillingDiscountApprovalRequired) === 1 ? 1 : 0;

    const [paymentList, setPaymentList] = useState<PaymentItems[]>([]);
    const [bankList, setBankList] = useState<BankItems[]>([]);
    const [billingFieldErrors, setBillingFieldErrors] = useState<
      Partial<Record<"discApprovedById" | "discountReason" | "remarks", string>>
    >({});
    const [rowErrors, setRowErrors] = useState<
      Record<number, Partial<Record<"paymentModeId" | "amount" | "bankId" | "refNo", string>>>
    >({});

    const [copaymentAmount, setCopaymentAmount] = useState<number>(0);

    useEffect(() => {
      if (!creditCopayment) {
        setCopaymentAmount(0);
      }
    }, [creditCopayment]);

    // payment modes added
    const [rows, setRows] = useState<
      Array<{
        paymentModeId: number | null;
        amount: string;
        bankId: number | null;
        refNo: string;
        isCopaymentReceipt: number | null;
      }>
    >([
      {
        paymentModeId: null,
        amount: "0",
        isCopaymentReceipt: 0,
        bankId: null,
        refNo: "",
      },
    ]);

    const shouldShowPaymentMode = shouldShowOpdPaymentMode({
      showPaymentMode,
      isSeparateCollectionCounterEnabled,
      isDiscountApprovalRequired,
      hasDiscountApplied,
    });

    const getPaymentModeById = (paymentModeId: number | null) =>
      paymentList.find(p => p.paymentModeId === paymentModeId);

    const isCashMode = (paymentModeId: number | null) => {
      const mode = getPaymentModeById(paymentModeId);
      return mode?.paymentModeName?.toLowerCase() === "cash";
    };

    const isCardMode = (paymentModeId: number | null) => {
      const modeName = getPaymentModeById(paymentModeId)?.paymentModeName?.toLowerCase() ?? "";
      return modeName.includes("credit") || modeName.includes("debit");
    };

    const validatePaymentRows = (strictForAddRow = false) => {
      const nextRowErrors: Record<
        number,
        Partial<Record<"paymentModeId" | "amount" | "bankId" | "refNo", string>>
      > = {};
      let hasError = false;

      for (const [index, row] of rows.entries()) {
        const hasAnyValue =
          row.paymentModeId !== null ||
          String(row.amount).trim() !== "" ||
          row.bankId !== null ||
          String(row.refNo).trim() !== "";

        if (!hasAnyValue) {
          if (strictForAddRow) {
            nextRowErrors[index] = {
              paymentModeId: "Select payment mode",
              amount: "Enter valid amount",
            };
            hasError = true;
          }
          continue;
        }

        const errors: Partial<Record<"paymentModeId" | "amount" | "bankId" | "refNo", string>> = {};

        if (row.paymentModeId === null) {
          errors.paymentModeId = "Select payment mode";
          hasError = true;
        }

        if (toNumber(row.amount) <= 0) {
          errors.amount = "Enter valid amount";
          hasError = true;
        }

        if (!isCashMode(row.paymentModeId) && !String(row.refNo).trim()) {
          errors.refNo = "Reference no. required";
          hasError = true;
        }

        if (isCardMode(row.paymentModeId) && !row.bankId) {
          errors.bankId = "Bank required for card";
          hasError = true;
        }

        if (Object.keys(errors).length > 0) {
          nextRowErrors[index] = errors;
        }
      }

      setRowErrors(nextRowErrors);

      const regularTotal = getRegularPaymentsTotal(rows);
      const advanceUsed = showPatientAdvanceRow ? patientAdvanceUsed : 0;
      const totalCollected = getTotalCollectedAmount(regularTotal, advanceUsed);
      const maxAllowedPayment = getCollectibleTargetAmount();

      if (showPatientAdvanceRow && patientAdvanceUsed < 0) {
        showWarning("Patient advance amount cannot be negative.");
        return false;
      }

      if (showPatientAdvanceRow && patientAdvanceUsed > availablePatientAdvance) {
        showWarning("Advance amount cannot be greater than available patient advance.");
        return false;
      }

      if (totalCollected > maxAllowedPayment) {
        showPaymentAmountExceededWarning();
        return false;
      }

      return !hasError;
    };

    const handleAddRow = () => {
      if (!validatePaymentRows(true)) {
        return;
      }

      setRows(prev => [
        ...prev,
        { paymentModeId: null, amount: "0", bankId: null, refNo: "", isCopaymentReceipt: 0 },
      ]);
    };

    const handleRemoveRow = (index: number) => {
      if (index === 0 || rows.length <= 1) return;

      setRows(prev => prev.filter((_, rowIndex) => rowIndex !== index));
      setRowErrors({});
    };

    const handlePaymentChange = (index: number, value: number) => {
      setRowErrors(prev => ({
        ...prev,
        [index]: {
          ...prev[index],
          paymentModeId: undefined,
          bankId: undefined,
          refNo: undefined,
        },
      }));
      const updated = [...rows];
      updated[index].paymentModeId = value;
      if (!value || !isCardMode(value)) {
        updated[index].bankId = null;
      }
      if (value && isCashMode(value)) {
        updated[index].bankId = null;
        updated[index].refNo = "";
      }
      setRows(updated);
    };

    const handleRowValueChange = (
      index: number,
      key: "amount" | "bankId" | "refNo",
      value: string | number | null
    ) => {
      setRowErrors(prev => ({
        ...prev,
        [index]: {
          ...prev[index],
          [key]: undefined,
        },
      }));

      const updatedRows = [...rows];
      updatedRows[index] = { ...updatedRows[index], [key]: value };

      const regularTotal = getRegularPaymentsTotal(updatedRows);
      const advanceUsed = showPatientAdvanceRow ? patientAdvanceUsed : 0;
      const totalCollected = getTotalCollectedAmount(regularTotal, advanceUsed);

      if (totalCollected > getCollectibleTargetAmount()) {
        showPaymentAmountExceededWarning();
        return;
      }

      setRows(updatedRows);
    };

    const getAvailablePaymentModes = (currentIndex: number) => {
      const selectedIds = rows.map(r => r.paymentModeId);

      return paymentList.filter(
        p =>
          !selectedIds.includes(p.paymentModeId) ||
          rows[currentIndex].paymentModeId === p.paymentModeId
      );
    };

    // Default billing values
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

    const billingValues = initialBillingValues || defaultBillingValues;

    useEffect(() => {
      if (!showPatientAdvanceRow) {
        setPatientAdvanceUsed(0);
        return;
      }

      const netAmount = toNumber(billingValues?.netAmount);
      const regularTotal = getRegularPaymentsTotal(rows);
      const maxUsable = getMaxPatientAdvanceUsable(
        netAmount,
        availablePatientAdvance,
        regularTotal
      );

      setPatientAdvanceUsed(prev => {
        if (prev < 0) {
          return getDefaultPatientAdvanceUsed(netAmount, availablePatientAdvance);
        }
        return roundPaymentAmount(Math.min(prev, maxUsable));
      });
    }, [availablePatientAdvance, billingValues?.netAmount, rows, showPatientAdvanceRow]);

    const [discountApproveList, setDiscountApproveList] = useState<DiscountApproveItem[]>([]);

    const toNumber = (value: unknown) => {
      if (value === "" || value === null || value === undefined) return 0;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    const getCollectibleTargetAmount = useCallback(() => {
      if (maxPaymentAmount != null) {
        return Math.max(0, Number(maxPaymentAmount));
      }
      if (relaxPaymentAmountLimit) {
        return Number.MAX_SAFE_INTEGER;
      }
      if (creditCopayment && toNumber(copaymentAmount) > 0) {
        return toNumber(copaymentAmount);
      }
      return toNumber(billingValues?.netAmount);
    }, [
      billingValues?.netAmount,
      copaymentAmount,
      creditCopayment,
      maxPaymentAmount,
      relaxPaymentAmountLimit,
    ]);

    useEffect(() => {
      if (!paymentList.length) return;

      const cash = paymentList.find(p => p.paymentModeName.toLowerCase() === "cash");
      if (!cash) return;

      const collectibleTarget = getCollectibleTargetAmount();
      const targetAmount =
        shouldShowPaymentMode && collectibleTarget > 0
          ? String(Math.max(0, collectibleTarget))
          : "0";

      setRows(prev => {
        if (!prev.length || (prev.length === 1 && prev[0].paymentModeId === null)) {
          return [
            {
              paymentModeId: cash.paymentModeId,
              amount: targetAmount,
              bankId: null,
              refNo: "",
              isCopaymentReceipt: 0,
            },
          ];
        }

        if (prev.length === 1 && prev[0].paymentModeId === cash.paymentModeId) {
          if (prev[0].amount === targetAmount) {
            return prev;
          }

          return [{ ...prev[0], amount: targetAmount }];
        }

        return prev;
      });
    }, [
      getCollectibleTargetAmount,
      paymentList,
      shouldShowPaymentMode,
      showPatientAdvanceRow,
    ]);

    const getMaxPaymentAmount = getCollectibleTargetAmount;

    const showPaymentAmountExceededWarning = useCallback(() => {
      if (paymentAmountExceededMessage) {
        showWarning(paymentAmountExceededMessage);
        return;
      }

      if (creditCopayment && toNumber(copaymentAmount) > 0) {
        showWarning("Total paid amount cannot exceed Co-payment amount");
        return;
      }

      showError("Total paid amount cannot exceed Net Amount");
    }, [copaymentAmount, creditCopayment, paymentAmountExceededMessage]);

    const isServiceDiscountApplied =
      !!paymentBilling && toNumber(paymentBilling.totalDiscAmtOnBill) > 0;

    const wasServiceDiscountAppliedRef = useRef(false);

    const roundToTwo = (value: number) => Number(value.toFixed(2));

    const syncToOpdBilling = useCallback(
      (nextValues: Partial<BillingValuesItem>) => {
        if (!setOpdBilling) return;
        setOpdBilling(prev => ({ ...prev, ...nextValues }));
      },
      [setOpdBilling]
    );

    const setBillingState = useCallback(
      (nextValues: Partial<BillingValuesItem>) => {
        const sanitized = Object.fromEntries(
          Object.entries(nextValues).filter(([, value]) => value !== undefined)
        ) as Partial<BillingValuesItem>;

        if (setBillingValues) {
          setBillingValues((prev: BillingValuesItem) => ({ ...prev, ...sanitized }));
        }
        syncToOpdBilling(sanitized);
      },
      [setBillingValues, syncToOpdBilling]
    );

    const calculateFromAmount = useCallback((gross: number, discountAmtInput: unknown) => {
      const normalizedGross = Math.max(0, gross);
      const discountAmt = roundToTwo(
        Math.min(normalizedGross, Math.max(0, toNumber(discountAmtInput)))
      );
      const discountPer =
        normalizedGross > 0 ? roundToTwo((discountAmt / normalizedGross) * 100) : 0;
      const rawNet = normalizedGross - discountAmt;
      const netAmount = Math.round(rawNet);
      const roundOff = roundToTwo(netAmount - rawNet);

      return { discountPer, discountAmt, netAmount, roundOff };
    }, []);

    const calculateFromAmountWithRoundOff = calculateFromAmount;

    // payment
    useEffect(() => {
      if (paymentBilling && Object.keys(paymentBilling).length > 0) {
        const gross = toNumber(paymentBilling.grossBillAmount);
        const discAmt = toNumber(paymentBilling.totalDiscAmtOnBill);
        const discPer = toNumber(paymentBilling.totalDiscPerOnBill);

        if (discAmt > 0) {
          wasServiceDiscountAppliedRef.current = true;
          const rawNet = gross - discAmt;
          const netAmount = Math.round(rawNet);
          const roundOff = roundToTwo(netAmount - rawNet);

          setBillingState({
            grossBillAmount: gross,
            totalDiscAmtOnBill: discAmt,
            totalDiscPerOnBill: discPer,
            netAmount: netAmount,
            roundOff: roundOff,
          });
        } else {
          let discOverride = billingValues?.totalDiscAmtOnBill ?? 0;
          if (wasServiceDiscountAppliedRef.current) {
            discOverride = 0;
            wasServiceDiscountAppliedRef.current = false;
          }

          const { discountPer, discountAmt, netAmount, roundOff } = calculateFromAmountWithRoundOff(
            gross,
            discOverride
          );
          setBillingState({
            grossBillAmount: gross,
            totalDiscPerOnBill: discountPer,
            totalDiscAmtOnBill: discountAmt,
            netAmount: netAmount,
            roundOff: roundOff,
          });
        }
      }
    }, [
      billingValues?.totalDiscAmtOnBill,
      calculateFromAmountWithRoundOff,
      paymentBilling,
      setBillingState,
    ]);

    useEffect(() => {
      if (!isPaymentCollectionPrefill || !bookingDiscountPrefill) return;

      setBillingState({
        grossBillAmount: Number(bookingDiscountPrefill.grossBillAmount ?? 0),
        totalDiscPerOnBill: Number(bookingDiscountPrefill.totalDiscPerOnBill ?? 0),
        totalDiscAmtOnBill: Number(bookingDiscountPrefill.totalDiscAmtOnBill ?? 0),
        roundOff: Number(bookingDiscountPrefill.roundOff ?? 0),
        netAmount: Number(bookingDiscountPrefill.netAmount ?? 0),
        discApprovedById: Number(bookingDiscountPrefill.discApprovedById ?? 0),
        discApprovedName: String(bookingDiscountPrefill.discApprovedName ?? ""),
        discountReason: String(bookingDiscountPrefill.discountReason ?? ""),
        remarks: String(bookingDiscountPrefill.remarks ?? ""),
      });
    }, [bookingDiscountPrefill, isPaymentCollectionPrefill, setBillingState]);

    const hasAnyDiscount =
      toNumber(billingValues?.totalDiscAmtOnBill) > 0 ||
      toNumber(billingValues?.totalDiscPerOnBill) > 0 ||
      toNumber(paymentBilling?.totalDiscAmtOnBill) > 0 ||
      toNumber(paymentBilling?.totalDiscPerOnBill) > 0;

    const validateDiscountFields = () => {
      if (!hasAnyDiscount) {
        setBillingFieldErrors({});
        return true;
      }

      const nextErrors: Partial<Record<"discApprovedById" | "discountReason" | "remarks", string>> =
        {};

      if (!Number(billingValues?.discApprovedById)) {
        nextErrors.discApprovedById = "Discount Approved By is required";
      }

      if (!String(billingValues?.discountReason ?? "").trim()) {
        nextErrors.discountReason = "Discount Reason is required";
      }

      if (!String(billingValues?.remarks ?? "").trim()) {
        nextErrors.remarks = "Remark is required";
      }

      setBillingFieldErrors(nextErrors);
      return Object.keys(nextErrors).length === 0;
    };

    const clearDiscountFieldErrors = () => {
      setBillingFieldErrors({});
    };

    const calculateFromPercentage = (gross: number, discountPerInput: unknown) => {
      const normalizedGross = Math.max(0, gross);
      const discountPer = roundToTwo(Math.min(100, Math.max(0, toNumber(discountPerInput))));
      const discountAmt = roundToTwo((normalizedGross * discountPer) / 100);
      const rawNet = normalizedGross - discountAmt;
      const netAmount = Math.round(rawNet);
      const roundOff = roundToTwo(netAmount - rawNet);

      return { discountPer, discountAmt, netAmount, roundOff };
    };

    // discount approved by
    const getDiscountApprovedBy = async () => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_DISCOUNT_APPROVAL_MASTER_LIST,

        {},
        {},
        { component: "BillingDetails" }
      );
      setDiscountApproveList(resp?.data ?? []);
    };

    useEffect(() => {
      getDiscountApprovedBy();
    }, []);

    useEffect(() => {
      const approvedById = Number(billingValues?.discApprovedById ?? 0);
      const approvedByName = String(billingValues?.discApprovedName ?? "").trim();
      if (!approvedById || !approvedByName) return;

      setDiscountApproveList(prev => {
        if (prev.some(item => Number(item.id) === approvedById)) {
          return prev;
        }

        return [
          ...prev,
          {
            id: approvedById,
            name: approvedByName,
            isActive: 1,
            discountType: "",
            branchName: "",
            firstName: approvedByName,
          },
        ];
      });
    }, [billingValues?.discApprovedById, billingValues?.discApprovedName]);

    // payment methods
    const getPaymentMethod = useCallback(async () => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_PAYMENT_MODE_MASTER_LIST,
        {},
        { params: { isActive: Status?.ACTIVE } }
      );
      setPaymentList(resp?.data ?? []);
    }, []);

    // bank list
    const getBankList = useCallback(async () => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_BANK_LIST,
        {},
        { params: { isActive: Status?.ACTIVE } }
      );
      setBankList(resp?.data ?? []);
    }, []);

    useEffect(() => {
      getPaymentMethod();
      getBankList();
    }, [getBankList, getPaymentMethod]);

    // discount % validation

    const discountPercentageChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);

      if (value > Number(maxDiscountPercentage ?? 0)) {
        showWarning(`Maximum allowed discount is ${maxDiscountPercentage}%`);
        return;
      }

      const gross = toNumber(billingValues?.grossBillAmount);

      const { discountPer, discountAmt, netAmount, roundOff } = calculateFromPercentage(
        gross,
        value
      );

      setBillingState({
        totalDiscPerOnBill: discountPer,
        totalDiscAmtOnBill: discountAmt,
        netAmount,
        roundOff,
      });

      if (discountAmt <= 0) {
        clearDiscountFieldErrors();
      }
    };

    // discount amount validation
    const discountAmountChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
      const discountAmount = Number(e.target.value);

      const gross = toNumber(billingValues?.grossBillAmount);

      const discountPer = gross > 0 ? (discountAmount / gross) * 100 : 0;

      if (discountPer > Number(maxDiscountPercentage ?? 0)) {
        showWarning(`Maximum allowed discount is ${maxDiscountPercentage}%`);
        return;
      }

      const { discountAmt, netAmount, roundOff } = calculateFromAmount(gross, discountAmount);

      setBillingState({
        totalDiscPerOnBill: Number(discountPer.toFixed(2)),
        totalDiscAmtOnBill: discountAmt,
        netAmount,
        roundOff,
      });

      if (discountAmt <= 0) {
        clearDiscountFieldErrors();
      }
    };
    const discountApprovedHandler = (e: ChangeEvent<HTMLSelectElement>) => {
      const value = Number(e.target.value) || 0;
      const selectedApprover = discountApproveList?.find(item => Number(item?.id) === value);
      setBillingState({
        discApprovedById: value,
        discApprovedName: selectedApprover?.name ?? "",
      });
      setBillingFieldErrors(prev => ({ ...prev, discApprovedById: undefined }));
    };

    const discountChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
      setBillingState({ discountReason: e.target.value });
      setBillingFieldErrors(prev => ({ ...prev, discountReason: undefined }));
    };

    const remarkChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
      setBillingState({ remarks: e.target.value });
      setBillingFieldErrors(prev => ({ ...prev, remarks: undefined }));
    };

    const getPaymentPayload = useCallback(() => {
      const isCopaymentReceipt = toNumber(copaymentAmount) > 0 ? 1 : 0;

      const regularPayments = rows
        .filter(r => Number(r.amount) > 0 && !!r.paymentModeId)
        .map(r => {
          const selectedMode = paymentList.find(p => p.paymentModeId === r.paymentModeId);
          return {
            paymentModeId: Number(r.paymentModeId) || 0,
            paymentModeTypeId: Number(
              selectedMode?.payModeTypeId ?? selectedMode?.paymentModeTypeId ?? 0
            ),
            amount: Number(r.amount) || 0,
            bankId: Number(r.bankId) || 0,
            refNo: String(r.refNo ?? ""),
            isCopaymentReceipt,
            isPatientAdvanceAmount: 0,
            plutusTransactionReferenceID: "",
            transactionLogId: "",
          };
        });

      if (showPatientAdvanceRow && patientAdvanceUsed > 0) {
        return [...regularPayments, buildPatientAdvancePaymentEntry(patientAdvanceUsed)];
      }

      return regularPayments;
    }, [copaymentAmount, paymentList, patientAdvanceUsed, rows, showPatientAdvanceRow]);

    useEffect(() => {
      const regularTotal = getRegularPaymentsTotal(rows);
      const advanceUsed = showPatientAdvanceRow ? patientAdvanceUsed : 0;
      const totalCollected = getTotalCollectedAmount(regularTotal, advanceUsed);
      const balanceAmount = roundToTwo(toNumber(billingValues?.netAmount) - totalCollected);

      if (roundToTwo(toNumber(billingValues?.balanceAmount)) === balanceAmount) {
        return;
      }

      setBillingState({ balanceAmount });
    }, [
      billingValues?.balanceAmount,
      billingValues?.netAmount,
      patientAdvanceUsed,
      rows,
      showPatientAdvanceRow,
      setBillingState,
    ]);

    useImperativeHandle(
      ref,
      () => ({
        validateForm: async () => {
          const isDiscountFieldsValid = validateDiscountFields();
          const isPaymentValid = validatePaymentRows();
          return isDiscountFieldsValid && isPaymentValid;
        },
        validateDiscountFields,
        getPayload: () => ({
          ...billingValues,
          payments: getPaymentPayload(),
        }),
        getNetAmount: () => toNumber(billingValues?.netAmount),
        reset: () => {
          const cash = paymentList.find(p => p.paymentModeName.toLowerCase() === "cash");
          setRows([
            {
              paymentModeId: cash?.paymentModeId ?? null,
              amount: "0",
              bankId: null,
              refNo: "",
              isCopaymentReceipt: 0,
            },
          ]);
          // setPaymentValidationError("");
          setRowErrors({});
          setCopaymentAmount(0);
          setPatientAdvanceUsed(0);
          setBillingState({
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
          setBillingFieldErrors({});
        },
      }),
      [
        billingValues,
        creditCopayment,
        getPaymentPayload,
        getMaxPaymentAmount,
        patientAdvanceUsed,
        paymentList,
        rows,
        showPatientAdvanceRow,
        hasAnyDiscount,
      ]
    );

    const advanceAmountChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
      const nextValue = toNumber(e.target.value);

      if (nextValue < 0) {
        showWarning("Amount cannot be negative.");
        return;
      }

      const netAmount = toNumber(billingValues?.netAmount);
      const isSingleCashRow =
        rows.length === 1 && rows[0]?.paymentModeId !== null && isCashMode(rows[0].paymentModeId);
      const regularTotal = isSingleCashRow ? 0 : getRegularPaymentsTotal(rows);
      const maxAdvance = getMaxPatientAdvanceUsable(
        netAmount,
        availablePatientAdvance,
        regularTotal
      );

      if (nextValue > availablePatientAdvance) {
        showWarning("Advance amount cannot be greater than available patient advance.");
        return;
      }

      if (nextValue > maxAdvance) {
        showWarning("Advance amount cannot exceed remaining net amount.");
        return;
      }

      setPatientAdvanceUsed(roundPaymentAmount(nextValue));
    };

    const useSplitBillingLayout = !hideBillingSection;
    const paymentRowCount = rows.length + (showPatientAdvanceRow ? 1 : 0);
    const paymentTableSizeClass =
      paymentRowCount > 1 || showPatientAdvanceRow ? "lg:min-h-56" : "lg:min-h-48";

    const renderPaymentCellError = (message?: string) => (
      <p className={`input-field-error billing-payment-cell-error ${message ? "" : "invisible"}`}>
        {message || " "}
      </p>
    );

    return (
      <div className="flex flex-col lg:flex-row  gap-3 w-full">
        {!hideBillingSection && (
          <div
            className={`billing details w-full min-w-0 ${useSplitBillingLayout ? "lg:w-1/2" : ""}`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <InputField label="Gross Bill Amount">
                <input
                  className="disabled-input-field w-full"
                  disabled={true}
                  value={billingValues?.grossBillAmount ?? 0}
                  readOnly
                />
              </InputField>

              <InputField label="Bill Disc(%)">
                <input
                  type="text"
                  className={
                    isServiceDiscountApplied || disableDiscountEditing
                      ? "disabled-input-field w-full"
                      : "input-field w-full"
                  }
                  value={billingValues?.totalDiscPerOnBill ?? 0}
                  onInput={allowOnlyNumbers}
                  onChange={discountPercentageChangeHandler}
                  disabled={isServiceDiscountApplied || disableDiscountEditing}
                />
              </InputField>

              <InputField label="Bill Disc Amount">
                <input
                  type="text"
                  className={
                    isServiceDiscountApplied || disableDiscountEditing
                      ? "disabled-input-field w-full"
                      : "input-field w-full"
                  }
                  value={billingValues?.totalDiscAmtOnBill ?? 0}
                  onInput={allowOnlyNumbers}
                  onChange={discountAmountChangeHandler}
                  disabled={isServiceDiscountApplied || disableDiscountEditing}
                />
              </InputField>

              <InputField label="Round Off">
                <input
                  type="text"
                  className="disabled-input-field"
                  value={billingValues?.roundOff ?? 0}
                  disabled={true}
                  readOnly
                />
              </InputField>

              <InputField label="Net Amount">
                <input
                  className="disabled-input-field  text-red-500 font-bold"
                  value={billingValues?.netAmount ?? 0}
                  disabled={true}
                  readOnly
                />
              </InputField>

              <InputField label="Balance Amount">
                <input
                  className="disabled-input-field "
                  value={billingValues?.balanceAmount ?? 0}
                  readOnly
                  disabled={true}
                />
              </InputField>

              {creditCopayment && (
                <InputField label="Co-payment">
                  <input
                    className="input-field"
                    value={copaymentAmount}
                    onInput={allowOnlyNumbers}
                    onChange={e => {
                      const nextCopaymentAmount = Number(e.target.value);
                      const regularTotal = getRegularPaymentsTotal(rows);
                      const advanceUsed = showPatientAdvanceRow ? patientAdvanceUsed : 0;
                      const totalCollected = getTotalCollectedAmount(regularTotal, advanceUsed);
                      if (nextCopaymentAmount > 0 && totalCollected > nextCopaymentAmount) {
                        showWarning("Total paid amount cannot exceed Co-payment amount");
                        return;
                      }
                      setCopaymentAmount(nextCopaymentAmount);
                    }}
                  />
                </InputField>
              )}

              <InputField label="Discount Approved By">
                <select
                  className="input-field"
                  onChange={discountApprovedHandler}
                  value={billingValues?.discApprovedById || ""}
                >
                  <option value="">Select</option>
                  {discountApproveList?.map(b => (
                    <option key={b?.id} value={b?.id}>
                      {b?.name}
                    </option>
                  ))}
                </select>
                {!!billingFieldErrors.discApprovedById && (
                  <p className="input-field-error">{billingFieldErrors.discApprovedById}</p>
                )}
              </InputField>

              <InputField label="Discount Reason">
                <input
                  className="input-field"
                  type="text"
                  placeholder="Enter discount reason"
                  value={billingValues?.discountReason ?? ""}
                  onChange={discountChangeHandler}
                />
                {!!billingFieldErrors.discountReason && (
                  <p className="input-field-error">{billingFieldErrors.discountReason}</p>
                )}
              </InputField>

              <InputField label="Remark">
                <input
                  className="input-field"
                  type="text"
                  placeholder="Enter remarks"
                  value={billingValues?.remarks ?? ""}
                  onChange={remarkChangeHandler}
                />
                {!!billingFieldErrors.remarks && (
                  <p className="input-field-error">{billingFieldErrors.remarks}</p>
                )}
              </InputField>
            </div>
          </div>
        )}

        {shouldShowPaymentMode && (
          <div
            className={`payment details w-full min-w-0 ${
              useSplitBillingLayout ? "lg:w-1/2" : ""
            }`}
          >
            <div className="overflow-x-auto w-full">
              <div className="table-container">
                <div className="table-scroll-wrapper">
                  <div className={`table-size w-full ${paymentTableSizeClass}`}>
                    <table className="base-table w-full">
                      <thead className="table-head">
                        <tr>
                          {BillingPaymentTableHeader.map((h, i) => (
                            <th key={i} className="table-th">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody className="billing-payment-rows">
                        {showPatientAdvanceRow && (
                          <tr>
                            <td className="align-top">
                              <div className="billing-payment-cell">
                                <input
                                  className="input-field max-w-40 font-semibold mt-2 ml-1"
                                  value="Patient Advance"
                                  readOnly
                                  disabled
                                />
                                {renderPaymentCellError()}
                              </div>
                            </td>

                            <td className="align-top">
                              <div className="billing-payment-cell">
                                <input
                                  type="text"
                                  className="input-field max-w-30 mt-2"
                                  value={patientAdvanceUsed}
                                  onInput={allowOnlyNumbers}
                                  onChange={advanceAmountChangeHandler}
                                />
                                {renderPaymentCellError()}
                              </div>
                            </td>

                            <td className="text-center align-top">-</td>

                            <td className="text-center align-top">-</td>

                            <td className="text-center align-top">-</td>
                          </tr>
                        )}
                        {rows.map((row, index) => (
                          <tr key={index}>
                            <td className="align-top">
                              <div className="billing-payment-cell">
                                <select
                                  className="input-field max-w-40 mt-2 ml-1"
                                  value={row.paymentModeId ?? ""}
                                  onChange={e => handlePaymentChange(index, Number(e.target.value))}
                                >
                                  <option value="">Select</option>

                                  {getAvailablePaymentModes(index).map(p => (
                                    <option key={p.paymentModeId} value={p.paymentModeId}>
                                      {p.paymentModeName}
                                    </option>
                                  ))}
                                </select>
                                {renderPaymentCellError(rowErrors[index]?.paymentModeId)}
                              </div>
                            </td>

                            <td className="align-top">
                              <div className="billing-payment-cell">
                                <input
                                  className="input-field max-w-30 mt-2"
                                  placeholder="Amount"
                                  value={row.amount}
                                  onInput={allowOnlyNumbers}
                                  onChange={e =>
                                    handleRowValueChange(index, "amount", e.target.value)
                                  }
                                />
                                {renderPaymentCellError(rowErrors[index]?.amount)}
                              </div>
                            </td>

                            <td className="align-top">
                              <div className="billing-payment-cell">
                                {isCardMode(row.paymentModeId) ? (
                                  <select
                                    className="input-field max-w-30 mt-2 ml-1"
                                    value={row.bankId ?? ""}
                                    onChange={e =>
                                      handleRowValueChange(
                                        index,
                                        "bankId",
                                        Number(e.target.value) || null
                                      )
                                    }
                                  >
                                    <option value="">Select</option>
                                    {bankList.map(bank => (
                                      <option key={bank.bankId} value={bank.bankId}>
                                        {bank.bankName}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="inline-block mt-2 ml-1">-</span>
                                )}
                                {renderPaymentCellError(rowErrors[index]?.bankId)}
                              </div>
                            </td>

                            <td className="align-top">
                              <div className="billing-payment-cell">
                                {!isCashMode(row.paymentModeId) ? (
                                  <input
                                    className="input-field max-w-40 mt-2 ml-2"
                                    placeholder="Reference Number "
                                    value={row.refNo}
                                    onChange={e =>
                                      handleRowValueChange(index, "refNo", e.target.value)
                                    }
                                  />
                                ) : (
                                  <span className="inline-block mt-2 ml-2">-</span>
                                )}
                                {renderPaymentCellError(rowErrors[index]?.refNo)}
                              </div>
                            </td>

                            <td className="table-td text-center">
                              {index > 0 ? (
                                <button
                                  type="button"
                                  title="Remove payment row"
                                  onClick={() => handleRemoveRow(index)}
                                >
                                  <i className="fa-solid fa-trash icon-color-delete cursor-pointer" />
                                </button>
                              ) : (
                                <span>-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="w-full text-right">
                  <button type="button" className="save-btn mt-2" onClick={handleAddRow}>
                    Add Row
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {useSplitBillingLayout && !shouldShowPaymentMode && (
          <div className="payment details hidden lg:block lg:w-1/2 min-w-0" aria-hidden="true" />
        )}

        {loading && <CustomLoader isLoading={loading} />}
      </div>
    );
  }
);

export default BillingDetails;
export type { BillingDetailsHandle } from "./types";
