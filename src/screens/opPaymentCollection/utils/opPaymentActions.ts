import { OPPaymentItem } from "../types";

const getIsDiscountApproved = (item: OPPaymentItem) =>
  Number(
    item.IsDiscountApproved ??
      (item as OPPaymentItem & { isDiscountApproved?: number }).isDiscountApproved ??
      0
  ) === 1;

export const shouldShowCollectPaymentButton = (item?: OPPaymentItem | null) => !!item;

export const shouldShowCancelPaymentButton = (item?: OPPaymentItem | null) => !!item;

export const isCollectPaymentButtonDisabled = (item?: OPPaymentItem | null) =>
  !item || item.IsCancel === 1 || item.IsPaymentCollected === 1 || !getIsDiscountApproved(item);

export const isCancelPaymentButtonDisabled = (item?: OPPaymentItem | null) =>
  !item || item.IsCancel === 1 || item.IsPaymentCollected === 1;

export const handleCollectPaymentButtonClick = (
  item: OPPaymentItem,
  onCollectPayment: (selected: OPPaymentItem) => void
) => {
  if (isCollectPaymentButtonDisabled(item)) return;
  onCollectPayment(item);
};

export const handleCancelPaymentButtonClick = (
  item: OPPaymentItem,
  onCancel: (selected: OPPaymentItem) => void
) => {
  if (isCancelPaymentButtonDisabled(item)) return;
  onCancel(item);
};

export const getOpPaymentItemById = (
  rawItemMap: Record<number, OPPaymentItem>,
  id?: number | null
) => (id ? (rawItemMap[id] ?? null) : null);
