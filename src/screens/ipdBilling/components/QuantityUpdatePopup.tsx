import CentralPopup from "@/components/centralPopup";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { allowOnlyNumbers } from "@/utils/inputValidationHandler";
import { useEffect, useMemo, useState } from "react";
import { IpdSummaryBillingTableList } from "../types";

type QuantityUpdatePopupProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: IpdSummaryBillingTableList[]; // Replace 'any' with the actual type of your selected items
  refetch?: () => void;
};

const QuantityUpdatePopup = ({
  isOpen,
  onClose,
  selectedItems,
  refetch,
}: QuantityUpdatePopupProps) => {
  const { loading, fetchApi } = useGlobalApi();
  const [qtyValue, setQtyValue] = useState<number>(0);

  useEffect(() => {
    if (selectedItems && selectedItems.length > 0) {
      const initialQty = selectedItems[0]?.Qty || 0;
      setQtyValue(initialQty);
    }
  }, [selectedItems]);
  //   input change handler
  const inputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setQtyValue(value);
  };

  //   create payload
  const createPayload = () => {
    return {
      visitId: selectedItems?.[0]?.VisitId!,
      ftdIdList: selectedItems!.map(item => item?.FTDId).join(","),
      qty: qtyValue,
    };
  };

  //   update quantity handler
  const updateQtyHandler = async () => {
    if (!selectedItems || selectedItems.length === 0 || qtyValue <= 0) {
      showWarning("No selected items to update quantity or invalid quantity.");
      return;
    }

    const payload = createPayload();
    setQtyValue(Number(qtyValue));
    const resp = await fetchApi(
      "PATCH",
      ENDPOINTS.UPDATE_IPD_SERVICE_QTY,
      payload,
      {},
      { component: "QuantityUpdatePopup" }
    );
    if (!resp?.result) {
      showError(resp?.message || "Failed to update quantity.");
      return;
    }
    showSuccess(resp?.message || "Quantity updated successfully.");
    onClose();
    refetch?.(); // Call refetch to refresh the data after updating quantity
  };

  const restrictedItems = useMemo(() => {
    return selectedItems.filter(
      item =>
        Number(item?.CategoryTypeId) === 2 ||
        Number(item?.CategoryTypeId) === 3 ||
        Number(item?.CategoryTypeId) === 6 ||
        Number(item?.CategoryTypeId) === 9 ||
        Number(item?.CategoryTypeId) === 11 ||
        Number(item?.CategoryTypeId) === 12
    );
  }, [selectedItems]);

  useEffect(() => {
    if (isOpen && restrictedItems.length > 0) {
      const uniqueItem = new Set();
      restrictedItems.forEach(item => {
        uniqueItem.add(item?.ServiceName);
      });
      showWarning(
        `Quantity cannot be updated of the following services.:\n${[...uniqueItem].join(",\n")}`
      );
      onClose();
    }
  }, [isOpen, restrictedItems, onClose]);

  if (restrictedItems.length > 0) {
    return null;
  }
  return (
    <CentralPopup isOpen={isOpen} onClose={onClose} title="Quantity Update">
      <div>
        <InputField label="Quantity">
          <input
            type="text"
            className="input-field"
            placeholder="Enter Quantity to update"
            onInput={allowOnlyNumbers}
            onChange={inputChangeHandler}
            value={qtyValue}
            maxLength={2}
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

export default QuantityUpdatePopup;
