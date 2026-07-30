import * as Yup from "yup";

export const addPackageMasterSchema = Yup.object().shape({
  packageId: Yup.number().nullable(),
  categoryId: Yup.number().min(1, "Category is required").required("Category is required"),
  subCategoryId: Yup.number()
    .min(1, "Sub Category is required")
    .required("Sub Category is required"),
  subSubCategoryId: Yup.number()
    .min(1, "Sub Sub Category is required")
    .required("Sub Sub Category is required"),
  name: Yup.string().min(1, "Package Name is required").required("Package Name is required"),
  code: Yup.string().min(1, "Package Code is required").required("Package Code is required"),
  isMultipleVisitAllow: Yup.number().nullable(),
  visitDuration: Yup.number().nullable(),
  visitDurationType: Yup.string().nullable(),
  validityStartsFrom: Yup.string().nullable(),
  validityEndsOn: Yup.string().nullable(),
  isActive: Yup.number().nullable(),
});
