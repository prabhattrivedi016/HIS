import * as yup from "yup";

export const observationPopupSchema = yup.object().shape({
  observationId: yup.number().nullable(),
  observationName: yup.string().required("Observation name is required"),
  prefixName: yup.string().nullable(),
  suffixName: yup.string().nullable(),
  methodId: yup.number().nullable(),
  showInDS: yup.number().nullable(),
  roundUp: yup.string().nullable(),
  fieldType: yup.string().nullable(),
  fieldTypeId: yup.number().nullable(),
});
