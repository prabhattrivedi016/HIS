import { resolveEyeRefractionConfig } from "@/config/eyeRefractionConfig";
import { Minus, Plus } from "lucide-react";
import ComboDropdownCell from "./ComboDropdownCell";
import { ControlSchema } from "./types";

interface RefractionEyeValue {
  sph?: string;
  cyl?: string;
  axis?: string;
}

interface ObjectiveHalfValue {
  right?: RefractionEyeValue;
  left?: RefractionEyeValue;
}

interface ObjectiveValue {
  undilated?: ObjectiveHalfValue;
  dilated?: ObjectiveHalfValue;
}

interface SubjectiveRowValue {
  sph?: string;
  cyl?: string;
  axis?: string;
  visualAcuity?: string;
}

interface SubjectiveEyeValue {
  distance?: SubjectiveRowValue;
  near?: SubjectiveRowValue;
}

interface SubjectiveValue {
  dilated?: boolean;
  right?: SubjectiveEyeValue;
  left?: SubjectiveEyeValue;
}

interface FrameDetailsSectionValue {
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

export interface EyeRefractionValue {
  objective?: ObjectiveValue;
  subjective?: SubjectiveValue;
  frameDetails?: FrameDetailsSectionValue;
}

interface EyeRefractionControlProps {
  schema: ControlSchema;
  value: unknown;
  onChange: (value: unknown) => void;
}

type ObjectiveGroupKey = "undilated" | "dilated";
type EyeKey = "right" | "left";
type SubjectiveRowKey = "distance" | "near";
type PowerFieldKey = "sph" | "cyl" | "axis";
type FrameStepperKey = "ipdDist" | "ipdNear" | "ri" | "sides" | "bridge";
type FrameCheckboxGroupKey = "usage" | "type" | "treatment";

const FRAME_STEPPER_FIELDS: { key: FrameStepperKey; label: string }[] = [
  { key: "ipdDist", label: "I.P.D. DIST." },
  { key: "ipdNear", label: "I.P.D. NEAR." },
  { key: "ri", label: "RI" },
  { key: "sides", label: "SIDES" },
  { key: "bridge", label: "BRIDGE" },
];

const VerticalStrip = ({ label }: { label: string }) => (
  <div className="flex items-center justify-center bg-slate-500 text-white text-[10px] font-bold uppercase tracking-wide w-6 shrink-0">
    <span className="[writing-mode:vertical-rl] rotate-180">{label}</span>
  </div>
);

/** the one-off "Eye Refraction" control — a single header rendering Objective (Undilated +
 * Dilated SPH/CYL/AXIS readings), Subjective (glass prescription + visual acuity), and Frame
 * Details (I.P.D./RI/Sides/Bridge + Material + Usage/Type/Treatment + Notes), same "one header,
 * custom internal layout" shape as OpticNerveExaminationControl/VisionControl. Config-driven
 * (config/eyeRefractionConfig.ts supplies every scale) — no header-specific logic lives here. */
const EyeRefractionControl = ({ schema, value, onChange }: EyeRefractionControlProps) => {
  const config = resolveEyeRefractionConfig(schema.gridConfigName ?? schema.label ?? "");
  const refractionValue: EyeRefractionValue = (value as EyeRefractionValue) ?? {};
  const objective = refractionValue.objective ?? {};
  const subjective = refractionValue.subjective ?? {};
  const frameDetails = refractionValue.frameDetails ?? {};

  if (!config) {
    return <p className="text-sm text-gray-400">No grid configuration found for this header</p>;
  }

  const patchFrameDetails = (partial: Partial<FrameDetailsSectionValue>) =>
    onChange({ ...refractionValue, frameDetails: { ...frameDetails, ...partial } });

  const stepFrameValue = (key: FrameStepperKey, delta: number) => {
    const current = Number(frameDetails[key]) || 0;
    patchFrameDetails({ [key]: String(current + delta) });
  };

  const toggleFrameCheckboxOption = (group: FrameCheckboxGroupKey, option: string) => {
    const selected = frameDetails[group] ?? [];
    patchFrameDetails({
      [group]: selected.includes(option)
        ? selected.filter(v => v !== option)
        : [...selected, option],
    });
  };

  const patchObjectiveCell = (
    group: ObjectiveGroupKey,
    eye: EyeKey,
    field: PowerFieldKey,
    fieldValue: string
  ) => {
    const groupValue = objective[group] ?? {};
    const eyeValue = groupValue[eye] ?? {};
    onChange({
      ...refractionValue,
      objective: {
        ...objective,
        [group]: { ...groupValue, [eye]: { ...eyeValue, [field]: fieldValue } },
      },
    });
  };

  const patchSubjectiveDilated = (dilated: boolean) =>
    onChange({ ...refractionValue, subjective: { ...subjective, dilated } });

  const patchSubjectiveCell = (
    eye: EyeKey,
    row: SubjectiveRowKey,
    field: PowerFieldKey | "visualAcuity",
    fieldValue: string
  ) => {
    const eyeValue = subjective[eye] ?? {};
    const rowValue = eyeValue[row] ?? {};
    onChange({
      ...refractionValue,
      subjective: {
        ...subjective,
        [eye]: { ...eyeValue, [row]: { ...rowValue, [field]: fieldValue } },
      },
    });
  };

  const renderObjectivePanel = (group: ObjectiveGroupKey, eye: EyeKey, title: string) => {
    const eyeValue = objective[group]?.[eye] ?? {};
    return (
      <div className="flex-1 min-w-[180px]">
        <div className="bg-slate-100 text-slate-500 text-[11px] font-semibold uppercase tracking-wide text-center py-1.5 border-b border-slate-200">
          {title}
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500 text-[11px] font-semibold uppercase tracking-wide">
              <th className="px-2 py-1 text-center">SPH</th>
              <th className="px-2 py-1 text-center">CYL</th>
              <th className="px-2 py-1 text-center">AXIS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-2 py-2">
                <ComboDropdownCell
                  label="SPH"
                  value={eyeValue.sph}
                  options={config.sphOptions}
                  onChange={v => patchObjectiveCell(group, eye, "sph", v)}
                />
              </td>
              <td className="px-2 py-2">
                <ComboDropdownCell
                  label="CYL"
                  value={eyeValue.cyl}
                  options={config.cylOptions}
                  onChange={v => patchObjectiveCell(group, eye, "cyl", v)}
                />
              </td>
              <td className="px-2 py-2">
                <ComboDropdownCell
                  label="AXIS"
                  value={eyeValue.axis}
                  options={config.axisOptions}
                  onChange={v => patchObjectiveCell(group, eye, "axis", v)}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderSubjectivePanel = (eye: EyeKey, title: string) => {
    const eyeValue = subjective[eye] ?? {};
    return (
      <div className="flex-1">
        <div className="bg-slate-100 text-slate-500 text-[11px] font-semibold uppercase tracking-wide text-center py-1.5 border-b border-slate-200">
          {title}
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500 text-[11px] font-semibold uppercase tracking-wide">
              <th className="px-2 py-1 text-left w-16"></th>
              <th className="px-2 py-1 text-center">SPH</th>
              <th className="px-2 py-1 text-center">CYL</th>
              <th className="px-2 py-1 text-center">AXIS</th>
              <th className="px-2 py-1 text-center">Visual Acuity</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-100">
              <td className="px-2 py-2 font-semibold text-blue-600">Distance</td>
              <td className="px-2 py-2">
                <ComboDropdownCell
                  label="SPH"
                  value={eyeValue.distance?.sph}
                  options={config.sphOptions}
                  onChange={v => patchSubjectiveCell(eye, "distance", "sph", v)}
                />
              </td>
              <td className="px-2 py-2">
                <ComboDropdownCell
                  label="CYL"
                  value={eyeValue.distance?.cyl}
                  options={config.cylOptions}
                  onChange={v => patchSubjectiveCell(eye, "distance", "cyl", v)}
                />
              </td>
              <td className="px-2 py-2">
                <ComboDropdownCell
                  label="AXIS"
                  value={eyeValue.distance?.axis}
                  options={config.axisOptions}
                  onChange={v => patchSubjectiveCell(eye, "distance", "axis", v)}
                />
              </td>
              <td className="px-2 py-2">
                <ComboDropdownCell
                  label="Visual Acuity"
                  value={eyeValue.distance?.visualAcuity}
                  options={config.distanceAcuityOptions}
                  onChange={v => patchSubjectiveCell(eye, "distance", "visualAcuity", v)}
                />
              </td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="px-2 py-2 font-semibold text-blue-600">Near</td>
              <td className="px-2 py-2">
                <ComboDropdownCell
                  label="SPH"
                  value={eyeValue.near?.sph}
                  options={config.sphOptions}
                  onChange={v => patchSubjectiveCell(eye, "near", "sph", v)}
                />
              </td>
              <td />
              <td />
              <td className="px-2 py-2">
                <ComboDropdownCell
                  label="Visual Acuity"
                  value={eyeValue.near?.visualAcuity}
                  options={config.nearAcuityOptions}
                  onChange={v => patchSubjectiveCell(eye, "near", "visualAcuity", v)}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderFrameCheckboxGroup = (
    label: string,
    group: FrameCheckboxGroupKey,
    options: string[]
  ) => (
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
              checked={(frameDetails[group] ?? []).includes(opt)}
              onChange={() => toggleFrameCheckboxOption(group, opt)}
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <p className="text-[15px] font-semibold text-blue-600 mb-2">{schema.label}</p>
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="bg-slate-600 text-white text-center text-xs font-bold uppercase tracking-wide py-1.5">
          Objective
        </div>
        <div className="flex flex-col sm:flex-row">
          <div className="flex flex-1">
            <VerticalStrip label="Undilated" />
            {renderObjectivePanel("undilated", "right", "RIGHT EYE")}
            {renderObjectivePanel("undilated", "left", "LEFT EYE")}
          </div>
          <div className="flex flex-1 border-t sm:border-t-0 sm:border-l border-slate-200">
            <VerticalStrip label="Dilated" />
            {renderObjectivePanel("dilated", "right", "RIGHT EYE (OD)")}
            {renderObjectivePanel("dilated", "left", "LEFT EYE (OS)")}
          </div>
        </div>

        <div className="bg-slate-600 text-white flex items-center justify-between px-3 py-1.5 border-t border-slate-500">
          <span className="text-xs font-bold uppercase tracking-wide">Subjective</span>
          <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              className="input-checkbox"
              checked={Boolean(subjective.dilated)}
              onChange={e => patchSubjectiveDilated(e.target.checked)}
            />
            Dilated
          </label>
        </div>
        <div className="flex flex-col lg:flex-row">
          {renderSubjectivePanel("right", "RIGHT EYE / GLASS PRESCRIPTION (OD)")}
          {renderSubjectivePanel("left", "LEFT EYE / GLASS PRESCRIPTION (OS)")}
        </div>

        <div className="bg-slate-600 text-white text-center text-xs font-bold uppercase tracking-wide py-1.5 border-t border-slate-500">
          Frame Details
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-3 border-b border-slate-100">
          {FRAME_STEPPER_FIELDS.map(field => (
            <div key={field.key}>
              <label className="input-label">{field.label}</label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => stepFrameValue(field.key, -1)}
                  className="flex items-center justify-center w-7 h-7 shrink-0 rounded border border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:text-blue-600"
                >
                  <Minus size={12} />
                </button>
                <input
                  type="number"
                  className="input-field !mb-0 text-center"
                  value={frameDetails[field.key] ?? ""}
                  onChange={e => patchFrameDetails({ [field.key]: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => stepFrameValue(field.key, 1)}
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
              value={frameDetails.material ?? ""}
              onChange={e => patchFrameDetails({ material: e.target.value })}
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

        {renderFrameCheckboxGroup("Usage", "usage", config.usageOptions)}
        {renderFrameCheckboxGroup("Type", "type", config.typeOptions)}
        {renderFrameCheckboxGroup("Treatment", "treatment", config.treatmentOptions)}

        <div className="p-3">
          <textarea
            className="input-field !mb-0"
            rows={3}
            placeholder="Notes"
            value={frameDetails.notes ?? ""}
            onChange={e => patchFrameDetails({ notes: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
};

export default EyeRefractionControl;
