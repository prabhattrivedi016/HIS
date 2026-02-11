import * as yup from "yup";

const doctorUnitSchema = yup.object().shape({
  doctorId: yup.number().nullable(),

  name: yup.string().required("Unit Name is required"),

  specializationId: yup
    .number()
    .moreThan(0, "Specialization is required")
    .required("Specialization is required"),

  specialization: yup.string().nullable(),

  departmentId: yup
    .number()
    .moreThan(0, "Department is required")
    .required("Department is required"),

  department: yup.string().nullable(),

  isActive: yup.number().required("Status is required"),

  branchId: yup.string().required("Please select at least one branch"),

  doctorMappings: yup
    .array()
    .of(
      yup.object().shape({
        doctorId: yup.number().required().moreThan(0),
      })
    )
    .min(1, "Please select at least one doctor")
    .required("Please select at least one doctor"),
});

export default doctorUnitSchema;
