import { PATIENT_INVESTIGATION_HISTORY } from "@/data/investigationVisitHistory";
import { showSuccess, showWarning } from "@/utils/alert";
import { useEffect, useState } from "react";
import { TableColumnSchema } from "./types";

export interface PreviousInvestigationsPanelProps {
  /** live column config for the current Investigations table, used to build rows keyed exactly
   * the way the real table expects (rather than hardcoding "Service Name" / "Order Type" strings) */
  columns: TableColumnSchema[];
  onApply: (rows: Record<string, unknown>[]) => void;
}

const formatVisitDateLabel = (iso: string) => {
  const [year, month, day] = iso.split("-");
  return `${day}-${month}-${year}`;
};

const formatDisplayDate = (iso: string) => {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
};

const PreviousInvestigationsPanel = ({ columns, onApply }: PreviousInvestigationsPanelProps) => {
  const visits = PATIENT_INVESTIGATION_HISTORY;
  const [activeVisitDate, setActiveVisitDate] = useState(visits[0]?.visitDate ?? "");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeVisitDate]);

  if (visits.length === 0) return null;

  const activeVisit = visits.find(v => v.visitDate === activeVisitDate);
  const orders = activeVisit?.orders ?? [];
  const allSelected = orders.length > 0 && orders.every(o => selectedIds.has(o.id));

  const toggleOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(orders.map(o => o.id)));
  };

  const handleCopyToCurrent = () => {
    if (selectedIds.size === 0) return;

    const serviceCol = columns.find(c => /service\s*name/i.test(c.label)) ?? columns[0];
    const orderTypeCol = columns.find(c => /order\s*type/i.test(c.label));
    const dateCol = columns.find(c => /date/i.test(c.label));

    if (!serviceCol) {
      showWarning("Could not determine table columns to copy into");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const rows = orders
      .filter(o => selectedIds.has(o.id))
      .map(o => {
        const row: Record<string, unknown> = { [serviceCol.key]: o.serviceName };
        if (orderTypeCol) row[orderTypeCol.key] = o.orderType;
        if (dateCol) row[dateCol.key] = today;
        return row;
      });

    onApply(rows);
    showSuccess(`${rows.length} investigation(s) copied to current visit`);
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
                  disabled={orders.length === 0}
                />
              </th>
              <th className="px-4 py-3 text-[13px] font-semibold text-slate-800">Service Name</th>
              <th className="px-4 py-3 text-[13px] font-semibold text-slate-800">Order Type</th>
              <th className="px-4 py-3 text-[13px] font-semibold text-slate-800">
                Investigation Date
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-400">
                  No investigations recorded for this visit
                </td>
              </tr>
            ) : (
              orders.map(order => (
                <tr
                  key={order.id}
                  className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70 transition-colors"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(order.id)}
                      onChange={() => toggleOne(order.id)}
                    />
                  </td>
                  <td className="px-4 py-3 text-[13px] text-slate-700">{order.serviceName}</td>
                  <td className="px-4 py-3 text-[13px] text-slate-600">{order.orderType}</td>
                  <td className="px-4 py-3 text-[13px] text-slate-600">
                    {formatDisplayDate(order.investigationDate)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PreviousInvestigationsPanel;
