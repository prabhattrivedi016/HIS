import * as yup from "yup";

export const bankMasterSchema = yup.object().shape({
  bankId: yup.number().nullable(),
  bankName: yup.string().required("Bank name is required"),
  isActive: yup.number().required("Status is required"),
});

export const bankDetailsSchema = yup.object().shape({
  bankId: yup.number().nullable(),
  payeeName: yup.string().required("Payee name is required"),
  panNumber: yup
    .string()
    .required("Pan number is required")
    .min(10, "PAN must be of 10 digits")
    .max(10, "PAN must be of 10 digits"),
  bankName: yup.string().required("Bank name is required"),
  bankAccountNumber: yup.string().required("Bank account is required"),
  bankAddress: yup.string().required("Bank address is required"),
  ifscCode: yup.string().required("IFSC is required"),
  pinCode: yup
    .string()
    .required("PIN is required")
    .matches(/^\d+$/, "Only numbers allowed")
    .min(6, "PIN must be of 6 digits")
    .max(6, "PIN must be of 6 digits"),
  tinNumber: yup.string().required("TIN is required"),
  isActive: yup.number().required("Status is required"),
});
