import { CorporateTransferApprovalItem } from "../types";

export const isApproveButtonDisabled = (item?: CorporateTransferApprovalItem | null) => {
  if (!item) return false;
  return (
    Number(item.IsCorporateTransferApproved) === 1 ||
    Number(item.IsCancel) === 1 ||
    Number(item.CanApprove) === 0
  );
};

export const isCancelButtonDisabled = (item?: CorporateTransferApprovalItem | null) => {
  if (!item) return false;
  return Number(item.IsCancel) === 1 || Number(item.IsCorporateTransferApproved) === 1;
};

export const getApproveDisabledWarning = (
  item?: CorporateTransferApprovalItem | null
): string | null => {
  if (!item) return null;
  if (Number(item.IsCorporateTransferApproved) === 1)
    return "Corporate transfer is already approved.";
  if (Number(item.IsCancel) === 1) return "Corporate transfer is already cancelled.";
  if (Number(item.CanApprove) === 0) return "You do not have rights to approve this request.";
  return null;
};

export const handleApproveButtonClick = (
  item: CorporateTransferApprovalItem,
  onApprove: (selected: CorporateTransferApprovalItem) => void
) => {
  if (isApproveButtonDisabled(item)) return;
  onApprove(item);
};

export const handleCancelButtonClick = (
  item: CorporateTransferApprovalItem,
  onCancel: (selected: CorporateTransferApprovalItem) => void
) => {
  if (isCancelButtonDisabled(item)) return;
  onCancel(item);
};

export const getCorporateTransferApprovalItemById = (
  rawItemMap: Record<number, CorporateTransferApprovalItem>,
  id?: number | null
) => (id ? (rawItemMap[id] ?? null) : null);
