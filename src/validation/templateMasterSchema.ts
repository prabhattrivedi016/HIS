import * as yup from "yup";

export const templateCategorySchema = yup.object({
  templateCategoryId: yup.number().nullable(),

  templateCategoryName: yup.string().required("Category Name is required"),
});

export type TemplateCategoryFormData = yup.InferType<typeof templateCategorySchema>;

export const templateSchema = yup.object({
  templateId: yup.number().nullable(),

  templateName: yup.string().required("Template Name is required"),

  displayName: yup.string().required("Display Name is required"),

  templateCategoryId: yup
    .number()
    .required("Template Category is required")
    .min(1, "Template Category is required"),

  isActive: yup.number().required("Status is required"),
});

export type TemplateFormData = yup.InferType<typeof templateSchema>;

export const customFormSchema = yup.object({
  formId: yup.number().nullable(),

  formName: yup.string().required("Form Name is required"),

  displayName: yup.string().required("Display Name is required"),

  isActive: yup.number().required("Status is required"),
});

export type CustomFormData = yup.InferType<typeof customFormSchema>;
