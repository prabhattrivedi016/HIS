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
  GET_USER_GRANTED_REMAINING_TAB_MASTER: "Admin/getUserGrantedRemainingTabMaster",
  SAVE_UPDATE_USER_IPD_TAB_MAPPING: "Admin/saveUpdateUserIPDTabMapping",

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
  GET_CORPORATE_LIST_BY_BRANCH_ID_AND_INSURANCE_COMPANY_ID:
    "Home/getCorporateListByBranchIdAndInsuranceCompanyId",

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
  GET_ASSIGN_BRANCH_RIGHT: "/Home/getAssignBranchRight",
  GET_DASHBOARD_USER_ACCESS_RIGHTS: "User/getDashboardUserAccessRights",

  // opd billing
  GET_SERVICE_ALL_DETAILS_FOR_OPD_BILLING: "Patient/getServiceAllDetailsForOPDBilling",
  GET_PACKAGE_ALL_DETAILS: "Patient/getPackageAllDetails",
  SAVE_OPD_BILLING: "Patient/saveOPDBilling",
  GET_OPD_CARD_DETAILS: "Patient/getOPDCardDetails",
  GET_OPD_RECEIPT_LIST: "Patient/getOPDReceiptList",
  GET_RECEIPT_DETAILS_BY_FTID: "Patient/getReceiptDetailsByFTID",
  FIND_DUPLICATE_SERVICE: "Patient/findDuplicateService",
  GET_INVESTIGATION_OBSERVATION_MAPPING_DETAILS:
    "Patient/getInvestigationObservationMappingDetails",
  GET_USER_DISCOUNT_RIGHTS: "Patient/getUserDiscountRights",
  GET_PATIENT_PREVIOUS_DUES: "Patient/getPatientPreviousDues",
  GET_PATIENT_BALANCE_AMOUNT_OPD: "Patient/getPatientBalanceAmountOPD",
  GET_PATIENT_BALANCE_AMOUNT_IPD: "Patient/getPatientBalanceAmountIPD",
  GET_PATIENT_BALANCE_AMOUNT_PHARMACY: "Patient/getPatientBalanceAmountPharmacy",
  SAVE_OPD_BOOKING: "Patient/saveOPDBooking",

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
  UPDATE_REPORT_APPROVAL: "Lab/updateReportApproval",
  PRINT_PATIENT_INVESTIGATION_REPORT: "Home/printPatientInvestigationReport",

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

  // laboratory help desk
  SEARCH_PATIENT_INVESTIGATION_FOR_LABORATORY_HELP_DESK:
    "Lab/searchPatientInvestigationForLaboratoryHelpDesk",

  // histo report master
  GET_HISTO_TEMPLATE_MASTER: "Lab/getHistoTemplateMaster",
  CREATE_UPDATE_HISTO_TEMPLATE_MASTER: "Lab/createUpdateHistoTemplateMaster",
  CREATE_UPDATE_SPECIMEN_MASTER: "Lab/createUpdateSpecimenMaster",
  GET_SPECIMEN_MASTER: "Lab/getSpecimenMaster",
  CREATE_UPDATE_HISTO_PENDING_REASON_MASTER: "Lab/createUpdateHistoPendingReasonMaster",
  GET_HISTO_PENDING_REASON_MASTER: "Lab/getHistoPendingReasonMaster",
  CREATE_UPDATE_HISTO_IMMUNO_ANTIBIOTIC_MASTER: "Lab/createUpdateHistoImmunoAntibioticMaster",
  GET_HISTO_IMMUNO_ANTIBIOTIC_MASTER: "Lab/getHistoImmunoAntibioticMaster",
  CREATE_UPDATE_SPECIMEN_MAPPING_MASTER: "Lab/createUpdateSpecimenMappingMaster",
  GET_SPECIMEN_MAPPING_MASTER: "Lab/getSpecimenMappingMaster",

  // micro report master
  GET_ORGANISM_GROUP_LIST: "Lab/getOrganismGroupList",
  CREATE_UPDATE_ORGANISM_GROUP: "Lab/createUpdateOrganismGroup",
  CREATE_UPDATE_ORGANISM_NAME: "Lab/createUpdateOrganismName",
  GET_ORGANISM_NAME_LIST: "Lab/getOrganismNameList",
  CREATE_UPDATE_ANTIBIOTIC_GROUP: "Lab/createUpdateAntibioticGroup",
  GET_ANTIBIOTIC_GROUP_LIST: "Lab/getAntibioticGroupList",
  CREATE_UPDATE_ANTIBIOTIC_NAME: "Lab/createUpdateAntibioticName",
  GET_ANTIBIOTIC_NAME_LIST: "Lab/getAntibioticNameList",
  CREATE_UPDATE_MICRO_TEMPLATE: "Lab/createUpdateMicroTemplate",
  GET_MICRO_TEMPLATE_LIST: "Lab/getMicroTemplateList",
  CREATE_UPDATE_MICRO_MAPPING: "Lab/createUpdateMicroMapping",
  GET_MICRO_MAPPING_BY_ORGANISM_ID: "Lab/getMicroMappingByOrganismId",

  // user wise discount master
  GET_USER_WISE_DISCOUNT_MASTER: "Admin/getUserwiseDiscountMaster",
  SAVE_USER_WISE_DISCOUNT_MASTER: "Admin/saveUserwiseDiscountMaster",

  // consultation header master
  CREATE_UPDATE_DOCTOR_HEADER: "Admin/createUpdateDoctorHeader",
  GET_ALL_DOCTOR_HEADER_MASTER: "Admin/getAllDoctorHeaderMaster",
  GET_DOCTOR_HEARDER_LOVS: "Admin/getDoctorHeaderLOVs",
  GET_DOCTOR_HEADER_MAPPING_FOR_MASTER: "Admin/getDoctorHeaderMappingForMaster",
  SAVE_DOCTOR_HEADER_DEPARTMENT_MAPPING: "Admin/saveDoctorHeaderDepartmentMapping",
  // consultation header master — "Image Uploader" control type document slots
  GET_EMR_CONTROL_DOCUMENT_MAPPING: "EMR/getEMRControlDocumentMapping",
  UPLOAD_EMR_CONTROL_DOCUMENT: "EMR/uploadEMRControlDocument",
  DELETE_EMR_CONTROL_DOCUMENT_MAPPING: "EMR/deleteEMRControlDocumentMapping",

  // emr controls — sections built from existing Header Master controls
  GET_ALL_EMR_SECTIONS: "EMR/getEMRSectionMaster",
  CREATE_UPDATE_EMR_SECTION: "EMR/createUpdateEMRSectionMaster",
  GET_EMR_SECTION_HEADER_MAPPING: "EMR/getEMRSectionHeaderMapping",

  // emr controls — mapping EMR Sections to a doctor or department
  GET_EMR_SECTION_DEPARTMENT_MAPPING: "EMR/getEMRSectionDepartmentMapping",
  SAVE_EMR_SECTION_DEPARTMENT_MAPPING: "EMR/saveEMRSectionDepartmentMapping",

  // emr controls — score formula per section (e.g. Braden Scale style scored assessments)
  GET_EMR_SECTION_SCORE_FORMULA: "EMR/getEMRSectionScoreFormula",
  CREATE_UPDATE_EMR_SECTION_SCORE_FORMULA: "EMR/saveEMRSectionScoreFormula",

  // emr controls — per-attribute conditional visibility (each attribute can have its own rule chain)
  GET_EMR_SECTION_ATTRIBUTE_CONDITION: "EMR/getEMRSectionAttributeCondition",
  SAVE_EMR_SECTION_ATTRIBUTE_CONDITION: "EMR/saveEMRSectionAttributeCondition",
  DELETE_EMR_SECTION_ATTRIBUTE_CONDITION: "EMR/deleteEMRSectionAttributeCondition",

  // emr controls — runs a header's saved query (e.g. "Custom" control type) and returns its result rows
  GET_EMR_HEADER_QUERY_RESULT: "EMR/getEMRHeaderQueryResult",

  // emr section history — NOT YET IMPLEMENTED on the backend. The frontend currently reads/writes
  // useEmrSectionHistoryStore (localStorage) instead — see that file for the exact entry shapes.
  // GET_EMR_SECTION_HISTORY:   params { patientId, sectionId } -> EmrSectionVisitSnapshotEntry[]
  //   (no separate save endpoint — this is just a reshaped query over existing
  //   SAVE_CONSULTATION_EMR submissions, filtered to the "emrSection" attribute matching sectionId)
  // GET_EMR_SECTION_EDIT_LOG:  params { patientId, sectionId } -> EmrSectionEditLogEntry[]
  // SAVE_EMR_SECTION_EDIT_LOG: body EmrSectionEditLogEntry (minus id) -> { result, message }
  //   (frontend doesn't call this yet — logEdit() in useEmrSectionHistoryStore only writes
  //   locally; wire it in once this endpoint exists)
  GET_EMR_SECTION_HISTORY: "EMR/getEMRSectionHistory",
  GET_EMR_SECTION_EDIT_LOG: "EMR/getEMRSectionEditLog",
  SAVE_EMR_SECTION_EDIT_LOG: "EMR/saveEMRSectionEditLog",

  // patient visit reports (uploaded image/PDF reports + freehand annotations) and doctor visit
  // notes (rich text + freehand working space) — NOT YET IMPLEMENTED on the backend. The frontend
  // already calls these; until matching routes exist, calls fail and the UI falls back to its
  // local browser cache (useVisitReportsStore / useDoctorNotesStore, both persisted to localStorage).
  // GET_PATIENT_VISIT_REPORTS:   params { patientId, visitId } -> { result, data: VisitReportDocument[] }
  //   VisitReportDocument: { id, patientId, visitId, fileName, uploadedOn, updatedOn,
  //     pages: { pageNumber, dataUrl, strokes: ReportAnnotationStroke[] }[] }
  //   ReportAnnotationStroke: { id, tool, points: number[], color, strokeWidth }
  // SAVE_PATIENT_VISIT_REPORT:   body VisitReportDocument (upsert by id) -> { result, message }
  // DELETE_PATIENT_VISIT_REPORT: params { id } -> { result, message }
  // GET_DOCTOR_VISIT_NOTE:       params { patientId, visitId } -> { result, data: DoctorNoteEntry | null }
  //   DoctorNoteEntry: { patientId, visitId, content, imageSrc, imageTransform: { x, y, scaleX, scaleY },
  //     strokes: ReportAnnotationStroke[], updatedOn }
  // SAVE_DOCTOR_VISIT_NOTE:      body DoctorNoteEntry (upsert by patientId+visitId) -> { result, message }
  GET_PATIENT_VISIT_REPORTS: "EMR/getPatientVisitReports",
  SAVE_PATIENT_VISIT_REPORT: "EMR/savePatientVisitReport",
  DELETE_PATIENT_VISIT_REPORT: "EMR/deletePatientVisitReport",
  GET_DOCTOR_VISIT_NOTE: "EMR/getDoctorVisitNote",
  SAVE_DOCTOR_VISIT_NOTE: "EMR/saveDoctorVisitNote",

  // doctor consultation new
  SEARCH_PATIENT_FOR_CONSULTATION: "Patient/searchPatientForConsultation",
  GET_PATIENT_VITAL: "Patient/getPatientVital",
  GET_DOCTOR_FAVOURITE_EMR_SECTIONS: "EMR/getDoctorFavouriteEMRSections",
  SAVE_DOCTOR_FAVOURITE_EMR_SECTIONS: "EMR/saveDoctorFavouriteEMRSections",

  // service master
  GET_CATEGORY_TYPE_LIST: "Home/getCategoryTypeList",
  CREATE_UPDATE_CATEGORY: "Home/createUpdateCategory",
  GET_PRINT_GROUP_MASTER: "Admin/getPrintGroupMaster",
  CREATE_UPDATE_PRINT_GROUP_MASTER: "Admin/createUpdatePrintGroupMaster",
  CREATE_UPDATE_SERVICE_ITEM_MASTER: "Admin/createUpdateServiceItemMaster",

  // bed master
  CREATE_UPDATE_FLOOR_MASTER: "Admin/createUpdateFloorMaster",
  GET_FLOOR_LIST: "Admin/getFloorList",
  CREATE_UPDATE_WARD_NAME_MASTER: "Admin/createUpdateWardNameMaster",
  GET_WARD_NAME_MASTER: "Admin/getWardNameMaster",
  GET_ALL_BED_LIST: "Admin/getAllBedList",
  CREATE_UPDATE_BED_MASTER: "Admin/createUpdateBedMaster",
  GET_BLOCK_LIST: "Admin/getBlockList",
  CREATE_UPDATE_BLOCK_MASTER: "Admin/createUpdateBlockMaster",

  // ipd admission
  GET_BED_TYPES: "Home/getBedTypes",
  GET_AVAILABLE_BEDS: "Home/getAvailableBeds",
  CHECK_PATIENT_ADMITTED: "Home/checkPatientAdmitted",
  CHECK_BED_STATUS: "Home/checkBedStatus",
  SAVE_IPD_ADMISSION: "Patient/saveIPDAdmission",

  // tab master
  CREATE_UPDATE_TAB_GROUP_TYPE_MASTER: "Admin/createUpdateTabGroupTypeMaster",
  GET_TAB_GROUP_TYPE_MASTER: "Admin/getTabGroupTypeMaster",
  GET_IPD_TAB_MASTER: "Admin/getIPDTabMaster",
  CREATE_UPDATE_IPD_TAB_MASTER: "Admin/createUpdateIPDTabMaster",
  GET_ROLE_WISE_IPD_TAB_LIST_MASTER: "Admin/getRoleWiseIPDTabListMaster",
  SAVE_UPDATE_ROLE_WISE_IPD_TAB_MAPPING: "Admin/saveUpdateRoleWiseIPDTabMapping",

  // ipd & opd document
  GET_VISIT_WISE_PATIENT_DOCUMENT_MAPPING: "Patient/getVisitWisePatientDocumentMapping",
  UPLOAD_VISIT_WISE_PATIENT_DOCUMENT: "Patient/uploadVisitWisePatientDocument",

  // ipd billing
  SEARCH_IPD_PATIENT: "Patient/searchIPDPatient",
  GET_BILLING_TABS: "Home/getBillingTabs",

  // allergy master
  GET_PATIENT_ALLERGY_DETAIL_LIST: "EMR/getPatientAllergyDetailList",
  GET_ALLERGY_MASTER_LIST: "EMR/getAllergyMasterList",
  GET_SALT_NAME_MASTER_LIST: "EMR/getSaltNameMasterList",
  CREATE_UPDATE_ALLERGY_MASTER: "EMR/createUpdateAllergyMaster",
  DELETE_ALLERGY_MASTER: "EMR/deleteAllergyMaster",
  SAVE_PATIENT_ALLERGY: "EMR/savePatientAllergy",
  CREATE_UPDATE_PATIENT_ALLERGY_DETAILS: "EMR/createUpdatePatientAllergyDetails",
  DELETE_PATIENT_ALLERGY: "EMR/deletePatientAllergy",
  DELETE_PATIENT_ALLERGY_DETAILS: "EMR/deletePatientAllergyDetails",
  SAVE_CONSULTATION_EMR: "EMR/saveConsultationEmr",

  // diagnosis master
  GET_DIAGNOSIS_MASTER_LIST: "EMR/getDiagnosisMasterList",
  CREATE_UPDATE_DIAGNOSIS_MASTER: "EMR/createUpdateDiagnosisMaster",
  DELETE_DIAGNOSIS_MASTER: "EMR/deleteDiagnosisMaster",

  // gravity master
  CREATE_UPDATE_GRAVITY_MASTER: "EMR/createUpdateGravityMaster",

  // chief complaint master
  GET_CHIEF_COMPLAINT_MASTER_LIST: "EMR/getChiefComplaintMasterList",
  CREATE_UPDATE_CHIEF_COMPLAINT_MASTER: "EMR/createUpdateChiefComplaintMaster",

  // doctor-wise favourite entries for any table-type EMR header
  GET_DOCTOR_FAVOURITE_TABLE_ENTRIES: "EMR/getDoctorFavouriteTableEntries",
  SAVE_DOCTOR_FAVOURITE_TABLE_ENTRY: "EMR/saveDoctorFavouriteTableEntry",
  DELETE_DOCTOR_FAVOURITE_TABLE_ENTRY: "EMR/deleteDoctorFavouriteTableEntry",

  // generic delete of a single record from any named master table
  DELETE_RECORD_BY_TABLE_NAME: "EMR/deleteRecordByTableName",

  // order sets (named groups of table rows a doctor can bulk-add at once, e.g. investigation panels)
  GET_INVESTIGATION_ORDER_SET_LIST: "EMR/getInvestigationOrderSetList",
  CREATE_UPDATE_INVESTIGATION_ORDER_SET: "EMR/createUpdateInvestigationOrderSet",
  GET_MEDICINE_ORDER_SET_LIST: "EMR/getMedicineOrderSetList",
  CREATE_UPDATE_MEDICINE_ORDER_SET: "EMR/createUpdateMedicineOrderSet",
  GET_PROCEDURE_ORDER_SET_LIST: "EMR/getProcedureOrderSetList",
  CREATE_UPDATE_PROCEDURE_ORDER_SET: "EMR/createUpdateProcedureOrderSet",
  GET_DIAGNOSIS_ORDER_SET_LIST: "EMR/getDiagnosisOrderSetList",
  CREATE_UPDATE_DIAGNOSIS_ORDER_SET: "EMR/createUpdateDiagnosisOrderSet",

  // procedure master
  GET_PROCEDURE_MASTER_LIST: "EMR/getProcedureMasterList",
  CREATE_UPDATE_PROCEDURE_MASTER: "EMR/createUpdateProcedureMaster",
  DELETE_PROCEDURE_MASTER: "EMR/deleteProcedureMaster",

  // dose master — Morning-Afternoon-Evening-Night patterns (e.g. "1-0-1") offered from the
  // "Dose Master" popup on the Medicine List control
  GET_DOSE_MASTER_LIST: "EMR/getDoseMasterList",
  CREATE_UPDATE_DOSE_MASTER: "EMR/createUpdateDoseMaster",

  // vital master
  GET_VITAL_MASTER_LIST: "Admin/getVitalMasterList",
  GET_VITAL_UNIT_MASTER_LIST: "Admin/getVitalUnitMasterList",
  CREATE_UPDATE_VITAL_MASTER: "Admin/createUpdateVitalMaster",
  CREATE_UPDATE_VITAL_UNIT_MASTER: "Admin/CreateUpdateVitalUnitMaster",
  GET_VITAL_MAPPING_LIST: "Admin/getVitalDepartmentMapping",
  SAVE_VITAL_MAPPING: "Admin/saveVitalDepartmentMapping",

  // authority approval
  GET_APPROVAL_AUTHORITY_MASTER_LIST: "Admin/getApprovalAuthorityMasterList",
  CREATE_UPDATE_APPROVAL_AUTHORITY_MASTER: "Admin/createUpdateApprovalAuthorityMaster",
  UPDATE_APPROVAL_AUTHORITY_MASTER_STATUS: "Admin/updateApprovalAuthorityMasterStatus",

  // branch settings
  GET_BRANCH_RIGHT_MAPPING: "Admin/getBranchRightMapping",
  SAVE_BRANCH_RIGHT_MAPPING: "Admin/saveBranchRightMapping",
  GET_BRANCH_CORPORATE_RATE_LIST_MAPPING: "Admin/getBranchCorporateRatelistMapping",
  SAVE_BRANCH_CORPORATE_RATE_LIST_MAPPING: "Admin/saveBranchCorporateRatelistMapping",
  SAVE_BRANCH_CORPORATE_SERVICE_EXCLUSION_MAPPING:
    "Admin/saveBranchCorporateServiceExclusionMapping",
  GET_BRANCH_CORPORATE_SERVICE_EXCLUSION_MAPPING: "Admin/getBranchCorporateServiceExclusionMapping",
  UPDATE_DEFAULT_BRANCH_SETTING: "Admin/updateDefaultBranchSetting",

  // op discount approval
  GET_OPD_BOOKING_DETAILS_FOR_DISCOUNT_APPROVAL: "Patient/getOPDBookingDetailsForDiscountApproval",
  APPROVE_OPD_BOOKING_DISCOUNT: "Patient/approveOPDBookingDiscount",
  CANCEL_OPD_BOOKING: "Patient/cancelOPDBooking",
  GET_OPD_BOOKING_DETAILS_FOR_PAYMENT_COLLECTION:
    "Patient/getOPDBookingDetailsForPaymentCollection",
  GET_OPD_BOOKING_APPROVAL_DETAILS: "Patient/getOPDBookingApprovalDetails",
  GET_OPD_BOOKING_DETAILS_BY_BOOKING_ID: "Patient/getOPDBookingDetailsByBookingId",
  PAYMENT_COLLECTED_FOR_OPD_BOOKING: "Patient/paymentCollectedForOPDBooking",

  // patient advance
  GET_PATIENT_LEDGER_BILL: "Home/getPatientLedgerBill",
  SAVE_PATIENT_ADVANCE: "Patient/savePatientAdvance",
  GET_PATIENT_LEDGER_RECEIPT_DETAILS: "Patient/getPatientLedgerReceiptDetails",
  GET_PATIENT_ADVANCE_RECEIPT_LIST: "Patient/getPatientAdvanceReceiptList",

  // opd refund
  GET_BILL_TO_REFUND: "Patient/getBillToRefund",
  GET_BILL_DETAILS_TO_REFUND: "Patient/getBillDetailsToRefund",
  GET_OPD_PACKAGE_SERVICES_FOR_REFUND: "Patient/getOPDPackageServicesForRefund",
  SAVE_OPD_REFUND_BILLING: "Patient/saveOpdRefundBilling",
  SAVE_OPD_REFUND_REQUEST_APPROVAL: "Patient/saveOPDRefundRequestApproval",
  GET_CORPORATE_PAYMENT_MODES: "Home/getCorporatePaymentModes",

  // op refund approval
  GET_OPD_REFUND_REQUEST_LIST_FOR_APPROVAL: "Patient/getOPDRefundRequestListForApproval",
  GET_OPD_REFUND_REQUEST_APPROVAL_DETAILS: "Patient/getOPDRefundRequestApprovalDetails",
  GET_OPD_REFUND_REQUEST_DETAILS_BY_REFUND_ID: "Patient/getOPDRefundRequestDetailsByRefundId",
  PAYMENT_COLLECTED_FOR_OPD_REFUND_REQUEST: "Patient/paymentCollectedForOPDRefundRequest",
  CANCEL_OPD_REFUND_REQUEST: "Patient/cancelOPDRefundRequest",
  APPROVE_OPD_REFUND_REQUEST: "Patient/approveOPDRefundRequest",
  PAYMENT_OPD_REFUND_REQUEST: "Patient/paymentOPDRefundRequest",
  // bill receipt reprint
  GET_BILL_RECEIPT_PRINT_DETAILS: "Patient/getBillReceiptReprintDetails",

  // credit note
  GET_BILL_FOR_CREDIT_NOTE: "Patient/getBillForCreditNote",
  GET_BILL_DETAILS_FOR_CREDIT_NOTE: "Patient/getBillDetailsForCreditNote",
  SAVE_CREDIT_NOTE_REQUEST_APPROVAL: "Patient/saveCreditNoteRequestApproval",
  APPROVE_CREDIT_NOTE_REQUEST: "Patient/approveCreditNoteRequest",
  CANCEL_CREDIT_NOTE_REQUEST: "Patient/cancelCreditNoteRequest",
  COLLECT_CREDIT_NOTE_REQUEST: "Patient/collectCreditNoteRequest",
  GET_CREDIT_NOTE_REQUEST_LIST_FOR_APPROVAL: "Patient/getCreditNoteRequestListForApproval",
  GET_CREDIT_NOTE_REQUEST_DETAILS_BY_CREDIT_NOTE_ID:
    "Patient/getCreditNoteRequestDetailsByCreditNoteId",
  GET_CREDIT_NOTE_REQUEST_APPROVAL_DETAILS: "Patient/getCreditNoteRequestApprovalDetails",
  // write off
  GET_BILL_FOR_WRITE_OFF: "Patient/getBillForWriteOff",
  GET_BILL_DETAILS_FOR_WRITE_OFF: "Patient/getBillDetailsForWriteOff",
  SAVE_WRITE_OFF_REQUEST_APPROVAL: "Patient/saveWriteOffRequestApproval",
  APPROVE_WRITE_OFF_REQUEST: "Patient/approveWriteOffRequest",
  CANCEL_WRITE_OFF_REQUEST: "Patient/cancelWriteOffRequest",
  COLLECT_WRITE_OFF_REQUEST: "Patient/collectWriteOffRequest",
  GET_WRITE_OFF_REQUEST_LIST_FOR_APPROVAL: "Patient/getWriteOffRequestListForApproval",
  GET_WRITE_OFF_REQUEST_DETAILS_BY_WRITE_OFF_ID: "Patient/getWriteOffRequestDetailsByWriteOffId",
  GET_WRITE_OFF_REQUEST_APPROVAL_DETAILS: "Patient/getWriteOffRequestApprovalDetails",
};

export { ENDPOINTS };
