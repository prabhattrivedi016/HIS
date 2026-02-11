import * as yup from "yup";

const doctorMasterSchema = yup.object({
  DoctorId: yup.number().nullable(),

  Title: yup.string().required("Title is required"),
  Name: yup.string().trim().required("Doctor Name is required"),
  Gender: yup.string().required("Gender is required"),
  Dob: yup.string().required("DOB is required"),

  ContactNo: yup
    .string()
    .required("Contact is required")
    .matches(/^\d{10}$/, "Contact number must be exactly 10 digits"),

  EmailId: yup.string().email("Invalid email").nullable(),
  Address: yup.string().nullable(),

  SpecializationId: yup
    .number()
    .typeError("Specialization is required")
    .moreThan(0, "Specialization is required"),

  DepartmentId: yup
    .number()
    .typeError("Department is required")
    .moreThan(0, "Department is required"),

  Specialization: yup.string().required("Specialization is required"),
  Department: yup.string().required("Department is required"),

  ProfileSummery: yup.string().required("Profile Summary is required"),
  RegistrationNo: yup.string().nullable(),

  IsActive: yup.number().required(),

  BranchList: yup.string().required("Please select at least one branch"),

  RoomNo: yup.string().nullable(),
  CanApproveLabReport: yup.number().nullable(),
  CanApproveDischargeSummary: yup.number().nullable(),

  DoctorPhotoFile: yup.mixed().nullable(),

  IsLogin: yup.number().oneOf([0, 1]).required(),

  UserName: yup.string().when("IsLogin", {
    is: 1,
    then: s => s.required("User name is required"),
    otherwise: s => s.strip(),
  }),

  Password: yup.string().when("IsLogin", {
    is: 1,
    then: s => s.required("Password is required").min(6),
    otherwise: s => s.strip(),
  }),

  ConfirmPassword: yup.string().when("IsLogin", {
    is: 1,
    then: s =>
      s
        .required("Confirm password is required")
        .oneOf([yup.ref("Password")], "Passwords must match"),
    otherwise: s => s.strip(),
  }),
});

export default doctorMasterSchema;
