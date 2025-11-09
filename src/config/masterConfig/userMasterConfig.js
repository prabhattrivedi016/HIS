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
  cardRightTop: { label: "toggle", action: "toggleButton" },
  cardTitle: [
    { label: "User Name", keyFromAPI: "firstName", keyFromAPI: "lastName" },
  ],
  cardFooterSection: [
    { label: "Gender", keyFromApi: "gender" },
    { label: "Contact", keyFromApi: "contact" },
    { label: "Address", keyFromApi: "address" },
  ],
  buttonSection: [{ label: "Edit", action: "toggleEdit", color: "#636363" }],
};
