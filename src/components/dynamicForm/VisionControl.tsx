import { resolveVisionConfig } from "@/config/visionConfig";
import ComboDropdownCell from "./ComboDropdownCell";
import { ControlSchema } from "./types";

export interface VisionEyeValue {
  distance?: { unaided?: string; pinhole?: string; aided?: string };
  near?: { unaided?: string; pinhole?: string; aided?: string };
}

export interface VisionValue {
  right?: VisionEyeValue;
  left?: VisionEyeValue;
}

interface VisionControlProps {
  schema: ControlSchema;
  value: unknown;
  onChange: (value: unknown) => void;
}

type EyeKey = "right" | "left";
type RowKey = "distance" | "near";
type ColKey = "unaided" | "pinhole" | "aided";

/** the one-off "Vision" control — a single header rendering a RIGHT/LEFT pair of Distance/Near ×
 * Unaided/Pinhole/Aided visual-acuity tables, same "one header, custom internal layout" shape as
 * OpticNerveExaminationControl. Config-driven (config/visionConfig.ts supplies the two acuity
 * scales) — no header-specific logic lives here. */
const VisionControl = ({ schema, value, onChange }: VisionControlProps) => {
  const config = resolveVisionConfig(schema.gridConfigName ?? schema.label ?? "");
  const visionValue: VisionValue = (value as VisionValue) ?? {};

  if (!config) {
    return <p className="text-sm text-gray-400">No grid configuration found for this header</p>;
  }

  const patchCell = (eye: EyeKey, row: RowKey, col: ColKey, cellValue: string) => {
    const eyeValue = visionValue[eye] ?? {};
    const rowValue = eyeValue[row] ?? {};
    onChange({
      ...visionValue,
      [eye]: { ...eyeValue, [row]: { ...rowValue, [col]: cellValue } },
    });
  };

  const renderPanel = (eye: EyeKey, title: string, acuityLabel: string) => {
    const eyeValue = visionValue[eye] ?? {};
    const rows: { key: RowKey; label: string; options: string[] }[] = [
      { key: "distance", label: "Distance", options: config.distanceOptions },
      { key: "near", label: "Near", options: config.nearOptions },
    ];

    return (
      <div className="flex-1 rounded-lg border border-slate-200 overflow-hidden">
        <div className="bg-slate-600 text-white text-center text-xs font-bold uppercase tracking-wide py-1.5">
          {title}
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100 text-slate-500 text-[11px] font-semibold uppercase tracking-wide">
              <th className="px-2 py-1.5 text-left">{acuityLabel}</th>
              <th className="px-2 py-1.5 text-center">Unaided</th>
              <th className="px-2 py-1.5 text-center">Pinhole</th>
              <th className="px-2 py-1.5 text-center">Aided</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.key} className="border-t border-slate-100">
                <td className="px-2 py-2 font-semibold text-blue-600">{row.label}</td>
                {(["unaided", "pinhole", "aided"] as ColKey[]).map(col => (
                  <td key={col} className="px-2 py-2">
                    <ComboDropdownCell
                      label={row.label === "Distance" ? "Unaided" : row.label}
                      value={eyeValue[row.key]?.[col]}
                      options={row.options}
                      onChange={v => patchCell(eye, row.key, col, v)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <p className="text-[15px] font-semibold text-blue-600 mb-2">{schema.label}</p>
      <div className="flex flex-col lg:flex-row gap-4">
        {renderPanel("right", "RIGHT", "VISUAL ACUITY (OD)")}
        {renderPanel("left", "LEFT", "VISUAL ACUITY (OS)")}
      </div>
    </div>
  );
};

export default VisionControl;
