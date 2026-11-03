import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import React from "react";
import { InvestigationHistoryItem, SubInvetigationItem } from "../types";

const LabInfoRightChart = ({
  subInvestigationlists,
}: {
  subInvestigationlists: SubInvetigationItem[];
}) => {
  const { loading, fetchApi } = useGlobalApi();

  const [resultHistory, setResultHistory] = React.useState<InvestigationHistoryItem[]>([]);
  const [selectedObservationId, setSelectedObservationId] = React.useState("");

  // Get previous history
  const getPreviousHistory = async (
    investigationId: number,
    patientId: number,
    observationId: number
  ) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PATIENT_TABULAR_RESULT_ENTRY_HISTORY,
      {},
      {
        params: { investigationId, patientId },
      },
      { component: "LabInfoRightChart" }
    );

    const historyData = resp?.data?.filter(
      (f: InvestigationHistoryItem) => Number(f?.ObservationId) === observationId
    );

    setResultHistory(historyData || []);
  };

  // Select investigation
  const serviceItemSelectHandler = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedObservationId = event.target.value;

    setSelectedObservationId(selectedObservationId);
    setResultHistory([]);

    if (!selectedObservationId) return;

    const selectedItem = subInvestigationlists.find(
      item => Number(item.ObservationId) === Number(selectedObservationId)
    );

    if (selectedItem) {
      getPreviousHistory(
        Number(selectedItem.InvestigationId),
        Number(selectedItem.PatientId),
        Number(selectedItem.ObservationId)
      );
    }
  };

  // Calculate graph positions dynamically
  const chartPoints = React.useMemo(() => {
    const validData = resultHistory
      .map(item => ({
        value: Number(item.ResultValue),
        date: item.BillDate,
      }))
      .filter(item => Number.isFinite(item.value));

    if (!validData.length) return [];

    const min = Math.min(...validData.map(item => item.value));
    const max = Math.max(...validData.map(item => item.value));
    const range = max - min || 1;

    return validData.map((item, index) => ({
      ...item,
      x: validData.length === 1 ? 100 : 15 + (index / (validData.length - 1)) * 170,
      y: 48 - ((item.value - min) / range) * 35,
    }));
  }, [resultHistory]);

  return (
    <div className="lg:col-span-3 min-w-0 space-y-2 overflow-x-auto">
      {/* RESULT TREND GRAPHICAL PANEL */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex flex-col gap-2 whitespace-nowrap">
          <span className="text-[15px] font-bold text-blue-800">Result Trend (Graphical)</span>

          <select
            value={selectedObservationId}
            className="bg-gray-50 border border-gray-200 rounded text-xs px-2 py-2 text-gray-700 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer w-full"
            onChange={serviceItemSelectHandler}
            disabled={loading}
          >
            <option value="">Select Investigation</option>

            {subInvestigationlists.map((item, index) => (
              <option key={index} value={item.ObservationId}>
                {item.ObservationName}
              </option>
            ))}
          </select>
        </div>

        {/* GRAPH */}
        <div className="h-36 border border-dashed border-gray-200 rounded-lg p-2 flex flex-col justify-between relative whitespace-nowrap  overflow-x-auto">
          {loading ? (
            <div className="flex flex-1 items-center justify-center text-xs text-gray-500">
              Loading history...
            </div>
          ) : chartPoints.length > 0 ? (
            <>
              {/* SVG Graph */}
              <div className="relative h-24 w-full mt-1">
                <svg
                  className="w-full h-full overflow-visible"
                  viewBox="0 0 200 60"
                  preserveAspectRatio="none"
                >
                  {/* Horizontal Grid Line */}
                  {[10, 30, 50].map(y => (
                    <line
                      key={y}
                      x1="0"
                      y1={y}
                      x2="200"
                      y2={y}
                      stroke="#e5e7eb"
                      strokeWidth="0.6"
                      strokeDasharray="3 3"
                    />
                  ))}

                  {/* Connecting Line */}
                  {chartPoints.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={chartPoints.map(point => `${point.x},${point.y}`).join(" ")}
                    />
                  )}

                  {/* Circles and Result Values */}
                  {chartPoints.map((point, index) => (
                    <g key={index}>
                      {/* Result Value */}
                      <text
                        x={point.x}
                        y={Math.max(point.y - 7, 6)}
                        fontSize="8"
                        fill="#1e293b"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {point.value}
                      </text>

                      {/* Circle */}
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="3.5"
                        fill="#2563eb"
                        stroke="white"
                        strokeWidth="1.5"
                      />
                    </g>
                  ))}
                </svg>
              </div>

              {/* X-Axis Dates */}
              <div className="flex justify-between gap-2 text-[9px] font-semibold text-gray-500 px-1 border-t border-gray-200 pt-1 whitespace-nowrap">
                {chartPoints.map((point, index) => (
                  <span key={index} className=" text-center">
                    {point.date}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-center text-[11px] text-gray-400">
              {selectedObservationId
                ? "No previous history available."
                : "Select an investigation to view result trend."}
            </div>
          )}
        </div>
      </div>

      {/* REFERENCE RANGE DETAILS */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-4 text-xs shadow-sm overflow-x-auto">
        <span className="font-bold text-blue-800 block border-b border-gray-100 pb-2 text-[15px] whitespace-nowrap">
          Reference Range Details
        </span>

        <div className="grid grid-cols-[max-content_12px_1fr] items-center gap-x-1.5 gap-y-4 pt-2 whitespace-nowrap">
          {/* <span className="text-gray-600">Age / Gender</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900">Adult / Male</span> */}

          <span className="text-gray-600">Method</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900">{resultHistory[0]?.MethodName || "N/A"}</span>

          <span className="text-gray-600">Reference Range</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900">{resultHistory[0]?.DisplayRange || "N/A"}</span>

          <span className="text-gray-600">Minimum Value</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900">{resultHistory[0]?.MinValue || "N/A"}</span>

          <span className="text-gray-600">Maximum Value</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900">{resultHistory[0]?.MaxValue || "N/A"}</span>

          <span className="text-gray-600">Unit</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900">{resultHistory[0]?.Unit || "N/A"}</span>
        </div>
      </div>

      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default LabInfoRightChart;
