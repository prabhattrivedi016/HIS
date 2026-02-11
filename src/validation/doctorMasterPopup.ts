import * as yup from "yup";

export const doctorSpecializationSchema = yup.object().shape({
  specializationId: yup.number().nullable(),
  specialization: yup.string().required("Specialization is required"),
  isActive: yup.number().required("Status is required"),
});

export const doctorDepartmentSchema = yup.object().shape({
  departmentId: yup.number().nullable(),

  department: yup.string().required("Department is required"),

  departmentTypeId: yup
    .string()
    .typeError("Department type is required")
    .required("Department type is required"),

  departmentType: yup.string().nullable(),

  isActive: yup.number().required("Status is required"),
});
