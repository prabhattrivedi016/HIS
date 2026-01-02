import * as Yup from "yup";
import { contactRegex, emailRegex, passwordRegex } from "../constants/regex";

const signupSchema = Yup.object().shape({
  firstName: Yup.string().trim().required("First Name is required"),
  middleName: Yup.string().nullable(),
  lastName: Yup.string().nullable(),
  gender: Yup.string()
    .required("Please select a gender")
    .notOneOf(["Select"], "Please select a gender"),
  email: Yup.string()
    .trim()
    .matches(emailRegex, "Enter a valid email")
    .required("Email is required"),
  dob: Yup.string()
    .required("Date of Birth is required")
    .test("valid-date", "Invalid date", value => {
      return value ? !isNaN(new Date(value).getTime()) : false;
    }),

  contact: Yup.string()
    .matches(contactRegex, "Enter a valid 10-digit contact number")
    .required("Contact is required"),
  address: Yup.string().trim().required("Address is required"),
  userName: Yup.string().trim().required("Username is required"),
  password: Yup.string()
    .matches(passwordRegex, "Password must be 6–15 chars, include an uppercase & special character")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .required("Confirm Password is required")
    .oneOf([Yup.ref("password")], "Passwords do not match"),
});

export default signupSchema;
