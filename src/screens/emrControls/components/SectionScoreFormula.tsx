import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showSuccess, showWarning } from "@/utils/alert";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { EmrSectionItem, SectionHeaderMappingRecord, SectionScoreFieldItem } from "../types";

interface SectionScoreFormulaProps {
  section: EmrSectionItem;
  onClose: () => void;
}

interface ScoreFormulaPayload {
  sectionId: number;
  formulaItems: { headerId: number | null; referenceName: string; formulaDefinition: string }[];
}

/** not real headers — always offered so a score formula can report its result and its
 * risk-band reading, matching the legacy Braden-Scale-style "Total"/"Interpretation" rows */
const COMPUTED_FIELD_OPTIONS: { headerId: number; headerName: string }[] = [
  { headerId: 0, headerName: "Total" },
];

/** spreadsheet-style column naming for auto reference names — A, B, ... Z, AA, AB, ... */
const toReferenceName = (n: number): string => {
  let s = "";
  let num = n;
  while (num > 0) {
    const rem = (num - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    num = Math.floor((num - 1) / 26);
  }
  return s;
};

const SectionScoreFormula = ({ section, onClose }: SectionScoreFormulaProps) => {
  const { loading, fetchApi } = useGlobalApi();

  const [availableFields, setAvailableFields] = useState<SectionHeaderMappingRecord[]>([]);
  const [formulaItems, setFormulaItems] = useState<SectionScoreFieldItem[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setInitialLoading(true);

      const headerResp = await fetchApi(
        "GET",
        ENDPOINTS.GET_EMR_SECTION_HEADER_MAPPING,
        {},
        { params: { sectionId: section.sectionId } },
        { component: "SectionScoreFormula" }
      );
      const rawHeaders: any[] = headerResp?.data ?? [];
      const headers: SectionHeaderMappingRecord[] = rawHeaders
        .map(m => ({
          mappingId: m.MappingId,
          sectionId: m.SectionId,
          headerId: m.HeaderId,
          headerName: m.HeaderName,
          displayName: m.DisplayName,
          controlType: m.ControlType,
          controlTypeId: m.ControlTypeId,
          sequenceNo: m.SequenceNo,
        }))
        .sort((a, b) => a.sequenceNo - b.sequenceNo);
      setAvailableFields(headers);

      const scoreResp = await fetchApi(
        "GET",
        ENDPOINTS.GET_EMR_SECTION_SCORE_FORMULA,
        {},
        { params: { sectionId: section.sectionId } },
        { component: "SectionScoreFormula", silent: true }
      );
      const rawScoreFields: any[] = scoreResp?.data ?? [];
      setFormulaItems(
        rawScoreFields.map(f => ({
          headerId: f.HeaderId ?? f.headerId,
          headerName: f.HeaderName ?? f.headerName,
          referenceName: f.ReferenceName ?? f.referenceName,
          formulaDefinition: f.FormulaDefinition ?? f.formulaDefinition ?? "",
        }))
      );

      setInitialLoading(false);
    };

    load();
  }, [section.sectionId]);

  const addToListHandler = (field: { headerId: number; headerName: string }) => {
    setFormulaItems(prev => [
      ...prev,
      {
        headerId: field.headerId,
        headerName: field.headerName,
        referenceName: toReferenceName(prev.length + 1),
        formulaDefinition: "",
      },
    ]);
  };

  const removeHandler = (index: number) => {
    setFormulaItems(prev =>
      prev
        .filter((_, i) => i !== index)
        .map((f, i) => ({ ...f, referenceName: toReferenceName(i + 1) }))
    );
  };

  const formulaChangeHandler = (index: number, value: string) => {
    setFormulaItems(prev =>
      prev.map((f, i) => (i === index ? { ...f, formulaDefinition: value } : f))
    );
  };

  const addedHeaderIds = new Set(formulaItems.map(f => f.headerId));
  const remainingFields = availableFields.filter(h => !addedHeaderIds.has(h.headerId));
  const remainingComputedFields = COMPUTED_FIELD_OPTIONS.filter(
    c => !addedHeaderIds.has(c.headerId)
  );
  const fieldListRows: { headerId: number; headerName: string }[] = [
    ...remainingComputedFields,
    ...remainingFields,
  ];

  const isSaveDisabled = loading || formulaItems.length === 0;

  const saveHandler = async () => {
    if (formulaItems.length === 0) {
      showWarning("Add at least one field to the score formula");
      return;
    }

    const payload: ScoreFormulaPayload = {
      sectionId: section.sectionId,
      formulaItems: formulaItems.map(({ headerId, referenceName, formulaDefinition }) => ({
        headerId: headerId > 0 ? headerId : 0,
        referenceName,
        formulaDefinition,
      })),
    };

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_EMR_SECTION_SCORE_FORMULA,
      payload,
      {},
      { component: "SectionScoreFormula" }
    );

    if (!resp?.result) {
      showWarning(resp?.message ?? "Failed to save score formula");
      return;
    }

    showSuccess(resp?.message ?? "Score formula saved successfully");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-999">
      <div className="popup-bg-overlay" />
      <div className="central-popup overflow-auto max-h-[calc(100vh-20px)] !w-[98vw] !max-w-[1800px] opacity-full">
        <div className="popup-header">
          <h2 className="popup-helper-text">
            Set Score Formula — {section.displayName || section.sectionName}
          </h2>
          <button onClick={onClose} className="close-drawer-btn">
            ×
          </button>
        </div>

        {initialLoading ? (
          <p className="table-empty">Loading…</p>
        ) : (
          <>
            <p className="text-xs text-gray-500 mb-3">
              Formula Details [ Formula example: A*(B+C) ]
              <br />
              Note: If Reference(s) &gt; 26 then manually define reference name like (AA-AZ),
              (BB-BZ) and so on.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* left — available fields */}
              <div>
                <div className="table-scroll-wrapper">
                  <div className="table-size max-h-96">
                    <table className="base-table">
                      <thead className="table-head">
                        <tr>
                          <th className="table-th whitespace-nowrap">Field Name</th>
                          <th className="table-th w-36 whitespace-nowrap">Add to list</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fieldListRows.length === 0 ? (
                          <tr>
                            <td colSpan={2} className="table-empty">
                              {availableFields.length === 0
                                ? "No controls in this section"
                                : "All fields added"}
                            </td>
                          </tr>
                        ) : (
                          fieldListRows.map(field => (
                            <tr key={field.headerId} className="table-row">
                              <td className="table-td font-medium text-gray-800">
                                {field.headerName} :
                              </td>
                              <td className="table-td">
                                <button
                                  type="button"
                                  onClick={() => addToListHandler(field)}
                                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  Add to list
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* right — score formula fields */}
              <div>
                <div className="table-scroll-wrapper">
                  <div className="table-size max-h-96">
                    <table className="base-table">
                      <thead className="table-head">
                        <tr>
                          <th className="table-th whitespace-nowrap">Field Name</th>
                          <th className="table-th w-32 whitespace-nowrap">Reference Name</th>
                          <th className="table-th whitespace-nowrap">Formula Definition</th>
                          <th className="table-th w-16 text-center whitespace-nowrap">Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formulaItems.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="table-empty">
                              No fields added yet
                            </td>
                          </tr>
                        ) : (
                          formulaItems.map((field, idx) => (
                            <tr key={field.headerId} className="table-row">
                              <td className="table-td font-medium text-gray-800">
                                {field.headerName} :
                              </td>
                              <td className="table-td">
                                <input
                                  type="text"
                                  className="input-field !mb-0 !py-1 text-xs w-16"
                                  value={field.referenceName}
                                  onChange={e =>
                                    setFormulaItems(prev =>
                                      prev.map((f, i) =>
                                        i === idx ? { ...f, referenceName: e.target.value } : f
                                      )
                                    )
                                  }
                                />
                              </td>
                              <td className="table-td">
                                <input
                                  type="text"
                                  className="input-field !mb-0 !py-1 text-xs"
                                  placeholder="e.g. A+(B+C)"
                                  value={field.formulaDefinition}
                                  onChange={e => formulaChangeHandler(idx, e.target.value)}
                                />
                              </td>
                              <td className="table-td text-center">
                                <button
                                  type="button"
                                  onClick={() => removeHandler(idx)}
                                  className="text-red-500 hover:text-red-700"
                                  title="Remove"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="form-actions-responsive mt-5">
          <button
            type="button"
            className={isSaveDisabled ? "disabled-btn" : "save-btn"}
            onClick={saveHandler}
            disabled={isSaveDisabled}
          >
            {loading ? "Saving…" : "Save"}
          </button>
          <button type="button" className="cancel-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default SectionScoreFormula;
