import * as yup from "yup";

export const opdMasterReferDoctorSchema = yup.object().shape({
  referDoctorId: yup.number().nullable(),
  title: yup.string().required("Title is required"),
  name: yup.string().required("Doctor Name is required"),
  doctorContacNo: yup.string().required("Contact is required"),
  clinicName: yup.string().nullable(),
  address: yup.string().nullable(),
  proId: yup.number().nullable(),
  active: yup.number().nullable(),
});

export type opdMasterReferDoctorFormItem = yup.InferType<typeof opdMasterReferDoctorSchema>;

export const opdBillingSaveSchema = yup.object().shape({
  insuranceCompanyId: yup
    .number()
    .typeError("Insurance company is required")
    .moreThan(0, "Insurance company is required")
    .required("Insurance company is required"),
  corporateId: yup
    .number()
    .typeError("Corporate is required")
    .moreThan(0, "Corporate is required")
    .required("Corporate is required"),
  doctorId: yup
    .number()
    .typeError("Doctor is required")
    .moreThan(0, "Doctor is required")
    .required("Doctor is required"),
  serviceCount: yup
    .number()
    .typeError("Please add at least one service")
    .min(1, "Please add at least one service")
    .required("Please add at least one service"),
});

export const opdBillingVisitDetailsSchema = yup.object().shape({
  patientId: yup.number().nullable(),
  uhid: yup.string().nullable(),
  branchId: yup.number().nullable(),
  currentAge: yup.string().nullable(),
  insuranceCompanyId: yup.number().nullable(),
  corporateId: yup.number().nullable(),
  referDoctorId: yup.number().nullable(),
  uniqueId: yup.string().nullable(),
  mlc: yup.string().nullable(),
  pi: yup.string().nullable(),
  remark: yup.string().nullable(),
  policyNo: yup.string().nullable(),
  policyCardNo: yup.string().nullable(),
  expiryDate: yup.string().nullable(),
  cardHolder: yup.string().nullable(),
  referalNo: yup.string().nullable(),
  referalDate: yup.string().nullable(),
  diagnosisId: yup.string().nullable(),
  proId: yup.string().nullable(),
  proName: yup.string().nullable(),
  isSendMRD: yup.string().nullable(),
});

export type opdBillingVisitFormData = yup.InferType<typeof opdBillingVisitDetailsSchema>;

export const resetVisitDetailsFormData = () => ({
  patientId: 0,
  uhid: "",
  branchId: 0,
  currentAge: "",
  insuranceCompanyId: 0,
  corporateId: 0,
  referDoctorId: 0,
  uniqueId: "",
  mlc: "",
  pi: "",
  remark: "",
  policyNo: "",
  policyCardNo: "",
  expiryDate: "",
  cardHolder: "",
  referalNo: "",
  referalDate: "",
  diagnosisId: 0,
  proId: 0,
  proName: "",
  isSendMRD: 0,
});
