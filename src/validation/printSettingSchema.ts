import * as yup from "yup";

export const headerMasterSchema = yup.object().shape({
  headerId: yup.number().nullable(),
  roleId: yup.number().required("Role name is required"),
  branchId: yup.number().required("Branch is required"),
  type: yup.string().nullable(),
  typeId: yup.number().required("Type is required"),
  isHeader: yup.number().nullable(),
  headerBody: yup.string().required("Header body is required"),
  isActive: yup.number().required("Status is required"),
});
