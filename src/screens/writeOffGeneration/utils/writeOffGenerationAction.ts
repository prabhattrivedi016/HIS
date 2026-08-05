import { WriteOffGenerationItem } from "../types";

export const canShowCancel = (_item?: WriteOffGenerationItem | null) => true;

export const shouldShowGenerationButton = (_item?: WriteOffGenerationItem | null) => true;

export const shouldShowCancelButton = (_item?: WriteOffGenerationItem | null) => true;

export const isGenerationButtonDisabled = (item?: WriteOffGenerationItem | null) => {
  if (!item) return false;
  return (
    Number(item.IsWriteOffApproved) === 0 ||
    Number(item?.IsWriteOffCreated) === 1 ||
    Number(item.IsCancel) === 1
  );
};

export const isCancelButtonDisabled = (item?: WriteOffGenerationItem | null) => {
  if (!item) return false;
  return Number(item.IsCancel) === 1;
};

export const getApproveDisabledWarning = (item?: WriteOffGenerationItem | null): string | null => {
  if (!item) return null;
  if (Number(item.IsWriteOffApproved) !== 1) return "Write off is not approved.";
  if (Number(item.IsCancel) === 1) return "Write off is already cancelled.";
  return null;
};

export const handleGenerationButtonClick = (
  item: WriteOffGenerationItem,
  onGeneration: (selected: WriteOffGenerationItem) => void
) => {
  if (isGenerationButtonDisabled(item)) return;
  onGeneration(item);
};

export const handleCancelButtonClick = (
  item: WriteOffGenerationItem,
  onCancel: (selected: WriteOffGenerationItem) => void
) => {
  if (isCancelButtonDisabled(item)) return;
  onCancel(item);
};

export const getWriteOffGenerationItemById = (
  rawItemMap: Record<number, WriteOffGenerationItem>,
  id?: number | null
) => (id ? (rawItemMap[id] ?? null) : null);
