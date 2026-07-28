type WriteOffApprovalItem = {
  WriteOffId: number;
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
  IsWriteOffApproved: number;
  IsWriteOffCreated: number;
  ApprovalRemarks: string;
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
  WriteOffApprovedID: number | null;
  WriteOffApprovedName: string | null;
  WriteOffReason: string | null;
  WriteOffRemark: string | null;
  BillNo?: string;
};

type writeOffApprovalGridCard = {
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

type writeOffApprovalListCard = {
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

type ApprovalDetails = {
  WriteOffId: number;
  TokenNo: string;
  BranchId: number;
  PatientId: number;
  VisitId: number;
  BillId: number;
  BillNo: string;
  UHID: string;
  PatientName: string;
  Age: string;
  Gender: string;
  TotalBillAmount: number;
  TotalDiscountAmountOnBill: number;
  TotalDiscountPerOnBill: number;
  TotalPaidAmount: number;
  TotalBalanceAmount: number;
  TotalWriteOffAmount: number;
  StatusId: number;
  Status: string;
  IsWriteOffApproved: number;
  ApprovalFlowId: number;
  ApprovalFlow: string;
  IsAllApprovalRequired: number;
  ApprovalLevelId: number;
  ApprovalLevel: string;
  Level1ApproverNames: string;
  Level2ApproverNames: string | null;
  Level3ApproverNames: string | null;
  Level4ApproverNames: string | null;
  IsLevel1Approve: number;
  Level1ApprovedByName: string;
  Level1ApproveOn: string;
  IsLevel2Approve: null;
  Level2ApprovedByName: null;
  Level2ApproveOn: null;
  IsLevel3Approve: null;
  Level3ApprovedByName: null;
  Level3ApproveOn: null;
  IsLevel4Approve: null;
  Level4ApprovedByName: null;
  Level4ApproveOn: null;
  NextApprovalName: null;
  NextApprovalLevel: number;
  ApprovalRemarks: string;
  WriteOffApprovedID: number;
  WriteOffApprovedName: string;
  WriteOffReason: string;
  WriteOffRemark: string;
};

export type {
  ApprovalDetails,
  writeOffApprovalGridCard,
  WriteOffApprovalItem,
  writeOffApprovalListCard,
};
