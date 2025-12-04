const ENDPOINTS = {
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
};

export { ENDPOINTS };
