type VisitListItem = {
  serviceItemId: number;
  hospId: number;
  categoryTypeId: number;
  categoryId: number;
  categoryName: string;
  subCategoryId: number;
  subCategoryName: string;
  subSubCategoryId: number;
  subSubCategoryName: string;
  name: string;
  code: string;
  reportTypeId: number | null;
  labTypeId: number;
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
  gstPer: number;
  roomTypeId: number;
  roomType: string;
  isICU: number;
  snomedCode: string;
  doctorDepartmentIds: string;
  isRequiredSeparatePerformingDoctor: number;
  opdConsultationTypeId: number;
  opdConsultationType: string;
  isOnlineConsultationAllow: number;
  isTeleConsultationService: number;
  isRegistrationCharge: number;
  registrationChargeValidityDays: number;
  isPackageExpired: number;
};

type InsuranceListItem = {
  insuranceCompanyId: number;
  insuranceCompanyName: string;
};

type PatientListItem = {
  BranchId: number;
  PatientId: number;
  UHID: string;
  Title: string;
  FirstName: string;
  MiddleName: string | null;
  LastName: string | null;
  PatientName: string;
  AgeYears: number;
  AgeMonths: number;
  AgeDays: number;
  Age: string;
  DOB: string;
  Gender: string;
  Relation: string | null;
  RelativeName: string | null;
  ContactNumber: string;
  EmergencyContactNumber: string | null;
  Email: string | null;
  FullAddress: string;
  RegistrationDate: string;
  IPDNo: string;
};

type BranchDetailsItem = {
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

export type {
  BranchDetailsItem,
  CityItem,
  CountryItem,
  DefaultCorporate,
  DistrictItem,
  InsuranceListItem,
  PatientListItem,
  StateItem,
  VisitListItem,
};
