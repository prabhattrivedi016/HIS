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

export type { CityItem, CountryItem, DistrictItem, SelectItem, StateItem };
