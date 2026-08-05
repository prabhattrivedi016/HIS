import { resolveIntraOcularPressureConfig } from "@/config/intraOcularPressureConfig";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { ControlSchema } from "./types";

export interface IntraOcularPressureEntry {
  key: string;
  method?: string;
  dilated?: boolean;
  right?: string;
  left?: string;
  date?: string;
  time?: string;
}

export interface IntraOcularPressureValue {
  entries?: IntraOcularPressureEntry[];
  draft?: Partial<IntraOcularPressureEntry>;
  activeIndex?: number;
  completed?: boolean;
}

interface IntraOcularPressureControlProps {
  schema: ControlSchema;
  value: unknown;
  onChange: (value: unknown) => void;
}

const CHART_WIDTH = 640;
const CHART_HEIGHT = 200;
const CHART_PAD_LEFT = 34;
const CHART_PAD_RIGHT = 16;
const CHART_PAD_TOP = 12;
const CHART_PAD_BOTTOM = 20;

/** rounds up to a "nice" axis ceiling (nearest 5 above the data max, minimum 30 — a normal IOP
 * reading sits around 10-21mmHg, so 0-30 comfortably covers it before any readings exist) */
const niceAxisMax = (dataMax: number) => Math.max(30, Math.ceil((dataMax + 5) / 5) * 5);

/** the one-off "Intra Ocular Pressure" recorder — logs one dated Right/Left mmHg reading at a
 * time (method + dilated + eye values + date/time), then plots every saved reading as a Right
 * (red) / Left (blue) trend line. Entirely config-driven (config/intraOcularPressureConfig.ts
 * supplies the tonometry method options) — no header-specific logic lives here. */
const IntraOcularPressureControl = ({
  schema,
  value,
  onChange,
}: IntraOcularPressureControlProps) => {
  const config = resolveIntraOcularPressureConfig(schema.gridConfigName ?? schema.label ?? "");
  const iopValue: IntraOcularPressureValue = (value as IntraOcularPressureValue) ?? {};
  const entries = iopValue.entries ?? [];
  const draft = iopValue.draft ?? {};
  const activeIndex = iopValue.activeIndex;

  if (!config) {
    return <p className="text-sm text-gray-400">No grid configuration found for this header</p>;
  }

  const patch = (partial: Partial<IntraOcularPressureValue>) =>
    onChange({ ...iopValue, ...partial });

  const patchDraft = (partial: Partial<IntraOcularPressureEntry>) =>
    patch({ draft: { ...draft, ...partial } });

  const handleSave = () => {
    if (!draft.right && !draft.left && !draft.method) return;
    const entry: IntraOcularPressureEntry = { key: `${Date.now()}`, ...draft };
    patch({ entries: [...entries, entry], draft: {}, activeIndex: entries.length });
  };

  const handleComplete = () => patch({ completed: true });
  const handleClose = () => patch({ draft: {} });

  const goToIndex = (idx: number) => {
    if (entries.length === 0) return;
    patch({ activeIndex: Math.min(Math.max(idx, 0), entries.length - 1) });
  };

  const activeEntry = activeIndex !== undefined ? entries[activeIndex] : undefined;

  // chart geometry — evenly spaced points by save order, auto-scaled Y axis to the actual data
  const numericRight = entries.map(e => Number(e.right) || 0);
  const numericLeft = entries.map(e => Number(e.left) || 0);
  const dataMax = Math.max(0, ...numericRight, ...numericLeft);
  const yMax = niceAxisMax(dataMax);
  const plotWidth = CHART_WIDTH - CHART_PAD_LEFT - CHART_PAD_RIGHT;
  const plotHeight = CHART_HEIGHT - CHART_PAD_TOP - CHART_PAD_BOTTOM;
  const xFor = (idx: number) =>
    CHART_PAD_LEFT +
    (entries.length <= 1 ? plotWidth / 2 : (idx / (entries.length - 1)) * plotWidth);
  const yFor = (v: number) => CHART_PAD_TOP + plotHeight - (v / yMax) * plotHeight;
  const rightPoints = entries
    .map((e, idx) => `${xFor(idx)},${yFor(Number(e.right) || 0)}`)
    .join(" ");
  const leftPoints = entries.map((e, idx) => `${xFor(idx)},${yFor(Number(e.left) || 0)}`).join(" ");
  const gridSteps = [0, 0.2, 0.4, 0.6, 0.8, 1].map(f => Math.round(yMax * f));

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <p className="text-[15px] font-semibold text-blue-600 px-3 pt-3 pb-2">{schema.label}</p>

      <div className="table-scroll-wrapper shadow-none border-0 rounded-none">
        <table className="base-table table-size">
          <thead className="table-head">
            <tr>
              <th className="table-th" />
              <th className="table-th" />
              <th className="table-th">RIGHT EYE</th>
              <th className="table-th">LEFT EYE</th>
              <th className="table-th">DATE</th>
              <th className="table-th">TIME</th>
            </tr>
          </thead>
          <tbody>
            <tr className="table-row">
              <td className="table-td align-top">
                <select
                  className="input-field !mb-0"
                  value={draft.method ?? ""}
                  onChange={e => patchDraft({ method: e.target.value })}
                >
                  <option value="">---Select---</option>
                  {config.methodOptions.map(opt => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </td>
              <td className="table-td align-top">
                <label className="flex items-center gap-1.5 text-sm text-slate-600 cursor-pointer select-none whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="input-checkbox"
                    checked={Boolean(draft.dilated)}
                    onChange={e => patchDraft({ dilated: e.target.checked })}
                  />
                  Dilated
                </label>
              </td>
              <td className="table-td align-top">
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    className="input-field !mb-0"
                    value={draft.right ?? ""}
                    onChange={e => patchDraft({ right: e.target.value })}
                  />
                  <span className="text-xs text-slate-400 shrink-0">mmHg</span>
                </div>
              </td>
              <td className="table-td align-top">
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    className="input-field !mb-0"
                    value={draft.left ?? ""}
                    onChange={e => patchDraft({ left: e.target.value })}
                  />
                  <span className="text-xs text-slate-400 shrink-0">mmHg</span>
                </div>
              </td>
              <td className="table-td align-top">
                <input
                  type="date"
                  className="input-field !mb-0"
                  value={draft.date ?? ""}
                  onChange={e => patchDraft({ date: e.target.value })}
                />
              </td>
              <td className="table-td align-top">
                <input
                  type="time"
                  className="input-field !mb-0"
                  value={draft.time ?? ""}
                  onChange={e => patchDraft({ time: e.target.value })}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-2 px-3 py-2">
        <button
          type="button"
          onClick={() => goToIndex((activeIndex ?? entries.length) - 1)}
          disabled={entries.length === 0}
          className="flex items-center justify-center w-6 h-6 rounded border border-slate-200 bg-white text-slate-400 hover:text-blue-600 hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={13} />
        </button>
        <span className="px-3 py-1 rounded-full border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
          {entries.length} IOP
        </span>
        <button
          type="button"
          onClick={() => goToIndex((activeIndex ?? entries.length - 2) + 1)}
          disabled={entries.length === 0}
          className="flex items-center justify-center w-6 h-6 rounded border border-slate-200 bg-white text-slate-400 hover:text-blue-600 hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={13} />
        </button>
      </div>

      <div className="px-3 pb-2">
        <div className="flex items-center gap-4 mb-2">
          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <span className="w-4 h-1.5 rounded-full bg-red-400" />
            RIGHT
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <span className="w-4 h-1.5 rounded-full bg-blue-500" />
            LEFT
          </span>
          {activeEntry && (
            <span className="text-xs text-slate-400">
              {activeEntry.date ?? ""} — R {activeEntry.right ?? "—"} / L {activeEntry.left ?? "—"}{" "}
              mmHg
            </span>
          )}
        </div>

        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="w-full"
          role="img"
          aria-label="Intra ocular pressure trend chart"
        >
          {gridSteps.map(step => (
            <g key={step}>
              <line
                x1={CHART_PAD_LEFT}
                x2={CHART_WIDTH - CHART_PAD_RIGHT}
                y1={yFor(step)}
                y2={yFor(step)}
                stroke="#eef2f7"
                strokeWidth={1}
              />
              <text
                x={CHART_PAD_LEFT - 8}
                y={yFor(step) + 3}
                textAnchor="end"
                fontSize={9}
                fill="#94a3b8"
              >
                {step}
              </text>
            </g>
          ))}

          {entries.length === 0 ? (
            <text
              x={CHART_WIDTH / 2}
              y={CHART_HEIGHT / 2}
              textAnchor="middle"
              fontSize={12}
              fill="#cbd5e1"
            >
              No readings recorded yet
            </text>
          ) : (
            <>
              <polyline points={rightPoints} fill="none" stroke="#f87171" strokeWidth={2} />
              <polyline points={leftPoints} fill="none" stroke="#3b82f6" strokeWidth={2} />
              {entries.map((e, idx) => (
                <g key={e.key}>
                  <circle
                    cx={xFor(idx)}
                    cy={yFor(Number(e.right) || 0)}
                    r={idx === activeIndex ? 5 : 3}
                    fill="#f87171"
                  />
                  <circle
                    cx={xFor(idx)}
                    cy={yFor(Number(e.left) || 0)}
                    r={idx === activeIndex ? 5 : 3}
                    fill="#3b82f6"
                  />
                </g>
              ))}
            </>
          )}
        </svg>
      </div>

      <div className="flex items-center justify-between gap-2 px-3 py-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goToIndex(0)}
            disabled={entries.length === 0}
            className="flex items-center justify-center w-8 h-8 rounded border border-slate-200 bg-white text-slate-400 hover:text-blue-600 hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronsLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => goToIndex(entries.length - 1)}
            disabled={entries.length === 0 || activeIndex === entries.length - 1}
            className="flex items-center justify-center w-8 h-8 rounded border border-slate-200 bg-white text-slate-400 hover:text-blue-600 hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronsRight size={14} />
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="cancel-button !w-auto !px-4 !py-2 !text-xs"
          >
            Save
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleComplete}
            className="save-btn !w-auto !px-4 !py-2 !text-xs"
          >
            {iopValue.completed ? "Completed" : "Complete"}
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="cancel-button !w-auto !px-4 !py-2 !text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntraOcularPressureControl;
