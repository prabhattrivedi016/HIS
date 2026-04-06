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

export enum HeaderFooterTabName {
  HEADER = "Header-Footer",
  SEQUENCE = "Sequence Mapping",
  DOCTOR = "Doctor Signature",
  LETTER = "Letter Head",
  FOOTER_REMARK = "Footer Remark",
}

export enum BankMasterTabName {
  BANK_MASTER = "Bank Master",
  BANK_DETAILS = "Bank Details",
}

export enum Radiology {
  RADIOLOGY = "radiology",
  DEFAULT_REPORT_TYPE = "2",
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
  "Document Name",
  "Document Code",
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

export const PatientRegistrationSaveButtons = [
  { name: "save", value: "Save", type: "submit", color: "save" },
  // { name: "CanOPDBilling", value: "Billing", type: "button", color: "save" },
  // { name: "CanIVFAdmission", value: "IVF Registration", type: "button", color: "save" },
  // { name: "CanIPDAdmission", value: "IPD Admission", type: "button", color: "save" },
  // { name: "CanEmergencyAdmission", value: "Emergency Admission", type: "button", color: "save" },
  // { name: "CanDialysisAdmission", value: "Dialysis Admission", type: "button", color: "save" },
  // { name: "CanDayCareAdmission", value: "Daycare Admission", type: "button", color: "save" },
  // { name: "CanOPDConsulationBooking", value: "OPD Consultation", type: "button", color: "save" },
  { name: "cancel", value: "Cancel", type: "button", color: "cancel" },
];

export const PatientRegistrationUpdateButtons = [
  { name: "CanUpdtaePatientregistration", value: "Update", type: "submit", color: "save" },
  // { name: "CanOPDBilling", value: "OPD Billing", type: "button", color: "save" },
  // { name: "CanIPDAdmission", value: "IPD Admission", type: "button", color: "save" },
  // { name: "CanEmergencyAdmission", value: "Emergency Admission", type: "button", color: "save" },
  // { name: "CanDialysisAdmission", value: "Dialysis Admission", type: "button", color: "save" },
  // { name: "CanDayCareAdmission", value: "Daycare Admission", type: "button", color: "save" },
  // { name: "CanOPDConsulationBooking", value: "OPD Consultation", type: "button", color: "save" },
  { name: "cancel", value: "Cancel", type: "button", color: "cancel" },
];

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
