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
