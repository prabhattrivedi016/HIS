import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { DuplicateServiceDataItem } from "../types";

const DuplicateServicePopup = ({
  isOpen,
  onClose,
  data,
  onButtonClick,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: DuplicateServiceDataItem | null;
  onButtonClick: (value: string) => void;
}) => {
  console.log("Rendering DuplicateServicePopup with data:", data); // Debug
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
        <div className="popup-header min-w-0">
          <h2 className="popup-helper-text truncate text-red-700">
            Do you want to prescribe again ?
          </h2>

          <button onClick={onClose} className="close-drawer-btn shrink-0 ml-3">
            ×
          </button>
        </div>

        <h1 className="Popup-helper-text font-medium ">
          {data &&
            `This Service is Already Prescribed By ${data.UserName} Date On ${data.CreatedDate}`}
        </h1>

        <div className="form-actions-responsive mt-5">
          <button
            type="submit"
            className="save-btn"
            onClick={() => onButtonClick("prescribe")}
            ref={prescribeBtnRef}
          >
            {"Prescribe Again"}
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

export default DuplicateServicePopup;
