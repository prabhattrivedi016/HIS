import { ComparisonGridRow, resolveComparisonGridConfig } from "@/config/comparisonGrids";
import { ChevronLeft, ChevronRight, FileText, X } from "lucide-react";
import { Fragment } from "react";
import OpticDiscDiagram from "./OpticDiscDiagram";
import { ControlSchema } from "./types";

export interface ComparisonRowValue {
  right?: string;
  left?: string;
  /** "lensCataract" rows only — the two cataract-grade dropdowns per eye; `right`/`left` above
   * still hold that eye's free-text detail field underneath them */
  rightGrade1?: string;
  rightGrade2?: string;
  leftGrade1?: string;
  leftGrade2?: string;
  /** "checkbox" rows only */
  rightChecked?: boolean;
  leftChecked?: boolean;
}

export interface ComparisonReportSlot {
  /** shown on the slot's tab — the picked file's name, or "Empty Slot" until one is chosen */
  label: string;
  /** base64 data URL of the picked file, once one is chosen */
  dataUrl?: string;
  fileName?: string;
}

export interface ComparisonGridValue {
  allNormal?: boolean;
  rows?: Record<string, ComparisonRowValue>;
  notes?: string;
  /** "reportSlotCount" grids only (e.g. Visual Field Analysis) */
  reportSlots?: ComparisonReportSlot[];
  activeReportSlotIndex?: number;
}

interface ComparisonGridControlProps {
  schema: ControlSchema;
  value: unknown;
  onChange: (value: unknown) => void;
}

const buildEmptyReportSlots = (count: number): ComparisonReportSlot[] =>
  Array.from({ length: count }, () => ({ label: "Empty Slot" }));

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read file"));
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });

/** config-driven — config/comparisonGrids.ts supplies this header's fixed row list (e.g. Fundus
 * Examination's Media/Disc/Blood Vessels/Macula/Midperiphery/Periphery); this component has no
 * header-specific logic in it. Unlike TableControl/MultiLevelInputGridControl, rows here aren't
 * user-added — the config's row list IS the grid.
 *
 * Also renders, all config-driven and all optional: grouped section-header rows (Optic Nerve
 * Examination's "RIM TO DISC RATIO" etc.), checkbox-type rows (Optic Disc's Pallor/Congestion/
 * Elevation) instead of text rows, a reference diagram pair below the table, and an "Empty Slot"
 * report-upload panel beside the table (Visual Field Analysis). See comparisonGrids.ts for what
 * each config flag does — adding a new differently-shaped grid never needs a change here.
 */
const ComparisonGridControl = ({ schema, value, onChange }: ComparisonGridControlProps) => {
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

  const copyLeftToRight = (row: ComparisonGridRow) => {
    const rowValue = rowValues[row.key] ?? {};
    if (row.type === "checkbox") patchRow(row.key, { rightChecked: rowValue.leftChecked ?? false });
    else patchRow(row.key, { right: rowValue.left ?? "" });
  };
  const copyRightToLeft = (row: ComparisonGridRow) => {
    const rowValue = rowValues[row.key] ?? {};
    if (row.type === "checkbox") patchRow(row.key, { leftChecked: rowValue.rightChecked ?? false });
    else patchRow(row.key, { left: rowValue.right ?? "" });
  };

  const renderEyeField = (
    row: ComparisonGridRow,
    rowValue: ComparisonRowValue,
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

    if (row.type === "lensCataract") {
      type LensGradeKey = "rightGrade1" | "leftGrade1" | "rightGrade2" | "leftGrade2";
      const grade1Key: LensGradeKey = side === "right" ? "rightGrade1" : "leftGrade1";
      const grade2Key: LensGradeKey = side === "right" ? "rightGrade2" : "leftGrade2";
      const gradeKeys: LensGradeKey[] = [grade1Key, grade2Key];
      return (
        <div className="space-y-1">
          <div className="flex gap-1">
            {gradeKeys.map(gradeKey => (
              <select
                key={gradeKey}
                className="input-field !mb-0"
                value={rowValue[gradeKey] ?? ""}
                onChange={e => patchRow(row.key, { [gradeKey]: e.target.value })}
              >
                <option value="">Select</option>
                {row.options?.map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ))}
          </div>
          <input
            type="text"
            className="input-field !mb-0"
            value={rowValue[side] ?? ""}
            onChange={e => patchRow(row.key, { [side]: e.target.value })}
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

  // report-upload slots (Visual Field Analysis, ONH OCT, Macula OCT)
  const reportSlotsEnabled = Boolean(config.reportSlotCount);
  const reportSlots = gridValue.reportSlots ?? buildEmptyReportSlots(config.reportSlotCount ?? 0);
  const activeSlotIndex = gridValue.activeReportSlotIndex ?? 0;
  const activeSlot: ComparisonReportSlot | undefined = reportSlots[activeSlotIndex];

  const handleSelectSlot = (idx: number) => patch({ activeReportSlotIndex: idx });

  const handleRemoveSlot = (idx: number) => {
    const nextSlots = reportSlots.map((slot, i) =>
      i === idx ? { label: "Empty Slot", dataUrl: undefined, fileName: undefined } : slot
    );
    patch({ reportSlots: nextSlots });
  };

  const handleUploadToActiveSlot = async (file: File) => {
    const dataUrl = await readFileAsDataUrl(file);
    const nextSlots = reportSlots.map((slot, i) =>
      i === activeSlotIndex ? { label: file.name, dataUrl, fileName: file.name } : slot
    );
    patch({ reportSlots: nextSlots });
  };

  const showCompareColumn = config.showCompareColumn !== false;
  const groupHeaderColSpan = showCompareColumn ? 4 : 3;

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-3 pt-3 pb-2 flex-wrap">
        <p className="text-[15px] font-semibold text-blue-600">
          {schema.label ?? config.rows[0]?.label}
        </p>

        {reportSlotsEnabled && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {reportSlots.map((slot, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSlot(idx)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold transition-colors ${
                  idx === activeSlotIndex
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-slate-200 text-slate-500 hover:border-blue-300"
                }`}
              >
                {slot.fileName ?? slot.label}
                {idx === activeSlotIndex && (
                  <span
                    role="button"
                    tabIndex={-1}
                    onClick={e => {
                      e.stopPropagation();
                      handleRemoveSlot(idx);
                    }}
                    className="flex items-center justify-center w-4 h-4 rounded-full bg-white/25 hover:bg-white/40"
                  >
                    <X size={10} />
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={reportSlotsEnabled ? "flex flex-col lg:flex-row" : ""}>
        <div className={reportSlotsEnabled ? "lg:w-1/2 lg:border-r border-slate-100" : "w-full"}>
          <div className="table-scroll-wrapper shadow-none border-0 rounded-none">
            <table className="base-table table-size">
              <thead className="table-head">
                <tr>
                  <th className="table-th">
                    {config.normalCheckboxEnabled !== false ? (
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          className="input-checkbox"
                          checked={gridValue.allNormal ?? config.defaultAllNormal ?? false}
                          onChange={e => handleToggleAllNormal(e.target.checked)}
                        />
                        NORMAL
                      </label>
                    ) : (
                      <span>{config.leadingColumnLabel ?? ""}</span>
                    )}
                  </th>
                  <th className="table-th">RIGHT EYE</th>
                  {showCompareColumn && <th className="table-th w-20" />}
                  <th className="table-th">LEFT EYE</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  let previousGroupLabel: string | undefined;
                  return config.rows.map(row => {
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
                          <td className="table-td font-semibold text-blue-600 align-top">
                            {row.label}
                          </td>
                          <td className="table-td align-top">
                            {renderEyeField(row, rowValue, "right")}
                          </td>
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
                          <td className="table-td align-top">
                            {renderEyeField(row, rowValue, "left")}
                          </td>
                        </tr>
                      </Fragment>
                    );
                  });
                })()}
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

        {reportSlotsEnabled && (
          <div className="lg:w-1/2 p-4 flex items-center justify-center">
            {activeSlot?.dataUrl ? (
              <div className="flex flex-col items-center gap-2 text-center">
                <FileText size={48} className="text-blue-500" />
                <p className="text-sm font-medium text-slate-700 break-all">
                  {activeSlot.fileName}
                </p>
                <button
                  type="button"
                  onClick={() => handleRemoveSlot(activeSlotIndex)}
                  className="text-xs text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-2 w-full max-w-xs p-8 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/40 cursor-pointer hover:bg-blue-50 transition-colors">
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadToActiveSlot(file);
                    e.target.value = "";
                  }}
                />
                <FileText size={48} className="text-red-500" />
                <p className="text-sm font-bold text-slate-700 text-center">
                  Click Here to Upload a Report
                </p>
              </label>
            )}
          </div>
        )}
      </div>

      {config.referenceDiagram === "opticDisc" && (
        <div className="p-4 border-t border-slate-100">
          <OpticDiscDiagram />
        </div>
      )}
    </div>
  );
};

export default ComparisonGridControl;
