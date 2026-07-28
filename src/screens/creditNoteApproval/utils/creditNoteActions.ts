import { CreditNoteApprovalItem } from "../types";

export const canShowCancel = (_item?: CreditNoteApprovalItem | null) => true;

export const shouldShowApproveButton = (_item?: CreditNoteApprovalItem | null) => true;

export const shouldShowCancelButton = (_item?: CreditNoteApprovalItem | null) => true;

export const isApproveButtonDisabled = (item?: CreditNoteApprovalItem | null) => {
  if (!item) return false;
  return (
    Number(item.IsCreditNoteApproved) === 1 ||
    Number(item.IsCancel) === 1 ||
    Number(item?.CanApprove === 0)
  );
};

export const isCancelButtonDisabled = (item?: CreditNoteApprovalItem | null) => {
  if (!item) return false;
  return Number(item.IsCancel) === 1;
};

export const getApproveDisabledWarning = (item?: CreditNoteApprovalItem | null): string | null => {
  if (!item) return null;
  if (Number(item.IsCreditNoteApproved) === 1) return "Credit note is already approved.";
  if (Number(item.IsCancel) === 1) return "Credit note is already cancelled.";
  return null;
};

export const handleApproveButtonClick = (
  item: CreditNoteApprovalItem,
  onApprove: (selected: CreditNoteApprovalItem) => void
) => {
  if (isApproveButtonDisabled(item)) return;
  onApprove(item);
};

export const handleCancelButtonClick = (
  item: CreditNoteApprovalItem,
  onCancel: (selected: CreditNoteApprovalItem) => void
) => {
  if (isCancelButtonDisabled(item)) return;
  onCancel(item);
};

export const getCreditNoteApprovalItemById = (
  rawItemMap: Record<number, CreditNoteApprovalItem>,
  id?: number | null
) => (id ? (rawItemMap[id] ?? null) : null);
