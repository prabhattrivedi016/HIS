import { SectionHeaderMappingRecord } from "@/screens/emrControls/types";
import { useEmrSectionHistoryStore } from "@/store/useEmrSectionHistoryStore";
import { showSuccess } from "@/utils/alert";
import { Copy, History as HistoryIcon, ListChecks, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePatientVisitHistory } from "../hooks/usePatientVisitHistory";
import { EmrSectionVisitSnapshotEntry } from "../types";
import { applySnapshotToSectionData, buildVisitSnapshots } from "../utils/sectionSnapshot";
import PreviousSectionVisitsStrip from "./PreviousSectionVisitsStrip";

interface HistorySectionOption {
  sectionId: number;
  sectionName: string;
  displayName?: string;
}

interface EmrSectionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: number;
  /** every section the patient can be viewed for, not just the one History was opened from —
   * lets a doctor switch and see another section's history without closing the drawer */
  sections: HistorySectionOption[];
  /** headers per section, as collected by ConsultationEmrSections from each EmrSectionRenderer
   * it has rendered so far — a section not visited yet won't have its headers here */
  headersBySection: Record<number, SectionHeaderMappingRecord[]>;
  /** which section to show first — the one the History button was clicked from */
  initialSectionId: number;
  /** setter for the live EMR data blob — needed so "Copy to Current" on a past visit can write
   * straight back into whichever section is currently selected in this drawer */
  onDataChange: (
    data: Record<string, unknown> | ((prev: Record<string, unknown>) => Record<string, unknown>)
  ) => void;
}

type TabKey = "visits" | "editLog";

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const sectionLabel = (s: HistorySectionOption) => s.displayName || s.sectionName;

/**
 * "Past Visits" reads real data via usePatientVisitHistory (GET_PATIENT_VISIT_DETAILS_BY_PATIENT_ID
 * + GET_DOCTOR_CONSULTATION_BY_VISIT_ID per past visit). "Edit Log" still reads from
 * useEmrSectionHistoryStore (localStorage) — a stand-in for GET_EMR_SECTION_EDIT_LOG until that
 * exists on the backend (see the TODO in config/defaults/index.ts).
 * Chrome mirrors VitalInsights.tsx/VitalHistory.tsx so it reads as the same feature.
 */
const EmrSectionHistoryDrawer = ({
  isOpen,
  onClose,
  patientId,
  sections,
  headersBySection,
  initialSectionId,
  onDataChange,
}: EmrSectionHistoryDrawerProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>("visits");
  const [selectedSectionId, setSelectedSectionId] = useState(initialSectionId);
  // subscribe to the raw array (whose identity never changes across store updates) so a
  // Save-triggered logEdit actually re-renders this drawer instead of only showing up after it's
  // closed and reopened
  const editLogRaw = useEmrSectionHistoryStore(s => s.editLog);
  const {
    isLoading: isHistoryLoading,
    getSectionRows,
    visits,
  } = usePatientVisitHistory(patientId);
  const [copyVisitId, setCopyVisitId] = useState<number | "">("");

  useEffect(() => {
    if (isOpen) setSelectedSectionId(initialSectionId);
  }, [isOpen, initialSectionId]);

  const selectedSection = sections.find(s => s.sectionId === selectedSectionId);
  const selectedHeaders = useMemo(
    () => headersBySection[selectedSectionId] ?? [],
    [headersBySection, selectedSectionId]
  );

  const visitSnapshots = useMemo(
    () => buildVisitSnapshots(selectedSectionId, getSectionRows(selectedSectionId), selectedHeaders),
    [selectedSectionId, getSectionRows, selectedHeaders]
  );
  const editLog = useMemo(
    () =>
      patientId ? useEmrSectionHistoryStore.getState().getEditLog(patientId, selectedSectionId) : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [patientId, selectedSectionId, editLogRaw]
  );

  const handleCopySnapshotValues = (values: EmrSectionVisitSnapshotEntry["values"]) => {
    onDataChange(prev =>
      applySnapshotToSectionData(prev, selectedSectionId, selectedHeaders, values)
    );
  };

  // bulk version of the above — copies EVERY section a past visit touched, not just whichever
  // one is currently selected. Mirrors ConsultationEmrSections' handleApplyCarePlan (same
  // per-section applySnapshotToSectionData loop over one setData call), just fed from a past
  // visit's rows instead of a care plan's.
  const handleCopyWholeVisit = () => {
    if (copyVisitId === "") return;
    const visit = visits.find(v => v.visitId === copyVisitId);
    if (!visit) return;
    if (
      !window.confirm(
        `Copy ALL sections' data from ${formatDateTime(visit.recordedOn)} into the current visit? This will overwrite any data already entered in those sections.`
      )
    ) {
      return;
    }

    const rowsBySectionId = new Map<number, EmrSectionVisitSnapshotEntry["values"]>();
    visit.rows.forEach(row => {
      let value: unknown;
      try {
        value = JSON.parse(row.HeaderValue);
      } catch {
        value = row.HeaderValue;
      }
      const bucket = rowsBySectionId.get(row.SectionId) ?? [];
      bucket.push({ headerId: row.HeaderId, headerName: "", controlType: "", value });
      rowsBySectionId.set(row.SectionId, bucket);
    });

    onDataChange(prev => {
      let next = prev;
      rowsBySectionId.forEach((values, sectionId) => {
        next = applySnapshotToSectionData(next, sectionId, headersBySection[sectionId] ?? [], values);
      });
      return next;
    });
    showSuccess(`Copied ${rowsBySectionId.size} section(s) from ${formatDateTime(visit.recordedOn)}`);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[88] bg-black/30" onClick={onClose} />

      <div className="fixed inset-0 z-[89] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="emr-modal-panel bg-white w-full max-w-5xl rounded-xl shadow-2xl flex flex-col pointer-events-auto"
          style={{ height: 640, maxHeight: "90vh" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50 rounded-t-xl shrink-0">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
              {selectedSection ? sectionLabel(selectedSection) : "Section"} History
            </h3>
            <button className="close-drawer-btn" onClick={onClose}>
              &times;
            </button>
          </div>

          {/* Section switcher — jump to any other section's history without closing the drawer */}
          <div className="emr-modal-toolbar flex items-center gap-2 px-5 py-2.5 border-b shrink-0">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide shrink-0">
              Section
            </span>
            <select
              className="emr-modal-select input-field !mb-0 !py-1.5 text-xs w-64"
              value={selectedSectionId}
              onChange={e => setSelectedSectionId(Number(e.target.value))}
            >
              {sections.map(s => (
                <option key={s.sectionId} value={s.sectionId}>
                  {sectionLabel(s)}
                </option>
              ))}
            </select>
          </div>

          {/* Copy whole visit — bulk version of the per-section "Copy to Current" below; applies
              to every section a past visit touched at once, so it doesn't depend on which section
              is currently selected above */}
          <div className="emr-modal-toolbar flex items-center gap-2 px-5 py-2.5 border-b shrink-0 bg-slate-50/60">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide shrink-0">
              Copy whole visit
            </span>
            <select
              className="emr-modal-select input-field !mb-0 !py-1.5 text-xs flex-1"
              value={copyVisitId}
              onChange={e => setCopyVisitId(e.target.value === "" ? "" : Number(e.target.value))}
              disabled={visits.length === 0}
            >
              <option value="">Select a past visit…</option>
              {visits.map(v => (
                <option key={v.visitId} value={v.visitId}>
                  {formatDateTime(v.recordedOn)} — Dr. {v.doctorName || "—"}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleCopyWholeVisit}
              disabled={copyVisitId === ""}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B5394] border border-[#0B5394]/30 rounded-md px-2.5 py-1.5 hover:bg-[#0B5394]/5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors shrink-0"
            >
              <Copy size={13} />
              Copy Whole Visit
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b px-5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("visits")}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                activeTab === "visits"
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              <HistoryIcon size={14} />
              Past Visits
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("editLog")}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                activeTab === "editLog"
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              <ListChecks size={14} />
              Edit Log
            </button>
          </div>

          {activeTab === "visits" ? (
            <div className="flex-1 flex flex-col min-h-0 px-5 py-3 overflow-y-auto">
              {isHistoryLoading ? (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400 py-10">
                  <Loader2 size={16} className="animate-spin" />
                  Loading past visits…
                </div>
              ) : selectedHeaders.length === 0 && visitSnapshots.length === 0 ? (
                <p className="table-empty">Open this section at least once to load its history</p>
              ) : visitSnapshots.length === 0 ? (
                <p className="table-empty">No past-visit history found for this section.</p>
              ) : (
                <PreviousSectionVisitsStrip
                  snapshots={visitSnapshots}
                  onCopyToCurrent={handleCopySnapshotValues}
                />
              )}
            </div>
          ) : (
            <div className="flex-1 min-h-0 px-5 py-3 overflow-y-auto">
              {selectedHeaders.length === 0 && editLog.length === 0 ? (
                <p className="table-empty">Open this section at least once to load its history</p>
              ) : editLog.length === 0 ? (
                <p className="table-empty">No edits recorded yet</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {editLog.map(entry => (
                    <li
                      key={entry.id}
                      className="border border-gray-100 rounded-lg px-3 py-2 bg-gray-50/60"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-gray-700">
                          {entry.headerName}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {formatDateTime(entry.changedOn)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        <span className="text-red-500 line-through">
                          {formatValue(entry.oldValue)}
                        </span>
                        {" → "}
                        <span className="text-emerald-600 font-medium">
                          {formatValue(entry.newValue)}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        by {entry.changedByName || "Unknown"}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EmrSectionHistoryDrawer;
