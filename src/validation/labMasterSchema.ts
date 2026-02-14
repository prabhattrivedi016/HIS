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
