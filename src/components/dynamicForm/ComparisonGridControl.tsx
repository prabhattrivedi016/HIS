import { resolveComparisonGridConfig } from "@/config/comparisonGrids";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ControlSchema } from "./types";

export interface ComparisonRowValue {
  right?: string;
  left?: string;
}

export interface ComparisonGridValue {
  allNormal?: boolean;
  rows?: Record<string, ComparisonRowValue>;
  notes?: string;
}

interface ComparisonGridControlProps {
  schema: ControlSchema;
  value: unknown;
  onChange: (value: unknown) => void;
}

const ComparisonGridControl = ({ schema, value, onChange }: ComparisonGridControlProps) => {
  debugger;
  const config = resolveComparisonGridConfig(schema.gridConfigName ?? schema.label ?? "");
  const gridValue: ComparisonGridValue = (value as ComparisonGridValue) ?? {};
  const rowValues = gridValue.rows ?? {};

  if (!config) {
    return <p className="text-sm text-gray-400">No grid configuration found for this header</p>;
  }

  const patch = (partial: Partial<ComparisonGridValue>) => onChange({ ...gridValue, ...partial });

  const patchRow = (rowKey: string, partial: Partial<ComparisonRowValue>) =>
    patch({ rows: { ...rowValues, [rowKey]: { ...rowValues[rowKey], ...partial } } });

  const handleToggleAllNormal = (checked: boolean) => patch({ allNormal: checked });

  const copyLeftToRight = (rowKey: string) =>
    patchRow(rowKey, { right: rowValues[rowKey]?.left ?? "" });
  const copyRightToLeft = (rowKey: string) =>
    patchRow(rowKey, { left: rowValues[rowKey]?.right ?? "" });

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <p className="px-3 pt-3 pb-2 text-[15px] font-semibold text-blue-600">
        {schema.label ?? config.rows[0]?.label}
      </p>

      <div className="table-scroll-wrapper shadow-none border-0 rounded-none">
        <table className="base-table table-size">
          <thead className="table-head">
            <tr>
              <th className="table-th">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="input-checkbox"
                    checked={gridValue.allNormal ?? config.defaultAllNormal ?? false}
                    onChange={e => handleToggleAllNormal(e.target.checked)}
                  />
                  NORMAL
                </label>
              </th>
              <th className="table-th">RIGHT EYE</th>
              <th className="table-th w-20" />
              <th className="table-th">LEFT EYE</th>
            </tr>
          </thead>
          <tbody>
            {config.rows.map(row => {
              const rowValue = rowValues[row.key] ?? {};
              return (
                <tr key={row.key} className="table-row">
                  <td className="table-td font-semibold text-blue-600">{row.label}</td>
                  <td className="table-td">
                    <input
                      type="text"
                      className="input-field !mb-0"
                      value={rowValue.right ?? ""}
                      onChange={e => patchRow(row.key, { right: e.target.value })}
                    />
                  </td>
                  <td className="table-td">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => copyLeftToRight(row.key)}
                        title="Copy Left Eye value into Right Eye"
                        className="flex items-center justify-center w-6 h-6 rounded border border-slate-200 bg-white text-slate-400 hover:text-blue-600 hover:border-blue-300 transition-colors"
                      >
                        <ChevronLeft size={13} />
                      </button>
                      <span className="flex items-center justify-center w-6 h-6 rounded border border-slate-200 bg-slate-50 text-slate-300 text-xs">
                        =
                      </span>
                      <button
                        type="button"
                        onClick={() => copyRightToLeft(row.key)}
                        title="Copy Right Eye value into Left Eye"
                        className="flex items-center justify-center w-6 h-6 rounded border border-slate-200 bg-white text-slate-400 hover:text-blue-600 hover:border-blue-300 transition-colors"
                      >
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </td>
                  <td className="table-td">
                    <input
                      type="text"
                      className="input-field !mb-0"
                      value={rowValue.left ?? ""}
                      onChange={e => patchRow(row.key, { left: e.target.value })}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {config.notesEnabled !== false && (
        <div className="p-3">
          <textarea
            className="input-field !mb-0"
            rows={4}
            placeholder="Additional Notes"
            value={gridValue.notes ?? config.defaultNotes ?? ""}
            onChange={e => patch({ notes: e.target.value })}
          />
        </div>
      )}
    </div>
  );
};

export default ComparisonGridControl;
