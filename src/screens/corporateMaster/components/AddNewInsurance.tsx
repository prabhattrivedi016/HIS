import InputField from "@/components/customInputField";
import { useScrollLock } from "@/hooks/useScrollLock";
import { createPortal } from "react-dom";

const AddNewInsurance = ({ isOpen, onClose }) => {
  useScrollLock(isOpen);
  return createPortal(
    <div className={`fixed inset-0 z-9999 ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      <div className={`central-popup ${isOpen ? "opacity-full" : ""}`}>
        <div className="popup-header">
          <h2 className="popup-helper-text">Add Insurance Name</h2>
          <button onClick={onClose} className="close-drawer-btn">
            ×
          </button>
        </div>

        <form>
          <div className="form-grid-1">
            <InputField label=" Insurance Company Name" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter insurance company name"
              />
            </InputField>
          </div>
          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn">
              Save
            </button>
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddNewInsurance;
