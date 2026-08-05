export const VIEWTYPE = {
  GRID: "grid",
  LIST: "list",
};

export const NavigationPaneHeader = [
  "Tab Name",
  "SubMenu Name",
  "Url",
  "Status",
  "IP Address",
  // "Create By",
  // "Create On",
  // "Last Modified By",
  // "Last Modified On",
];

export const TabnameTableHeader = [
  "Tab Type",
  "Group Type",
  "Room Type",
  "Tab Name",
  "URL",
  "Sequence No",
  "Status",
  "Create By",
  "Create On",
  "Last Modified By",
  "Last Modified On",
];

export enum HeaderFooterTabName {
  HEADER = "Header-Footer",
  SEQUENCE = "Sequence Mapping",
  DOCTOR = "Doctor Signature",
  LETTER = "Letter Head",
  FOOTER_REMARK = "Footer Remark",
  NABL_LOGO = "NABL Logo",
  QR_CODE_BARCODE = "QR Code/Barcode",
  OTHER_PRINT_SETTINGS = "Other Print Settings",
}

export enum HistoMasterReportTabName {
  HISTO_TEMPLATE_MASTER = "Histo Template Master",
  SPECIMEN_MASTER = "Specimen Master",
  SPECIMEN_TEMPLATE_MAPPING = "Specimen Template Mapping",
  HISTO_PENDING_REASON_MASTER = "Histo Pending Reason Master",
  HISTO_IMMUNO_ANTIBIOTIC_MASTER = "Histo Immuno Antibiotic Master",
}

export enum MicroReportMasterTabName {
  ORGANISM_MASTER = "Organism Master",
  ANTIBIOTIC_MASTER = "Antibiotic Master",
  ORGANISM_ANTIBIOTIC_MAPPING = "Organism Antibiotic Mapping",
  CULTURE_TEMPLATE_MASTER = "Culture Template Master",
}

export enum BankMasterTabName {
  BANK_MASTER = "Bank Master",
  BANK_DETAILS = "Bank Details",
}

export enum PatientAdvanceTabName {
  PATIENT_DETAILS = "Patient Details",
  PATIENT_ADVANCE = "Patient Advance",
}

export enum BranchSettingsTabName {
  BRANCH_CORPORATE_RATE_LIST_MAPPING = "Branch Corporate Rate list Mapping",
  BRANCH_WISE_SERVICE_EXCLUDE = "Branch Wise Service Exclude",
  BRANCH_RIGHT_MAPPING = "Branch Flag Mapping",
  BRANCH_DEFAULT_SETTING = "Branch Default Setting",
}
export enum Radiology {
  RADIOLOGY = "radiology",
  DEFAULT_REPORT_TYPE = "2",
}

export enum PaymentTypeValues {
  CREDIT = "Credit Only",
  BOTH = "Both",
  CASH = "Cash Only",
}
export enum LabMasterTabName {
  SAMPLE_TYPE = "Sample Type",
  TEST_METHOD = "Test Method",
  SAMPLE_REJECTION = "Sample Rejection",
  SAMPLE_REMARKS = "Sample Remarks",
  FIELD_BOY = "Field Boy",
}

export enum ImportTariffsTabName {
  IMPORT_TARIFFS_DOWNLOAD = "Download",
  IMPORT_TARIFFS_UPLOAD = "Upload",
}

export enum TariffManagerTabName {
  ALL_SERVICES = "All Services",
  DOCTOR_VISITS = "Doctor Visits",
  COPY_TARIFF = "Copy Tariff",
}

export enum IPDBillingTabName {
  TOTAL_ADMITTED = "Total Admitted",
  TOTAL_DISCHARGED = "Today Discharged",
  CASH = "Cash",
  CORPORATE = "Corporate",
  ADMITTED = "Admission",
  DISCHARGE = "Discharge",
  BILL_GENERATED_PENDING = "Bill Generated Pending",
  FILE_CLOSED_PENDING = "File Closed Pending",
  DISCHARGE_SUMMARY_READY = "Discharge Summary Ready",
  ZERO_ADVANCES = "Zero Advances",
}

export enum LabTypeIdValues {
  PATHOLOGY = 1,
  RADIOLOGY = 2,
  CARDIOLOGY = 3,
}

export enum LabTypeName {
  PATHOLOGY = "pathology",
  RADIOLOGY = "radiology",
  CARDIOLOGY = "cardiology",
}

export enum ConsultationHeaderMasterTabName {
  HEADER_MASTER = "Header Master",
  DOCTOR_DEPARTMENT_HEADER_MAPPING = "Doctor Department Header Mapping",
}

export enum EmrControlsTabName {
  EMR_CONTROLS = "EMR Controls",
  DOCTOR_DEPARTMENT_EMR_CONTROLS = "Doctor Department EMR Controls",
}

export enum VitalMasterTabName {
  VITAL_MASTER = "Vital Master",
  VITAL_MAPPING = "Vital Mapping",
}
export const BankDetailsTableHeader = [
  "#",
  "Payee Name",
  "Status",
  "PAN Number",
  "Bank Name",
  "Account Number",
  "Bank Address",
  "IFSC Code",
  "PIN Code",
  "TIN No.",
  "Create By",
  "Create On",
  "Last Modified By",
  "Last Modified On",
  "Edit",
];

export const sequenceBranchMasterHeader = [
  "#",
  "Branch Name",
  "Role Name",
  "Type Name",
  "Sequence Preview",
  "Created By",
  "Created On",
  "Last Modified By",
  "Last Modified On",
  "Edit",
];

export const letterHeaderTableHeader = [
  "#",
  "Centre",
  "Padding Left",
  "Padding Right",
  "Padding Top",
  "Padding Bottom",
  "Header",
  "Download",
  "Edit",
  "Delete",
];
export const VendorDetailsTableHeader = [
  "#",
  "Vendor Name",
  "Contact Number",
  "GSTIN No.",
  "Address",
  "Status",
  "Edit",
];

export const DoctorSignatureTableHeader = [
  "#",
  "Branch Name",
  "Doctor Name",
  "X-Axis",
  "Y-Axis",
  "Signature",
  "Download",
  "Edit",
  "Delete",
];

export const BankMasterTableHeader = [
  "#",
  "Bank Name",
  "Status",
  "Created By",
  "Created On",
  "Last Modified By",
  "Last Modified On",
  "Edit",
];

export const VendorMasterTableHeader = [
  "#",
  "Vendor Name",
  "Type",
  "Contact No",
  "Email",
  "DL No",
  "GSTIN No",
  "Full Address",
  "Edit",
];

export const PatientDocumentTableHeader = [
  "#",
  "Document Category",
  "Document Name",
  "Document Code",
  "Mandatory",
  "Status",
  "Created By",
  "Created On",
  "Last Modified By",
  "Last Modified On",
  "Edit",
];

export const DoctorTimingTableHeader = ["Branch", "Day", "Start Time", "End Time", "Remove"];

export const SampleTypeMasterTableHeader = [
  "#",
  "Sample Type",
  "Status",
  "Color Name",
  "Color",
  "Created By",
  "Created On",
  "Last ModifiedBy",
  "Last ModifiedOn",
  "Edit",
];

export const FieldBoyMasterTableHeader = [
  "#",
  "Field Boy",
  "Status",
  "Created By",
  "Created On",
  "Last ModifiedBy",
  "Last ModifiedOn",
  "Edit",
];

export const SampleRejectionTableHeader = [
  "#",
  "Sample Rejection Remarks",
  "Status",
  "Created By",
  "Created On",
  "Last ModifiedBy",
  "Last ModifiedOn",
  "Edit",
];

export const LabMethodTableHeader = [
  "#",
  "Method",
  "Status",
  "Created By",
  "Created On",
  "Last ModifiedBy",
  "Last ModifiedOn",
  "Edit",
];

export enum BranchId {
  DEFAULT = 1,
}

export enum Status {
  ACTIVE = 1,
  INACTIVE = 0,
}

export enum DefaultRoleHeaderFooterMaster {
  DEFAULT = 0,
  DEFAULT_NAME = "Default",
}

export const FILE_UPLOAD_RULES = {
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  ALLOWED_TYPES: ["image/png", "image/jpeg", "image/jpg"],
} as const;

export enum DefaultBranch {
  BRANCH = 1,
}

export enum Active {
  isActive = 1,
}

export enum CATEGORY_ID {
  categoryId = 3,
  bedType = 10,
}

export enum OPD_CATEGORY_IDs {
  CategoryIds = "1,3,8,11,4,5",
}
export const labTypes = [
  { id: 1, name: "Pathology" },
  { id: 2, name: "Radiology" },
  { id: 3, name: "Cardiology" },
];

export const TARIFF_MANAGER_GET_CATEGORY = {
  OUT_PATIENT: "8,3,11,4,13,5",
  IN_PATIENT: "8,3,11,12,4,13,5,10,9",
};
export enum PATIENT_TYPE {
  OPD = "OPD",
  IPD = "IPD",
}

export enum VISIT_TYPE {
  OUT_PATIENT = 1,
  IN_PATIENT = 2,
}

export enum ButtonName {
  CAN_OPD_BILLING = "CanOPDBilling",
  CAN_IVF_ADMISSION = "CanIVFAdmission",
  CAN_IPD_ADMISSION = "CanIPDAdmission",
  CAN_EMERGENCY_ADMISSION = "CanEmergencyAdmission",
  CAN_DIALYSIS_ADMISSION = "CanDialysisAdmission",
  CAN_DAYCARE_ADMISSION = "CanDayCareAdmission",
  CAN_OPD_CONSULTATION_BOOKING = "CanOPDConsulationBooking",
  CANCEL = "cancel",
  CAN_UPDATE_PATIENT_REGISTRATION = "CanUpdtaePatientregistration",
}

export enum SampleManagementButtons {
  all = "All",
  collectionPending = "Collection Pending",
  sampleCollected = "Sample Collected",
  DeptRecPending = " Dept. Rec. Pending",
  deptReceived = "Dept Received",
  urgent = "Urgent",
  rejected = "Rejected",
  snr = " SNR",
}

export enum DefaultAddress {
  COUNTRY = "India",
  STATE = "Uttar Pradesh",
  DISTRICT = "Varanasi",
  City = "Manduadih SO",
}

export enum SampleTypeColorCoding {
  blood = "Blood",
  anyFluid = "Any Fluid",
  serum = "Serum",
  container = "Container",
}

export enum InvestigationInterpretationTemplateTabName {
  INVESTIGATION_TEMPLATE_MASTER = "Investigation Template Master",
  INVESTIGATION_INTERPRETATION_MAPPING = "Investigation -Template/Interpretation Mapping",
  OBSERVATION_COMMENT_LOVS = "Observation-Comment/LOVS",
}

export const InvestigationCommentTableHeader = [
  "#",
  "Mapping Type",
  "Template Name",
  "Status",
  "Created By",
  "Created On",
  "Last Modified By",
  "Last Modified On",
  "Edit",
];

export const HistoTemplateMasterTableHeader = [
  "#",
  "Template Type",
  "Template Name",
  "Status",
  "Edit",
];

export const SpecimenMasterTableHeader = ["#", "Specimen Name", "Status", "Edit"];

export const HistoPendingReasonMasterTableHeader = ["#", "Pending Reason", "Status", "Edit"];

export const HistoImmunoAntibioticMasterTableHeader = ["#", "Antibiotic Name", "Status", "Edit"];

export const OrganismMasterTableHeader = ["#", "Organism Name", "Organism Group", "Status", "Edit"];

export const AntibioticMasterTableHeader = [
  "#",
  "Antibiotic Name",
  "Antibiotic Group",
  "Status",
  "Edit",
];

export const UserWiseDiscountTableHeader = [
  "#",
  "User Name",
  "Disc(%)-OPD",
  "Disc(%)-IPD",
  "Disc(%)-Pharmacy",
  "Disc(%)-Daycare",
  "Disc(%)-Dialysis",
  "Disc(%)-Emergency",
];

export const HeaderMasterTableHeader = [
  "#",
  "Header Name",
  "Display Name",
  "Control Type",
  "Show on Print",
  "Show in Temp. Room",
  "Used For",
  "Status",
  "Edit",
];

export const DoctorDepartmentMappingTableHeader = [
  "#",
  "Header Name",
  "Display Name",
  "Control Type",
];

export const TemplatePopupHeaderMaster = ["#", "Investigation Name", "Template Name", "Remove"];

export enum ServiceMasterPopupName {
  CATEGORY = "category",
  SUB_CATEGORY = "subCategory",
  SUB_SUB_CATEGORY = "subSubcategory",
  PRINT_GROUP = "printGroup",
  REVENUE_DEPARTMENT = "revenueDepartment",
  SNOMED = "snomed",
}

export enum BedMasterPopupName {
  BLOCK = "block",
  FLOOR = "floor",
  WARD = "ward",
}

export enum IPDAdmissionTabName {
  PATIENT_DETAILS = "Patient Details",
  IPD_ADIMISSION = "Admission Details",
  IPD_DOCUMENT = "Documents",
}

export enum PageType {
  OPD_BILLING = "OPDBilling",
  IPD_BILLING = "IPDBilling",
  PATIENT_ADVANCE = "PatientAdvance",
  OPD_REFUND = "OpdRefund",
  CREDIT_NOTE = "creditNote",
  WRITE_OFF = "writeOff",
  IPD_ADMISSION = "IPDAdmission",
}
export enum OPDBillingTabName {
  PATIENT_DETAILS = "Patient Details",
  OPD_BILLING = "OPD Billing",
  OPD_DOCUMENT = "Documents",
}

export enum IpdOpdTypeName {
  OPD = "opd",
  IPD = "ipd",
}

/** every comparison operator a conditional-visibility rule can use (EMR Controls'
 * Conditional Controls builder) — value must match ConditionalRule["exp"] in dynamicForm/types.ts */
export const ConditionOperatorOptions = [
  { value: "==", label: "Equals (==)" },
  { value: "!=", label: "Does Not Equal (!=)" },
  { value: "isnull", label: "Is Null" },
  { value: "in", label: "In" },
  { value: "notin", label: "Not In" },
  { value: "<", label: "Less Than (<)" },
  { value: "<=", label: "Less Than Equals To (<=)" },
  { value: ">", label: "Greater Than (>)" },
  { value: ">=", label: "Greater Than Equals To (>=)" },
] as const;

export const AddNewTabIconTableHeader = ["#", "Icon Name", "Image"];

export const AppointmentSlotDays = [
  { label: "SUN", value: "Sunday" },
  { label: "MON", value: "Monday" },
  { label: "TUE", value: "Tuesday" },
  { label: "WED", value: "Wednesday" },
  { label: "THU", value: "Thursday" },
  { label: "FRI", value: "Friday" },
  { label: "SAT", value: "Saturday" },
];
