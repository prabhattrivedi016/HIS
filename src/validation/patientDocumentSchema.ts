import * as Yup from "yup";

const PatientDocumentSchema = Yup.object().shape({
  documentId: Yup.number().nullable(),
  documentName: Yup.string().required("Document Name is required"),
  documentCode: Yup.string().required("Document Code is required"),
  isActive: Yup.number().required("Status is required"),
  documentCategoryId: Yup.number()
    .min(1, "Document category is required")
    .required("Document category is required"),
  documentCategory: Yup.string().required("Document category is required"),
  isMandatory: Yup.number().nullable(),
});
export default PatientDocumentSchema;
