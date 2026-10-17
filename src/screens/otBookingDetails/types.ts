type OtBookingDetailsItem = {
  OTBookingId: number;
  OTBookingNo: string;
  PatientId: number;
  VisitId: number;
  UHID: string;
  PatientName: string;
  Age: string;
  ContactNumber: string;
  Gender: string;
  IPDNo: string;
  OTTypeId: number;
  OTType: string;
  OTId: number;
  OTBookingDate: string;
  OTBookingFromTime: string;
  OTBookingToTime: string;
  SurgeonIdList: string;
  SurgeonNameList: string;
  AssistantSurgeonId1: number | null;
  AssistantSurgeon1Name: string | null;
  AssistantSurgeonId2: number | null;
  AssistantSurgeon2Name: string | null;
  AnesthetistId: number | null;
  AnesthetistName: string | null;
  AssistantAnesthetistId: number | null;
  AssistantAnesthetistName: string | null;
  Anesthesia: string | null;
  ScrubNurseUserId: number | null;
  ScrubNurseUserName: string | null;
  CirculatingNurseUserId: number | null;
  CirculatingNurseUserName: string | null;
  OTTechnicianUserId: number | null;
  OTTechnicianUserName: string | null;
  ATTechnicianUserId: number | null;
  ATTechnicianUserName: string | null;
  PerfusionistUserId: number | null;
  PerfusionistUserName: string | null;
  IsBloodRequired: number;
  NumberOfBloodUnits: number;
  IsVentilatorRequired: number;
  IsICURequired: number;
  IsUnderPackage: number;
  BloodGroupId: number;
  IsInfectiousCase: number;
  InfectiousCaseRemarks: string;
  DiagnosisSNOMEDCode: string;
  DiagnosisName: string;
  IsEquipmentRequest: number;
  EquipmentServiceItemIdList: string | null;
  IsCancel: number;
  CancelReason: string | null;
  CancelBy: string | null;
  CancelOn: string | null;
  Status: string;
  StatusId: number;
  IsConfirm: number;
  IsReschedule: number;
  CreatedBy: string;
  CreatedOn: string;
  LastModifiedBy: string | null;
  LastModifiedOn: string | null;
};

type OtBookingDetailsGridCard = {
  type: string;
  cardType: string;
  cardViewType: string;
  id: number;
  cardLeftTop: { label: string; value: string | number | null }[];
  cardRightTop: { label: string; action: string }[];
  cardAvatar: string | null;
  cardId: { label: string; value: string | number | null }[];
  cardTitle: { label: string; value: string | number | null }[];
  cardFooter: { label: string; value: string | number | null }[];
  buttonSection: { label: string; action: string }[];
};

type OtBookingDetailsListCard = {
  type: string;
  cardType: string;
  cardViewType: string;
  id: number;
  listLeftButton: { label: string; action: string }[];
  columns: {
    label: string;
    keyFromApi: string;
    value: string | number | null;
    isSortable?: boolean;
    isSearchable?: boolean;
    allowColumnFilter?: boolean;
    isMasked?: boolean;
  }[];
};

type BookingItemDetails = {
  Id: number;
  ServiceItemName: string;
  ServiceItemId: number;
  OTBookingFromTime: string;
  OTBookingToTime: string;
  IsMainSurgery: number;
};

export type {
  BookingItemDetails,
  OtBookingDetailsGridCard,
  OtBookingDetailsItem,
  OtBookingDetailsListCard,
};
