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
  /** numeric control type id (0 for a card-group entry, which represents a whole section/group
   * rather than one real header) */
  controlTypeId: number;
  value: unknown;
};

/** one entry in the save payload's dynamic attribute list — every attribute the consultation
 * captures (vital, allergy, an EMR section header, or anything added later) is normalized to
 * this same shape, so the payload never needs a new named field when a new attribute is added */
type ConsultationAttributeEntry = {
  /** groups entries by kind, e.g. "vital" | "allergy" | "emrSection" */
  attributeType: string;
  /** stable unique key within attributeType, e.g. `vital_12`, `emrSection_3_45` */
  attributeCode: string;
  label: string;
  value: unknown;
  /** "emrSection" entries only — the EMR section this attribute's headers belong to */
  sectionId?: number;
};

/** produces the ConsultationAttributeEntry[] for one attribute kind — add a new function of
 * this shape and register it in DoctorConsultationNew's attributeBuilders list to add a new
 * attribute to the save payload without touching the payload shape itself */
type AttributeBuilder = () => ConsultationAttributeEntry[];

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

  attributes: ConsultationAttributeEntry[];

  audit: EmrAudit;
};

export type {
  AllergyRecordEntry,
  AllergySection,
  AttributeBuilder,
  ConsultationAttributeEntry,
  EmrAudit,
  EmrConsultationPayload,
  EmrSectionAnswerEntry,
  PatientItem,
  VitalEntry,
};
