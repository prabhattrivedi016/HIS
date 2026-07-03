type OPDiscountItem = {
  BookingId: number;
  TokenNo: string;
  BranchId: number;
  PatientId: number;
  UHID: string;
  PatientName: string;
  Age: string;
  Gender: string;
  CorporateId: number;
  CorporateName: string;
  InsuranceCompanyId: number;
  ReferDoctorId?: number | null;
  TotalBillAmount: number;
  TotalDiscountPerOnBill: number;
  TotalDiscountAmountOnBill: number;
  RoundOff: number;
  TotalPatientPayableAmount: number;
  PolicyNo: string;
  PolicyCardNo: string;
  ExpiryDate: string;
  CardHolder: string;
  ReferalNo: string;
  ReferalDate: string;
  IsPaymentCollected: number;
  IsDiscountApprovalRequired: number;
  IsDiscountApproved: number;
  TotalApprovedDiscountPerOnBill: number | null;
  ApprovalRemarks: string | null;
  IsLevel1Approve: number | null;
  Level1ApproveId: number | null;
  Level1ApproveOn: string | null;
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
  Status: string;
  StatusId: number;
  CancelBy: string;
  CancelOn: string;
  CancelReason: string;
  CreatedBy: string;
  CreatedOn: string;
  LastModifiedBy: string;
  LastModifiedOn: string;
  FlagId: number;
  CanApprove: number;
  DiscountApprovedID: number | null;
  DiscountApprovedName: string | null;
  DiscountReason: string | null;
  Remark: string | null;
};

type OPDiscountApprovalDetail = {
  BookingId: number;
  TokenNo: string;
  BranchId: number;
  PatientId: number;
  UHID: string;
  PatientName: string;
  CorporateId: number;
  CorporateName: string;
  TotalBillAmount: number;
  TotalDiscountAmountOnBill: number;
  BillDiscountPercentage: number;
  ApprovedPercentage: number | null;
  StatusId: number;
  Status: string;
  IsDiscountApprovalRequired: number;
  IsDiscountApproved: number;
  ApprovalFlowId: number;
  ApprovalFlow: string;
  IsAllApprovalRequired: number;
  ApprovalLevelId: number;
  ApprovalLevel: string;
  Level1ApproverNames: string | null;
  Level2ApproverNames: string | null;
  Level3ApproverNames: string | null;
  Level4ApproverNames: string | null;
  IsLevel1Approve: number | null;
  Level1ApprovedByName: string | null;
  Level1ApproveOn: string | null;
  IsLevel2Approve: number | null;
  Level2ApprovedByName: string | null;
  Level2ApproveOn: string | null;
  IsLevel3Approve: number | null;
  Level3ApprovedByName: string | null;
  Level3ApproveOn: string | null;
  IsLevel4Approve: number | null;
  Level4ApprovedByName: string | null;
  Level4ApproveOn: string | null;
  NextApprovalName: string | null;
  NextApprovalLevel: number | null;
  ApprovalRemarks: string | null;
};

type OpDiscountGridCard = {
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

type OpDiscountListCard = {
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

export type {
  OPDiscountApprovalDetail,
  OpDiscountGridCard,
  OpDiscountListCard,
  OPDiscountItem,
};
