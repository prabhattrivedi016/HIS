import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import InputField from "@/components/customInputField";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showSuccess } from "@/utils/alert";
import { Activity, Pencil, Search, Trash2, X } from "lucide-react";

interface SnomedItem {
  conceptId: string;
  term: string;
}

interface ProcedureMasterItem {
  ProcedureId: number;
  ProcedureName: string;
  SnomedCode: string;
  Status: string;
}

const STATUS_OPTIONS = ["Preparation", "In Progress", "Not Done", "On Hold", "Stopped", "Completed", "Entered in Error"];

const STATUS_STYLES: Record<string, string> = {
  Preparation: "bg-amber-50 text-amber-600 border border-amber-200",
  "In Progress": "bg-blue-50 text-blue-600 border border-blue-200",
  "Not Done": "bg-gray-100 text-gray-500 border border-gray-200",
  "On Hold": "bg-orange-50 text-orange-600 border border-orange-200",
  Stopped: "bg-red-50 text-red-600 border border-red-200",
  Completed: "bg-green-50 text-green-600 border border-green-200",
  "Entered in Error": "bg-gray-100 text-gray-400 border border-gray-200 line-through",
};

const ProcedureMaster = () => {
  const { loading, fetchApi } = useGlobalApi();

  const [procedureName, setProcedureName] = useState("");
  const [snomedCode, setSnomedCode] = useState("");
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [editId, setEditId] = useState<number>(0);

  const [snomedResults, setSnomedResults] = useState<SnomedItem[]>([]);
  const [showSnomedDropdown, setShowSnomedDropdown] = useState(false);
  const [snomedLoading, setSnomedLoading] = useState(false);
  const snomedRef = useRef<HTMLDivElement>(null);
  const skipSnomedRef = useRef(false);

  const [records, setRecords] = useState<ProcedureMasterItem[]>([]);
  const [listLoaded, setListLoaded] = useState(false);
  const [searchText, setSearchText] = useState("");

  const loadRecords = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PROCEDURE_MASTER_LIST,
      {},
      {},
      { component: "ProcedureMaster" }
    );
    setRecords(resp?.data ?? []);
    setListLoaded(true);
  };

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (snomedRef.current && !snomedRef.current.contains(e.target as Node))
        setShowSnomedDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (skipSnomedRef.current) {
      skipSnomedRef.current = false;
      return;
    }
    const q = procedureName.trim();
    if (!q || q.length < 2) {
      setSnomedResults([]);
      setShowSnomedDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSnomedLoading(true);
      try {
        const url =
          `http://localhost:8080/csnoserv/api/search/search?term=${encodeURIComponent(q)}` +
          `&state=active&semantictag=procedure&acceptability=preferred&returnlimit=100`;
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
  }, [procedureName]);

  const handleSnomedSelect = (item: SnomedItem) => {
    skipSnomedRef.current = true;
    setProcedureName(item.term);
    setSnomedCode(item.conceptId);
    setSnomedResults([]);
    setShowSnomedDropdown(false);
  };

  const resetForm = () => {
    setProcedureName("");
    setSnomedCode("");
    setStatus(STATUS_OPTIONS[0]);
    setEditId(0);
    setSnomedResults([]);
    setShowSnomedDropdown(false);
  };

  const handleSave = async () => {
    if (!procedureName.trim() || !status) return;

    const payload = {
      procedureId: editId,
      procedureName: procedureName.trim(),
      snomedCode: snomedCode.trim() || null,
      status,
    };

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_PROCEDURE_MASTER,
      payload,
      {},
      { component: "ProcedureMaster" }
    );

    if (resp?.result) {
      showSuccess(editId > 0 ? "Updated successfully" : "Saved successfully");
      resetForm();
      loadRecords();
    }
  };

  const handleEdit = (rec: ProcedureMasterItem) => {
    skipSnomedRef.current = true;
    setEditId(rec.ProcedureId);
    setProcedureName(rec.ProcedureName);
    setSnomedCode(rec.SnomedCode ?? "");
    setStatus(rec.Status);
  };

  const handleDelete = async (id: number) => {
    const resp = await fetchApi(
      "PATCH",
      ENDPOINTS.DELETE_PROCEDURE_MASTER,
      {},
      { params: { procedureId: id } },
      { component: "ProcedureMaster" }
    );
    if (resp?.result) {
      showSuccess("Deleted successfully");
      setRecords((prev) => prev.filter((r) => r.ProcedureId !== id));
      if (editId === id) resetForm();
    }
  };

  const filteredRecords = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return records;
    return records.filter(
      (r) =>
        r.ProcedureName?.toLowerCase().includes(q) ||
        r.SnomedCode?.toLowerCase().includes(q) ||
        r.Status?.toLowerCase().includes(q)
    );
  }, [records, searchText]);

  return (
    <div className="page-container">
      <h1 className="page-heading">Procedure Master</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Procedure Master</span>
      </nav>

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Activity size={18} className="text-blue-500" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">Procedure</h2>
            <p className="text-xs text-gray-400">Search SNOMED procedures or add a custom procedure</p>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <InputField label="Procedure" required>
            <div className="relative" ref={snomedRef}>
              <input
                type="text"
                className="input-field !mb-0"
                placeholder="Search procedure…"
                value={procedureName}
                onChange={(e) => {
                  setProcedureName(e.target.value);
                  setSnomedCode("");
                }}
              />
              {(showSnomedDropdown || snomedLoading) && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                  {snomedLoading ? (
                    <div className="px-3 py-2 text-sm text-gray-500">Searching…</div>
                  ) : snomedResults.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-400">No results found</div>
                  ) : (
                    snomedResults.map((item, i) => (
                      <button
                        key={i}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
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
          </InputField>

          <InputField label="SNOMED Code (optional)">
            <div className="relative">
              <input
                type="text"
                className="input-field !mb-0 pr-8"
                placeholder="Auto-filled or enter code directly"
                value={snomedCode}
                onChange={(e) => setSnomedCode(e.target.value)}
              />
              {snomedCode && (
                <button
                  type="button"
                  onClick={() => setSnomedCode("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </InputField>

          <InputField label="Status" required>
            <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </InputField>

          <div className="sm:col-span-3 flex items-end justify-end gap-2">
            {editId > 0 && (
              <button type="button" className="cancel-button" onClick={resetForm}>
                Cancel
              </button>
            )}
            <button
              type="button"
              className={loading ? "disabled-btn px-6" : "save-btn px-6"}
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving…" : editId > 0 ? "Update" : "Add"}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-5 mb-2 gap-3 flex-wrap">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Procedure List ({filteredRecords.length})
          </h3>
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="input-field !mb-0 pl-8 !py-1.5 text-xs"
              placeholder="Search name, status…"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>

        <div className="table-scroll-wrapper">
          <div className="table-size">
            <table className="base-table">
              <thead className="table-head">
                <tr>
                  <th className="table-th">Procedure</th>
                  <th className="table-th">SNOMED Code</th>
                  <th className="table-th">Status</th>
                  <th className="table-th text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {!listLoaded ? (
                  <tr>
                    <td colSpan={4} className="table-empty">Loading…</td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="table-empty">No records found</td>
                  </tr>
                ) : (
                  filteredRecords.map((rec) => (
                    <tr key={rec.ProcedureId} className="table-row hover:bg-blue-50/50 transition-colors">
                      <td className="table-td font-medium text-gray-800">{rec.ProcedureName}</td>
                      <td className="table-td text-xs text-gray-500">{rec.SnomedCode || "—"}</td>
                      <td className="table-td">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[rec.Status] ?? "bg-gray-50 text-gray-500 border border-gray-200"}`}>
                          {rec.Status}
                        </span>
                      </td>
                      <td className="table-action text-center">
                        <button
                          type="button"
                          onClick={() => handleEdit(rec)}
                          className="inline-flex items-center justify-center w-7 h-7 rounded hover:bg-blue-50 text-blue-500 transition active:scale-90"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(rec.ProcedureId)}
                          className="inline-flex items-center justify-center w-7 h-7 rounded bg-red-500 hover:bg-red-600 text-white transition active:scale-90 ml-1"
                        >
                          <Trash2 size={13} />
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
  );
};

export default ProcedureMaster;
