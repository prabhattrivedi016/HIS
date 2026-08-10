import ToothIcon, {
  toothCategoryForNumber,
} from "@/screens/doctorConsultationNew/components/ToothIcon";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Plus,
  Settings,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import OtherTreatmentModal from "./OtherTreatmentModal";
import { ControlSchema } from "./types";

export type DentalTreatmentCategory = "Extraction" | "IPR" | "Attachment" | "Other Treatment";
export type DentalDoAtStage = "Pre-treatment" | "During treatment" | "Post-treatment";
export type DentalTreatmentStatus = "planned" | "inProgress" | "completed";

export interface DentalTreatmentItem {
  id: string;
  category: DentalTreatmentCategory;
  /** free-text procedure name — only used/editable for "Other Treatment" entries; Extraction/IPR/
   * Attachment entries always display their fixed category name instead */
  label?: string;
  /** every tooth ("18") or IPR gap ("15-14") staged under this row — Extraction/IPR/Attachment
   * each collapse to ONE row per category that grows/shrinks as teeth are marked/unmarked, so
   * clicking a 2nd tooth for extraction adds to the existing row instead of creating a new one */
  teeth: string[];
  price: number;
  qty: number;
  doAt: DentalDoAtStage;
  status: DentalTreatmentStatus;
  /** ISO date this row was staged, shown on its treatment-plan card */
  createdDate: string;
  doctorName?: string;
}

export interface DentalProcedure {
  id: string;
  name: string;
  price: number;
  category?: string;
}

export interface DentalChartControlValue {
  /** toothNumber (FDI notation) -> mark, kept independent of the currently-active mode so a
   * tooth marked earlier stays visibly highlighted when switching tabs */
  marks?: Record<number, "extraction" | "attachment">;
  /** gap keys, e.g. "17-16" */
  ipr?: string[];
  /** teeth picked in "Other Treatments" mode, staged until "Add Treatment" is clicked */
  otherSelectedTeeth?: number[];
  treatments?: DentalTreatmentItem[];
  /** procedures picked/created from the "Other Treatments" Add Treatment modal, kept with the
   * chart so a name typed once (with its price) is reusable next time */
  otherProcedures?: DentalProcedure[];
}

interface DentalChartControlProps {
  schema: ControlSchema;
  value: unknown;
  onChange: (value: unknown) => void;
}

type ChartMode = "extraction" | "ipr" | "attachment" | "other";

const MODE_ORDER: ChartMode[] = ["extraction", "ipr", "attachment", "other"];

const MODE_META: Record<
  ChartMode,
  { label: string; color: string; hint: string; category: DentalTreatmentCategory }
> = {
  extraction: {
    label: "Extraction",
    color: "#dc2626",
    hint: "Click a tooth to mark for extraction",
    category: "Extraction",
  },
  ipr: {
    label: "IPR",
    color: "#2563eb",
    hint: "Click the gap between two teeth",
    category: "IPR",
  },
  attachment: {
    label: "Attachment",
    color: "#9333ea",
    hint: "Click a tooth to place an attachment",
    category: "Attachment",
  },
  other: {
    label: "Other Treatments",
    color: "#0d9488",
    hint: "Click teeth, then Add Treatment",
    category: "Other Treatment",
  },
};

const CATEGORY_COLOR: Record<DentalTreatmentCategory, string> = {
  Extraction: MODE_META.extraction.color,
  IPR: MODE_META.ipr.color,
  Attachment: MODE_META.attachment.color,
  "Other Treatment": MODE_META.other.color,
};

/** the one stable row-id each Extraction/Attachment/IPR group lives under — every mark of that
 * type syncs into this same row instead of creating a new one per tooth/gap */
const GROUP_ID: Record<"Extraction" | "Attachment" | "IPR", string> = {
  Extraction: "group-extraction",
  Attachment: "group-attachment",
  IPR: "group-ipr",
};

const DO_AT_STAGES: DentalDoAtStage[] = ["Pre-treatment", "During treatment", "Post-treatment"];

const UPPER_TEETH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_TEETH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
const ALL_TEETH_ORDER = [...UPPER_TEETH, ...LOWER_TEETH];
const gapSortIndex = (gapKey: string) => ALL_TEETH_ORDER.indexOf(Number(gapKey.split("-")[0]));

const STATUS_COLUMNS: {
  status: DentalTreatmentStatus;
  title: string;
  pillClass: string;
  cardBorderClass: string;
  emptyText: string;
}[] = [
  {
    status: "planned",
    title: "Treatment Plans",
    pillClass: "border-amber-300 text-amber-600 bg-amber-50",
    cardBorderClass: "border-amber-200",
    emptyText: "No pending treatments",
  },
  {
    status: "inProgress",
    title: "In Progress",
    pillClass: "border-blue-300 text-blue-600 bg-blue-50",
    cardBorderClass: "border-blue-200",
    emptyText: "No treatments in progress",
  },
  {
    status: "completed",
    title: "Completed",
    pillClass: "border-emerald-300 text-emerald-600 bg-emerald-50",
    cardBorderClass: "border-emerald-200",
    emptyText: "No completed treatments",
  },
];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const treatmentLabel = (item: DentalTreatmentItem) =>
  item.category === "Other Treatment" ? item.label || "Other Treatment" : item.category;

/** self-contained "Dental chart" control — tooth marking (extraction/IPR/attachment/other) plus
 * the treatment-plan staging board below it. Marking a tooth (or picking teeth + "Add Treatment"
 * for "Other Treatments") both toggles the chart AND stages/removes the matching row in
 * `treatments`, so the chart and the planning board never go out of sync. Every tooth marked for
 * the same category (Extraction/Attachment/IPR) folds into that one category's row instead of
 * adding a new row per click. */
const DentalChartControl = ({ schema, value, onChange }: DentalChartControlProps) => {
  const chartValue = (value as DentalChartControlValue) ?? {};
  const marks = chartValue.marks ?? {};
  const ipr = chartValue.ipr ?? [];
  const otherSelectedTeeth = chartValue.otherSelectedTeeth ?? [];
  const treatments = chartValue.treatments ?? [];
  const otherProcedures = chartValue.otherProcedures ?? [];
  /** the "Planned markings & staging" table only ever covers the chart-driven categories —
   * "Other Treatment" rows live solely on the kanban board below it */
  const chartOnlyTreatments = treatments.filter(t => t.category !== "Other Treatment");

  const [mode, setMode] = useState<ChartMode>("extraction");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showOtherModal, setShowOtherModal] = useState(false);

  const handleModeChange = (m: ChartMode) => setMode(m);

  const toggleExpanded = (id: string) =>
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const updateTreatment = (id: string, patch: Partial<DentalTreatmentItem>) =>
    onChange({
      ...chartValue,
      treatments: treatments.map(t => (t.id === id ? { ...t, ...patch } : t)),
    });

  const syncCategoryEntry = (
    list: DentalTreatmentItem[],
    category: "Extraction" | "Attachment" | "IPR",
    teeth: string[]
  ): DentalTreatmentItem[] => {
    const id = GROUP_ID[category];
    const existing = list.find(t => t.id === id);
    if (!teeth.length) return existing ? list.filter(t => t.id !== id) : list;
    if (existing) return list.map(t => (t.id === id ? { ...t, teeth, qty: teeth.length } : t));
    return [
      ...list,
      {
        id,
        category,
        teeth,
        price: 0,
        qty: teeth.length,
        doAt: "Pre-treatment",
        status: "planned",
        createdDate: new Date().toISOString(),
        doctorName: schema.doctorName,
      },
    ];
  };

  const syncMarkGroups = (
    nextMarks: Record<number, "extraction" | "attachment">,
    nextIpr: string[]
  ): DentalTreatmentItem[] => {
    const extractionTeeth = Object.keys(nextMarks)
      .filter(tooth => nextMarks[Number(tooth)] === "extraction")
      .sort((a, b) => Number(a) - Number(b));
    const attachmentTeeth = Object.keys(nextMarks)
      .filter(tooth => nextMarks[Number(tooth)] === "attachment")
      .sort((a, b) => Number(a) - Number(b));
    const sortedIpr = [...nextIpr].sort((a, b) => gapSortIndex(a) - gapSortIndex(b));

    let next = syncCategoryEntry(treatments, "Extraction", extractionTeeth);
    next = syncCategoryEntry(next, "Attachment", attachmentTeeth);
    next = syncCategoryEntry(next, "IPR", sortedIpr);
    return next;
  };

  const deleteTreatment = (item: DentalTreatmentItem) => {
    if (item.category === "Extraction" || item.category === "Attachment") {
      const type = item.category === "Extraction" ? "extraction" : "attachment";
      const nextMarks = { ...marks };
      item.teeth.forEach(tooth => {
        if (nextMarks[Number(tooth)] === type) delete nextMarks[Number(tooth)];
      });
      onChange({
        ...chartValue,
        marks: nextMarks,
        treatments: treatments.filter(t => t.id !== item.id),
      });
      return;
    }
    if (item.category === "IPR") {
      const nextIpr = ipr.filter(gapKey => !item.teeth.includes(gapKey));
      onChange({
        ...chartValue,
        ipr: nextIpr,
        treatments: treatments.filter(t => t.id !== item.id),
      });
      return;
    }
    onChange({ ...chartValue, treatments: treatments.filter(t => t.id !== item.id) });
  };

  const toggleToothMark = (tooth: number) => {
    const type: "extraction" | "attachment" = mode === "extraction" ? "extraction" : "attachment";
    const nextMarks = { ...marks };
    if (nextMarks[tooth] === type) delete nextMarks[tooth];
    else nextMarks[tooth] = type;
    onChange({ ...chartValue, marks: nextMarks, treatments: syncMarkGroups(nextMarks, ipr) });
  };

  const toggleGap = (gapKey: string) => {
    const nextIpr = ipr.includes(gapKey) ? ipr.filter(g => g !== gapKey) : [...ipr, gapKey];
    onChange({ ...chartValue, ipr: nextIpr, treatments: syncMarkGroups(marks, nextIpr) });
  };

  const toggleOtherTooth = (tooth: number) => {
    const next = otherSelectedTeeth.includes(tooth)
      ? otherSelectedTeeth.filter(t => t !== tooth)
      : [...otherSelectedTeeth, tooth];
    onChange({ ...chartValue, otherSelectedTeeth: next });
  };

  const openAddOtherForm = () => {
    if (mode !== "other" || !otherSelectedTeeth.length) return;
    setShowOtherModal(true);
  };

  const addProcedure = (procedure: DentalProcedure) =>
    onChange({ ...chartValue, otherProcedures: [...otherProcedures, procedure] });

  const confirmAddOtherTreatment = ({
    name,
    price,
    qty,
  }: {
    name: string;
    price: number;
    qty: number;
  }) => {
    const newItem: DentalTreatmentItem = {
      id: `other-${Date.now()}`,
      category: "Other Treatment",
      label: name,
      teeth: [...otherSelectedTeeth].sort((a, b) => a - b).map(String),
      price,
      qty,
      doAt: "Pre-treatment",
      status: "planned",
      createdDate: new Date().toISOString(),
      doctorName: schema.doctorName,
    };
    onChange({ ...chartValue, otherSelectedTeeth: [], treatments: [...treatments, newItem] });
    setShowOtherModal(false);
  };

  const handleToothClick = (tooth: number) => {
    if (mode === "ipr") return;
    if (mode === "other") {
      toggleOtherTooth(tooth);
      return;
    }
    toggleToothMark(tooth);
  };

  const renderToothRow = (teeth: number[], label: string) => (
    <div>
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
        {label}
      </p>
      <div className="flex items-center overflow-x-auto pb-1">
        {teeth.map((tooth, idx) => {
          const gapKey = idx > 0 ? `${teeth[idx - 1]}-${tooth}` : undefined;
          const gapMarked = gapKey ? ipr.includes(gapKey) : false;
          const mark = marks[tooth];
          const markColor =
            mark === "extraction"
              ? CATEGORY_COLOR.Extraction
              : mark === "attachment"
                ? CATEGORY_COLOR.Attachment
                : undefined;
          const isOtherSelected =
            !markColor && mode === "other" && otherSelectedTeeth.includes(tooth);
          const toothColor =
            markColor ?? (isOtherSelected ? CATEGORY_COLOR["Other Treatment"] : undefined);

          return (
            <div key={tooth} className="flex items-center">
              {gapKey && (
                <button
                  type="button"
                  onClick={() => toggleGap(gapKey)}
                  disabled={mode !== "ipr"}
                  title="Mark IPR"
                  className={`w-4 h-16 flex items-center justify-center shrink-0 ${
                    mode === "ipr" ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <span
                    className="w-1.5 h-12 rounded-full transition-colors"
                    style={{ backgroundColor: gapMarked ? CATEGORY_COLOR.IPR : "#e2e8f0" }}
                  />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleToothClick(tooth)}
                title={`Tooth ${tooth}`}
                className="flex flex-col items-center justify-center gap-1 w-14 h-16 rounded-xl border shrink-0 transition-colors bg-white hover:border-slate-300"
                style={{
                  borderColor: toothColor ?? "#e2e8f0",
                  backgroundColor: toothColor ? `${toothColor}14` : undefined,
                }}
              >
                <ToothIcon category={toothCategoryForNumber(tooth)} color={toothColor} size={20} />
                <span
                  className="text-[10px] font-semibold"
                  style={{ color: toothColor ?? "#64748b" }}
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

  const renderTreatmentCard = (item: DentalTreatmentItem, cardBorderClass: string) => {
    const expanded = expandedIds.has(item.id);
    const isOther = item.category === "Other Treatment";

    return (
      <div key={item.id} className={`rounded-xl border ${cardBorderClass} bg-white p-3 text-xs`}>
        <div
          className="flex items-center justify-between gap-2 cursor-pointer"
          onClick={() => toggleExpanded(item.id)}
        >
          <span className="flex items-center gap-1.5 min-w-0">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: CATEGORY_COLOR[item.category] }}
            />
            <span className="font-semibold text-slate-700 truncate">{item.teeth.join(", ")}</span>
            <span className="text-slate-500 font-medium shrink-0">{treatmentLabel(item)}</span>
          </span>
          <span className="flex items-center gap-1 text-slate-600 font-semibold shrink-0">
            ₹{item.price * item.qty}
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        </div>
        <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-400">
          <span>{formatDate(item.createdDate)}</span>
          <span>{item.doctorName || "-"}</span>
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
            <div className="flex items-end justify-between gap-2">
              <div>
                <p className="text-slate-400 mb-1">Item Price</p>
                {isOther ? (
                  <p className="font-semibold text-slate-700 py-1">₹{item.price}</p>
                ) : (
                  <input
                    type="number"
                    min={0}
                    className="input-field !mb-0 !py-1 !w-20 !text-xs"
                    value={item.price}
                    onChange={e => updateTreatment(item.id, { price: Number(e.target.value) || 0 })}
                  />
                )}
              </div>
              <div>
                <p className="text-slate-400 mb-1">Total</p>
                <p className="font-semibold text-slate-700 py-1">₹{item.price * item.qty}</p>
              </div>
              <div>
                <p className="text-slate-400 mb-1">Qty</p>
                <p className="font-semibold text-slate-700 py-1">{item.qty}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {item.status === "planned" && (
                <button
                  type="button"
                  onClick={() => updateTreatment(item.id, { status: "inProgress" })}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  <PlayCircle size={12} />
                  Start
                </button>
              )}
              {item.status !== "completed" && (
                <button
                  type="button"
                  onClick={() => updateTreatment(item.id, { status: "completed" })}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-semibold"
                >
                  <CheckCircle2 size={12} />
                  Completed
                </button>
              )}
              <button
                type="button"
                onClick={() => deleteTreatment(item)}
                title="Delete"
                className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
          <div>
            <p className="text-[17px] font-bold text-slate-800">{schema.label || "Dental chart"}</p>
            <p className="text-sm text-slate-400">Mark IPR, extractions and attachments.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openAddOtherForm}
              disabled={mode !== "other" || !otherSelectedTeeth.length}
              className="save-btn !w-auto !px-4 !py-2 !text-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={14} />
              Add Treatment
              {mode === "other" && otherSelectedTeeth.length
                ? ` (${otherSelectedTeeth.length})`
                : ""}
            </button>
            <button
              type="button"
              title="Settings"
              className="cancel-button !w-auto !px-4 !py-2 !text-xs flex items-center gap-1.5"
            >
              <Settings size={14} />
              Settings
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap mb-2">
          {MODE_ORDER.map(m => {
            const meta = MODE_META[m];
            const active = mode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => handleModeChange(m)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors border"
                style={
                  active
                    ? { backgroundColor: meta.color, borderColor: meta.color, color: "white" }
                    : { backgroundColor: "white", borderColor: "#e2e8f0", color: "#475569" }
                }
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: active ? "white" : meta.color }}
                />
                {meta.label}
              </button>
            );
          })}
        </div>
        <p className="text-xs italic text-slate-400 mb-4">*{MODE_META[mode].hint}</p>

        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-6">
          {renderToothRow(UPPER_TEETH, "Upper")}
          {renderToothRow(LOWER_TEETH, "Lower")}
        </div>

        <div className="flex items-center gap-4 mt-3 flex-wrap text-[11px] text-slate-500">
          {MODE_ORDER.filter(m => m !== "other").map(m => (
            <span key={m} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: MODE_META[m].color }}
              />
              {MODE_META[m].label}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-emerald-50/40 border border-emerald-100 p-5 space-y-4">
        <div>
          <p className="text-sm font-bold text-slate-800">Planned markings &amp; staging</p>
          <p className="text-xs text-slate-400">
            {treatments.length
              ? "When should each procedure be done during treatment?"
              : "Mark IPR, extractions or attachments on the chart above to stage them."}
          </p>
        </div>

        {chartOnlyTreatments.length > 0 && (
          <div className="table-scroll-wrapper rounded-xl border border-slate-200 bg-white">
            <table className="base-table table-size">
              <thead>
                <tr className="table-head">
                  <th className="table-th text-left">Treatment</th>
                  <th className="table-th text-left">Teeth</th>
                  <th className="table-th text-left">Price</th>
                  <th className="table-th text-left">Qty</th>
                  <th className="table-th text-left">Total</th>
                  <th className="table-th text-left">Do At</th>
                </tr>
              </thead>
              <tbody>
                {chartOnlyTreatments.map(item => (
                  <tr key={item.id} className="table-row">
                    <td className="table-td">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: CATEGORY_COLOR[item.category] }}
                        />
                        <span
                          className="font-semibold"
                          style={{ color: CATEGORY_COLOR[item.category] }}
                        >
                          {treatmentLabel(item)}
                        </span>
                      </span>
                    </td>
                    <td className="table-td">{item.teeth.join(", ")}</td>
                    <td className="table-td">₹{item.price}</td>
                    <td className="table-td">{item.qty}</td>
                    <td className="table-td">₹{item.price * item.qty}</td>
                    <td className="table-td">
                      <select
                        className="input-field !mb-0 !py-1 !text-xs"
                        value={item.doAt}
                        onChange={e =>
                          updateTreatment(item.id, { doAt: e.target.value as DentalDoAtStage })
                        }
                      >
                        {DO_AT_STAGES.map(s => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {STATUS_COLUMNS.map(col => {
            const columnItems = treatments.filter(t => t.status === col.status);
            const qtyCount = columnItems.reduce((sum, t) => sum + t.qty, 0);
            const total = columnItems.reduce((sum, t) => sum + t.price * t.qty, 0);
            return (
              <div key={col.status} className="rounded-xl border border-slate-100 bg-white p-3">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-1">
                  <span
                    className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold ${col.pillClass}`}
                  >
                    {col.title} : {qtyCount}
                  </span>
                  <span className="text-[11px] text-slate-400">Total : ₹{total}</span>
                </div>
                {columnItems.length ? (
                  <div className="space-y-3">
                    {columnItems.map(item => renderTreatmentCard(item, col.cardBorderClass))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 text-center py-6">{col.emptyText}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showOtherModal && (
        <OtherTreatmentModal
          teeth={[...otherSelectedTeeth].sort((a, b) => a - b)}
          procedures={otherProcedures}
          onAddProcedure={addProcedure}
          onSave={confirmAddOtherTreatment}
          onClose={() => setShowOtherModal(false)}
        />
      )}
    </div>
  );
};

export default DentalChartControl;
