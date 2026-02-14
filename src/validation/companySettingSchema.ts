import * as yup from "yup";

export const companySettingSchema = yup.object().shape({
  hospitalName: yup.string().required("Hospital name is required"),

  hospitalCode: yup.string().required("Hospital code is required"),

  website: yup.string().url("Enter a valid website URL").required("Website is required"),

  email: yup.string().email("Enter a valid email").required("Email is required"),

  contact1: yup.string().required("Contact 1 is required"),

  contact2: yup.string().required("Contact 2 is required"),

  address: yup.string().required("Address is required"),

  hospitalLogo: yup.string().required("Hospital logo is required"),
});
