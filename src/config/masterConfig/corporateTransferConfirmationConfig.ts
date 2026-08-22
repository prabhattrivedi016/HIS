export const corporateTransferConfirmationConfig = {
  type: "corporateTransferConfirmation",

  gridCardView: {
    type: "corporateTransferConfirmation",
    cardType: "corporateTransferConfirmationGrid",
    cardViewType: "grid",

    recordIdKey: "CorporateTransferId",

    gridLeftTop: [{ label: "Status", keyFromApi: "Status" }],

    gridRightTop: [{ label: "toggle", action: "ListToggleButton" }],

    gridAvatar: [{ label: "profile", keyFromApi: null }],

    gridId: [{ label: "Token No", keyFromApi: "TokenNo" }],

    gridTitle: [{ label: "Patient Name", keyFromApi: "PatientName" }],

    gridFooterSection: [
      { label: "UHID", keyFromApi: "UHID" },
      { label: "Gender", keyFromApi: "Gender" },
      { label: "Insurance", keyFromApi: "InsuranceCompanyName" },
      { label: "Corporate", keyFromApi: "CorporateName" },
      { label: "Token No", keyFromApi: "TokenNo" },
      { label: "IPD No", keyFromApi: "IpdNo" },
    ],

    gridButtonSection: [
      { label: "Confirm", action: "toggleCorporateTransferConfirmation" },
      { label: "Cancel", action: "toggleCorporateTransferCancel" },
    ],
  },

  listCardView: {
    type: "corporateTransferConfirmation",
    cardType: "corporateTransferConfirmationList",
    cardViewType: "list",

    recordIdKey: "CorporateTransferId",

    listLeftButton: [
      {
        label: "Action",
        action: "toggleCorporateTransferConfirmation",
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
        label: "Change From Date",
        keyFromApi: "ChangeFromDate",
      },
      {
        label: "Change To Date",
        keyFromApi: "ChangeToDate",
      },
      {
        label: "Insurance Company",
        keyFromApi: "InsuranceCompanyId",
      },
      {
        label: "Corporate Name",
        keyFromApi: "CorporateId",
      },
      {
        label: "Relation",
        keyFromApi: "Relation",
      },
      {
        label: "Relative Name",
        keyFromApi: "RelativeName",
      },
      {
        label: "Card No",
        keyFromApi: "IsRefundApproved",
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
    ],
  },
};
