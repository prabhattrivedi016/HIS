export const writeOffGenerationConfig = {
  type: "writeOffGeneration",

  gridCardView: {
    type: "writeOffGeneration",
    cardType: "writeOffGenerationGrid",
    cardViewType: "grid",

    recordIdKey: "WriteOffId",

    gridLeftTop: [{ label: "Status", keyFromApi: "Status" }],

    gridRightTop: [{ label: "toggle", action: "ListToggleButton" }],

    gridAvatar: [{ label: "profile", keyFromApi: null }],

    gridId: [{ label: "Token No", keyFromApi: "TokenNo" }],

    gridTitle: [{ label: "Patient Name", keyFromApi: "PatientName" }],

    gridFooterSection: [
      { label: "UHID", keyFromApi: "UHID" },
      { label: "Gender", keyFromApi: "Gender" },
      { label: "Total Bill Amount", keyFromApi: "TotalWriteOffAmount" },
    ],

    gridButtonSection: [
      { label: "Generation", action: "toggleGenerationWriteOff" },
      { label: "Cancel", action: "toggleCancelWriteOff" },
    ],
  },

  listCardView: {
    type: "writeOffGeneration",
    cardType: "writeOffGenerationList",
    cardViewType: "list",

    recordIdKey: "WriteOffId",

    listLeftButton: [
      {
        label: "Action",
        action: "togglegenerationWriteOff",
      },
    ],

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
      {
        label: "Gender",
        keyFromApi: "Gender",
      },
      {
        label: "Status",
        keyFromApi: "Status",
      },
      {
        label: "UHID",
        keyFromApi: "UHID",
      },
      {
        label: "Age",
        keyFromApi: "Age",
      },
      {
        label: "Total Bill Amount",
        keyFromApi: "TotalBillAmount",
      },
      {
        label: "Total Discount Per On Bill",
        keyFromApi: "TotalDiscountPerOnBill",
      },
      {
        label: "Total Discount Amount On Bill",
        keyFromApi: "TotalDiscountAmountOnBill",
      },
      {
        label: "Round Off",
        keyFromApi: "RoundOff",
      },
      {
        label: "Total Refund Amount",
        keyFromApi: "TotalRefundAmount",
      },
      {
        label: "Refund Approved",
        keyFromApi: "IsRefundApproved",
      },
      {
        label: "Refund Collected",
        keyFromApi: "IsRefundCollected",
      },
      {
        label: "Approval Remarks",
        keyFromApi: "ApprovalRemarks",
      },
      {
        label: "Level 1 Approved",
        keyFromApi: "IsLevel1Approve",
      },
      {
        label: "Level 1 Approve On",
        keyFromApi: "Level1ApproveOn",
      },
      {
        label: "Level 2 Approved",
        keyFromApi: "IsLevel2Approve",
      },
      {
        label: "Level 2 Approve On",
        keyFromApi: "Level2ApproveOn",
      },
      {
        label: "Level 3 Approved",
        keyFromApi: "IsLevel3Approve",
      },
      {
        label: "Level 3 Approve On",
        keyFromApi: "Level3ApproveOn",
      },
      {
        label: "Level 4 Approved",
        keyFromApi: "IsLevel4Approve",
      },
      {
        label: "Level 4 Approve On",
        keyFromApi: "Level4ApproveOn",
      },
      {
        label: "Cancel By",
        keyFromApi: "CancelBy",
      },
      {
        label: "Cancel On",
        keyFromApi: "CancelOn",
      },
      {
        label: "Cancel Reason",
        keyFromApi: "CancelReason",
      },
      {
        label: "Created By",
        keyFromApi: "CreatedBy",
      },
      {
        label: "Created On",
        keyFromApi: "CreatedOn",
      },
      {
        label: "Last Modified By",
        keyFromApi: "LastModifiedBy",
      },
      {
        label: "Last Modified On",
        keyFromApi: "LastModifiedOn",
      },
      {
        label: "Can Approve",
        keyFromApi: "CanApprove",
      },
      {
        label: "Write Off Approved",
        keyFromApi: "IsWriteOffApproved",
      },
      {
        label: "Write Off Approved Name",
        keyFromApi: "WriteOffApprovedName",
      },
      {
        label: "Write Off Reason",
        keyFromApi: "WriteOffReason",
      },
      {
        label: "Write Off Remark",
        keyFromApi: "WriteOffRemark",
      },
    ],
  },
};
