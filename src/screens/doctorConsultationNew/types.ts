type PatientItem = {
  AppointmentNo: number;
  AppDateTime: string;
  UHID: string;
  PatientName: string;
  ContactNumber: string;
  Age: string;
  Gender: string;
  DoctorName: string;
  ValidUpToDate: string;
  IsExpired: number;
  IsDischarged: number;
  VisitId: number;
  Id: number;
  IsConsultationDone: number;
  IsOut: number;
  DoctorId: number;
  PatientId: number;
  IsEMRRequest: number;
  IsEMRRequestPending: number;
  TypeId: number;
  TypeName: string;
  BedNo: string;
  Address: string;
  CorporateName: string;
  isInvestigation: number;
  isInvestigationApproved: number;
  isStoreBill: number;
  isOPDBill: number;
  isIPDBill: number;
  dsId: number;
  OPDConsultationType: string;
  OPDConsultationTypeId: number;
};

type VitalEntry = {
  vitalId: number;
  vitalName: string;
  value: string;
  unitName?: string;
};

type AllergyRecordEntry = {
  id: number;
  allergyId: number;
  allergyName: string;
  allergyTypeId: number;
  allergyType: string;
  reaction: string;
  remarks: string;
  interactionSeverity: string;
  clinicalStatus: string;
  verificationStatus: string;
  snomedCode: string;
  notKnownAllergy: number;
};

type AllergySection = {
  summary: string | null;
  notKnownAllergy: boolean;
  records: AllergyRecordEntry[];
};

type EmrSectionAnswerEntry = {
  sectionId: number;
  sectionName: string;
  headerId: number;
  headerName: string;
  controlType: string;
  value: unknown;
};

type EmrAudit = {
  createdBy: number;
  createdByName: string;
  createdOn: string;
  lastUpdatedBy: number;
  lastUpdatedByName: string;
  lastUpdatedOn: string;
};

type EmrConsultationPayload = {
  id: string;
  version: string;

  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  typeId: number;
  typeName: string;
  visitId: number;
  uhid: string;
  appointmentNo: number;

  allergy?: AllergySection;
  vitals?: VitalEntry[];
  emrSections?: EmrSectionAnswerEntry[];

  chiefComplaints?: Record<string, unknown>;
  diagnosis?: Record<string, unknown>;
  procedure?: Record<string, unknown>;
  medications?: Record<string, unknown>;
  investigations?: Record<string, unknown>;
  followUp?: Record<string, unknown>;
  familyHistory?: Record<string, unknown>;

  audit: EmrAudit;
};

export type {
  AllergyRecordEntry,
  AllergySection,
  EmrAudit,
  EmrConsultationPayload,
  EmrSectionAnswerEntry,
  PatientItem,
  VitalEntry,
};
