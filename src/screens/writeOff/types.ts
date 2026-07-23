type WriteOffBillItem = {
  VisitId: number;
  PatientName: string;
  UHID: string;
  BillNo: string;
  BillDate: string;
  TotalBillAmount: number;
  TotalDiscountAmountOnBill: number;
  TotalNetAmount: number;
  TotalPaidAmount: number;
  TotalBalanceAmount: number;
  Type: string;
};

type WriteOffBillDetailsItem = {
  VisitId: number;
  BillId: number;
  UHID: string;
  PatientName: string;
  PatientId: number;
  DOB: string;
  CorporateName: string;
  BillNo: string;
  BillDate: string;
  TotalBillAmount: number;
  TotalDiscountAmountOnBill: number;
  TotalNetAmount: number;
  TotalPaidAmount: number;
  TotalBalanceAmount: number;
  TotalWriteOffAmount: number | null;
};

type ApprovalList = {
  id: number;
  name: string;
  isActive: number;
  discountType: string;
  branchName: string;
  firstName: string;
};

export type { ApprovalList, WriteOffBillDetailsItem, WriteOffBillItem };
