import { CreditNoteGenerationItem } from "../types";

export const canShowCancel = (_item?: CreditNoteGenerationItem | null) => true;

export const shouldShowGenerationButton = (_item?: CreditNoteGenerationItem | null) => true;

export const shouldShowCancelButton = (_item?: CreditNoteGenerationItem | null) => true;

export const isGenerationButtonDisabled = (item?: CreditNoteGenerationItem | null) => {
  if (!item) return false;
  return Number(item.IsCreditNoteApproved) !== 1 || Number(item.IsCancel) === 1;
};

export const isCancelButtonDisabled = (item?: CreditNoteGenerationItem | null) => {
  if (!item) return false;
  return Number(item.IsCancel) === 1;
};

export const getApproveDisabledWarning = (
  item?: CreditNoteGenerationItem | null
): string | null => {
  if (!item) return null;
  if (Number(item.IsCreditNoteApproved) !== 1) return "Credit note is not approved.";
  if (Number(item.IsCancel) === 1) return "Credit note is already cancelled.";
  return null;
};

export const handleGenerationButtonClick = (
  item: CreditNoteGenerationItem,
  onGeneration: (selected: CreditNoteGenerationItem) => void
) => {
  if (isGenerationButtonDisabled(item)) return;
  onGeneration(item);
};

export const handleCancelButtonClick = (
  item: CreditNoteGenerationItem,
  onCancel: (selected: CreditNoteGenerationItem) => void
) => {
  if (isCancelButtonDisabled(item)) return;
  onCancel(item);
};

export const getCreditNoteGenerationItemById = (
  rawItemMap: Record<number, CreditNoteGenerationItem>,
  id?: number | null
) => (id ? (rawItemMap[id] ?? null) : null);
