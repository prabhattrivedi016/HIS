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

type SelectItem = {
  value: number;
  label: string;
};

export type { CityItem, CountryItem, DistrictItem, SelectItem, StateItem };
