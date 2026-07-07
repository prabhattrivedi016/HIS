import { BillingValuesItem } from "@/components/BillingDetails/types";
import { OpdBookingDetailsResponse } from "../types";

const pickBookingValue = <T,>(
  source: Record<string, unknown>,
  ...keys: string[]
): T | undefined => {
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null) {
      return value as T;
    }
  }
  return undefined;
};

export const getBookingDiscountPrefillFromDetails = (
  booking?: OpdBookingDetailsResponse | null
): Partial<BillingValuesItem> | null => {
  if (!booking) return null;

  const record = booking as Record<string, unknown>;

  return {
    grossBillAmount: Number(
      pickBookingValue(record, "totalBillAmount", "TotalBillAmount") ?? 0
    ),
    totalDiscPerOnBill: Number(
      pickBookingValue(record, "totalDiscountPerOnBill", "TotalDiscountPerOnBill") ?? 0
    ),
    totalDiscAmtOnBill: Number(
      pickBookingValue(record, "totalDiscountAmountOnBill", "TotalDiscountAmountOnBill") ?? 0
    ),
    roundOff: Number(pickBookingValue(record, "roundOff", "RoundOff") ?? 0),
    netAmount: Number(
      pickBookingValue(record, "totalPatientPayableAmount", "TotalPatientPayableAmount") ?? 0
    ),
    discApprovedById: Number(
      pickBookingValue(
        record,
        "discountApprovedID",
        "DiscountApprovedID",
        "discountApprovedId",
        "DiscountApprovedId"
      ) ?? 0
    ),
    discApprovedName: String(
      pickBookingValue(record, "discountApprovedName", "DiscountApprovedName") ?? ""
    ),
    discountReason: String(
      pickBookingValue(record, "discountReason", "DiscountReason") ?? ""
    ),
    remarks: String(
      pickBookingValue(record, "remark", "Remark", "approvalRemarks", "ApprovalRemarks") ?? ""
    ),
  };
};

export const hasBookingDiscountPrefillData = (
  prefill?: Partial<BillingValuesItem> | null
): boolean =>
  !!prefill &&
  (Number(prefill.totalDiscAmtOnBill) > 0 ||
    Number(prefill.totalDiscPerOnBill) > 0 ||
    Number(prefill.discApprovedById) > 0 ||
    !!String(prefill.discountReason ?? "").trim() ||
    !!String(prefill.remarks ?? "").trim());
