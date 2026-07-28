import { PastMedicineEntry, PATIENT_MEDICINE_HISTORY } from "@/data/medicineVisitHistory";
import { showSuccess } from "@/utils/alert";
import { useEffect, useState } from "react";
import { MedicineDoseScheduleRow, MedicineListEntry } from "./MedicineListControl";

export interface PreviousMedicinesPanelProps {
  onApply: (entries: MedicineListEntry[]) => void;
}

const formatVisitDateLabel = (iso: string) => {
  const [year, month, day] = iso.split("-");
  return `${day}-${month}-${year}`;
};

const toScheduleRow = (entry: PastMedicineEntry): MedicineDoseScheduleRow => ({
  id: crypto.randomUUID(),
  doseQty: entry.doseQty,
  doseUnit: entry.doseUnit,
  frequency: entry.frequency,
  durationValue: entry.durationValue,
  durationUnit: entry.durationUnit,
  route: entry.route,
});

/** Medicines' own "Previous Visits" panel — same tabbed/checkbox interaction as
 * PreviousVisitsTablePanel, but kept separate since a medicine's own row shape (name + a full
 * dose schedule) doesn't fit the generic column/value grid the other sections share */
const PreviousMedicinesPanel = ({ onApply }: PreviousMedicinesPanelProps) => {
  const visits = PATIENT_MEDICINE_HISTORY;
  const [activeVisitDate, setActiveVisitDate] = useState(visits[0]?.visitDate ?? "");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeVisitDate]);

  if (visits.length === 0) return null;

  const activeVisit = visits.find(v => v.visitDate === activeVisitDate) ?? visits[0];
  const entries = activeVisit?.entries ?? [];
  const allSelected = entries.length > 0 && entries.every(e => selectedIds.has(e.id));

  const toggleOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(entries.map(e => e.id)));
  };

  const handleCopyToCurrent = () => {
    if (selectedIds.size === 0) return;

    const newEntries: MedicineListEntry[] = entries
      .filter(e => selectedIds.has(e.id))
      .map(e => ({
        id: crypto.randomUUID(),
        medicineName: e.medicineName,
        isTapering: false,
        isVariableDose: false,
        favourite: false,
        schedule: [toScheduleRow(e)],
      }));

    onApply(newEntries);
    showSuccess(`${newEntries.length} medicine(s) copied to current visit`);
    setSelectedIds(new Set());
  };

  return (
    <div className="bg-white border-b border-slate-100">
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
                  disabled={entries.length === 0}
                />
              </th>
              <th className="px-4 py-3 text-[13px] font-semibold text-slate-800">Medicine Name</th>
              <th className="px-4 py-3 text-[13px] font-semibold text-slate-800">Dose</th>
              <th className="px-4 py-3 text-[13px] font-semibold text-slate-800">Frequency</th>
              <th className="px-4 py-3 text-[13px] font-semibold text-slate-800">Duration</th>
              <th className="px-4 py-3 text-[13px] font-semibold text-slate-800">Route</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-400">
                  No medicines recorded for this visit
                </td>
              </tr>
            ) : (
              entries.map(entry => (
                <tr
                  key={entry.id}
                  className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70 transition-colors"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(entry.id)}
                      onChange={() => toggleOne(entry.id)}
                    />
                  </td>
                  <td className="px-4 py-3 text-[13px] text-slate-700">{entry.medicineName}</td>
                  <td className="px-4 py-3 text-[13px] text-slate-600">
                    {entry.doseQty} {entry.doseUnit}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-slate-600">{entry.frequency}</td>
                  <td className="px-4 py-3 text-[13px] text-slate-600">
                    {entry.durationValue} {entry.durationUnit}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-slate-600">{entry.route}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PreviousMedicinesPanel;
