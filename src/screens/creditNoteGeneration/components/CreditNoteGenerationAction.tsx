import { useEffect, useRef } from "react";
import useAnchoredFixedPopupPosition from "../../../hooks/useAnchoredFixedPopupPosition";
import { CreditNoteGenerationItem } from "../types";
import {
  getCreditNoteGenerationItemById,
  handleCancelButtonClick,
  handleGenerationButtonClick,
  isCancelButtonDisabled,
  isGenerationButtonDisabled,
} from "../utils/creditNoteGenerationAction";

const CreditNoteGenerationActionPopup = ({
  creditNoteId,
  rawItemMap,
  anchorRect,
  onClose,
  onView,
  onGeneration,
  onCancel,
}: {
  creditNoteId: number | null;
  rawItemMap: Record<number, CreditNoteGenerationItem>;
  anchorRect: DOMRect | null;
  onClose: () => void;
  onView: (item: CreditNoteGenerationItem) => void;
  onGeneration: (item: CreditNoteGenerationItem) => void;
  onCancel: (item: CreditNoteGenerationItem) => void;
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const item = getCreditNoteGenerationItemById(rawItemMap, creditNoteId);
  const position = useAnchoredFixedPopupPosition(anchorRect, popupRef, creditNoteId);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!item || !anchorRect) return null;

  const runAction = (action: (selected: CreditNoteGenerationItem) => void) => {
    action(item);
    onClose();
  };

  const generationDisabled = isGenerationButtonDisabled(item);
  const cancelDisabled = isCancelButtonDisabled(item);

  return (
    <div
      ref={popupRef}
      className="btn-popup"
      style={{
        top: position?.top ?? 0,
        left: position?.left ?? 0,
        visibility: position ? "visible" : "hidden",
      }}
    >
      <button type="button" className="data-download-popup-btn" onClick={() => runAction(onView)}>
        View
      </button>
      <button
        type="button"
        disabled={generationDisabled}
        aria-disabled={generationDisabled}
        className={`data-download-popup-btn ${generationDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
        onClick={() => {
          if (generationDisabled) return;
          handleGenerationButtonClick(item, selected => {
            onGeneration(selected);
            onClose();
          });
        }}
      >
        Generation
      </button>
      <button
        type="button"
        disabled={cancelDisabled}
        aria-disabled={cancelDisabled}
        className={`data-download-popup-btn ${cancelDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
        onClick={() => {
          if (cancelDisabled) return;
          handleCancelButtonClick(item, selected => {
            onCancel(selected);
            onClose();
          });
        }}
      >
        Cancel
      </button>
    </div>
  );
};

export default CreditNoteGenerationActionPopup;
