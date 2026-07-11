type AdvanceDetailsItem = {
  LedgerId: number;
  PatientId: number;
  TotalCreditAmt: number;
  TotalDebitAmt: number;
  TotalNetAmt: number;
  TotalRefunAmount: number;
  CreatedBy: string;
  CreatedOn: string;
  LastModifiedBy: string;
  LastModifiedOn: string;
};

type PatientAdvancePaymentDetailItem = {
  paymentModeId: number;
  paymentModeTypeId: number;
  amount: number;
  isCopaymentReceipt: number;
  isPatientAdvanceAmount: number;
  bankId: number;
  refNo: string;
  plutusTransactionReferenceID: string;
  transactionLogId: string;
};

type PatientAdvanceSavePayload = {
  branchId: number;
  roleId: number;
  patientId: number;
  patientLedgerId: number;
  paymentDetails: PatientAdvancePaymentDetailItem[];
};

type PatientAdvanceReceiptItem = {
  PatientId: number;
  UHID: string;
  PatientName: string;
  Age: string;
  Gender: string;
  Address: string;
  ContactNumber: string;
  RelativeName: string | null;
  TotalCreditAmt: number;
  TotalDebitAmt: number;
  TotalNetAmt: number;
  TotalRefunAmount: number;
  ReceiptHeader: string;
  CreatedBy: string;
  CreatedOn: string;
  ReceiptNo: string;
  ReceiptAmount: number;
  CorporateName: string;
};

type PatientAdvancePaymentModeItem = {
  PaymentModeName: string;
  Amount: number;
  UserName: string;
  ReceiptNo: string;
  BillDate: string;
};

export type {
  AdvanceDetailsItem,
  PatientAdvancePaymentDetailItem,
  PatientAdvancePaymentModeItem,
  PatientAdvanceReceiptItem,
  PatientAdvanceSavePayload,
};
