import ToothIcon, {
  toothCategoryForNumber,
} from "@/screens/doctorConsultationNew/components/ToothIcon";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { DentalProcedure } from "./DentalChartControl";

type SelectionType = "multiple" | "single";

interface OtherTreatmentModalProps {
  /** teeth staged for this treatment, ascending */
  teeth: number[];
  /** the client-side "Procedures" list shared across the whole dental chart, so a name picked/
   * created here is reusable next time "Other Treatments" is used */
  procedures: DentalProcedure[];
  onAddProcedure: (procedure: DentalProcedure) => void;
  onSave: (treatment: { name: string; price: number; qty: number }) => void;
  onClose: () => void;
}

/** "Add Treatment" popup for the dental chart's "Other Treatments" mode — picks/creates a
 * procedure (name + price, reused across future entries) and a billing mode that fixes the row's
 * qty once and for all: one line per tooth ("Multiple units") or a single flat charge covering
 * every selected tooth ("Single unit"). */
const OtherTreatmentModal = ({
  teeth,
  procedures,
  onAddProcedure,
  onSave,
  onClose,
}: OtherTreatmentModalProps) => {
  const [selectionType, setSelectionType] = useState<SelectionType>("multiple");
  const [query, setQuery] = useState("");
  const [price, setPrice] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCreateProcedure, setShowCreateProcedure] = useState(false);
  const [newProcedureName, setNewProcedureName] = useState("");
  const [newProcedurePrice, setNewProcedurePrice] = useState(0);
  const [newProcedureCategory, setNewProcedureCategory] = useState("");

  const categories = useMemo(
    () => Array.from(new Set(procedures.map(p => p.category).filter((c): c is string => !!c))),
    [procedures]
  );

  const filteredProcedures = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? procedures.filter(p => p.name.toLowerCase().includes(q)) : procedures;
  }, [procedures, query]);

  const hasExactMatch = procedures.some(p => p.name.toLowerCase() === query.trim().toLowerCase());
  const qty = selectionType === "multiple" ? teeth.length : 1;
  const canSave = query.trim().length > 0;

  const selectProcedure = (p: DentalProcedure) => {
    setQuery(p.name);
    setPrice(p.price);
    setDropdownOpen(false);
  };

  const openCreateProcedure = () => {
    setNewProcedureName(query.trim());
    setNewProcedurePrice(0);
    setNewProcedureCategory("");
    setShowCreateProcedure(true);
    setDropdownOpen(false);
  };

  const confirmCreateProcedure = () => {
    const name = newProcedureName.trim();
    if (!name) return;
    const procedure: DentalProcedure = {
      id: `proc-${Date.now()}`,
      name,
      price: newProcedurePrice,
      category: newProcedureCategory.trim() || undefined,
    };
    onAddProcedure(procedure);
    setQuery(procedure.name);
    setPrice(procedure.price);
    setShowCreateProcedure(false);
  };

  const handleSave = () => {
    if (!canSave) return;
    onSave({ name: query.trim(), price, qty });
  };

  return createPortal(
    <div className="fixed inset-0 z-999">
      <div className="popup-bg-overlay" onClick={onClose} />
      <div className="central-popup w-[92vw] max-w-lg opacity-full">
        <div className="popup-header">
          <h2 className="popup-helper-text">Add Treatment</h2>
          <button onClick={onClose} className="close-drawer-btn">
            &times;
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-semibold text-slate-500">
                Treatment Plan for Selected Teeth
              </p>
              <span className="text-[11px] text-slate-400">({teeth.length} Selected)</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {teeth.map(tooth => (
                <div
                  key={tooth}
                  className="flex flex-col items-center justify-center gap-0.5 w-10 h-11 rounded-lg border border-slate-200 bg-slate-50 shrink-0"
                >
                  <ToothIcon category={toothCategoryForNumber(tooth)} size={16} />
                  <span className="text-[10px] font-semibold text-slate-500">{tooth}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="input-label block mb-1.5">Selection Type *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectionType("multiple")}
                className={`text-left rounded-xl border p-3 transition-colors ${
                  selectionType === "multiple"
                    ? "border-teal-500 bg-teal-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <p className="text-xs font-bold text-slate-700">Multiple units</p>
                <p className="text-[11px] text-slate-400 mb-1.5">Bill each tooth separately</p>
                <span className="text-[11px] font-semibold text-teal-600">Qty {teeth.length}</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectionType("single")}
                className={`text-left rounded-xl border p-3 transition-colors ${
                  selectionType === "single"
                    ? "border-teal-500 bg-teal-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <p className="text-xs font-bold text-slate-700">Single unit</p>
                <p className="text-[11px] text-slate-400 mb-1.5">One charge for all teeth</p>
                <span className="text-[11px] font-semibold text-teal-600">Qty 1</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <label className="input-label block mb-1.5">Treatment</label>
            <input
              type="text"
              className="input-field !mb-0"
              placeholder="Select or type a treatment"
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                setDropdownOpen(true);
              }}
              onFocus={() => setDropdownOpen(true)}
              onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
            />
            {dropdownOpen && (
              <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                {filteredProcedures.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectProcedure(p)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-50 text-left"
                  >
                    <span className="text-slate-700">{p.name}</span>
                    <span className="text-slate-400 text-xs">₹{p.price}</span>
                  </button>
                ))}
                {!filteredProcedures.length && !query.trim() && (
                  <div className="px-3 py-2 text-sm text-gray-400">
                    No treatments yet — type to add one
                  </div>
                )}
                {query.trim() && !hasExactMatch && (
                  <button
                    type="button"
                    onClick={openCreateProcedure}
                    className="w-full px-3 py-2 text-sm text-teal-600 font-semibold hover:bg-teal-50 text-left border-t border-slate-100"
                  >
                    + Add &quot;{query.trim()}&quot;
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label block mb-1.5">Price (₹)</label>
              <input
                type="number"
                min={0}
                className="input-field !mb-0"
                value={price}
                onChange={e => setPrice(Number(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="input-label block mb-1.5">Total</label>
              <p className="font-semibold text-slate-700 py-2">₹{price * qty}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-5">
          <button type="button" onClick={onClose} className="cancel-button !w-auto !px-5">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className={canSave ? "save-btn !w-auto !px-5" : "disabled-btn !w-auto !px-5"}
          >
            Add Treatment
          </button>
        </div>
      </div>

      {showCreateProcedure && (
        <>
          <div className="popup-bg-overlay" onClick={() => setShowCreateProcedure(false)} />
          <div className="central-popup w-[92vw] max-w-sm opacity-full">
            <div className="popup-header">
              <h2 className="popup-helper-text">New Procedure</h2>
              <button onClick={() => setShowCreateProcedure(false)} className="close-drawer-btn">
                &times;
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="input-label block mb-1.5">
                  Procedure name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  className="input-field !mb-0"
                  value={newProcedureName}
                  onChange={e => setNewProcedureName(e.target.value)}
                />
              </div>
              <div>
                <label className="input-label block mb-1.5">Price (₹)</label>
                <input
                  type="number"
                  min={0}
                  className="input-field !mb-0"
                  value={newProcedurePrice}
                  onChange={e => setNewProcedurePrice(Number(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="input-label block mb-1.5">Category</label>
                <input
                  type="text"
                  list="dental-procedure-categories"
                  className="input-field !mb-0"
                  placeholder="Select or type to create"
                  value={newProcedureCategory}
                  onChange={e => setNewProcedureCategory(e.target.value)}
                />
                <datalist id="dental-procedure-categories">
                  {categories.map(c => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setShowCreateProcedure(false)}
                className="cancel-button !w-auto !px-5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmCreateProcedure}
                disabled={!newProcedureName.trim()}
                className={
                  newProcedureName.trim() ? "save-btn !w-auto !px-5" : "disabled-btn !w-auto !px-5"
                }
              >
                Create Procedure
              </button>
            </div>
          </div>
        </>
      )}
    </div>,
    document.body
  );
};

export default OtherTreatmentModal;
