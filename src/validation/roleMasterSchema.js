import * as Yup from "yup";

//role name ,active & inActive ,select option
export const roleMasterSchema = Yup.object().shape({
  roleId: Yup.string().trim().nullable,
  roleName: Yup.string().trim().required("Role Name is required"),
  isActive: Yup.string().trim().nullable,
  mappingBranch: Yup.string().nullable(),
});
