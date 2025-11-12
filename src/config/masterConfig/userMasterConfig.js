// user master data
export const userMasterConfig = {
  type: "User Master",

  cardId: [
    {
      label: "User Id",
      keyFromApi: "employeeID",
    },
  ],

  cardLeftTop: [
    {
      label: "Status",
      keyFromApi: "isActive",
    },
  ],

  gridCardRightTop: [
    {
      label: "toggle",
      action: "gridToggleButton",
    },
  ],

  listCardRightTop: [
    {
      label: "toggle",
      action: "listToggleButton",
    },
  ],

  cardTitle: [
    {
      label: "First Name",
      keyFromApi: "firstName",
    },
    {
      label: "Last Name",
      keyFromApi: "lastName",
    },
  ],

  cardFooterSection: [
    { label: "Gender", keyFromApi: "gender" },
    { label: "Contact", keyFromApi: "contact" },
    { label: "Address", keyFromApi: "address" },
  ],

  buttonSection: [{ label: "Edit", action: "toggleEdit", color: "#636363" }],
};
