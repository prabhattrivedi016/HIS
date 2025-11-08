export const roleMasterConfig = {
  type: "Role Master",
  cardLeftTop: "isActive",
  cardRightTop: "",
  cardAvatar: "iconName",
  cardId: "roleId",
  cardTitle: [
    {
      keyFromApi: "roleName",
    },
  ],
  cardFooterSection: [
    {
      label: "Created By",
      keyFromApi: "createdBy",
    },
    {
      label: "Last Modified",
      keyFromApi: "lastModifiedOn",
    },
    {
      label: "Modified By",
      keyFromApi: "lastModifiedBy",
    },
  ],
  buttonSection: [
    {
      label: "Active",
      action: "toggleActive",
      color: "#1e6da1",
    },
    {
      label: "Edit",
      action: "toggleEdit",
      color: "#636363",
    },
  ],
};
