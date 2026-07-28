import { showSuccess, showWarning } from "@/utils/alert";
import { useEffect, useState } from "react";
import { PreviousVisitEntry, TableColumnSchema } from "./types";

export interface PreviousVisitsTablePanelProps {
  /** live column config for the current control, used both to render the table header and to
   * resolve each dummy row's value per column (see resolveRowValue below) */
  columns: TableColumnSchema[];
  visits: PreviousVisitEntry[];
  onApply: (rows: Record<string, unknown>[]) => void;
  /** shown in the empty-state row when a visit has no entries — defaults to a generic message */
  emptyLabel?: string;
}

const formatVisitDateLabel = (iso: string) => {
  const [year, month, day] = iso.split("-");
  return `${day}-${month}-${year}`;
};

const normalizeKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// dummy rows may be keyed exactly like the column's own key (e.g. genericAttributeGroup's
// camelCase "diagnosisType"), or only resemble the column's label text (e.g. table columns whose
// key is a raw LOV label like "Service Name" while the dummy data uses "serviceName") — try an
// exact key match first, then fall back to a normalized label match so either convention works
const resolveRowValue = (row: Record<string, unknown>, column: TableColumnSchema): unknown => {
  if (column.key in row) return row[column.key];
  const target = normalizeKey(column.label);
  const matchKey = Object.keys(row).find(k => normalizeKey(k) === target);
  return matchKey ? row[matchKey] : undefined;
};

const PreviousVisitsTablePanel = ({
  columns,
  visits,
  onApply,
  emptyLabel = "No entries recorded for this visit",
}: PreviousVisitsTablePanelProps) => {
  const [activeVisitDate, setActiveVisitDate] = useState(visits[0]?.visitDate ?? "");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeVisitDate]);

  if (visits.length === 0 || columns.length === 0) return null;

  const activeVisit = visits.find(v => v.visitDate === activeVisitDate) ?? visits[0];
  const rows = activeVisit?.rows ?? [];
  const allSelected = rows.length > 0 && rows.every(r => selectedIds.has(r.id));

  const toggleOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(rows.map(r => r.id)));
  };

  const handleCopyToCurrent = () => {
    if (selectedIds.size === 0) return;

    const applied = rows
      .filter(r => selectedIds.has(r.id))
      .map(r => {
        const row: Record<string, unknown> = {};
        columns.forEach(col => {
          const val = resolveRowValue(r, col);
          if (val !== undefined) row[col.key] = val;
        });
        return row;
      });

    if (applied.every(r => Object.keys(r).length === 0)) {
      showWarning("Could not match this visit's data to the current columns");
      return;
    }

    onApply(applied);
    showSuccess(`${applied.length} entr${applied.length === 1 ? "y" : "ies"} copied to current visit`);
    setSelectedIds(new Set());
  };

  return (
    <div className="bg-white">
      <div className="flex items-stretch justify-between border-b border-slate-200 bg-slate-50">
        <div className="flex items-stretch divide-x divide-slate-200 overflow-x-auto">
          {visits.map(v => {
            const isActive = activeVisitDate === v.visitDate;
            return (
              <button
                key={v.visitDate}
                type="button"
                onClick={() => setActiveVisitDate(v.visitDate)}
                className={`shrink-0 px-5 py-2.5 text-[13px] font-semibold border-t-[3px] transition-colors ${
                  isActive
                    ? "bg-white border-t-[#0B5394] text-slate-800"
                    : "bg-slate-50 border-t-transparent text-slate-500 hover:bg-white/70 hover:text-slate-700"
                }`}
              >
                {formatVisitDateLabel(v.visitDate)}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 px-3 shrink-0">
          <button
            type="button"
            onClick={handleCopyToCurrent}
            disabled={selectedIds.size === 0}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold border shadow-sm transition-colors ${
              selectedIds.size > 0
                ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                : "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            Copy to Current {selectedIds.size > 0 ? `(${selectedIds.size})` : ""}
          </button>
        </div>
      </div>

      <div className="overflow-auto max-h-56">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  disabled={rows.length === 0}
                />
              </th>
              {columns.map(col => (
                <th key={col.key} className="px-4 py-3 text-[13px] font-semibold text-slate-800">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-6 text-center text-sm text-slate-400">
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              rows.map(row => (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70 transition-colors"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(row.id)}
                      onChange={() => toggleOne(row.id)}
                    />
                  </td>
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 text-[13px] text-slate-600">
                      {String(resolveRowValue(row, col) ?? "—")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PreviousVisitsTablePanel;
