type OtMasterItem = {
  BranchName: string;
  BranchId: number;
  OTId: number;
  OTName: string;
  OTStartTime: string;
  OTEndTime: string;
  OTSlotMins: number;
  CreateBy: string;
  CreateOn: string;
  LastModifiedBy: string;
  LastModifiedOn: string;
  IsActive: number;
};

type CategoryItem = {
  categoryId: number;
  categoryName: string;
  categoryTypeId: number;
  categoryTypeName: string;
  createdBy: string;
  createdOn: string;
  lastModifiedBy: string;
  lastModifiedOn: string;
};

type UserMasterItem = {
  id: number;
  firstName: string;
  midelName: string;
  lastName: string;
  dob: string;
  gender: string;
  userName: string;
  password: string;
  address: string;
  contact: string;
  email: string;
  isActive: number;
  employeeID: string;
  createdBy: string;
  createdOn: string;
  lastModifiedBy: string;
  lastModifiedOn: string;
  reportToUserId: number | null;
  userDepartmentId: number | null;
  userRoleId: number | null;
  userRole: string | null;
};

type DoctorByBranchItem = {
  doctorId: number;
  name: string;
  specializationId: number;
  departmentId: number;
  canApproveLabReport: number;
  isDoctorUnit: number;
};

type SubCategoryItem = {
  categoryId: number;
  subCategoryId: number;
  subCategoryName: string;
  labTypeId: number;
};

type SubSubCategoryItem = {
  subCategoryId: number;
  subSubCategoryId: number;
  subSubCategoryName: string;
  printGroupId: number;
  departmentId: number | null;
};

type ServiceItemList = {
  serviceItemId: number;
  hospId: number;
  categoryTypeId: number;
  categoryId: number;
  categoryName: string;
  subCategoryId: number;
  subCategoryName: string;
  subSubCategoryId: number;
  subSubCategoryName: string;
  name: string;
  code: string;
  reportTypeId: number;
  labTypeId: number;
  isRegistrationCharge?: number;
};

type ServiceTableItem = {
  serviceItemId: number;
  serviceName: string;
  otBookingFromTime: string;
  otBookingToTime: string;
  isMainSurgery: number;
  date?: string;
};

type PaylaodValueItem = {
  branchId: number;
  roleId: number;
  patientId: number;
  visitId: number;
  otTypeId: number;
  otType: string;
  otId: number;
  otBookingDate: string;
  otBookingFromTime: string;
  otBookingToTime: string;
  assistantSurgeonId1: number;
  assistantSurgeonId2: number;
  anesthetistId: number;
  assistantAnesthetistId: number;
  anesthesia: string;
  scrubNurseUserId: number;
  circulatingNurseUserId: number;
  otTechnicianUserId: number;
  atTechnicianUserId: number;
  perfusionistUserId: number;
  isBloodRequired: number;
  numberOfBloodUnits: number;
  isVentilatorRequired: number;
  isICURequired: number;
  isUnderPackage: number;
  bloodGroupId: number;
  isInfectiousCase: number;
  infectiousCaseRemarks: string;
  diagnosisSNOMEDCode: string;
  diagnosisName: string;
  isEquipmentRequest: number;
  surgeonIds?: number[];
  equipmentServiceItemIds?: number[];
};

type BloodGroupItem = {
  BloodId: number;
  BloodGroup: number;
  RhType: number;
  BloodGroupType: string;
};

type EquipmentItem = {
  serviceItemId: number;
  hospId: number;
  categoryTypeId: number;
  categoryId: number;
  categoryName: string;
  subCategoryId: number;
  subCategoryName: string;
  subSubCategoryId: number;
  subSubCategoryName: string;
  name: string;
  code: string;
  reportTypeId: number | null;
  labTypeId: number;
  reportType: string;
  isSampleRequired: number | null;
  sampleTypeId: number | null;
  sampleTypeIdList: string;
  labMethodId: number | null;
  forGenderId: number | null;
  forGender: string;
  isOutSource: number;
  isPrintAlone: number | null;
  isDepartmentReceivingRequired: number | null;
  shortName: string;
  sampleVolume: string;
  investigationComment: string;
  tatInMin: number;
  isActive: number;
  gstPer: number;
  roomTypeId: number;
  roomType: string;
  isICU: number;
  snomedCode: string;
  doctorDepartmentIds: string;
  isRequiredSeparatePerformingDoctor: number;
  opdConsultationTypeId: number;
  opdConsultationType: string;
  isOnlineConsultationAllow: number;
  isTeleConsultationService: number;
  isRegistrationCharge: number;
  registrationChargeValidityDays: number;
  packageDurationDays: number | null;
  startsFrom: string;
  expiresOn: string;
  isPackageExpired: number;
  saltName: string;
};

export type {
  BloodGroupItem,
  CategoryItem,
  DoctorByBranchItem,
  EquipmentItem,
  OtMasterItem,
  PaylaodValueItem,
  ServiceItemList,
  ServiceTableItem,
  SubCategoryItem,
  SubSubCategoryItem,
  UserMasterItem,
};
