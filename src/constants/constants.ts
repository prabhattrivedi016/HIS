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

export enum LabMasterTabName {
  SAMPLE_TYPE = "Sample Type",
  TEST_METHOD = "Test Method",
  SAMPLE_REJECTION = "Sample Rejection",
  SAMPLE_REMARKS = "Sample Remarks",
  FIELD_BOY = "Field Boy",
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

export const DEFAULT_PATIENT_DOCUMENT_MASTER_FORMDATA = {
  documentId: 0,
  documentName: "",
  documentCode: "",
  isActive: 1,
};

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
