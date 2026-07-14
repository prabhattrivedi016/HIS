export const opRefundApprovalConfig = {
  type: "opRefundApproval",

  gridCardView: {
    type: "opRefundApproval",
    cardType: "opRefundApprovalGrid",
    cardViewType: "grid",

    recordIdKey: "RefundId",

    gridLeftTop: [{ label: "Status", keyFromApi: "Status" }],

    gridRightTop: [{ label: "toggle", action: "ListToggleButton" }],

    gridAvatar: [{ label: "profile", keyFromApi: null }],

    gridId: [{ label: "Token No", keyFromApi: "TokenNo" }],

    gridTitle: [{ label: "Patient Name", keyFromApi: "PatientName" }],

    gridFooterSection: [
      { label: "UHID", keyFromApi: "UHID" },
      { label: "Gender", keyFromApi: "Gender" },
      { label: "Total Bill Amount", keyFromApi: "TotalBillAmount" },
    ],

    gridButtonSection: [
      { label: "Approve", action: "toggleApproveDiscount" },
      { label: "Cancel", action: "toggleCancelDiscount" },
    ],
  },

  listCardView: {
    type: "opRefundApproval",
    cardType: "opRefundApprovalList",
    cardViewType: "list",

    recordIdKey: "RefundId",

    listLeftButton: [{ label: "Action", action: "toggleApproveDiscount" }],

    columns: [
      {
        label: "Token No",
        keyFromApi: "TokenNo",
        isSortable: true,
        isSearchable: true,
        allowColumnFilter: true,
        isMasked: true,
      },
      {
        label: "Patient Name",
        keyFromApi: "PatientName",
        isSortable: true,
        isSearchable: true,
      },
      { label: "Gender", keyFromApi: "Gender" },
      { label: "Status", keyFromApi: "Status" },
      { label: "UHID", keyFromApi: "UHID" },
      { label: "Age", keyFromApi: "Age" },

      { label: "Total Bill Amount", keyFromApi: "TotalBillAmount" },
      { label: "Total Discount Per On Bill", keyFromApi: "TotalDiscountPerOnBill" },
      { label: "Total Discount Amount On Bill", keyFromApi: "TotalDiscountAmountOnBill" },
      { label: "Round Off", keyFromApi: "RoundOff" },
      { label: "Total Refund Amount", keyFromApi: "TotalRefundAmount" },
      { label: "Refund Approved", keyFromApi: "IsRefundApproved" },
      { label: "Refund Collected", keyFromApi: "IsRefundCollected" },
      { label: "Approval Remarks", keyFromApi: "ApprovalRemarks" },
      { label: "Is Level 1 Approve", keyFromApi: "IsLevel1Approve" },
      { label: "Level 1 Approve Id", keyFromApi: "Level1ApproveId" },
      { label: "Level 1 Approve On", keyFromApi: "Level1ApproveOn" },
      { label: "Is Level 2 Approve", keyFromApi: "IsLevel2Approve" },
      { label: "Level 2 Approve Id", keyFromApi: "Level2ApproveId" },
      { label: "Level 2 Approve On", keyFromApi: "Level2ApproveOn" },
      { label: "Is Level 3 Approve", keyFromApi: "IsLevel3Approve" },
      { label: "Level 3 Approve Id", keyFromApi: "Level3ApproveId" },
      { label: "Level 3 Approve On", keyFromApi: "Level3ApproveOn" },
      { label: "Is Level 4 Approve", keyFromApi: "IsLevel4Approve" },
      { label: "Level 4 Approve Id", keyFromApi: "Level4ApproveId" },
      { label: "Level 4 Approve On", keyFromApi: "Level4ApproveOn" },
      { label: "Cancel", keyFromApi: "IsCancel" },
      { label: "Cancel By", keyFromApi: "CancelBy" },
      { label: "Cancel On", keyFromApi: "CancelOn" },
      { label: "Cancel Reason", keyFromApi: "CancelReason" },
      { label: "Created By", keyFromApi: "CreatedBy" },
      { label: "Created On", keyFromApi: "CreatedOn" },
      { label: "Last Modified By", keyFromApi: "LastModifiedBy" },
      { label: "Last Modified On", keyFromApi: "LastModifiedOn" },
      { label: "Flag Id", keyFromApi: "FlagId" },
      { label: "Can Approve", keyFromApi: "CanApprove" },
      { label: "Refund Approved ID", keyFromApi: "RefundApprovedID" },
      { label: "Refund Approved Name", keyFromApi: "RefundApprovedName" },
      { label: "Refund Reason", keyFromApi: "RefundReason" },
      { label: "Refund Remark", keyFromApi: "RefundRemark" },
    ],
  },
};
