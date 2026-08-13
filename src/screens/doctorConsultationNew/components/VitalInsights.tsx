import { useEffect, useMemo, useState } from "react";
import { History, LineChart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import VitalGraph from "./VitalGraph";
import VitalHistory from "./VitalHistory";

/** one row exactly as GET_PATIENT_VITAL returns it (confirmed contract — see the ENDPOINTS
 * comment): flat, no VitalName, every row from the same save batch shares one PatientVitalId */
interface RawPatientVitalRow {
  PatientVitalId: number;
  VisitId: number;
  VitalId: number;
  VitalValue: string;
  /** ISO */
  VitalDateTime: string;
}

/** shape VitalHistory/VitalGraph already render — built here by grouping RawPatientVitalRow[] by
 * PatientVitalId (one save batch = one row in the history table / one point on the graph) and
 * resolving VitalId -> name via vitalMasterList, since the raw rows don't carry names */
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

interface VitalMasterItem {
  vitalId: number;
  vitalName: string;
}

interface VitalInsightsProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: number;
  vitalsList: string[];
  vitalUnits?: Record<string, string>;
  /** for resolving each row's VitalId back to a real name — see PatientVitalGroup above */
  vitalMasterList: VitalMasterItem[];
}

type TabKey = "history" | "graph";

const VitalInsights = ({
  isOpen,
  onClose,
  patientId,
  vitalsList,
  vitalUnits,
  vitalMasterList,
}: VitalInsightsProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>("history");
  const { fetchApi } = useGlobalApi();

  useEffect(() => {
    if (isOpen) setActiveTab("history");
  }, [isOpen]);

  const getPatientVitalRecords = async (): Promise<RawPatientVitalRow[]> => {
    if (!patientId) return [];
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PATIENT_VITAL,
      {},
      // visitId 0 = every visit for this patient (confirmed) — Insights shows cross-visit
      // history/graph, unlike index.tsx's loadVitalsForPatient which scopes to one visit
      { params: { patientId, visitId: 0 } },
      { component: "VitalInsights" }
    );
    return resp?.data ?? [];
  };

  const { data: rawRows = [] } = useQuery({
    queryKey: ["getPatientVital", patientId],
    queryFn: getPatientVitalRecords,
    enabled: isOpen && !!patientId,
  });

  const vitalNameById = useMemo(
    () => new Map(vitalMasterList.map(v => [v.vitalId, v.vitalName])),
    [vitalMasterList]
  );

  const vitalRecords = useMemo<PatientVitalGroup[]>(() => {
    const byPatientVitalId = new Map<number, PatientVitalGroup>();
    rawRows.forEach(row => {
      const group = byPatientVitalId.get(row.PatientVitalId) ?? {
        vitalDateTime: row.VitalDateTime,
        visitId: row.VisitId,
        vitals: [],
      };
      group.vitals.push({
        VitalId: row.VitalId,
        VitalName: vitalNameById.get(row.VitalId) ?? `Vital ${row.VitalId}`,
        VitalValue: row.VitalValue,
        Id: row.PatientVitalId,
        CreatedOn: row.VitalDateTime,
      });
      byPatientVitalId.set(row.PatientVitalId, group);
    });
    return Array.from(byPatientVitalId.values()).sort((a, b) =>
      b.vitalDateTime.localeCompare(a.vitalDateTime)
    );
  }, [rawRows, vitalNameById]);

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
            vitalUnits={vitalUnits}
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
