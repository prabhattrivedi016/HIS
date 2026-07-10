import { useEffect, useState } from "react";
import { History, LineChart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import VitalGraph from "./VitalGraph";
import VitalHistory from "./VitalHistory";

interface PatientVitalEntry {
  VitalId: number;
  VitalName: string;
  VitalValue: string;
  Id: number;
  CreatedOn: string;
}

interface PatientVitalGroup {
  vitalDateTime: string;
  visitId: number;
  vitals: PatientVitalEntry[];
}

interface VitalInsightsProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: number;
  vitalsList: string[];
}

type TabKey = "history" | "graph";

const VitalInsights = ({ isOpen, onClose, patientId, vitalsList }: VitalInsightsProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>("history");
  const { fetchApi } = useGlobalApi();

  useEffect(() => {
    if (isOpen) setActiveTab("history");
  }, [isOpen]);

  const getPatientVitalRecords = async (): Promise<PatientVitalGroup[]> => {
    if (!patientId) return [];
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PATIENT_VITAL,
      {},
      { params: { patientId } },
      { component: "VitalInsights" }
    );
    return resp?.data ?? [];
  };

  const { data: vitalRecords = [] } = useQuery({
    queryKey: ["getPatientVital", patientId],
    queryFn: getPatientVitalRecords,
    enabled: isOpen && !!patientId,
  });

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[88] bg-black/30" onClick={onClose} />

      <div className="fixed inset-0 z-[89] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white w-full max-w-6xl rounded-xl shadow-2xl flex flex-col pointer-events-auto"
          style={{ height: 660, maxHeight: "90vh" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50 rounded-t-xl shrink-0">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Vital Insights</h3>
            <button className="close-drawer-btn" onClick={onClose}>&times;</button>
          </div>

          {/* Tabs */}
          <div className="flex border-b px-5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                activeTab === "history"
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              <History size={14} />
              Vital History
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("graph")}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                activeTab === "graph"
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              <LineChart size={14} />
              Vital Graph
            </button>
          </div>

          <VitalHistory
            isOpen={isOpen && activeTab === "history"}
            vitalsList={vitalsList}
            vitalRecords={vitalRecords}
          />
          <VitalGraph
            isOpen={isOpen && activeTab === "graph"}
            vitalsList={vitalsList}
            vitalRecords={vitalRecords}
          />
        </div>
      </div>
    </>
  );
};

export default VitalInsights;
