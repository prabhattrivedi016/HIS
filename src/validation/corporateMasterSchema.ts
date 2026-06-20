import * as yup from "yup";
import { InferType } from "yup";

export const addNewCorporateTypeSchema = yup.object().shape({
  corporateTypeId: yup.number().nullable(),
  corporateTypeName: yup.string().required("Corporate type name is required"),
});

export const addNewInsuranceSchema = yup.object().shape({
  insuranceCompanyId: yup.number().nullable(),
  insuranceCompanyName: yup.string().required("Insurance company name is required"),
});

export const corporateMasterSchema = yup.object().shape({
  corporateId: yup.number().nullable(),
  corporateName: yup.string().trim().required("Corporate Name is required"),
  insuranceCompanyName: yup.string().nullable(),
  insuranceCompanyId: yup.number().nullable(),
  corporateTypeName: yup.string().nullable(),
  corporateTypeId: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null || originalValue === undefined
        ? 0
        : Number(value)
    )
    .moreThan(0, "Corporate type is required")
    .required("Corporate type is required"),
  paymentTypeId: yup.number().nullable(),
  corporateCode: yup.string().nullable(),
  corporateContact1: yup.string().trim().required("Contact is required"),
  corporateContact2: yup.string().nullable(),
  corporateEmail: yup.string().trim().required("Email is required"),
  corporateAddress1: yup.string().trim().required("Address is required"),
  corporateAddress2: yup.string().nullable(),
  isActive: yup.number().required("Status is required"),
  contractStartFrom: yup.string().required("Start date is required"),
  contractExpiresOn: yup.string().required("Expiry date is required"),
  copaymentPer: yup.number(),
  discountPerOut: yup.number(),
  discountPerIn: yup.number(),
  hikePerOut: yup.number(),
  hikePerIn: yup.number(),
  activePaymentModes: yup
    .string()
    .required("Please select at least one payment ")
    .test(
      "not-empty",
      "Please select at least one payment",
      value => !!value && value.trim() !== ""
    ),
  activeBranches: yup
    .string()
    .required("Please select at least one branch")
    .test(
      "not-empty",
      "Please select at least one branch",
      value => !!value && value.trim() !== ""
    ),
  rateListIdOPD: yup
    .string()
    .required("At least one OPD rate list row is required")
    .test(
      "opd-rate-required",
      "At least one OPD rate list row is required",
      value =>
        (value ?? "")
          .split(",")
          .map(v => Number(v.trim()))
          .filter(v => Number.isFinite(v) && v > 0).length > 0
    ),
  rateListIdIPD: yup
    .string()
    .required("At least one IPD rate list row is required")
    .test(
      "ipd-rate-required",
      "At least one IPD rate list row is required",
      value =>
        (value ?? "")
          .split(",")
          .map(v => Number(v.trim()))
          .filter(v => Number.isFinite(v) && v > 0).length > 0
    ),
});

export type CorporateMasterFormItem = InferType<typeof corporateMasterSchema>;

export type AddNewInsuranceFormItem = InferType<typeof addNewInsuranceSchema>;

export type AddNewCorporateTypeFormItem = InferType<typeof addNewCorporateTypeSchema>;
