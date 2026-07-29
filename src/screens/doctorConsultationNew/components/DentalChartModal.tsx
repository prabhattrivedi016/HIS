import { Activity, Layers, ListChecks } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { FaTooth } from "react-icons/fa";
import ToothIcon, { toothCategoryForNumber } from "./ToothIcon";

export type BiteGrade = "None" | "Mild" | "Moderate" | "Severe";
export type ChartMarkType = "extraction" | "attachment";

export interface DentalChartValue {
  treatmentType?: string;
  bite?: Partial<Record<string, BiteGrade>>;
  chart?: {
    /** toothNumber (FDI notation) -> mark */
    marks?: Record<number, ChartMarkType>;
    /** gap keys, e.g. "17-16" */
    ipr?: string[];
  };
  plan?: {
    packagePrice?: string;
    status?: string;
    notes?: string;
  };
}

interface DentalChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  value?: DentalChartValue;
  onChange: (value: DentalChartValue) => void;
}

// the app's own brand blues (same pair EmrSectionRenderer's default sectionAccent uses,
// plus the lighter tint already defined — unused — as --btn-edit in theme.css) — every
// color cue in this modal is one of these three so it reads as one system with the rest of the UI
const BRAND_BLUE_DARK = "#0B5394";
const BRAND_BLUE_MID = "#1C7EC2";
const BRAND_BLUE_LIGHT = "#6f94c7";

const TREATMENT_TYPES = [
  { key: "fixed", label: "Fixed braces", desc: "Metal / ceramic / self-ligating" },
  { key: "aligners", label: "Clear aligners", desc: "Removable tray sequence" },
  { key: "lingual", label: "Lingual braces", desc: "Fixed, behind the teeth" },
  { key: "retention", label: "Retention only", desc: "Post-treatment retainers" },
  { key: "appliance", label: "Appliance only", desc: "Functional / expansion / habit" },
  { key: "interceptive", label: "Interceptive", desc: "Growing patient, phase 1" },
];

const BITE_PARAMS = [
  { key: "overjet", label: "Overjet", desc: "Horizontal overlap" },
  { key: "overbite", label: "Overbite", desc: "Vertical overlap" },
  { key: "openBite", label: "Open bite", desc: "No vertical contact" },
  { key: "crossbite", label: "Crossbite", desc: "Reverse transverse" },
  { key: "midlineShift", label: "Midline shift", desc: "Upper vs lower centre" },
  { key: "spacing", label: "Spacing", desc: "Gaps between teeth" },
];

const BITE_GRADES: BiteGrade[] = ["None", "Mild", "Moderate", "Severe"];

const UPPER_TEETH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_TEETH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

const CHART_MODES: { key: ChartMarkType | "ipr"; label: string; dot: string }[] = [
  { key: "ipr", label: "IPR", dot: BRAND_BLUE_LIGHT },
  { key: "extraction", label: "Extraction", dot: BRAND_BLUE_MID },
  { key: "attachment", label: "Attachment", dot: BRAND_BLUE_DARK },
];

const TABS = [
  { key: "treatmentType", label: "Treatment type", icon: Layers },
  { key: "bite", label: "Bite analysis", icon: Activity },
  { key: "chart", label: "Dental chart", icon: FaTooth },
  { key: "plan", label: "Treatment plan", icon: ListChecks },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const isBiteParamActive = (grade?: BiteGrade) => Boolean(grade && grade !== "None");

const DentalChartModal = ({ isOpen, onClose, value, onChange }: DentalChartModalProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>("treatmentType");
  const [mode, setMode] = useState<ChartMarkType | "ipr">("ipr");

  if (!isOpen) return null;

  const chartValue = value ?? {};

  const patch = (partial: Partial<DentalChartValue>) => onChange({ ...chartValue, ...partial });
  const patchBite = (key: string, grade: BiteGrade) =>
    patch({ bite: { ...(chartValue.bite ?? {}), [key]: grade } });
  const patchChart = (partial: Partial<NonNullable<DentalChartValue["chart"]>>) =>
    patch({ chart: { ...(chartValue.chart ?? {}), ...partial } });
  const patchPlan = (partial: Partial<NonNullable<DentalChartValue["plan"]>>) =>
    patch({ plan: { ...(chartValue.plan ?? {}), ...partial } });

  const toggleToothMark = (tooth: number) => {
    if (mode === "ipr") return;
    const marks = { ...(chartValue.chart?.marks ?? {}) };
    if (marks[tooth] === mode) delete marks[tooth];
    else marks[tooth] = mode;
    patchChart({ marks });
  };

  const toggleGap = (gapKey: string) => {
    if (mode !== "ipr") return;
    const ipr = new Set(chartValue.chart?.ipr ?? []);
    if (ipr.has(gapKey)) ipr.delete(gapKey);
    else ipr.add(gapKey);
    patchChart({ ipr: Array.from(ipr) });
  };

  const completedCount = [
    Boolean(chartValue.treatmentType),
    Object.values(chartValue.bite ?? {}).some(isBiteParamActive),
    Boolean(
      Object.keys(chartValue.chart?.marks ?? {}).length || (chartValue.chart?.ipr ?? []).length
    ),
    Boolean(chartValue.plan?.packagePrice || chartValue.plan?.notes),
  ].filter(Boolean).length;

  const renderToothRow = (teeth: number[], label: string) => (
    <div>
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
        {label}
      </p>
      <div className="flex items-center overflow-x-auto pb-1">
        {teeth.map((tooth, idx) => {
          const gapKey = idx > 0 ? `${teeth[idx - 1]}-${tooth}` : undefined;
          const gapMarked = gapKey ? (chartValue.chart?.ipr ?? []).includes(gapKey) : false;
          const mark = chartValue.chart?.marks?.[tooth];
          const markColor =
            mark === "extraction" ? BRAND_BLUE_MID : mark === "attachment" ? BRAND_BLUE_DARK : undefined;

          return (
            <div key={tooth} className="flex items-center">
              {gapKey && (
                <button
                  type="button"
                  onClick={() => toggleGap(gapKey)}
                  disabled={mode !== "ipr"}
                  title="Mark IPR"
                  className={`w-3 h-16 flex items-center justify-center shrink-0 ${
                    mode === "ipr" ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <span
                    className="w-1.5 h-12 rounded-full transition-colors"
                    style={{ backgroundColor: gapMarked ? BRAND_BLUE_LIGHT : "#dbeafe" }}
                  />
                </button>
              )}
              <button
                type="button"
                onClick={() => toggleToothMark(tooth)}
                title={`Tooth ${tooth}`}
                className="flex flex-col items-center justify-center gap-1 w-14 h-16 rounded-xl border shrink-0 transition-colors bg-white border-slate-200 hover:border-slate-300"
                style={
                  markColor
                    ? { backgroundColor: `${markColor}14`, borderColor: markColor }
                    : undefined
                }
              >
                <ToothIcon category={toothCategoryForNumber(tooth)} color={markColor} size={20} />
                <span
                  className="text-[10px] font-semibold"
                  style={{ color: markColor ?? "#64748b" }}
                >
                  {tooth}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  return createPortal(
    <>
      <div className="fixed inset-0 z-[90] bg-black/40" onClick={onClose} />

      <div className="fixed inset-0 z-[91] pointer-events-none">
        <div className="bg-white w-screen h-screen flex flex-col pointer-events-auto overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3.5 border-b bg-gradient-to-r from-slate-50 via-white to-slate-50 shrink-0">
            <div className="flex items-center gap-2.5">
              <span
                className="flex items-center justify-center w-8 h-8 rounded-lg shadow-sm"
                style={{
                  background: `linear-gradient(to bottom right, ${BRAND_BLUE_DARK}, ${BRAND_BLUE_MID})`,
                }}
              >
                <FaTooth size={15} className="text-white" />
              </span>
              <h3 className="text-sm font-bold text-slate-700 tracking-wide">Dental Chart</h3>
              <span className="card-status card-status-pending !text-[10px] !px-2 !py-0.5">
                {completedCount}/4 sections
              </span>
            </div>
            <button className="close-drawer-btn" onClick={onClose}>
              &times;
            </button>
          </div>

          <div className="tab-container !mb-0 !mt-0 px-6 pt-2.5 shrink-0 overflow-x-auto">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`tab-btn flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === key ? "tab-btn-active" : "tab-btn-inactive"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {activeTab === "treatmentType" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-w-5xl">
                {TREATMENT_TYPES.map(t => {
                  const selected = chartValue.treatmentType === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => patch({ treatmentType: selected ? undefined : t.key })}
                      className={`flex items-start gap-3 text-left rounded-xl border p-4 transition-colors ${
                        selected
                          ? "border-[#0B5394] bg-blue-50 ring-1 ring-[#1C7EC2]/40"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <span
                        className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${
                          selected ? "bg-white" : "bg-slate-100"
                        }`}
                      >
                        <FaTooth size={16} className={selected ? "text-[#0B5394]" : "text-slate-400"} />
                      </span>
                      <span>
                        <p className="text-sm font-bold text-slate-700">{t.label}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{t.desc}</p>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {activeTab === "bite" && (
              <div className="max-w-5xl">
                <p className="text-[11px] text-slate-400 mb-3">
                  Grade each parameter — used on the printable case sheet.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {BITE_PARAMS.map(p => {
                    const current = chartValue.bite?.[p.key] ?? "None";
                    return (
                      <div key={p.key} className="rounded-xl border border-slate-200 bg-white p-4">
                        <p className="text-sm font-bold text-slate-700">{p.label}</p>
                        <p className="text-[11px] text-slate-400 mb-2.5">{p.desc}</p>
                        <div className="flex rounded-lg border border-slate-200 overflow-hidden text-[11px] font-semibold">
                          {BITE_GRADES.map(grade => (
                            <button
                              key={grade}
                              type="button"
                              onClick={() => patchBite(p.key, grade)}
                              className="flex-1 py-1.5 transition-colors"
                              style={
                                current === grade
                                  ? { backgroundColor: BRAND_BLUE_DARK, color: "white" }
                                  : { backgroundColor: "white", color: "#64748b" }
                              }
                            >
                              {grade}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "chart" && (
              <div className="max-w-5xl">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    {CHART_MODES.map(m => (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => setMode(m.key)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold transition-colors"
                        style={
                          mode === m.key
                            ? { borderColor: BRAND_BLUE_MID, backgroundColor: "#eff6ff", color: BRAND_BLUE_DARK }
                            : { borderColor: "#e2e8f0", backgroundColor: "white", color: "#64748b" }
                        }
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.dot }} />
                        {m.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {mode === "ipr" ? "Click the gap between two teeth" : "Click a tooth to mark it"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-6">
                  {renderToothRow(UPPER_TEETH, "Upper")}
                  {renderToothRow(LOWER_TEETH, "Lower")}
                </div>

                <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-500">
                  {CHART_MODES.map(m => (
                    <span key={m.key} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.dot }} />
                      {m.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "plan" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
                <div>
                  <label className="input-label block mb-1">Package price</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="0.00"
                    value={chartValue.plan?.packagePrice ?? ""}
                    onChange={e => patchPlan({ packagePrice: e.target.value })}
                  />
                </div>
                <div>
                  <label className="input-label block mb-1">Status</label>
                  <select
                    className="input-field"
                    value={chartValue.plan?.status ?? ""}
                    onChange={e => patchPlan({ status: e.target.value })}
                  >
                    <option value="">Select status</option>
                    <option value="planned">Planned</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="input-label block mb-1">Notes</label>
                  <textarea
                    className="input-field"
                    rows={4}
                    placeholder="Treatment plan notes…"
                    value={chartValue.plan?.notes ?? ""}
                    onChange={e => patchPlan({ notes: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default DentalChartModal;
