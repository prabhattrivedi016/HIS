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
