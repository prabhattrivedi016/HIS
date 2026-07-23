type WriteOffGenerationItem = {
  WriteOffId: number;
  CreditNoteId: number;
  TokenNo: string;
  BranchId: number;
  PatientId: number;
  VisitId: number;
  BillId: number;
  UHID: string;
  PatientName: string;
  Age: string;
  Gender: string;
  TotalWriteOffAmount: number;
  IsCreditNoteApproved: number;
  ApprovalRemarks: string | null;
  IsLevel1Approve: string | null;
  Level1ApproveId: null;
  Level1ApproveOn: string | null;
  IsLevel2Approve: string | null;
  Level2ApproveId: null;
  Level2ApproveOn: string | null;
  IsLevel3Approve: string | null;
  Level3ApproveId: number | null;
  Level3ApproveOn: string | null;
  IsLevel4Approve: string | null;
  Level4ApproveId: number | null;
  Level4ApproveOn: string | null;
  IsCancel: number;
  Status: string;
  StatusId: number;
  CancelBy: string | null;
  CancelOn: string | null;
  CancelReason: string | null;
  CreatedBy: string;
  CreatedOn: string;
  LastModifiedBy: string | null;
  LastModifiedOn: string | null;
  FlagId: number;
  CanApprove: number;
  WriteOffApprovedID: number;
  WriteOffApprovedName: string;
  WriteOffReason: string;
  WriteOffRemark: string;
  BookingId: number | null;
  IsPaymentCollected: number;
  IsDiscountApproved: number;
  TotalApprovedDiscountPerOnBill: string | null;
  DiscountApprovedID: string | null;
  DiscountApprovedName: string | null;
  DiscountReason: string | null;
  Remark: string | null;
  CorporateName?: string | null;
  TotalBillAmount?: number | null;
  TotalDiscountAmountOnBill?: number | null;
  TotalPatientPayableAmount?: number | null;
  TotalDiscountPerOnBill?: number | string | null;
};

type WriteOffGenerationGridCard = {
  type: string;
  cardType: string;
  cardViewType: string;
  id: number;
  cardLeftTop: { label: string; value: string | number | null }[];
  cardRightTop: { label: string; action: string }[];
  cardAvatar: string | null;
  cardId: { label: string; value: string | number | null }[];
  cardTitle: { label: string; value: string | number | null }[];
  cardFooter: { label: string; value: string | number | null }[];
  buttonSection: { label: string; action: string }[];
};

type WriteOffGenerationListCard = {
  type: string;
  cardType: string;
  cardViewType: string;
  id: number;
  listLeftButton: { label: string; action: string }[];
  columns: {
    label: string;
    keyFromApi: string;
    value: string | number | null;
    isSortable?: boolean;
    isSearchable?: boolean;
    allowColumnFilter?: boolean;
    isMasked?: boolean;
  }[];
};

type WriteOffGenerationDetails = {
  WriteOffId: number;
  TokenNo: string;
  BranchId: number;
  PatientId: number;
  VisitId: number;
  BillId: number;
  UHID: string;
  TotalBillAmount: number;
  TotalDiscountAmountOnBill: number;
  TotalDiscountPerOnBill: number;
  TotalPaidAmount: number;
  TotalBalanceAmount: number;
  TotalWriteOffAmount: number;
  IsWriteOffApproved: number;
  IsLevel1Approve: number;
  Level1ApproveId: number;
  Level1ApproveOn: string;
  IsLevel2Approve: number | null;
  Level2ApproveId: number | null;
  Level2ApproveOn: string | null;
  IsLevel3Approve: number | null;
  Level3ApproveId: number | null;
  Level3ApproveOn: string | null;
  IsLevel4Approve: number | null;
  Level4ApproveId: number | null;
  Level4ApproveOn: string | null;
  IsCancel: number;
  CancelBy: string | null;
  CancelOn: string | null;
  CancelReason: string | null;
  CreatedBy: string;
  CreatedOn: string;
  LastModifiedBy: string | null;
  LastModifiedOn: string | null;
  WriteOffApprovedID: number | null;
  WriteOffApprovedName: string | null;
  WriteOffReason: string | null;
  WriteOffRemark: string;
};

export type {
  WriteOffGenerationDetails,
  WriteOffGenerationGridCard,
  WriteOffGenerationItem,
  WriteOffGenerationListCard,
};
