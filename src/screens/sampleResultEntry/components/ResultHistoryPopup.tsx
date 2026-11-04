import CentralPopup from "@/components/centralPopup";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import React, { useEffect } from "react";
import { InvestigationHistoryItem, SubInvetigationItem } from "../types";

const ResultHistoryPopup = ({
  isOpen,
  onClose,
  selectedSubInvestigationForResultHistory,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedSubInvestigationForResultHistory: SubInvetigationItem | null;
}) => {
  const { loading, fetchApi } = useGlobalApi();

  const [resultHistory, setResultHistory] = React.useState<InvestigationHistoryItem[]>([]);

  //   get previous history
  const getPreviousResultHistory = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PATIENT_TABULAR_RESULT_ENTRY_HISTORY,
      {},
      {
        params: {
          investigationId: selectedSubInvestigationForResultHistory?.InvestigationId,
          patientId: selectedSubInvestigationForResultHistory?.PatientId,
        },
      },
      { component: "ResultHistoryPopup" }
    );
    setResultHistory(
      resp?.data?.filter(
        (f: InvestigationHistoryItem) =>
          f?.ObservationId === selectedSubInvestigationForResultHistory?.ObservationId
      ) ?? []
    );
  };

  useEffect(() => {
    if (selectedSubInvestigationForResultHistory) {
      getPreviousResultHistory();
    }
  }, [selectedSubInvestigationForResultHistory]);

  return (
    <CentralPopup
      title={`Result History: ${selectedSubInvestigationForResultHistory?.ObservationName || ""}`}
      isOpen={isOpen}
      onClose={onClose}
      className="lg:min-w-280"
    >
      <div className="table-container ">
        <div className="table-scroll-wrapper ">
          <div className="table-size lg:min-h-60 lg:max-h-60">
            <table className="base-table ">
              <thead className="table-head">
                <tr>
                  <th className="table-th">#</th>
                  <th className="table-th p-2">Lab No</th>
                  <th className="table-th">Barcode</th>
                  <th className="table-th">Bill Date</th>
                  <th className="table-th">Observation Name</th>
                  <th className="table-th">Result Value</th>
                  <th className="table-th">Min Value</th>
                  <th className="table-th">Max Value</th>
                  <th className="table-th">Display Range</th>
                  <th className="table-th">Unit</th>
                  <th className="table-th">Method</th>
                </tr>
              </thead>

              <tbody>
                {resultHistory?.length === 0 && (
                  <tr>
                    <td colSpan={11} className="table-empty">
                      No records found
                    </td>
                  </tr>
                )}

                {resultHistory?.map((item: InvestigationHistoryItem, idx: number) => (
                  <tr key={idx} className="table-row">
                    <td className="table-td">{idx + 1}</td>
                    <td className="table-td">{item?.LabNo || "-"}</td>
                    <td className="table-td">{item?.BarCode || "-"}</td>
                    <td className="table-td">{item?.BillDate || "-"}</td>
                    <td className="table-td">{item?.ObservationName || "-"}</td>
                    <td className="table-td">{item?.ResultValue || "-"}</td>
                    <td className="table-td">{item?.MinValue || "-"}</td>
                    <td className="table-td">{item?.MaxValue || "-"}</td>
                    <td className="table-td">{item?.DisplayRange || "-"}</td>
                    <td className="table-td">{item?.Unit || "-"}</td>
                    <td className="table-td">{item?.MethodName || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {loading && <CustomLoader isLoading={loading} />}
      </div>
    </CentralPopup>
  );
};

export default ResultHistoryPopup;
