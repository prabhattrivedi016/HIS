import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import { showSuccess, showWarning } from "@/utils/alert";
import React, { ChangeEvent, FormEvent, useState } from "react";

const HoldInvestigationResult = React.memo(
  ({ isOpen, onClose, pId }: { isOpen: boolean; onClose: () => void; pId: number }) => {
    const { loading, fetchApi } = useGlobalApi();

    const [holdReason, setHoldReason] = useState<string>("");

    const [inputError, setInputError] = useState<string>("");

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useScrollLock(isOpen);

    // reason handler
    const reasonChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      setHoldReason(value);

      // clear error while typing
      if (value.trim()) {
        setInputError("");
      }
    };

    // reject handler
    const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      setIsSubmitting(true);

      // validation
      if (!holdReason.trim()) {
        setInputError("Please enter hold reason");
        setIsSubmitting(false);
        return;
      }

      if (!pId) return;

      const payload = {
        samples: [
          {
            patientInvestigationId: pId,
            statusId: 3,
            cancellationReason: holdReason.trim(),
          },
        ],
      };

      try {
        const resp = await fetchApi(
          "PATCH",
          ENDPOINTS.REJECT_SAMPLE_STATUS,
          payload,
          {},
          { component: "HoldInvestigationResult" }
        );

        if (!resp?.result) {
          showWarning(resp?.message ?? "Something went wrong");
          return;
        }

        // success
        setHoldReason("");
        setInputError("");

        onClose();
        showSuccess(resp?.message ?? "Data saved successfully");
      } catch (error) {
        showWarning("Something went wrong");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className={`fixed inset-0 z-999 ${isOpen ? "" : "pointer-events-none"}`}>
        <div
          className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        />

        <div
          className={`central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] ${isOpen ? "opacity-full" : ""}`}
        >
          <div className="popup-header">
            <h2 className="popup-helper-text">Hold Reason</h2>

            <button type="button" onClick={onClose} className="close-drawer-btn">
              ×
            </button>
          </div>

          <form onSubmit={submitHandler}>
            <div className="form-grid-1">
              <InputField label="Hold Reason" required>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter cancellation reason"
                  value={holdReason}
                  onChange={reasonChangeHandler}
                />

                {!!inputError && isSubmitting && <p className="input-field-error">{inputError}</p>}
              </InputField>
            </div>

            <div className="form-actions-responsive mt-5">
              <button type="submit" className="save-btn" disabled={loading}>
                Save
              </button>

              <button type="button" className="cancel-button" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        </div>
        {!!loading && <CustomLoader isLoading={loading} />}
      </div>
    );
  }
);

export default HoldInvestigationResult;
