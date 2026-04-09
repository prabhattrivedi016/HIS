import { ENDPOINTS } from "@/config/defaults";
import { Status } from "@/constants/constants";
import { BillingPaymentTableHeader } from "@/constants/tableHeaders";
import { BillingAmountContext } from "@/context/BillingAmountContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { allowOnlyNumbers } from "@/utils/inputValidationHandler";
import {
  ChangeEvent,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import InputField from "../customInputField";
import {
  BankItems,
  BillingDetailsHandle,
  BillingDetailsProps,
  BillingValuesItem,
  DiscountApproveItem,
  PaymentItems,
} from "./types";

const BillingDetails = forwardRef<BillingDetailsHandle, BillingDetailsProps>(
  ({ setOpdBilling, setBillingValues, billingValues: initialBillingValues }, ref) => {
    const { fetchApi } = useGlobalApi();

    const [paymentList, setPaymentList] = useState<PaymentItems[]>([]);
    const [bankList, setBankList] = useState<BankItems[]>([]);
    const [billingFieldErrors, setBillingFieldErrors] = useState<
      Partial<Record<"discApprovedById" | "discountReason" | "remarks", string>>
    >({});
    const [rowErrors, setRowErrors] = useState<
      Record<number, Partial<Record<"paymentModeId" | "amount" | "bankId" | "refNo", string>>>
    >({});

    // payment modes added
    const [rows, setRows] = useState<
      Array<{ paymentModeId: number | null; amount: string; bankId: number | null; refNo: string }>
    >([{ paymentModeId: null, amount: "", bankId: null, refNo: "" }]);

    useEffect(() => {
      if (paymentList.length > 0) {
        const cash = paymentList.find(p => p.paymentModeName.toLowerCase() === "cash");

        if (cash) {
          setRows([
            {
              paymentModeId: cash?.paymentModeId,
              amount: String(toNumber(initialBillingValues?.netAmount ?? totalBillingAmount) || ""),
              bankId: null,
              refNo: "",
            },
          ]);
        }
      }
    }, [paymentList]);

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
      return !hasError;
    };

    const handleAddRow = () => {
      if (!validatePaymentRows(true)) {
        return;
      }

      setRows(prev => [...prev, { paymentModeId: null, amount: "", bankId: null, refNo: "" }]);
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
      // setPaymentValidationError("");
      setRowErrors(prev => ({
        ...prev,
        [index]: {
          ...prev[index],
          [key]: undefined,
        },
      }));
      setRows(prev => prev.map((row, idx) => (idx === index ? { ...row, [key]: value } : row)));
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
      discountReason: "",
      remarks: "",
    };

    const billingValues = initialBillingValues || defaultBillingValues;

    const [discountApproveList, setDiscountApproveList] = useState<DiscountApproveItem[]>([]);
    const { totalBillingAmount } = useContext(BillingAmountContext);

    const toNumber = (value: unknown) => {
      if (value === "" || value === null || value === undefined) return 0;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    // Auto-fill cash amount from net amount when row is still empty.
    useEffect(() => {
      const netAmountValue = toNumber(billingValues?.netAmount);
      const cashMode = paymentList.find(p => p.paymentModeName.toLowerCase() === "cash");
      if (!cashMode) return;

      setRows(prev =>
        prev.map((row, idx) => {
          const isOnlyCashRow = prev.length === 1;
          const shouldAutoFill =
            isOnlyCashRow && idx === 0 && row.paymentModeId === cashMode.paymentModeId;
          if (!shouldAutoFill) return row;
          return { ...row, amount: String(netAmountValue || "") };
        })
      );
    }, [billingValues?.netAmount, paymentList]);

    const roundToTwo = (value: number) => Number(value.toFixed(2));
    const hasBillLevelDiscount =
      toNumber(billingValues?.totalDiscPerOnBill) > 0 ||
      toNumber(billingValues?.totalDiscAmtOnBill) > 0;

    const validateBillingDiscountFields = () => {
      if (!hasBillLevelDiscount) {
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

    const syncToOpdBilling = (nextValues: Partial<BillingValuesItem>) => {
      if (!setOpdBilling) return;
      setOpdBilling((prev: BillingValuesItem) => ({ ...prev, ...nextValues }));
    };

    const setBillingState = (nextValues: Partial<BillingValuesItem>) => {
      if (setBillingValues) {
        setBillingValues((prev: BillingValuesItem) => ({ ...prev, ...nextValues }));
      }
      syncToOpdBilling(nextValues);
    };

    const calculateFromPercentage = (gross: number, discountPerInput: unknown) => {
      const normalizedGross = Math.max(0, gross);
      const discountPer = roundToTwo(Math.min(100, Math.max(0, toNumber(discountPerInput))));
      const discountAmt = roundToTwo((normalizedGross * discountPer) / 100);
      const netAmount = roundToTwo(normalizedGross - discountAmt);

      return { discountPer, discountAmt, netAmount };
    };

    const calculateFromAmount = (gross: number, discountAmtInput: unknown) => {
      const normalizedGross = Math.max(0, gross);
      const discountAmt = roundToTwo(
        Math.min(normalizedGross, Math.max(0, toNumber(discountAmtInput)))
      );
      const discountPer =
        normalizedGross > 0 ? roundToTwo((discountAmt / normalizedGross) * 100) : 0;
      const netAmount = roundToTwo(normalizedGross - discountAmt);

      return { discountPer, discountAmt, netAmount };
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
      const gross = roundToTwo(toNumber(totalBillingAmount));
      const { discountPer, discountAmt, netAmount } = calculateFromAmount(
        gross,
        billingValues?.totalDiscAmtOnBill ?? 0
      );

      setBillingState({
        grossBillAmount: gross,
        totalDiscPerOnBill: discountPer,
        totalDiscAmtOnBill: discountAmt,
        netAmount,
      });
    }, [totalBillingAmount]);

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

    const discountPercentageChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
      const gross = toNumber(totalBillingAmount);
      const { discountPer, discountAmt, netAmount } = calculateFromPercentage(
        gross,
        e.target.value
      );

      setBillingState({
        totalDiscPerOnBill: discountPer,
        totalDiscAmtOnBill: discountAmt,
        netAmount,
      });
    };

    const discountAmountChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
      const gross = toNumber(totalBillingAmount);
      const { discountPer, discountAmt, netAmount } = calculateFromAmount(gross, e.target.value);

      setBillingState({
        totalDiscPerOnBill: discountPer,
        totalDiscAmtOnBill: discountAmt,
        netAmount,
      });
    };

    const discountApprovedHandler = (e: ChangeEvent<HTMLSelectElement>) => {
      const value = Number(e.target.value) || 0;
      setBillingState({ discApprovedById: value });
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
      return rows
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
            plutusTransactionReferenceID: "",
            transactionLogId: "",
          };
        });
    }, [paymentList, rows]);

    useEffect(() => {
      const totalPaid = rows.reduce((sum, r) => sum + toNumber(r.amount), 0);
      const balanceAmount = roundToTwo(toNumber(billingValues?.netAmount) - totalPaid);
      setBillingState({ balanceAmount });
    }, [rows, billingValues?.netAmount]);

    useImperativeHandle(
      ref,
      () => ({
        validateForm: async () => {
          const isBillingFieldsValid = validateBillingDiscountFields();
          const isPaymentValid = validatePaymentRows();
          return isBillingFieldsValid && isPaymentValid;
        },
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
              amount: "",
              bankId: null,
              refNo: "",
            },
          ]);
          // setPaymentValidationError("");
          setRowErrors({});
          setBillingState({
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
          setBillingFieldErrors({});
        },
      }),
      [billingValues, getPaymentPayload, paymentList, rows, hasBillLevelDiscount]
    );

    return (
      <div className="flex flex-col lg:flex-row mt-3 gap-3 w-full">
        <div className="billing details w-full lg:w-1/2">
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
                className="input-field w-full"
                value={billingValues?.totalDiscPerOnBill ?? 0}
                onInput={allowOnlyNumbers}
                onChange={discountPercentageChangeHandler}
              />
            </InputField>

            <InputField label="Bill Disc Amount">
              <input
                type="text"
                className="input-field"
                value={billingValues?.totalDiscAmtOnBill ?? 0}
                onInput={allowOnlyNumbers}
                onChange={discountAmountChangeHandler}
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
                type="text"
                className="input-field "
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
                type="text"
                placeholder="Enter remarks"
                className="input-field"
                value={billingValues?.remarks ?? ""}
                onChange={remarkChangeHandler}
              />
              {!!billingFieldErrors.remarks && (
                <p className="input-field-error">{billingFieldErrors.remarks}</p>
              )}
            </InputField>
          </div>
        </div>

        <div className="payment details w-full lg:w-1/2">
          <div className="overflow-x-auto w-full">
            <div className="table-container">
              <div className="table-scroll-wrapper">
                <div className="table-size w-full lg:min-h-60 lg:max-h-60">
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

                    <tbody>
                      {rows.map((row, index) => (
                        <tr key={index}>
                          <td>
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
                            {!!rowErrors[index]?.paymentModeId && (
                              <p className="input-field-error">{rowErrors[index]?.paymentModeId}</p>
                            )}
                          </td>

                          <td>
                            <input
                              className="input-field max-w-30"
                              placeholder="Amount"
                              value={row.amount}
                              onInput={allowOnlyNumbers}
                              onChange={e => handleRowValueChange(index, "amount", e.target.value)}
                            />
                            {!!rowErrors[index]?.amount && (
                              <p className="input-field-error">{rowErrors[index]?.amount}</p>
                            )}
                          </td>

                          <td>
                            {isCardMode(row.paymentModeId) ? (
                              <select
                                className="input-field max-w-30 m-1"
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
                              <span>-</span>
                            )}
                            {!!rowErrors[index]?.bankId && (
                              <p className="input-field-error">{rowErrors[index]?.bankId}</p>
                            )}
                          </td>

                          <td>
                            {!isCashMode(row.paymentModeId) ? (
                              <input
                                className="input-field max-w-40 ml-2"
                                placeholder="Reference Number "
                                value={row.refNo}
                                onChange={e => handleRowValueChange(index, "refNo", e.target.value)}
                              />
                            ) : (
                              <span>-</span>
                            )}
                            {!!rowErrors[index]?.refNo && (
                              <p className="input-field-error">{rowErrors[index]?.refNo}</p>
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
      </div>
    );
  }
);

export default BillingDetails;
export type { BillingDetailsHandle } from "./types";
