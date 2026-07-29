import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import {
  MEDICINE_DOSE_MASTER_DEFAULTS,
  MEDICINE_DOSE_TIME_DEFAULTS,
  MEDICINE_DOSE_TIME_LABELS,
} from "@/config/medicineDoseOptions";
import useGlobalApi from "@/hooks/useGlobalApi";
import { DOSE_MASTER_QUERY_KEY, DoseMasterRecord, useDoseMasterList } from "@/hooks/useDoseMasterList";
import { showSuccess, showWarning } from "@/utils/alert";
import { useQueryClient } from "@tanstack/react-query";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";

export interface DoseMasterModalProps {
  onClose: () => void;
}

const MIN_SLOTS = 1;
const MAX_SLOTS = 6;
const DEFAULT_SLOTS = ["1", "1", "1"];
const DEFAULT_TIMES = MEDICINE_DOSE_TIME_DEFAULTS.slice(0, DEFAULT_SLOTS.length);

// shown only while the DB genuinely has zero saved patterns, so the popup isn't empty on first
// use — never written back to the server, and never shown at all once a real row exists
const FALLBACK_DOSES: DoseMasterRecord[] = MEDICINE_DOSE_MASTER_DEFAULTS.map(dose => ({
  DoseId: 0,
  Dose: dose,
  DoseTimes: "",
  DoseTimeLabels: "",
  IsActive: 1,
}));

const DoseMasterModal = ({ onClose }: DoseMasterModalProps) => {
  const { loading, fetchApi } = useGlobalApi();
  const queryClient = useQueryClient();
  const { doseMasterList, isLoading } = useDoseMasterList();
  const doses = doseMasterList.length > 0 ? doseMasterList : FALLBACK_DOSES;

  const [slots, setSlots] = useState<string[]>(DEFAULT_SLOTS);
  const [times, setTimes] = useState<string[]>(DEFAULT_TIMES);
  const [isSaving, setIsSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addSlot = () => {
    if (slots.length >= MAX_SLOTS) return;
    setSlots(prev => [...prev, "1"]);
    setTimes(prev => [...prev, MEDICINE_DOSE_TIME_DEFAULTS[prev.length] ?? ""]);
  };

  const removeSlot = () => {
    if (slots.length <= MIN_SLOTS) return;
    setSlots(prev => prev.slice(0, -1));
    setTimes(prev => prev.slice(0, -1));
  };

  const updateSlot = (index: number, value: string) => {
    setSlots(prev => prev.map((s, i) => (i === index ? value : s)));
  };

  const updateTime = (index: number, value: string) => {
    setTimes(prev => prev.map((t, i) => (i === index ? value : t)));
  };

  const handleRowClick = (idx: number) => {
    const item = doses[idx];
    const parts = item.Dose.split("-");
    const savedTimes = item.DoseTimes ? item.DoseTimes.split(",") : [];
    setSlots(parts.length > 0 ? parts : DEFAULT_SLOTS);
    setTimes(parts.map((_, i) => savedTimes[i] ?? MEDICINE_DOSE_TIME_DEFAULTS[i] ?? ""));
    setEditingIndex(idx);
  };

  // clears any active edit and resets the segment inputs — used both by "Cancel" (while editing)
  // and the "+ New" button above the list (to start a fresh dose without editing anything first)
  const resetToNewDose = () => {
    setEditingIndex(null);
    setSlots(DEFAULT_SLOTS);
    setTimes(DEFAULT_TIMES);
  };

  const handleOk = async () => {
    if (slots.some(s => !s.trim())) {
      showWarning("Please fill in every dose segment");
      return;
    }

    const pattern = slots.map(s => s.trim()).join("-");
    const isDuplicate = doses.some((d, idx) => d.Dose === pattern && idx !== editingIndex);
    if (isDuplicate) {
      showWarning(`${pattern} is already in the Dose Master`);
      return;
    }

    const editingItem = editingIndex !== null ? doses[editingIndex] : null;
    const doseTimes = times.map(t => t.trim()).join(",");
    const doseTimeLabels = slots
      .map((_, idx) => (MEDICINE_DOSE_TIME_LABELS[idx] ?? `Slot ${idx + 1}`).toUpperCase())
      .join(",");

    setIsSaving(true);
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_DOSE_MASTER,
      {
        doseId: editingItem?.DoseId ?? 0,
        dose: pattern,
        doseTimes,
        doseTimeLabels,
        isActive: 1,
      },
      {},
      { component: "DoseMasterModal" }
    );
    setIsSaving(false);

    if (!resp?.result) {
      showWarning(resp?.message ?? "Failed to save dose pattern");
      return;
    }

    showSuccess(resp?.message ?? "Dose pattern saved successfully");
    // refetches the shared list everywhere it's read (this popup and the Medicine List's
    // Dose Unit dropdown), so a newly created/edited pattern shows up automatically
    await queryClient.invalidateQueries({ queryKey: DOSE_MASTER_QUERY_KEY });

    setEditingIndex(null);
    setSlots(DEFAULT_SLOTS);
    setTimes(DEFAULT_TIMES);
  };

  return createPortal(
    <div className="fixed inset-0 z-999">
      <div className="popup-bg-overlay" onClick={onClose} />
      <div className="central-popup !w-[95vw] !max-w-6xl opacity-full">
        <div className="popup-header">
          <h2 className="popup-helper-text">Dose Master</h2>
          <button onClick={onClose} className="close-drawer-btn">
            ×
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">
          <div className="w-full lg:w-72 shrink-0">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Existing Doses
              </h3>
              <button
                type="button"
                onClick={resetToNewDose}
                title="Start a new dose pattern"
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-800"
              >
                <Plus size={12} />
                New
              </button>
            </div>
            <div className="table-scroll-wrapper">
              <div className="table-size lg:min-h-72 lg:max-h-72">
                <table className="base-table">
                  <thead className="table-head">
                    <tr>
                      <th className="table-th w-10">SNo</th>
                      <th className="table-th">Dose</th>
                      <th className="table-th">Period</th>
                      <th className="table-th">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doses.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="table-empty">
                          No doses found
                        </td>
                      </tr>
                    ) : (
                      doses.map((item, idx) => (
                        <tr
                          key={`${item.DoseId}-${item.Dose}`}
                          onClick={() => handleRowClick(idx)}
                          title="Click to edit this dose"
                          className={`table-row cursor-pointer ${
                            editingIndex === idx ? "bg-blue-50" : ""
                          }`}
                        >
                          <td className="table-td">{idx + 1}</td>
                          <td className="table-td font-medium text-slate-700">{item.Dose}</td>
                          <td className="table-td text-[11px] text-slate-500">
                            {item.DoseTimeLabels ? item.DoseTimeLabels.split(",").join(" / ") : "—"}
                          </td>
                          <td className="table-td text-[11px] text-slate-500">
                            {item.DoseTimes ? item.DoseTimes.split(",").join(" / ") : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <div>
              <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
                {editingIndex !== null ? "Edit Dose Pattern" : "Add New Dose Pattern"}
              </h3>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {slots.map((slot, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      {idx > 0 && <span className="text-slate-400 font-bold text-lg">.</span>}
                      <div className="flex flex-col items-center gap-1">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                          {MEDICINE_DOSE_TIME_LABELS[idx] ?? `Slot ${idx + 1}`}
                        </label>
                        <input
                          type="text"
                          className="input-field !mb-0 w-20 text-center bg-white"
                          value={slot}
                          onChange={e => updateSlot(idx, e.target.value)}
                        />
                        <input
                          type="time"
                          className="input-field !mb-0 w-20 !py-1 text-[11px] bg-white"
                          value={times[idx] ?? ""}
                          onChange={e => updateTime(idx, e.target.value)}
                          title="Time to take this dose"
                        />
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center gap-1.5 ml-2">
                    <button
                      type="button"
                      onClick={addSlot}
                      disabled={slots.length >= MAX_SLOTS}
                      title="Add a dose slot"
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-600 text-white shadow-sm hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                      <Plus size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={removeSlot}
                      disabled={slots.length <= MIN_SLOTS}
                      title="Remove the last dose slot"
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                      <Minus size={15} />
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mt-3">
                  Preview:{" "}
                  <span className="font-semibold text-slate-600">
                    {slots.map(s => s.trim() || "—").join("-")}
                  </span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Time:{" "}
                  <span className="font-semibold text-slate-600">
                    {times.map(t => t || "—").join(" / ")}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className={
                  isSaving ? "disabled-btn !w-auto !px-8 self-start" : "save-btn !w-auto !px-8 self-start"
                }
                disabled={isSaving}
                onClick={handleOk}
              >
                {isSaving ? "Saving…" : editingIndex !== null ? "Update" : "OK"}
              </button>
              {editingIndex !== null && (
                <button
                  type="button"
                  className="cancel-button !w-auto !px-8 self-start"
                  disabled={isSaving}
                  onClick={resetToNewDose}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {(loading || isLoading) && <CustomLoader isLoading={loading || isLoading} />}
      </div>
    </div>,
    document.body
  );
};

export default DoseMasterModal;
