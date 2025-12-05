export const userDepartmentConfig = {
  type: "userDepartment",

  gridCardView: {
    type: "userDepartment",
    cardType: "userDepartmentGrid",
    cardViewType: "grid",
    id: "0",

    gridLeftTop: [{ label: "Status", keyFromApi: "isActive" }],

    gridRightTop: [{ label: "toggle", action: "ListToggleButton" }],

    gridAvatar: [{ label: "profile", keyFromApi: "iconName" }],

    gridId: [{ label: "Dept ID", keyFromApi: "id" }],

    gridTitle: [{ label: "Department Name", keyFromApi: "departmentName" }],

    gridFooterSection: [
      { label: "Created By", keyFromApi: "createdBy" },
      { label: "Last Modified", keyFromApi: "lastModifiedOn" },
      { label: "Modified By", keyFromApi: "lastModifiedBy" },
    ],

    gridButtonSection: [
      { label: "Active", action: "deptToggleActive" },
      { label: "Edit", action: "deptToggleEdit" },
    ],
  },

  listCardView: {
    type: "userDepartment",
    cardType: "userDepartmentList",
    cardViewType: "list",
    id: "0",

    listLeftButton: [{ label: "Action", action: "listToggleActive" }],

    columns: [
      {
        label: "DeptID",
        keyFromApi: "id",
        isSortable: true,
        isSearchable: true,
        allowColumnFilter: true,
        isMasked: true,
      },
      {
        label: "Dept Name",
        keyFromApi: "departmentName",
      },
      { label: "Status", keyFromApi: "isActive" },
      { label: "Created By", keyFromApi: "createdBy" },
      { label: "Created On", keyFromApi: "createdOn" },
      { label: "Last Modified By", keyFromApi: "lastModifiedBy" },
      { label: "Last Modified On", keyFromApi: "lastModifiedOn" },
      { label: "Ip Address", keyFromApi: "ipAddress" },
    ],
  },
};
