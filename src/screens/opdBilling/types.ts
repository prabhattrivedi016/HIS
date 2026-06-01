type OpdPatientDetails = {
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
  landlineNo: string | null;
  birthPlace: string | null;
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
  isInternational: string | null;
  locality: string | null;
  passportNumber: string | null;
  internationalNo: string | null;
  membershipNo: string | null;
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

interface OptionItem {
  label?: string;
  value?: string | number;
}

type ReferDoctorItem = {
  referDoctorId: number;
  title: string;
  name: string;
  doctorName: string;
  contactNo: string;
  clinicName: string;
  address: string;
  proId: number;
  proName: string;
  isActive: number;
  createdBy: string;
  createdOn: string;
  lastModifiedBy: string;
  lastModifiedOn: string;
};
type ServiceItemList = {
  serviceItemId: number;
  hospId: number;
  categoryId: number;
  subCategoryId: number;
  subSubCategoryId: number;
  name: string;
  code: string;
  reportTypeId: number;
  reportType: string;
  isSampleRequired: number;
  sampleTypeId: number;
  sampleTypeIdList: string;
  labMethodId: number;
  forGenderId: number;
  forGender: string;
  isOutSource: number;
  isPrintAlone: number;
  isDepartmentReceivingRequired: number;
  shortName: string;
  sampleVolume: string;
  investigationComment: string;
  tatInMin: number;
  isActive: number;
};

interface DoctorMasterItem {
  doctorId: number;
  title: string;
  name: string;
  dob: string;
  gender: string;
  completeName: string;
  contactNo: string;
  emailId: string;
  address: string;
  specializationId: number;
  specialization: string;
  userName: string;
  password: string;
  departmentId: number;
  department: string;
  profileSummery: string;
  registrationNo: string;
  isActive: number;
  userId: number;
  hospId: number;
  createdBy: string;
  createdOn: string;
  ipAddress: string;
  branchId: string;
  canApproveLabReport: number;
  canApproveDischargeSummary: number;
  doctorSignFilePath: string;
  isDoctorUnit: number;
  roomNo: string;
}

type ServiceBindingItem = {
  doctorId?: number;
  doctorName?: string;
  rate: number;
  rateListId: number;
  isRateEditable: number;
  serviceName: string;
  code: string;
  corporateAlias: string;
  corporateCode: string;
  validityDays: number;
  discountPer: number;
  discountReason: string;
  isNonPayable: number;
  serviceItemId: number;
  corporateId: number;
  categoryId: number;
  subCategoryId: number;
  subSubCategoryId: number;
  isCorporateDiscount: number;
  gstPer: number;
  sampleTypeId: number;
  isUrgent?: number;
  netAmount?: number;
  dis?: number;
  qty?: number;
};

type CategoryItem = {
  categoryId: number;
  categoryName: string;
  categoryTypeId: number;
  categoryTypeName: string;
  createdBy: string;
  createdOn: string;
  lastModifiedBy: string;
  lastModifiedOn: string;
};

type SubCategoryItem = {
  categoryId: number;
  subCategoryId: number;
  subCategoryName: string;
  labTypeId: number;
};

type SubSubCategoryItem = {
  subCategoryId: number;
  subSubCategoryId: number;
  subSubCategoryName: string;
};

type ReferDoctorPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  data: OptionItem;
  refreshDoctor: () => Promise<void>;
};

type PackageItems = {
  packageId: number;
  packageName: string;
  packageCode: string;
  isActive: number;
  subSubCategoryId: number;
  subCategoryId: number;
  categoryId: number;
  startsFrom: string;
  expiresOn: string;
  packageServiceNameCode: string;
  packageServiceName: string;
  packageServiceId: number;
  qty: number;
  packageServiceCategory: string;
  packageServiceSubSubCategoryId: number;
  packageServiceCode: string;
  packageServiceCategoryId: number;
};

type PackagePopupProps = {
  isOpen: boolean;
  onClose: () => void;
  packageId: number;
};

type CollectOnDeviceProps = {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
};

type PatientReceiptItem = {
  PatientId: number;
  UHID: string;
  PatientName: string;
  Age: string;
  Gender: string;
  Address: string;
  ContactNumber: string;
  RelativeName: string;
  ServiceName: string;
  CorporateAlias: string;
  CorporateCode: string;
  GrossAmt: number;
  NetAmt: number;
  Rate: number;
  Qty: number;
  DiscAmt: number;
  DiscPer: number;
  FTID: number;
  GrossAmount: number;
  DiscountAmount: number;
  NetAmount: number;
  ReceiptNo: string;
  CreatedOn: string;
  Amount: number;
  DisplayAmount: number;
  CompleteName: string;
  Department: string;
  Corporat: string;
  BillNo: string;
  BillDate: string;
  SubSubCategoryName: string;
  ReceiptHeader: string;
  TnxType: string;
  CreatedBy: string;
  PrintBy: string;
  DiagnosticNo: number;
  appointmentno: string;
  TotalBalanceAmount: number;
  TotalPaidAmount: number;
  ReferDoctorName: null;
  VisitId: number;
};

type PaymentModeItem = {
  PaymentModeName: string;
  Amount: number;
  UserName: string;
  ReceiptNo: string;
  BillDate: string;
};

type OpdCardDetailItem = {
  UHID: string;
  PatientName: string;
  Age: string;
  Gender: string;
  Relation: string;
  TotalPaidAmount: number;
  CreatedDate: string;
  CreatedTime: string;
  CorporateName: string;
  ContactNumber: string;
  CompleteName: string;
  ProfileSummery: string;
  Department: string;
  Address: string;
  AppointmentNo: number;
  BillNo: string;
};

type PackageItemsValue = {
  packageId: number;
  packageName: string;
  packageCode: string;
  isActive: number;
  subSubCategoryId: number;
  subCategoryId: number;
  categoryId: number;
  startsFrom: string;
  expiresOn: string;
  packageServiceNameCode: string;
  packageServiceName: string;
  packageServiceId: number;
  qty: number;
  packageServiceCategory: string;
  packageServiceSubSubCategoryId: number;
  packageServiceCode: string;
  packageServiceCategoryId: number;
};

type DuplicateServiceDataItem = {
  ServiceItemId: number;
  CreatedDate: string;
  UserName: string;
};

type ServiceBindingDataItem = {
  mappingId: number;
  invastigationId: number;
  observationId: number;
  observationName: string;
  method: string;
  methodId: number;
  isHeader: boolean;
  isBold: boolean;
  isUnderLine: boolean;
  isMandatory: number;
  roundUp: string;
  serviceName?: string;
  qty?: number;
};

export type {
  CategoryItem,
  CollectOnDeviceProps,
  DoctorMasterItem,
  DuplicateServiceDataItem,
  OpdCardDetailItem,
  OpdPatientDetails,
  OptionItem,
  PackageItems,
  PackageItemsValue,
  PackagePopupProps,
  PatientReceiptItem,
  PaymentModeItem,
  ReferDoctorItem,
  ReferDoctorPopupProps,
  ServiceBindingDataItem,
  ServiceBindingItem,
  ServiceItemList,
  SubCategoryItem,
  SubSubCategoryItem,
};
