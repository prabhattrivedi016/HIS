import {
  BankItems,
  BillingDetailsHandle,
  BillingValuesItem,
  DiscountApproveItem,
  PaymentBillingSummary,
  PaymentItems,
} from "@/components/BillingDetails/types";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { Status } from "@/constants/constants";
import { BillingPaymentTableHeader } from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError } from "@/utils/alert";
import { allowOnlyNumbers } from "@/utils/inputValidationHandler";
import {
  ChangeEvent,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

type RefundBillingDetailsProps = {
  setBillingValues?: (
    value: BillingValuesItem | ((prev: BillingValuesItem) => BillingValuesItem)
  ) => void;
  billingValues?: BillingValuesItem;
  paymentBilling?: PaymentBillingSummary;
  showPaymentMode?: boolean;
  corporateId?: number;
};

type PaymentRow = {
  paymentModeId: number | null;
  amount: string;
  bankId: number | null;
  refNo: string;
  isCopaymentReceipt: number | null;
};

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

const roundToTwo = (value: number) => Number(value.toFixed(2));

const toNumber = (value: unknown) => {
  if (value === "" || value === null || value === undefined) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getRegularPaymentsTotal = (rows: PaymentRow[]) =>
  roundToTwo(rows.reduce((sum, row) => sum + toNumber(row.amount), 0));

const RefundBillingDetails = forwardRef<BillingDetailsHandle, RefundBillingDetailsProps>(
  (
    {
      setBillingValues,
      billingValues: initialBillingValues,
      paymentBilling,
      showPaymentMode = true,
      corporateId = 0,
    },
    ref
  ) => {
    const { loading, fetchApi } = useGlobalApi();
    const billingValues = initialBillingValues || defaultBillingValues;

    const [paymentList, setPaymentList] = useState<PaymentItems[]>([]);
    const [bankList, setBankList] = useState<BankItems[]>([]);
    const [refundApproveList, setRefundApproveList] = useState<DiscountApproveItem[]>([]);
    const [fieldErrors, setFieldErrors] = useState<
      Partial<Record<"discApprovedById" | "discountReason" | "remarks", string>>
    >({});
    const [rowErrors, setRowErrors] = useState<
      Record<number, Partial<Record<"paymentModeId" | "amount" | "bankId" | "refNo", string>>>
    >({});
    const [rows, setRows] = useState<PaymentRow[]>([
      {
        paymentModeId: null,
        amount: "0",
        bankId: null,
        refNo: "",
        isCopaymentReceipt: 0,
      },
    ]);

    const setBillingState = useCallback(
      (nextValues: Partial<BillingValuesItem>) => {
        setBillingValues?.((prev: BillingValuesItem) => ({
          ...prev,
          ...nextValues,
        }));
      },
      [setBillingValues]
    );

    const getPaymentModeById = (paymentModeId: number | null) =>
      paymentList.find(item => Number(item.paymentModeId) === Number(paymentModeId));

    const isCashMode = (paymentModeId: number | null) => {
      const mode = getPaymentModeById(paymentModeId);
      return (
        mode?.paymentModeName?.toLowerCase() === "cash" ||
        mode?.payModeType?.toLowerCase() === "cash"
      );
    };

    const shouldShowBankField = (paymentModeId: number | null) =>
      Number(getPaymentModeById(paymentModeId)?.showBankField) === 1;

    const shouldShowReferenceField = (paymentModeId: number | null) =>
      Number(getPaymentModeById(paymentModeId)?.showReferenceNumberField) === 1;

    const showPaymentAmountExceededWarning = useCallback(() => {
      showError("Total refund payment amount cannot exceed Net Amount");
    }, []);

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

      if (getRegularPaymentsTotal(updatedRows) > toNumber(billingValues.netAmount)) {
        showPaymentAmountExceededWarning();
        return;
      }

      setRows(updatedRows);
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

      const updatedRows = [...rows];
      updatedRows[index] = {
        ...updatedRows[index],
        paymentModeId: value || null,
        bankId: value && shouldShowBankField(value) ? updatedRows[index].bankId : null,
        refNo: value && shouldShowReferenceField(value) ? updatedRows[index].refNo : "",
      };

      if (value && toNumber(updatedRows[index].amount) === 0) {
        const otherTotal = updatedRows.reduce(
          (sum, row, rowIndex) => (rowIndex === index ? sum : sum + toNumber(row.amount)),
          0
        );
        const remaining = Math.max(0, toNumber(billingValues.netAmount) - otherTotal);
        if (remaining > 0) {
          updatedRows[index] = { ...updatedRows[index], amount: String(remaining) };
        }
      }

      setRows(updatedRows);
    };

    const getAvailablePaymentModes = (currentIndex: number) => {
      const selectedIds = rows.map(row => row.paymentModeId);

      return paymentList.filter(
        mode =>
          Number(mode.isExcludedFromPaymentList) !== 1 &&
          (!selectedIds.includes(mode.paymentModeId) ||
            rows[currentIndex].paymentModeId === mode.paymentModeId)
      );
    };

    const validateApprovalFields = () => {
      const nextErrors: Partial<Record<"discApprovedById" | "discountReason" | "remarks", string>> =
        {};

      if (!Number(billingValues.discApprovedById)) {
        nextErrors.discApprovedById = "Refund Approved By is required";
      }

      if (!String(billingValues.discountReason ?? "").trim()) {
        nextErrors.discountReason = "Approved Reason is required";
      }

      if (!String(billingValues.remarks ?? "").trim()) {
        nextErrors.remarks = "Remark is required";
      }

      setFieldErrors(nextErrors);
      return Object.keys(nextErrors).length === 0;
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

        if (!hasAnyValue && !strictForAddRow) continue;

        const errors: Partial<Record<"paymentModeId" | "amount" | "bankId" | "refNo", string>> = {};

        if (row.paymentModeId === null) {
          errors.paymentModeId = "Select payment mode";
          hasError = true;
        }

        if (toNumber(row.amount) <= 0) {
          errors.amount = "Enter valid amount";
          hasError = true;
        }

        if (shouldShowReferenceField(row.paymentModeId) && !String(row.refNo).trim()) {
          errors.refNo = "Reference no. required";
          hasError = true;
        }

        if (shouldShowBankField(row.paymentModeId) && !row.bankId) {
          errors.bankId = "Bank required for card";
          hasError = true;
        }

        if (Object.keys(errors).length > 0) {
          nextRowErrors[index] = errors;
        }
      }

      setRowErrors(nextRowErrors);
      return !hasError;
    };

    const handleAddRow = () => {
      if (!validatePaymentRows(true)) return;

      setRows(prev => [
        ...prev,
        {
          paymentModeId: null,
          amount: "0",
          bankId: null,
          refNo: "",
          isCopaymentReceipt: 0,
        },
      ]);
    };

    const handleRemoveRow = (index: number) => {
      if (index === 0 || rows.length <= 1) return;
      setRows(prev => prev.filter((_, rowIndex) => rowIndex !== index));
      setRowErrors({});
    };

    const refundApprovedHandler = (e: ChangeEvent<HTMLSelectElement>) => {
      const value = Number(e.target.value) || 0;
      const selectedApprover = refundApproveList.find(item => Number(item.id) === value);

      setBillingState({
        discApprovedById: value,
        discApprovedName: selectedApprover?.name ?? "",
      });
      setFieldErrors(prev => ({ ...prev, discApprovedById: undefined }));
    };

    const approvedReasonHandler = (e: ChangeEvent<HTMLInputElement>) => {
      setBillingState({ discountReason: e.target.value });
      setFieldErrors(prev => ({ ...prev, discountReason: undefined }));
    };

    const remarkChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
      setBillingState({ remarks: e.target.value });
      setFieldErrors(prev => ({ ...prev, remarks: undefined }));
    };

    const getPaymentPayload = useCallback(
      () =>
        rows
          .filter(row => {
            if (!(Number(row.amount) > 0 && !!row.paymentModeId)) return false;
            const selectedMode = paymentList.find(p => p.paymentModeId === row.paymentModeId);
            return Number(selectedMode?.isExcludedFromPaymentList) !== 1;
          })
          .map(row => {
            const selectedMode = paymentList.find(p => p.paymentModeId === row.paymentModeId);
            return {
              paymentModeId: Number(row.paymentModeId) || 0,
              paymentModeTypeId: Number(selectedMode?.payModeTypeId ?? 0),
              amount: Number(row.amount) || 0,
              bankId: shouldShowBankField(row.paymentModeId) ? Number(row.bankId) || 0 : 0,
              refNo: shouldShowReferenceField(row.paymentModeId) ? String(row.refNo ?? "") : "",
              isCopaymentReceipt: 0,
              isPatientAdvanceAmount: 0,
              plutusTransactionReferenceID: "",
              transactionLogId: "",
            };
          }),
      [paymentList, rows]
    );

    const reset = useCallback(() => {
      const cash = paymentList.find(p => p.paymentModeName?.toLowerCase() === "cash");
      setRows([
        {
          paymentModeId: cash?.paymentModeId ?? null,
          amount: "0",
          bankId: null,
          refNo: "",
          isCopaymentReceipt: 0,
        },
      ]);
      setRowErrors({});
      setFieldErrors({});
      setBillingState(defaultBillingValues);
    }, [paymentList, setBillingState]);

    useImperativeHandle(
      ref,
      () => ({
        validateForm: async () =>
          showPaymentMode
            ? validateApprovalFields() && validatePaymentRows()
            : validateApprovalFields(),
        validateDiscountFields: validateApprovalFields,
        getPayload: () => ({
          ...billingValues,
          payments: showPaymentMode ? getPaymentPayload() : [],
        }),
        getNetAmount: () => toNumber(billingValues.netAmount),
        reset,
      }),
      [billingValues, getPaymentPayload, reset, rows, showPaymentMode]
    );

    useEffect(() => {
      if (!paymentBilling) return;

      const grossBillAmount = toNumber(paymentBilling.grossBillAmount);
      const totalDiscAmtOnBill = toNumber(paymentBilling.totalDiscAmtOnBill);
      const totalDiscPerOnBill = toNumber(paymentBilling.totalDiscPerOnBill);
      const rawNet = grossBillAmount - totalDiscAmtOnBill;
      const netAmount = Math.round(rawNet);
      const roundOff = roundToTwo(netAmount - rawNet);

      setBillingState({
        grossBillAmount,
        totalDiscAmtOnBill,
        totalDiscPerOnBill,
        roundOff,
        netAmount,
      });
    }, [paymentBilling, setBillingState]);

    useEffect(() => {
      if (!showPaymentMode) return;
      const totalPaid = getRegularPaymentsTotal(rows);
      const balanceAmount = roundToTwo(toNumber(billingValues.netAmount) - totalPaid);

      if (roundToTwo(toNumber(billingValues.balanceAmount)) === balanceAmount) return;
      setBillingState({ balanceAmount });
    }, [
      billingValues.balanceAmount,
      billingValues.netAmount,
      rows,
      setBillingState,
      showPaymentMode,
    ]);

    useEffect(() => {
      if (!showPaymentMode || !paymentList.length) return;

      const cash =
        paymentList.find(p => p.paymentModeName?.toLowerCase() === "cash") ?? paymentList[0];
      if (!cash) return;

      const targetAmount =
        toNumber(billingValues.netAmount) > 0 ? String(billingValues.netAmount) : "0";
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
          return prev[0].amount === targetAmount ? prev : [{ ...prev[0], amount: targetAmount }];
        }

        if (
          prev.length === 1 &&
          toNumber(prev[0].amount) === 0 &&
          toNumber(billingValues.netAmount) > 0
        ) {
          return [{ ...prev[0], amount: targetAmount }];
        }

        return prev;
      });
    }, [billingValues.netAmount, paymentList, showPaymentMode]);

    useEffect(() => {
      const getRefundApprovedBy = async () => {
        const resp = await fetchApi(
          "GET",
          ENDPOINTS.GET_DISCOUNT_APPROVAL_MASTER_LIST,
          {},
          {},
          { component: "RefundBillingDetails" }
        );
        setRefundApproveList(resp?.data ?? []);
      };

      const getBanks = async () => {
        const resp = await fetchApi(
          "GET",
          ENDPOINTS.GET_BANK_LIST,
          {},
          { params: { isActive: Status.ACTIVE } },
          { component: "RefundBillingDetails" }
        );
        setBankList(resp?.data ?? []);
      };

      getRefundApprovedBy();
      getBanks();
    }, []);

    const normalizePaymentModes = (payload: unknown): PaymentItems[] => {
      const list = Array.isArray(payload)
        ? payload
        : payload &&
            typeof payload === "object" &&
            Array.isArray((payload as Record<string, unknown>).data)
          ? ((payload as Record<string, unknown>).data as unknown[])
          : [];

      return list
        .map((mode: unknown) => {
          const source = (mode ?? {}) as Record<string, unknown>;
          return {
            paymentModeId: Number(source.paymentModeId ?? source.PaymentModeId ?? 0),
            paymentModeName: String(source.paymentModeName ?? source.PaymentModeName ?? ""),
            payModeType: String(source.payModeType ?? source.PayModeType ?? ""),
            payModeTypeId: Number(source.payModeTypeId ?? source.PayModeTypeId ?? 0),
            showBankField: Number(source.showBankField ?? source.ShowBankField ?? 0),
            showReferenceNumberField: Number(
              source.showReferenceNumberField ?? source.ShowReferenceNumberField ?? 0
            ),
            isExcludedFromPaymentList: Number(
              source.isExcludedFromPaymentList ?? source.IsExcludedFromPaymentList ?? 0
            ),
          };
        })
        .filter(
          mode =>
            mode.paymentModeId > 0 && mode.paymentModeName && mode.isExcludedFromPaymentList !== 1
        );
    };

    useEffect(() => {
      if (!showPaymentMode) {
        setPaymentList([]);
        return;
      }

      let isActive = true;
      const resolvedCorporateId = Number(corporateId) || 1;

      const getPaymentMethods = async () => {
        const fetchModes = async (isRefundPaymentModes: number) => {
          const resp = await fetchApi(
            "GET",
            ENDPOINTS.GET_CORPORATE_PAYMENT_MODES,
            {},
            { params: { corporateId: resolvedCorporateId, isRefundPaymentModes } },
            { component: "RefundBillingDetails" }
          );
          return normalizePaymentModes(resp?.data ?? []);
        };

        // Prefer refund-allowed corporate modes; if none, use all corporate payment modes.
        let modes = await fetchModes(1);
        if (!modes.length) {
          modes = await fetchModes(0);
        }

        if (isActive) {
          setPaymentList(modes);
        }
      };

      void getPaymentMethods();

      return () => {
        isActive = false;
      };
    }, [corporateId, showPaymentMode]);

    const renderPaymentCellError = (message?: string) => (
      <p className={`input-field-error billing-payment-cell-error ${message ? "" : "invisible"}`}>
        {message || " "}
      </p>
    );

    return (
      <div className="flex flex-col lg:flex-row gap-3 w-full">
        <div className="billing details w-full min-w-0 lg:w-1/2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <InputField label="Gross Bill Amount">
              <input
                className="disabled-input-field w-full"
                value={billingValues.grossBillAmount}
                readOnly
                disabled
              />
            </InputField>

            <InputField label="Bill Disc(%)">
              <input
                className="disabled-input-field w-full"
                value={billingValues.totalDiscPerOnBill}
                readOnly
                disabled
              />
            </InputField>

            <InputField label="Bill Disc Amount">
              <input
                className="disabled-input-field w-full"
                value={billingValues.totalDiscAmtOnBill}
                readOnly
                disabled
              />
            </InputField>

            <InputField label="Round Off">
              <input
                className="disabled-input-field w-full"
                value={billingValues.roundOff}
                readOnly
                disabled
              />
            </InputField>

            <InputField label="Net Amount">
              <input
                className="disabled-input-field w-full text-red-500 font-bold"
                value={billingValues.netAmount}
                readOnly
                disabled
              />
            </InputField>

            <InputField label="Balance Amount">
              <input
                className="disabled-input-field w-full"
                value={billingValues.balanceAmount}
                readOnly
                disabled
              />
            </InputField>

            <InputField label="Refund Approved By">
              <select
                className="input-field"
                value={billingValues.discApprovedById || ""}
                onChange={refundApprovedHandler}
              >
                <option value="">Select</option>
                {refundApproveList.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              {!!fieldErrors.discApprovedById && (
                <p className="input-field-error">{fieldErrors.discApprovedById}</p>
              )}
            </InputField>

            <InputField label="Approved Reason">
              <input
                className="input-field"
                placeholder="Enter approved reason"
                value={billingValues.discountReason ?? ""}
                onChange={approvedReasonHandler}
              />
              {!!fieldErrors.discountReason && (
                <p className="input-field-error">{fieldErrors.discountReason}</p>
              )}
            </InputField>

            <InputField label="Remark">
              <input
                className="input-field"
                placeholder="Enter remarks"
                value={billingValues.remarks ?? ""}
                onChange={remarkChangeHandler}
              />
              {!!fieldErrors.remarks && <p className="input-field-error">{fieldErrors.remarks}</p>}
            </InputField>
          </div>
        </div>

        {showPaymentMode ? (
          <div className="payment details w-full min-w-0 lg:w-1/2">
            <div className="overflow-x-auto w-full">
              <div className="table-container">
                <div className="table-scroll-wrapper">
                  <div className="table-size w-full lg:min-h-48">
                    <table className="base-table w-full">
                      <thead className="table-head">
                        <tr>
                          {BillingPaymentTableHeader.map((header, index) => (
                            <th key={index} className="table-th">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody className="billing-payment-rows">
                        {rows.map((row, index) => (
                          <tr key={index}>
                            <td className="align-top">
                              <div className="billing-payment-cell">
                                <select
                                  className="input-field max-w-30 mt-2 ml-1"
                                  value={row.paymentModeId ?? ""}
                                  onChange={e => handlePaymentChange(index, Number(e.target.value))}
                                >
                                  <option value="">Select</option>
                                  {getAvailablePaymentModes(index).map(mode => (
                                    <option key={mode.paymentModeId} value={mode.paymentModeId}>
                                      {mode.paymentModeName}
                                    </option>
                                  ))}
                                </select>
                                {renderPaymentCellError(rowErrors[index]?.paymentModeId)}
                              </div>
                            </td>

                            <td className="align-top">
                              <div className="billing-payment-cell">
                                <input
                                  className="input-field max-w-20 mt-2"
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
                                {shouldShowBankField(row.paymentModeId) ? (
                                  <select
                                    className="input-field max-w-20 mt-2 ml-1"
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
                                {shouldShowReferenceField(row.paymentModeId) ? (
                                  <input
                                    className="input-field max-w-20 mt-2 ml-2"
                                    placeholder="Reference Number"
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
        ) : null}

        {loading && <CustomLoader isLoading={loading} />}
      </div>
    );
  }
);

RefundBillingDetails.displayName = "RefundBillingDetails";

export default RefundBillingDetails;
