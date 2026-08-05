import { ControlSchema } from "./types";

interface RadioScoreGroupControlProps {
  schema: ControlSchema;
  value: unknown;
  onChange: (value: unknown) => void;
}

const RadioScoreGroupControl = ({ schema, value, onChange }: RadioScoreGroupControlProps) => {
  const rows = schema.rows ?? [];
  const groupValue = (value as Record<string, unknown>) ?? {};

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
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
        <p className="text-[15px] font-semibold text-blue-600">{schema.label}</p>
        <span className="flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-[#0B5394] text-white text-xs font-bold">
          {totalScore}
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {rows.map(row => (
          <div key={row.key} className="flex flex-wrap items-center gap-x-8 gap-y-2 px-4 py-3">
            <p className="text-sm font-semibold text-slate-700 w-40 shrink-0">{row.label}</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {row.options.map((opt, idx) => (
                <label
                  key={opt.key ?? idx}
                  className="flex items-center gap-2 cursor-pointer text-sm text-slate-600"
                >
                  <input
                    type="radio"
                    name={`${schema.key}_${row.key}`}
                    className="w-4 h-4 accent-[#0B5394]"
                    checked={groupValue[row.key] === opt.value}
                    onChange={() => handleSelect(row.key, opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RadioScoreGroupControl;
