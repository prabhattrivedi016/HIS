import * as yup from "yup";

export const organismMasterSchema = yup.object().shape({
  organismNameId: yup.number().nullable(),
  organismName: yup.string().required("Organism name is required"),
  organismGroupId: yup
    .number()
    .moreThan(0, "Organism group is required")
    .required("Organism group is required"),
  isActive: yup.number().required("Status is required"),
});

export type OrganismMasterFormItem = yup.InferType<typeof organismMasterSchema>;

export const organismGroupSchema = yup.object().shape({
  organismGroupId: yup.number().nullable(),
  organismGroupName: yup.string().required("Organism group name is required"),
});

export type OrganismGroupFormItem = yup.InferType<typeof organismGroupSchema>;

export const antibioticMasterSchema = yup.object().shape({
  antibioticNameId: yup.number().nullable(),
  antibioticName: yup.string().required("Antibiotic name is required"),
  antibioticGroupId: yup
    .number()
    .moreThan(0, "Antibiotic group is required")
    .required("Antibiotic group is required"),
  isActive: yup.number().required("Status is required"),
});

export type AntibioticMasterFormItem = yup.InferType<typeof antibioticMasterSchema>;

export const antibioticGroupSchema = yup.object().shape({
  antibioticGroupId: yup.number().nullable(),
  antibioticGroupName: yup.string().required("Antibiotic group name is required"),
});

export type AntibioticGroupFormItem = yup.InferType<typeof antibioticGroupSchema>;

export const cultureTemplateSchema = yup.object().shape({
  id: yup.number().nullable(),
  typeId: yup
    .number()
    .moreThan(0, "Template type is required")
    .required("Template type is required"),
  type: yup.string().required("Template type is required"),
  name: yup.string().required("Template name is required"),
  contentValue: yup.string().nullable(),
  isActive: yup.number().required("Status is required"),
});

export type CultureTemplateFormItem = yup.InferType<typeof cultureTemplateSchema>;
