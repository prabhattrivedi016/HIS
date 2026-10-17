type FilterTypeItem = {
  barCode: string;
  patientName: string;
  uhid: string;
  sampleType: string;
  status: string;
  fromDate: string;
  toDate: string;
  priority: string;
  corporateId: string;
  roleId: number;
  branchId: number;
  typeId: number;
  subSubCategoryId: number;
  [key: string]: any;
};

type SampleManagementItem = {
  BillDate: string;
  Type: string;
  UHID: string;
  IPDNo: string;
  LabNo: number;
  WardName: string;
  PatientName: string;
  CurrentAge: string;
  CorporateName: string;
  Gender: string;
  TotalBalanceAmount: number;
  VisitId: number;
  isUrgent: number;
  Barcode: string;
  IsSampleRequired: string | null;
  IsDepartmentReceivingRequired: string | null;
  PatientInvestigationId: number;
  ReportTypeId: string | null;
  IsReportHold: number;
  CreatedOn: string;
  VIPPatient: number;
  IsSampleCollected: number;
  SampleCollectedOn: string;
  IsSampleReceivedByDepartment: number;
  SampleReceivedByDepartmentOn: string;
  IsResultDone: number;
  ResultDoneOn: string;
  IsReportApproved: number;
  ReportApprovedOn: string;
  IsDispatched: number;
  DispatchedOn: string;
  isSampleRejected: number;
  DefaultSampleTypeId: string | null;
  SampleTypeList: string;
  DeliveryDate: string;
  IsUnderPackage: number;
  Name: string;
  SampleTypeName?: string;
  isSampleSelected?: boolean;
};

type SampleTypeItem = {
  sampleTypeId: number;
  sampleType: string;
  containerColorId: number;
  colorName: string;
  colorCode: string;
  createdBy: string;
  createdOn: string;
  lastModifiedBy: string;
  lastModifiedOn: string;
  isActive: number;
};

type SubSubCategoryItem = {
  subCategoryId: number;
  subSubCategoryId: number;
  subSubCategoryName: string;
};

type CorporateItem = {
  corporateId: number;
  corporateName: string;
  insuranceCompanyName: string;
  insuranceCompanyId: number;
  corporateTypeId: number;
  paymentTypeId: number;
  corporateCode: string;
  corporateContact1: string;
  corporateContact2: string;
  corporateEmail: string;
  corporateAddress1: string;
  corporateAddress2: string;
  isActive: number;
  contractStartFrom: string;
  contractExpiresOn: string;
  copaymentPer: number;
  discountPerOut: number;
  discountPerIn: number;
  hikePerOut: number;
  hikePerIn: number;
  activePaymentModes: string;
  isRegistrationChargeApplicable: number;
  isCaseBillingApplicable: number;
};

type SampleRemarksItem = {
  sampleRemarksID: number;
  sampleRemarks: string;
  isActive: number;
};

type SampleRemarkTableDataItem = {
  Id: number;
  PatientInvestigationId: number;
  testRemark: string;
  testComment: string;
  testCommentId: number;
  isInternal: number;
  CreatedOn: string;
  CreatedBy: string;
};

type DocumentNameItem = {
  documentId: number;
  name: string;
  isActive: number;
  createdBy: number;
};

export type {
  CorporateItem,
  DocumentNameItem,
  FilterTypeItem,
  SampleManagementItem,
  SampleRemarksItem,
  SampleRemarkTableDataItem,
  SampleTypeItem,
  SubSubCategoryItem,
};
