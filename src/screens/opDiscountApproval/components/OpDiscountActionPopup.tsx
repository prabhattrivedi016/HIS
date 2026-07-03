import { useEffect, useRef } from "react";
import { OPDiscountItem } from "../types";
import {
  canShowApprove,
  canShowCancel,
  canShowSendForApproval,
  getOpDiscountItemById,
} from "../utils/opDiscountActions";

const OpDiscountActionPopup = ({
  bookingId,
  rawItemMap,
  position,
  onClose,
  onView,
  onApprove,
  onCancel,
  onSendForApproval,
}: {
  bookingId: number | null;
  rawItemMap: Record<number, OPDiscountItem>;
  position: { top: number; left: number } | null;
  onClose: () => void;
  onView: (item: OPDiscountItem) => void;
  onApprove: (item: OPDiscountItem) => void;
  onCancel: (item: OPDiscountItem) => void;
  onSendForApproval: (item: OPDiscountItem) => void;
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const item = getOpDiscountItemById(rawItemMap, bookingId);

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

  const runAction = (action: (selected: OPDiscountItem) => void) => {
    action(item);
    onClose();
  };

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
      {canShowSendForApproval(item) && (
        <button
          type="button"
          className="data-download-popup-btn"
          onClick={() => runAction(onSendForApproval)}
        >
          Send For Approval
        </button>
      )}
      {canShowApprove(item) && (
        <button
          type="button"
          className="data-download-popup-btn"
          onClick={() => runAction(onApprove)}
        >
          Approve
        </button>
      )}
      {canShowCancel(item) && (
        <button
          type="button"
          className="data-download-popup-btn"
          onClick={() => runAction(onCancel)}
        >
          Cancel
        </button>
      )}
    </div>
  );
};

export default OpDiscountActionPopup;
