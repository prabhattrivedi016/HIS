import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import { showSuccess, showWarning } from "@/utils/alert";
import React, { ChangeEvent, FormEvent, useState } from "react";
import { SampleManagementTableData } from "../types";

const RejectSamplePopup = React.memo(
  ({
    isOpen,
    onClose,
    data,
    refreshSampleReject,
  }: {
    isOpen: boolean;
    onClose: () => void;
    data: SampleManagementTableData;
    refreshSampleReject: () => Promise<void>;
  }) => {
    const { loading, fetchApi } = useGlobalApi();

    const [cancellationReason, setCancellationReason] = useState<string>("");

    const [inputError, setInputError] = useState<string>("");

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useScrollLock(isOpen);

    // reason handler
    const reasonChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      setCancellationReason(value);

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
      if (!cancellationReason.trim()) {
        setInputError("Please enter cancellation reason");
        setIsSubmitting(false);
        return;
      }

      if (!data) return;

      const payload = {
        samples: [
          {
            patientInvestigationId: data?.PatientInvestigationId,
            statusId: 1,
            cancellationReason: cancellationReason.trim(),
          },
        ],
      };

      try {
        const resp = await fetchApi(
          "PATCH",
          ENDPOINTS.REJECT_SAMPLE_STATUS,
          payload,
          {},
          { component: "RejectSamplePopup" }
        );

        if (!resp?.result) {
          showWarning(resp?.message ?? "Something went wrong");
          return;
        }

        // success
        setCancellationReason("");
        setInputError("");

        onClose();
        showSuccess(resp?.message ?? "Data saved successfully");

        refreshSampleReject?.();
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
            <h2 className="popup-helper-text">Cancellation Reason</h2>

            <button type="button" onClick={onClose} className="close-drawer-btn">
              ×
            </button>
          </div>

          <form onSubmit={submitHandler}>
            <div className="form-grid-1">
              <InputField label="Cancellation Reason" required>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter cancellation reason"
                  value={cancellationReason}
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

export default RejectSamplePopup;
