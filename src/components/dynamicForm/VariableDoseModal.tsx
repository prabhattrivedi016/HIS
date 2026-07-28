import { MEDICINE_WHEN_OPTIONS } from "@/config/medicineDoseOptions";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { VariableDoseDayEntry, VariableDoseSlot } from "./MedicineListControl";

export interface VariableDoseModalProps {
  medicineName: string;
  unit: string;
  durationValue: string;
  durationUnit: string;
  initialSchedule?: VariableDoseDayEntry[];
  onSave: (schedule: VariableDoseDayEntry[]) => void;
  onClose: () => void;
}

const emptySlot = (): VariableDoseSlot => ({ dose: "", time: "", when: "" });

const formatDate = (d: Date) => {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${d.getFullYear()}`;
};

const estimateDayCount = (durationValue: string, durationUnit: string): number => {
  const n = Number(durationValue);
  if (!Number.isFinite(n) || n <= 0) return 1;
  const perUnit = durationUnit === "Week(s)" ? 7 : durationUnit === "Month(s)" ? 30 : 1;
  return Math.min(Math.round(n * perUnit), 60);
};

const buildDefaultSchedule = (
  durationValue: string,
  durationUnit: string
): VariableDoseDayEntry[] => {
  const dayCount = estimateDayCount(durationValue, durationUnit);
  const today = new Date();
  return Array.from({ length: dayCount }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const label = formatDate(date);
    return {
      id: crypto.randomUUID(),
      fromDate: label,
      toDate: label,
      days: "1",
      dose1: emptySlot(),
      dose2: emptySlot(),
    };
  });
};

const VariableDoseModal = ({
  medicineName,
  unit,
  durationValue,
  durationUnit,
  initialSchedule,
  onSave,
  onClose,
}: VariableDoseModalProps) => {
  const [rows, setRows] = useState<VariableDoseDayEntry[]>(
    initialSchedule && initialSchedule.length > 0
      ? initialSchedule
      : buildDefaultSchedule(durationValue, durationUnit)
  );

  const updateSlot = (
    rowId: string,
    slotKey: "dose1" | "dose2",
    patch: Partial<VariableDoseSlot>
  ) => {
    setRows(prev =>
      prev.map(r => (r.id === rowId ? { ...r, [slotKey]: { ...r[slotKey], ...patch } } : r))
    );
  };

  const removeRow = (rowId: string) => setRows(prev => prev.filter(r => r.id !== rowId));

  const renderSlot = (row: VariableDoseDayEntry, slotKey: "dose1" | "dose2") => {
    const slot = row[slotKey];
    return (
      <div className="flex items-center gap-1">
        <input
          type="text"
          placeholder="Dose"
          className="input-field !mb-0 !py-1 text-xs w-14 shrink-0"
          value={slot.dose}
          onChange={e => updateSlot(row.id, slotKey, { dose: e.target.value })}
        />
        <input
          type="time"
          className="input-field !mb-0 !py-1 text-xs w-24 shrink-0"
          value={slot.time}
          onChange={e => updateSlot(row.id, slotKey, { time: e.target.value })}
        />
        <select
          className="input-field !mb-0 !py-1 text-xs w-28 shrink-0"
          value={slot.when}
          onChange={e => updateSlot(row.id, slotKey, { when: e.target.value })}
        >
          <option value="">When</option>
          {MEDICINE_WHEN_OPTIONS.map(w => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-999">
      <div className="popup-bg-overlay" onClick={onClose} />
      <div className="central-popup !w-[97vw] !max-w-[1400px] opacity-full">
        <div className="popup-header">
          <h2 className="popup-helper-text">Variable Medication</h2>
          <button onClick={onClose} className="close-drawer-btn">
            ×
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-5 text-sm text-slate-700">
            <span>
              Medicine: <span className="font-semibold text-blue-700">{medicineName}</span>
            </span>
            <span>
              Unit: <span className="font-semibold">{unit || "-"}</span>
            </span>
            <span>
              Duration:{" "}
              <span className="font-semibold text-blue-700">
                {durationValue || "-"} {durationUnit || ""}
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              onSave(rows);
              onClose();
            }}
            className="save-btn !w-auto !px-5 !py-1.5 !text-sm"
          >
            Save
          </button>
        </div>

        <div className="table-scroll-wrapper">
          <div className="table-size max-h-[420px]">
            <table className="base-table">
              <thead className="table-head">
                <tr>
                  <th className="table-th">From Date</th>
                  <th className="table-th">To Date</th>
                  <th className="table-th">Days</th>
                  <th className="table-th">Dose 1</th>
                  <th className="table-th">Dose 2</th>
                  <th className="table-th">Dose 3</th>
                  <th className="table-th w-12 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-empty">
                      No days in schedule
                    </td>
                  </tr>
                ) : (
                  rows.map(row => (
                    <tr key={row.id} className="table-row">
                      <td className="table-td whitespace-nowrap">{row.fromDate}</td>
                      <td className="table-td whitespace-nowrap">{row.toDate}</td>
                      <td className="table-td">{row.days}</td>
                      <td className="table-td">{renderSlot(row, "dose1")}</td>
                      <td className="table-td">{renderSlot(row, "dose2")}</td>
                      <td className="table-td text-center">
                        <button type="button" onClick={() => removeRow(row.id)}>
                          <Trash2 size={14} className="text-gray-400 hover:text-gray-600" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default VariableDoseModal;
