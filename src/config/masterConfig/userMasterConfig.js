import { label } from "framer-motion/client";

// user master data
export const userMasterConfig = {
  type: "User Master",
  cardId: "employeeID",
  cardLeftTop: "isActive",
  cardRightTop: { label: "toggle", action: "toggleButton" },
  cardTitle: [{ keyFromAPI: "firstName" }, { keyFromAPI: "lastName" }],
  cardFooterSection: [
    { label: "Gender", keyFromApi: "gender" },
    { label: "Contact", keyFromApi: "contact" },
    { label: "Address", keyFromApi: "address" },
  ],
  buttonSection: [{ label: "Edit", action: "toggleEdit", color: "#636363" }],
};
