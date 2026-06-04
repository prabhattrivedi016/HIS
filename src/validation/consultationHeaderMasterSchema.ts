import * as yup from "yup";

export const headerMasterSchema = yup.object({
  headerId: yup.number().nullable(),

  headerName: yup.string().required("Header Name is required"),

  displayName: yup.string().required("Display Name is required"),

  controlType: yup.string().required("Control Type is required"),

  controlTypeId: yup.number().required("Control Type is required"),

  isPrint: yup.number().required("Show On Print is required"),

  isShowInTempRoom: yup.number().nullable(),

  usedForPatientType: yup.number().required("Used For is required"),

  isActive: yup.number().required("Status is required"),
});

export type HeaderMasterFormData = yup.InferType<typeof headerMasterSchema>;
