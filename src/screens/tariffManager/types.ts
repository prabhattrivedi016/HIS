type RateListTableItem = {
  rateListId: number;
  rateListName: string;
  expiryDate: string;
  isActive: number;
};

type SelectItem = {
  label: string;
  value: number;
};

type PickMasterValue = {
  value: string;
  key: string;
};

type CategoryItem = {
  categoryId: number;
  categoryName: string;
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
};

type BedTypeItem = {
  serviceItemId: number;
  hospId: number;
  categoryId: number;
  subCategoryId: number;
  subSubCategoryId: number;
  name: string;
  code: string;
  reportTypeId: number;
  reportType: string;
  isSampleRequired: number;
  sampleTypeId: number;
  sampleTypeIdList: string;
  labMethodId: number;
  forGenderId: number;
  forGender: string;
  isOutSource: number;
  isPrintAlone: number;
  isDepartmentReceivingRequired: number;
  shortName: string;
  sampleVolume: string;
  investigationComment: string;
  tatInMin: number;
  isActive: number;
};

type searchTableItem = {
  TariffId: number;
  RateList: string;
  RatelistId: number;
  Category: string;
  SubCategory: string;
  SubSubCategory: string;
  ServiceItemId: number;
  ServiceItemName: string;
  BedType: string;
  BedTypeId: number;
  Alias: string;
  ServiceCode: string;
  EmergencyCharges: number;
  Rate: number;
  DoctorId: number;
  DoctorName: null;
  ValidityDays: number;
  IsRateEditable: "No" | "Yes" | number | boolean;
};

/*{
} */

type VisitTypeItem = {
  serviceItemId: number;
  hospId: number;
  categoryId: number;
  subCategoryId: number;
  subSubCategoryId: number;
  name: string;
  code: string;
  reportTypeId: number | null;
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
};

type DoctorListItem = {
  doctorId: number;
  title: string;
  name: string;
  dob: string;
  gender: string;
  completeName: string;
  contactNo: string;
  emailId: string;
  address: string;
  specializationId: number;
  specialization: string;
  userName: string;
  password: string;
  departmentId: number;
  department: string;
  profileSummery: string;
  registrationNo: string;
  isActive: number;
  userId: 3;
  hospId: number;
  createdBy: string;
  createdOn: string;
  ipAddress: string;
  branchId: string;
  canApproveLabReport: number;
  canApproveDischargeSummary: number;
  doctorPhotoFilePath: string;
  isDoctorUnit: number;
  roomNo: string;
};

export type {
  BedTypeItem,
  CategoryItem,
  DoctorListItem,
  PickMasterValue,
  RateListTableItem,
  searchTableItem,
  SelectItem,
  SubCategoryItem,
  SubSubCategoryItem,
  VisitTypeItem,
};
