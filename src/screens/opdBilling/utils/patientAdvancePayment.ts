export const roundPaymentAmount = (value: number) => Number(value.toFixed(2));

export const getRegularPaymentsTotal = (
  rows: Array<{ amount?: string | number | null }>
): number =>
  roundPaymentAmount(
    rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0)
  );

export const getDefaultPatientAdvanceUsed = (
  netAmount: number,
  availableAdvance: number
): number =>
  roundPaymentAmount(
    Math.min(Math.max(0, netAmount), Math.max(0, availableAdvance))
  );

export const getTotalCollectedAmount = (
  regularPaymentsTotal: number,
  patientAdvanceUsed: number
): number =>
  roundPaymentAmount(regularPaymentsTotal + Math.max(0, patientAdvanceUsed));

export const getRemainingCollectibleAmount = (
  netAmount: number,
  regularPaymentsTotal: number,
  patientAdvanceUsed = 0
): number =>
  roundPaymentAmount(Math.max(0, netAmount - regularPaymentsTotal - patientAdvanceUsed));

export const getMaxPatientAdvanceUsable = (
  netAmount: number,
  availableAdvance: number,
  regularPaymentsTotal: number
): number =>
  roundPaymentAmount(
    Math.min(
      Math.max(0, availableAdvance),
      Math.max(0, netAmount - regularPaymentsTotal)
    )
  );

export const buildPatientAdvancePaymentEntry = (amount: number) => ({
  paymentModeId: 0,
  paymentModeTypeId: 0,
  amount: roundPaymentAmount(amount),
  isCopaymentReceipt: 0,
  isPatientAdvanceAmount: 1,
  bankId: 0,
  refNo: "",
  plutusTransactionReferenceID: "",
  transactionLogId: "",
});
