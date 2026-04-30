import * as yup from "yup";

export const labResultEntrySchema = yup.object().shape({
  branchId: yup.number().nullable(),
  typeId: yup.number().nullable(),
  uhid: yup.string().nullable(),
  ipdNo: yup.string().nullable(),
  labNo: yup.string().nullable(),
  fromDate: yup.string().nullable(),
  toDate: yup.string().nullable(),
  statusId: yup.number().nullable(),
  barcode: yup.string().nullable(),
  patientName: yup.string().nullable(),
  subCategoryId: yup.number().nullable(),
  subSubCategoryId: yup.number().nullable(),
  investigationId: yup.number().nullable(),
  canSampleCollect: yup.number().nullable(),
});
