type FilterTypeItem = {
  branchId: number;
  typeId: number;
  uhid: string;
  ipdNo: string;
  labNo: string;
  fromDate: string;
  toDate: string;
  subCategoryId: number;
  subSubCategoryId: number;
  investigationId: number;
  patientName: string;
  roleId: number;
  corporateId: number;
  statusId: number;
  barCode: string;
  canSampleCollect: number;
};

type ResultEntryPathologyItem = {
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
  IsSampleSegregationRequired: string | number | null;
  IsDepartmentReceivingRequired: string | null;
  PatientInvestigationId: number;
  ReportTypeId: string | null;
  IsReportHold: number;
  CreatedOn: string;
  VIPPatient: number;
  IsSampleCollected: number;
  SampleCollectedOn: string;
  IsSampleSegregated: string | number | null;
  SampleSegregationOn: string;
  IsSampleReceivedByDepartment: number;
  SampleReceivedByDepartmentOn: string;
  IsResultDone: number;
  ResultDoneOn: string;
  IsReportApproved: number;
  ReportApprovedOn: string;
  IsDispatched: number;
  DispatchedOn: string;
  isSampleRejected: number;
  IsAbnormalResult: number;
  isReportPrinted: number;
  ReportPrintedOn: string;
  DefaultSampleTypeId: string | null;
  SampleTypeList: string;
  DeliveryDate: string;
  IsUnderPackage: number;
  Name: string;
  SampleTypeName?: string;
  isSampleSelected?: boolean;
  BedNo: string | null;
  TargetTATInMin: string;
  ActualTATInMin: string;
  timeLine?: string;
  timeLineColor?: string;
  tmeLineColor?: string;
  ExpectedTat?: string | number;
  ActualTat?: string | number;
  ExpectedTAT?: string | number;
  ActualTAT?: string | number;
  TargetTat?: string | number;
  TargetTAT?: string | number;
  ExpectedTATInMin?: string | number;
  actual_tat?: string | number;
  expected_tat?: string | number;
  actualTat?: string | number;
  expectedTat?: string | number;
  targetTat?: string | number;
  [key: string]: unknown;
};

type GroupedDataResultEntryPathology = {
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
  serumTypes?: string[];
  serumCount?: number;
  serviceNames?: string[];
  serviceCount?: number;
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

type ColumnItem = { isChecked: boolean; tableHeaderName: string; id: number };

type ViewMode = "patient" | "sample" | "test";

type StateValueProps = {
  all: number;
  collectionPending: number;
  sampleCollected: number;
  sampleRejected: number;
  departmentReceivingPending: number;
  departmentReceived: number;
  resultPending: number;
  reportApprovalPending: number;
  hold: number;
  approved: number;
  dispatched: number;
  printed: number;
  urgent: number;
  abnormal: number;
  pending?: number;
  collected?: number;
  received?: number;
  rejected?: number;
};

export type {
  ColumnItem,
  CorporateItem,
  DocumentNameItem,
  FilterTypeItem,
  GroupedDataResultEntryPathology,
  ResultEntryPathologyItem,
  SampleRemarksItem,
  SampleRemarkTableDataItem,
  SampleTypeItem,
  StateValueProps,
  SubSubCategoryItem,
  ViewMode,
};
