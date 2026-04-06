import * as yup from "yup";

export const billingSchema = yup.object().shape({
  grossBillAmount: yup.number().nullable(),
  totalDiscPerOnBill: yup.number().nullable(),
  totalDiscAmtOnBill: yup.number().nullable(),
  roundOff: yup.number().nullable(),
  netAmount: yup.number().nullable(),
  balanceAmount: yup.number().nullable(),

  discApprovedById: yup.number().nullable(),
  discountReason: yup.string().nullable(),
  remarks: yup.string().nullable(),
});
