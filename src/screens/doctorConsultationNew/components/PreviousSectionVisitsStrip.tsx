import { EmrSectionVisitSnapshotEntry } from "@/store/useEmrSectionHistoryStore";
import { showSuccess } from "@/utils/alert";
import { useEffect, useState } from "react";

export interface PreviousSectionVisitsStripProps {
  /** already capped/sliced by the caller — EmrSectionRenderer passes the 6 most recent, the
   * History popup passes every snapshot it has */
  snapshots: EmrSectionVisitSnapshotEntry[];
  onCopyToCurrent: (values: EmrSectionVisitSnapshotEntry["values"]) => void;
}

const formatTabDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}-${month}-${d.getFullYear()}`;
};

const formatSnapshotValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return `${value.length} item${value.length === 1 ? "" : "s"}`;
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

// a card-group/genericAttributeGroup header's value (Chief Complaints, Family History, Procedure,
// Diagnosis, etc.) is an array of row-objects, e.g. [{ Complaints: "...", Duration: "...",
// Severity: "..." }] — worth expanding into its own mini-table of real columns/values instead of
// collapsing to "N item(s)", the same way the live control itself renders that row
const isRowArray = (value: unknown): value is Record<string, unknown>[] =>
  Array.isArray(value) && value.length > 0 && value.every(isPlainObject);

// internal bookkeeping keys aren't meant for display: "__ComplaintsId"-style keys are the
// matched-LOV-option id CardGroupControl stores alongside a field's display value, and a plain
// "id" is just that entry's own identifier (MedicineListEntry.id, MedicineDoseScheduleRow.id, ...)
const isDisplayKey = (key: string) => key !== "id" && !key.startsWith("__");

const rowArrayColumns = (rows: Record<string, unknown>[]): string[] => {
  const keys = new Set<string>();
  rows.forEach(row =>
    Object.keys(row)
      .filter(isDisplayKey)
      .forEach(key => keys.add(key))
  );
  return Array.from(keys);
};

const titleCaseKey = (key: string) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, c => c.toUpperCase())
    .trim();

const formatCellValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

// a cell can itself hold an array of row-objects — e.g. a medicine entry's "schedule"
// (dose/frequency/duration/route per tapering step) — so this renders its own header row of real
// column names, same as the outer table, recursing however deep the nesting goes instead of
// falling through to formatCellValue's raw JSON.stringify dump.
const NestedRowTable = ({ rows }: { rows: Record<string, unknown>[] }) => {
  const columns = rowArrayColumns(rows);
  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-slate-100">
          {columns.map(key => (
            <th
              key={key}
              className="pr-4 py-1 text-[11px] font-semibold text-slate-500 whitespace-nowrap"
            >
              {titleCaseKey(key)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((entry, idx) => (
          <tr key={idx} className="border-b border-slate-50 last:border-b-0">
            {columns.map(key => (
              <td key={key} className="pr-4 py-1 align-top whitespace-nowrap">
                {renderCell(entry[key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const renderCell = (value: unknown) =>
  isRowArray(value) ? <NestedRowTable rows={value} /> : formatCellValue(value);

/**
 * Per-section "past visit" tab strip — pick a past visit date, select which of its fields to
 * bring over, Copy to Current. Same interaction PreviousInvestigationsPanel already established
 * for the Investigations table, generalized to any section's plain headerId/value snapshot
 * instead of investigation-specific columns. Shared between EmrSectionRenderer (inline, capped
 * at 6 recent visits) and EmrSectionHistoryDrawer (uncapped, inside "Past Visits") so both stay
 * behaviorally identical.
 */
const PreviousSectionVisitsStrip = ({
  snapshots,
  onCopyToCurrent,
}: PreviousSectionVisitsStripProps) => {
  const [activeSnapshotId, setActiveSnapshotId] = useState(snapshots[0]?.id ?? "");
  const [selectedHeaderIds, setSelectedHeaderIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!snapshots.some(s => s.id === activeSnapshotId)) {
      setActiveSnapshotId(snapshots[0]?.id ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshots]);

  useEffect(() => {
    setSelectedHeaderIds(new Set());
  }, [activeSnapshotId]);

  if (snapshots.length === 0) return null;

  const activeSnapshot = snapshots.find(s => s.id === activeSnapshotId) ?? snapshots[0];
  const rows = activeSnapshot.values;
  const allSelected = rows.length > 0 && rows.every(r => selectedHeaderIds.has(r.headerId));

  const toggleOne = (headerId: number) => {
    setSelectedHeaderIds(prev => {
      const next = new Set(prev);
      if (next.has(headerId)) next.delete(headerId);
      else next.add(headerId);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedHeaderIds(allSelected ? new Set() : new Set(rows.map(r => r.headerId)));
  };

  const handleCopy = () => {
    if (selectedHeaderIds.size === 0) return;
    onCopyToCurrent(rows.filter(r => selectedHeaderIds.has(r.headerId)));
    showSuccess(
      `Copied ${selectedHeaderIds.size} field(s) from ${formatTabDate(activeSnapshot.recordedOn)}`
    );
    setSelectedHeaderIds(new Set());
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden mb-3">
      <div className="flex items-stretch justify-between border-b border-slate-200 bg-gradient-to-r from-blue-50 via-sky-50/40 to-white">
        <div className="flex items-stretch divide-x divide-slate-200 overflow-x-auto">
          {snapshots.map(s => {
            const isActive = s.id === activeSnapshotId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSnapshotId(s.id)}
                className={`shrink-0 px-4 py-2 text-[12.5px] font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-b-[#0B5394] text-slate-800"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {formatTabDate(s.recordedOn)}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 px-3 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            disabled={selectedHeaderIds.size === 0}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold border shadow-sm transition-colors whitespace-nowrap ${
              selectedHeaderIds.size > 0
                ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                : "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            Copy to Current {selectedHeaderIds.size > 0 ? `(${selectedHeaderIds.size})` : ""}
          </button>
        </div>
      </div>

      <div className="overflow-auto max-h-56">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="w-10 px-4 py-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  disabled={rows.length === 0}
                />
              </th>
              <th className="px-4 py-2 text-[12.5px] font-semibold text-slate-800">Field</th>
              <th className="px-4 py-2 text-[12.5px] font-semibold text-slate-800">Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-5 text-center text-sm text-slate-400">
                  No values recorded for this visit
                </td>
              </tr>
            ) : (
              rows.map(r => {
                const rowArray = isRowArray(r.value) ? r.value : undefined;

                return (
                  <tr
                    key={r.headerId}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-4 py-2 align-top">
                      <input
                        type="checkbox"
                        checked={selectedHeaderIds.has(r.headerId)}
                        onChange={() => toggleOne(r.headerId)}
                      />
                    </td>
                    <td className="px-4 py-2 text-[12.5px] text-slate-700 align-top whitespace-nowrap">
                      {r.headerName}
                    </td>
                    <td className="px-4 py-2 text-[12.5px] text-slate-600">
                      {rowArray ? (
                        <div className="overflow-x-auto">
                          <NestedRowTable rows={rowArray} />
                        </div>
                      ) : (
                        formatSnapshotValue(r.value)
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PreviousSectionVisitsStrip;
