import * as yup from "yup";

export const roleMasterSchema = yup.object().shape({
  roleName: yup.string().required("Role name is required"),
  isActive: yup.string().required("Status is required"),
  faIconId: yup.string().required("Icon selection is required"),
  roleId: yup.string().nullable(),
});
