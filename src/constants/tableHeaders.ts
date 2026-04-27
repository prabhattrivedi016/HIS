export const sampleManagementButtons = [
  { buttonName: "all", level: "All", color: "#8C8787" },
  { buttonName: "collectionPending", level: "Collection Pending", color: "#F28E85" },
  { buttonName: "sampleCollected", level: "Sample Collected", color: "#7BA1DB" },
  { buttonName: "rejected", level: "Rejected", color: "#E05A5A" },
  { buttonName: "deptRecPending", level: "Dept. Rec. Pending", color: "#D6D065" },
  { buttonName: "deptReceived", level: "Dept Received", color: "#3DE3DC" },
  { buttonName: "urgentSample", level: "Urgent Sample", color: "#7CD44A" },
];

export const SampleManagementTableHeader = [
  "#",
  "Lab No",
  "Bill Date",
  "UHID",
  "Patient Name",
  "Age/Gender",
  "Corporate",
  "Investigation",
  "Sample Type",
  "Bar Code",
  "Color Code",
  "Sample Collection",
  "Dept. Rec.",
  "Reject",
  "Remark",
  "Info",
];

export const PatientInvestigationTableHeader = [
  "#",
  "Investigation Name",
  "Bill Date",
  "Billing By",
  "Collection Date",
  "Collected By",
  "Received Date",
  "Received By",
  "Rejected Date",
  "Rejected By",
  "Sample Rejected Reason",
  "Result Entered Date",
  "Result Entered By",
  "Approved Date",
  "Approved By",
];

export const LabResultEntryButtons = [
  { buttonName: "resultPending", level: "Result Pending", color: "#8C8787" },
  { buttonName: "hold", level: "Hold", color: "#F28E85" },
  { buttonName: "reportApprovedPending", level: "Report Approved Pending", color: "#7BA1DB" },
  { buttonName: "approved", level: "Approved", color: "#E05A5A" },
  { buttonName: "printed", level: "Printed", color: "#D6D065" },
  { buttonName: "dispatched", level: "Dispatched", color: "#3DE3DC" },
  { buttonName: "reRun", level: "ReRun", color: "#7CD44A" },
];
export const LabResultEntryTableHeader = [
  "#",
  "Lab No",
  "Bill Date",
  "Type",
  "UHID",
  "IPD No",
  "Ward Name/Bed No",
  "Patient Name",
  "Age/Gender",
  "Investigation",
  "BarCode",
  "Print",
  "Approved",
  "Stickers",
  "Remark",
  "Info",
];

export const LREPatientInvestigationTableHeader = [
  "#",
  "Investigation Name",
  "Bill Date",
  "Billing By",
  "Test Remark",
  "Collection Date",
  "Collected By",
  "Received Date",
  "Received By",
  "Rejected Date",
  "Rejected By",
  "Sample Rejected Reason",
  "Result Entered Date",
  "Result Entered By",
  "Approved Date",
  "Approved By",
];

export const LRPatientRemarkTableHeader = [
  "#",
  "Sample Remark",
  "Remark",
  "Remark Date",
  "Create By",
  "Is Internal",
  "Edit",
  "Delete",
];

export const ResultEntryRadiologyButtons = [
  { buttonName: "resultPending", level: "Result Pending", color: "#fbe24f" },
  { buttonName: "reportApprovedPending", level: "Report Approved Pending", color: "#00c0ef" },
  { buttonName: "rejected", level: "Rejected", color: "#fc6464" },
  { buttonName: "hold", level: "Hold", color: "#f09bf8" },
  { buttonName: "approved", level: "Approved", color: "#2eeba3" },
  { buttonName: "dispatched", level: "Dispatched", color: "#adeb74" },
];

export const ResultEntryRadiologyTableHeader = [
  "#",
  "Lab No",
  "Bill Date",
  "UHID",
  "IPD No",
  "Patient Name",
  "Age/Gender",
  "Investigation",
  "BarCode",
  "Print",
  "Approved",
  "Stickers",
  "Remark",
  "Info",
];

export const ResultEntryRadiologyReportTableHeader = [
  "#",
  "Document",
  "Uploaded On",
  "Uploaded By",
  "View",
  "Delete",
];

export const ResultEntryRadiologyPatientInvestigationTableHeader = [
  "Investigation Name",
  "Bill Date",
  "Billing By",
  "Test Remark",
  "Result Entered Date",
  "Result Entered By",
  "Approved Date",
  "Approved By",
];

export const HistoResultEntryTableHeader = [
  "#",
  "Lab No",
  "Bill Date",
  "UHID",
  "Patient Name",
  "Age/Gender",
  "Client Name",
  "Due Amount",
  "",
  "",
  "",
  "Investigation",
  "BarCode",
  "Delivery Date",
  "Print",
  "Approve",
  "Approved Date",
  "Remark",
  "Histo",
  "Info",
];

export const LabWorkSheetButtons = [
  "Sample Collection Pending",
  "Department Receiving",
  "Sample Collected",
  "Abnormal",
  "Hold",
  "Approved",
  "Dispatched",
  "Urgent",
];

export const LabWorkSheetTableHeader = [
  "#",
  "Bill Date",
  "Lab No",
  "UHID",
  "Patient Name",
  "Age/Gender",
  "Client Name",
  "Investigation",
  "Barcode",
  "Print",
];

export const AllergyResultEntryButtons = [
  "Result Pending",
  "Report Approval Pending",
  "Hold",
  "Approved",
  "Dispatched",
];

export const AllergyResultEntryTableHeader = [
  "#",
  "Lab No",
  "Bill Date",
  "UHID",
  "Patient Name",
  "Age/Gender",
  "Client Name",
  "Investigation",
  "Barcode",
  "Delivery Date",
  "Print",
  "Approved",
  "Approved Date",
  "Remark",
  "Stickers",
  "Info",
];

export const LaboratoryHelpDeskButtons = [
  "Sample Collection Pending",
  "Sample Collected",
  "Department Received",
  "Abnormal",
  "Hold",
  "Report Approval Pending",
  "Approved",
  "Dispatched",
  "Urgent",
];

export const LaboratoryHelpDeskTableHeader = [
  "Barcode",
  "Lab No",
  "Bill Date",
  "UHID",
  "Patient Name",
  "Age/Gender",
  "Contact No.",
  "Client Name",
  "Investigation",
  "OutSource",
  "	DisPatch",
  "",
  "",
  "",
];

export const AllergySubTypeListTableHeader = [
  "#",
  "Allergy Type",
  "Allergy Sub Type",
  "Normal Range",
  "Border Range",
  "High Range",
  "Default Reading",
  "Unit",
  "Image",
  "Status",
  "Edit",
];

export const IpdBillingTableHeader = [
  "#",
  "View",
  "UHID",
  "IPD No",
  "Patient Name",
  "Age",
  "Gender",
  "Contact Number",
  "State",
  "District",
  "City",
  "Address",
  "Billing Type/Bed",
  "Admission Date & Time",
  "Discharge Date & Time",
  "Corporate",
  "User Name",
];

export const LabInvestigationTableHeader = [
  "#",
  "Item Type",
  "Investigation Name",
  "Test Code",
  "TAT",
  "Sample Type",
  "Sample Volume",
  "Gender",
  "Status",
  "View",
  "Edit",
  "Status",
];

export const ObservationMappingTableHeader = [
  "Observation",
  "Is Header",
  "Is Bold",
  "Is UnderLine",
  "Is Mandatory",
  "Round Off",
  "Method",
  "Edit Ranges",
  "Delete",
];

export const EditRangesTableHeader = [
  "Gender",
  "From Age (Days)",
  "To Age (Days)",
  "Default Value",
  "Min Value",
  "Max Value",
  "Unit",
  "Display Value",
  "Add",
  "Delete",
];

export const ReferLabListTableHeader = [
  "#",
  "Out Source Lab",
  "Branch Name",
  "Contact Person",
  "Contact No",
  "Address",
  "Status",
  "Edit",
];

export const RateListMasterTableHeader = [
  "#",
  "Rate List Name",
  "Applicable Date",
  "Expiry date",
  "Status",
  "Edit",
];

export const TariffManagerTableHeader = [
  "#",
  "Rate List",
  "Type",
  "Category",
  "Sub Category",
  "Sub Sub Category",
  "Service",
  "Alias",
  "Service Code",
  "Rate",
  "Emergency Charges",
  "Editable",
];

export const OpdRateListTableHeader = ["Remove", "OPD Rate List"];

export const IpdRateListTableHeader = ["Remove", "IPD Rate List"];

export const DiscountApprovalMasterTableHeader = [
  "#",
  "Name",
  "HMS User",
  "Discount Type",
  "Branch",
  "Status",
  "Edit",
];

export const PatientSearchResultTableHeader = [
  "#",
  "Title",
  "Ptient Name",
  "UHID",
  "DOB",
  "Gender",
  "Relative Name",
  "Contact Number",
  "Address",
  "Registration Date",
  "Ipd No",
];

export const OpdBillingServiceTableHeader = [
  "Delete",
  "#",
  "Service Name",
  "Code",
  "Doctor",
  "QTY",
  "Rate",
  "Disc (%)",
  "Disc",
  "Net Amt",
  "U",
];

export const BillingPaymentTableHeader = ["Payment Mode", "Amount", "Bank", "Ref No."];

export const TestPackageTableHeader = ["#", "Category", "Name", "QTY"];

export const FormulaMasterObservationTableHeader = ["#", "ID", "Test Name"];

export const InvestigationFormulaListTableHeader = [
  "#",
  "Investigation Name",
  "Observation Name",
  "Formula",
  "Edit",
  "Delete",
];

export const PatientDocumentTableHeader = [
  "#",
  "Document Name",
  "Document Code",
  "Uploaded",
  "Download",
  "Browse",
];

export const SampleRejectionRemarkTableHeader = [
  "#",
  "Sample Remark",
  "Remark",
  "Remark Date",
  "Create By",
  "Is Internal",
  "	Edit",
  "Delete",
];
