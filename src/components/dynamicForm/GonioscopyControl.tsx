import { resolveGonioscopyConfig } from "@/config/gonioscopyConfig";
import { ControlSchema } from "./types";

export interface GonioscopyEyeValue {
  lens?: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  pxf?: boolean;
  pigmentDispersion?: boolean;
  notes?: string;
}

export interface GonioscopyValue {
  rightEye?: GonioscopyEyeValue;
  leftEye?: GonioscopyEyeValue;
}

interface GonioscopyControlProps {
  schema: ControlSchema;
  value: unknown;
  onChange: (value: unknown) => void;
}

type EyeKey = "rightEye" | "leftEye";

const GonioscopyControl = ({ schema, value, onChange }: GonioscopyControlProps) => {
  const config = resolveGonioscopyConfig(schema.gridConfigName ?? schema.label ?? "");
  const gonioValue: GonioscopyValue = (value as GonioscopyValue) ?? {};

  if (!config) {
    return <p className="text-sm text-gray-400">No grid configuration found for this header</p>;
  }

  const patchEye = (eye: EyeKey, partial: Partial<GonioscopyEyeValue>) =>
    onChange({ ...gonioValue, [eye]: { ...gonioValue[eye], ...partial } });

  const renderQuadrantSelect = (
    eye: EyeKey,
    eyeValue: GonioscopyEyeValue,
    field: "top" | "left" | "right" | "bottom",
    positionClassName: string
  ) => (
    <select
      className={`input-field !mb-0 !text-[11px] !py-1 w-24 absolute ${positionClassName}`}
      value={eyeValue[field] ?? ""}
      onChange={e => patchEye(eye, { [field]: e.target.value })}
    >
      <option value="">Select</option>
      {config.quadrantOptions.map(opt => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );

  const renderEyePanel = (eye: EyeKey, title: string) => {
    const eyeValue = gonioValue[eye] ?? {};

    return (
      <div className="flex-1 min-w-[260px]">
        <p className="text-center text-sm font-bold text-slate-700 mb-2">{title}</p>

        <div className="flex justify-center mb-3">
          <select
            className="input-field !mb-0 w-48"
            value={eyeValue.lens ?? ""}
            onChange={e => patchEye(eye, { lens: e.target.value })}
          >
            <option value="">Select Lens</option>
            {config.lensOptions.map(opt => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full aspect-square max-w-[260px] mx-auto rounded-lg bg-slate-50 border border-slate-200">
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <line x1="10" y1="10" x2="90" y2="90" stroke="#94a3b8" strokeWidth="0.8" />
            <line x1="90" y1="10" x2="10" y2="90" stroke="#94a3b8" strokeWidth="0.8" />
          </svg>

          {renderQuadrantSelect(eye, eyeValue, "top", "top-2 left-1/2 -translate-x-1/2")}
          {renderQuadrantSelect(eye, eyeValue, "left", "left-1 top-1/2 -translate-y-1/2")}
          {renderQuadrantSelect(eye, eyeValue, "right", "right-1 top-1/2 -translate-y-1/2")}
          {renderQuadrantSelect(eye, eyeValue, "bottom", "bottom-2 left-1/2 -translate-x-1/2")}
        </div>

        <div className="flex items-center gap-4 justify-center mt-3">
          <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              className="input-checkbox"
              checked={Boolean(eyeValue.pxf)}
              onChange={e => patchEye(eye, { pxf: e.target.checked })}
            />
            PXF
          </label>
          <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              className="input-checkbox"
              checked={Boolean(eyeValue.pigmentDispersion)}
              onChange={e => patchEye(eye, { pigmentDispersion: e.target.checked })}
            />
            Pigment Dispersion
          </label>
        </div>

        <input
          type="text"
          className="input-field !mb-0 mt-3"
          placeholder={`${title === "RIGHT EYE" ? "Right" : "Left"} Eye Notes`}
          value={eyeValue.notes ?? ""}
          onChange={e => patchEye(eye, { notes: e.target.value })}
        />
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-[15px] font-semibold text-blue-600 mb-3">{schema.label}</p>
      <div className="flex flex-col lg:flex-row gap-8">
        {renderEyePanel("rightEye", "RIGHT EYE")}
        {renderEyePanel("leftEye", "LEFT EYE")}
      </div>
    </div>
  );
};

export default GonioscopyControl;
