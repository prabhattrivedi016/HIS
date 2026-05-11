import * as yup from "yup";

export const investigationTemplateSchema = yup.object().shape({
  id: yup.number().nullable(),
  typeId: yup.number().required("Mapping type is required"),
  type: yup.string().required("Mapping type is required"),
  name: yup.string().required("Template name is required"),
  contentValue: yup.string().required("Comment is required"),
  isActive: yup.number().required("Status is required"),
});

export type InvestigationTemplateFormData = yup.InferType<typeof investigationTemplateSchema>;

export const observationLovsSchema = yup.object().shape({
  typeId: yup.number().required("Mapping type is required"),
  type: yup.string().required("Mapping type is required"),
  observationId: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? 0 : value))
    .moreThan(0, "Observation is required")
    .required("Observation is required"),
  itemid: yup.number().nullable(),
});

export type ObservationLovsFormData = yup.InferType<typeof observationLovsSchema>;

export const lovsPopupSchema = yup.object().shape({
  lovId: yup.number().nullable(),
  lovName: yup.string().required("List of values is required"),
});

export type lovsPopupFormData = yup.InferType<typeof lovsPopupSchema>;
