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
  /** true when `id` is a real CREATE_UPDATE_PATIENT_ALLERGY_DETAILS row id (loaded from
   * GET_PATIENT_ALLERGY_DETAIL_LIST or already saved this session) — false when `id` is only a
   * local, client-generated key for a record added in this session but not yet persisted, in
   * which case the save payload must send id 0 so the backend inserts instead of updating an
   * unrelated row. */
  isPersisted: boolean;
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
  controlTypeId: number;
  value: unknown;
  /** this header's DataId from the last GET_DOCTOR_CONSULTATION_BY_VISIT_ID load, if it was ever
   * saved before — undefined for a header that's never been saved, in which case the next save
   * must send dataId 0 so the backend inserts a new row instead of updating someone else's */
  dataId?: number;
};

// matches the real backend contract for api/EMR/savePatientConsultation /
// api/EMR/getDoctorConsultationByVisitId (confirmed working — see backend-reference/DentalChart).

type ConsultationDetails = {
  doctorId: number;
  patientId: number;
  visitId: number;
  visitTypeId: number;
  /** 0 | 1 */
  isFileClosed: number;
};

type ConsultationHeaderDataEntry = {
  /** 0 for a new row — the backend assigns a real id, returned by getDoctorConsultationByVisitId
   * for a proper upsert on the next save */
  dataId: number;
  sectionId: number;
  headerId: number;
  controlTypeId: number;
  templateId: number;
  /** always JSON.stringify(value), regardless of whether the underlying value is a plain string,
   * a number, or a structured object/array — the backend JSON.parses it back uniformly */
  headerValue: string;
};

type PatientConsultationPayload = {
  consultationDetails: ConsultationDetails;
  consultationHeadersData: ConsultationHeaderDataEntry[];
};

/** one row exactly as GET_DOCTOR_CONSULTATION_BY_VISIT_ID returns it — PascalCase, unlike every
 * other type in this file, because it's the raw wire shape straight off the API response rather
 * than something a builder here constructs */
type RawConsultationHeaderRow = {
  DataId: number;
  DoctorId: number;
  PatientId: number;
  VisitId: number;
  SectionId: number;
  HeaderId: number;
  ControlTypeId: number;
  TemplateId: number;
  /** JSON.stringify'd — JSON.parse before use, same convention as ConsultationHeaderDataEntry */
  HeaderValue: string;
};

/** one row exactly as GET_PATIENT_VISIT_DETAILS_BY_PATIENT_ID returns it — PascalCase wire shape,
 * same convention as RawConsultationHeaderRow */
type PatientVisitSummary = {
  VisitId: number;
  /** "dd-mm-yyyy" */
  VisitDate: string;
  DoctorId: number;
  DoctorName: string;
};

/** a section's saved values from one past visit, ready for display — built by
 * usePatientVisitHistory + buildVisitSnapshots (utils/sectionSnapshot.ts) out of
 * GET_DOCTOR_CONSULTATION_BY_VISIT_ID rows joined against that section's header mapping */
type EmrSectionVisitSnapshotEntry = {
  id: string;
  visitId: number;
  doctorId: number;
  doctorName: string;
  /** ISO yyyy-mm-dd */
  recordedOn: string;
  values: { headerId: number; headerName: string; controlType: string; value: unknown }[];
};

export type {
  AllergyRecordEntry,
  AllergySection,
  ConsultationDetails,
  ConsultationHeaderDataEntry,
  EmrSectionAnswerEntry,
  EmrSectionVisitSnapshotEntry,
  PatientConsultationPayload,
  PatientItem,
  PatientVisitSummary,
  RawConsultationHeaderRow,
  VitalEntry,
};
