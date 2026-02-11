import * as Yup from "yup";

const PatientDocumentMasterValidation = Yup.object().shape({
  documentId: Yup.number().nullable(),
  documentName: Yup.string().required("Document Name is required"),
  documentCode: Yup.string().required("Document Code is required"),
  isActive: Yup.number().required("Status is required"),
});
export default PatientDocumentMasterValidation;
