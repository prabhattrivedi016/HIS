import useGlobalApi from "@/hooks/useGlobalApi";
import { Activity, FileClock, MessageSquare } from "lucide-react";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import { useCallback, useState } from "react";
import { SubInvetigationItem } from "../types";
import ObservationCommentPopup from "./ObservationCommentPopup";
import ObservationInsightsPopup from "./ObservationInsightsPopup";
import ResultHistoryPopup from "./ResultHistoryPopup";

interface Props {
  isExpanded: boolean;
  onToggleExpand: () => void;
  subInvestigationlists: SubInvetigationItem[];
  setSubInvestigationLists?: Dispatch<SetStateAction<SubInvetigationItem[]>>;
}

export default function LabInfoTableData({
  isExpanded,
  onToggleExpand,
  subInvestigationlists,
  setSubInvestigationLists,
}: Props) {
  const { loading, fetchApi } = useGlobalApi();
  const [selectedSubInvestigation, setSelectedSubInvestigation] =
    useState<SubInvetigationItem | null>(null);
  const [openObservationComment, setOpenObservationComment] = useState(false);
  const [renderObservationComment, setRenderObservationComment] = useState(false);

  const [openPreviousResultsHistory, setOpenPreviousResultsHistory] = useState(false);
  const [renderPreviousResultsHistory, setRenderPreviousResultsHistory] = useState(false);
  const [selectedSubInvestigationForResultHistory, setSelectedSubInvestigationForResultHistory] =
    useState<SubInvetigationItem | null>(null);

  const [showObservationInsights, setShowObservationInsights] = useState<boolean>(false);
  const [renderObservationInsights, setRenderObservationInsights] = useState<boolean>(false);

  console.log("subInvestigationlistssubInvestigationlists", subInvestigationlists);

  // add comment handler
  const addCommentHandler = (row: SubInvetigationItem) => {
    if (!row) {
      setSelectedSubInvestigation(null);
      setOpenObservationComment(false);
      setRenderObservationComment(false);
      return;
    }
    setSelectedSubInvestigation(row);
    setOpenObservationComment(true);
    setRenderObservationComment(true);
  };
  const closeObservationComment = useCallback(() => {
    setOpenObservationComment(false);
    setRenderObservationComment(false);
    setSelectedSubInvestigation(null);
  }, []);

  const isFormulaRow = (row: SubInvetigationItem) =>
    Boolean(String(row?.Formula ?? "").trim() || String(row?.FormulaRight ?? "").trim());

  const recalculateFormulaResults = (rows: SubInvetigationItem[]) => {
    const updatedRows = rows.map(row => ({ ...row }));
    const maxPasses = Math.min(updatedRows.length, 5);

    for (let pass = 0; pass < maxPasses; pass++) {
      let changed = false;
      const values = new Map(
        updatedRows.map(row => [Number(row.ObservationId), String(row.ResultValue ?? "")])
      );

      updatedRows.forEach(row => {
        const formula = String(row.Formula ?? "")
          .replace(/^\{\s*"/, "")
          .replace(/"\s*\}$/, "")
          .trim();
        const formulaRight = String(row.FormulaRight ?? "")
          .replace(/^\{\s*"/, "")
          .replace(/"\s*\}$/, "")
          .trim();
        const expression = /^\d+\s*=/.test(formula)
          ? formula
          : /^\d+\s*=/.test(formulaRight)
            ? formulaRight
            : `${Number(row.ObservationId)}=${formulaRight || formula}`;
        const match = expression.match(/^(\d+)\s*=\s*(.+)$/);
        if (!match) return;

        const targetId = Number(match[1]);
        const target = updatedRows.find(item => Number(item.ObservationId) === targetId);
        if (!target) return;

        const substituted = match[2].replace(/obs\((\d+)\)/gi, (_token, id: string) => {
          const value = Number(String(values.get(Number(id)) ?? "").replace(/,/g, ""));
          return String(Number.isFinite(value) ? value : 0);
        });
        if (/[^0-9+\-*/%.()]/.test(substituted)) return;

        try {
          const result = Function(`"use strict"; return (${substituted});`)();
          if (!Number.isFinite(result)) return;
          const resultValue = Number(result).toFixed(2);
          if (target.ResultValue !== resultValue) {
            target.ResultValue = resultValue;
            values.set(targetId, resultValue);
            changed = true;
          }
        } catch {
          return;
        }
      });

      if (!changed) break;
    }

    return updatedRows;
  };

  // helper to match rows by ObservationId or PatientInvestigationId
  const matchRow = (item: SubInvetigationItem, targetRow: SubInvetigationItem) => {
    if (targetRow.ObservationId && item.ObservationId) {
      return Number(item.ObservationId) === Number(targetRow.ObservationId);
    }
    if (targetRow.PatientInvestigationId && item.PatientInvestigationId) {
      return Number(item.PatientInvestigationId) === Number(targetRow.PatientInvestigationId);
    }
    return false;
  };

  // helper to update any field row-wise in subInvestigationlists
  const updateSubInvestigationField = useCallback(
    (row: SubInvetigationItem, patch: Partial<SubInvetigationItem>) => {
      setSubInvestigationLists?.(prevList =>
        recalculateFormulaResults(
          prevList.map(item =>
            matchRow(item, row)
              ? {
                  ...item,
                  ...patch,
                }
              : item
          )
        )
      );
    },
    [setSubInvestigationLists]
  );

  // row wise comment change handler
  const rowWiseCommentChangeHandler = useCallback(
    (valueOrEvent: string | ChangeEvent<HTMLInputElement>, row: SubInvetigationItem) => {
      const commentValue =
        typeof valueOrEvent === "string" ? valueOrEvent : (valueOrEvent?.target?.value ?? "");

      updateSubInvestigationField(row, { SampleRemark: commentValue });

      setSelectedSubInvestigation(prev =>
        prev && matchRow(prev, row) ? { ...prev, SampleRemark: commentValue } : prev
      );
    },
    [updateSubInvestigationField]
  );

  // row wise result change handler
  const rowWiseResultChangeHandler = useCallback(
    (valueOrEvent: string | ChangeEvent<HTMLInputElement>, row: SubInvetigationItem) => {
      const resultValue =
        typeof valueOrEvent === "string" ? valueOrEvent : (valueOrEvent?.target?.value ?? "");

      updateSubInvestigationField(row, { ResultValue: resultValue });
    },
    [updateSubInvestigationField]
  );

  // row wise range change handler
  const rowWiseRangeChangeHandler = useCallback(
    (valueOrEvent: string | ChangeEvent<HTMLInputElement>, row: SubInvetigationItem) => {
      const rangeValue =
        typeof valueOrEvent === "string" ? valueOrEvent : (valueOrEvent?.target?.value ?? "");

      updateSubInvestigationField(row, { DisplayRange: rangeValue });
    },
    [updateSubInvestigationField]
  );

  // row wise unit change handler
  const rowWiseUnitChangeHandler = useCallback(
    (valueOrEvent: string | ChangeEvent<HTMLInputElement>, row: SubInvetigationItem) => {
      const unitValue =
        typeof valueOrEvent === "string" ? valueOrEvent : (valueOrEvent?.target?.value ?? "");

      updateSubInvestigationField(row, { Unit: unitValue });
    },
    [updateSubInvestigationField]
  );

  const rowWiseMinValueChangeHandler = useCallback(
    (e: ChangeEvent<HTMLInputElement>, row: SubInvetigationItem) => {
      updateSubInvestigationField(row, { MinValue: e.target.value });
    },
    [updateSubInvestigationField]
  );

  const rowWiseMaxValueChangeHandler = useCallback(
    (e: ChangeEvent<HTMLInputElement>, row: SubInvetigationItem) => {
      updateSubInvestigationField(row, { MaxValue: e.target.value });
    },
    [updateSubInvestigationField]
  );

  const rowWiseMachineResultChangeHandler = useCallback(
    (e: ChangeEvent<HTMLInputElement>, row: SubInvetigationItem) => {
      updateSubInvestigationField(row, { MachineResult: e.target.value });
    },
    [updateSubInvestigationField]
  );

  const rowWiseMachineUnitChangeHandler = useCallback(
    (e: ChangeEvent<HTMLInputElement>, row: SubInvetigationItem) => {
      updateSubInvestigationField(row, { MachineUnit: e.target.value });
    },
    [updateSubInvestigationField]
  );

  const rowWiseResultBoldChangeHandler = useCallback(
    (e: ChangeEvent<HTMLInputElement>, row: SubInvetigationItem) => {
      updateSubInvestigationField(row, { IsResultBold: e.target.checked });
    },
    [updateSubInvestigationField]
  );

  const getResultFlag = (row: SubInvetigationItem): "H" | "L" | "N" | "" => {
    const result = Number.parseFloat(String(row?.ResultValue ?? ""));
    if (!Number.isFinite(result)) return "";

    const min = Number.parseFloat(String(row?.MinValue ?? ""));
    const max = Number.parseFloat(String(row?.MaxValue ?? ""));
    if (Number.isFinite(max) && result > max) return "H";
    if (Number.isFinite(min) && result < min) return "L";
    return Number.isFinite(min) || Number.isFinite(max) ? "N" : "";
  };

  const flagClassName = (flag: "H" | "L" | "N" | "") =>
    flag === "H"
      ? "font-bold text-red-600"
      : flag === "L"
        ? "font-bold text-blue-600"
        : flag === "N"
          ? "font-bold text-green-600"
          : "text-gray-500";

  const getResultValueDropdown = (value?: string) =>
    String(value ?? "")
      .split("#")
      .map(option => option.trim())
      .filter(Boolean);

  const onLovResultClick = (row: SubInvetigationItem, value: string) => {
    updateSubInvestigationField(row, { ResultValue: value });
  };

  // result history click handler
  const resultHistoryClickHandler = (row: SubInvetigationItem) => {
    if (!row) {
      setSelectedSubInvestigationForResultHistory(null);
      setOpenPreviousResultsHistory(false);
      setRenderPreviousResultsHistory(false);
      return;
    }
    setSelectedSubInvestigationForResultHistory(row);
    setOpenPreviousResultsHistory(true);
    setRenderPreviousResultsHistory(true);
  };

  // close result history popup
  const closeResultHistory = useCallback(() => {
    setOpenPreviousResultsHistory(false);
    setRenderPreviousResultsHistory(false);
    setSelectedSubInvestigationForResultHistory(null);
  }, []);

  // observation insight view handler
  const observationInsightsViewHandler = () => {
    setShowObservationInsights(true);
    setRenderObservationInsights(true);
  };

  const closeObservationInsights = useCallback(() => {
    setShowObservationInsights(false);
    setRenderObservationInsights(false);
  }, []);

  return (
    <div className="card space-y-2 min-h-[390px]">
      {/* ================= INVESTIGATION HEADER TOOLBAR ================= */}
      <div className="flex flex-nowrap items-center justify-between bg-blue-50/60 border border-blue-100 px-3 py-2 rounded-xl overflow-x-auto gap-4 whitespace-nowrap no-scrollbar">
        <div className="flex items-center shrink-0">
          <span className="text-xs font-extrabold text-blue-900">
            Investigation : {subInvestigationlists[0]?.InvestigationName}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={observationInsightsViewHandler}
            title="View observation insights"
            className="flex items-center justify-center w-7 h-7 rounded-full bg-linear-to-br from-rose-500 via-pink-500 to-fuchsia-500 text-white shrink-0 shadow-md active:scale-95 transition-all"
          >
            <Activity size={14} />
          </button>
        </div>
      </div>

      {/* ================= FULL-WIDTH CENTER BIG TABLE ================= */}
      <div className="w-full bg-white border border-gray-200 rounded-xl p-2 overflow-x-auto shadow-2xs overflow-y-auto">
        <table className="w-full text-left text-[11px] lg:min-h-68 ">
          <thead>
            <tr className="bg-blue-50/80 text-gray-600 font-bold text-[10px] uppercase">
              <th className="border border-gray-200 text-center py-2 px-1 whitespace-nowrap">#</th>
              <th className="border border-gray-200  py-2 px-2 whitespace-nowrap">Parameter</th>
              <th className="border border-gray-200 text-center py-2 px-1 whitespace-nowrap w-[3%]">
                B
              </th>
              <th className="border border-gray-200 text-center py-2 px-2 whitespace-nowrap w-[11%]">
                Result
              </th>
              <th className="border border-gray-200 text-center py-2 px-2 whitespace-nowrap">
                Flag
              </th>
              <th className="border border-gray-200 text-center py-2 px-1 whitespace-nowrap">
                Comment
              </th>
              <th className="border border-gray-200 text-center py-2 px-2 whitespace-nowrap">
                Min. Value
              </th>
              <th className="border border-gray-200 text-center py-2 px-2 whitespace-nowrap">
                Max. Value
              </th>
              <th className="border border-gray-200 text-center py-2 px-2 whitespace-nowrap">
                Display Range
              </th>
              <th className="border border-gray-200 text-center py-2 px-2 whitespace-nowrap">
                Unit
              </th>
              <th className="border border-gray-200 text-center py-2 px-2 whitespace-nowrap w-[12%]">
                Previous Result
              </th>
              <th className="border border-gray-200 text-center py-2 px-2 whitespace-nowrap w-[15%]">
                Method
              </th>
              <th className="border border-gray-200 text-center py-2 px-2 whitespace-nowrap">
                Machine Result
              </th>
              <th className="border border-gray-200 text-center py-2 px-2 whitespace-nowrap">
                Machine Name
              </th>
              <th className="border border-gray-200 text-center py-2 px-2 whitespace-nowrap">
                Machine Unit
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 font-semibold text-gray-800">
            {subInvestigationlists.map((item, idx) => {
              const fieldTypeId = Number(item?.FieldTypeId) || 1;
              const isHeader = Number(item?.IsHeader) === 1;
              const mandatoryClass =
                Number(item?.IsMandatory) === 1 ? "border-red-500! focus:border-red-500!" : "";
              const inputClass =
                "w-full min-w-16 bg-blue-50/50 border border-blue-200 rounded px-1.5 py-1 text-xs font-bold text-blue-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200";
              const resultInputClass = `${inputClass} ${mandatoryClass}`;

              return (
                <tr
                  key={item?.ObservationId ?? idx}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="border border-gray-200 py-1.5 px-1 text-center text-gray-500">
                    {idx + 1}
                  </td>
                  <td className="border border-gray-200 py-1.5 px-2 font-bold text-gray-900">
                    {item?.IsBold && item.IsUnderLine ? (
                      <span className="font-bold underline">{item?.ObservationName}</span>
                    ) : item?.IsBold ? (
                      <span className="font-bold ">{item?.ObservationName}</span>
                    ) : item?.IsUnderLine ? (
                      <span className="underline">{item?.ObservationName}</span>
                    ) : isHeader ? (
                      <span className="font-bold">{item?.ObservationName} </span>
                    ) : (
                      item?.ObservationName || "-"
                    )}
                  </td>

                  <td className="border border-gray-200 py-1.5 px-1 text-center">
                    <input
                      type="checkbox"
                      className="input-checkbox"
                      onChange={e => rowWiseResultBoldChangeHandler(e, item)}
                      checked={Number(item?.IsResultBold) === 1}
                    />
                  </td>

                  {fieldTypeId === 1 && (
                    <>
                      <td className="border border-gray-200 py-1.5 px-2">
                        <div className="relative group flex items-start gap-1">
                          <input
                            type="text"
                            className={resultInputClass}
                            value={item?.ResultValue ?? ""}
                            readOnly={isFormulaRow(item)}
                            onChange={e => rowWiseResultChangeHandler(e, item)}
                          />
                          {!isFormulaRow(item) &&
                            getResultValueDropdown(item?.ObservationLOVs).length > 0 && (
                              <>
                                <span className="mt-2" title="Show options">
                                  <i className="fa-solid fa-chevron-down text-xs"></i>
                                </span>
                                <div className="result-entry-chervondown-popup !top-full">
                                  {getResultValueDropdown(item?.ObservationLOVs).map(
                                    (lov, index) => (
                                      <button
                                        key={`${item?.ObservationId}-${index}`}
                                        type="button"
                                        className="chervon-down-button"
                                        onClick={() => onLovResultClick(item, lov)}
                                      >
                                        {lov}
                                      </button>
                                    )
                                  )}
                                </div>
                              </>
                            )}
                        </div>
                      </td>
                      <td
                        className={`border border-gray-200 py-1.5 px-2 text-center ${flagClassName(getResultFlag(item))}`}
                      >
                        {getResultFlag(item) || "-"}
                      </td>
                      <td className="border border-gray-200 py-1.5 px-1 text-center">
                        <button
                          type="button"
                          onClick={() => addCommentHandler(item)}
                          className={`p-1 rounded transition-colors cursor-pointer inline-flex items-center justify-center ${
                            item?.SampleRemark
                              ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                              : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                          }`}
                          title={
                            item?.SampleRemark
                              ? `Edit comment for ${item.ObservationName}`
                              : `Add comment for ${item.ObservationName}`
                          }
                        >
                          <MessageSquare size={14} />
                        </button>
                      </td>
                      <td className="border border-gray-200 py-1.5 px-2">
                        <input
                          type="text"
                          className={inputClass}
                          value={item?.MinValue ?? ""}
                          onChange={e => rowWiseMinValueChangeHandler(e, item)}
                        />
                      </td>
                      <td className="border border-gray-200 py-1.5 px-2">
                        <input
                          type="text"
                          className={inputClass}
                          value={item?.MaxValue ?? ""}
                          onChange={e => rowWiseMaxValueChangeHandler(e, item)}
                        />
                      </td>
                      <td className="border border-gray-200 py-1.5 px-2">
                        <input
                          type="text"
                          className={inputClass}
                          value={item?.DisplayRange ?? ""}
                          onChange={e => rowWiseRangeChangeHandler(e, item)}
                        />
                      </td>
                      <td className="border border-gray-200 py-1.5 px-2">
                        <input
                          type="text"
                          className={inputClass}
                          value={item?.Unit ?? ""}
                          onChange={e => rowWiseUnitChangeHandler(e, item)}
                        />
                      </td>
                      <td className="border border-gray-200 py-1.5 px-2">
                        <div
                          className="flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                          onClick={() => resultHistoryClickHandler(item)}
                        >
                          <FileClock size={18} className="text-blue-500" />
                        </div>
                      </td>
                      <td className="border border-gray-200 py-1.5 px-2">
                        {/* <input
                            type="text"
                            className={inputClass}
                            value={item?.MethodName ?? ""}
                            onChange={e => rowWiseMethodChangeHandler(e, item)}
                          /> */}
                        {item?.MethodName ?? ""}
                      </td>
                      <td className="border border-gray-200 py-1.5 px-2">
                        <input
                          type="text"
                          className={inputClass}
                          value={item?.MachineResult ?? ""}
                          onChange={e => rowWiseMachineResultChangeHandler(e, item)}
                        />
                      </td>
                      <td className="border border-gray-200 py-1.5 px-2 text-center">-</td>
                      <td className="border border-gray-200 py-1.5 px-2">
                        <input
                          type="text"
                          className={inputClass}
                          value={item?.MachineUnit ?? ""}
                          onChange={e => rowWiseMachineUnitChangeHandler(e, item)}
                        />
                      </td>
                    </>
                  )}

                  {fieldTypeId === 2 && (
                    <td className="border border-gray-200 py-1.5 px-2" colSpan={12}>
                      <input
                        type="text"
                        className={resultInputClass}
                        value={item?.ResultValue ?? ""}
                        readOnly={isFormulaRow(item)}
                        onChange={e => rowWiseResultChangeHandler(e, item)}
                      />
                    </td>
                  )}

                  {fieldTypeId === 3 && (
                    <td className="border border-gray-200 py-1.5 px-2" colSpan={12}>
                      <textarea
                        rows={2}
                        className={resultInputClass}
                        value={item?.ResultValue ?? ""}
                        readOnly={isFormulaRow(item)}
                        onChange={e => rowWiseResultChangeHandler(e.target.value, item)}
                      />
                    </td>
                  )}
                </tr>
              );
            })}

            {(!subInvestigationlists || subInvestigationlists.length === 0) && (
              <tr>
                <td
                  colSpan={15}
                  className="border border-gray-200 py-8 text-center text-gray-400 font-medium"
                >
                  No investigation selected!
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* </div> */}
      </div>

      {/* observation comment */}
      {renderObservationComment && (
        <ObservationCommentPopup
          isOpen={openObservationComment}
          onClose={closeObservationComment}
          data={selectedSubInvestigation}
          rowWiseCommentChangeHandler={rowWiseCommentChangeHandler}
        />
      )}

      {/* previous result history */}
      {renderPreviousResultsHistory && (
        <ResultHistoryPopup
          isOpen={openPreviousResultsHistory}
          onClose={closeResultHistory}
          selectedSubInvestigationForResultHistory={selectedSubInvestigationForResultHistory}
        />
      )}

      {/* observation insights */}
      {renderObservationInsights && (
        <ObservationInsightsPopup
          isOpen={showObservationInsights}
          onClose={closeObservationInsights}
          subInvestigationlists={subInvestigationlists}
        />
      )}
    </div>
  );
}
