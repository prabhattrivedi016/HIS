import { OpdAppointmentConfirmationItem } from "../types";

export const isBookingCancelled = (item: OpdAppointmentConfirmationItem) => item.IsCancel === 1;
export const isBookingConfirmed = (item: OpdAppointmentConfirmationItem) => item.IsConfirm === 1;

export const shouldShowConfirmButton = (item?: OpdAppointmentConfirmationItem | null) => !!item;
export const shouldShowRescheduleButton = (item?: OpdAppointmentConfirmationItem | null) => !!item;
export const shouldShowCancelButton = (item?: OpdAppointmentConfirmationItem | null) => !!item;

export const isConfirmButtonDisabled = (item?: OpdAppointmentConfirmationItem | null) => {
  if (!item) return true;
  return isBookingCancelled(item) || isBookingConfirmed(item);
};

export const isRescheduleButtonDisabled = (item?: OpdAppointmentConfirmationItem | null) => {
  if (!item) return true;
  return isBookingCancelled(item) || isBookingConfirmed(item);
};

export const isCancelButtonDisabled = (item?: OpdAppointmentConfirmationItem | null) => {
  if (!item) return true;
  return isBookingCancelled(item) || isBookingConfirmed(item);
};

export const handleConfirmButtonClick = (
  item: OpdAppointmentConfirmationItem,
  onConfirm: (selected: OpdAppointmentConfirmationItem) => void
) => {
  if (isConfirmButtonDisabled(item)) return;
  onConfirm(item);
};

export const handleRescheduleButtonClick = (
  item: OpdAppointmentConfirmationItem,
  onReschedule: (selected: OpdAppointmentConfirmationItem) => void
) => {
  if (isRescheduleButtonDisabled(item)) return;
  onReschedule(item);
};

export const handleCancelButtonClick = (
  item: OpdAppointmentConfirmationItem,
  onCancel: (selected: OpdAppointmentConfirmationItem) => void
) => {
  if (isCancelButtonDisabled(item)) return;
  onCancel(item);
};

export const getOpDiscountItemById = (
  rawItemMap: Record<number, OpdAppointmentConfirmationItem>,
  id?: number | null
) => (id ? (rawItemMap[id] ?? null) : null);
