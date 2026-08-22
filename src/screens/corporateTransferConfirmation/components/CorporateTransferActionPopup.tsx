import { useEffect, useRef } from "react";
import useAnchoredFixedPopupPosition from "../../../hooks/useAnchoredFixedPopupPosition";
import { CorporateTransferApprovalItem } from "../../corporateTransferApproval/types";
import {
  getCorporateTransferItemById,
  handleCancelButtonClick,
  handleConfirmButtonClick,
  isCancelButtonDisabled,
  isConfirmButtonDisabled,
} from "../utils/corporateTransferConfirmationAction";

const CorporateTransferActionPopup = ({
  writeOffId,
  rawItemMap,
  anchorRect,
  onClose,
  onView,
  onConfirm,
  onCancel,
}: {
  writeOffId: number | null;
  rawItemMap: Record<number, CorporateTransferApprovalItem>;
  anchorRect: DOMRect | null;
  onClose: () => void;
  onView: (item: CorporateTransferApprovalItem) => void;
  onConfirm: (item: CorporateTransferApprovalItem) => void;
  onCancel: (item: CorporateTransferApprovalItem) => void;
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const item = getCorporateTransferItemById(rawItemMap, writeOffId);
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

  const runAction = (action: (selected: CorporateTransferApprovalItem) => void) => {
    action(item);
    onClose();
  };

  const confirmDisabled = isConfirmButtonDisabled(item);
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
        disabled={confirmDisabled}
        aria-disabled={confirmDisabled}
        className={`data-download-popup-btn ${confirmDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
        onClick={() => {
          if (confirmDisabled) return;
          handleConfirmButtonClick(item, selected => {
            onConfirm(selected);
            onClose();
          });
        }}
      >
        Confirm
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

export default CorporateTransferActionPopup;
