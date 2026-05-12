import * as yup from "yup";

export const freeTextReportSchema = yup.object().shape({
  patientInvestigationId: yup.number().nullable(),
  investigationId: yup.number().nullable(),
  resultValue: yup.string().required("Result value is required"),
  templateId: yup.number().nullable(),
  investigationComments: yup.string().nullable(),
  isAbnormalResult: yup.number().nullable(),
});

export type freeTextReportFormData = yup.InferType<typeof freeTextReportSchema>;
