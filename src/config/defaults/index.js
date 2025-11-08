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
  FAC_ICON_LIST: "Admin/getFaIconList",
  ROLE_MASTER_LIST: "Admin/roleMasterList",
  USER_MASTER_LIST: "Admin/userMasterList",
};

export { ENDPOINTS };
