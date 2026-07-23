export const writeOffApprovalConfig = {
  type: "writeOffApproval",

  gridCardView: {
    type: "writeOffApproval",
    cardType: "writeOffApprovalGrid",
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
      { label: "Approve", action: "toggleApproveWriteOff" },
      { label: "Cancel", action: "toggleCancelWriteOff" },
    ],
  },

  listCardView: {
    type: "writeOffApproval",
    cardType: "writeOffApprovalList",
    cardViewType: "list",

    recordIdKey: "WriteOffId",

    listLeftButton: [
      {
        label: "Action",
        action: "toggleApproveWriteOff",
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
        label: "Total Write Off Amount",
        keyFromApi: "TotalWriteOffAmount",
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
        label: "Credit Note Approved",
        keyFromApi: "IsCreditNoteApproved",
      },
      {
        label: "Write Off Approved Name",
        keyFromApi: "WriteOffApprovedName",
      },
      {
        label: "Write Off Approved Reason",
        keyFromApi: "WriteOffReason",
      },
      {
        label: "Write Off Approved Remark",
        keyFromApi: "WriteOffRemark",
      },
    ],
  },
};
