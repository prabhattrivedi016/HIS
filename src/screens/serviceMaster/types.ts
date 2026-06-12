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

type ServiceTableItem = {
  serviceItemId: number;
  hospId: number;
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
  opdConsultationTypeId: number;
  opdConsultationType: string;
  isOnlineConsultationAllow: number;
  isTeleConsultationService: number;
};

type CategoryTypeItem = { categoryTypeId: number; categoryTypeName: string };

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
  departmentId: number;
};

type DoctorDepartmentList = {
  departmentId: number;
  department: string;
  departmentTypeId: number;
  departmentType: string;
  isActive: number;
};

type PrintGroupItem = { PrintGroupId: number; PrintGroupName: string; PrintOrder: number };

type SnomedItem = {
  hierarchy: string;
  isPreferredTerm: string;
  conceptState: string;
  conceptFsn: string;
  definitionStatus: string;
  conceptId: string;
  languageCode: string;
  typeId: string;
  term: string;
  caseSignificanceId: string;
  id: string;
  effectiveTime: string;
  activeStatus: number;
  moduleId: string;
};

export type {
  CategoryItem,
  CategoryTypeItem,
  DoctorDepartmentList,
  PrintGroupItem,
  ServiceTableItem,
  SnomedItem,
  SubCategoryItem,
  SubSubCategoryItem,
};
