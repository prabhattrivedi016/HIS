import { useScrollLock } from "@/hooks/useScrollLock";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface DueAmounts {
  opd: number | null;
  ipd: number | null;
  pharmacy: number | null;
}

const IpdOpdPharmacyDueAmount = ({
  isOpen,
  onClose,
  amount,
  onButtonClick,
}: {
  isOpen: boolean;
  onClose: () => void;
  amount: DueAmounts;
  onButtonClick: (value: string) => void;
}) => {
  const prescribeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        prescribeBtnRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  // Filter and display only dues that have values
  const hasDues = amount?.opd !== null || amount?.ipd !== null || amount?.pharmacy !== null;

  useScrollLock(isOpen);

  return createPortal(
    <div className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      <div
        className={`central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] ${
          isOpen ? "opacity-full" : ""
        }`}
      >
        <div className="popup-header min-w-0 ">
          <h2 className="popup-helper-text truncate name-header">Patient Has Previous Dues As:</h2>

          <button onClick={onClose} className="close-drawer-btn shrink-0 ml-3">
            ×
          </button>
        </div>

        {hasDues && (
          <div className="Popup-helper-text font-medium">
            {amount?.opd !== null && amount?.opd !== undefined && (
              <p>
                OPD Due Amount is: <span className="font-bold text-blue-400">₹{amount.opd}</span>
              </p>
            )}
            {amount?.ipd !== null && amount?.ipd !== undefined && (
              <p>
                IPD Due Amount is: <span className="font-bold text-blue-400">₹{amount.ipd}</span>
              </p>
            )}
            {amount?.pharmacy !== null && amount?.pharmacy !== undefined && (
              <p>
                Pharmacy Due Amount is:{" "}
                <span className="font-bold text-blue-400">₹{amount.pharmacy}</span>
              </p>
            )}
          </div>
        )}

        <div className="form-actions-responsive mt-5">
          <button
            type="submit"
            className="save-btn"
            onClick={() => onButtonClick("continue")}
            ref={prescribeBtnRef}
          >
            {"Continue"}
          </button>

          <button type="button" className="cancel-button" onClick={() => onButtonClick("cancel")}>
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default IpdOpdPharmacyDueAmount;
