import * as yup from "yup";

export const histoTemplateMasterSchema = yup.object().shape({
  id: yup.number().nullable(),
  typeId: yup.number().required("Type is required"),
  type: yup.string().required("Type is required"),
  name: yup.string().required("Name is required"),
  contentValue: yup.string().nullable(),
  isActive: yup.number().required("Status is required"),
});

export type HistoTemplateMasterFormItem = yup.InferType<typeof histoTemplateMasterSchema>;

export const specimenMasterSchema = yup.object().shape({
  id: yup.number().nullable(),
  specimenName: yup.string().required("Specimen Name is required"),
  isActive: yup.number().required("Status is required"),
});

export type SpecimenMasterFormItem = yup.InferType<typeof specimenMasterSchema>;

export const histoPendingReasonMasterSchema = yup.object().shape({
  id: yup.number().nullable(),
  pendingReason: yup.string().required("Pending Reason is required"),
  isActive: yup.number().required("Status is required"),
});

export type HistoPendingReasonMasterFormItem = yup.InferType<typeof histoPendingReasonMasterSchema>;

export const histoImmunoAntibioticMasterSchema = yup.object().shape({
  id: yup.number().nullable(),
  antibioticName: yup.string().required("Antibiotic Name is required"),
  isActive: yup.number().required("Status is required"),
});

export type HistoImmunoAntibioticMasterFormItem = yup.InferType<
  typeof histoImmunoAntibioticMasterSchema
>;
