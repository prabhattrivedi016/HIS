import { OPRefundPaymentItem } from "../types";

export const shouldShowCollectPaymentButton = (item?: OPRefundPaymentItem | null) => !!item;

export const shouldShowCancelPaymentButton = (item?: OPRefundPaymentItem | null) => !!item;

export const isCollectPaymentButtonDisabled = (item?: OPRefundPaymentItem | null) =>
  !item ||
  item.IsCancel === 1 ||
  item.IsRefundCollected === 1 ||
  Number(item.IsRefundApproved ?? 0) !== 1;

export const isCancelPaymentButtonDisabled = (item?: OPRefundPaymentItem | null) =>
  !item || item.IsCancel === 1 || item.IsRefundCollected === 1;

export const handleCollectPaymentButtonClick = (
  item: OPRefundPaymentItem,
  onCollectPayment: (selected: OPRefundPaymentItem) => void
) => {
  if (isCollectPaymentButtonDisabled(item)) return;
  onCollectPayment(item);
};

export const handleCancelPaymentButtonClick = (
  item: OPRefundPaymentItem,
  onCancel: (selected: OPRefundPaymentItem) => void
) => {
  if (isCancelPaymentButtonDisabled(item)) return;
  onCancel(item);
};

export const getOpRefundPaymentItemById = (
  rawItemMap: Record<number, OPRefundPaymentItem>,
  id?: number | null
) => (id ? (rawItemMap[id] ?? null) : null);
