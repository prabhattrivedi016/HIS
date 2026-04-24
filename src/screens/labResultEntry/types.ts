type LabResultEntryTableData = {
  BillDate: string;
  Type: string;
  UHID: string;
  IPDNo: number;
  LabNo: number;
  PatientName: string;
  CurrentAge: string;
  CorporateName: string;
  Gender: string;
  VisitId: number;
  isUrgent: number;
  Barcode: string;
  IsSampleRequired: number;
  IsDepartmentReceivingRequired: number;
  PatientInvestigationId: number;
  ReportTypeId: number;
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
  DefaultSampleTypeId: number;
  SampleTypeList: string;
  DeliveryDate: string;
  IsUnderPackage: number;
  Name: string;
  isReportPrinted?: number;
  isMachineResult?: number;
  xyz?: string;
  xv?: string;
  sv?: string;
  ts?: string;
};

type SubCategory = {
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
type InvestigationName = {
  serviceItemId: number;
  hospId: number;
  categoryId: number;
  subCategoryId: number;
  subSubCategoryId: number;
  name: string;
  code: string;
  reportTypeId: number;
  labTypeId: number;
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

type SelectItem = {
  label: string;
  value: number;
};
export type {
  InvestigationName,
  LabResultEntryTableData,
  SelectItem,
  SubCategory,
  SubSubCategoryItem,
};
