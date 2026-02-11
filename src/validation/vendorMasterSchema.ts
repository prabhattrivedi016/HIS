import * as yup from "yup";

const vendorMasterSchema = yup.object({
  vendorId: yup.number(),

  vendorName: yup.string().required("Vendor name is required"),

  contactNo: yup
    .string()
    .required("Contact number is required")
    .matches(/^\d{10}$/, "Contact number must be 10 digits"),

  email: yup.string().nullable().email("Invalid email"),

  dlno: yup.string().nullable(),

  gstinNo: yup.string().required("GSTIN is required"),

  address: yup.string().nullable(),

  pincode: yup
    .string()
    .required("Pincode is required")
    .matches(/^\d{6}$/, "Pincode must be 6 digits"),

  countryId: yup.number().typeError("Country is required").moreThan(0, "Country is required"),

  stateId: yup.number().typeError("State is required").moreThan(0, "State is required"),

  districtId: yup.number().typeError("District is required").moreThan(0, "District is required"),

  cityId: yup.number().typeError("City is required").moreThan(0, "City is required"),

  typeId: yup.string().typeError("Type is required"),

  type: yup.string().required("Type is required"),

  mappingBranch: yup.string().required("Please select at least one branch"),

  isActive: yup.number().oneOf([0, 1]),
});

export default vendorMasterSchema;
