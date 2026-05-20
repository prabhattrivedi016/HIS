import InputField from "@/components/customInputField";
import { useScrollLock } from "@/hooks/useScrollLock";
import { createPortal } from "react-dom";
import { CollectOnDeviceProps } from "../types";

const CollectOnDevice = ({ isOpen, onClose, totalAmount }: CollectOnDeviceProps) => {
  useScrollLock(isOpen);
  return createPortal(
    <div className={`fixed inset-0 z-999 ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      <div className={`central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] ${isOpen ? "opacity-full" : ""}`}>
        <div className="popup-header">
          <h2 className="popup-helper-text">Collect on device</h2>
          <button type="button" onClick={onClose} className="close-drawer-btn">
            ×
          </button>
        </div>

        {/* {error ? <ErrorMessage text={error?.message} /> : <></>} */}
        {/* {successMessage ? <SuccessMessage text={successMessage} /> : <></>} */}

        <form>
          <div className="form-grid-2">
            <InputField label="Device Name" required>
              <select className="input-field">
                <option>Select</option>
                <option>Machine 1</option>
              </select>
            </InputField>

            <InputField label="Payment Mode" required>
              <select className="input-field">
                <option> Select</option>
                <option> Card</option>
                <option> Upi</option>
              </select>
            </InputField>

            <InputField label="Net Amount">
              <input
                type="text"
                value={totalAmount}
                className="input-field text-red-500 font-semibold"
                readOnly
              />
            </InputField>
          </div>

          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn">
              Collect On Device
            </button>
            <button type="button" className="cancel-button">
              Cancel
            </button>
          </div>
        </form>
      </div>
      {/* {loading ? <CustomLoader isLoading={loading} /> : <></>} */}
    </div>,
    document.body
  );
};

export default CollectOnDevice;
