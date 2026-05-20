import InputField from "@/components/customInputField";
import { useScrollLock } from "@/hooks/useScrollLock";
import { createPortal } from "react-dom";

const AddOutSourceReport = ({ isOpen, onClose }) => {
  useScrollLock(isOpen);
  return createPortal(
    <div className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      <div
        className={`central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] ${isOpen ? "opacity-full" : ""}`}
      >
        <div className="popup-header min-w-0">
          <h2 className="popup-helper-text truncate">Add OutSource Report</h2>
          <button onClick={onClose} className="close-drawer-btn shrink-0 ml-3">
            x
          </button>
        </div>

        <div className="form-grid-1">
          <InputField label="Upload Document">
            <input type="file" className="file-upload mb-2" />
          </InputField>

          <div className="flex items-end gap-2 ">
            <button className="save-btn  my-2 w-full  "> Upload </button>
            <button className="cancel-btn w-full ">Download</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddOutSourceReport;
