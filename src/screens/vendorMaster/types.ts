type SelectItem = {
  value: number;
  label: string;
};

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

type DistrictItem = {
  countryId: number;
  stateId: number;
  districtId: number;
  districtName: string;
  isActive: number;
};

type CityItem = {
  countryId: number;
  stateId: number;
  districtId: number;
  cityId: number;
  cityName: string;
  isActive: number;
};

type VendorItem = {
  vendorId: number;
  typeId: number;
  type: string;
  vendorName: string;
  contactNo: string;
  email: string;
  dlno: string;
  gstinNo: string;
  address: string;
  fullAddress: string;
  countryId: number;
  stateId: number;
  districtId: number;
  cityId: number;
  pincode: string;
  mappingBranch: string;
  isActive: number;
  createdBy: string;
  createdOn: string;
  lastModifiedBy: string;
  lastModifiedOn: string;
};

type TypeItem = {
  value: string;
  key: string;
};

export interface VendorMasterPayload {
  vendorId: number;
  typeId: number;
  type: string;
  vendorName: string;
  contactNo: string;
  email: string;
  dlno: string;
  gstinNo: string;
  address: string;
  countryId: number;
  stateId: number;
  districtId: number;
  cityId: number;
  mappingBranch: string;
  isActive: number;
  pincode: number;
}

export type { CityItem, CountryItem, DistrictItem, SelectItem, StateItem, TypeItem, VendorItem };
