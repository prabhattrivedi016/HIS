import * as yup from "yup";

export const discountApprovalMasterSchema = yup.object().shape({
  discountApprovalId: yup.number().nullable(),
  discountApprovalName: yup.string().required("Discount approval name is required"),
  hmsUserId: yup.number().nullable(),
  isActive: yup.number().required("Status is required"),
  mappingBranch: yup
    .string()
    .trim()
    .test("branch-required", "Please select at least one branch", value => !!value?.length),
  mappingDiscountType: yup
    .string()
    .trim()
    .test(
      "discount-required",
      "Please select at least one discount type",
      value => !!value?.length
    ),
});

export type DiscountApprovalMasterFormItem = yup.InferType<typeof discountApprovalMasterSchema>;
