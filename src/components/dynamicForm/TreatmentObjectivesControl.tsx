import {
  resolveTreatmentObjectivesConfig,
  TreatmentObjectiveOption,
} from "@/config/treatmentObjectivesConfig";
import { Check, Plus, X } from "lucide-react";
import { useState } from "react";
import { ControlSchema } from "./types";

export interface TreatmentObjectivesValue {
  selected?: string[];
  /** objectives added via "+ New Objective" that aren't in the config's default list */
  customObjectives?: TreatmentObjectiveOption[];
}

interface TreatmentObjectivesControlProps {
  schema: ControlSchema;
  value: unknown;
  onChange: (value: unknown) => void;
}

/** the one-off "Treatment Objectives" control — a multi-select tile grid with a live
 * "X of Y selected" badge and an inline "+ New Objective" form for adding a custom objective not
 * in the predefined list. Config-driven (config/treatmentObjectivesConfig.ts supplies the
 * starting objective list) — no header-specific logic lives here. */
const TreatmentObjectivesControl = ({
  schema,
  value,
  onChange,
}: TreatmentObjectivesControlProps) => {
  const config = resolveTreatmentObjectivesConfig(schema.gridConfigName ?? schema.label ?? "");
  const objectivesValue: TreatmentObjectivesValue = (value as TreatmentObjectivesValue) ?? {};
  const selected = objectivesValue.selected ?? [];
  const customObjectives = objectivesValue.customObjectives ?? [];
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  if (!config) {
    return <p className="text-sm text-gray-400">No grid configuration found for this header</p>;
  }

  const objectives = [...config.defaultObjectives, ...customObjectives];

  const toggleSelected = (key: string) => {
    onChange({
      ...objectivesValue,
      selected: selected.includes(key) ? selected.filter(k => k !== key) : [...selected, key],
    });
  };

  const handleAddObjective = () => {
    const title = newTitle.trim();
    if (!title) return;
    const key = `custom_${Date.now()}`;
    onChange({
      ...objectivesValue,
      customObjectives: [...customObjectives, { key, title, description: newDescription.trim() }],
      selected: [...selected, key],
    });
    setNewTitle("");
    setNewDescription("");
    setIsAdding(false);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div>
          <p className="text-[17px] font-bold text-slate-800">{schema.label}</p>
          <p className="text-sm text-slate-400">Select all that apply</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">
            {selected.length} of {objectives.length} selected
          </span>
          <button
            type="button"
            onClick={() => setIsAdding(o => !o)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition-colors"
          >
            <Plus size={14} />
            New Objective
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-2 mb-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex-1 w-full">
            <label className="input-label">Title</label>
            <input
              type="text"
              className="input-field !mb-0"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
            />
          </div>
          <div className="flex-1 w-full">
            <label className="input-label">Description</label>
            <input
              type="text"
              className="input-field !mb-0"
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleAddObjective}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white hover:bg-blue-700"
            >
              <Check size={14} />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewTitle("");
                setNewDescription("");
              }}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {objectives.map(opt => {
          const isSelected = selected.includes(opt.key);
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => toggleSelected(opt.key)}
              className={`text-left p-4 rounded-xl border transition-colors ${
                isSelected
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-slate-50 border-slate-100 hover:border-slate-200"
              }`}
            >
              <p
                className={`text-sm font-semibold ${isSelected ? "text-emerald-700" : "text-slate-800"}`}
              >
                {opt.title}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{opt.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TreatmentObjectivesControl;
