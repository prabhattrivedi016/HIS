import * as yup from "yup";
import { InferType } from "yup";

export const normalDischargeDetailsSchema = yup.object().shape({
  conditionAtDischarge: yup.string().required("Condition at discharge is required"),
  followUpDate: yup.string().nullable(),
  followUpDepartmentId: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? undefined : value))
    .min(1, "Follow up department is required")
    .required("Follow up department is required"),
  followUpDoctorId: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? undefined : value))
    .min(1, "Follow up doctor is required")
    .required("Follow up doctor is required"),
  dischargeAdvice: yup.string().nullable(),
});

export type NormalDischargeDetailsFormData = InferType<typeof normalDischargeDetailsSchema>;

export const lamaDamaDischargeDetailsSchema = yup.object().shape({
  reason: yup.string().required("Reason is required"),

  isRiskExplained: yup
    .boolean()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue === undefined) {
        return undefined;
      }

      return value;
    })
    .required("Risk explained is required"),

  declarationText: yup.string().required("Declaration text is required"),

  counsellingByDoctorId: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === 0 ? undefined : value
    )
    .nullable(),

  relativeName: yup.string().required("Relative name is required"),

  relationship: yup.string().required("Relationship is required"),

  signatureFilePath: yup.string().nullable(),
});

export type LamaDamaDischargeDetailsFormData = InferType<typeof lamaDamaDischargeDetailsSchema>;

/*"reason": "string",
    "isRiskExplained": true,
    "declarationText": "string",
    "counsellingByDoctorId": 0,
    "relativeName": "string",
    "relationship": "string",
    "signatureFilePath": "string",
    "isOtpVerified": true,
    "otpVerifiedOn": "string" */

export const referralDischargeDetailsSchema = yup.object().shape({
  transferHospitalName: yup.string().required("Transfer hospital name is required"),

  transferReason: yup.string().required("Transfer reason is required"),

  conditionAtTransfer: yup.string().required("Condition at transfer is required"),

  isAmbulanceRequired: yup
    .boolean()
    .transform((value, originalValue) => (originalValue === "" ? undefined : value))
    .required("Ambulance required is required"),

  // Optional
  accompanyingStaffUserId: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" || originalValue === 0 ? 0 : value))
    .nullable(),

  // Optional
  referralLetterFilePath: yup.string().nullable(),
});

export type ReferralDischargeDetailsFormData = InferType<typeof referralDischargeDetailsSchema>;

export const deathDischargeDetailsSchema = yup.object().shape({
  dateOfDeath: yup.string().required("Date of death is required"),
  timeOfDeath: yup.string().required("Death of time is required"),
  causeOfDeath: yup.string().nullable(),
  certificateStatus: yup.string().nullable(),
  bodyHandoverDetails: yup.string().nullable(),
  relativeName: yup.string().required("Relative name is requierd"),
  relationship: yup.string().required("Relationship is required"),
  contactNumber: yup
    .string()
    .matches(/^\d{10}$/, "Contact number must be exactly 10 digits")
    .nullable(),
  deathSummary: yup.string().required("Death summary is required"),
});

export type DeathDischargeDetailsFormData = InferType<typeof deathDischargeDetailsSchema>;

export const abscondedDischargeDetailsSchema = yup.object().shape({
  lastSeenDate: yup.string().required("Date of death is required"),
  lastSeenTime: yup.string().required("Death of time is required"),
  circumstances: yup.string().required("Circumstances is required"),
  isStaffInformed: yup.boolean().required("Is staff informed is required"),
  isPoliceInformed: yup.boolean().required("Is police informed is required"),
  remarks: yup.string().required("Remarks is required"),
  firNo: yup.string().nullable(),
});

export type AbscondedDischargeDetailsFormData = InferType<typeof abscondedDischargeDetailsSchema>;
