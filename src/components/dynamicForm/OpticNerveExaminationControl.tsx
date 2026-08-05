import { OpticNerveExamRow, resolveOpticNerveExamConfig } from "@/config/opticNerveExamConfig";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Fragment } from "react";
import OpticDiscDiagram from "./OpticDiscDiagram";
import { ControlSchema } from "./types";

export interface OpticNerveExamRowValue {
  right?: string;
  left?: string;
  rightChecked?: boolean;
  leftChecked?: boolean;
}

export interface OpticNerveExamValue {
  rows?: Record<string, OpticNerveExamRowValue>;
  additionalNotes?: string;
  /** right panel's per-eye notes, shown below the reference diagram */
  rightOpticDiscNotes?: string;
  leftOpticDiscNotes?: string;
}

interface OpticNerveExaminationControlProps {
  schema: ControlSchema;
  value: unknown;
  onChange: (value: unknown) => void;
}

/** the one-off two-panel "Optic Nerve Examination" control (ControlTypeId 27) — see
 * config/opticNerveExamConfig.ts for why this isn't just another comparisonGrid rule. Left panel
 * is a plain text table (no copy-between-eyes column) with an Additional Notes box below it;
 * right panel is a checkbox table with the copy-between-eyes column and the reference fundus
 * diagram below it. Both panels are driven by config — no header-specific logic lives here. */
const OpticNerveExaminationControl = ({
  schema,
  value,
  onChange,
}: OpticNerveExaminationControlProps) => {
  const config = resolveOpticNerveExamConfig(schema.gridConfigName ?? schema.label ?? "");
  const examValue: OpticNerveExamValue = (value as OpticNerveExamValue) ?? {};
  const rowValues = examValue.rows ?? {};

  if (!config) {
    return <p className="text-sm text-gray-400">No grid configuration found for this header</p>;
  }

  const patch = (partial: Partial<OpticNerveExamValue>) => onChange({ ...examValue, ...partial });

  const patchRow = (rowKey: string, partial: Partial<OpticNerveExamRowValue>) =>
    patch({ rows: { ...rowValues, [rowKey]: { ...rowValues[rowKey], ...partial } } });

  const copyLeftToRight = (row: OpticNerveExamRow) => {
    const rowValue = rowValues[row.key] ?? {};
    if (row.type === "checkbox") patchRow(row.key, { rightChecked: rowValue.leftChecked ?? false });
    else patchRow(row.key, { right: rowValue.left ?? "" });
  };
  const copyRightToLeft = (row: OpticNerveExamRow) => {
    const rowValue = rowValues[row.key] ?? {};
    if (row.type === "checkbox") patchRow(row.key, { leftChecked: rowValue.rightChecked ?? false });
    else patchRow(row.key, { left: rowValue.right ?? "" });
  };

  const renderField = (
    row: OpticNerveExamRow,
    rowValue: OpticNerveExamRowValue,
    side: "right" | "left"
  ) => {
    if (row.type === "checkbox") {
      const checkedKey = side === "right" ? "rightChecked" : "leftChecked";
      return (
        <div className="flex justify-center">
          <input
            type="checkbox"
            className="input-checkbox"
            checked={Boolean(rowValue[checkedKey])}
            onChange={e => patchRow(row.key, { [checkedKey]: e.target.checked })}
          />
        </div>
      );
    }

    return (
      <input
        type="text"
        className="input-field !mb-0"
        value={rowValue[side] ?? ""}
        onChange={e => patchRow(row.key, { [side]: e.target.value })}
      />
    );
  };

  const renderPanel = (
    rows: OpticNerveExamRow[],
    showCompareColumn: boolean,
    leadingLabel?: string
  ) => {
    const groupHeaderColSpan = showCompareColumn ? 4 : 3;
    let previousGroupLabel: string | undefined;

    return (
      <div className="table-scroll-wrapper shadow-none border-0 rounded-none">
        <table className="base-table table-size">
          <thead className="table-head">
            <tr>
              <th className="table-th">{leadingLabel ?? ""}</th>
              <th className="table-th">RIGHT EYE</th>
              {showCompareColumn && <th className="table-th w-20" />}
              <th className="table-th">LEFT EYE</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              const rowValue = rowValues[row.key] ?? {};
              const showGroupHeader = Boolean(
                row.groupLabel && row.groupLabel !== previousGroupLabel
              );
              previousGroupLabel = row.groupLabel ?? previousGroupLabel;

              return (
                <Fragment key={row.key}>
                  {showGroupHeader && (
                    <tr>
                      <td
                        colSpan={groupHeaderColSpan}
                        className="table-td bg-slate-50 text-slate-500 font-semibold text-[11px] uppercase tracking-wide text-center py-1.5"
                      >
                        {row.groupLabel}
                      </td>
                    </tr>
                  )}
                  <tr className="table-row">
                    <td className="table-td font-semibold text-blue-600 align-top">{row.label}</td>
                    <td className="table-td align-top">{renderField(row, rowValue, "right")}</td>
                    {showCompareColumn && (
                      <td className="table-td">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => copyLeftToRight(row)}
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
                            onClick={() => copyRightToLeft(row)}
                            title="Copy Right Eye value into Left Eye"
                            className="flex items-center justify-center w-6 h-6 rounded border border-slate-200 bg-white text-slate-400 hover:text-blue-600 hover:border-blue-300 transition-colors"
                          >
                            <ChevronRight size={13} />
                          </button>
                        </div>
                      </td>
                    )}
                    <td className="table-td align-top">{renderField(row, rowValue, "left")}</td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <p className="text-[15px] font-semibold text-blue-600 px-3 pt-3 pb-2">{schema.label}</p>

      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 lg:border-r border-slate-100">
          {renderPanel(config.leftRows, false)}
          <div className="p-3">
            <textarea
              className="input-field !mb-0"
              rows={4}
              placeholder="Additional Notes"
              value={examValue.additionalNotes ?? ""}
              onChange={e => patch({ additionalNotes: e.target.value })}
            />
          </div>
        </div>

        <div className="flex-1">
          {renderPanel(config.rightRows, true, config.rightLeadingColumnLabel)}
          <div className="p-4 border-t border-slate-100">
            <OpticDiscDiagram />
          </div>
          <div className="px-3 pb-3">
            <div className="table-td bg-slate-50 text-slate-500 font-semibold text-[11px] uppercase tracking-wide text-center py-1.5 rounded">
              NOTES
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <input
                type="text"
                className="input-field !mb-0"
                placeholder="Right Optic Disc Notes"
                value={examValue.rightOpticDiscNotes ?? ""}
                onChange={e => patch({ rightOpticDiscNotes: e.target.value })}
              />
              <input
                type="text"
                className="input-field !mb-0"
                placeholder="Left Optic Disc Notes"
                value={examValue.leftOpticDiscNotes ?? ""}
                onChange={e => patch({ leftOpticDiscNotes: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpticNerveExaminationControl;
