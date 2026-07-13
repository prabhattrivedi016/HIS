import type { BillingValuesItem } from "@/components/BillingDetails/types";

type BillToRefundItem = {
  VisitId: number;
  UHID: string;
  BillNo: string;
  BillDate: string;
  TotalBillAmount: number;
  TotalPaidAmount: number;
};

type BillDetailsToRefundItem = {
  VisitId: number;
  UHID: string;
  PatientName: string;
  PatientId: number;
  DOB: string;
  ReferDoctorId: number | null;
  CorporateName: string;
  DoctorName: string;
  BillNo: string;
  BillDate: string;
  TotalBillAmount: number;
  TotalPaidAmount: number;
  ServiceName: string;
  ServiceCode: string;
  FTDId: number;
  ServiceItemId: number;
  SubSubCategoryId: number;
  SubCategoryId?: number;
  CorporateAlias: string;
  CorporateCode: string;
  DoctorId: number;
  CorporateId: number;
  InsuranceCompanyId: number;
  Rate: number;
  Qty: number;
  DiscPer: number;
  CategoryId: number;
  CategoryTypeId: number;
  RefundQty?: number;
  IsUnderPackage?: number;
};

type OpdRefundVisitDetailsPayload = {
  patientId: number;
  uhid: string;
  branchId: number;
  roleId: number;
  currentAge: string;
  insuranceCompanyId: number;
  corporateId: number;
  doctorId: number;
  referDoctorId: number;
  grossBillAmount: number;
  totalDiscPerOnBill: number;
  totalDiscAmtOnBill: number;
  roundOff: number;
  netAmount: number;
  discApprovedById: number;
  discountReason: string;
  remarks: string;
  uniqueId: string;
  mlc: string;
  pi: string;
  remark: string;
  policyNo: string;
  policyCardNo: string;
  expiryDate: string;
  cardHolder: string;
  referalNo: string;
  referalDate: string;
  diagnosisId: number;
  proId: number;
  proName: string;
  isSendMRD: number;
};

type OpdRefundItemPayload = {
  ftdId: number;
  serviceItemId: number;
  subSubCategoryId: number;
  subCategoryId: number;
  categoryId: number;
  serviceName: string;
  code: string;
  corporateAlias: string;
  corporateCode: string;
  isNonPayable: number;
  rateListId: number;
  doctorId: number;
  qty: number;
  rate: number;
  discPer: number;
  discAmt: number;
  grossAmt: number;
  netAmt: number;
  isUnderPackage: number;
};

type OpdRefundPaymentDetailPayload = {
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

type OpdRefundRequestApprovalVisitDetailsPayload = {
  branchId: number;
  roleId: number;
  patientId: number;
  visitId: number;
  grossBillAmount: number;
  totalDiscPerOnBill: number;
  totalDiscAmtOnBill: number;
  roundOff: number;
  netAmount: number;
  refundApprovedID: number;
  refundApprovedName: string;
  refundReason: string;
  refundRemark: string;
};

type OpdRefundRequestBillingItemPayload = {
  ftdId: number;
  refundQty: number;
};

type OpdRefundRequestApprovalPayload = {
  visitDetails: OpdRefundRequestApprovalVisitDetailsPayload;
  billingItems: OpdRefundRequestBillingItemPayload[];
};

type BuildOpdRefundRequestApprovalPayloadArgs = {
  headerItem: BillDetailsToRefundItem | null;
  refundRows: BillDetailsToRefundItem[];
  billingValues: BillingValuesItem;
  branchId: number;
  roleId: number;
};

type OpdRefundSavePayload = {
  visitDetails: OpdRefundVisitDetailsPayload;
  refundItems: OpdRefundItemPayload[];
  paymentDetails: OpdRefundPaymentDetailPayload[];
};

type BuildOpdRefundSavePayloadArgs = {
  headerItem: BillDetailsToRefundItem | null;
  refundRows: BillDetailsToRefundItem[];
  billingValues: BillingValuesItem;
  payments: Array<Record<string, unknown>>;
  branchId: number;
  roleId: number;
  fetchPackageServices: (visitId: number, serviceItemId: number) => Promise<unknown[]>;
};

export type {
  BillDetailsToRefundItem,
  BillToRefundItem,
  BuildOpdRefundRequestApprovalPayloadArgs,
  BuildOpdRefundSavePayloadArgs,
  OpdRefundItemPayload,
  OpdRefundPaymentDetailPayload,
  OpdRefundRequestApprovalPayload,
  OpdRefundRequestBillingItemPayload,
  OpdRefundRequestApprovalVisitDetailsPayload,
  OpdRefundSavePayload,
  OpdRefundVisitDetailsPayload,
};
