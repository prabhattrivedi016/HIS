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

export type { BranchCorporateRateListMappingItem, BranchTableItem, RateListItem };
