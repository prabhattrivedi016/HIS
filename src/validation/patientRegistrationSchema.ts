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
  BranchId: yup.number().nullable(),
  Title: yup.string().trim().required("Title is required"),
  FirstName: yup.string().trim().required("First name is required"),
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
  Dob: yup.string().required("DOB is required"),
  Gender: yup.string().trim().required("Gender is required").notOneOf([""], "Gender is required"),
  MaritalStatus: yup.string().nullable(),
  Relation: yup.string().nullable(),
  RelativeName: yup.string().nullable(),
  IdProofName: yup.string().nullable(),
  IdProofNumber: yup.string().when("IdProofName", {
    is: (value: unknown) => Boolean(String(value ?? "").trim()),
    then: schema => schema.trim().required("ID proof number is required"),
    otherwise: schema => schema.nullable(),
  }),
  SelfContactNumber: yup
    .string()
    .trim()
    .required("Contact is required")
    .matches(/^\d{10}$/, "Contact number must be 10 digits"),
  EmergencyContactNumber: yup
    .string()
    .nullable()
    .test(
      "emergency-contact-format",
      "Emergency contact number must be 10 digits",
      value => !value || /^\d{10}$/.test(value)
    ),
  Email: yup.string().nullable().trim().email("Please enter a valid email address"),
  PrivilegedCardNumber: yup.string().nullable(),
  Address: yup.string().trim().nullable(),

  CountryId: yup.number().nullable(),
  Country: yup.string().nullable(),
  StateId: yup.number().nullable(),
  State: yup.string().nullable(),
  DistrictId: yup.number().nullable(),
  District: yup.string().nullable(),
  CityId: yup.number().nullable(),
  City: yup.string().nullable(),
  InsuranceCompanyId: yup.number().transform(parseNullableNumber).nullable(),
  CorporateId: yup.number().transform(parseNullableNumber).nullable(),
  CardNo: yup.string().nullable(),
  PatientImageFile: yup.mixed<File | string | null>().nullable(),
  IsVaccination: yup.number().transform(parseNullableNumber).nullable(),
  VipPatient: yup.string().nullable(),
  PolicyNo: yup.string().nullable(),
  PolicyCardNo: yup.string().nullable(),
  ExpiryDate: yup.string().nullable(),
  CardHolder: yup.string().nullable(),
  ReferalDate: yup.string().nullable(),
  ReferalNo: yup.string().nullable(),
  OnlinePtId: yup.number().transform(parseNullableNumber).nullable(),
  HealthId: yup.string().nullable(),
  HealthIdNumber: yup.string().nullable(),

  LandlineNo: yup.string().nullable(),
  BirthPlace: yup.string().nullable(),
  Religion: yup.string().nullable(),
  RelationPhone: yup.string().nullable(),
  RelationAge: yup.string().nullable(),
  RelationGender: yup.string().nullable(),
  EMG_FirstName: yup.string().nullable(),
  EMG_LastName: yup.string().nullable(),
  EMG_Relation: yup.string().nullable(),
  EMG_MobileNo: yup.string().nullable(),
  EMG_ResidentNo: yup.string().nullable(),
  EMG_Address: yup.string().nullable(),

  IsInternational: yup.number().transform(parseNullableNumber).nullable(),
  Locality: yup.string().nullable(),
  PassportNumber: yup.string().nullable(),
  InternationalNo: yup.string().nullable(),
  MembershipNo: yup.string().nullable(),
  PatientType: yup.string().nullable(),
  IdentityMark: yup.string().nullable(),
  IdentityMark2: yup.string().nullable(),
  ReferenceType: yup.string().nullable(),
  Remarks: yup.string().nullable(),

  // extra fields
  ipdNumber: yup.string().nullable(),
  Pincode: yup
    .string()
    .nullable()
    .test("pincode-format", "Pincode must be 6 digits", value => !value || /^\d{6}$/.test(value)),
  UniqueId: yup.string().nullable(),
  UhidOrBarcode: yup.string().nullable(),
});

export type PatientRegistrationFormItem = InferType<typeof patientRegistrationSchema>;

export const defaultPatientRegistrationValues: PatientRegistrationFormItem = {
  PatientId: 0,
  BranchId: 1,
  Title: "",
  FirstName: "",
  MiddleName: "",
  LastName: "",
  AgeYears: 0,
  AgeMonths: 0,
  AgeDays: 0,
  Dob: "",
  Gender: "",
  MaritalStatus: "",
  Relation: "",
  RelativeName: "",
  IdProofName: "",
  IdProofNumber: "",
  SelfContactNumber: "",
  EmergencyContactNumber: "",
  Email: "",
  PrivilegedCardNumber: "",
  Address: "",
  CountryId: 0,
  Country: "",
  StateId: 0,
  State: "",
  DistrictId: 0,
  District: "",
  CityId: 0,
  City: "",
  InsuranceCompanyId: 0,
  CorporateId: 0,
  CardNo: "",
  PatientImageFile: "",
  IsVaccination: 0,
  VipPatient: "",
  PolicyNo: "",
  PolicyCardNo: "",
  ExpiryDate: "",
  CardHolder: "",
  ReferalNo: "",
  ReferalDate: "",

  OnlinePtId: 0,
  HealthId: "",
  HealthIdNumber: "",
  LandlineNo: "",
  BirthPlace: "",
  Religion: "",
  RelationPhone: "",
  RelationAge: "",
  RelationGender: "",
  EMG_FirstName: "",
  EMG_LastName: "",
  EMG_Relation: "",
  EMG_MobileNo: "",
  EMG_ResidentNo: "",
  EMG_Address: "",
  IsInternational: 0,
  Locality: "",
  PassportNumber: "",
  InternationalNo: "",
  MembershipNo: "",
  PatientType: "",
  IdentityMark: "",
  IdentityMark2: "",
  ReferenceType: "",
  Remarks: "",

  // extra input fields
  ipdNumber: "",
  Pincode: "",
  UniqueId: "",
  UhidOrBarcode: "",
};

/*
 "patientId": 1,
      "branchId": 1,
      "uhid": "GS//00000001",
      "title": "MR.",
      "firstName": "SAJAN",
      "middleName": null,
      "lastName": null,
      "patientName": "MR. SAJAN",
      "ageYears": 0,
      "ageMonths": 0,
      "ageDays": 0,
      "age": "0Y 0M 0D",
      "dob": "11-02-2026",
      "gender": "MALE",
      "maritalStatus": "STRING",
      "relation": "STRING",
      "relativeName": "STRING",
      "idProofName": "string",
      "idProofNumber": "string",
      "contactNumber": "7263533101",
      "emergencyContactNumber": "string",
      "email": "user@example.com",
      "privilegedCardNumber": "string",
      "address": "STRING",
      "countryId": 0,
      "country": "STRING",
      "stateId": 0,
      "state": "STRING",
      "districtId": 0,
      "district": "STRING",
      "cityId": 0,
      "city": "STRING",
      "insuranceCompanyId": 0,
      "corporateId": 0,
      "cardNo": "string",
      "isVaccination": 0,
      "vipPatient": 0,
      "patientImagePath": "",
      "policyNo": "string",
      "policyCardNo": "string",
      "expiryDate": "string",
      "cardHolder": "string",
      "referalNo": "string",
      "referalDate": "string",
      "landlineNo": null,
      "birthPlace": null,
      "religion": null,
      "relationPhone": null,
      "relationAge": null,
      "relationGender": null,
      "emG_FirstName": null,
      "emG_LastName": null,
      "emG_Relation": null,
      "emG_MobileNo": null,
      "emG_ResidentNo": null,
      "emG_Address": null,
      "isInternational": null,
      "locality": null,
      "passportNumber": null,
      "internationalNo": null,
      "membershipNo": null,
      "patientType": null,
      "identityMark": null,
      "identityMark2": null,
      "referenceType": null,
      "remarks": null,
      "doctorId": 0,
      "ipdNo": 0,
      "dayCareNo": 0,
      "dialysisNo": 0,
      "emergencyNo": 0 */
