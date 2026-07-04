import { useEffect, useRef } from "react";
import { OPPaymentItem } from "../types";
import {
  getOpPaymentItemById,
  handleCancelPaymentButtonClick,
  handleCollectPaymentButtonClick,
  isCancelPaymentButtonDisabled,
  isCollectPaymentButtonDisabled,
  shouldShowCancelPaymentButton,
  shouldShowCollectPaymentButton,
} from "../utils/opPaymentActions";

const OpPaymentActionPopup = ({
  bookingId,
  rawItemMap,
  position,
  onClose,
  onView,
  onCollectPayment,
  onCancel,
}: {
  bookingId: number | null;
  rawItemMap: Record<number, OPPaymentItem>;
  position: { top: number; left: number } | null;
  onClose: () => void;
  onView: (item: OPPaymentItem) => void;
  onCollectPayment: (item: OPPaymentItem) => void;
  onCancel: (item: OPPaymentItem) => void;
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const item = getOpPaymentItemById(rawItemMap, bookingId);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!item || !position) return null;

  const runAction = (action: (selected: OPPaymentItem) => void) => {
    action(item);
    onClose();
  };

  const collectDisabled = isCollectPaymentButtonDisabled(item);
  const cancelDisabled = isCancelPaymentButtonDisabled(item);

  return (
    <div
      ref={popupRef}
      className="btn-popup"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <button type="button" className="data-download-popup-btn" onClick={() => runAction(onView)}>
        View
      </button>
      {shouldShowCollectPaymentButton(item) && (
        <button
          type="button"
          aria-disabled={collectDisabled}
          className={`data-download-popup-btn ${collectDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
          onClick={() => {
            handleCollectPaymentButtonClick(item, selected => {
              onCollectPayment(selected);
              onClose();
            });
          }}
        >
          Collect Payment
        </button>
      )}
      {shouldShowCancelPaymentButton(item) && (
        <button
          type="button"
          aria-disabled={cancelDisabled}
          className={`data-download-popup-btn ${cancelDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
          onClick={() => {
            handleCancelPaymentButtonClick(item, selected => {
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

export default OpPaymentActionPopup;
