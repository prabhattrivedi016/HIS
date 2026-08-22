import { CorporateTransferConfirmationItem } from "../types";

export const canShowCancel = (_item?: CorporateTransferConfirmationItem | null) => true;
export const shouldShowConfirmButton = (_item?: CorporateTransferConfirmationItem | null) => true;
export const shouldShowCancelButton = (_item?: CorporateTransferConfirmationItem | null) => true;

export const isConfirmButtonDisabled = (item?: CorporateTransferConfirmationItem | null) => {
  if (!item) return false;

  return (
    Number(item.IsCancel) === 1 ||
    Number(item?.IsCorporateTransferApproved) === 0 ||
    Number(item?.IsCorporateTransferCreated) === 1
  );
};

export const isCancelButtonDisabled = (item?: CorporateTransferConfirmationItem | null) => {
  if (!item) return false;
  return Number(item.IsCancel) === 1 || Number(item.IsCorporateTransferCreated) === 1;
};

export const getConfirmDisabledWarning = (
  item?: CorporateTransferConfirmationItem | null
): string | null => {
  if (!item) return null;
  if (Number(item.IsCancel) === 1) return "Corporate transfer is cancelled.";
  if (item.Status?.toLowerCase().includes("created")) return "Corporate transfer is created.";
  if (Number(item.IsCorporateTransferApproved) !== 1)
    return "Corporate transfer is not approved yet.";
  if (
    item.Status?.toLowerCase().includes("transferred") ||
    item.Status?.toLowerCase().includes("confirmed")
  )
    return "Corporate transfer is already confirmed.";
  return null;
};

export const handleConfirmButtonClick = (
  item: CorporateTransferConfirmationItem,
  onConfirm: (selected: CorporateTransferConfirmationItem) => void
) => {
  if (isConfirmButtonDisabled(item)) return;
  onConfirm(item);
};

export const handleCancelButtonClick = (
  item: CorporateTransferConfirmationItem,
  onCancel: (selected: CorporateTransferConfirmationItem) => void
) => {
  if (isCancelButtonDisabled(item)) return;
  onCancel(item);
};

export const getCorporateTransferItemById = (
  rawItemMap: Record<number, CorporateTransferConfirmationItem>,
  id?: number | null
) => (id ? (rawItemMap[id] ?? null) : null);
