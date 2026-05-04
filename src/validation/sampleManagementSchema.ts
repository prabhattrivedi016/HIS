import * as yup from "yup";

export const sampleManagementSchema = yup.object().shape({
  branchId: yup.number().nullable(),
  roleId: yup.number().nullable(),
  uhid: yup.string().nullable(),
  barCode: yup.string().nullable(),
  patientName: yup.string().nullable(),
  labNo: yup.string().nullable(),
  fromDate: yup.string().nullable(),
  toDate: yup.string().nullable(),
  corporateId: yup.number().nullable(),
  statusId: yup.number().nullable(),
  sampleDateTime: yup.string().nullable(),
});

export type SampleManagementFormData = yup.InferType<typeof sampleManagementSchema>;

export const sampleManagementRemarksSchema = yup.object().shape({
  id: yup.number().nullable(),
  patientInvestigationId: yup.number().nullable(),
  testRemark: yup.string().required("Remark is required"),
  testComment: yup.string().required("Select atleast one remark"),
  testCommentId: yup.number().required().moreThan(0, "Please select one remark"),
  isInternal: yup.number().nullable(),
});

export type sampleManagementRemarksFormData = yup.InferType<typeof sampleManagementRemarksSchema>;

export const sampleManagementDocumentNameSchema = yup.object().shape({
  documentId: yup.number().nullable(),
  documentName: yup.string().required("Document name is required"),
});

export type SampleManagementDocumentNameFormData = yup.InferType<
  typeof sampleManagementDocumentNameSchema
>;

export const sampleManagementDocumentUploadSchema = yup.object().shape({
  PatientInvestigationId: yup.number().nullable(),

  InvestigationDocumentNameId: yup
    .number()
    .required("Select atleast one investigation")
    .moreThan(0, "Select atleast one investigation"),

  UploadFile: yup
    .mixed()
    .required("File is required")
    .test("fileType", "Unsupported file format", (value: any) => {
      if (!value) return false;

      const allowedTypes = ["image/jpeg", "image/png"];

      return allowedTypes.includes(value.type);
    })
    .test("fileSize", "File size too large (max 5MB)", (value: any) => {
      if (!value) return false;

      return value.size <= 5 * 1024 * 1024;
    }),
});

export type sampleManagementDocumentUploadFormData = yup.InferType<
  typeof sampleManagementDocumentUploadSchema
>;
