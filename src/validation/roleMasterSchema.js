import * as yup from "yup";

export const roleMasterSchema = yup.object().shape({
  roleName: yup.string().required("Role name is required"),
  isActive: yup.string().required("Status is required"),
  faIconId: yup.string().nullable(),
  roleId: yup.string().nullable(),
  imagePath: yup.string().required("Role Icon is required"),
});
