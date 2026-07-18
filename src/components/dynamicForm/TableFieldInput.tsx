import { TableColumnSchema } from "./types";

const parseDuration = (value: unknown) => {
  const str = String(value ?? "");
  const years = Number(str.match(/(\d+)\s*Year/i)?.[1] ?? 0);
  const months = Number(str.match(/(\d+)\s*Month/i)?.[1] ?? 0);
  const days = Number(str.match(/(\d+)\s*Day/i)?.[1] ?? 0);
  return { years, months, days };
};

const formatDuration = (years: number, months: number, days: number) => {
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} Year${years > 1 ? "s" : ""}`);
  if (months > 0) parts.push(`${months} Month${months > 1 ? "s" : ""}`);
  if (days > 0) parts.push(`${days} Day${days > 1 ? "s" : ""}`);
  return parts.join(" ");
};

const DurationInput = ({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (value: unknown) => void;
}) => {
  const { years, months, days } = parseDuration(value);

  const update = (next: { years?: number; months?: number; days?: number }) =>
    onChange(
      formatDuration(next.years ?? years, next.months ?? months, next.days ?? days)
    );

  const unitSelect = (
    label: string,
    count: number,
    current: number,
    onPick: (n: number) => void
  ) => (
    <select
      className="input-field !mb-0"
      value={current}
      onChange={e => onPick(Number(e.target.value))}
    >
      {Array.from({ length: count + 1 }, (_, n) => (
        <option key={n} value={n}>
          {n} {label}
          {n === 1 ? "" : "s"}
        </option>
      ))}
    </select>
  );

  return (
    <div className="flex gap-1">
      {unitSelect("Year", 10, years, n => update({ years: n }))}
      {unitSelect("Month", 12, months, n => update({ months: n }))}
      {unitSelect("Day", 30, days, n => update({ days: n }))}
    </div>
  );
};

export const TableFieldInput = ({
  column,
  value,
  onChange,
  onKeyDown,
}: {
  column: TableColumnSchema;
  value: unknown;
  onChange: (value: unknown) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
}) => {
  if (/duration/i.test(column.label)) return <DurationInput value={value} onChange={onChange} />;

  switch (column.dataTypeId) {
    case 2:
      return (
        <input
          type="number"
          className="input-field !mb-0"
          value={(value as string) ?? ""}
          onChange={e => onChange(e.target.value)}
          onKeyDown={onKeyDown}
        />
      );
    case 3:
      return (
        <input
          type="date"
          className="input-field !mb-0"
          value={(value as string) ?? ""}
          onChange={e => onChange(e.target.value)}
          onKeyDown={onKeyDown}
        />
      );
    case 4:
      return (
        <textarea
          className="input-field !mb-0 resize-y min-h-[38px]"
          rows={1}
          value={(value as string) ?? ""}
          onChange={e => onChange(e.target.value)}
          onKeyDown={onKeyDown}
        />
      );
    case 5: {
      const options = column.options ?? [];
      const groups = [...new Set(options.map(opt => opt.group))];
      const hasGroups = groups.some(Boolean);

      return (
        <select
          className="input-field !mb-0"
          value={(value as string) ?? ""}
          onChange={e => onChange(e.target.value)}
          onKeyDown={onKeyDown}
        >
          <option value="">-- Select --</option>
          {hasGroups
            ? groups.map(groupName => (
                <optgroup key={groupName ?? "_"} label={groupName ?? ""}>
                  {options
                    .filter(opt => opt.group === groupName)
                    .map((opt, i) => (
                      <option key={opt.key ?? `${groupName}-${i}`} value={opt.value as string}>
                        {opt.label}
                      </option>
                    ))}
                </optgroup>
              ))
            : options.map((opt, i) => (
                <option key={opt.key ?? i} value={opt.value as string}>
                  {opt.label}
                </option>
              ))}
        </select>
      );
    }
    default:
      return (
        <input
          type="text"
          className="input-field !mb-0"
          value={(value as string) ?? ""}
          onChange={e => onChange(e.target.value)}
          onKeyDown={onKeyDown}
        />
      );
  }
};
