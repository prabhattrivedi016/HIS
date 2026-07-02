import * as yup from "yup";
import { InferType } from "yup";

export const subCategoryPopupSchema = yup.object().shape({
  subCategoryId: yup.number().nullable(),
  subCategoryName: yup.string().required("Sub category name is required"),
  categoryId: yup.number().nullable(),
  labTypeId: yup.number().required("Lab type is required"),
  labType: yup.string().nullable(),
});

export const subSubCategorySchema = yup.object().shape({
  subSubCategoryId: yup.number().nullable(),
  subSubCategoryName: yup.string().required("Sub sub category name is required"),
  subCategoryId: yup.number().nullable(),
  subSubCategoryAlias: yup.string().nullable(),
  printOrder: yup.string().nullable(),
});

export const addLabInvestigationSchema = yup.object().shape({
  serviceItemId: yup.number().nullable(),
  categoryId: yup.number().nullable(),
  subCategoryId: yup
    .number()
    .moreThan(0, "Please select sub category")
    .required("Please select sub category"),
  subSubCategoryId: yup
    .number()
    .moreThan(0, "Please select sub sub category")
    .required("Please select sub sub category"),
  name: yup.string().required("Investigation name is required"),
  code: yup.string().nullable(),
  shortName: yup.string().nullable(),
  reportTypeId: yup.number().required("Report type is required"),
  reportType: yup.string().nullable(),
  sampleTypeId: yup
    .number()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue === null || originalValue === undefined) {
        return 0;
      }
      return Number.isNaN(value) ? 0 : value;
    })
    .when("$isRadiology", {
      is: true,
      then: schema => schema.nullable(),
      otherwise: schema =>
        schema
          .moreThan(0, "At least one sample type is required")
          .required("At least one sample type is required"),
    }),
  sampleTypeList: yup.string().when("$isRadiology", {
    is: true,
    then: schema => schema.nullable(),
    otherwise: schema => schema.required("At least one sample type is required"),
  }),
  isSampleRequired: yup.number().nullable(),
  labMethodId: yup.number().nullable(),
  forGenderId: yup.number().nullable(),
  forGender: yup.string().nullable(),
  isDepartmentReceivingRequired: yup.number().nullable(),
  sampleVolume: yup.string().nullable(),
  tatInMin: yup.string().required("TAT is required"),
  isOutSource: yup.number().nullable(),
  isPrintAlone: yup.number().nullable(),
  isActive: yup.number().nullable(),
  investigationComment: yup.string().nullable(),
  snomedCode: yup.string().nullable(),
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

export type AddLabInvestigationFormData = InferType<typeof addLabInvestigationSchema>;
