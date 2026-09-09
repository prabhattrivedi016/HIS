// UPDATE_IPD_SERVICE_DISC_PER
import CentralPopup from "@/components/centralPopup";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { allowOnlyNumbers, allowOnlyText } from "@/utils/inputValidationHandler";
import { useEffect, useState } from "react";
import { IpdSummaryBillingTableList } from "../types";

type DiscountPercentagePopupProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedItems?: IpdSummaryBillingTableList[]; // Replace 'any' with the actual type of your selected items
  refetch?: () => void;
};

const DiscountPercentagePopup = ({
  isOpen,
  onClose,
  selectedItems,
  refetch,
}: DiscountPercentagePopupProps) => {
  const { loading, fetchApi } = useGlobalApi();
  const [discPerValue, setDiscPerValue] = useState<number>(0);
  const [discReasonValue, setDiscReasonValue] = useState<string>("");

  useEffect(() => {
    if (selectedItems && selectedItems.length > 0) {
      const initialDiscPer = selectedItems[0]?.DiscPer || 0;
      setDiscPerValue(initialDiscPer);
    }
  }, [selectedItems]);
  //   input change handler
  const inputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setDiscPerValue(value);
  };

  //   reason change handler
  const reasonChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDiscReasonValue(value);
  };

  //   create payload
  const createPayload = () => {
    return {
      visitId: selectedItems?.[0]?.VisitId!,
      ftdIdList: selectedItems!.map(item => item?.FTDId).join(","),
      discPer: discPerValue,
      discReason: discReasonValue,
    };
  };

  //   update discount percentage handler
  const updateDiscPerHandler = async () => {
    if (
      !selectedItems ||
      selectedItems.length === 0 ||
      discPerValue < 0 ||
      discReasonValue.trim() === ""
    ) {
      showWarning(
        "No selected items to update discount percentage or invalid discount percentage details."
      );
      return;
    }
    const payload = createPayload();
    console.log("payload in updateDiscPerHandler:", payload);
    setDiscPerValue(Number(discPerValue));
    const resp = await fetchApi(
      "PATCH",
      ENDPOINTS.UPDATE_IPD_SERVICE_DISC_PER,
      payload,
      {},
      { component: "DiscountPercentagePopup" }
    );
    if (!resp?.result) {
      showError(resp?.message || "Failed to update discount percentage.");
      return;
    }
    showSuccess(resp?.message || "Discount percentage updated successfully.");
    onClose();
    refetch?.(); // Call refetch to refresh the data after updating quantity
  };
  return (
    <CentralPopup isOpen={isOpen} onClose={onClose} title="Discount Percentage Update">
      <div>
        <InputField label="Discount Percentage" required>
          <input
            type="text"
            className="input-field"
            placeholder="Enter Discount Percentage to update"
            onInput={allowOnlyNumbers}
            onChange={inputChangeHandler}
            value={discPerValue}
          />
        </InputField>

        <InputField label="Discount Reason" required>
          <input
            type="text"
            className="input-field"
            placeholder="Enter Discount reason to update"
            onInput={allowOnlyText}
            onChange={reasonChangeHandler}
            value={discReasonValue}
          />
        </InputField>
        <div className="flex justify-end gap-2 ">
          <button className="save-btn" onClick={updateDiscPerHandler}>
            Update
          </button>
        </div>
      </div>
      {!!loading && <CustomLoader isLoading={loading} />}
    </CentralPopup>
  );
};

export default DiscountPercentagePopup;
