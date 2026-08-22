type CorporateTransferApprovalItem = {
  CorporateTransferId: number;
  TokenNo: string;
  BranchId: number;
  PatientId: number;
  VisitId: number;
  TypeId: number;
  UHID: string;
  PatientName: string;
  Age: string;
  Gender: string;
  TypeId1: number;
  InsuranceCompanyId: number;
  InsuranceCompanyName: string;
  CorporateId: number;
  CorporateName: string;
  BillingTypeId: number;
  IsChangeTariff: number;
  ChangeFromDate: string | null;
  ChangeToDate: string | null;
  Relation: string;
  RelativeName: string;
  CardNo: string;
  IsCorporateTransferApproved: number;
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
  CancelBy: string | null;
  CancelOn: string | null;
  CancelReason: string | null;
  CreatedBy: string;
  CreatedOn: string;
  LastModifiedBy: string | null;
  LastModifiedOn: string | null;
  FlagId: number;
  CanApprove: number;
  IsCorporateTransferCreated?: number;
};

type CorporateTransferApprovalGridCard = {
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

type CorporateTransferApprovalListCard = {
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
  CorporateTransferApprovalGridCard,
  CorporateTransferApprovalItem,
  CorporateTransferApprovalListCard,
};
