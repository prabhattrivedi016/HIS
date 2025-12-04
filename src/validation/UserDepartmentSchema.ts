import * as yup from "yup";

export const userDepartmentSchema = yup.object().shape({
  id: yup.string().nullable(),
  departmentName: yup.string().required("User Department is required!"),
  isActive: yup.string().required("Status is required"),
});
