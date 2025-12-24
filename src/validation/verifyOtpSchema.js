import * as Yup from "yup";

export const mobileOtpSchema = Yup.object({
  otp: Yup.string()
    .required("Mobile OTP is required")
    .matches(/^\d{6}$/, "OTP must be exactly 6 digits"),
});

export const emailOtpSchema = Yup.object({
  otp: Yup.string()
    .required("Email OTP is required")
    .matches(/^\d{6}$/, "OTP must be exactly 6 digits"),
});
