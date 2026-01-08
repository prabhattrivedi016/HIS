type LabelValue = {
  label: string;
  value: string | number;
};

type LabelAction = {
  label: string;
  action: string;
};

type ColumnValue = string | number;

export type ListColumnItem = {
  label: string;
  keyFromApi: string;

  value: ColumnValue;

  isSortable?: boolean;
  isSearchable?: boolean;
  allowColumnFilter?: boolean;
  isMasked?: boolean;
};

interface BranchMasterGridItem {
  type: string;
  cardType: string;
  cardViewType: "grid" | "list";

  id: number;

  cardLeftTop: LabelValue[];
  cardRightTop: LabelAction[];

  cardAvatar?: string | null;

  cardId: LabelValue[];
  cardTitle: LabelValue[];
  cardFooter: LabelValue[];

  buttonSection: LabelAction[];
}

interface BranchMasterListItem {
  type: "branchMaster";
  cardType: "branchMasterList";
  cardViewType: "list";

  id: number;

  listLeftButton: LabelAction[];

  columns: ListColumnItem[];
}

type CountryItem = {
  countryId: number;
  countryName: string;
  currency: string;
  conversionFactor: number;
  isActive: number;
};

type StateItem = {
  countryId: number;
  stateId: number;
  stateName: string;
  isActive: number;
};

interface DistrictItem {
  countryId: number;
  stateId: number;
  districtId: number;
  districtName: string;
  isActive: number;
}

type CityItem = {
  countryId: number;
  stateId: number;
  districtId: number;
  cityId: number;
  cityName: string;
  pincode: string;
  isActive: number;
};

type InsuranceItem = {
  insuranceCompanyId: number;
  insuranceCompanyName: string;
};

type DefaultCorporate = {
  corporateId: number;
  corporateName: string;
  insuranceCompanyId: number;
  isActive: number;
};

type SelectItem = {
  value: number;
  label: string;
};

export type {
  BranchMasterGridItem,
  BranchMasterListItem,
  CityItem,
  ColumnValue,
  CountryItem,
  DefaultCorporate,
  DistrictItem,
  InsuranceItem,
  SelectItem,
  StateItem,
};
