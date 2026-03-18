import * as yup from "yup";

export const referLabMasterSchema = yup.object().shape({
  outSourceLabId: yup.number().nullable(),
  outSourceLab: yup.string().required("Refer lab name is required"),
  contactPerson: yup.string().nullable(),
  contactNumber: yup.string().nullable(),
  address: yup.string().nullable(),
  isActive: yup.number().required("Status is required"),
  branchId: yup.number().required("Branch is required"),
});

export type ReferLabMasterFormItem = yup.InferType<typeof referLabMasterSchema>;
