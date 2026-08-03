import { showWarning } from "@/utils/alert";

import { OPDiscountItem } from "../types";

const isBookingCancelled = (item: OPDiscountItem) => item.IsCancel === 1;

const isPaymentCollected = (item: OPDiscountItem) => item.IsPaymentCollected === 1;

const isDiscountApproved = (item: OPDiscountItem) => item.IsDiscountApproved === 1;

const canApproveDiscount = (item: OPDiscountItem) => item.CanApprove === 0;

export const canShowCancel = (item?: OPDiscountItem | null) => !!item && item.IsCancel !== 1;

export const shouldShowApproveButton = (item?: OPDiscountItem | null) => !!item;

export const shouldShowCancelButton = (item?: OPDiscountItem | null) => !!item;

export const isApproveButtonDisabled = (item?: OPDiscountItem | null) => {
  if (!item) return true;

  return (
    isBookingCancelled(item) ||
    isPaymentCollected(item) ||
    isDiscountApproved(item) ||
    canApproveDiscount(item)
  );
};

export const isCancelButtonDisabled = (item?: OPDiscountItem | null) => {
  if (!item) return true;

  return isBookingCancelled(item) || isPaymentCollected(item);
};

export const getApproveDisabledWarning = (item?: OPDiscountItem | null): string | null => {
  if (!item) return null;

  if (item.CanApprove === 0 && item.FlagId === 0) {
    return "Please set discount authority from approval authority master";
  }

  if (item.FlagId > 0 && item.CanApprove === 0) {
    return "You may have not rights to approve";
  }

  return null;
};

export const handleApproveButtonClick = (
  item: OPDiscountItem,

  onApprove: (selected: OPDiscountItem) => void
) => {
  if (isApproveButtonDisabled(item)) {
    return;
  }

  const warning = getApproveDisabledWarning(item);

  if (warning) {
    showWarning(warning);

    return;
  }

  onApprove(item);
};

export const handleCancelButtonClick = (
  item: OPDiscountItem,

  onCancel: (selected: OPDiscountItem) => void
) => {
  if (isCancelButtonDisabled(item)) return;

  onCancel(item);
};

export const getOpDiscountItemById = (
  rawItemMap: Record<number, OPDiscountItem>,

  id?: number | null
) => (id ? (rawItemMap[id] ?? null) : null);
