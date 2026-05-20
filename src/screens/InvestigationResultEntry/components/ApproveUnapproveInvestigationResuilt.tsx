import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import { showSuccess, showWarning } from "@/utils/alert";
import React, { ChangeEvent, FormEvent, useState } from "react";

const ApproveUnapproveInvestigationResult = React.memo(
  ({
    isOpen,
    onClose,
    pId,
    onSuccess,
  }: {
    isOpen: boolean;
    onClose: () => void;
    pId: number;
    onSuccess?: () => Promise<void> | void;
  }) => {
    const { loading, fetchApi } = useGlobalApi();

    const [approveReason, setApproveReason] = useState<string>("");

    const [inputError, setInputError] = useState<string>("");

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useScrollLock(isOpen);

    // reason handler
    const reasonChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      setApproveReason(value);

      // clear error while typing
      if (value.trim()) {
        setInputError("");
      }
    };

    // unapprove api
    const submitUnapproveHandler = async () => {
      // validation
      if (!approveReason.trim()) {
        setInputError("Please enter unapprove reason");
        return;
      }

      if (!pId) return;

      try {
        const payload = {
          samples: [
            {
              patientInvestigationId: pId,
              statusId: 4,
              cancellationReason: approveReason.trim(),
            },
          ],
        };

        const resp = await fetchApi(
          "PATCH",
          ENDPOINTS.REJECT_SAMPLE_STATUS,
          payload,
          {},
          { component: "ApproveUnapproveInvestigationResult" }
        );

        if (!resp?.result) {
          showWarning(resp?.message ?? "Something went wrong");
          return;
        }

        showSuccess(resp?.message ?? "Unapprove successful");

        setApproveReason("");
        setInputError("");

        await onSuccess?.();

        onClose();
      } catch (error) {
        showWarning("Something went wrong");
      }
    };

    // form submit handler
    const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      setIsSubmitting(true);

      try {
        await submitUnapproveHandler();
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className={`fixed inset-0 z-999 ${isOpen ? "" : "pointer-events-none"}`}>
        <div
          className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        />

        <div className={`central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] ${isOpen ? "opacity-full" : ""}`}>
          <div className="popup-header">
            <h2 className="popup-helper-text">Unapprove Reason</h2>

            <button type="button" onClick={onClose} className="close-drawer-btn">
              ×
            </button>
          </div>

          <form onSubmit={submitHandler}>
            <div className="form-grid-1">
              <InputField label="Unapprove Reason" required>
                <input
                  type="text"
                  className="input-field"
                  placeholder={`Enter unapprove reason`}
                  value={approveReason}
                  onChange={reasonChangeHandler}
                />

                {!!inputError && isSubmitting && <p className="input-field-error">{inputError}</p>}
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
        {!!loading && <CustomLoader isLoading={loading} />}
      </div>
    );
  }
);

export default ApproveUnapproveInvestigationResult;
