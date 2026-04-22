import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { TestPackageTableHeader } from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PackageItems } from "../types";

const PackagePopup = ({ isOpen, onClose, packageId }: PackagePopupProps) => {
  const { loading, fetchApi, error } = useGlobalApi();

  const [packageList, setPackageList] = useState<PackageItems[]>([]);

  const getPackageList = async (packageId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PACKAGE_ALL_DETAILS,
      {},
      { params: { packageId } },
      { component: "PackagePopupOfOpdBilling" }
    );
    setPackageList(resp?.data ?? []);
  };
  useEffect(() => {
    if (packageId) {
      getPackageList(packageId);
    }
  }, [packageId]);

  useScrollLock(isOpen);
  return createPortal(
    <div className={`fixed inset-0 z-999 ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      <div className={`central-popup lg:min-w-140 ${isOpen ? "opacity-full" : ""}`}>
        <div className="popup-header">
          <h2 className="popup-helper-text">Test package</h2>
          <button type="button" onClick={onClose} className="close-drawer-btn">
            ×
          </button>
          {/* table */}
        </div>
        <div className="table-container ">
          <div className="table-scroll-wrapper ">
            <div className="table-size lg:min-h-60 lg:max-h-60">
              <table className="base-table ">
                <thead className="table-head">
                  <tr>
                    {TestPackageTableHeader.map((h, index) => (
                      <th key={index} className="table-th ">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {packageList?.length === 0 && (
                    <tr>
                      <td colSpan={TestPackageTableHeader.length} className="table-empty">
                        No records found
                      </td>
                    </tr>
                  )}

                  {packageList.map((item, idx) => (
                    <tr key={idx} className="table-row">
                      <td className="table-td">{idx + 1}</td>
                      <td className="table-td">{item?.packageServiceCategory ?? "-"}</td>
                      <td className="table-td">{item?.packageServiceName ?? "-"}</td>
                      <td className="table-td">{item?.qty ?? 1}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {loading ? <CustomLoader isLoading={loading} /> : <></>}
    </div>,
    document.body
  );
};

export default PackagePopup;
