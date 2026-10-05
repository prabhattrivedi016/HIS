import CentralPopup from "@/components/centralPopup";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { IpdSummaryBillingTableList, PatientPackageItem } from "../types";

type PackagePopupProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: IpdSummaryBillingTableList[];
  refetch?: () => void;
};

const PackagePopup = ({ isOpen, onClose, selectedItems, refetch }: PackagePopupProps) => {
  const { loading, fetchApi } = useGlobalApi();

  console.log("selectedItems", selectedItems);

  const [packageLists, setPackageLists] = useState<PatientPackageItem[]>([]);

  const [selectedPackage, setSelectedPackage] = useState<PatientPackageItem | null>(null);

  // package list

  const getPackageList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PREDEFINE_QUERY_RESULT,
      {},
      {
        params: {
          queryName: "GetPatientIPDPackagesByVisitId",
          filter1: selectedItems?.[0]?.VisitId,
        },
      },
      { component: "IpdBillingComponent" }
    );
    if (!resp?.result) {
      showWarning(resp?.message ?? "No package found");
      return;
    }
    setPackageLists(resp?.data ?? []);
  };

  useEffect(() => {
    if (selectedItems.length > 0) {
      getPackageList();
    }
  }, [selectedItems]);

  // package select handler
  const packageSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    const selectedPackage = packageLists.find(
      (item: PatientPackageItem) => item?.PackageId === Number(value)
    );
    setSelectedPackage(selectedPackage || null);
  };

  const createPayload = () => {
    return {
      visitId: selectedItems?.[0]?.VisitId!,
      ftdIdList: selectedItems!.map(item => item?.FTDId).join(","),
      packageId: selectedPackage?.PackageId,
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

  const restrictedItems = useMemo(() => {
    return selectedItems.filter(item => item?.CategoryTypeId === 11 || item?.CategoryTypeId === 12);
  }, [selectedItems]);

  useEffect(() => {
    if (isOpen && restrictedItems.length > 0) {
      const uniqueItem = new Set();
      restrictedItems.forEach(item => {
        uniqueItem.add(item?.ServiceName);
      });
      showWarning(`The following services is already a package:\n${[...uniqueItem].join(",\n")}`);
      onClose();
    }
  }, [isOpen, restrictedItems, onClose]);

  if (restrictedItems.length > 0) {
    return null;
  }

  return (
    <CentralPopup isOpen={isOpen} onClose={onClose} title="Update Package">
      <div className="form-grid-1">
        <InputField>
          <select
            className="input-field"
            value={selectedPackage?.PackageId}
            onChange={packageSelectHandler}
          >
            <option value={0}>--Select Package--</option>
            {packageLists?.map(item => (
              <option key={item?.PackageId} value={item?.PackageId}>
                {item?.PackageName}
              </option>
            ))}
          </select>
        </InputField>
        <div className="flex justify-end mt-2">
          <button className="save-btn" onClick={packageUpdateHandler}>
            Update
          </button>
        </div>

        {!!loading && <CustomLoader isLoading={loading} />}
      </div>
    </CentralPopup>
  );
};

export default PackagePopup;
