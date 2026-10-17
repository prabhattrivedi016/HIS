import { OtBookingDetailsItem } from "../types";

export const isBookingCancelled = (item: OtBookingDetailsItem) => item?.IsCancel === 1;
export const isBookingConfirmed = (item: OtBookingDetailsItem) => item?.IsConfirm === 1;

export const shouldShowConfirmButton = (item?: OtBookingDetailsItem | null) => !!item;
export const shouldShowRescheduleButton = (item?: OtBookingDetailsItem | null) => !!item;
export const shouldShowCancelButton = (item?: OtBookingDetailsItem | null) => !!item;

export const isConfirmButtonDisabled = (item?: OtBookingDetailsItem | null) => {
  if (!item) return true;
  return isBookingCancelled(item) || isBookingConfirmed(item);
};

export const isRescheduleButtonDisabled = (item?: OtBookingDetailsItem | null) => {
  if (!item) return true;
  return isBookingCancelled(item) || isBookingConfirmed(item);
};

export const isCancelButtonDisabled = (item?: OtBookingDetailsItem | null) => {
  if (!item) return true;
  return isBookingCancelled(item) || isBookingConfirmed(item);
};

export const handleConfirmButtonClick = (
  item: OtBookingDetailsItem,
  onConfirm: (selected: OtBookingDetailsItem) => void
) => {
  if (isConfirmButtonDisabled(item)) return;
  onConfirm(item);
};

export const handleRescheduleButtonClick = (
  item: OtBookingDetailsItem,
  onReschedule: (selected: OtBookingDetailsItem) => void
) => {
  if (isRescheduleButtonDisabled(item)) return;
  onReschedule(item);
};

export const handleCancelButtonClick = (
  item: OtBookingDetailsItem,
  onCancel: (selected: OtBookingDetailsItem) => void
) => {
  if (isCancelButtonDisabled(item)) return;
  onCancel(item);
};

export const getOpDiscountItemById = (
  rawItemMap: Record<number, OtBookingDetailsItem>,
  id?: number | null
) => (id ? (rawItemMap[id] ?? rawItemMap[Number(id)] ?? null) : null);
