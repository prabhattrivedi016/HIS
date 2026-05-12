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

export const tabularReportSchema = yup.object().shape({
  observationId: yup.number().nullable(),
  resultValue: yup.string().nullable(),
  minValue: yup.number().nullable(),
  maxValue: yup.number().nullable(),
  displayRange: yup.string().nullable(),
  unit: yup.string().nullable(),
  machineResult: yup.number().nullable(),
  sampleRemark: yup.string().nullable(),
  isHeader: yup.number().nullable(),
  isResultBold: yup.number().nullable(),
  investigationComments: yup.string().nullable(),
  isAbnormalResult: yup.number().nullable(),
});

export type tabularReportFormData = yup.InferType<typeof tabularReportSchema>;
