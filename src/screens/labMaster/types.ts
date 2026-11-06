type ColorItem = {
  colorId: number;
  colorName: string;
  colorCode: string;
};

type SampleTypeItem = {
  sampleTypeId: number;
  sampleType: string;
  containerColorId: number;
  colorName: string;
  colorCode: string;
  createdBy: string;
  createdOn: string;
  lastModifiedBy: string;
  lastModifiedOn: string;
  isActive: number;
};

type LabMethodItem = {
  methodId: number;
  method: string;
  createdBy: string;
  createdOn: string;
  lastModifiedBy: string;
  lastModifiedOn: string;
  isActive: number;
};

type FieldBoyItem = {
  fieldBoyId: number;
  fieldBoyName: string;
  isActive: number;
  createdBy?: string;
  createdOn?: string;
  lastModifiedBy?: string;
  lastModifiedOn?: string;
};

type SampleRejectionItem = {
  sampleRejectionRemarksID: number;
  sampleRejectionRemarks: string;
  isActive: number;
  createdBy?: string;
  createdOn?: string;
  lastModifiedBy?: string;
  lastModifiedOn?: string;
};

type SampleRemarksItem = {
  sampleRemarksID: number;
  sampleRemarks: string;
  isActive: number;
};

type InvestigationItem = {
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
  reportType: string;
  isSampleRequired: number;
  sampleTypeId: number;
  sampleTypeIdList: string;
  labMethodId: number;
  forGenderId: number;
  forGender: string;
  isOutSource: number;
  isPrintAlone: number;
  isSampleSegregationRequired: null;
  isDepartmentReceivingRequired: number;
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
  packageDurationDays: null;
  startsFrom: string;
  expiresOn: string;
  isPackageExpired: number;
  saltName: string;
};

type InvestigationCommentItem = {
  Id: number;
  InvestigationId: number;
  InvestigationName: string;
  CommentName: string;
  CommentValue: string;
  IsActive: 1;
  CreatedBy: string;
  CreatedOn: string;
  LastModifiedBy: null | string;
  LastModifiedOn: null | string;
};
export type {
  ColorItem,
  FieldBoyItem,
  InvestigationCommentItem,
  InvestigationItem,
  LabMethodItem,
  SampleRejectionItem,
  SampleRemarksItem,
  SampleTypeItem,
};
