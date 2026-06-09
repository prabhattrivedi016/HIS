import * as yup from "yup";

export const createUpdateCategorySchema = yup.object().shape({
  categoryId: yup.number().nullable(),
  categoryName: yup.string().required("Category name is required"),
  categoryTypeId: yup.number().required("Category type is required"),
  categoryTypeName: yup.string().required("Category type name is required"),
});

export type CreateUpdateCategoryFormItem = yup.InferType<typeof createUpdateCategorySchema>;

export const createUpdateSubCategorySchema = yup.object().shape({
  subCategoryId: yup.number().nullable(),
  subCategoryName: yup.string().required("Sub category name is required"),
  categoryId: yup.number().nullable(),
  labTypeId: yup.number().nullable(),
  labType: yup.string().nullable(),
});

export type CreateUpdateSubCategoryFormItem = yup.InferType<typeof createUpdateSubCategorySchema>;

export const createUpdateSubSubCategorySchema = yup.object().shape({
  subSubCategoryId: yup.number().nullable(),
  subSubCategoryName: yup.string().required("Sub sub category name is required"),
  subCategoryId: yup.number().nullable(),
  printGroupId: yup.number().required("Print group is required"),
  departmentId: yup.number().required("Department is required"),
});

export type CreateUpdateSubSubCategoryFormItem = yup.InferType<
  typeof createUpdateSubSubCategorySchema
>;

export const createUpdatePrintGroupSchema = yup.object().shape({
  printGroupId: yup.number().nullable(),
  printGroupName: yup.string().required("Print group name is required"),
  printOrder: yup.number().min(1, "Print order is required").required("Print order is required"),
});

export type CreateUpdatePrintGroupFormItem = yup.InferType<typeof createUpdatePrintGroupSchema>;
