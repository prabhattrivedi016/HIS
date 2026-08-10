import { ControlSchema } from "./types";

interface RadioScoreGroupControlProps {
  schema: ControlSchema;
  value: unknown;
  onChange: (value: unknown) => void;
}

// matched against each option's label (case-insensitive) — covers the common none/mild/moderate/
// severe (and normal/low/medium/high) clinical-severity vocabulary so those get their expected
// colors; anything else falls back to FALLBACK_PALETTE by option position, so an arbitrary/custom
// option set still gets a distinct, consistent color per column instead of one flat color
const KEYWORD_COLORS: Record<string, string> = {
  none: "#94a3b8",
  normal: "#94a3b8",
  mild: "#10b981",
  low: "#10b981",
  moderate: "#f59e0b",
  medium: "#f59e0b",
  severe: "#dc2626",
  high: "#dc2626",
  critical: "#dc2626",
};

const FALLBACK_PALETTE = ["#94a3b8", "#10b981", "#f59e0b", "#dc2626", "#7c3aed", "#0ea5e9"];

const colorForOption = (label: string, index: number) =>
  KEYWORD_COLORS[label.trim().toLowerCase()] ?? FALLBACK_PALETTE[index % FALLBACK_PALETTE.length];

/** a themed set of graded rows (e.g. "Bite analysis": Overjet/Overbite/Crossbite/... each rated
 * None-Severe) — one card per row, a colored dot mirroring its current selection, and a
 * segmented-button strip (colored by option, not just active/inactive) instead of a plain radio
 * list, so severity reads at a glance across the whole grid. */
const RadioScoreGroupControl = ({ schema, value, onChange }: RadioScoreGroupControlProps) => {
  const rows = schema.rows ?? [];
  const groupValue = (value as Record<string, unknown>) ?? {};

  const hasScores = rows.some(row => row.options.some(opt => opt.score));
  const totalScore = rows.reduce((sum, row) => {
    const selected = groupValue[row.key];
    const option = row.options.find(opt => opt.value === selected);
    return sum + (option?.score ?? 0);
  }, 0);

  const handleSelect = (rowKey: string, optionValue: unknown) =>
    onChange({ ...groupValue, [rowKey]: optionValue });

  if (rows.length === 0) {
    return <p className="text-sm text-gray-400">No rows configured</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="text-[15px] font-semibold text-slate-700">{schema.label}</p>
        {hasScores && (
          <span className="flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-[#0B5394] text-white text-xs font-bold">
            {totalScore}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {rows.map(row => {
          const selectedValue = groupValue[row.key];
          const selectedIndex = row.options.findIndex(opt => opt.value === selectedValue);
          const dotColor =
            selectedIndex >= 0
              ? colorForOption(row.options[selectedIndex].label, selectedIndex)
              : "#cbd5e1";

          return (
            <div key={row.key} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <p className="text-sm font-bold text-slate-700">{row.label}</p>
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: dotColor }}
                />
              </div>
              <div className="flex rounded-lg border border-slate-200 overflow-hidden text-[11px] font-semibold">
                {row.options.map((opt, idx) => {
                  const active = selectedValue === opt.value;
                  const color = colorForOption(opt.label, idx);
                  return (
                    <button
                      key={opt.key ?? idx}
                      type="button"
                      onClick={() => handleSelect(row.key, opt.value)}
                      className="flex-1 py-1.5 transition-colors"
                      style={
                        active
                          ? { backgroundColor: color, color: "white" }
                          : { backgroundColor: "white", color: "#64748b" }
                      }
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RadioScoreGroupControl;
