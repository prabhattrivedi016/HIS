import * as Yup from "yup";
import { contactRegex, passwordRegex } from "../constants/regex";

const userMasterSchema = Yup.object().shape({
  firstName: Yup.string().trim().required("First Name is required"),
  middleName: Yup.string().nullable(),
  lastName: Yup.string().nullable(),
  gender: Yup.string()
    .required("Please select a gender")
    .notOneOf(["Select"], "Please select a gender"),

  dob: Yup.date().required("Date of Birth is required").typeError("Enter a valid date"),
  contact: Yup.string()
    .matches(contactRegex, "Enter a valid 10-digit contact number")
    .required("Contact is required"),
  address: Yup.string().trim().required("address is required"),
  pasword: Yup.string()
    .matches(passwordRegex, "Password must be 6-15 chars, include an uppercase & special character")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .required("Confirm Password is required")
    .oneOf([Yup.ref("password")], "Password do not match"),
});

export default userMasterSchema;
