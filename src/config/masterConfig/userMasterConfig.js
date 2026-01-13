export const userMasterConfig = {
  type: "userMaster",

  gridCardView: {
    type: "userMaster",
    cardType: "userMasterGrid",
    cardViewType: "grid",

    recordIdKey: "id",

    gridLeftTop: [{ label: "Status", keyFromApi: "isActive" }],

    gridRightTop: [{ label: "toggle", action: "gridRightToggleButton" }],

    gridId: [{ label: "User ID", keyFromApi: "employeeID" }],

    gridTitle: [
      { label: "First Name", keyFromApi: "firstName" },
      { label: "Last Name", keyFromApi: "lastName" },
    ],

    gridFooterSection: [
      { label: "Gender", keyFromApi: "gender" },
      { label: "Contact", keyFromApi: "contact" },
      { label: "Address", keyFromApi: "address" },
    ],

    gridButtonSection: [
      { label: "Active", action: "gridToggleActive" },
      { label: "Edit", action: "gridToggleEdit" },
    ],
  },

  listCardView: {
    type: "userMaster",
    cardType: "userMasterList",
    cardViewType: "list",

    recordIdKey: "id",

    listLeftButton: [{ label: "Action", action: "listToggleActive" }],

    columns: [
      {
        label: "UserID",
        keyFromApi: "employeeID", // display only
        isSortable: true,
        isSearchable: true,
        allowColumnFilter: true,
        isMasked: true,
      },
      {
        label: "Name",
        combine: ["firstName", "lastName"],
      },
      { label: "Status", keyFromApi: "isActive" },
      { label: "Gender", keyFromApi: "gender" },
      { label: "Contact", keyFromApi: "contact" },
      { label: "Address", keyFromApi: "address" },
    ],
  },
};
