import { ENDPOINTS } from "@/config/defaults";
import { Status } from "@/constants/constants";
import { BillingPaymentTableHeader } from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import { PaymentItems, PaymentMethodsHandle } from "../types";

type BankItem = {
  bankId: number;
  bankName: string;
};

type PaymentRow = {
  paymentModeId: string;
  paymentModeTypeId: string;
  amount: string;
  bankId: string;
  refNo: string;
};

const PaymentMethods = forwardRef<PaymentMethodsHandle>((_, ref) => {
  const { fetchApi } = useGlobalApi();

  const [paymentList, setPaymentList] = useState<PaymentItems[]>([]);
  const [bankList, setBankList] = useState<BankItem[]>([]);
  const [duplicateError, setDuplicateError] = useState<string>("");
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});

  const [rows, setRows] = useState<PaymentRow[]>([
    {
      paymentModeId: "",
      paymentModeTypeId: "",
      amount: "",
      bankId: "",
      refNo: "",
    },
  ]);

  const getPaymentMethod = useCallback(async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PAYMENT_MODE_MASTER_LIST,
      {},
      { params: { isActive: Status?.ACTIVE } }
    );
    setPaymentList(resp?.data ?? []);
  }, []);

  const getBankListDetails = useCallback(async () => {
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
    getBankListDetails();
  }, [getBankListDetails, getPaymentMethod]);

  useEffect(() => {
    if (!paymentList.length) return;

    const cash = paymentList.find(p => p.paymentModeName === "Cash");

    if (cash) {
      setRows([
        {
          paymentModeId: String(cash.paymentModeId),
          paymentModeTypeId: String(cash.payModeTypeId ?? cash.paymentModeTypeId ?? ""),
          amount: "",
          bankId: "",
          refNo: "",
        },
      ]);
    }
  }, [paymentList]);

  const isModeUsedInOtherRows = (currentIndex: number, paymentModeId: number) => {
    return rows.some(
      (row, idx) => idx !== currentIndex && Number(row.paymentModeId) === paymentModeId
    );
  };

  const handleModeChange = (idx: number, value: string) => {
    const selectedModeId = Number(value);

    if (!selectedModeId) {
      setDuplicateError("");
      setRows(prev =>
        prev.map((row, i) =>
          i === idx
            ? { ...row, paymentModeId: "", paymentModeTypeId: "", bankId: "", refNo: "" }
            : row
        )
      );
      return;
    }

    if (isModeUsedInOtherRows(idx, selectedModeId)) {
      setDuplicateError("This payment mode is already selected");
      return;
    }

    setDuplicateError("");
    const selected = paymentList.find(p => p.paymentModeId === selectedModeId);

    setRows(prev =>
      prev.map((row, i) =>
        i === idx
          ? {
              ...row,
              paymentModeId: String(selected?.paymentModeId ?? ""),
              paymentModeTypeId: String(
                selected?.payModeTypeId ?? selected?.paymentModeTypeId ?? ""
              ),
              bankId: "",
              refNo: "",
            }
          : row
      )
    );
  };

  const handleChange = (idx: number, field: string, value: string) => {
    setDuplicateError("");
    setRows(prev => prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
  };

  const handleAddRow = () => {
    const usedModes = rows.map(r => r.paymentModeId).filter(Boolean);
    const hasDuplicate = usedModes.length !== new Set(usedModes).size;

    if (hasDuplicate) {
      setDuplicateError("Same payment mode already selected");
      return;
    }

    setDuplicateError("");
    setRows(prev => [
      ...prev,
      {
        paymentModeId: "",
        paymentModeTypeId: "",
        amount: "",
        bankId: "",
        refNo: "",
      },
    ]);
  };

  const isRowCompletelyEmpty = (row: PaymentRow) =>
    !row.paymentModeId && !row.paymentModeTypeId && !row.amount && !row.bankId && !row.refNo;

  const validateRows = useCallback(() => {
    let isValid = true;
    const nextErrors: Record<number, Record<string, string>> = {};
    let hasAtLeastOnePaymentAmount = false;

    rows.forEach((row, idx) => {
      const rowErrors: Record<string, string> = {};
      const typeId = Number(row.paymentModeTypeId);
      const amount = Number(row.amount);

      if (isRowCompletelyEmpty(row)) {
        nextErrors[idx] = rowErrors;
        return;
      }

      if (!row.paymentModeId) {
        rowErrors.paymentModeId = "Payment mode is required";
        isValid = false;
      }

      if (!row.amount) {
        rowErrors.amount = "Amount is required";
        isValid = false;
      } else if (!Number.isFinite(amount) || amount <= 0) {
        rowErrors.amount = "Amount must be greater than 0";
        isValid = false;
      } else {
        hasAtLeastOnePaymentAmount = true;
      }

      if (typeId !== 1 && !row.bankId) {
        rowErrors.bankId = "Bank is required";
        isValid = false;
      }

      if (typeId !== 1 && !row.refNo) {
        rowErrors.refNo = "Reference number is required";
        isValid = false;
      }

      nextErrors[idx] = rowErrors;
    });

    setErrors(nextErrors);
    if (!hasAtLeastOnePaymentAmount) {
      setDuplicateError("Enter at least one payment amount");
      return false;
    }
    return isValid;
  }, [rows]);

  const createPaymentPayload = useCallback(() => {
    const isValid = validateRows();
    if (!isValid) return null;

    return rows
      .filter(row => !isRowCompletelyEmpty(row) && Number(row.amount) > 0)
      .map(row => ({
        paymentModeId: Number(row.paymentModeId) || 0,
        paymentModeTypeId: Number(row.paymentModeTypeId) || 0,
        amount: Number(row.amount) || 0,
        bankId: Number(row.bankId) || 0,
        refNo: row.refNo?.trim() ?? "",
        plutusTransactionReferenceID: "",
        transactionLogId: "",
      }));
  }, [rows, validateRows]);

  useImperativeHandle(
    ref,
    () => ({
      validatePayments: () => validateRows(),
      getPaymentPayload: () => createPaymentPayload(),
    }),
    [createPaymentPayload, validateRows]
  );

  return (
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
                  {rows.map((row, idx) => {
                    const typeId = Number(row.paymentModeTypeId);
                    const isCash = typeId === 1;

                    return (
                      <tr key={idx} className="table-row">
                        <td className="table-td">
                          <select
                            className="input-field max-w-35"
                            value={row.paymentModeId}
                            onChange={e => handleModeChange(idx, e.target.value)}
                          >
                            <option value="">Select</option>
                            {paymentList.map(p => (
                              <option
                                key={p.paymentModeId}
                                value={p.paymentModeId}
                                disabled={isModeUsedInOtherRows(idx, p.paymentModeId)}
                              >
                                {p.paymentModeName}
                              </option>
                            ))}
                          </select>
                          <p className="input-field-error">{errors?.[idx]?.paymentModeId}</p>
                        </td>

                        <td className="table-td">
                          <input
                            className="input-field max-w-30"
                            value={row.amount}
                            onChange={e => handleChange(idx, "amount", e.target.value)}
                          />
                          <p className="input-field-error">{errors?.[idx]?.amount}</p>
                        </td>

                        <td className="table-td">
                          {!isCash && (
                            <>
                              <select
                                className="input-field"
                                value={row.bankId}
                                onChange={e => handleChange(idx, "bankId", e.target.value)}
                              >
                                <option value="">Select</option>
                                {bankList.map(b => (
                                  <option key={b.bankId} value={b.bankId}>
                                    {b.bankName}
                                  </option>
                                ))}
                              </select>
                              <p className="input-field-error">{errors?.[idx]?.bankId}</p>
                            </>
                          )}
                        </td>

                        <td className="table-td">
                          {!isCash && (
                            <>
                              <input
                                className="input-field max-w-30"
                                value={row.refNo}
                                onChange={e => handleChange(idx, "refNo", e.target.value)}
                              />
                              <p className="input-field-error">{errors?.[idx]?.refNo}</p>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {!!duplicateError && <p className="input-field-error">{duplicateError}</p>}

          <div className="w-full text-right">
            <button
              type="button"
              className="save-btn mt-2"
              onClick={() => {
                const isValid = validateRows();
                if (isValid) {
                  handleAddRow();
                }
              }}
            >
              Add Row
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PaymentMethods;
