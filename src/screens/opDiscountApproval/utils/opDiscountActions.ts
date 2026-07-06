import { showWarning } from "@/utils/alert";
import { OPDiscountItem } from "../types";

export const canShowSendForApproval = (item?: OPDiscountItem | null) =>
  !!item &&
  item.IsCancel !== 1 &&
  (!item.IsLevel1Approve ||
    !item.IsLevel2Approve ||
    !item.IsLevel3Approve ||
    !item.IsLevel4Approve) &&
  item.FlagId === 0 &&
  item.CanApprove === 0;

export const canShowApprove = (item?: OPDiscountItem | null) =>
  !!item && item.IsCancel !== 1 && item.CanApprove === 1 && item.FlagId === 1;

export const canShowCancel = (item?: OPDiscountItem | null) => !!item && item.IsCancel !== 1;

export const shouldShowApproveButton = (item?: OPDiscountItem | null) => !!item;

export const shouldShowCancelButton = (item?: OPDiscountItem | null) => !!item;

export const isApproveButtonDisabled = (item?: OPDiscountItem | null) => {
  if (!item || item.IsCancel === 1) return true;
  if (item.IsPaymentCollected === 1) return true;
  if (item.IsDiscountApproved === 1) return true;
  if (item.FlagId === 0 && item.CanApprove === 0) return true;
  return !canShowApprove(item);
};

export const isCancelButtonDisabled = (item?: OPDiscountItem | null) => {
  if (!item || item.IsCancel === 1) return true;
  if (item.IsPaymentCollected === 1) return true;
  return false;
};

export const getApproveDisabledWarning = (item?: OPDiscountItem | null): string | null => {
  if (!item) return null;

  if (item.IsDiscountApproved === 1 && item.FlagId === 0) {
    return "Please set discount authority from approval authority master";
  }

  if (item.FlagId === 0 && item.CanApprove === 0) {
    return "You may have not rights to approve";
  }

  return null;
};

export const handleApproveButtonClick = (
  item: OPDiscountItem,
  onApprove: (selected: OPDiscountItem) => void
) => {
  const warning = getApproveDisabledWarning(item);
  if (warning) {
    showWarning(warning);
    return;
  }

  if (isApproveButtonDisabled(item)) {
    return;
  }

  if (canShowApprove(item)) {
    onApprove(item);
  }
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
