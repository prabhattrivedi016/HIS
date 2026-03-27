type BranchItem = {
  branchId: number;
  branchName: string;
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

type InsuranceItem = {
  insuranceCompanyId: number;
  insuranceCompanyName: string;
};

type CorporateItem = {
  corporateId: number;
  corporateName: string;
  insuranceCompanyId: number;
  isActive: number;
};

type PatientDataItem = {
  patientId: number;
  branchId: number;
  uhid: string;
  title: string;
  firstName: string;
  middleName: string;
  lastName: string;
  patientName: string;
  ageYears: number;
  ageMonths: number;
  ageDays: number;
  age: string;
  dob: string;
  gender: string;
  maritalStatus: string;
  relation: string;
  relativeName: string;
  idProofName: string;
  idProofNumber: string;
  contactNumber: string;
  emergencyContactNumber: string;
  email: string;
  privilegedCardNumber: string;
  address: string;
  countryId: number;
  country: string;
  stateId: number;
  state: string;
  districtId: number;
  district: string;
  cityId: number;
  city: string;
  insuranceCompanyId: number;
  corporateId: number;
  cardNo: string;
  isVaccination: number;
  vipPatient: number;
  patientImagePath: string;
  policyNo: string;
  policyCardNo: string;
  expiryDate: string;
  cardHolder: string;
  referalNo: string;
  referalDate: string;
};
export type {
  BranchItem,
  CityItem,
  CorporateItem,
  CountryItem,
  DistrictItem,
  InsuranceItem,
  PatientDataItem,
  StateItem,
};
