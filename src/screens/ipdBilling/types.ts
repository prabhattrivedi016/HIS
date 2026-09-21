import { SubSubCategoryItem } from "@/types";

type IpdPatientItem = {
  BranchId: number;
  PatientId: number;
  UHID: string;
  PatientName: string;
  Age: string;
  Gender: string;
  ContactNumber: string;
  VisitId: number;
  IPDNo: string;
  AdmissionDate: string;
  AdmissionTime: string;
  DischargeDate: string;
  DischargeTime: string;
  State: string;
  District: string;
  City: string;
  Address: string | null;
  FullAddress: string;
  BedNo: string;
  Corporate: string;
  PrimaryDoctor: string;
  PrimaryDoctorId: number;
  SecondaryDoctor: string | null;
  PrimaryDoctorDepartment: string;
  PrimaryDoctorDepartmentId: number;
  BillingTypeId: number;
  InsuranceCompanyId: number;
  CorporateId: number;
  BedId: number;
  ProName: string;
  IsDischarged: number;
  DischargeType: string | null;
  IsFileClosed: number;
  BillNo: string | null;
  StatusId: number;
  TotalBillAmount: number;
  TotalDiscountPerOnBill: number;
  TotalDiscountAmountOnBill: number;
  RoundOff: number;
  TotalPayableAmount: number;
  TotalBalanceAmount: number;
  TotalBalanceAmount1: number;
  DSId: string | null;
  PatientAdvanceAmt: number;
  Remarks: string | null;
  BillingType: string;
  DoctorNumber: string;
  UserNAme: string;
  IsCaseBillingApplicable: number;
  Relation: string | null;
  RelativeName: string | null;
  DischargedOn: string | null;
  IsBillGenerated: number;
  BillGeneratedBy: string | null;
  BillGeneratedOn: string | null;
  FileClosedBy: string | null;
  FileClosedOn: string | null;
  DischargedBy: null | string;
};

type TabNameItem = {
  GroupTypeId: number;
  GroupTypeName: string;
  TabId: number;
  TabName: string;
  TabViewURL: string;
  SequenceNo: number;
  TabTypeId: number;
  TabType: string;
  RoomTypeId: number;
  RoomType: string;
  FaIconId?: number | null;
  IconClass?: string | null;
  IsActive: number;
  CreatedBy: string;
  CreatedOn: string;
  LastModifiedBy: string;
  LastModifiedOn: string;
  IsFavorite?: number;
};

type DoctorItem = {
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
  doctorPhotoFilePath: string;
  isDoctorUnit: number;
  roomNo: string;
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

type ServiceItemList = {
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
  reportTypeId: number;
  labTypeId: number;
  isRegistrationCharge?: number;
};

type BillingTypeItem = {
  typeId: number;
  roomTypeName: string;
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
};

type RoomItem = {
  bedId: number;
  bedName: string;
  gender: string;
};

type PreviousBedListItem = {
  BedType: string;
  WardName: string;
  RoomName: string;
  BedNo: number;
  BedId: number;
  IsCurrent: number;
  AdmittedBy: string | null;
  AdmittedOn: string | null;
  TransferedBy: string | null;
  TransferedOn: string | null;
};

type PreviousDoctorListItem = {
  DoctorName: string;
  IsCurrent: number;
  AdmittedBy: string | null;
  AdmittedOn: string | null;
  TransferedBy: string | null;
  TransferedOn: string | null;
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

type ServiceItem = {
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

type ServiceTableItem = {
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
  doctorId: number;
  doctorName: string;
  performingDoctorId: number;
  performingDoctorName: string;
  qty: number;
  dis: number;
  netAmount: number;
  isUrgent: number;
  isUnderPackage: number;
  remarks: string;
  Billing: string;
  labTypeId?: number;
  tatTimeInMin?: number;
};

type ApprovalLists = {
  CorporateTransferId: number;
  TokenNo: string;
  IPDNo?: string | null;
  BranchId: number;
  PatientId: number;
  VisitId: number;
  TypeId: number;
  UHID: string;
  PatientName: string;
  Age: string;
  Gender: string;
  TypeId1: number;
  InsuranceCompanyId: number;
  InsuranceCompanyName: string;
  CorporateId: number;
  CorporateName: string;
  BillingTypeId: number;
  IsChangeTariff: number;
  ChangeFromDate: string | null;
  ChangeToDate: string | null;
  Relation: string;
  RelativeName: string;
  CardNo: string;
  TransferDate: string;
  AuthorizationNumber: string;
  ReasonForTransfer: string;
  Remarks: string;
  IsCorporateTransferCreated: number;
  IsCorporateTransferApproved: number;
  ApprovalRemarks: string;
  IsLevel1Approve: number;
  Level1ApproveId: number;
  Level1ApproveOn: string;
  IsLevel2Approve: number;
  Level2ApproveId: number;
  Level2ApproveOn: string;
  IsLevel3Approve: number | null;
  Level3ApproveId: number | null;
  Level3ApproveOn: string | null;
  IsLevel4Approve: number | null;
  Level4ApproveId: number | null;
  Level4ApproveOn: string | null;
  IsCancel: number;
  Status: string;
  StatusId: number;
  CancelBy: string | null;
  CancelOn: string | null;
  CancelReason: string | null;
  CreatedBy: string;
  CreatedOn: string;
  LastModifiedBy: string;
  LastModifiedOn: string;
};

type ServiceObservationMappingItem = {
  InvestigationName: string;
  ObservationName: string;
  ObservationId: 1;
  Prefix: string;
  Suffix: string;
  MinValue: string;
  MaxValue: string;
  DisplayRange: string;
  Unit: string;
  MethodName: string;
  FieldTypeId: number;
  tatTimeInMin?: string;
  Tat?: string;
};

type IpdSummaryBillingTableList = {
  CategoryTypeId?: number;
  CategoryId: number;
  CategoryName: string;
  SubCategoryName: string;
  SubCategoryId: number;
  SubSubCategoryName: string;
  PrintGroupName: string;
  SubSubCategoryId: number;
  ServiceItemId: number;
  ServiceCode: string;
  ServiceName: string;
  DoctorId: number;
  Rate: number;
  Qty: number;
  GrossAmt: number;
  DiscPer: number;
  DiscAmt: number;
  NetAmt: number;
  BillingDate: string;
  BillNo: null;
  BillId: 55;
  CreatedOnWithTime: string;
  DoctorName: string;
  UserId: number;
  UserName: string;
  FTID: number;
  FTDId: number;
  VisitId: number;
  IsCorporateNonPayable: number;
  IsUnderPackage: number;
  Package: string;
  IsSampleCollected: number;
  IsSupplementaryBill: 0;
};

type BillFilterItem = {
  BillId: number;
  BillNo: string;
};

type PaymentListItem = {
  PaymentModeName: string;
  Amount: number;
  UserName: string;
  ReceiptNo: string;
  BillDate: string;
};

type PackageItemList = {
  categoryTypeId: number;
  categoryTypeName: string;
};

type BillSettlementItem = {
  TotalBillAmount: number;
  TotalDiscountPerOnBill: number;
  TotalDiscountAmountOnBill: number;
  DiscountReason: string;
  DiscountApprovedBy: number;
  RoundOff: number;
  TotalPayableAmount: number;
  TotalBalanceAmount: number;
  PatientAdvanceAmt: number;
  GSTAmt: number;
  BillNo: string;
  BillDate: string;
};

type DischargeProcessStepItem = {
  PatientVisitDischargeProcessId: number;
  VisitId: number;
  DischargeProcessId: number;
  ProcessKey: string;
  ProcessName: string;
  SequenceNo: number;
  IsMandatory: boolean;
  Status: number;
  IconName: string;
  IconClass: string;
  StartedOn: string | null;
  CompletedOn: string | null;
  StartedBy: string | null;
  CompletedBy: string | null;
  Remarks: string | null;
  IsCompleted: number;
  IsPending: number;
  IsCurrentProcess: number;
  CanExecute: number;
  IsFuture: number;
  IsUserAuthorized: number;
  DischargeProcessStep: number;
};

/*
{
    "PatientVisitDischargeProcessId": 64,
    "VisitId": 15,
    "DischargeProcessId": 1,
    "ProcessKey": "DISCHARGE_NOTICE",
    "ProcessName": "Discharge Notice",
    "SequenceNo": 1,
    "DischargeProcessStep": 1,
    "IsMandatory": true,
    "Status": 2,
    "IconName": "notes-medical",
    "IconClass": "fa-solid fa-notes-medical",
    "StartedBy": "Prabhat  Trivedi (Prabhat)",
    "StartedOn": "16-09-2026 03:17 PM",
    "CompletedBy": "Prabhat  Trivedi (Prabhat)",
    "CompletedOn": "16-09-2026 03:17 PM",
    "Remarks": "",
    "IsCompleted": 1,
    "IsPending": 0,
    "IsCurrentProcess": 0,
    "CanExecute": 0,
    "IsFuture": 0,
    "IsUserAuthorized": 1
} */
type CurrentProcessItem = {
  VisitId: number;
  PatientVisitDischargeProcessId?: number;
  DischargeProcessId?: number;
  ProcessKey?: string;
  ProcessName?: string;
  SequenceNo?: number;
  IsMandatory?: boolean;
  Status?: number;
  WorkflowInitialized: boolean;
  AllProcessesCompleted: boolean;
};

type PatientDetailsMainBillItem = {
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
  GSTPer: number;
  GSTAmt: number;
  GrossAmount: number;
  DiscountAmount: number;
  NetAmount: number;
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
  VisitNo: string;
  TypeId: number;
  CurrentBedNo: string;
};

type IpdPatientAdvanceItem = {
  PatientId: number;
  UHID: string;
  PatientName: string;
  Age: string;
  Gender: string;
  Address: string;
  ContactNumber: string;
  Corporat: string;
  CreatedOn: string;
  Amount: number;
  isCorporateReceipt: number;
  VisitNo: string;
  BedNo: string;
  ReceiptHeader: string;
  ReceiptNo: string;
  CreatedBy: string;
  DoctorNumber: string;
  AmtinWords: string;
  RelativeName: string;
  Remarks: string;
  GuardianName: string;
};

type IpdPatientAdvancePaymentModeItem = {
  TotalReceiptAmount: number;
  ReceiptNo: string;
  PaymentModeName: string;
  Amount: number;
  CreatedOn: string;
  UserName: string;
  BankName: string;
  ReferenceNo: string;
};

type MainBillWithPatientAdvanceItem = {
  PatientId: number;
  UHID: string;
  PatientName: string;
  Age: string;
  Gender: string;
  Address: string;
  ContactNumber: string;
  RelativeName: string | null;
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
  GSTPer: number;
  GSTAmt: number;
  GrossAmount: number;
  DiscountAmount: number;
  NetAmount: number;
  CompleteName: string;
  Department: string;
  Corporat: string;
  BillNo: string | null;
  BillDate: string;
  SubSubCategoryName: string;
  ReceiptHeader: string;
  TnxType: string;
  CreatedBy: string;
  PrintBy: string;
  VisitNo: string;
  TypeId: number;
  CurrentBedNo: string;
};

type DepartmentItem = {
  departmentId: number;
  department: string;
  departmentTypeId: number;
  departmentType: string;
  isActive: number;
};

type userMasterItem = {
  id: number;
  firstName: string;
  midelName: string;
  lastName: string;
  dob: string;
  gender: string;
  userName: string;
  password: string;
  address: string;
  contact: string;
  email: string;
  isActive: number;
  employeeID: string;
  createdBy: string;
  createdOn: string;
  lastModifiedBy: string;
  lastModifiedOn: string;
  reportToUserId: number;
  userDepartmentId: number;
};

export type {
  ApprovalLists,
  BillFilterItem,
  BillingTypeItem,
  BillSettlementItem,
  CategoryItem,
  CorporateItem,
  CurrentProcessItem,
  DepartmentItem,
  DischargeProcessStepItem,
  DoctorItem,
  InsuranceItem,
  IpdPatientAdvanceItem,
  IpdPatientAdvancePaymentModeItem,
  IpdPatientItem,
  IpdSummaryBillingTableList,
  MainBillWithPatientAdvanceItem,
  PackageItemList,
  PatientDetailsMainBillItem,
  PaymentListItem,
  PreviousBedListItem,
  PreviousDoctorListItem,
  RoomItem,
  ServiceItem,
  ServiceItemList,
  ServiceObservationMappingItem,
  ServiceTableItem,
  SubCategoryItem,
  SubSubCategoryItem,
  TabNameItem,
  userMasterItem,
};
