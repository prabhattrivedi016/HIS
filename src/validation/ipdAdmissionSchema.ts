import * as yup from "yup";

const parseNumber = (_value: unknown, originalValue: unknown) => {
  if (originalValue === "" || originalValue === null || originalValue === undefined) {
    return NaN;
  }
  return Number(originalValue);
};

const isMlcAdmission = (admissionType?: string) => admissionType === "MLC";

export const ipdAdmissionSchema = yup.object().shape({
  insuranceCompanyId: yup.number().transform(parseNumber).nullable(),
  corporateId: yup.number().transform(parseNumber).nullable(),
  specializationId: yup.number().transform(parseNumber).default(0),
  primaryDoctorId: yup
    .number()
    .transform(parseNumber)
    .typeError("Primary doctor is required")
    .moreThan(0, "Primary doctor is required")
    .required("Primary doctor is required"),
  secondaryDoctorIds: yup.array().of(yup.number()).default([]),
  referDoctorId: yup.number().transform(parseNumber).nullable(),
  proId: yup.number().transform(parseNumber).nullable(),
  proName: yup.string().nullable(),
  billingTypeId: yup
    .number()
    .transform(parseNumber)
    .typeError("Billing type is required")
    .moreThan(0, "Billing type is required")
    .required("Billing type is required"),
  roomTypeId: yup
    .number()
    .transform(parseNumber)
    .typeError("Room type is required")
    .moreThan(0, "Room type is required")
    .required("Room type is required"),
  bedId: yup
    .number()
    .transform(parseNumber)
    .typeError("Bed is required")
    .moreThan(0, "Bed is required")
    .required("Bed is required"),
  admissionDate: yup.string().trim().required("Admission date is required"),
  admissionTime: yup.string().trim().required("Admission time is required"),
  attendantRelation: yup.string().nullable(),
  attendantName: yup.string().nullable(),
  attendantContactNumber: yup
    .string()
    .nullable()
    .test(
      "attendant-contact-format",
      "Attendant contact number must be 10 digits",
      value => !value || /^\d{10}$/.test(value)
    ),
  handleWithCare: yup.number().default(0),
  nameMasking: yup.number().default(0),
  admissionType: yup.string().trim().required("Admission type is required"),
  mlcNo: yup.string().when("admissionType", {
    is: isMlcAdmission,
    then: schema => schema.trim().required("MLC number is required"),
    otherwise: schema => schema.nullable(),
  }),
  mlcTypeId: yup.number().transform(parseNumber).nullable(),
  mlcType: yup.string().when("admissionType", {
    is: isMlcAdmission,
    then: schema => schema.trim().required("MLC type is required"),
    otherwise: schema => schema.nullable(),
  }),
  injuryTypeId: yup.number().transform(parseNumber).nullable(),
  injuryType: yup.string().when("admissionType", {
    is: isMlcAdmission,
    then: schema => schema.trim().required("Injury type is required"),
    otherwise: schema => schema.nullable(),
  }),
  broughtBy: yup.string().nullable(),
  transportId: yup.number().transform(parseNumber).nullable(),
  transport: yup.string().nullable(),
  placeOfAccident: yup.string().nullable(),
  policeStation: yup.string().nullable(),
  officerName: yup.string().nullable(),
  officerPhone: yup.string().when("admissionType", {
    is: isMlcAdmission,
    then: schema =>
      schema
        .trim()
        .required("Officer phone is required")
        .matches(/^\d{10}$/, "Officer phone must be 10 digits"),
    otherwise: schema =>
      schema
        .nullable()
        .test(
          "officer-phone-format",
          "Officer phone must be 10 digits",
          value => !value || /^\d{10}$/.test(value)
        ),
  }),
  complaintNo: yup.string().nullable(),
  buckleNoOfPolice: yup.string().nullable(),
  dateOfInjury: yup.string().nullable(),
  dateOfInitiation: yup.string().nullable(),
  causeOfAccident: yup.string().nullable(),
  identificationMarks: yup.string().nullable(),
  remarks: yup.string().nullable(),
});
