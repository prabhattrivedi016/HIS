import CentralPopup from "@/components/centralPopup";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { useEffect, useState } from "react";
import { IpdSummaryBillingTableList } from "../types";

type RemovePopupProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: IpdSummaryBillingTableList[];
  refetch?: () => void;
  onSuccess?: () => void;
};

const RemovePopup = ({ isOpen, onClose, selectedItems, refetch, onSuccess }: RemovePopupProps) => {
  const { loading, fetchApi } = useGlobalApi();
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    if (!isOpen) setCancelReason("");
  }, [isOpen]);

  const removeItems = async () => {
    const reason = cancelReason.trim();

    if (selectedItems.length === 0) {
      showWarning("Please select at least one item to remove.");
      return;
    }

    if (!reason) {
      showWarning("Please enter a reason for removing the selected item(s).");
      return;
    }

    const payload = {
      visitId: selectedItems[0].VisitId,
      ftdIdList: selectedItems.map(item => item.FTDId).join(","),
      cancelReason: reason,
    };

    const resp = await fetchApi(
      "PATCH",
      ENDPOINTS.REMOVE_IPD_SERVICE_ITEM,
      payload,
      {},
      { component: "RemovePopup" }
    );

    if (!resp?.result) {
      showError(resp?.message || "Failed to remove selected item(s).");
      return;
    }

    showSuccess(resp?.message || "Selected item(s) removed successfully.");
    onSuccess?.();
    onClose();
    refetch?.();
  };

  return (
    <CentralPopup isOpen={isOpen} onClose={onClose} title="Remove Items">
      <div>
        <InputField label="Reason for Removal" required>
          <input
            type="text"
            className="input-field"
            placeholder="Enter reason for removing selected item(s)"
            value={cancelReason}
            onChange={event => setCancelReason(event.target.value)}
          />
        </InputField>

        <div className="flex justify-end gap-2">
          <button className="save-btn" type="button" onClick={removeItems} disabled={loading}>
            Remove
          </button>
        </div>
      </div>
      {!!loading && <CustomLoader isLoading={loading} />}
    </CentralPopup>
  );
};

export default RemovePopup;
