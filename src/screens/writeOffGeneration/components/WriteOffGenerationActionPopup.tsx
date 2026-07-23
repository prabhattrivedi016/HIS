import { useEffect, useRef } from "react";
import useAnchoredFixedPopupPosition from "../../../hooks/useAnchoredFixedPopupPosition";
import { WriteOffGenerationItem } from "../types";
import {
  getWriteOffGenerationItemById,
  handleCancelButtonClick,
  handleGenerationButtonClick,
  isCancelButtonDisabled,
  isGenerationButtonDisabled,
} from "../utils/writeOffGenerationAction";

const WriteOffGenerationActionPopup = ({
  writeOffId,
  rawItemMap,
  anchorRect,
  onClose,
  onView,
  onGeneration,
  onCancel,
}: {
  writeOffId: number | null;
  rawItemMap: Record<number, WriteOffGenerationItem>;
  anchorRect: DOMRect | null;
  onClose: () => void;
  onView: (item: WriteOffGenerationItem) => void;
  onGeneration: (item: WriteOffGenerationItem) => void;
  onCancel: (item: WriteOffGenerationItem) => void;
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const item = getWriteOffGenerationItemById(rawItemMap, writeOffId);
  const position = useAnchoredFixedPopupPosition(anchorRect, popupRef, writeOffId);

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

  const runAction = (action: (selected: WriteOffGenerationItem) => void) => {
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

export default WriteOffGenerationActionPopup;
