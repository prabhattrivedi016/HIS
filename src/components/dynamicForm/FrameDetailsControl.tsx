import { resolveFrameDetailsConfig } from "@/config/frameDetailsConfig";
import { Minus, Plus } from "lucide-react";
import { ControlSchema } from "./types";

export interface FrameDetailsValue {
  ipdDist?: string;
  ipdNear?: string;
  ri?: string;
  sides?: string;
  bridge?: string;
  material?: string;
  usage?: string[];
  type?: string[];
  treatment?: string[];
  notes?: string;
}

interface FrameDetailsControlProps {
  schema: ControlSchema;
  value: unknown;
  onChange: (value: unknown) => void;
}

type StepperKey = "ipdDist" | "ipdNear" | "ri" | "sides" | "bridge";
type CheckboxGroupKey = "usage" | "type" | "treatment";

const STEPPER_FIELDS: { key: StepperKey; label: string }[] = [
  { key: "ipdDist", label: "I.P.D. DIST." },
  { key: "ipdNear", label: "I.P.D. NEAR." },
  { key: "ri", label: "RI" },
  { key: "sides", label: "SIDES" },
  { key: "bridge", label: "BRIDGE" },
];

/** the one-off "Frame Details" control — I.P.D./RI/Sides/Bridge stepper fields + Material
 * dropdown + Usage/Type/Treatment checkbox groups + a closing Notes box, all as one fixed-shape
 * control tied to a single header. Config-driven (config/frameDetailsConfig.ts supplies every
 * option list) — no header-specific logic lives here. */
const FrameDetailsControl = ({ schema, value, onChange }: FrameDetailsControlProps) => {
  const config = resolveFrameDetailsConfig(schema.gridConfigName ?? schema.label ?? "");
  const frameValue: FrameDetailsValue = (value as FrameDetailsValue) ?? {};

  if (!config) {
    return <p className="text-sm text-gray-400">No grid configuration found for this header</p>;
  }

  const patch = (partial: Partial<FrameDetailsValue>) => onChange({ ...frameValue, ...partial });

  const stepValue = (key: StepperKey, delta: number) => {
    const current = Number(frameValue[key]) || 0;
    patch({ [key]: String(current + delta) });
  };

  const toggleCheckboxOption = (group: CheckboxGroupKey, option: string) => {
    const selected = frameValue[group] ?? [];
    patch({
      [group]: selected.includes(option)
        ? selected.filter(v => v !== option)
        : [...selected, option],
    });
  };

  const renderCheckboxGroup = (label: string, group: CheckboxGroupKey, options: string[]) => (
    <div className="flex items-start gap-3 px-3 py-2.5 border-b border-slate-100 flex-wrap">
      <span className="text-sm font-semibold text-blue-600 w-20 shrink-0">{label} :</span>
      <div className="flex flex-wrap gap-x-4 gap-y-2 flex-1">
        {options.map(opt => (
          <label
            key={opt}
            className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer select-none whitespace-nowrap"
          >
            <input
              type="checkbox"
              className="input-checkbox"
              checked={(frameValue[group] ?? []).includes(opt)}
              onChange={() => toggleCheckboxOption(group, opt)}
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="bg-slate-600 text-white text-center text-xs font-bold uppercase tracking-wide py-1.5">
        {schema.label}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-3 border-b border-slate-100">
        {STEPPER_FIELDS.map(field => (
          <div key={field.key}>
            <label className="input-label">{field.label}</label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => stepValue(field.key, -1)}
                className="flex items-center justify-center w-7 h-7 shrink-0 rounded border border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:text-blue-600"
              >
                <Minus size={12} />
              </button>
              <input
                type="number"
                className="input-field !mb-0 text-center"
                value={frameValue[field.key] ?? ""}
                onChange={e => patch({ [field.key]: e.target.value })}
              />
              <button
                type="button"
                onClick={() => stepValue(field.key, 1)}
                className="flex items-center justify-center w-7 h-7 shrink-0 rounded border border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:text-blue-600"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
        ))}
        <div>
          <label className="input-label">Material</label>
          <select
            className="input-field !mb-0"
            value={frameValue.material ?? ""}
            onChange={e => patch({ material: e.target.value })}
          >
            <option value="">Select</option>
            {config.materialOptions.map(opt => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {renderCheckboxGroup("Usage", "usage", config.usageOptions)}
      {renderCheckboxGroup("Type", "type", config.typeOptions)}
      {renderCheckboxGroup("Treatment", "treatment", config.treatmentOptions)}

      <div className="p-3">
        <textarea
          className="input-field !mb-0"
          rows={3}
          placeholder="Notes"
          value={frameValue.notes ?? ""}
          onChange={e => patch({ notes: e.target.value })}
        />
      </div>
    </div>
  );
};

export default FrameDetailsControl;
