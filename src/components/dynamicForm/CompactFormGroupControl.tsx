import { CompactFormGroupRow, ControlSchema } from "./types";

interface CompactFormGroupControlProps {
  schema: ControlSchema;
  value: unknown;
  onChange: (value: unknown) => void;
}

const CompactFormGroupControl = ({ schema, value, onChange }: CompactFormGroupControlProps) => {
  const sectionValue = (value as Record<string, unknown>) ?? {};
  const rows = schema.compactRows ?? [];

  const patchRow = (rowKey: string, rowValue: unknown) =>
    onChange({ ...sectionValue, [rowKey]: rowValue });

  const renderField = (row: CompactFormGroupRow) => {
    const rowValue = sectionValue[row.key];

    if (row.dynamicType === "emojiScore") {
      const selected = rowValue;
      return (
        <div className="flex flex-wrap justify-around gap-3 py-2">
          {row.options?.map((opt, i) => (
            <button
              key={opt.key ?? i}
              type="button"
              onClick={() => patchRow(row.key, opt.value)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border-2 transition-all active:scale-95 ${
                selected === opt.value
                  ? "border-blue-500 bg-blue-50 shadow-sm"
                  : "border-transparent hover:bg-slate-50"
              }`}
            >
              {opt.imageUrl ? (
                <img src={opt.imageUrl} alt={opt.label} className="w-16 h-16 object-contain" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-100" />
              )}
              {opt.score !== undefined && (
                <span className="text-lg font-bold text-slate-700">{opt.score}</span>
              )}
              <span className="text-xs text-slate-500 text-center">{opt.label}</span>
            </button>
          ))}
        </div>
      );
    }

    if (row.dynamicType === "checkbox-list") {
      const selected: string[] = Array.isArray(rowValue) ? (rowValue as string[]) : [];
      const toggleOption = (optValue: string) =>
        patchRow(
          row.key,
          selected.includes(optValue)
            ? selected.filter(v => v !== optValue)
            : [...selected, optValue]
        );

      return (
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {row.options?.map((opt, i) => {
            const optValue = String(opt.value);
            return (
              <label
                key={opt.key ?? i}
                className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer select-none whitespace-nowrap"
              >
                <input
                  type="checkbox"
                  className="input-checkbox"
                  checked={selected.includes(optValue)}
                  onChange={() => toggleOption(optValue)}
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      );
    }

    if (row.dynamicType === "textarea") {
      return (
        <textarea
          className="input-field !mb-0 w-full"
          rows={3}
          placeholder={row.label}
          value={(rowValue as string) ?? ""}
          onChange={e => patchRow(row.key, e.target.value)}
        />
      );
    }

    return (
      <input
        type="text"
        className="input-field !mb-0 flex-1"
        value={(rowValue as string) ?? ""}
        onChange={e => patchRow(row.key, e.target.value)}
      />
    );
  };

  // group rows into render units: a row with no pairKey (or an unmatched pairKey) stands alone;
  // two rows sharing a pairKey render together in one row, side by side
  const renderUnits: CompactFormGroupRow[][] = [];
  const consumedKeys = new Set<string>();
  rows.forEach(row => {
    if (consumedKeys.has(row.key)) return;
    if (row.pairKey) {
      const partner = rows.find(
        r => r.key !== row.key && r.pairKey === row.pairKey && !consumedKeys.has(r.key)
      );
      if (partner) {
        renderUnits.push([row, partner]);
        consumedKeys.add(row.key);
        consumedKeys.add(partner.key);
        return;
      }
    }
    renderUnits.push([row]);
    consumedKeys.add(row.key);
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {renderUnits.map((unit, idx) => {
        const isLast = idx === renderUnits.length - 1;
        const rowBorder = isLast ? "" : "border-b border-slate-100";
        const isEmojiRow = unit.length === 1 && unit[0].dynamicType === "emojiScore";
        const isNotesRow = unit.length === 1 && unit[0].dynamicType === "textarea";

        if (isEmojiRow || isNotesRow) {
          return (
            <div key={unit[0].key} className={`px-3 py-2 ${rowBorder}`}>
              {renderField(unit[0])}
            </div>
          );
        }

        return (
          <div key={unit.map(r => r.key).join("|")} className={`flex flex-wrap ${rowBorder}`}>
            {unit.map((row, unitIdx) => (
              <div
                key={row.key}
                className={`flex items-center gap-3 px-3 py-2.5 flex-1 min-w-[280px] ${
                  unitIdx > 0 ? "sm:border-l border-slate-100" : ""
                }`}
              >
                <span className="text-sm font-semibold text-blue-600 shrink-0 whitespace-nowrap">
                  {row.label} :
                </span>
                {renderField(row)}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default CompactFormGroupControl;
