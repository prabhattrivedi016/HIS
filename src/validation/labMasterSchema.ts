import * as yup from "yup";

export const sampleTypeSchema = yup.object().shape({
  sampleTypeId: yup.number().nullable(),
  sampleType: yup.string().required("Sample type name is required"),
  containerColorId: yup
    .number()
    .required("Sample color is required")
    .min(1, "Sample color is required"),
  isActive: yup.number().required("Status is required"),
});

export const testMethodSchema = yup.object().shape({
  methodId: yup.number().nullable(),
  method: yup.string().required("Test method is required"),
  isActive: yup.number().required("Status is required"),
});

export const fieldBoySchema = yup.object().shape({
  fieldBoyId: yup.number().nullable(),
  fieldBoyName: yup.string().required("Field boy is required"),
  isActive: yup.number().required("Status is required"),
});

export const sampleRejectionSchema = yup.object().shape({
  sampleRejectionRemarksID: yup.number().nullable(),
  sampleRejectionRemarks: yup.string().required("Sample rejection remark is required"),
  isActive: yup.number().required("Status is required"),
});

export const sampleRemarksSchema = yup.object().shape({
  sampleRemarksID: yup.number().nullable(),
  sampleRemarks: yup.string().required("Sample remarks is required"),
  isActive: yup.number().required("Status is required"),
});

export type SampleRemarkFormData = yup.InferType<typeof sampleRemarksSchema>;
