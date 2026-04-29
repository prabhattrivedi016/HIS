type CorporateList = {
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
  activeBranches: string;
  rateListIdOPD: string;
  rateListIdIPD: string;
};
type SampleManagementTableData = {
  BillDate: string;
  Type: string;
  UHID: string;
  IPDNo: number;
  LabNo: string;
  PatientName: string;
  CurrentAge: string;
  CorporateName: string;
  Gender: string;
  Name: string;
  VisitId: number;
  isUrgent: number;
  Barcode: string;
  IsSampleRequired: number;
  IsDepartmentReceivingRequired: number;
  PatientInvestigationId: number;
  ReportTypeId: number;
  IsReportHold: number;
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
  SampleTypeName: string;
  DeliveryDate: string;
  CreatedOn?: string;
  DefaultSampleTypeId?: number;
  SampleTypeList?: string;
  IsUnderPackage?: number;
  selectedSampleType?: string;
  sampleDateTime?: string;
};

type ButtonValue = { buttonName: string; level: string; color: string };

type SampleRejectionRemarkItem = {
  sampleRejectionRemarksID: number;
  sampleRejectionRemarks: string;
  isActive: number;
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
export type {
  ButtonValue,
  CorporateList,
  SampleManagementTableData,
  SampleRejectionRemarkItem,
  SampleTypeItem,
};
