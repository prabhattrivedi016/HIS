import * as Yup from "yup";

export const mobileOtpSchema = Yup.object({
  otp: Yup.string().required("Mobile OTP is required"),
});

export const emailOtpSchema = Yup.object({
  otp: Yup.string().required("Email OTP is required"),
});
