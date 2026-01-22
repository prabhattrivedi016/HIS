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

type PinCodeItem = {
  cityId: number;
  pincodeId: number;
  pincode: number;
  isActive: number;
};

type PopUpValueItem = {
  type: string;
  countryId: number | null;
  stateId: number | null;
  districtId: number | null;
  cityId: number | null;
  pincodeId: number | null;
  value: boolean;
};

interface StatePopUpItem {
  type: "STATE";
  countryId: number;
  stateId: number;
  districtId: number;
  cityId: number;
  pincodeId?: number | null;
  value: boolean;
}

interface DistrictPopUpItem {
  type: "DISTRICT";
  countryId: number;
  stateId: number;
  districtId: number;
  cityId: number;
  pincodeId?: number | null;
  value: boolean;
}

interface CityPopUpItem {
  type: "CITY";
  countryId: number;
  stateId: number;
  districtId: number;
  cityId: number;
  pincodeId?: number | null;
  value: boolean;
}

interface PinCodePopUpItem {
  type: "PINCODE";
  countryId: number;
  stateId: number;
  districtId: number;
  cityId: number;
  pincodeId?: number | null;
  value: boolean;
}

type LocationMasterDrawerProps = {
  isOpenTab: boolean;
  onCloseTab: () => void;
  data: StatePopUpItem | DistrictPopUpItem | CityPopUpItem | PinCodePopUpItem;
};

export type {
  CityItem,
  CityPopUpItem,
  CountryItem,
  DistrictItem,
  DistrictPopUpItem,
  LocationMasterDrawerProps,
  PinCodeItem,
  PinCodePopUpItem,
  PopUpValueItem,
  SelectItem,
  StateItem,
  StatePopUpItem,
};
