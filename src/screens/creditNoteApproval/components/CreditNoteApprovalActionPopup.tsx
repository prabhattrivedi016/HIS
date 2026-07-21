import { useEffect, useRef } from "react";
import useAnchoredFixedPopupPosition from "../../../hooks/useAnchoredFixedPopupPosition";
import { CreditNoteApprovalItem } from "../types";
import {
  getCreditNoteApprovalItemById,
  handleApproveButtonClick,
  handleCancelButtonClick,
  isApproveButtonDisabled,
  isCancelButtonDisabled,
} from "../utils/creditNoteActions";

const CreditNoteApprovalActionPopup = ({
  creditNoteId,
  rawItemMap,
  anchorRect,
  onClose,
  onView,
  onApprove,
  onCancel,
}: {
  creditNoteId: number | null;
  rawItemMap: Record<number, CreditNoteApprovalItem>;
  anchorRect: DOMRect | null;
  onClose: () => void;
  onView: (item: CreditNoteApprovalItem) => void;
  onApprove: (item: CreditNoteApprovalItem) => void;
  onCancel: (item: CreditNoteApprovalItem) => void;
  onSendForApproval?: (item: CreditNoteApprovalItem) => void;
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const item = getCreditNoteApprovalItemById(rawItemMap, creditNoteId);
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

  const runAction = (action: (selected: CreditNoteApprovalItem) => void) => {
    action(item);
    onClose();
  };

  const approveDisabled = isApproveButtonDisabled(item);
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
        disabled={approveDisabled}
        aria-disabled={approveDisabled}
        className={`data-download-popup-btn ${approveDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
        onClick={() => {
          if (approveDisabled) return;
          handleApproveButtonClick(item, selected => {
            onApprove(selected);
            onClose();
          });
        }}
      >
        Approve
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

export default CreditNoteApprovalActionPopup;
