import * as yup from "yup";

export const changePasswordSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  gender: yup.string().required("Gender is required"),
  dob: yup.string().required("DOB is required"),
  contactNo: yup.string().required("Contact No is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  userName: yup.string().required("User Name is required"),

  currentPassword: yup.string().required("Current password is required"),

  newPassword: yup
    .string()
    .required("New password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(/[@$!%*?&]/, "Password must contain at least one special character"),

  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref("newPassword"), null], "Passwords must match")
    .required("Confirm password is required"),
});
