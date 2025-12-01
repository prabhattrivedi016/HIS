export const userGroupMaster = {
  type: "userGroupMaster",

  gridCardView: {
    type: "userGroupMaster",
    cardType: "userGroupMasterGrid",
    cardViewType: "grid",
    id: "0",

    gridLeftTop: [{ label: "Status", keyFromApi: "isActive" }],

    gridRightTop: [{ label: "toggle", action: "umgGridRightButton" }],

    gridId: [{ label: "GroupID", keyFromApi: "id" }],

    gridTitle: [
      { label: "First Name", keyFromApi: "groupName" },
      { label: "Last Name", keyFromApi: "lastName" },
    ],

    gridFooterSection: [
      { label: "Created By", keyFromApi: "createdBy" },
      { label: "Created On", keyFromApi: "createdOn" },
      { label: "Last Modified By", keyFromApi: "lastModifiedBy" },
    ],

    gridButtonSection: [
      { label: "Active", action: "umgGridActive" },
      { label: "Edit", action: "umgGridEdit" },
    ],
  },
  listCardView: {
    type: "userGroupMaster",
    cardType: "userGroupMasterList",
    cardViewType: "list",
    id: "0",

    listLeftButton: [{ label: "Action", action: "listToggleActive" }],

    columns: [
      {
        label: "GroupID",
        keyFromApi: "id",
        isSortable: true,
        isSearchable: true,
        allowColumnFilter: true,
        isMasked: true,
      },
      {
        label: "Group Name",
        keyFromApi: "groupName",
      },
      { label: "Status", keyFromApi: "isActive" },
      { label: "Created By", keyFromApi: "createdBy" },
      { label: "Created On", keyFromApi: "createdOn" },
      { label: "Last Modified By", keyFromApi: "lastModifiedBy" },
      { label: "last Modified On", keyFromApi: "lastModifiedOn" },
      { label: "Ip Address", keyFromApi: "ipAddress" },
    ],
  },
};
