import useAnchoredFixedPopupPosition from "@/hooks/useAnchoredFixedPopupPosition";
import React, { useEffect, useRef } from "react";
import { OtBookingDetailsItem } from "../types";
import {
  handleCancelButtonClick,
  handleConfirmButtonClick,
  handleRescheduleButtonClick,
  isCancelButtonDisabled,
  isConfirmButtonDisabled,
  isRescheduleButtonDisabled,
  shouldShowCancelButton,
  shouldShowConfirmButton,
  shouldShowRescheduleButton,
} from "../utils/otBookingDetailsActions";

interface OtBookingDetailsActionPopupProps {
  bookingId: number | null;
  rawItemMap: Record<number, OtBookingDetailsItem>;
  anchorRect: DOMRect | null;
  onClose: () => void;
  onConfirm: (item: OtBookingDetailsItem) => void;
  onCancel: (item: OtBookingDetailsItem) => void;
  onReschedule: (item: OtBookingDetailsItem) => void;
  onView: (item: OtBookingDetailsItem) => void;
}

const OtBookingDetailsActionPopup: React.FC<OtBookingDetailsActionPopupProps> = ({
  bookingId,
  rawItemMap,
  anchorRect,
  onClose,
  onConfirm,
  onCancel,
  onReschedule,
  onView,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const item = bookingId ? (rawItemMap[bookingId] ?? rawItemMap[Number(bookingId)]) : null;
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

  return (
    <div
      ref={popupRef}
      className="btn-popup"
      style={{
        top: position?.top ?? 0,
        left: position?.left ?? 0,
        width: "135px",
        minWidth: "135px",
        visibility: position ? "visible" : "hidden",
      }}
    >
      <button
        type="button"
        className="data-download-popup-btn"
        onClick={() => {
          onView(item);
          onClose();
        }}
      >
        View
      </button>

      {shouldShowConfirmButton(item) && (
        <button
          type="button"
          aria-disabled={isConfirmButtonDisabled(item)}
          className={`data-download-popup-btn ${
            isConfirmButtonDisabled(item) ? "opacity-60 cursor-not-allowed" : ""
          }`}
          onClick={() => {
            handleConfirmButtonClick(item, selected => {
              onConfirm(selected);
              onClose();
            });
          }}
        >
          Confirm
        </button>
      )}

      {shouldShowRescheduleButton(item) && (
        <button
          type="button"
          aria-disabled={isRescheduleButtonDisabled(item)}
          className={`data-download-popup-btn ${
            isRescheduleButtonDisabled(item) ? "opacity-60 cursor-not-allowed" : ""
          }`}
          onClick={() => {
            handleRescheduleButtonClick(item, selected => {
              onReschedule(selected);
              onClose();
            });
          }}
        >
          Reschedule
        </button>
      )}

      {shouldShowCancelButton(item) && (
        <button
          type="button"
          aria-disabled={isCancelButtonDisabled(item)}
          className={`data-download-popup-btn ${
            isCancelButtonDisabled(item) ? "opacity-60 cursor-not-allowed" : ""
          }`}
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

export default React.memo(OtBookingDetailsActionPopup);
