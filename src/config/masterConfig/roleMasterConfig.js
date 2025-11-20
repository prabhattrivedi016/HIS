export const roleMasterConfig = {
  type: "roleMaster",

  gridCardView: {
    type: "roleMaster",
    cardType: "roleMasterGrid",
    cardViewType: "grid",
    id: "0",

    gridLeftTop: [{ label: "Status", keyFromApi: "isActive" }],

    gridRightTop: [{ label: "toggle", action: "ListToggleButton" }],

    gridAvatar: [{ label: "profile", keyFromApi: "iconName" }],

    gridId: [{ label: "Role ID", keyFromApi: "roleId" }],

    gridTitle: [{ label: "Role Name", keyFromApi: "roleName" }],

    gridFooterSection: [
      { label: "Created By", keyFromApi: "createdBy" },
      { label: "Last Modified", keyFromApi: "lastModifiedOn" },
      { label: "Modified By", keyFromApi: "lastModifiedBy" },
    ],

    gridButtonSection: [
      { label: "Active", action: "toggleActive" },
      { label: "Edit", action: "toggleEdit" },
    ],
  },

  listCardView: {
    type: "roleMaster",
    cardType: "roleMasterList",
    cardViewType: "list",
    id: "0",
    recordIdKey: "roleId",

    listLeftButton: [{ label: "Action", action: "toggleActive" }],

    columns: [
      {
        label: "RoleID",
        keyFromApi: "roleId",
        isSortable: true,
        isSearchable: true,
        allowColumnFilter: true,
        isMasked: true,
      },
      { label: "Role Name", keyFromApi: "roleName" },
      { label: "Status", keyFromApi: "isActive" },
      { label: "Created By", keyFromApi: "createdBy" },
      { label: "Last Modified", keyFromApi: "lastModifiedOn" },
      { label: "Modified By", keyFromApi: "lastModifiedBy" },
    ],
  },
};
