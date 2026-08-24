import * as Yup from "yup";

export const surgeryComponentMasterSchema = Yup.object().shape({
  componentId: Yup.number().optional(),

  componentName: Yup.string().required("Name is required").trim(),

  hasDoctor: Yup.number().required("Has Doctor is required"),

  isBaseComponent: Yup.number().nullable(),

  sharePercentage: Yup.number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .required("Share percentage is required")
    .min(0, "Share percentage cannot be less than 0")
    .max(100, "Share percentage cannot be greater than 100"),

  isActive: Yup.number().required("Active is required"),
});

export type surgeryComponentFormData = Yup.InferType<typeof surgeryComponentMasterSchema>;
