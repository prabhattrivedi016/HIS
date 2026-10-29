import { MessageSquare, Settings } from "lucide-react";
import { ChangeEvent, useCallback, useState } from "react";
import { SubInvetigationItem } from "../types";
import ObservationCommentPopup from "./ObservationCommentPopup";

interface Props {
  isExpanded: boolean;
  onToggleExpand: () => void;
  subInvestigationlists: SubInvetigationItem[];
  setSubInvestigationLists?: React.Dispatch<React.SetStateAction<SubInvetigationItem[]>>;
}

export default function LabInfoTableData({
  isExpanded,
  onToggleExpand,
  subInvestigationlists,
  setSubInvestigationLists,
}: Props) {
  const [selectedSubInvestigation, setSelectedSubInvestigation] =
    useState<SubInvetigationItem | null>(null);
  const [openObservationComment, setOpenObservationComment] = useState(false);
  const [renderObservationComment, setRenderObservationComment] = useState(false);

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
        prevList.map(item =>
          matchRow(item, row)
            ? {
                ...item,
                ...patch,
              }
            : item
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

  // row wise method change handler
  const rowWiseMethodChangeHandler = useCallback(
    (valueOrEvent: string | ChangeEvent<HTMLInputElement>, row: SubInvetigationItem) => {
      const methodValue =
        typeof valueOrEvent === "string" ? valueOrEvent : (valueOrEvent?.target?.value ?? "");

      updateSubInvestigationField(row, { MethodName: methodValue });
    },
    [updateSubInvestigationField]
  );

  return (
    <div className="card space-y-2">
      {/* ================= INVESTIGATION HEADER TOOLBAR ================= */}
      <div className="flex flex-nowrap items-center justify-between bg-blue-50/60 border border-blue-100 px-3 py-2 rounded-xl overflow-x-auto gap-4 whitespace-nowrap no-scrollbar">
        <div className="flex items-center shrink-0">
          <span className="text-xs font-extrabold text-blue-900">
            Investigation : {subInvestigationlists[0]?.InvestigationName}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
            <span>Method :</span>
            <span className="font-bold text-gray-900 bg-white border border-gray-200 px-2 py-0.5 rounded shadow-2xs">
              Automated Analyzer
            </span>
          </div>
          <button className="bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-2xs transition-all cursor-pointer shrink-0">
            Auto Fill
          </button>
          <button
            onClick={onToggleExpand}
            className={`p-1 border rounded-lg shadow-2xs transition-all cursor-pointer shrink-0 ${
              isExpanded
                ? "bg-blue-900 text-white border-blue-950"
                : "bg-white border-gray-200 hover:bg-gray-50 text-gray-600"
            }`}
            title="Toggle Right Panel"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

      {/* ================= FULL-WIDTH CENTER BIG TABLE ================= */}
      <div className="w-full bg-white border border-gray-200 rounded-xl p-2 overflow-x-auto shadow-2xs">
        <div className="w-full bg-white border border-gray-200 rounded-xl p-2 overflow-x-auto shadow-2xs">
          <table className="w-full min-w-[900px] text-left text-[11px] border-collapse">
            <thead>
              <tr className="bg-blue-50/80 text-gray-600 font-bold text-[10px] uppercase">
                <th className="border border-gray-200 text-center py-2 px-1 text-center w-[5%]">
                  #
                </th>
                <th className="border border-gray-200  py-2 px-2 w-[19%]">Parameter</th>
                <th className="border border-gray-200 text-center py-2 px-2 w-[11%]">Result</th>
                <th className="border border-gray-200 text-center py-2 px-2 w-[9%]">Unit</th>
                <th className="border border-gray-200 text-center py-2 px-2 w-[17%] text-center">
                  Range
                </th>
                <th className="border border-gray-200 text-center py-2 px-2 w-[12%]">
                  Previous Result
                </th>
                <th className="border border-gray-200 text-center py-2 px-2 w-[15%]">Method</th>
                <th className="border border-gray-200 text-center py-2 px-1 text-center w-[6%]">
                  Comment
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 font-semibold text-gray-800">
              {subInvestigationlists?.map((row, idx) => (
                <tr key={row.ObservationId ?? idx} className="hover:bg-slate-50 transition-colors">
                  <td className="border border-gray-200 py-1.5 px-1 text-center text-gray-500">
                    {idx + 1}
                  </td>

                  <td className="border border-gray-200 py-1.5 px-2 font-bold text-gray-900">
                    {row.ObservationName}
                  </td>

                  <td className="border border-gray-200 py-1.5 px-2">
                    <input
                      type="text"
                      value={row.ResultValue ?? ""}
                      onChange={e => rowWiseResultChangeHandler(e, row)}
                      className="w-full min-w-16 bg-blue-50/50 border border-blue-200 rounded px-1.5 py-1 text-xs font-bold text-blue-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                    />
                  </td>

                  <td className="border border-gray-200  text-center py-1.5 px-2 text-gray-600">
                    <input
                      type="text"
                      value={row?.Unit ?? ""}
                      onChange={e => rowWiseUnitChangeHandler(e, row)}
                      className="w-full min-w-16 bg-blue-50/50 border border-blue-200 rounded px-1.5 py-1 text-xs font-bold text-blue-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                    />
                  </td>

                  <td className="border border-gray-200 py-1.5 px-2 text-center text-gray-600">
                    <input
                      type="text"
                      value={row?.DisplayRange ?? ""}
                      onChange={e => rowWiseRangeChangeHandler(e, row)}
                      className="w-full min-w-16 bg-blue-50/50 border border-blue-200 rounded px-1.5 py-1 text-xs font-bold text-blue-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                    />
                  </td>

                  <td className="border border-gray-200 text-center py-1.5 px-2 text-gray-600">
                    {row.prev || "-"}
                  </td>

                  <td className="border border-gray-200 py-1.5 px-2">
                    <input
                      type="text"
                      value={row?.MethodName ?? ""}
                      onChange={e => rowWiseMethodChangeHandler(e, row)}
                      className="w-full min-w-16 bg-blue-50/50 border border-blue-200 rounded px-1.5 py-1 text-xs font-bold text-blue-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                    />
                  </td>

                  <td className="border border-gray-200 py-1.5 px-1 text-center">
                    <button
                      type="button"
                      onClick={() => addCommentHandler(row)}
                      className={`p-1 rounded transition-colors cursor-pointer inline-flex items-center justify-center ${
                        row?.SampleRemark
                          ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                          : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                      }`}
                      title={
                        row?.SampleRemark
                          ? `Edit comment for ${row.ObservationName}`
                          : `Add comment for ${row.ObservationName}`
                      }
                    >
                      <MessageSquare size={14} />
                    </button>
                  </td>
                </tr>
              ))}

              {(!subInvestigationlists || subInvestigationlists.length === 0) && (
                <tr>
                  <td
                    colSpan={8}
                    className="border border-gray-200 py-8 text-center text-gray-400 font-medium"
                  >
                    No investigation selected!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
    </div>
  );
}
