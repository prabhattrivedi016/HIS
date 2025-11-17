export const roleMasterConfig = {
  type: "roleMaster",
  gridCardView: {
    type: "roleMaster",
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
        action: "ListToggleButton",
      },
    ],
    gridAvatar: [
      {
        label: "profile",
        keyFromApi: "iconName",
      },
    ],
    gridId: [
      {
        label: "Role ID",
        keyFromApi: "roleId",
      },
    ],
    gridTitle: [
      {
        label: "Role Name",
        keyFromApi: "roleName",
      },
    ],
    gridFooterSection: [
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
    gridButtonSection: [
      {
        label: "Active",
        action: "toggleActive",
      },
      {
        label: "Edit",
        action: "toggleEdit",
      },
    ],
  },
  listCardView: {
    type: "roleMaster",
    id: "0",
    listLeftButton: [
      {
        label: "Action",
        action: "toggleActive",
      },
    ],
    listId: [
      {
        label: "RoleID",
        keyFromApi: "roleId",
      },
    ],
    listTitle: [
      {
        label: "Role Name",
        keyFromApi: "roleName",
      },
    ],
    listStatus: [
      {
        label: "Status",
        keyFromApi: "isActive",
      },
    ],
    listGroupSection: [
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
  },
};
