import * as yup from "yup";

export const userDepartmentSchema = yup.object().shape({
  id: yup.number().nullable(),
  departmentName: yup.string().required("User Department is required!"),
  isActive: yup.number().required("Status is required"),
});
