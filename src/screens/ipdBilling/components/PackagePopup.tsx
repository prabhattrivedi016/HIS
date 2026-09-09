import CentralPopup from "@/components/centralPopup";
import InputField from "@/components/customInputField";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { IpdSummaryBillingTableList, PackageItemList } from "../types";

type PackagePopupProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: IpdSummaryBillingTableList[];
  refetch?: () => void;
};

const PackagePopup = ({ isOpen, onClose, selectedItems, refetch }: PackagePopupProps) => {
  const { loading, fetchApi } = useGlobalApi();

  const [selectedPackage, setSelectedPackage] = useState<PackageItemList | null>(null);

  const getPackageLists = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CATEGORY_TYPE_LIST,
      {},
      { params: { categoryTypeIds: 12 } },
      { component: "PackagePopup" }
    );
    return resp?.data || [];
  };
  const { data: packageLists = [] } = useQuery({
    queryKey: ["packageLists"],
    queryFn: getPackageLists,
    enabled: isOpen, // Fetch only when the popup is open
  });
  console.log("packageLists in PackagePopup:", packageLists);

  const createPayload = () => {
    return {
      visitId: selectedItems?.[0]?.VisitId!,
      ftdIdList: selectedItems!.map(item => item?.FTDId).join(","),
      packageId: selectedPackage?.categoryTypeId,
    };
  };

  // package update handler
  const packageUpdateHandler = async () => {
    if (!selectedPackage) {
      showWarning("Please select a package.");
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
            value={selectedPackage?.categoryTypeId || ""}
            onChange={e => {
              const packageId = parseInt(e.target.value);
              const selected = packageLists.find(p => p.categoryTypeId === packageId) || null;
              setSelectedPackage(selected);
            }}
          >
            <option>Select Package</option>
            {packageLists.map((item: PackageItemList) => (
              <option key={item.categoryTypeId} value={item.categoryTypeId}>
                {item.categoryTypeName}
              </option>
            ))}
          </select>
        </InputField>
        <div className="flex justify-end mt-1">
          <button className="save-btn" onClick={packageUpdateHandler}>
            Update Package
          </button>
        </div>
      </div>
    </CentralPopup>
  );
};

export default PackagePopup;
