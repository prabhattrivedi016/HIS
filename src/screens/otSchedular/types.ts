type OtMasterItem = {
  BranchName: string;
  BranchId: number;
  OTId: number;
  OTName: string;
  OTStartTime: string;
  OTEndTime: string;
  OTSlotMins: number;
  CreateBy: string;
  CreateOn: string;
  LastModifiedBy: string;
  LastModifiedOn: string;
  IsActive: number;
};

type resourceItem = {
  name: string;
  id: number;
};

type OtSchedularItem = {
  OTBookingId: number;
  OTBookingNo: string;
  PatientId: number;
  VisitId: number;
  UHID: string;
  PatientName: string;
  Age: "0Y 0M 15D";
  ContactNumber: string;
  Gender: string;
  IPDNo: string | null;
  OTTypeId: number;
  OTType: string;
  OTId: number;
  OTBookingDate: string;
  OTBookingFromTime: string;
  OTBookingToTime: string;
  SurgeonIdList: string;
  AssistantSurgeonId1: number | null;
  AssistantSurgeon1Name: string | null;
  AssistantSurgeonId2: number | null;
  AssistantSurgeon2Name: string | null;
  AnesthetistId: number | null;
  AnesthetistName: string | null;
  AssistantAnesthetistId: number | null;
  AssistantAnesthetistName: null;
  Anesthesia: string;
  ScrubNurseUserId: number;
  ScrubNurseUserName: string | null;
  CirculatingNurseUserId: number;
  CirculatingNurseUserName: string | null;
  OTTechnicianUserId: number;
  OTTechnicianUserName: string | null;
  ATTechnicianUserId: number;
  ATTechnicianUserName: string | null;
  PerfusionistUserId: number;
  PerfusionistUserName: string | null;
  IsBloodRequired: number;
  NumberOfBloodUnits: number;
  IsVentilatorRequired: number;
  IsICURequired: number;
  IsUnderPackage: number;
  BloodGroupId: number | null;
  IsInfectiousCase: number;
  InfectiousCaseRemarks: string | null;
  DiagnosisSNOMEDCode: string;
  DiagnosisName: string;
  IsEquipmentRequest: number;
  EquipmentServiceItemIdList: string | null;
  CreatedBy: string;
  CreatedOn: string;
  LastModifiedBy: string | null;
  LastModifiedOn: string | null;
};

type ViewMode = "day" | "week";

type SlotInterval = 30 | 60 | 90 | 120;

type SchedulerStatus = "scheduled" | "in-progress" | "completed";

type ResourceItem = {
  id: number;
  name: string;
};

type SchedulerEvent = {
  id: number;

  resourceId: number;

  bookingDate: string;

  bookingNo: string;

  patientName: string;

  visitId: number;

  uhid: string;

  ipdNo: string;

  otType: string;

  diagnosisName: string;

  startTime: string;

  endTime: string;
};

export type {
  OtMasterItem,
  OtSchedularItem,
  resourceItem,
  ResourceItem,
  SchedulerEvent,
  SchedulerStatus,
  SlotInterval,
  ViewMode,
};
