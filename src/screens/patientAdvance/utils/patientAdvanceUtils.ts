import { AdvanceDetailsItem, PatientAdvanceSavePayload } from "../types";

const pickLedgerValue = <T>(source: Record<string, unknown>, ...keys: string[]): T | undefined => {
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null) {
      return value as T;
    }
  }
  return undefined;
};

export const normalizeAdvanceLedgerDetails = (
  data: unknown,
  fallbackPatientId = 0
): AdvanceDetailsItem | null => {
  const record = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | undefined;
  if (!record || typeof record !== "object") {
    return null;
  }

  return {
    LedgerId: Number(pickLedgerValue(record, "LedgerId", "ledgerId") ?? 0),
    PatientId: Number(pickLedgerValue(record, "PatientId", "patientId") ?? fallbackPatientId ?? 0),
    TotalCreditAmt: Number(pickLedgerValue(record, "TotalCreditAmt", "totalCreditAmt") ?? 0),
    TotalDebitAmt: Number(pickLedgerValue(record, "TotalDebitAmt", "totalDebitAmt") ?? 0),
    TotalNetAmt: Number(pickLedgerValue(record, "TotalNetAmt", "totalNetAmt") ?? 0),
    TotalRefunAmount: Number(
      pickLedgerValue(record, "TotalRefunAmount", "totalRefunAmount", "TotalRefundAmount") ?? 0
    ),
    CreatedBy: String(pickLedgerValue(record, "CreatedBy", "createdBy") ?? ""),
    CreatedOn: String(pickLedgerValue(record, "CreatedOn", "createdOn") ?? ""),
    LastModifiedBy: String(pickLedgerValue(record, "LastModifiedBy", "lastModifiedBy") ?? ""),
    LastModifiedOn: String(pickLedgerValue(record, "LastModifiedOn", "lastModifiedOn") ?? ""),
  };
};

export const getDefaultAdvanceLedgerDetails = (patientId: number): AdvanceDetailsItem => ({
  LedgerId: 0,
  PatientId: patientId,
  TotalCreditAmt: 0,
  TotalDebitAmt: 0,
  TotalNetAmt: 0,
  TotalRefunAmount: 0,
  CreatedBy: "",
  CreatedOn: "",
  LastModifiedBy: "",
  LastModifiedOn: "",
});

export const buildPatientAdvanceSavePayload = ({
  branchId,
  roleId,
  patientId,
  patientLedgerId,
  payments,
  isRefund,
}: {
  branchId: number;
  roleId: number;
  patientId: number;
  patientLedgerId: number;
  payments: Array<Record<string, unknown>>;
  isRefund: number;
}): PatientAdvanceSavePayload => ({
  branchId,
  roleId,
  patientId,
  patientLedgerId,
  isRefund,
  paymentDetails: payments
    .filter(payment => Number(payment?.amount) > 0 && Number(payment?.paymentModeId) > 0)
    .map(payment => ({
      paymentModeId: Number(payment?.paymentModeId) || 0,
      paymentModeTypeId: Number(payment?.paymentModeTypeId) || 0,
      amount: Number(payment?.amount) || 0,
      isCopaymentReceipt: Number(payment?.isCopaymentReceipt ?? 0),
      isPatientAdvanceAmount: Number(payment?.isPatientAdvanceAmount ?? 1),
      bankId: Number(payment?.bankId) || 0,
      refNo: String(payment?.refNo ?? ""),
      plutusTransactionReferenceID: String(payment?.plutusTransactionReferenceID ?? ""),
      transactionLogId: String(payment?.transactionLogId ?? ""),
    })),
});
