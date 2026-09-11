import CentralPopup from "@/components/centralPopup";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { ChangeEvent, useEffect, useState } from "react";
import { IpdSummaryBillingTableList } from "../types";

type PackagePopupProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: IpdSummaryBillingTableList[];
  refetch?: () => void;
};

const PackagePopup = ({ isOpen, onClose, selectedItems, refetch }: PackagePopupProps) => {
  const { loading, fetchApi } = useGlobalApi();

  const [packageLists, setPackageLists] = useState<IpdSummaryBillingTableList[]>([]);

  const [selectedPackage, setSelectedPackage] = useState<IpdSummaryBillingTableList | null>(null);

  useEffect(() => {
    const filteredPackage = selectedItems.filter(
      (s: IpdSummaryBillingTableList) =>
        Number(s?.CategoryTypeId) === 12 && Number(s?.IsSupplementaryBill) === 0
    );

    setPackageLists(filteredPackage);
  }, [selectedItems]);

  // package select handler
  const packageSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    const selectedPackage = packageLists.find(
      (item: IpdSummaryBillingTableList) => item?.ServiceItemId === Number(value)
    );
    setSelectedPackage(selectedPackage || null);
  };

  const createPayload = () => {
    return {
      visitId: selectedItems?.[0]?.VisitId!,
      ftdIdList: selectedItems!.map(item => item?.FTDId).join(","),
      packageId: selectedPackage?.CategoryTypeId!,
    };
  };

  // package update handler
  const packageUpdateHandler = async () => {
    if (!selectedPackage) {
      showWarning("Please select a package.");
      return;
    }

    const restrictedItems = selectedItems.filter(
      item => Number(item?.CategoryTypeId) === 11 || Number(item?.CategoryTypeId) === 12
    );

    if (restrictedItems.length > 0) {
      const itemDetails = restrictedItems
        .map((item, index) => `${index + 1}. ${item?.ServiceName ?? "Unknown Service"}`)
        .join("\n");

      showWarning(`The following items cannot be added to the package:\n${itemDetails}`);

      return;
    }
    const payload = createPayload();
    const resp = await fetchApi(
      "PATCH",
      ENDPOINTS.UPDATE_IPD_SERVICE_PACKAGE,
      payload,
      {},
      { component: "PackagePopup" }
    );
    if (!resp?.result) {
      showError(resp?.message || "Failed to update package.");
      return;
    }
    showSuccess(resp?.message || "Package updated successfully.");
    onClose();
    refetch?.();
  };

  return (
    <CentralPopup isOpen={isOpen} onClose={onClose} title="Package">
      <div>
        <InputField>
          <select
            className="input-field"
            value={selectedPackage?.CategoryTypeId}
            onChange={packageSelectHandler}
          >
            <option value={0}>No Package</option>
            {packageLists?.map((item: IpdSummaryBillingTableList) => (
              <option key={item?.ServiceItemId} value={item?.ServiceItemId}>
                {item?.ServiceName}
              </option>
            ))}
          </select>
        </InputField>
        <div className="flex justify-end mt-1">
          <button className="save-btn" onClick={packageUpdateHandler}>
            Update Package
          </button>
        </div>

        {!!loading && <CustomLoader isLoading={loading} />}
      </div>
    </CentralPopup>
  );
};

export default PackagePopup;
