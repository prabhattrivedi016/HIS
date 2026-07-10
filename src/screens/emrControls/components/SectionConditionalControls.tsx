import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { ConditionOperatorOptions } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showSuccess, showWarning } from "@/utils/alert";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  EmrSectionItem,
  SectionAttributeCondition,
  SectionConditionalRule,
  SectionHeaderMappingRecord,
} from "../types";
import { groupAttributeConditionRows } from "../utils/attributeConditionParsing";

interface SectionConditionalControlsProps {
  section: EmrSectionItem;
  onClose: () => void;
}

const emptyRule = (): SectionConditionalRule => ({
  headerId: null,
  operator: "==",
  value: "",
  connector: "AND",
});

/** guards against a request that never resolves (dead proxy target, unreachable host, etc.) —
 * without this, a hung network call would leave the popup stuck on "Loading…" forever */
const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Request timed out")), ms)),
  ]);

const SectionConditionalControls = ({ section, onClose }: SectionConditionalControlsProps) => {
  const { loading, fetchApi } = useGlobalApi();

  const [headers, setHeaders] = useState<SectionHeaderMappingRecord[]>([]);
  /** one entry per attribute that has its own rule chain configured; attributes with no
   * entry here render unconditionally on the EMR page */
  const [attributeConditions, setAttributeConditions] = useState<
    Record<number, SectionConditionalRule[]>
  >({});
  const [selectedHeaderId, setSelectedHeaderId] = useState<number | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setInitialLoading(true);

      try {
        const headerResp = await withTimeout(
          fetchApi(
            "GET",
            ENDPOINTS.GET_EMR_SECTION_HEADER_MAPPING,
            {},
            { params: { sectionId: section.sectionId } },
            { component: "SectionConditionalControls", silent: true }
          ),
          10000
        );
        const rawHeaders: any[] = headerResp?.data ?? [];
        const mappedHeaders: SectionHeaderMappingRecord[] = rawHeaders
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
        setHeaders(mappedHeaders);
        setSelectedHeaderId(mappedHeaders[0]?.headerId ?? null);

        const configResp = await withTimeout(
          fetchApi(
            "GET",
            ENDPOINTS.GET_EMR_SECTION_ATTRIBUTE_CONDITION,
            {},
            { params: { sectionId: section.sectionId } },
            { component: "SectionConditionalControls", silent: true }
          ),
          10000
        );
        // EMR/getEMRSectionAttributeCondition returns one flat row per condition —
        // group them by TargetHeaderId into this attribute's own rule chain
        const rawRows: any[] = Array.isArray(configResp?.data) ? configResp.data : [];
        const attributeConditionList = groupAttributeConditionRows(rawRows);

        const map: Record<number, SectionConditionalRule[]> = {};
        attributeConditionList.forEach(a => {
          map[a.targetHeaderId] = a.conditions;
        });
        setAttributeConditions(map);
      } catch (err) {
        console.error("SectionConditionalControls: failed to load section data", err);
      } finally {
        setInitialLoading(false);
      }
    };

    load();
  }, [section.sectionId]);

  const selectedHeader = headers.find(h => h.headerId === selectedHeaderId);
  const currentRules = (selectedHeaderId && attributeConditions[selectedHeaderId]) || [];

  /** every other attribute in the section — a rule can reference any of these, but not itself */
  const referenceCandidates = useMemo(
    () => headers.filter(h => h.headerId !== selectedHeaderId),
    [headers, selectedHeaderId]
  );

  const setRulesForSelected = (rules: SectionConditionalRule[]) => {
    if (!selectedHeaderId) return;
    setAttributeConditions(prev => ({ ...prev, [selectedHeaderId]: rules }));
  };

  const addRule = () => setRulesForSelected([...currentRules, emptyRule()]);

  const updateRule = (index: number, patch: Partial<SectionConditionalRule>) => {
    setRulesForSelected(
      currentRules.map((rule, i) => (i === index ? { ...rule, ...patch } : rule))
    );
  };

  const [deletingRuleId, setDeletingRuleId] = useState<number | null>(null);

  const removeRule = async (index: number) => {
    const rule = currentRules[index];

    // a row that's never been saved has no DB id yet — nothing to delete on the backend
    if (!rule.id) {
      setRulesForSelected(currentRules.filter((_, i) => i !== index));
      return;
    }

    setDeletingRuleId(rule.id);
    const resp = await fetchApi(
      "PATCH",
      ENDPOINTS.DELETE_EMR_SECTION_ATTRIBUTE_CONDITION,
      {},
      { params: { id: rule.id } },
      { component: "SectionConditionalControls" }
    );
    setDeletingRuleId(null);

    if (!resp?.result) {
      showWarning(resp?.message ?? "Failed to delete condition");
      return;
    }

    setRulesForSelected(currentRules.filter((_, i) => i !== index));
    showSuccess(resp?.message ?? "Condition deleted successfully");
  };

  const clearSelectedAttribute = () => {
    if (!selectedHeaderId) return;
    setAttributeConditions(prev => {
      const next = { ...prev };
      delete next[selectedHeaderId];
      return next;
    });
  };

  const headerNameById = (headerId: number | null) =>
    headers.find(h => h.headerId === headerId)?.headerName ?? "…";

  const resolvedLogicPreview = currentRules
    .map((rule, idx) => (idx === 0 ? `${idx + 1}` : `${rule.connector} ${idx + 1}`))
    .join(" ");

  const configuredCount = Object.keys(attributeConditions).length;

  const isSaveDisabled =
    loading ||
    Object.values(attributeConditions).some(
      rules =>
        rules.length === 0 ||
        rules.some(r => r.headerId === null || (r.operator !== "isnull" && r.value.trim() === ""))
    );

  const saveHandler = async () => {
    const attributeConditionList: SectionAttributeCondition[] = Object.entries(attributeConditions)
      .filter(([, rules]) => rules.length > 0)
      .map(([targetHeaderId, rules]) => ({
        targetHeaderId: Number(targetHeaderId),
        conditions: rules,
      }));

    if (attributeConditionList.length === 0) {
      showWarning("Configure a condition for at least one attribute");
      return;
    }

    const invalidRule = attributeConditionList.some(a =>
      a.conditions.some(
        r => r.headerId === null || (r.operator !== "isnull" && r.value.trim() === "")
      )
    );
    if (invalidRule) {
      showWarning("Fill in every condition row (field, operator, and value) before saving");
      return;
    }

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.SAVE_EMR_SECTION_ATTRIBUTE_CONDITION,
      { sectionId: section.sectionId, attributeConditions: attributeConditionList },
      {},
      { component: "SectionConditionalControls" }
    );

    if (!resp?.result) {
      showWarning(resp?.message ?? "Failed to save conditional controls");
      return;
    }

    showSuccess(resp?.message ?? "Conditional controls saved successfully");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-999">
      <div className="popup-bg-overlay" />
      <div className="central-popup overflow-auto max-h-[calc(100vh-20px)] !w-[96vw] !max-w-[1300px] opacity-full">
        <div className="popup-header">
          <h2 className="popup-helper-text">
            Conditional Visibility — {section.displayName || section.sectionName}
          </h2>
          <button onClick={onClose} className="close-drawer-btn">
            ×
          </button>
        </div>

        {initialLoading ? (
          <p className="table-empty">Loading…</p>
        ) : headers.length === 0 ? (
          <p className="table-empty">This section has no controls mapped</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* left — every attribute in the section, pick which one to configure */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Attributes ({configuredCount} configured)
              </h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden max-h-[420px] overflow-y-auto divide-y divide-gray-100">
                {headers.map(h => {
                  const isSelected = h.headerId === selectedHeaderId;
                  const isConfigured = Boolean(attributeConditions[h.headerId]?.length);
                  return (
                    <button
                      key={h.headerId}
                      type="button"
                      onClick={() => setSelectedHeaderId(h.headerId)}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left transition-colors ${
                        isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className={`text-sm truncate ${isSelected ? "font-semibold text-blue-700" : "text-gray-700"}`}
                      >
                        {h.headerName}
                      </span>
                      {isConfigured && (
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full shrink-0">
                          Set
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* right — condition builder scoped to the selected attribute */}
            <div className="lg:col-span-2">
              {!selectedHeader ? (
                <p className="text-sm text-gray-400 py-10 text-center">
                  Pick an attribute on the left to configure its condition
                </p>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-gray-800">
                      Show <span className="text-blue-600">{selectedHeader.headerName}</span> only
                      when…
                    </h3>
                    {currentRules.length > 0 && (
                      <button
                        type="button"
                        onClick={clearSelectedAttribute}
                        className="text-xs font-medium text-red-500 hover:text-red-700"
                      >
                        Clear this attribute's condition
                      </button>
                    )}
                  </div>

                  <div className="table-scroll-wrapper mb-2">
                    <div className="table-size max-h-72">
                      <table className="base-table">
                        <thead className="table-head">
                          <tr>
                            <th className="table-th w-10">#</th>
                            <th className="table-th w-20">Logic</th>
                            <th className="table-th">Field</th>
                            <th className="table-th w-40">Operator</th>
                            <th className="table-th">Value</th>
                            <th className="table-th w-12 text-center">Del</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentRules.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="table-empty">
                                No condition yet — this attribute always renders
                              </td>
                            </tr>
                          ) : (
                            currentRules.map((rule, idx) => (
                              <tr key={idx} className="table-row">
                                <td className="table-td text-gray-400">{idx + 1}</td>
                                <td className="table-td">
                                  {idx === 0 ? (
                                    <span className="text-xs text-gray-300">—</span>
                                  ) : (
                                    <select
                                      className="input-field !mb-0 !py-1 text-xs"
                                      value={rule.connector}
                                      onChange={e =>
                                        updateRule(idx, {
                                          connector: e.target.value as "AND" | "OR",
                                        })
                                      }
                                    >
                                      <option value="AND">AND</option>
                                      <option value="OR">OR</option>
                                    </select>
                                  )}
                                </td>
                                <td className="table-td">
                                  <select
                                    className="input-field !mb-0 !py-1 text-xs"
                                    value={rule.headerId ?? ""}
                                    onChange={e =>
                                      updateRule(idx, {
                                        headerId: e.target.value ? Number(e.target.value) : null,
                                      })
                                    }
                                  >
                                    <option value="">— Select a control —</option>
                                    {referenceCandidates.map(h => (
                                      <option key={h.headerId} value={h.headerId}>
                                        {h.headerName}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="table-td">
                                  <select
                                    className="input-field !mb-0 !py-1 text-xs"
                                    value={rule.operator}
                                    onChange={e =>
                                      updateRule(idx, {
                                        operator: e.target
                                          .value as SectionConditionalRule["operator"],
                                      })
                                    }
                                  >
                                    {ConditionOperatorOptions.map(op => (
                                      <option key={op.value} value={op.value}>
                                        {op.label}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="table-td">
                                  {rule.operator === "isnull" ? (
                                    <select
                                      className="input-field !mb-0 !py-1 text-xs"
                                      value={rule.value || "True"}
                                      onChange={e => updateRule(idx, { value: e.target.value })}
                                    >
                                      <option value="True">True</option>
                                      <option value="False">False</option>
                                    </select>
                                  ) : (
                                    <input
                                      type="text"
                                      className="input-field !mb-0 !py-1 text-xs"
                                      placeholder={
                                        rule.operator === "in" || rule.operator === "notin"
                                          ? "e.g. Yes, Maybe"
                                          : "e.g. 3"
                                      }
                                      value={rule.value}
                                      onChange={e => updateRule(idx, { value: e.target.value })}
                                    />
                                  )}
                                </td>
                                <td className="table-td text-center">
                                  <button
                                    type="button"
                                    onClick={() => removeRule(idx)}
                                    disabled={deletingRuleId === rule.id}
                                    className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-40"
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

                  <button
                    type="button"
                    onClick={addRule}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 mb-4"
                  >
                    <Plus size={13} /> Add condition
                  </button>

                  {currentRules.length > 0 && (
                    <div className="border border-gray-200 rounded-lg bg-gray-50 px-3 py-2">
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
                        Resolved logic preview
                      </p>
                      <p className="text-xs font-mono text-gray-700">{resolvedLogicPreview}</p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {currentRules
                          .map((r, idx) => `${idx + 1}. ${headerNameById(r.headerId)}`)
                          .join("  ·  ")}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
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

export default SectionConditionalControls;
