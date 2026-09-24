import * as Yup from "yup";
import { InferType } from "yup";

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
  validityStartsFrom: Yup.string().required("Start date is required"),
  validityEndsOn: Yup.string().required("End date is required"),
  isActive: Yup.number().nullable(),
});

export const ipdAddPackageMasterSchema = Yup.object().shape({
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

  packageDurationDays: Yup.string()
    .min(1, "Package duration is required")
    .required("Package duration is required"),

  validityStartsFrom: Yup.string().required("Start date is required"),
  validityEndsOn: Yup.string().required("End date is required"),

  isActive: Yup.number().nullable(),
});

export type IpdPackageMasterFormData = InferType<typeof ipdAddPackageMasterSchema>;
