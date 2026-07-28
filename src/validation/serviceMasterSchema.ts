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
  printOrder: yup
    .number()
    .min(1, "Print order must be greater than 0")
    .required("Print order must be greater than 0"),
});

export type CreateUpdatePrintGroupFormItem = yup.InferType<typeof createUpdatePrintGroupSchema>;

export const createUpdateServiceMasterSchema = yup.object().shape({
  serviceItemId: yup.number().nullable(),
  categoryId: yup.number().min(1, "Category is required").required("Category is required"),
  subCategoryId: yup
    .number()
    .min(1, "Sub category is required")
    .required("Sub category is required"),
  subSubCategoryId: yup
    .number()
    .min(1, "Sub sub category is required")
    .required("Sub sub category is required"),
  name: yup.string().required("Service name is required"),
  code: yup.string().nullable(),
  roomTypeId: yup.number().nullable(),
  roomType: yup.string().nullable(),
  isICU: yup.number().nullable(),
  gstPer: yup.number().nullable(),
  snomedCode: yup.string().nullable(),
  opdConsultationTypeId: yup.number().nullable(),
  opdConsultationType: yup.string().nullable(),
  isOnlineConsultationAllow: yup.number().nullable(),
  isTeleConsultationService: yup.number().nullable(),
  isActive: yup.number().nullable(),
  isRegistrationCharge: yup.number().nullable(),
  registrationChargeValidityDays: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null || originalValue === undefined
        ? 0
        : Number(value)
    )
    .when("isRegistrationCharge", {
      is: (value: unknown) => Number(value) === 1,
      then: schema =>
        schema
          .required("Registration charge validity days is required")
          .min(1, "Registration validity must be greater than 0"),
      otherwise: schema => schema.notRequired().nullable(),
    }),
  isRequiredSeparatePerformingDoctor: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null || originalValue === undefined
        ? 0
        : Number(value)
    )
    .nullable(),
  doctorDepartmentIds: yup.string().when("isRequiredSeparatePerformingDoctor", {
    is: (value: unknown) => Number(value) === 1,
    then: schema =>
      schema
        .required("At least one doctor department is required")
        .test(
          "not-empty",
          "At least one doctor department is required",
          value => !!value && value.trim() !== ""
        ),
    otherwise: schema => schema.nullable(),
  }),
});

export type createUpdateServiceMasterFormItem = yup.InferType<
  typeof createUpdateServiceMasterSchema
>;

export const doctorDepartmentSchema = yup.object().shape({
  departmentId: yup.number().nullable(),

  department: yup.string().required("Department is required"),

  departmentTypeId: yup
    .number()
    .min(0, "Department type is required")
    .required("Department type is required"),

  departmentType: yup.string().required("Department type is required"),

  isActive: yup.number().required("Status is required"),
});

export type createUpdateDoctorDepartmentFormItem = yup.InferType<typeof doctorDepartmentSchema>;
