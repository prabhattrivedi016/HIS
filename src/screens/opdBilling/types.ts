import { BillingDetailsHandle } from "@/components/BillingDetails";
import { BillingValuesItem, PaymentBillingSummary } from "@/components/BillingDetails/types";
import { ChangeEvent, Dispatch, KeyboardEvent, RefObject, SetStateAction } from "react";
import { SingleValue } from "react-select";
import { InsuranceItem } from "../branchMaster/types";

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
  categoryTypeId: number;
  categoryId: number;
  subCategoryId: number;
  subSubCategoryId: number;
  isCorporateDiscount: number;
  gstPer: number;
  sampleTypeId: number;
  reportTypeId: number;
  doctorDepartmentIds: string;
  isRequiredSeparatePerformingDoctor: number;
  doctorId?: number;
  doctorName?: string;
  qty?: number;
  dis?: number;
  netAmount?: number;
  isUrgent?: number;
  isUnderPackage?: number;
  remarks?: string;
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
  data: OptionItem | null;
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
  packageServiceSubCategoryId?: number;
  qty: number;
  packageServiceCategory: string;
  packageServiceSubSubCategoryId: number;
  packageServiceCode: string;
  packageServiceCategoryId: number;
};

type PackagePopupProps = {
  isOpen: boolean;
  onClose: () => void;
  packageId?: number;
  serviceId?: number;
  patientDetails?: Record<string, unknown> | null;
};

type PackagePayloadItem = {
  serviceItemId: number;
  serviceName: string;
  code: string;
  categoryId: number;
  subCategoryId: number;
  subSubCategoryId: number;
  corporateAlias: string;
  corporateCode: string;
  qty: number;
  rate: number;
  grossAmt: number;
  discPer: number;
  discAmt: number;
  discountReason: string;
  netAmt: number;
  doctorId: number | string;
  rateListId: number;
  validityDays: number;
  sampleTypeId: number;
  isNonPayable: number;
  isUnderPackage: number;
  packageId?: number;
  isUrgent: number;
  remarks?: string;
};

type OpdBillingItemPayload = {
  serviceItemId: number;
  subSubCategoryId: number;
  subCategoryId: number;
  categoryId: number;
  serviceName: string;
  code: string;
  corporateAlias: string;
  corporateCode: string;
  discountReason: string;
  isNonPayable: number;
  rateListId: number;
  validityDays: number;
  doctorId: number;
  performingDoctorId: number;
  qty: number;
  rate: number;
  discPer: number;
  discAmt: number;
  grossAmt: number;
  netAmt: number;
  isUnderPackage: number;
  packageId: number;
  isUrgent: number;
  sampleTypeId: number;
  remarks: string;
};

type OpdBookingItemPayload = {
  code: string;
  discAmt: number;
  discPer: number;
  doctorId: number;
  grossAmt: number;
  isUrgent: number;
  netAmt: number;
  qty: number;
  rate: number;
  rateListId: number;
  serviceItemId: number;
  serviceName: string;
  subSubCategoryId: number;
  remarks?: string;
  performingDoctorId?: number;
};

type OpdBillingVisitDetailsPayload = {
  patientId: number;
  uhid: string;
  branchId: number;
  currentAge: string;
  insuranceCompanyId: number;
  roleId: number;
  corporateId: number;
  referDoctorId: number;
  doctorId: number;
  grossBillAmount: number;
  totalDiscPerOnBill: number;
  totalDiscAmtOnBill: number;
  roundOff: number;
  netAmount: number;
  discApprovedById: number;
  discountReason: string;
  remarks: string;
  uniqueId: string;
  mlc: string;
  pi: string;
  remark: string;
  policyNo: string;
  policyCardNo: string;
  expiryDate: string;
  cardHolder: string;
  referalNo: string;
  referalDate: string;
  diagnosisId: number;
  proId: number;
  proName: string;
  isSendMRD: number;
};

type buildVisitDetailsPayloadForOpdBooking = {
  branchId: number;
  cardHolder: string;
  corporateId: number;
  discountApprovedID: number;
  discountApprovedName: string;
  discountReason: string;
  expiryDate: string;
  grossBillAmount: number;
  insuranceCompanyId: number;
  isDiscountApprovalRequired: number;
  netAmount: number;
  patientId: number;
  policyCardNo: string;
  policyNo: string;
  referalDate: string;
  referalNo: string;
  referDoctorId: number;
  remark: string;
  roleId: number;
  roundOff: number;
  totalDiscAmtOnBill: number;
  totalDiscPerOnBill: number;
};

type OpdBookingSavePayload = {
  visitDetails: buildVisitDetailsPayloadForOpdBooking;
  billingItems: OpdBookingItemPayload[];
};

type OpdBillingSavePayload = {
  visitDetails: OpdBillingVisitDetailsPayload;
  billingItems: OpdBillingItemPayload[];
};

type OpdBillingFormData = {
  patientId: number;
  uhid: string;
  branchId: number;
  currentAge: string;
  insuranceCompanyId: number;
  corporateId: number;
  referDoctorId: number;
  grossBillAmount: number;
  totalDiscPerOnBill: number;
  totalDiscAmtOnBill: number;
  roundOff: number;
  netAmount: number;
  discApprovedById: number;
  discountReason: string;
  remarks: string;
  uniqueId: string;
  mlc: string;
  pi: string;
  remark: string;
  policyNo: string;
  policyCardNo: string;
  expiryDate: string;
  cardHolder: string;
  referalNo: string;
  referalDate: string;
  diagnosisId: number;
  proId: number;
  proName: string;
  isSendMRD: number;
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
  InvestigationName: string;
  ObservationName: string;
  ObservationId: number;
  Prefix: string;
  Suffix: string;
  MinValue: string;
  MaxValue: string;
  DisplayRange: string;
  Unit: string;
  MethodName: string;
  FieldTypeId: number;
};
type OpdBillingSectionProps = {
  formResetKey: number;
  billingDetailsRef: RefObject<BillingDetailsHandle | null>;
  insuranceList: InsuranceItem[];
  hasSelectedService: boolean;
  insuranceSelectHandler: (e: ChangeEvent<HTMLSelectElement>) => void;
  selectedInsurance: number | null;
  selectedCorporate: OptionItem | null;
  corporateSelectOption: OptionItem[];
  corporateSelectHandler: (option: SingleValue<OptionItem>) => void;
  selectedCorporateError: string;
  doctorRef: RefObject<unknown>;
  selectedDoctor: OptionItem | null;
  doctorSelectOption: OptionItem[];
  doctorSelectHandler: (option: SingleValue<OptionItem>) => void;
  selectDoctorError: string;
  inputFieldHandler: (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => void;
  expiryDateChangeHandler: (value: string) => void;
  referralDateChangeHandler: (value: string) => void;
  selectedReferDoctor: OptionItem | null;
  referDoctorSelectOption: OptionItem[];
  referDoctorSelectHandler: (option: SingleValue<OptionItem>) => void;
  referDoctorPopUpHandler: () => void;
  categoryList: CategoryItem[];
  categorySelectHandler: (e: ChangeEvent<HTMLSelectElement>) => void;
  selectedSubCategory: OptionItem | null;
  subCategorySelectOption: OptionItem[];
  subCategorySelectHandler: (option: SingleValue<OptionItem>) => void;
  selectedSubSubCategory: OptionItem | null;
  subSubCategorySelectOption: OptionItem[];
  subSubCategorySelectHandler: (option: SingleValue<OptionItem>) => void;
  serviceInputRef: RefObject<HTMLInputElement | null>;
  searchTerm: string;
  serviceItemHandler: (e: ChangeEvent<HTMLInputElement>) => void;
  serviceInputKeyDownHandler: (e: KeyboardEvent<HTMLInputElement>) => void;
  showPopup: boolean;
  serviceNameList: ServiceItemList[];
  activeServiceIndex: number;
  setActiveServiceIndex: Dispatch<SetStateAction<number>>;
  selectedServiceHandler: (service: ServiceItemList) => void;
  serviceDataTableItem: ServiceBindingItem[];
  showDuplicateError: string;
  serviceValidationError: string;
  deleteHandler: (rowIndex: number) => void;
  rateChangeHandler: (e: ChangeEvent<HTMLInputElement>, idx: number) => void;
  discountPercentageChangeHandler: (e: ChangeEvent<HTMLInputElement>, idx: number) => void;
  discountChangeHandler: (e: ChangeEvent<HTMLInputElement>, idx: number) => void;
  remarksChangeHandler: (e: ChangeEvent<HTMLInputElement>, idx: number) => void;
  urgentChangeHandler: (e: ChangeEvent<HTMLInputElement>, idx: number) => void;
  isPackageService: (serviceName: unknown) => boolean;
  packagePopupHandler: (packageId: number) => void;
  servicePopupHandler: (service: ServiceBindingItem) => void;
  getPerformingDoctorOptions: (doctorDepartmentIds?: string) => OptionItem[];
  performingDoctorChangeHandler: (rowIndex: number, doctorId: number) => void | Promise<void>;
  setOpdBillingFormData: Dispatch<SetStateAction<OpdBillingFormData>>;
  setBillingValues: Dispatch<SetStateAction<BillingValuesItem>>;
  billingValues: BillingValuesItem;
  billingPaymentDetails: PaymentBillingSummary;
  maxDiscountPercentage: number | undefined;
  creditCopayment: boolean;
  isSeparateCollectionCounterEnabled: number;
};
export type {
  buildVisitDetailsPayloadForOpdBooking,
  CategoryItem,
  CollectOnDeviceProps,
  DoctorMasterItem,
  DuplicateServiceDataItem,
  OpdBillingFormData,
  OpdBillingItemPayload,
  OpdBillingSavePayload,
  OpdBillingSectionProps,
  OpdBillingVisitDetailsPayload,
  OpdBookingItemPayload,
  OpdBookingSavePayload,
  OpdCardDetailItem,
  OpdPatientDetails,
  OptionItem,
  PackageItems,
  PackageItemsValue,
  PackagePayloadItem,
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
