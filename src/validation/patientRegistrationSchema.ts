import * as yup from "yup";
import { InferType } from "yup";

const parseNumber = (_value: unknown, originalValue: unknown) => {
  if (originalValue === "" || originalValue === null || originalValue === undefined) {
    return NaN;
  }
  return Number(originalValue);
};

const parseNullableNumber = (_value: unknown, originalValue: unknown) => {
  if (originalValue === "" || originalValue === null || originalValue === undefined) {
    return null;
  }
  const parsed = Number(originalValue);
  return Number.isNaN(parsed) ? null : parsed;
};

export const patientRegistrationSchema = yup.object().shape({
  PatientId: yup.number().transform(parseNullableNumber).nullable(),
  Title: yup.string().nullable(),
  BranchId: yup
    .number()
    .typeError("Branch is required")
    .moreThan(0, "Branch is required")
    .required("Branch is required"),
  FirstName: yup.string().required("First name is required"),
  MiddleName: yup.string().nullable(),
  LastName: yup.string().nullable(),
  AgeYears: yup
    .number()
    .transform(parseNumber)
    .typeError("Age (years) is required")
    .min(0, "Age (years) cannot be negative")
    .max(130, "Age (years) seems invalid")
    .required("Age (years) is required"),
  AgeMonths: yup
    .number()
    .transform(parseNumber)
    .typeError("Age (months) is required")
    .min(0, "Months must be between 0 and 11")
    .max(11, "Months must be between 0 and 11")
    .required("Age (months) is required"),
  AgeDays: yup
    .number()
    .transform(parseNumber)
    .typeError("Age (days) is required")
    .min(0, "Days must be between 0 and 31")
    .max(31, "Days must be between 0 and 31")
    .required("Age (days) is required"),
  Dob: yup
    .string()
    .required("DOB is required")
    .test("valid-dob", "Invalid DOB", value => {
      if (!value) return false;
      const dob = new Date(`${value}T00:00:00`);
      if (isNaN(dob.getTime())) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return dob <= today;
    }),
  Gender: yup.string().trim().required("Gender is required").notOneOf([""], "Gender is required"),
  MaritalStatus: yup.string().nullable(),
  Relation: yup.string().nullable(),
  RelativeName: yup.string().nullable(),
  IdProofName: yup.string().nullable(),
  IdProofNumber: yup.string().nullable(),
  SelfContactNumber: yup.string().required("Contact is required"),
  EmergencyContactNumber: yup.string().nullable(),
  Email: yup
    .string()
    .required("Email is required")
    .test("email-at", "Email must contain @", value => !value || value.includes("@")),
  PrivilegedCardNumber: yup.string().nullable(),
  Address: yup.string().nullable(),
  Pincode: yup.string().nullable(),
  CountryId: yup
    .number()
    .transform(parseNumber)
    .typeError("Country is required")
    .moreThan(0, "Country is required")
    .required("Country is required"),
  Country: yup.string().nullable(),
  StateId: yup
    .number()
    .transform(parseNumber)
    .typeError("State is required")
    .moreThan(0, "State is required")
    .required("State is required"),
  State: yup.string().nullable(),
  DistrictId: yup
    .number()
    .transform(parseNumber)
    .typeError("District is required")
    .moreThan(0, "District is required")
    .required("District is required"),
  District: yup.string().nullable(),
  CityId: yup
    .number()
    .transform(parseNumber)
    .typeError("City is required")
    .moreThan(0, "City is required")
    .required("City is required"),
  City: yup.string().nullable(),
  InsuranceCompanyId: yup.number().transform(parseNullableNumber).nullable(),
  CorporateId: yup.number().transform(parseNullableNumber).nullable(),
  CardNo: yup.string().nullable(),
  PatientImageFile: yup.string().nullable(),
  UniqueId: yup.string().nullable(),
  IsVaccination: yup.number().transform(parseNullableNumber).nullable(),
  VipPatient: yup.string().nullable(),
  PolicyNo: yup.string().nullable(),
  PolicyCardNo: yup.string().nullable(),
  ExpiryDate: yup.string().nullable(),
  CardHolder: yup.string().nullable(),
  ReferalNo: yup.string().nullable(),
  ReferalDate: yup.string().nullable(),
  ReferralDate: yup.string().nullable(),
  OnlinePtId: yup.number().transform(parseNullableNumber).nullable(),
  HealthId: yup.string().nullable(),
  HealthIdNumber: yup.string().nullable(),
  UhidOrBarcode: yup.string().nullable(),
  SearchBy: yup.string().nullable(),
  SearchValue: yup.string().nullable(),
});

export type PatientRegistrationFormItem = InferType<typeof patientRegistrationSchema>;
