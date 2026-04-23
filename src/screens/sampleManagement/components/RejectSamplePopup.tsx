import InputField from "@/components/customInputField";
import { useScrollLock } from "@/hooks/useScrollLock";
import React from "react";

const RejectSamplePopup = React.memo(({ isOpen, onClose, data }) => {
  console.log("data of reject sample", data);

  useScrollLock(isOpen);
  return (
    <div className={`fixed inset-0 z-999 ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      <div className={`central-popup ${isOpen ? "opacity-full" : ""}`}>
        <div className="popup-header">
          <h2 className="popup-helper-text">Cancellation Reason</h2>
          <button onClick={onClose} className="close-drawer-btn">
            ×
          </button>
        </div>

        {/* {error ? <ErrorMessage text={error?.message} /> : <></>} */}
        {/* {successMessage ? <SuccessMessage text={successMessage} /> : <></>} */}

        <form>
          <input type="hidden" />
          <div className="form-grid-1">
            <InputField label="Cancellation Reason" required>
              <input type="text" className="input-field" placeholder="Enter cancellation reason" />
              {/* {errors.department && (
                <p className="input-field-error">{errors.department.message}</p>
              )} */}
            </InputField>
          </div>

          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn">
              Save
            </button>
            <button type="button" className="cancel-button">
              Cancel
            </button>
          </div>
        </form>
      </div>
      {/* {loading ? <CustomLoader isLoading={loading} /> : <></>} */}
    </div>
  );
});

export default RejectSamplePopup;
