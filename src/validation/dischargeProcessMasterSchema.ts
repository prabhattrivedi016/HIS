import * as Yup from "yup";

export const dischargeProcessMasterSchema = Yup.object().shape({
  dischargeProcessId: Yup.number().nullable(),

  processName: Yup.string().required("Process Name is required").trim(),

  processKey: Yup.string().required("Process key is required"),

  sequenceNo: Yup.number().nullable(),

  isMandatory: Yup.number().nullable(),

  faIconId: Yup.number()
    .typeError("Please select an icon")
    .required("Please select an icon")
    .moreThan(0, "Please select an icon"),

  isActive: Yup.number().required("Active is required"),

  isSystemProcess: Yup.number().nullable(),
});

export type dischargeProcessMasterFormData = Yup.InferType<typeof dischargeProcessMasterSchema>;
