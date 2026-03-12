import * as yup from "yup";

export const AllergySubMasterSchema = yup.object().shape({
  Id: yup.number().nullable(),

  allergyType: yup
    .number()
    .transform((value, originalValue) => {
      const next = typeof originalValue === "string" ? Number(originalValue) : value;
      return Number.isNaN(next) ? undefined : next;
    })
    .moreThan(0, "Please select Allergy Type")
    .required("Allergy Type is required"),

  allergySubTypeName: yup
    .string()
    .trim()
    .required("Allergy Sub Type is required")
    .matches(/^[A-Za-z\s]+$/, {
      message: "Please enter text only",
      excludeEmptyString: true,
    }),

  normalRange: yup
    .string()
    .trim()
    .required("Normal range is required")
    .matches(/^[0-9]+$/, {
      message: "Please enter numbers only",
      excludeEmptyString: true,
    }),

  borderRange: yup
    .string()
    .trim()
    .required("Border Range is required")
    .matches(/^[0-9]+$/, {
      message: "Please enter numbers only",
      excludeEmptyString: true,
    })
    .test(
      "greater-than-normal",
      "Border Range must be greater than Normal Range",
      function (value) {
        const { normalRange } = this.parent;
        if (!value || !normalRange) return true;
        return Number(value) > Number(normalRange);
      }
    ),

  highRange: yup
    .string()
    .trim()
    .required("High range is required")
    .matches(/^[0-9]+$/, {
      message: "Please enter numbers only",
      excludeEmptyString: true,
    })
    .test("greater-than-border", "High Range must be greater than Border Range", function (value) {
      const { borderRange } = this.parent;
      if (!value || !borderRange) return true;
      return Number(value) > Number(borderRange);
    }),

  defaultReading: yup
    .string()
    .nullable()
    .matches(/^[0-9]*$/, {
      message: "Please enter numbers only",
      excludeEmptyString: true,
    }),

  unit: yup
    .string()
    .trim()
    .required("Unit is required")
    .matches(/^[0-9]+$/, {
      message: "Please enter numbers only",
      excludeEmptyString: true,
    }),

  document: yup
    .mixed()
    .required("Document is required")
    .test("fileSize", "File must be less than 5MB", file => {
      if (!file) return true;
      return file.size <= 5 * 1024 * 1024;
    })
    .test("fileType", "Only PNG, JPG, JPEG allowed", file => {
      if (!file) return true;
      return ["image/png", "image/jpeg", "image/jpg"].includes(file.type);
    }),

  description: yup.string().nullable(),

  isActive: yup.number().oneOf([0, 1], "Status is required").required("Status is required"),
});
