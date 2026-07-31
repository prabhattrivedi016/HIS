import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export interface KeratometerRow {
  method?: string;
  odK1?: string;
  odAxis1?: string;
  odK2?: string;
  odAxis2?: string;
  osK1?: string;
  osAxis1?: string;
  osK2?: string;
  osAxis2?: string;
}

const ROW_FIELD_KEYS: (keyof KeratometerRow)[] = [
  "method",
  "odK1",
  "odAxis1",
  "odK2",
  "odAxis2",
  "osK1",
  "osAxis1",
  "osK2",
  "osAxis2",
];

interface KeratometerTableProps {
  value?: KeratometerRow[];
  onChange: (rows: KeratometerRow[]) => void;
}

/** mirrors TableControl's own row behavior (hover/focus-to-edit, trash-to-remove, add-row button,
 * empty state) so this reads as the same control family — just with Keratometer's two-level
 * OD/OS x K1/AXIS/K2/AXIS header instead of a flat column list, which the shared generic
 * TableControl (driven by a flat TableColumnSchema[]) has no way to express. */
const KeratometerTable = ({ value, onChange }: KeratometerTableProps) => {
  const rows = value ?? [];
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null);
  const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);

  const handleAddRow = () => onChange([...rows, {}]);
  const handleRemoveRow = (rowIndex: number) => onChange(rows.filter((_, idx) => idx !== rowIndex));
  const handleCellChange = (rowIndex: number, key: keyof KeratometerRow, fieldValue: string) =>
    onChange(rows.map((row, idx) => (idx === rowIndex ? { ...row, [key]: fieldValue } : row)));

  return (
    <div className="rounded-xl border border-slate-200 bg-white/55 overflow-hidden">
      <div className="flex items-center gap-3 px-3 py-2.5 bg-gradient-to-r from-slate-100 via-slate-50 to-white border-b border-slate-200">
        <button
          type="button"
          onClick={handleAddRow}
          title="Add row"
          className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-600 text-white shadow-sm hover:bg-slate-700 active:scale-95 transition-all shrink-0"
        >
          <Plus size={15} />
        </button>
        <p className="text-sm font-bold text-slate-700">Keratometer (dioptres)</p>
      </div>

      <div className="table-scroll-wrapper shadow-none border-0 rounded-none">
        <table className="base-table table-size">
          <thead className="table-head">
            <tr>
              <th rowSpan={2} className="table-th align-bottom">
                METHOD
              </th>
              <th colSpan={4} className="table-th text-center border-l border-slate-200">
                OD
              </th>
              <th colSpan={4} className="table-th text-center border-l border-slate-200">
                OS
              </th>
              <th rowSpan={2} className="table-th w-16 text-center align-bottom">
                Action
              </th>
            </tr>
            <tr>
              <th className="table-th text-center border-l border-slate-200">K1</th>
              <th className="table-th text-center">AXIS</th>
              <th className="table-th text-center">K2</th>
              <th className="table-th text-center">AXIS</th>
              <th className="table-th text-center border-l border-slate-200">K1</th>
              <th className="table-th text-center">AXIS</th>
              <th className="table-th text-center">K2</th>
              <th className="table-th text-center">AXIS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => {
              const isEditable = rowIndex === hoveredRowIndex || rowIndex === focusedRowIndex;

              return (
                <tr
                  key={rowIndex}
                  className={`table-row ${isEditable ? "bg-blue-50/40" : ""}`}
                  onMouseEnter={() => setHoveredRowIndex(rowIndex)}
                  onMouseLeave={() => setHoveredRowIndex(prev => (prev === rowIndex ? null : prev))}
                  onFocus={() => setFocusedRowIndex(rowIndex)}
                  onBlur={e => {
                    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                    setFocusedRowIndex(prev => (prev === rowIndex ? null : prev));
                  }}
                >
                  {ROW_FIELD_KEYS.map((key, colIdx) =>
                    isEditable ? (
                      <td
                        key={key}
                        className={`table-td ${colIdx === 1 || colIdx === 5 ? "border-l border-slate-100" : ""}`}
                      >
                        <input
                          type="text"
                          className="input-field !mb-0"
                          value={row[key] ?? ""}
                          onChange={e => handleCellChange(rowIndex, key, e.target.value)}
                        />
                      </td>
                    ) : (
                      <td
                        key={key}
                        className={`table-td text-gray-700 ${colIdx === 1 || colIdx === 5 ? "border-l border-slate-100" : ""}`}
                      >
                        {String(row[key] ?? "").trim() || "—"}
                      </td>
                    )
                  )}
                  <td className="table-td table-action">
                    <div className="flex items-center justify-center">
                      <button type="button" onClick={() => handleRemoveRow(rowIndex)}>
                        <Trash2 size={14} className="text-gray-400 hover:text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td className="table-empty" colSpan={ROW_FIELD_KEYS.length + 1}>
                  No rows added
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KeratometerTable;
