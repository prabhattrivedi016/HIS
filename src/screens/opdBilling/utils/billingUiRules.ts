export const isDiscountRequestButtonMode = (
  isSeparateCollectionCounterEnabled: number,
  isDiscountApprovalRequired: number
) => isSeparateCollectionCounterEnabled === 0 && isDiscountApprovalRequired === 1;

export const shouldShowOpdPaymentMode = ({
  showPaymentMode,
  isSeparateCollectionCounterEnabled,
  isDiscountApprovalRequired,
  hasDiscountApplied,
}: {
  showPaymentMode: boolean;
  isSeparateCollectionCounterEnabled: number;
  isDiscountApprovalRequired: number;
  hasDiscountApplied: boolean;
}) =>
  showPaymentMode ||
  (isSeparateCollectionCounterEnabled === 0 && isDiscountApprovalRequired === 0) ||
  (isDiscountRequestButtonMode(isSeparateCollectionCounterEnabled, isDiscountApprovalRequired) &&
    !hasDiscountApplied);
