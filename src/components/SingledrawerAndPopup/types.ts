type PatientInfo = {
  UHID: string;
  VisitNo: number;
  LabNo: number;
  PatientName: string;
  CurrentAge: string;
  Gender: string;
  LabNo1: number;
  BarCode: string;
  LabTypeId: number;
  LabType: string;
  SubCategoryName: string;
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
  NotificationRemark: string;
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

type SampleManagementDocumentTableItem = {
  InvestigationDocumentId: number;
  PatientInvestigationId: number;
  InvestigationDocumentName: string;
  UploadFileLocation: string;
  UploadOn: string;
  UploadedBy: string;
};

type UhidGlobalSearchProps = {
  onPatientSelect?: (patientId: number) => Promise<boolean> | boolean;
  minSearchLength?: number;
  placeholder?: string;
  className?: string;
  resetKey?: number | string;
};

type DocumentItem = {
  DocumentId: number;
  DocumentName: string;
  DocumentCode: string;
  DocumentPath: string;
  IsMandatory: number;
  DocumentCategory: string;
  DocumentCategoryId: number;
};

type VisitWiseDocumentPayloadItem = {
  DocumentId: number;
  PatientId: number;
  VisitId: number;
  DocumentCategoryId: number;
  DocumentFile: File;
};

type IpdOpdDocumentHandle = {
  validateMandatoryDocuments: () => Promise<boolean>;
  uploadDocuments: (patientId: number, visitId: number) => Promise<boolean>;
  resetForm: () => void;
};

type IpdOpdDocumentProps = {
  type: string;
};

export type {
  DocumentItem,
  DocumentNameItem,
  IpdOpdDocumentHandle,
  IpdOpdDocumentProps,
  PatientInfo,
  SampleManagementDocumentTableItem,
  SampleRemarksItem,
  SampleRemarkTableDataItem,
  UhidGlobalSearchProps,
  VisitWiseDocumentPayloadItem,
};
