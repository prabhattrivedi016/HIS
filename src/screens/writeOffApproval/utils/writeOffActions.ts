import { WriteOffApprovalItem } from "../types";

export const canShowCancel = (_item?: WriteOffApprovalItem | null) => true;

export const shouldShowApproveButton = (_item?: WriteOffApprovalItem | null) => true;

export const shouldShowCancelButton = (_item?: WriteOffApprovalItem | null) => true;

export const isApproveButtonDisabled = (item?: WriteOffApprovalItem | null) => {
  if (!item) return false;
  return Number(item.IsWriteOffApproved) === 1 || Number(item.IsCancel) === 1;
};

export const isCancelButtonDisabled = (item?: WriteOffApprovalItem | null) => {
  if (!item) return false;
  return Number(item.IsCancel) === 1;
};

export const getApproveDisabledWarning = (item?: WriteOffApprovalItem | null): string | null => {
  if (!item) return null;
  if (Number(item.IsWriteOffApproved) === 1) return "Write off is already approved.";
  if (Number(item.IsCancel) === 1) return "Write off is already cancelled.";
  return null;
};

export const handleApproveButtonClick = (
  item: WriteOffApprovalItem,
  onApprove: (selected: WriteOffApprovalItem) => void
) => {
  if (isApproveButtonDisabled(item)) return;
  onApprove(item);
};

export const handleCancelButtonClick = (
  item: WriteOffApprovalItem,
  onCancel: (selected: WriteOffApprovalItem) => void
) => {
  if (isCancelButtonDisabled(item)) return;
  onCancel(item);
};

export const getWriteOffApprovalItemById = (
  rawItemMap: Record<number, WriteOffApprovalItem>,
  id?: number | null
) => (id ? (rawItemMap[id] ?? null) : null);
