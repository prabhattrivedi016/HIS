import * as Yup from "yup";

export const branchMasterSchema = Yup.object().shape({
  branchId: Yup.number().default(0),
  branchName: Yup.string().trim().required("Branch Name is required"),
  branchCode: Yup.string().trim().required("Branch Code is required"),
  email: Yup.string().trim().required("Email is required"),
  contactNo1: Yup.string().trim().required("Contact is required"),
  contactNo2: Yup.string().trim().default(""),
  address: Yup.string().trim().default(""),
  isActive: Yup.number().required("Status is required"),
  fyStartFrom: Yup.string().required("Financial year start from is required"),
});

export type BranchMasterFormValues = Yup.InferType<typeof branchMasterSchema>;
