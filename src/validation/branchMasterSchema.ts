import * as Yup from "yup";

export const branchMasterSchema = Yup.object().shape({
  branchId: Yup.number().nullable(),
  branchName: Yup.string().trim().required("Branch Name is required"),
  branchCode: Yup.string().trim().required("Branch Code is required"),
  email: Yup.string().trim().required("Email is required"),
  contactNo1: Yup.string().trim().required("Contact is required"),
  contactNo2: Yup.string().trim().nullable(),
  address: Yup.string().trim().nullable(),
  isActive: Yup.number().required("Status is required"),
  fyStartFrom: Yup.string().trim().required("Month is required"),
  defaultCountryId: Yup.number().nullable(),
  defaultStateId: Yup.number().nullable(),
  defaultDistrictId: Yup.number().nullable(),
  defaultCityId: Yup.number().nullable(),
  defaultInsuranceCompanyId: Yup.number().nullable(),
  defaultCorporateId: Yup.number().nullable(),
});
