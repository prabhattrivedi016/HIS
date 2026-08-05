type ListOfLovsItem = {
  value: string;
  dataTypeId: number;
  headerName?: string;
  options?: string[];
  /** original file name, used only for the "Download" action of image-upload rows (control type 20) */
  fileName?: string;
  /** "Radio With Score"/"EmojiScore" rows only — the integer score assigned to this option */
  score?: number;
  /** "EmojiScore" rows only — the chosen face/emoji image, as a base64 data URL */
  base64Data?: string;
};

/** one document slot returned by GET_EMR_CONTROL_DOCUMENT_MAPPING for a header of
 * control type "Image Uploader" (20) — the doctor/admin attaches a file against DocumentId
 * via UPLOAD_EMR_CONTROL_DOCUMENT */
type EmrControlDocumentItem = {
  DocumentId: number;
  DocumentName: string;
  DocumentCode: string;
  DocumentPath: string;
  IsMandatory: number;
  /** the name last saved via UPLOAD_EMR_CONTROL_DOCUMENT's "ImageName" field, if any */
  ImageName?: string;
};

type HeaderMasterItem = {
  headerId: number;
  headerName: string;
  displayName: string;
  controlType: string;
  controlTypeId: number;
  isPrint: number;
  isShowInTempRoom: number;
  usedForPatientType: number;
  usedForPatientTypeName: string;
  isActive: number;
  /** saved SQL/text query for control type "Custom" */
  queries?: string;
};

type DoctorItem = {
  doctorId: number;
  title: string;
  name: string;
  dob: string;
  gender: string;
  completeName: string;
  contactNo: string;
  emailId: string;
  address: string;
  specializationId: number;
  specialization: string;
  userName: string;
  password: string;
  departmentId: number;
  department: string;
  profileSummery: string;
  registrationNo: string;
  isActive: number;
  userId: number;
  hospId: number;
  createdBy: string;
  createdOn: string;
  ipAddress: string;
  branchId: string;
  canApproveLabReport: number;
  canApproveDischargeSummary: number;
  doctorPhotoFilePath: string;
  isDoctorUnit: number;
  roomNo: string;
};

type DepartmentItem = {
  departmentId: number;
  department: string;
  departmentTypeId: number;
  departmentType: string;
  isActive: number;
};

type DoctorDepartmentTableItem = {
  headerId: number;
  headerName: string;
  displayName: string;
  controlType: string;
  mappingId: number;
  sequenceNo: number;
};

export type {
  DepartmentItem,
  DoctorDepartmentTableItem,
  DoctorItem,
  EmrControlDocumentItem,
  HeaderMasterItem,
  ListOfLovsItem,
};
