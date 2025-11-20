export const userMasterConfig = {
  type: "userMaster",

  gridCardView: {
    type: "userMaster",
    cardType: "userMasterGrid",
    cardViewType: "grid",
    id: "0",

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
    id: "0",
    recordIdKey: "employeeID",

    listLeftButton: [{ label: "Action", action: "listToggleActive" }],

    columns: [
      {
        label: "UserID",
        keyFromApi: "employeeID",
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
