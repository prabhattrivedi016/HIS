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
  Address: string;
  FullAddress: string;
  BedNo: string;
  Corporate: string;
  PrimaryDoctor: string;
  PrimaryDoctorId: number;
  SecondaryDoctor: number | null;
  BillingTypeId: number;
  CorporateId: number;
  BedId: number;
  ProName: string;
  IsBillingClosed: number;
  IsDischarged: number;
  IsFileClosed: number;
  BillNo: number | null;
  StatusId: number;
  PiNumber: string;
  MLC: string;
  TotalBillAmount: number;
  TotalDiscountPerOnBill: number;
  TotalDiscountAmountOnBill: number;
  RoundOff: number;
  TotalPayableAmount: number;
  TotalBalanceAmount: number;
  TotalBalanceAmount1: number;
  DSId: number | null;
  PatientAdvanceAmt: number;
  Remarks: string | null;
  BillingType: string;
  DoctorNumber: string;
  UserNAme: string;
  Department?: string;
  Consultant?: string;
  Ward?: string;
  Room?: string;
  BedType?: string;
  TPA?: string;
  Status?: string;
  InsuranceCompanyId?: number;
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
};

type DoctorItem = {
  doctorId: number;
  name: string;
  specializationId: number;
  departmentId: number;
  canApproveLabReport: number;
  isDoctorUnit: number;
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

export type {
  ApprovalLists,
  BillingTypeItem,
  CategoryItem,
  CorporateItem,
  DoctorItem,
  InsuranceItem,
  IpdPatientItem,
  PreviousBedListItem,
  PreviousDoctorListItem,
  RoomItem,
  ServiceItem,
  ServiceItemList,
  SubCategoryItem,
  SubSubCategoryItem,
  TabNameItem,
};
