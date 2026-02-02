import * as Yup from "yup";

const paddingValidation = Yup.number()
  .transform((value, originalValue) => (originalValue === "" ? undefined : value))
  .typeError("Padding must be between 0 to 500")
  .min(0, "Padding must be between 0 to 500")
  .max(500, "Padding must be between 0 to 500")
  .nullable();

export const LetterHeadSchema = Yup.object().shape({
  id: Yup.number().nullable(),

  BranchId: Yup.number().required("Branch is required"),

  TypeId: Yup.number().nullable(),

  TypeName: Yup.string().required("Type Name is required"),

  PaddingLeft: paddingValidation,

  PaddingRight: paddingValidation,

  PaddingTop: paddingValidation,

  PaddingBottom: paddingValidation,

  LetterHeadFile: Yup.mixed<File>()
    .required("File is required")
    .test(
      "fileType",
      "Only JPG, JPEG, PNG images are allowed",
      value => value && ["image/jpeg", "image/jpg", "image/png"].includes(value.type)
    )
    .test(
      "fileSize",
      "File size must be less than 5MB",
      value => value && value.size <= 5 * 1024 * 1024
    ),
});
