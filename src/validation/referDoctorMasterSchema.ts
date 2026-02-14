import * as yup from "yup";

export const referDoctorMasterSchema = yup.object().shape({
  referDoctorId: yup.number().nullable(),
  title: yup.string().required("Title is required"),
  name: yup.string().required("Doctor Name is required"),
  doctorContacNo: yup.string().required("Contact is required"),
  clinicName: yup.string().nullable(),
  address: yup.string().nullable(),
  proId: yup.number().required("Pro Name is required").min(1, "Pro Name is required"),
  active: yup.number().required("Status is required"),
});

export const proNamePopupSchema = yup.object().shape({
  proId: yup.number().nullable(),
  proName: yup.string().required("Pro Name is required"),
  contactNo: yup.string().required("Contact is required"),
  isActive: yup.number().required("Status is required"),
});
