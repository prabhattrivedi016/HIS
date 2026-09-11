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

type DiscountAmountPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedItems?: IpdSummaryBillingTableList[]; // Replace 'any' with the actual type of your selected items
  refetch?: () => void;
};

const DiscountAmountPopup = ({
  isOpen,
  onClose,
  selectedItems,
  refetch,
}: DiscountAmountPopupProps) => {
  const { loading, fetchApi } = useGlobalApi();
  const [discAmtValue, setDiscAmtValue] = useState<number>(0);
  const [discReasonValue, setDiscReasonValue] = useState<string>("");

  useEffect(() => {
    if (selectedItems && selectedItems.length > 0) {
      const initialDiscAmt = selectedItems[0]?.DiscAmt || 0;
      setDiscAmtValue(initialDiscAmt);
    }
  }, [selectedItems]);
  //   input change handler
  const inputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setDiscAmtValue(value);
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
      discAmt: discAmtValue,
      discReason: discReasonValue,
    };
  };

  //   update discount amount handler
  const updateDiscAmtHandler = async () => {
    if (
      !selectedItems ||
      selectedItems.length === 0 ||
      discAmtValue < 0 ||
      discReasonValue.trim() === ""
    ) {
      showWarning(
        "No selected items to update discount amount or invalid discount amount details."
      );
      return;
    }

    const restrictedItems = selectedItems.filter(
      item => Number(item?.CategoryTypeId) === 6 || Number(item?.CategoryTypeId) === 9
    );

    if (restrictedItems.length > 0) {
      const itemDetails = restrictedItems
        .map((item, index) => `${index + 1}. ${item?.ServiceName ?? "Unknown Service"}`)
        .join("\n");

      showWarning(`Discount amount cannot be updated of the following items.:\n${itemDetails}`);

      return;
    }
    const payload = createPayload();

    setDiscAmtValue(Number(discAmtValue));
    const resp = await fetchApi(
      "PATCH",
      ENDPOINTS.UPDATE_IPD_SERVICE_DISC_AMT,
      payload,
      {},
      { component: "DiscountAmountPopup" }
    );
    if (!resp?.result) {
      showError(resp?.message || "Failed to update discount amount.");
      return;
    }
    showSuccess(resp?.message || "Discount amount updated successfully.");
    onClose();
    refetch?.(); // Call refetch to refresh the data after updating quantity
  };
  return (
    <CentralPopup isOpen={isOpen} onClose={onClose} title="Discount Amount Update">
      <div>
        <InputField label="Discount Amount" required>
          <input
            type="text"
            className="input-field"
            placeholder="Enter Discount Amount to update"
            onInput={allowOnlyNumbers}
            onChange={inputChangeHandler}
            value={discAmtValue}
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
          <button className="save-btn" onClick={updateDiscAmtHandler}>
            Update
          </button>
        </div>
      </div>
      {!!loading && <CustomLoader isLoading={loading} />}
    </CentralPopup>
  );
};

export default DiscountAmountPopup;
