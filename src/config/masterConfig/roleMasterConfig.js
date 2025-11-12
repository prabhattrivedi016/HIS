export const roleMasterConfig = {
  type: "Role Master",
  cardLeftTop: [
    {
      label: "Status",
      keyFromApi: "isActive",
    },
  ],

  gridCardRightTop: null,

  listCardRightTop: [
    {
      label: "toggle",
      action: "ListToggleButton",
    },
  ],

  cardAvatar: [
    {
      label: "profile",
      keyFromApi: "iconName",
    },
  ],
  cardId: [
    {
      label: "Role ID",
      keyFromApi: "roleId",
    },
  ],
  cardTitle: [
    {
      label: "Role Name",
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
