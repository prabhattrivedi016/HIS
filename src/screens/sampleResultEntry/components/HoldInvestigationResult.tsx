import CentralPopup from "@/components/centralPopup";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showSuccess, showWarning } from "@/utils/alert";
import type { FormEvent } from "react";
import { useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  pId: number;
  onSuccess?: () => Promise<void> | void;
};

export default function HoldInvestigationResult({ isOpen, onClose, pId, onSuccess }: Props) {
  const { loading, fetchApi } = useGlobalApi();
  const [holdReason, setHoldReason] = useState("");
  const [inputError, setInputError] = useState("");

  const submitHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const reason = holdReason.trim();

    if (!reason) {
      setInputError("Please enter hold reason");
      return;
    }

    if (!pId) {
      showWarning("Select an investigation before placing it on hold");
      return;
    }

    const resp = await fetchApi(
      "PATCH",
      ENDPOINTS.REJECT_SAMPLE_STATUS,
      {
        samples: [
          {
            patientInvestigationId: pId,
            statusId: 3,
            cancellationReason: reason,
          },
        ],
      },
      {},
      { component: "SampleResultEntry" }
    );

    if (!resp?.result) {
      showWarning(resp?.message ?? "Unable to place investigation on hold");
      return;
    }

    setHoldReason("");
    setInputError("");
    await onSuccess?.();
    onClose();
    showSuccess(resp?.message ?? "Result put on hold");
  };

  return (
    <CentralPopup isOpen={isOpen} onClose={onClose} title="Hold Reason">
      <form onSubmit={submitHandler}>
        <div className="form-grid-1">
          <InputField label="Hold Reason" required>
            <input
              type="text"
              className="input-field"
              placeholder="Enter hold reason"
              value={holdReason}
              onChange={event => {
                setHoldReason(event.target.value);
                if (event.target.value.trim()) setInputError("");
              }}
            />
            {!!inputError && <p className="input-field-error">{inputError}</p>}
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
      {loading && <CustomLoader isLoading={loading} />}
    </CentralPopup>
  );
}
