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

/**
 * EMR consultation payload.
 * Root carries fixed identity/context fields (always present, flat).
 * Every clinical attribute (Allergy, Vitals, Diagnosis, Medications, ...)
 * is its own optional top-level key holding that attribute's own data —
 * add a new key here when a new section ships; nothing else changes.
 */
type VitalEntry = {
  vitalId: number;
  vitalName: string;
  value: string;
  unitName?: string;
};

/** mirrors the exact payload AllergyPanel already sends to CREATE_UPDATE_PATIENT_ALLERGY_DETAILS */
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

/** one answered control within an EMR Section built via the Section Builder (emrControls) */
type EmrSectionAnswerEntry = {
  sectionId: number;
  sectionName: string;
  headerId: number;
  headerName: string;
  controlType: string;
  value: unknown;
};

/** who created/last touched this payload, and when — populated from AuthContext at build time */
type EmrAudit = {
  createdBy: number;
  createdByName: string;
  createdOn: string;
  lastUpdatedBy: number;
  lastUpdatedByName: string;
  lastUpdatedOn: string;
};

type EmrConsultationPayload = {
  // ── document identity ──
  id: string; // stable per-consultation GUID, generated once per patient selection
  version: string;

  // ── root: basic identity, always present ──
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  typeId: number;
  typeName: string;
  visitId: number;
  uhid: string;
  appointmentNo: number;

  // ── sections: one optional key per EMR attribute ──
  allergy?: AllergySection;
  vitals?: VitalEntry[];
  emrSections?: EmrSectionAnswerEntry[];

  // future sections — give each a real type when it's actually built;
  // until then it can still be sent as a plain object
  chiefComplaints?: Record<string, unknown>;
  diagnosis?: Record<string, unknown>;
  procedure?: Record<string, unknown>;
  medications?: Record<string, unknown>;
  investigations?: Record<string, unknown>;
  followUp?: Record<string, unknown>;
  familyHistory?: Record<string, unknown>;

  // ── audit trail ──
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
