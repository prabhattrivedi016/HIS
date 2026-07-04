import * as yup from "yup";

export const emrControlSchema = yup.object({
  headerId: yup.number().nullable(),

  headerName: yup.string().required("Header Name is required"),

  displayName: yup.string().required("Display Name is required"),

  isPrint: yup.number().required("Show On Print is required"),

  isShowInTempRoom: yup.number().nullable(),

  usedForPatientType: yup.number().required("Used For is required"),

  isActive: yup.number().required("Status is required"),
});

export type EmrControlFormData = yup.InferType<typeof emrControlSchema>;
