import CentralPopup from "@/components/centralPopup";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { allowOnlyNumbers } from "@/utils/inputValidationHandler";
import { useEffect, useState } from "react";
import { IpdSummaryBillingTableList } from "../types";

type RatePopupProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedItems?: IpdSummaryBillingTableList[]; // Replace 'any' with the actual type of your selected items
  refetch?: () => void;
};

const RatePopup = ({ isOpen, onClose, selectedItems, refetch }: RatePopupProps) => {
  const { loading, fetchApi } = useGlobalApi();
  const [rateValue, setRateValue] = useState<number>(0);

  useEffect(() => {
    if (selectedItems && selectedItems.length > 0) {
      const initialRate = selectedItems[0]?.Rate || 0;
      setRateValue(initialRate);
    }
  }, [selectedItems]);
  //   input change handler
  const inputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setRateValue(value);
  };

  //   create payload
  const createPayload = () => {
    if (!selectedItems?.length) return null;

    return {
      visitId: selectedItems[0].VisitId,
      ftdIdList: selectedItems.map(item => item.FTDId).join(","),
      rate: rateValue,
    };
  };

  //   update quantity handler
  const updateQtyHandler = async () => {
    if (!selectedItems?.length || rateValue <= 0) {
      showWarning("No selected items to update rate or invalid rate.");
      return;
    }

    const restrictedItems = selectedItems.filter(
      item => Number(item?.CategoryTypeId) === 6 || Number(item?.CategoryTypeId) === 9
    );

    if (restrictedItems.length > 0) {
      const itemDetails = restrictedItems
        .map((item, index) => `${index + 1}. ${item?.ServiceName ?? "Unknown Service"}`)
        .join("\n");

      showWarning(`Rate cannot be updated of the following items.:\n${itemDetails}`);

      return;
    }
    const payload = createPayload();
    if (!payload) return;

    const resp = await fetchApi(
      "PATCH",
      ENDPOINTS.UPDATE_IPD_SERVICE_RATE,
      payload,
      {},
      { component: "RatePopup" }
    );
    if (!resp?.result) {
      showError(resp?.message || "Failed to update rate.");
      return;
    }
    showSuccess(resp?.message || "Rate updated successfully.");
    onClose();
    refetch?.(); // Call refetch to refresh the data after updating rate
  };
  return (
    <CentralPopup isOpen={isOpen} onClose={onClose} title="Rate Update">
      <div>
        <InputField label="Rate">
          <input
            type="text"
            className="input-field"
            placeholder="Enter Rate to update"
            onInput={allowOnlyNumbers}
            onChange={inputChangeHandler}
            value={rateValue}
          />
        </InputField>
        <div className="flex justify-end gap-2 ">
          <button className="save-btn" onClick={updateQtyHandler}>
            Update
          </button>
        </div>
      </div>
      {!!loading && <CustomLoader isLoading={loading} />}
    </CentralPopup>
  );
};

export default RatePopup;
