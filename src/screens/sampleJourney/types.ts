import { LucideIcon } from "lucide-react";

type SampleJourneyItem = {
  InvestigationId: number;
  PatientId: number;
  InvestigationName: string;
  LabNo: number;
  BarCode: string;
  UHID: string;
  PatientName: string;
  Age: string;
  Gender: string;
  isUrgent: number;
  SampleType: string | null;
  TargetTATInMin?: number | string;
  ActualTATInMin?: number | string;
  RegistrationOn: string;
  RegistrationBy: string;
  isSampleRejected: number;
  SampleRejectedOn: string | null;
  SampleRejectedBy: string | null;
  SampleRejectionReason: string | null;
  IsSampleCollected: number;
  SampleCollectedOn: string | null;
  SampleCollectedBy: string | null;
  IsSampleReceivedByDepartment: number;
  SampleReceivedByDepartmentOn: string | null;
  SampleReceivedBy: string | null;
  IsSampleSegregated: number;
  SampleSegregationOn: string | null;
  SampleSegregatedBy: string | null;
  IsResultDone: number;
  ResultDoneOn: string | null;
  ResultDoneBy: string | null;
  IsReportApproved: number;
  ReportApprovedOn: string | null;
  ReportApprovedBy: string | null;
  ReportApporvedByDoctor: string | null;
  IsDispatched: number;
  DispatchedOn: string | null;
  DispatchedBy: string | null;
  isReportPrinted: number;
  ReportPrintedOn: string | null;
  ReportPrintedBy: string | null;
};

type SampleJourneyStep = {
  IsSampleCollectionRequired?: boolean | number;
  IsSampleRequired?: boolean | number;
  IsSampleDepartmentReceivingRequired?: boolean | number;
  IsDepartmentReceivingRequired?: boolean | number;
  IsSampleSegregationRequired?: boolean | number;
  [key: string]: any;
};

type StepItem = {
  id: number;
  title: string;
  icon: LucideIcon;
  date: string;
  by: string;
  isDone: boolean;
  isVisible: boolean;
  isNext: boolean;
  isRejected?: boolean;
  [key: string]: any;
};
export type { SampleJourneyItem, SampleJourneyStep, StepItem };
