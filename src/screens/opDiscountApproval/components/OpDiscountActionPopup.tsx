import { useEffect, useRef } from "react";
import useAnchoredFixedPopupPosition from "../../../hooks/useAnchoredFixedPopupPosition";
import { OPDiscountItem } from "../types";
import {
  getOpDiscountItemById,
  handleApproveButtonClick,
  handleCancelButtonClick,
  isApproveButtonDisabled,
  isCancelButtonDisabled,
  shouldShowApproveButton,
  shouldShowCancelButton,
} from "../utils/opDiscountActions";

const OpDiscountActionPopup = ({
  bookingId,
  rawItemMap,
  anchorRect,
  onClose,
  onView,
  onApprove,
  onCancel,
}: {
  bookingId: number | null;
  rawItemMap: Record<number, OPDiscountItem>;
  anchorRect: DOMRect | null;
  onClose: () => void;
  onView: (item: OPDiscountItem) => void;
  onApprove: (item: OPDiscountItem) => void;
  onCancel: (item: OPDiscountItem) => void;
  onSendForApproval?: (item: OPDiscountItem) => void;
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const item = getOpDiscountItemById(rawItemMap, bookingId);
  const position = useAnchoredFixedPopupPosition(anchorRect, popupRef, bookingId);

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

  const runAction = (action: (selected: OPDiscountItem) => void) => {
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
      {shouldShowApproveButton(item) && (
        <button
          type="button"
          aria-disabled={approveDisabled}
          className={`data-download-popup-btn ${approveDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
          onClick={() => {
            handleApproveButtonClick(item, selected => {
              onApprove(selected);
              onClose();
            });
          }}
        >
          Approve
        </button>
      )}
      {shouldShowCancelButton(item) && (
        <button
          type="button"
          aria-disabled={cancelDisabled}
          className={`data-download-popup-btn ${cancelDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
          onClick={() => {
            handleCancelButtonClick(item, selected => {
              onCancel(selected);
              onClose();
            });
          }}
        >
          Cancel
        </button>
      )}
    </div>
  );
};

export default OpDiscountActionPopup;
