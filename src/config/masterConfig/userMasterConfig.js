export const userMasterConfig = {
  type: "userMaster",
  gridCardView: {
    id: "0",
    gridLeftTop: [
      {
        label: "Status",
        keyFromApi: "isActive",
      },
    ],
    gridRightTop: [
      {
        label: "toggle",
        action: "gridRightToggleButton",
      },
    ],
    gridId: [
      {
        label: "user ID",
        keyFromApi: "employeeID",
      },
    ],
    gridTitle: [
      {
        label: "First Name",
        keyFromApi: "firstName",
      },
      {
        label: "Last Name",
        keyFromApi: "lastName",
      },
    ],
    gridFooterSection: [
      {
        label: "Gender",
        keyFromApi: "gender",
      },
      {
        label: "Contact",
        keyFromApi: "contact",
      },
      {
        label: "Address",
        keyFromApi: "address",
      },
    ],
    gridButtonSection: [
      {
        label: "Active",
        action: "gridToggleActive",
      },
      {
        label: "Edit",
        action: "gridToggleEdit",
      },
    ],
  },
  listCardView: {
    id: "0",
    listLeftButton: [
      {
        label: "Active",
        action: "listToggleActive",
      },
    ],
    listId: [
      {
        label: "User Id",
        keyFromApi: "employeeID",
      },
    ],
    listTitle: [
      {
        label: "first Name",
        keyFromApi: "firstName",
      },
      {
        label: "Last Name",
        keyFromApi: "lastName",
      },
    ],
    listGroupSection: [
      {
        label: "Gender",
        keyFromApi: "gender",
      },
      {
        label: "Contact",
        keyFromApi: "contact",
      },
      {
        label: "Address ",
        keyFromApi: "address",
      },
    ],
  },
};
