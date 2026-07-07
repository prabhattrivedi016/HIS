type OPPaymentItem = {
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

type OpPaymentGridCard = {
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

type OpPaymentListCard = {
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

type OPPaymentCollectionPatientDetails = {
  BookingId: 10;
  TokenNo: "Admin000021";
  BranchId: 1;
  PatientId: 2050;
  UHID: "GWS/00000040";
  PatientName: "MR. SHIVAM";
  Age: "33Y 0M 0D";
  Gender: "MALE";
  CorporateId: 1;
  CorporateName: "CASH";
  TotalBillAmount: 5000;
  TotalDiscountAmountOnBill: 500;
  BillDiscountPercentage: 10;
  ApprovedPercentage: null;
  TotalPatientPayableAmount: 4500;
  StatusId: 1;
  Status: "Discount Approval Pending";
  IsDiscountApprovalRequired: 1;
  IsDiscountApproved: 0;
  ApprovalFlowId: 2;
  ApprovalFlow: "Parallel";
  IsAllApprovalRequired: 0;
  ApprovalLevelId: 4;
  ApprovalLevel: "4 Level Approval";
  Level1ApproverNames: "Rohit   (Rohit), GWT   (GWT)";
  Level2ApproverNames: "Rohit   (Rohit)";
  Level3ApproverNames: "GWS   (GWS), Rohit   (Rohit)";
  Level4ApproverNames: "Rohit   (Rohit), Ajay   (ajay)";
  IsLevel1Approve: null;
  Level1ApprovedByName: null;
  Level1ApproveOn: null;
  IsLevel2Approve: null;
  Level2ApprovedByName: null;
  Level2ApproveOn: null;
  IsLevel3Approve: null;
  Level3ApprovedByName: null;
  Level3ApproveOn: null;
  IsLevel4Approve: null;
  Level4ApprovedByName: null;
  Level4ApproveOn: null;
  NextApprovalName: "Rohit   (Rohit), GWT   (GWT)";
  NextApprovalLevel: 1;
  ApprovalRemarks: "";
};

export type {
  OPPaymentCollectionPatientDetails,
  OpPaymentGridCard,
  OPPaymentItem,
  OpPaymentListCard,
};
