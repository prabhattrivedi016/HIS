const ENDPOINTS = {
  // login
  LOGIN: "User/userLogin",
  USER_SIGNUP: "User/NewUserSignUp",
  GET_BRANCHES: "Home/getActiveBranchList",
  SEND_OTP: "User/sendSmsOtp",
  VERIFY_SMS_OTP: "User/verifySmsOtp",
  RESET_PASSWORD_BY_USERID: "User/resetPasswordByUserId",
  GET_PICKLIST_MASTER: "Home/getPickListMaster",
  SEND_EMAIL_OTP: "User/sendEmailOtp",
  VERIFY_EMAIL_OTP: "User/verifyEmailOtp",
  FA_ICON_LIST: "Admin/getFaIconList",
  ROLE_MASTER_LIST: "Admin/roleMasterList",
  USER_MASTER_LIST: "Admin/userMasterList",
  MASTER_CONFIG: "PageConfig/getConfigMaster",
  CREATE_UPDATE_USER_MASTER: "Admin/CreateUpdateUserMaster",
  USER_DEPARTMENT_LIST: "Admin/userDepartmentList",
  UPDATE_ROLE_MASTER_STATUS: "Admin/updateRoleMasterStatus",
  CREATE_UPDATE_ROLE_MASTER: "Admin/createUpdateRoleMaster",
  UPDATE_USER_MASTER_STATUS: "Admin/updateUserMasterStatus",
  // user group
  USER_GROUP_LIST: "Admin/userGroupList",
  UPDATE_USER_GROUP_STATUS: "Admin/updateUserGroupStatus",
  CREATE_UPDATE_USER_GROUP_MASTER: "Admin/createUpdateUserGroupMaster",
  USER_GROUP_MEMBER_LIST: "Admin/userGroupMembersList",
  CREATE_UPDATE_USER_GROUP_MEMBER: "Admin/createUpdateUserGroupMembers",
  // user department
  GET_DEPARTMENT_LIST: "Admin/userDepartmentList",
  CREATE_UPDATE_USER_DEPARTMENT: "Admin/createUpdateUserDepartment",
  UPDATE_USER_DEPARTMENT_STATUS: "Admin/updateUserDepartmentStatus",
  // user authorization
  GET_ASSIGN_ROLES_FOR_USER_AUTHORIZATION: "Admin/getAssignRoleForUserAuthorization",
  SAVE_UPDATE_ROLE_MAPPING: "Admin/saveUpdateRoleMapping",
  GET_ASSIGN_USER_RIGHT_MAPPING: "Admin/getAssignUserRightMapping",
  SAVE_UPDATE_USER_RIGHT_MAPPING: "Admin/saveUpdateUserRightMapping",
  GET_ASSIGN_DASHBOARD_USER_RIGHT: "Admin/getAssignDashBoardUserRight",
  SAVE_UPDATE_DASHBOARD_USER_RIGHT_MAPPING: "Admin/saveUpdateDashBoardUserRightMapping",
  GET_USER_WISE_MENU_MASTER: "Admin/getUserWiseMenuMaster",
  SAVE_UPDATE_USER_MENU_MASTER: "Admin/saveUpdateUserMenuMaster",
  GET_USER_WISE_CORPORATE_MAPPING: "Admin/getUserWiseCorporateMapping",
  GET_USER_WISE_BED_MAPPING: "Admin/getUserWiseBedMapping",
  SAVE_UPDATE_USER_CORPORATE_MAPPING: "Admin/saveUpdateUserCorporateMapping",
  SAVE_UPDATE_USER_BED_MAPPING: "Admin/saveUpdateUserBedMapping",

  // navigation panel
  GET_NAVIGATION_SUB_MENU_MASTER: "Admin/getNavigationSubMenuMaster",
  GET_NAVIGATION_TAB_MASTER: "Admin/getNavigationTabMaster",
  CREATE_UPDATE_NAVIGATION_TAB_MASTER: "Admin/createUpdateNavigationTabMaster",
  CREATE_UPDATE_NAVIGATION_SUBMENU_MASTER: "Admin/createUpdateNavigationSubMenuMaster",
  GET_ROLE_WISE_MENU_MAPPING: "Admin/getRoleWiseMenuMapping",
  SAVE_UPDATE_ROLE_WISE_MENU_MAPPING: "Admin/saveUpdateRoleWiseMenuMapping",
  // header
  GET_USER_ROLES: "User/getUserRoles",
  GET_USER_TAB_SUB_MENU_MAPPING: "User/getUserTabAndSubMenuMapping",
};

export { ENDPOINTS };
