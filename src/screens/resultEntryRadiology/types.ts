type SubSubCategoryItem = {
  subCategoryId: number;
  subSubCategoryId: number;
  subSubCategoryName: string;
};

type RadiologyTableItem = {
  BillDate: string;
  Type: string;
  UHID: string;
  IPDNo: number;
  LabNo: number;
  WardName: string;
  PatientName: string;
  CurrentAge: string;
  Gender: string;
  Name: string;
  VisitId: number;
  TotalBalanceAmount: number;
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
};
type ButtonValue = { buttonName: string; level: string; color: string };

export type { ButtonValue, RadiologyTableItem, SubSubCategoryItem };
