import type { InferType } from "yup";
import * as yup from "yup";

export const technicalNotesSchema = yup.object({
  id: yup.number().nullable().default(0),

  investigationId: yup.number().nullable().default(0),

  technicalNote: yup.string().trim().required("Technical notes are required"),
});

export type TechnicalNotesFormData = InferType<typeof technicalNotesSchema>;
