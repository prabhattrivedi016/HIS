import * as Yup from "yup";
import { contactRegex, passwordRegex } from "../constants/regex";

//userName & Mobile schema
export const userNameAndMobileSchema = Yup.object().shape({
  userName: Yup.string().trim().required("User Name is required"),

  contact: Yup.string()
    .required("Mobile Number is required")
    .matches(contactRegex, "Enter a valid 10 digit contact number"),
});

export const otpSchema = Yup.object().shape({
  otp: Yup.string().required("Otp is required"),
  userId: Yup.string().nullable(), // not required, but allowed
});

//reset password schema
export const resetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .required("New Password is required")
    .matches(
      passwordRegex,
      "Password must be 6–15 chars, include an uppercase & special character"
    ),

  confirmPassword: Yup.string()
    .required("Confirm Password is required")
    .oneOf([Yup.ref("newPassword")], "Passwords do not match"),

  userId: Yup.string().nullable(),
  otp: Yup.string().nullable(),
});
