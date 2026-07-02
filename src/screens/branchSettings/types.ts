type BranchTableItem = {
  isGranted: number;
  BranchRightName: string;
  Description: string;
  BranchRightId: number;
};

type RateListItem = {
  rateListId: number;
  rateListName: string;
  applicableDate: string;
  expiryDate: string;
  isActive: number;
};

type BranchCorporateRateListMappingItem = {
  BranchId?: number;
  BranchName?: string;
  CorporateId?: number;
  CorporateName?: string;
  RateListIdOPD?: string;
  OPDRateList?: string;
  RateListIdIPD?: string;
  IPDRateList?: string;
  CreatedBy?: string;
  CreatedOn?: string;
  branchId?: number;
  branchName?: string;
  corporateId?: number;
  corporateName?: string;
  rateListIdOPD?: string;
  opdRateList?: string;
  rateListIdIPD?: string;
  ipdRateList?: string;
  createdBy?: string;
  createdOn?: string;
};

type BranchCorporateServiceExclusionItem = {
  BranchId?: number;
  BranchName?: string;
  CorporateId?: number;
  CorporateName?: string;
  ServiceItemId?: number;
  ServiceItemName?: string;
  CreatedBy?: string;
  CreatedOn?: string;
  branchId?: number;
  branchName?: string;
  corporateId?: number;
  corporateName?: string;
  serviceItemId?: number;
  serviceItemName?: string;
  createdBy?: string;
  createdOn?: string;
};

type SelectedExcludeServiceItem = {
  serviceItemId: number;
  name: string;
  code: string;
};

type CategoryOptionItem = {
  categoryId: number;
  categoryName: string;
};

type SubCategoryOptionItem = {
  subCategoryId: number;
  subCategoryName: string;
};

type SubSubCategoryOptionItem = {
  subSubCategoryId: number;
  subSubCategoryName: string;
};

type ServiceSearchItem = {
  serviceItemId: number;
  name: string;
  code: string;
  categoryId: number;
  subCategoryId: number;
  subSubCategoryId: number;
};
type BranchDefaultSettingItem = {
  branchId: number;
  branchName: string;
  branchCode: string;
  email: string;
  contactNo1: string;
  contactNo2: string;
  address: string;
  isActive: number;
  fyStartMonth: string;
  defaultCountryId: number;
  defaultStateId: number;
  defaultDistrictId: number;
  defaultCityId: number;
  defaultInsuranceCompanyId: number;
  defaultCorporateId: number;
  applyDiscountApproval: number;
  separateCollectionCounter: number;
};
export type {
  BranchCorporateRateListMappingItem,
  BranchCorporateServiceExclusionItem,
  BranchDefaultSettingItem,
  BranchTableItem,
  CategoryOptionItem,
  RateListItem,
  SelectedExcludeServiceItem,
  ServiceSearchItem,
  SubCategoryOptionItem,
  SubSubCategoryOptionItem,
};
