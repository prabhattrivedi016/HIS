import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess } from "@/utils/alert";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { TableFieldInput } from "./TableFieldInput";
import { TableColumnSchema, TableMasterEntryConfig } from "./types";

interface SnomedItem {
  conceptId: string;
  term: string;
}

export interface AddMasterEntryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  nameLabel: string;
  nameKey: string;
  /** columns other than the searchable name column, rendered generically by dataTypeId */
  extraColumns: TableColumnSchema[];
  /** SNOMED CT semantic tag to filter search results by */
  semanticTag?: string;
  /** where + under what field names this master entry is saved independently, before it's added as a row */
  masterEntryConfig: TableMasterEntryConfig;
  onSave: (entry: Record<string, unknown>) => void;
}

/**
 * Reusable "add a new entry" drawer for any EMR table-type control — the name field
 * searches SNOMED CT (same pattern as AllergyMasterPopup / DiagnosisMaster), a fixed
 * Status field, and the rest of the table's own columns rendered generically.
 */
const AddMasterEntryDrawer = ({
  isOpen,
  onClose,
  title,
  nameLabel,
  nameKey,
  extraColumns,
  semanticTag = "finding",
  masterEntryConfig,
  onSave,
}: AddMasterEntryDrawerProps) => {
  const { loading, fetchApi } = useGlobalApi();
  const [name, setName] = useState("");
  const [snomedCode, setSnomedCode] = useState("");
  const [status, setStatus] = useState<number>(1);
  const [extraValues, setExtraValues] = useState<Record<string, unknown>>({});
  const [list, setList] = useState<Record<string, unknown>[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<unknown>(0);

  const [snomedResults, setSnomedResults] = useState<SnomedItem[]>([]);
  const [showSnomedDropdown, setShowSnomedDropdown] = useState(false);
  const [snomedLoading, setSnomedLoading] = useState(false);
  const snomedRef = useRef<HTMLDivElement>(null);
  const skipSnomedRef = useRef(false);

  const loadList = async () => {
    const resp = await fetchApi(
      "GET",
      masterEntryConfig.listEndpoint,
      {},
      {},
      { component: "AddMasterEntryDrawer", silent: true }
    );
    setList(Array.isArray(resp?.data) ? resp.data : []);
  };

  useEffect(() => {
    if (!isOpen) return;
    setName("");
    setSnomedCode("");
    setStatus(1);
    setExtraValues({});
    setSnomedResults([]);
    setShowSnomedDropdown(false);
    setIsEditing(false);
    setEditingId(0);
    loadList();
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (snomedRef.current && !snomedRef.current.contains(e.target as Node)) {
        setShowSnomedDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (skipSnomedRef.current) {
      skipSnomedRef.current = false;
      return;
    }
    const q = name.trim();
    if (!isOpen || q.length < 2) {
      setSnomedResults([]);
      setShowSnomedDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSnomedLoading(true);
      try {
        const url =
          `http://localhost:8080/csnoserv/api/search/search?term=${encodeURIComponent(q)}` +
          `&state=active&semantictag=${semanticTag}&acceptability=preferred&returnlimit=50`;
        const res = await fetch(url);
        const data: SnomedItem[] = await res.json();
        setSnomedResults(data ?? []);
        setShowSnomedDropdown((data ?? []).length > 0);
      } catch {
        setSnomedResults([]);
        setShowSnomedDropdown(false);
      } finally {
        setSnomedLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [name, isOpen, semanticTag]);

  const handleSnomedSelect = (item: SnomedItem) => {
    skipSnomedRef.current = true;
    setName(item.term);
    setSnomedCode(item.conceptId);
    setSnomedResults([]);
    setShowSnomedDropdown(false);
  };

  const handleEdit = (item: Record<string, unknown>) => {
    const { idField } = masterEntryConfig;
    const pascalIdField = idField.charAt(0).toUpperCase() + idField.slice(1);

    setIsEditing(true);
    setEditingId(item[idField] ?? item[pascalIdField] ?? 0);
    setName(String(item[masterEntryConfig.nameField] ?? ""));
    setSnomedCode(String(item.snomedCode ?? ""));
    setStatus(Number(item.isActive ?? 1));
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    const payload = {
      [masterEntryConfig.idField]: isEditing ? editingId : 0,
      [masterEntryConfig.nameField]: name.trim(),
      snomedCode: snomedCode || null,
      isActive: status,
      ...extraValues,
    };

    const resp = await fetchApi(
      "POST",
      masterEntryConfig.saveEndpoint,
      payload,
      {},
      { component: "AddMasterEntryDrawer" }
    );

    if (!resp?.result) {
      showError(resp?.message || "Failed to save master entry");
      return;
    }

    showSuccess(resp?.message ?? (isEditing ? "Updated successfully" : "Saved successfully"));

    // editing an existing master entry only updates the master list — it doesn't
    // add a row to the current patient's table, since it wasn't a new pick
    if (isEditing) {
      setIsEditing(false);
      setEditingId(0);
      setName("");
      setSnomedCode("");
      setStatus(1);
      loadList();
      return;
    }

    const responseData = resp?.data as Record<string, unknown> | number | undefined;
    const newId =
      (typeof responseData === "object"
        ? responseData?.[masterEntryConfig.idField]
        : responseData) ?? 0;

    onSave({
      [masterEntryConfig.idField]: newId,
      [nameKey]: name.trim(),
      __snomedCode: snomedCode || null,
      __status: status,
      ...extraValues,
    });
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <div className="drawer-bg-fade opacity-100 visible" onClick={onClose} />

      <div className="drawer-layout drawer-bg translate-x-0 sm:w-[420px]">
        <div className="drawer-title-border">
          <h2 className="drawer-title">{title}</h2>
          <button onClick={onClose} className="drawer-close-btn">
            ×
          </button>
        </div>

        <div className="p-3 flex flex-col gap-3">
          <div className="card">
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  {nameLabel}
                  <span className="text-red-500"> *</span>
                </label>
                <div className="relative" ref={snomedRef}>
                  <input
                    type="text"
                    className="input-field !mb-0"
                    placeholder={`Type to search SNOMED or enter ${nameLabel.toLowerCase()}…`}
                    value={name}
                    onChange={e => {
                      setName(e.target.value);
                      setSnomedCode("");
                    }}
                  />

                  {(showSnomedDropdown || snomedLoading) && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-44 overflow-y-auto">
                      {snomedLoading ? (
                        <div className="px-3 py-2 text-sm text-gray-500">Searching…</div>
                      ) : snomedResults.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-400">No options found</div>
                      ) : (
                        snomedResults.map((item, i) => (
                          <button
                            key={i}
                            type="button"
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => handleSnomedSelect(item)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-800">{item.term}</div>
                            <div className="text-xs text-gray-500">{item.conceptId}</div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  SNOMED Code (optional)
                </label>
                <input
                  type="text"
                  className="input-field !mb-0"
                  placeholder="Auto-filled or enter code directly"
                  value={snomedCode}
                  onChange={e => setSnomedCode(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Status</label>
                <select
                  className="input-field !mb-0"
                  value={status}
                  onChange={e => setStatus(Number(e.target.value))}
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>

              {extraColumns.map(col => (
                <div key={col.key}>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">
                    {col.label}
                  </label>
                  <TableFieldInput
                    column={col}
                    value={extraValues[col.key]}
                    onChange={v => setExtraValues(prev => ({ ...prev, [col.key]: v }))}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className={name.trim() && !loading ? "save-btn flex-1" : "disabled-btn flex-1"}
              disabled={!name.trim() || loading}
              onClick={handleSave}
            >
              {loading ? "Saving…" : isEditing ? "Update" : "Save"}
            </button>
            <button type="button" className="cancel-button flex-1" onClick={onClose}>
              Cancel
            </button>
          </div>

          <div className="table-scroll-wrapper">
            <div className="table-size lg:max-h-56">
              <table className="base-table">
                <thead className="table-head">
                  <tr>
                    <th className="table-th">#</th>
                    <th className="table-th">{nameLabel}</th>
                    <th className="table-th">SNOMED Code</th>
                    <th className="table-th">Status</th>
                    <th className="table-th text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {list.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="table-empty">
                        No records found
                      </td>
                    </tr>
                  ) : (
                    list.map((item, i) => (
                      <tr key={i} className="table-row">
                        <td className="table-td">{i + 1}</td>
                        <td className="table-td font-medium text-gray-800">
                          {String(item[masterEntryConfig.nameField] ?? "")}
                        </td>
                        <td className="table-td text-xs text-gray-500">
                          {String(item.snomedCode ?? "") || "—"}
                        </td>
                        <td className="table-td">
                          <span
                            className={`card-status ${Number(item.isActive) === 1 ? "active" : "inactive"}`}
                          >
                            {Number(item.isActive) === 1 ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="table-action text-center">
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-700 text-sm font-medium transition px-2 py-1 rounded hover:bg-blue-50"
                          >
                            Edit
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
    </>,
    document.body
  );
};

export default AddMasterEntryDrawer;
