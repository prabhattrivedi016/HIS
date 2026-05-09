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
