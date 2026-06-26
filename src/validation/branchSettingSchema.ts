import * as yup from "yup";

export const branchSettingSchema = yup.object().shape({
  branchId: yup.number().required("Branch is required").min(1, "Branch is required"),
  defaultCountryId: yup.number().required("Country is required").min(1, "Country is required"),
  defaultStateId: yup.number().required("State is required").min(1, "State is required"),
  defaultDistrictId: yup.number().required("District is required").min(1, "District is required"),
  defaultCityId: yup.number().required("City is required").min(1, "City is required"),
  defaultInsuranceCompanyId: yup
    .number()
    .required("Insurance company is required")
    .min(1, "Insurance company is required"),
  defaultCorporateId: yup
    .number()
    .required("Corporate is required")
    .min(1, "Corporate is required"),
});
