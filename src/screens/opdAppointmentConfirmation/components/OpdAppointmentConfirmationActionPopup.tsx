import useAnchoredFixedPopupPosition from "@/hooks/useAnchoredFixedPopupPosition";
import { useEffect, useRef } from "react";
import { OpdAppointmentConfirmationItem } from "../types";
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
} from "./opdAppointmentConfirmationAction";

interface OpdAppointmentConfirmationActionPopupProps {
  bookingId: number | null;
  rawItemMap: Record<number, OpdAppointmentConfirmationItem>;
  anchorRect: DOMRect | null;
  onClose: () => void;
  onConfirm: (item: OpdAppointmentConfirmationItem) => void;
  onCancel: (item: OpdAppointmentConfirmationItem) => void;
  onReschedule: (item: OpdAppointmentConfirmationItem) => void;
  onView: (item: OpdAppointmentConfirmationItem) => void;
}

const OpdAppointmentConfirmationActionPopup = ({
  bookingId,
  rawItemMap,
  anchorRect,
  onClose,
  onConfirm,
  onCancel,
  onReschedule,
  onView,
}: OpdAppointmentConfirmationActionPopupProps) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const item = bookingId ? rawItemMap[bookingId] : null;
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
        width: "125px",
        minWidth: "125px",
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
    </div>
  );
};

export default OpdAppointmentConfirmationActionPopup;
