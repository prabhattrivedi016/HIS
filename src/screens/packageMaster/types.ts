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

type SubcategoryItem = {
  categoryId: number;
  subCategoryId: number;
  subCategoryName: string;
  labTypeId: number;
};

type SubSubCategoryItem = {
  subCategoryId: number;
  subSubCategoryId: number;
  subSubCategoryName: string;
  printGroupId: number | null;
  departmentId: number | null;
};

type ServiceTableItem = {
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
  reportTypeId: null;
  labTypeId: number;
  reportType: string;
  isSampleRequired: null;
  sampleTypeId: null;
  sampleTypeIdList: string;
  labMethodId: null;
  forGenderId: null;
  forGender: string;
  isOutSource: number;
  isPrintAlone: null;
  isDepartmentReceivingRequired: null;
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
};

type PackageDetailsItem = {
  packageId: number;
  packageName: string;
  packageCode: string;
  isActive: number;
  subSubCategoryId: number;
  subCategoryId: number;
  categoryId: number;
  startsFrom: string;
  expiresOn: string;
  packageServiceNameCode: string;
  packageServiceName: string;
  packageServiceId: number;
  qty: number;
  packageServiceCategory: string;
  packageServiceSubCategoryId: number;
  packageServiceSubSubCategoryId: number;
  packageServiceCode: string;
  packageServiceCategoryId: number;
  isMultipleVisitAllow: number;
  visitDuration: number;
  visitDurationType: string;
  rate?: number;
};

type RateListItem = {
  rateListId: number;
  rateListName: string;
  applicableDate: string;
  expiryDate: string;
  isActive: number;
};

export type {
  CategoryItem,
  PackageDetailsItem,
  RateListItem,
  ServiceTableItem,
  SubcategoryItem,
  SubSubCategoryItem,
};
