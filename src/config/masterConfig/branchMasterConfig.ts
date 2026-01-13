export const branchMasterConfig = {
  type: "branchMaster",

  gridCardView: {
    type: "branchMaster",
    cardType: "branchMasterGrid",
    cardViewType: "grid",

    recordIdKey: "branchId",

    gridLeftTop: [{ label: "Status", keyFromApi: "isActive" }],

    gridRightTop: [{ label: "toggle", action: "ListToggleButton" }],

    gridAvatar: [{ label: "profile", keyFromApi: "imagePath" }],

    gridId: [{ label: "Branch ID", keyFromApi: "branchId" }],

    gridTitle: [{ label: "Branch Name", keyFromApi: "branchName" }],

    gridFooterSection: [
      { label: "Branch Code", keyFromApi: "branchCode" },
      { label: "Contact", keyFromApi: "contactNo1" },
      { label: "Address", keyFromApi: "address" },
    ],

    gridButtonSection: [{ label: "Edit", action: "toggleBranchEdit" }],
  },

  listCardView: {
    type: "branchMaster",
    cardType: "branchMasterList",
    cardViewType: "list",

    recordIdKey: "branchId",

    listLeftButton: [{ label: "Action", action: "toggleActive" }],

    columns: [
      {
        label: "Branch ID",
        keyFromApi: "branchId",
        isSortable: true,
        isSearchable: true,
        allowColumnFilter: true,
        isMasked: true,
      },
      {
        label: "Branch Name",
        keyFromApi: "branchName",
        isSortable: true,
        isSearchable: true,
      },
      {
        label: "Status",
        keyFromApi: "isActive",
      },
      {
        label: "Branch Code",
        keyFromApi: "branchCode",
      },
      {
        label: "Email",
        keyFromApi: "email",
      },
      {
        label: "Contact-1",
        keyFromApi: "contactNo1",
      },
      {
        label: "Contact-2",
        keyFromApi: "contactNo2",
      },
      {
        label: "Address",
        keyFromApi: "address",
      },
    ],
  },
};
