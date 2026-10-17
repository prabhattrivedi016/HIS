import CentralPopup from "@/components/centralPopup";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { SampleManagementItem } from "../types";

const RejectSamplePopup = React.memo(
  ({
    isOpen,
    onClose,
    data,
    refreshSampleReject,
  }: {
    isOpen: boolean;
    onClose: () => void;
    data: SampleManagementItem | null;
    refreshSampleReject?: () => Promise<void> | void;
  }) => {
    const { loading, fetchApi } = useGlobalApi();

    const [cancellationReason, setCancellationReason] = useState<string>("");
    const [inputError, setInputError] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Reset form state when popup opens or selected data changes
    useEffect(() => {
      if (isOpen) {
        setCancellationReason("");
        setInputError("");
        setIsSubmitting(false);
      }
    }, [isOpen, data]);

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

      // validation
      if (!cancellationReason.trim()) {
        setInputError("Please enter cancellation reason");
        return;
      }

      if (!data?.PatientInvestigationId) {
        showWarning("No sample selected to reject");
        return;
      }

      setIsSubmitting(true);

      const payload = {
        samples: [
          {
            patientInvestigationId: data.PatientInvestigationId,
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
          showWarning(resp?.message ?? "Something went wrong while rejecting sample");
          return;
        }

        // success
        setCancellationReason("");
        setInputError("");

        onClose();
        showSuccess(resp?.message ?? "Sample rejected successfully");

        await refreshSampleReject?.();
      } catch (error: any) {
        showError(error?.message ?? "Something went wrong");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <CentralPopup
        title="Reject Sample"
        isOpen={isOpen}
        onClose={onClose}
        className="w-full sm:max-w-md lg:min-w-200"
      >
        <div className="space-y-3">
          {/* Patient Details */}
          {data && (
            <div className="card m-1 form-grid-2">
              <div className="flex flex-row">
                <h1 className="name-header">UHID :</h1>
                <span className="ml-2">{data?.UHID}</span>
              </div>

              <div className="flex flex-row">
                <h1 className="name-header">Test Name :</h1>
                <span className="ml-2">{data?.Name}</span>
              </div>

              <div className="flex flex-row">
                <h1 className="name-header">Patient Name :</h1>
                <span className="ml-2">{data?.PatientName}</span>
              </div>

              <div className="flex flex-row">
                <h1 className="name-header">Bar Code:</h1>
                <span className="ml-2">{data?.Barcode}</span>
              </div>
            </div>
          )}

          <form onSubmit={submitHandler}>
            <div className="form-grid-2">
              <InputField label="Cancellation Reason" required>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter cancellation reason"
                  value={cancellationReason}
                  onChange={reasonChangeHandler}
                  autoFocus
                />

                {!!inputError && <p className="input-field-error">{inputError}</p>}
              </InputField>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 w-full lg:col-start-2 mt-3">
                <button type="submit" className="save-btn" disabled={loading || isSubmitting}>
                  Save
                </button>

                <button
                  type="button"
                  className="cancel-button"
                  onClick={onClose}
                  disabled={loading || isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>

          {!!loading && <CustomLoader isLoading={loading} />}
        </div>
      </CentralPopup>
    );
  }
);

export default RejectSamplePopup;
