type BillDetailsItem = {
  VisitId: number;
  PatientName: string;
  UHID: string;
  BillNo: string;
  BillDate: string;
  TotalBillAmount: number;
  TotalPaidAmount: number;
  Type: string;
};

type CreditNoteBillDetailItem = {
  VisitId: number;
  BillId: number;
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
  CorporateAlias: string;
  CorporateCode: string;
  DoctorId: number;
  CorporateId: number;
  InsuranceCompanyId: number;
  Rate: number;
  Qty: number;
  DiscPer: number;
  CategoryTypeId: number;
  CategoryId: number;
  SubCategoryId: number;
  SubSubCategoryId: number;
  TotalDiscountAmountOnBill: number;
  TotalBalanceAmount: number;
  TotalCreditNoteAmt: number;
  GrossAmt: number;
  DiscAmt: number;
  NetAmt: number;
  creditNoteAmount?: number;
  isChecked?: boolean;
  creditNotePer?: number;
  isNavigatedDisabled?: boolean;
};

type ApprovalList = {
  id: number;
  name: string;
  isActive: number;
  discountType: string;
  branchName: string;
  firstName: string;
};

export type { ApprovalList, BillDetailsItem, CreditNoteBillDetailItem };
