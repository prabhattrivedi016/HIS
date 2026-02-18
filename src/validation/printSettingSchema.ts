import * as yup from "yup";

export const headerFooterSchema = yup.object().shape({
  headerId: yup.number().nullable(),

  roleId: yup.number().moreThan(0, "Role name is required"),

  branchId: yup.number().moreThan(0, "Branch is required"),

  type: yup.string().nullable(),

  typeId: yup.number().moreThan(0, "Type is required"),

  isHeader: yup.number().nullable(),

  headerBody: yup.string().trim().required("Header body is required"),

  isActive: yup.number().oneOf([0, 1], "Status is required"),
});

export const sequenceMappingSchema = yup.object().shape({
  mappingId: yup.number().nullable(),

  branchId: yup.number().nullable(),

  roleId: yup.number().nullable(),

  typeId: yup.number().typeError("Type is required").moreThan(0, "Type is required"),

  sequenceId: yup.number().typeError("Sequence is required").moreThan(0, "Sequence is required"),
});

export const sequenceMappingDrawerSchema = yup.object({
  sequenceId: yup.number().nullable(),

  name: yup.string().trim().required("Name is required"),

  typeId: yup.number().nullable(),
  typeName: yup.string().nullable(),

  prefix: yup.string().trim().required("Prefix is required"),

  firstSeprator: yup.string().nullable(),

  fyFormatId: yup.number().nullable(),
  fyFormat: yup.string().nullable(),

  secondSeprator: yup.string().nullable(),

  length: yup.number().typeError("Length is required").moreThan(0, "Length is required"),
  preview: yup.string().required("Preview is required"),
});

export const doctorSignatureSchema = yup.object({
  Id: yup.number().nullable(),

  BranchId: yup.number().moreThan(0, "Branch is required").required("Branch is required"),

  DoctorId: yup.number().moreThan(0, "Doctor name is required").required("Doctor name is required"),

  xSign: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? undefined : Number(originalValue)
    )
    .typeError("X-Axis must be a number")
    .min(0, "X-Axis must be between 0 and 1000")
    .max(1000, "X-Axis must be between 0 and 1000")
    .required("X-Axis is required"),

  ySign: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? undefined : Number(originalValue)
    )
    .typeError("Y-Axis must be a number")
    .min(0, "Y-Axis must be between 0 and 1000")
    .max(1000, "Y-Axis must be between 0 and 1000")
    .required("Y-Axis is required"),

  DocSignFile: yup
    .mixed<File>()
    .nullable()
    .when("Id", {
      is: (id: number) => id != null && id > 0,
      otherwise: schema => schema.required("Doctor signature is required"),
    })
    .test("fileSize", "File must be less than 5MB", file => {
      if (!file) return true;
      return (file as File).size <= 5 * 1024 * 1024;
    })
    .test("fileType", "Only PNG, JPG, JPEG allowed", file => {
      if (!file) return true;
      return ["image/png", "image/jpeg", "image/jpg"].includes((file as File).type);
    }),
});

export const letterHeadSchema = yup.object().shape({
  id: yup.number().nullable(),

  BranchId: yup.number().required("Branch is required"),

  TypeId: yup.number().nullable(),

  TypeName: yup.string().required("Type Name is required"),

  PaddingLeft: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? undefined : Number(originalValue)
    )
    .typeError("Padding must be a number")
    .min(0, "Padding must be between 0 and 500")
    .max(500, "Padding must be between 0 and 500")
    .required("Padding is required"),

  PaddingRight: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? undefined : Number(originalValue)
    )
    .typeError("Padding must be a number")
    .min(0, "Padding must be between 0 and 500")
    .max(500, "Padding must be between 0 and 500")
    .required("Padding is required"),

  PaddingBottom: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? undefined : Number(originalValue)
    )
    .typeError("Padding must be a number")
    .min(0, "Padding must be between 0 and 500")
    .max(500, "Padding must be between 0 and 500")
    .required("Padding is required"),

  PaddingTop: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? undefined : Number(originalValue)
    )
    .typeError("Padding must be a number")
    .min(0, "Padding must be between 0 and 500")
    .max(500, "Padding must be between 0 and 500")
    .required("Padding is required"),

  LetterHeadFile: yup
    .mixed<File>()
    .nullable()
    .when("id", {
      is: (id: number) => id != null && id > 0,
      otherwise: schema => schema.required("Letter head file is required"),
    })
    .test("fileSize", "File must be less than 5MB", file => {
      if (!file) return true;
      return (file as File).size <= 5 * 1024 * 1024;
    })
    .test("fileType", "Only PNG, JPG, JPEG allowed", file => {
      if (!file) return true;
      return ["image/png", "image/jpeg", "image/jpg"].includes((file as File).type);
    }),
});
