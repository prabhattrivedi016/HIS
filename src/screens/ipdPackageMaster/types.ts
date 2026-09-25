import { OptionItem } from "@/types";

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
  isPackageExpired: number;
  saltName: string;
  startsFrom: string;
  expiresOn: string;
};

type PackageDetailsItem = {
  Id: number;
  PackageId: number;
  CategoryId: number;
  CategoryName: string;
  SubCategoryId: number;
  SubCategoryName: string;
  SubSubCategoryId: number | null;
  SubSubCategoryName: string | null;
  ServiceItemId: number | null;
  ServiceItemName: string | null;
  LimitTypeId: number;
  LimitType: string;
  Limit: number;
  ServiceQty: number;
};

type RateListItem = {
  rateListId: number;
  rateListName: string;
  applicableDate: string;
  expiryDate: string;
  isActive: number;
};

type PackageSetupItem = {
  categoryId: number;
  subCategoryId: number;
  subSubCategoryId: number;
  serviceItemId: number;
  limitTypeId: number;
  limitType: string;
  limit: number;
  serviceQty: number;
  serviceName?: string;
  categoryName?: string;
  subCategoryName?: string;
  subSubCategoryName?: string;
  rate?: string;
  qty?: string;
};

type SearchServiceItem = {
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
  startsFrom: string | null;
  expiresOn: string | null;
  isPackageExpired: number;
  saltName: string;
};

type packageSetupStateValue = {
  category: OptionItem;
  subCategory: OptionItem;
  subSubCategory: OptionItem;
  limitType: string;
  limitTypeId: number;
  limit: string;
  serviceItemId: number;
  serviceQty: string;
  serviceName: string;
};
export type {
  CategoryItem,
  PackageDetailsItem,
  PackageSetupItem,
  packageSetupStateValue,
  RateListItem,
  SearchServiceItem,
  ServiceTableItem,
  SubcategoryItem,
  SubSubCategoryItem,
};
