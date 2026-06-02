import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const DuesAmountPopup = ({
  isOpen,
  onClose,
  amount,
  onButtonClick,
}: {
  isOpen: boolean;
  onClose: () => void;
  amount: number | null;
  onButtonClick: (value: string) => void;
}) => {
  console.log("Rendering DuesAmountPopup with data:", amount); // Debug
  // log to check data passed to popup

  const prescribeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        prescribeBtnRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);
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

        <h1 className="Popup-helper-text font-medium ">
          {amount !== null && (
            <>
              OPD Due Amount is: <span className="font-bold text-blue-400">₹{amount}</span>
            </>
          )}
        </h1>

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

export default DuesAmountPopup;
