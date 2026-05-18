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
  UPDATE_SERVICE_ITEM_MASTER_STATUS: "Home/updateServiceItemMasterStatus",
  CREATE_UPDATE_SAMPLE_REMARKS_MASTER: "/Lab/createUpdateSampleRemarksMaster",
  GET_SAMPLE_REMARKS_MASTER: "Lab/getSampleRemarksMaster",

  // investigation observation mapping
  CREATE_UPDATE_OBSERVATION_MASTER: "Lab/createUpdateObservationMaster",
  GET_OBSERVATION_MASTER: "Lab/getObservationMaster",
  GET_LAB_INVESTIGATION_OBSERVATION_MAPPING: "Lab/getInvastigationObservationMapping",
  SUBMIT_INVESTIGATION_OBSERVATION_MAPPING: "Lab/submitInvastigationObservationMapping",
  GET_INVESTIGATION_OBSERVATION_RANGE_MASTER: "Lab/getInvastigationObservationRangeMaster",
  SUBMIT_INVESTIGATION_OBSERVATION_RANGE_MASTER: "Lab/submitInvastigationObservationRangeMaster",

  // refer lab master
  GET_OUT_SOURCE_LAB_MASTER_LIST: "Admin/getOutSourceLabMasterList",
  SAVE_OUT_SOURCE_LAB_MASTER: "Admin/saveOutSourceLabMaster",

  // rate list master
  GET_RATE_LIST_MASTER: "Admin/getRateListMaster",
  CREATE_UPDATE_RATE_LIST_MASTER: "Admin/createUpdateRateListMaster",

  //tariff manager
  GET_TARIFF_MASTER: "Admin/getTariffMaster",
  CREATE_UPDATE_TARIFF_MASTER: "Admin/createUpdateTariffMaster",
  GET_SERVICE_ITEM_LIST: "Home/GetServiceItemList",

  // corporate master
  GET_INSURANCE_COMPANY_MASTER_LIST: "Admin/getInsuranceCompanyMasterList",
  CREATE_UPDATE_INSURANCE_COMPANY_MASTER: "Admin/createUpdateInsuranceCompanyMaster",
  CREATE_UPDATE_CORPORATE_TYPE_MASTER: "Admin/createUpdateCorporateTypeMaster",
  GET_CORPORATE_MASTER_LIST: "Admin/getCorporateMasterList",
  CREATE_UPDATE_CORPORATE_MASTER: "Admin/createUpdateCorporateMaster",
  GET_CORPORATE_TYPE_MASTER_LIST: "Admin/getCorporateTypeMasterList",
  GET_PAYMENT_MODE_MASTER_LIST: "Home/getPaymentModeMasterList",
  UPDATE_CORPORATE_MASTER_STATUS: "Admin/updateCorporateMasterStatus",

  // patient master
  GET_PATIENT_MASTER: "Patient/getPatientMaster",
  CREATE_UPDATE_PATIENT_MASTER: "Patient/createUpdatePatientMaster",
  SEARCH_PATIENT_MASTER: "Patient/searchPatientMaster",
  GET_PATIENT_DOCUMENT_MAPPING: "Patient/getPatientDocumentMapping",
  UPLOAD_PATIENT_DOCUMENT: "Patient/uploadPatientDocument",

  // discount approval master
  CREATE_UPDATE_DISCOUNT_APPROVAL_MASTER: "Admin/createUpdateDiscountApprovalMaster",
  GET_DISCOUNT_APPROVAL_MASTER_LIST: "Admin/getDiscountApprovalMasterList",

  // access rights
  GET_USER_ACCESS_RIGHTS: "User/getUserAccessRights",
  GET_DASHBOARD_USER_ACCESS_RIGHTS: "User/getDashboardUserAccessRights",

  // opd billing
  GET_SERVICE_ALL_DETAILS_FOR_OPD_BILLING: "Patient/getServiceAllDetailsForOPDBilling",
  GET_PACKAGE_ALL_DETAILS: "Patient/getPackageAllDetails",
  SAVE_OPD_BILLING: "Patient/saveOPDBilling",
  GET_OPD_CARD_DETAILS: "Patient/getOPDCardDetails",
  GET_OPD_RECEIPT_LIST: "Patient/getOPDReceiptList",
  GET_RECEIPT_DETAILS_BY_FTID: "Patient/getReceiptDetailsByFTID",

  // formula master
  GET_FORMULA_BY_OBSERVATION_ID: "Lab/getFormulaMasterByObservationId",
  GET_OBSERVATION_FORMULA_BY_INVESTIGATION_ID: "Lab/getObservationFormulaByInvestigationId",
  CREATE_UPDATE_LAB_FORMULA_MASTER: "Lab/createUpdateLabFormulaMaster",
  DELETE_LAB_FORMULA_BY_OBSERVATION_ID: "Lab/deleteLabFormulaByObservationid",

  // sample management
  SEARCH_PATIENT_INVESTIGATION_FOR_SAMPLE_MANAGEMENT:
    "Lab/searchPatientInvestigationForSampleManagement",
  UPDATE_SAMPLE_STATUS: "Lab/updateSampleStatus",
  GET_PATIENT_INVESTIGATION_DETAILS: "Lab/getPatientInvestigationDetails",
  GET_PATIENT_INVESTIGATION_REMARK: "Lab/getPatientInvestigationRemark",
  CREATE_UPDATE_PATIENT_INVESTIGATION_REMARK: "/Lab/createUpdatePatientInvestigationRemark",
  DELETE_PATIENT_INVESTIGATION_REMARK: "Lab/deletePatientInvestigationRemark",

  GET_INVESTIGATION_DOCUMENT_NAME_MASTER: "Lab/getInvestigationDocumentNameMaster",
  INSERT_PATIENT_INVESTIGATION_DOCUMENT: "Lab/insertPatientInvestigationDocument",
  GET_PATIENT_INVESTIGATION_DOCUMENT_LIST: "Lab/getPatientInvestigationDocumentList",
  DELETE_PATIENT_INVESTIGATION_DOCUMENT: "Lab/deletePatientInvestigationDocument",
  CREATE_UPDATE_INVESTIGATION_DOCUMENT_NAME_MASTER:
    "Lab/createUpdateInvestigationDocumentNameMaster",
  REJECT_SAMPLE_STATUS: "Lab/rejectSampleStatus",

  //pathology result entry
  SEARCH_PATIENT_INVESTIGATION_FOR_SAMPLE_PROCESSING_PATHOLOGY:
    "Lab/searchPatientInvestigationForSampleProcessingPathology",

  // radiology result entry
  SEARCH_PATIENT_INVESTIGATION_FOR_SAMPLE_PROCESSING_RADIOLOGY:
    "Lab/searchPatientInvestigationForSampleProcessingRadiology",

  // investigation result entry
  GET_PATIENT_TABULAR_REPORT_FOR_RESULT_ENTRY: "Lab/getPatientTabularReportForResultEntry",
  GET_PATIENT_FREE_TEXT_REPORT_FOR_RESULT_ENTRY: "Lab/getPatientFreeTextReportForResultEntry",
  SAVE_PATIENT_TABULAR_REPORT: "Lab/savePatientTabularReport",
  SAVE_PATIENT_FREE_TEXT_REPORT: "Lab/savePatientFreeTextReport",
  GET_ALL_INVESTIGATION_NAME_OF_PATIENT: "Lab/getAllInvestigationNameOfPatient",

  // investigation interpretation template master
  CREATE_UPDATE_INVESTIGATION_TEMPLATE_COMMENT_MASTER:
    "Lab/createUpdateInvastigationTemplateCommentMaster",
  GET_INVESTIGATION_TEMPLATE_COMMENT_MASTER: "Lab/getInvastigationTemplateCommentMaster",
  GET_ALL_INVESTIGATION_TEMPLATE_COMMENTS: "Lab/getAllInvestigationTemplateComments",
  CREATE_UPDATE_OBSERVATION_LOV_MASTER: "Lab/createUpdateObservationLOVMaster",
  GET_OBSERVATION_LIST_OF_VALUES_MASTER: "Lab/getObservationListOfValuesMaster",
  SAVE_INVESTIGATION_TEMPLATE_INTERPRETATION_MAPPING:
    "Lab/saveInvestigationTemplateInterpretationMappings",
  GET_INVESTIGATION_TEMPLATE_INTERPRETATION_MAPPINGS:
    "Lab/getInvestigationTemplateInterpretationMappings",
  SAVE_OBSERVATION_COMMENTS_LOVS_MAPPINGS: "Lab/saveObservationCommentsLOVsMappings",
  GET_OBSERVATION_COMMENT_LOVS_MAPPINGS: "Lab/getObservationCommentLOVsMappings",
};

export { ENDPOINTS };
