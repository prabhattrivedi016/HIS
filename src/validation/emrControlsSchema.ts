import * as yup from "yup";

export const emrSectionSchema = yup.object({
  sectionId: yup.number().nullable(),

  sectionName: yup.string().required("Section Name is required"),

  displayName: yup.string().required("Display Name is required"),

  isActive: yup.number().required("Status is required"),
});

export type EmrSectionFormData = yup.InferType<typeof emrSectionSchema>;
