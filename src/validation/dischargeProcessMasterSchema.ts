import * as Yup from "yup";

export const dischargeProcessMasterSchema = Yup.object().shape({
  dischargeProcessId: Yup.number().nullable(),

  processName: Yup.string().required("Process Name is required").trim(),

  processKey: Yup.string().required("Process key is required"),

  sequenceNo: Yup.number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .required("Sequence Number is required")
    .min(0, "Sequence Number cannot be less than 0"),

  isMandatory: Yup.number().required("Is Mandatory is required"),

  isActive: Yup.number().required("Active is required"),

  isSystemProcess: Yup.number().required("Is System Process is required"),
});

export type dischargeProcessMasterFormData = Yup.InferType<typeof dischargeProcessMasterSchema>;
