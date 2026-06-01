import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { serviceListTableHeader, TestPackageTableHeader } from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PackageItems, ServiceBindingDataItem } from "../types";

const PackagePopup = ({
  isOpen,
  onClose,
  packageId,
  serviceId,
}: {
  isOpen: boolean;
  onClose: () => void;
  packageId?: number;
  serviceId?: number;
}) => {
  const { loading, fetchApi } = useGlobalApi();

  const [packageList, setPackageList] = useState<PackageItems[]>([]);

  const [serviceList, setServiceList] = useState<ServiceBindingDataItem[]>([]);

  // package details

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

  // service details
  const getServiceList = async (investigationId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_LAB_INVESTIGATION_OBSERVATION_MAPPING,
      {},
      { params: { investigationId } },
      { component: "PackagePopupOfOpdBilling" }
    );
    console.log("service details response", resp);
    setServiceList(resp?.data ?? []);
  };
  useEffect(() => {
    if (packageId) {
      getPackageList(packageId);
    } else if (serviceId) {
      getServiceList(serviceId);
    }
  }, [packageId, serviceId]);

  useScrollLock(isOpen);
  return createPortal(
    <div className={`fixed inset-0 z-999 ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      <div
        className={`central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] lg:min-w-140 ${isOpen ? "opacity-full" : ""}`}
      >
        <div className="popup-header">
          <h2 className="popup-helper-text">
            {packageId ? "Test Package Details" : "Service Observation Details"}
          </h2>
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
                    {packageId
                      ? TestPackageTableHeader.map((h, index) => (
                          <th key={index} className="table-th ">
                            {h}
                          </th>
                        ))
                      : serviceListTableHeader.map((h, index) => (
                          <th key={index} className="table-th ">
                            {h}
                          </th>
                        ))}
                  </tr>
                </thead>

                {serviceList.length > 0 && (
                  <tbody>
                    {serviceList.length === 0 && (
                      <tr>
                        <td colSpan={serviceListTableHeader.length} className="table-empty">
                          No records found
                        </td>
                      </tr>
                    )}
                    {serviceList.map((item, idx) => (
                      <tr key={idx} className="table-row">
                        <td className="table-td">{idx + 1}</td>
                        <td className="table-td">{item?.serviceName ?? "-"}</td>
                        <td className="table-td">{item?.observationName ?? "-"}</td>
                        <td className="table-td">{item?.qty ?? 1}</td>
                      </tr>
                    ))}
                  </tbody>
                )}

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
