import * as Yup from "yup";

export const otProcessMasterSchema = Yup.object().shape({
  otProcessId: Yup.number().nullable(),

  processName: Yup.string().required("Process Name is required").trim(),

  processKey: Yup.string().required("Process key is required"),

  sequenceNo: Yup.number().nullable(),

  faIconId: Yup.number()
    .typeError("Please select an icon")
    .required("Please select an icon")
    .moreThan(0, "Please select an icon"),

  isActive: Yup.number().required("Active is required"),

  isSystemProcess: Yup.number().nullable(),
});

export type otProcessMasterFormData = Yup.InferType<typeof otProcessMasterSchema>;
