const ENDPOINTS = {
  // login
  LOGIN: "User/userLogin",
  USER_SIGNUP: "User/NewUserSignUp",
  GET_BRANCHES: "Home/getActiveBranchList",
  SEND_SMS_OTP: "User/sendSmsOtp",
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
  UPDATE_PASSWORD: "User/updatePassword",
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
  SAVE_USER_FAVORITE_ROLES: "User/saveUserFavoriteRoles",
  SAVE_ROLE_WISE_USER_FAVORITE_SUBMENU: "User/saveRoleWiseUserFavoriteSubMenu",

  //branch master
  GET_BRANCH_DETAILS: "Admin/getBranchDetails",
  GET_COUNTRY_MASTER: "Home/getCountryMaster",
  GET_STATE_MASTER: "Home/getStateMaster",
  GET_DISTRICT_MASTER: "Home/getDistrictMaster",
  GET_CITY_MASTER: "Home/getCityMaster",
  GET_ALL_INSURANCE_COMPANY_LIST: "Home/getAllInsuranceCompanyList",
  GET_CORPORATE_LIST_BY_INSURANCE_COMPANY_ID: "Home/getCorporateListByInsuranceCompanyId",
  CREATE_UPDATE_BRANCH_MASTER: "Admin/createUpdateBranchMaster",

  //location master
  CREATE_UPDATE_STATE_MASTER: "Admin/createUpdateStateMaster",
  CREATE_UPDATE_DISTRICT_MASTER: "Admin/createUpdateDistrictMaster",
  CREATE_UPDATE_CITY_MASTER: "Admin/createUpdateCityMaster",
  CREATE_UPDATE_PINCODE_MASTER: "Admin/createUpdatePincodeMaster",
  GET_PINCODE_MASTER: "Home/getPincodeMaster",

  //header footer master
  GET_HEADER_MASTER: "Admin/getHeaderMaster",
  CREATE_UPDATE_HEADER_MASTER: "Admin/createUpdateHeaderMaster",

  //sequence mapping
  GET_SEQUENCE_TYPE_LIST: "Admin/getSequenceTypeList",
  GET_SEQUENCE_MASTER: "Admin/getSequenceMaster",
  CREATE_UPDATE_SEQUENCE_MASTER: "/Admin/createUpdateSequenceMaster ",
  CREATE_UPDATE_BRANCH_SEQUENCE_MAPPING: "Admin/createUpdateBranchSequenceMapping",
  GET_BRANCH_SEQUENCE_MAPPING: "/Admin/getBranchSequenceMapping",

  //letter head
  CREATE_UPDATE_LAB_REPORT_LETTER_HEAD: "Admin/createUpdateLabReportLetterHead",
  GET_LAB_REPORT_LETTER_HEAD_LIST: "Admin/getLabReportLetterHeadList",
  DELETE_LETTER_HEAD_MASTER: "Admin/deleteLetterHeadMaster",
  GET_FILE_AS_BASE_64: "Home/getFileAsBase64",
  GET_IMAGE_FILE: "Home/getFile",

  //doctor signature
  GET_DOCTOR_SIGNATURE_MASTER_LAST: "Admin/getDoctorSignatureMasterList",
  DELETE_DOCTOR_SIGNATURE_MASTER: "Admin/deleteDoctorSignatureMaster",
  CREATE_UPDATE_DOCTOR_SIGNATURE_MASTER: "Admin/createUpdateDoctorSignatureMaster",
  GET_DOCTOR_MASTER_LIST_BY_BRANCH_ID: "Home/getDoctorMasterListByBranchId",

  //bank master
  GET_BANK_LIST: "Admin/getBankList",
  CREATE_UPDATE_BANK_MASTER: "Admin/createUpdateBankMaster",
  GET_BANK_DETAIL_LIST: "Admin/getBankDetailList",
  CREATE_UPDATE_BANK_DETAIL_MASTER: "Admin/createUpdateBankDetailMaster",

  //vendor master
  GET_VENDOR_MASTER_LIST: "Store/getVendorMasterList",
  CREATE_UPDATE_VENDOR_MASTER: "Store/createUpdateVendorMaster",
  GET_LOCATION_BY_PINCODE: "Home/getLocationByPincode",

  //mrd location master
  GET_MRD_ROOM_MASTER: "Admin/getMRDRoomMaster",
  GET_MRD_RACK_MASTER: "Admin/getMRDRackMaster",
  GET_MRD_SHELF_MASTER: "Admin/getMRDShelfMaster",
  CREATE_UPDATE_MRD_ROOM_MASTER: "Admin/createUpdateMRDRoomMaster",
  CREATE_UPDATE_MRD_RACK_MASTER: "Admin/createUpdateMRDRackMaster",
  CREATE_UPDATE_MRD_SHELF_MASTER: "Admin/createUpdateMRDShelfMaster",

  //doctor master
  GET_DOCTOR_DEPARTMENT_LIST: "Doctor/getDoctorDepartmentList",
  CREATE_UPDATE_DOCTOR_DEPARTMENT: "Doctor/createUpdateDoctorDepartment",
  GET_DOCTOR_SPECIALIZATION_LIST: "Doctor/getDoctorSpecializationList",
  CREATE_UPDATE_DOCTOR_SPECIALIZATION: "Doctor/createUpdateDoctorSpecialization",
  CREATE_UPDATE_DOCTOR_MASTER: "Doctor/createUpdateDoctorMaster",
  GET_DOCTOR_MASTER: "Doctor/getDoctorMaster",
  CREATE_UPDATE_DOCTOR_UNIT_MASTER: "Doctor/createUpdateDoctorUnitMaster",
  UPDATE_DOCTOR_MASTER_STATUS: "Doctor/updateDoctorMasterStatus",
  CREATE_UPDATE_DOCTOR_TIMING_DETAILS: "Doctor/createUpdateDoctorTimingDetails",
  GET_DOCTOR_TIMING_DETAILS: "Doctor/getDoctorTimingDetails",
  CREATE_UPDATE_DOCTOR_UNIT_MAPPING: "Doctor/createUpdateDoctorUnitMapping",
  GET_DOCTOR_UNIT_MAPPING: "Doctor/getDoctorUnitMapping",

  //patient document master
  GET_PATIENT_DOCUMENT_MASTER: "Admin/getPatientDocumentMaster",
  CREATE_UPDATE_PATIENT_DOCUMENT_MASTER: "Admin/createUpdatePatientDocumentMaster",

  // refer doctor master

  CREATE_UPDATE_PRO_MASTER: "Doctor/createUpdateProMaster",
  GET_PRO_LIST: "Doctor/getProList",
  CREATE_UPDATE_REFER_DOCTOR: "Doctor/createUpdateReferDoctor",
  GET_REFER_DOCTOR_LIST: "Doctor/getReferDoctorList",
  UPDATE_REFER_DOCTOR_MASTER_STATUS: "Doctor/updateReferDoctorMasterStatus",

  //lab master
  GET_SAMPLE_CONTAINER_COLOR_MASTER: "Lab/getSampleContainerColorMaster",
  GET_ALL_SAMPLE_TYPE_MASTER: "Lab/getAllSampleTypeMaster",
  CREATE_UPDATE_SAMPLE_TYPE_MASTER: "Lab/createUpdateSampleTypeMaster",
  CREATE_UPDATE_LAB_METHOD_MASTER: "Lab/createUpdateLabMethodMaster",
  GET_LAB_METHOD_MASTER: "Lab/getLabMethodMaster",
  GET_FIELD_BOY_MASTER: "Lab/getFieldBoyMaster",
  CREATE_UPDATE_FIELD_BOY_MASTER: "Lab/createUpdateFieldBoyMaster",
  CREATE_UPDATE_SAMPLE_REJECTION_REMARKS_MASTER: "Lab/createUpdateSampleRejectionRemarksMaster",
  GET_SAMPLE_REJECTION_REMARKS_MASTER: "Lab/getSampleRejectionRemarksMaster",

  // lab investigation master
  GET_CATEGORY_LIST: "Home/getCategoryList",
  GET_SUB_CATEGORY_LIST: "Home/getSubCategoryList",
  GET_SUB_SUB_CATEGORY_LIST: "Home/getSubSubCategoryList",
  GET_INVESTIGATION_SERVICE_ITEM_LIST: "Lab/getInvestigationServiceItemList",
  CREATE_UPDATE_SUB_CATEGORY: "Home/createUpdateSubCategory",
  CREATE_UPDATE_SUB_SUB_CATEGORY: "Home/createUpdateSubSubCategory",
  CREATE_UPDATE_INVESTIGATION_SERVICE_ITEM_MASTER: "Lab/createUpdateInvestigationServiceItemMaster",

  // investigation observation mapping
  CREATE_UPDATE_OBSERVATION_MASTER: "Lab/createUpdateObservationMaster",
  GET_OBSERVATION_MASTER: "Lab/getObservationMaster",
  GET_LAB_INVESTIGATION_OBSERVATION_MAPPING: "Lab/getInvastigationObservationMapping",
  SUBMIT_INVESTIGATION_OBSERVATION_MAPPING: "Lab/submitInvastigationObservationMapping",
  GET_INVESTIGATION_OBSERVATION_RANGE_MASTER: "Lab/getInvastigationObservationRangeMaster",
  SUBMIT_INVESTIGATION_OBSERVATION_RANGE_MASTER: "Lab/submitInvastigationObservationRangeMaster",
};

export { ENDPOINTS };
