import * as Yup from "yup";

export const mobileOtp = Yup.object({
  userId: Yup.string().required("User ID is required"),
  otp: Yup.string().required("Mobile OTP is required"),
});

export const emailOtp = Yup.object({
  userId: Yup.string().required("User ID is required"),
  otp: Yup.string().required("Email OTP is required"),
});
