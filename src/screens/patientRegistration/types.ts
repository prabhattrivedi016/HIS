type BranchItem = {
  branchId: number;
  branchName: string;
  defaultCountryId?: number;
  defaultStateId?: number;
  defaultDistrictId?: number;
  defaultCityId?: number;
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
  branchId: number;
  corporateId: number;
  corporateName: string;
  insuranceCompanyId: number;
  paymentType: string;
  paymentTypeId: number;
  isActive?: number;
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
  AgeYears?: number;
  AgeMonths?: number;
  AgeDays?: number;
  age: string;
  ageYears?: number;
  ageMonths?: number;
  ageDays?: number;
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

type SearchedPatientItem = {
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
  relation: string;
  relativeName: string;
  contactNumber: string;
  emergencyContactNumber: string;
  email: string;
  fullAddress: string;
  registrationDate: string;
  ipdNo: number;
};

type PatientDataProps = {
  selectedPatientId?: number | null;
  showRegistrationButton?: boolean;
  onPayloadChange?: (payload: Record<string, unknown>) => void;
  onPatientLoaded?: (source: "uhid") => void;
};

type PatientDataHandle = {
  validateForm: () => Promise<boolean>;
  loadPatientById: (patientId: number) => Promise<void>;
};
type ButtonProps = {
  onButtonClick?: (name: string) => void;
  isEdit: boolean;
};

type DOcumentListItem = {
  documentId: number;
  documentName: string;
  documentCode: string;
  documentPath: string;
  isMandatory: number;
};

type PatientDataEditItem = {
  patientId: number;
  branchId: number;
  uhid: string;
  title: string;
  firstName: string;
  middleName: string | null;
  lastName: string | null;
  patientName: string;
  ageYears: number;
  ageMonths: number;
  ageDays: number;
  age: string;
  dob: string;
  gender: string;
  maritalStatus: string | null;
  relation: string | null;
  relativeName: string | null;
  idProofName: string | null;
  idProofNumber: string | null;
  contactNumber: string;
  emergencyContactNumber: string;
  email: string | null;
  privilegedCardNumber: string | null;
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
  cardNo: string | null;
  isVaccination: number;
  vipPatient: string | null;
  patientImagePath: string;
  policyNo: string | null;
  policyCardNo: string | null;
  expiryDate: string | null;
  cardHolder: string | null;
  referalNo: string | null;
  referalDate: string | null;
  landlineNo: string;
  birthPlace: string;
  religion: string | null;
  relationPhone: string | null;
  relationAge: string | null;
  relationGender: string | null;
  emG_FirstName: string | null;
  emG_LastName: string | null;
  emG_Relation: string | null;
  emG_MobileNo: string | null;
  emG_ResidentNo: string | null;
  emG_Address: string | null;
  isInternational: number;
  locality: string | null;
  passportNumber: string | null;
  internationalNo: string;
  membershipNo: string;
  patientType: string | null;
  identityMark: string | null;
  identityMark2: string | null;
  referenceType: string | null;
  remarks: string | null;
  doctorId: number;
  ipdNo: number;
  dayCareNo: number;
  dialysisNo: number;
  emergencyNo: number;
};

type PatientDocumentPayloadItem = {
  DocumentId: number;
  PatientId: number;
  DocumentFile?: File | null;
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

export type {
  BranchDetailsItem,
  BranchItem,
  ButtonProps,
  CityItem,
  CorporateItem,
  CountryItem,
  DistrictItem,
  DOcumentListItem,
  InsuranceItem,
  PatientDataEditItem,
  PatientDataHandle,
  PatientDataItem,
  PatientDataProps,
  PatientDocumentPayloadItem,
  SearchedPatientItem,
  StateItem,
};
