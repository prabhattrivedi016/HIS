import * as yup from "yup";

export const AMOUNT_REQUIRED_APPROVAL_TYPE_IDS = [3, 4, 8, 10];

const requiredLevelUsers = (level: number, message: string) =>
  yup.string().when("approvalLevelId", {
    is: (approvalLevelId: number) => Number(approvalLevelId) >= level,
    then: schema => schema.test(`level-${level}`, message, value => !!String(value ?? "").trim()),
    otherwise: schema => schema.notRequired(),
  });

export const approvalAuthorityMasterSchema = yup.object({
  id: yup.number().default(0),
  branchId: yup.number().required(),
  approvalFlowId: yup
    .number()
    .required("Approval flow is required")
    .min(1, "Approval flow is required"),
  approvalFlow: yup.string().required("Approval flow is required"),
  isAllApprovalRequired: yup.number().required("Approval required is required"),
  approvalTypeId: yup
    .number()
    .required("Approval type is required")
    .min(1, "Approval type is required"),
  approvalType: yup.string().required("Approval type is required"),
  roleId: yup.number().required("Department is required"),
  approvalLevelId: yup
    .number()
    .required("Approval level is required")
    .min(1, "Approval level is required"),
  approvalLevel: yup.string().required("Approval level is required"),
  level1UserId: requiredLevelUsers(1, "Select at least one level 1 user"),
  level2UserId: requiredLevelUsers(2, "Select at least one level 2 user"),
  level3UserId: requiredLevelUsers(3, "Select at least one level 3 user"),
  level4UserId: requiredLevelUsers(4, "Select at least one level 4 user"),
  amountUpTo: yup.number().when("approvalTypeId", {
    is: (approvalTypeId: number) =>
      AMOUNT_REQUIRED_APPROVAL_TYPE_IDS.includes(Number(approvalTypeId)),
    then: schema =>
      schema
        .typeError("Amount up to is required")
        .required("Amount up to is required")
        .test("is-valid-number", "Amount up to must be a valid number", value => {
          return typeof value === "number" && !Number.isNaN(value);
        })
        .moreThan(0, "Amount up to must be greater than 0"),
    otherwise: schema => schema.notRequired(),
  }),
  isActive: yup.number().required("Status is required"),
});

export type ApprovalAuthorityMasterFormItem = {
  id: number;
  branchId: number;
  approvalFlowId: number;
  approvalFlow: string;
  isAllApprovalRequired: number;
  approvalTypeId: number;
  approvalType: string;
  roleId: number;
  approvalLevelId: number;
  approvalLevel: string;
  level1UserId: string;
  level2UserId: string;
  level3UserId: string;
  level4UserId: string;
  amountUpTo?: number;
  isActive: number;
};
