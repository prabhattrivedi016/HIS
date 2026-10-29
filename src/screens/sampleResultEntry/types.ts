type PatientDetailsInvestigationItem = {
  DoctorName: string;
  DoctorDepartment: string;
  SampleType: string;
  TargetTATInMin: number;
  ActualTATInMin: number;
  IPDNo: string;
  AdmissionDate: string;
  AdmissionTime: string;
  BedNo: string;
  SampleSegregationOn: string;
  SampleSegregatedBy: string;
  DispatchedOn: string;
  DispatchedBy: string;
  ReportPrintedOn: string;
  ReportPrintedBy: string;
  isReportPrinted: number;
  IsAbnormalResult: number;
  MachineName: string;
  Connection: string;
  QcStatus: string;
  LastSync: string;
  UHID: string;
  VisitNo: string;
  LabNo: number;
  PatientName: string;
  CurrentAge: string;
  ContactNumber: string;

  Gender: string;
  LabNo1: number;
  BarCode: string;
  Name: string;
  BillDate: string;
  BillingBy: string;
  SampleCollectedOn: string;
  SampleCollectedBy: string;
  SampleReceivedByDepartmentOn: string;
  SampleReceivedBy: string;
  SampleCollectionRejectedOn: string;
  SampleCollectionRejectedBy: string;
  SampleCollectionRejectionReason: string;
  ResultDoneOn: string;
  ResultDoneBy: string;
  ApprovedDate: string;
  ReportApprovedBy: string;
  PatientInvestigationId: number;
  InvestigationId: number;
  ReportTypeId: number;
  IsSampleSegregated: number;
  IsSampleRequired: number;
  IsSampleSegregationRequired: number;
  IsDepartmentReceivingRequired: number;
  IsSampleCollected: number;
  IsSampleReceivedByDepartment: number;
  IsResultDone: number;
  IsReportApproved: number;
  IsDispatched: number;
  isUrgent: number;
  IsReportHold: number;
  NotificationRemark: string;
};

type SubInvetigationItem = {
  UHID: string;
  PatientName: string;
  CurrentAge: string;
  Gender: string;
  LabNo: number;
  BarCode: string;
  BillDate: string;
  referDoctorName: string;
  InvestigationName: string;
  ObservationName: string;
  ObservationId: number;
  Prefix: string;
  Suffix: string;
  ResultValue: string;
  MinValue: string;
  MaxValue: string;
  DisplayRange: string;
  Unit: string;
  MachineResult: string;
  MachineUnit: string;
  SampleRemark: string;
  MachineDisplayRange: string;
  MethodName: string;
  Formula: string;
  FormulaRight: string;
  ObservationLOVs: string;
  IsHeader: boolean;
  InvestigationComment: string;
  IsAbnormalResult: number;
  InvestigationId: number;
  IsResultDone: number;
  IsReportApproved: number;
  FieldTypeId: number;
  PatientId: number;
  isUrgent: number;
  RoundUp: string;
  IsBold: boolean;
  IsUnderLine: boolean;
  IsMandatory: number;
  IsResultBold: boolean;
  PatientInvestigationId?: number;
  prev?: string;
};

type PatientGeneralInfo = {
  uhid: string;
  patientName: string;
  age: string;
  gender: string;
  mobileNo: string;
  visitNo: string;
  department: string;
  doctor: string;
  ward: string;
  bed: string;
  admittedOn: string;
  admissionTime: string;
};

type InvestigationGeneralInfo = {
  sampleNo: string;
  barcode: string;
  sampleType: string;
  priority: string;
  collectionDate: string;
  receivedDate: string;
  ReportedDate: string;
  tat: string;
  clinicalNotes: string;
  machineName: string;
  connection: string;
  qcStatus: string;
  lastSync: string;
};

type FreetextInvestigationValue = {
  UHID: string;
  PatientName: string;
  CurrentAge: string;
  Gender: string;
  LabNo: number;
  BarCode: string;
  BillDate: string;
  referDoctorName: string;
  InvestigationName: string;
  InvestigationComment: string;
  IsAbnormalResult: number;
  ResultValue: string;
  InvestigationId: number;
  TemplateId: number;
  IsResultDone: number;
  IsReportApproved: number;
  PatientId: number;
  isUrgent: number;
};

export type {
  FreetextInvestigationValue,
  InvestigationGeneralInfo,
  PatientDetailsInvestigationItem,
  PatientGeneralInfo,
  SubInvetigationItem,
};
