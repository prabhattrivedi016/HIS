import CentralPopup from "@/components/centralPopup";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useQuery } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { IpdPatientItem, ServiceObservationMappingItem, ServiceTableItem } from "../types";

type ServiceViewPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  buttonClickHandler: () => void;
  serviceData?: ServiceTableItem | null;
  patientData?: IpdPatientItem;
};
const ServiceViewPopup = ({
  isOpen,
  onClose,
  children,
  serviceData,
  patientData,
}: ServiceViewPopupProps) => {
  const { loading, fetchApi } = useGlobalApi();

  const getInvestigationDetails = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_INVESTIGATION_OBSERVATION_MAPPING_DETAILS,
      {},
      {
        params: {
          investigationId: serviceData?.serviceItemId,
          gender: ["male", "m"].includes(patientData?.Gender?.toLowerCase() ?? "")
            ? "m"
            : ["female", "f"].includes(patientData?.Gender?.toLowerCase() ?? "")
              ? "f"
              : "b",
        },
      },
      { component: "ServiceViewPopup" }
    );
    return resp?.data ?? [];
  };

  const { data: ServiceObservationMappingLists = [] } = useQuery({
    queryKey: ["getInvestigationDetails", serviceData?.serviceItemId, patientData?.PatientId],
    queryFn: getInvestigationDetails,
  });

  console.log("ServiceObservationMappingLists", ServiceObservationMappingLists);

  const formatTatTime = (minutes?: number) => {
    if (minutes === undefined || minutes === null || isNaN(minutes)) return "-";
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins} min`;
    if (mins === 0) return `${hrs}hrs`;
    return `${hrs}hrs ${mins} min`;
  };

  return (
    <CentralPopup
      isOpen={isOpen}
      onClose={onClose}
      title="Service Details"
      className="min-w-[92vw] lg:min-w-250"
    >
      <div>
        <div className="flex flex-row gap-4 items-center justify-between">
          <h2 className="popup-helper-text truncate">
            {"Oberservation Name: " + serviceData?.serviceName}
          </h2>
          <h2 className="popup-helper-text truncate">
            {"TAT Time: " + formatTatTime(serviceData?.tatTimeInMin)}
          </h2>
        </div>
        <div className="table-container ">
          <div className="table-scroll-wrapper ">
            <div className="table-size lg:min-h-60 lg:max-h-60">
              <table className="base-table ">
                <thead className="table-head">
                  <tr>
                    <th className="table-th">#</th>
                    {/* <th className="table-th ">Investigation Name</th> */}
                    <th className="table-th">Observation Name</th>
                    <th className="table-th">Min Value</th>
                    <th className="table-th">Max Value</th>
                    <th className="table-th">Display Range</th>
                    <th className="table-th">Unit</th>
                  </tr>
                </thead>

                <tbody>
                  {ServiceObservationMappingLists?.length === 0 && (
                    <tr>
                      <td colSpan={8} className="table-empty">
                        No records found
                      </td>
                    </tr>
                  )}

                  {ServiceObservationMappingLists.map(
                    (item: ServiceObservationMappingItem, idx: number) => (
                      <tr key={item?.ObservationId} className="table-row">
                        <td className="table-td font-bold">{idx}</td>
                        {/* <td className="table-td">{item?.InvestigationName || "-"}</td> */}
                        <td className="table-td">{item?.ObservationName || "-"}</td>
                        {/* <td
                          className={`table-td ${
                            Number(item?.isActive) === 1 ? "active-text" : "inactive-text"
                          }`}
                        >
                          {Number(item?.isActive) === 1 ? "Active" : "Inactive"}
                        </td> */}
                        <td className="table-td">{item?.MinValue || "-"}</td>
                        <td className="table-td">{item?.MaxValue || "-"}</td>
                        <td className="table-td">{item?.DisplayRange || "-"}</td>
                        <td className="table-td">{item?.Unit || "-"}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {loading && <CustomLoader isLoading={loading} />}
      </div>
    </CentralPopup>
  );
};

export default ServiceViewPopup;
/*
ServiceObservationMappingItem */
