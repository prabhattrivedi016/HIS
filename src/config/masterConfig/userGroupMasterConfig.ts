export const userGroupMaster = {
  type: "userGroupMaster",

  gridCardView: {
    type: "userGroupMaster",
    cardType: "userGroupMasterGrid",
    cardViewType: "grid",

    recordIdKey: "id",

    gridLeftTop: [{ label: "Status", keyFromApi: "isActive" }],

    gridRightTop: [{ label: "toggle", action: "umgGridRightButton" }],

    gridId: [{ label: "Group ID", keyFromApi: "id" }],

    gridTitle: [{ label: "Group Name", keyFromApi: "groupName" }],

    gridFooterSection: [
      { label: "Created By", keyFromApi: "createdBy" },
      { label: "Created On", keyFromApi: "createdOn" },
      { label: "Last Modified By", keyFromApi: "lastModifiedBy" },
    ],

    gridButtonSection: [
      { label: "Map User", action: "umgMapToUser" },
      { label: "Edit", action: "umgGridEdit" },
    ],
  },

  listCardView: {
    type: "userGroupMaster",
    cardType: "userGroupMasterList",
    cardViewType: "list",

    recordIdKey: "id",

    listLeftButton: [{ label: "Action", action: "listToggleActive" }],

    columns: [
      {
        label: "Group ID",
        keyFromApi: "id",
        isSortable: true,
        isSearchable: true,
        allowColumnFilter: true,
        isMasked: true,
      },
      {
        label: "Group Name",
        keyFromApi: "groupName",
        isSortable: true,
        isSearchable: true,
      },
      {
        label: "Status",
        keyFromApi: "isActive",
      },
      {
        label: "Created By",
        keyFromApi: "createdBy",
      },
      {
        label: "Created On",
        keyFromApi: "createdOn",
      },
      {
        label: "Last Modified By",
        keyFromApi: "lastModifiedBy",
      },
      {
        label: "Last Modified On",
        keyFromApi: "lastModifiedOn",
      },
      {
        label: "IP Address",
        keyFromApi: "ipAddress",
      },
    ],
  },
};
