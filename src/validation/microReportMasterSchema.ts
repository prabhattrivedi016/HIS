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
