import InputField from "@/components/customInputField";
import { Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface SnomedItem {
  conceptId: string;
  term: string;
}

interface DiagnosisRecord {
  id: number;
  diagnosisName: string;
  snomedCode: string;
  status: string;
  startDateTime: string;
}

const STATUS_OPTIONS = ["Active", "Inactive", "Preliminary", "Finished", "Resolved"];

const DiagnosisMaster = () => {
  const [diagnosisName, setDiagnosisName] = useState("");
  const [snomedCode, setSnomedCode] = useState("");
  const [status, setStatus] = useState("");
  const [startDateTime, setStartDateTime] = useState("");

  const [snomedResults, setSnomedResults] = useState<SnomedItem[]>([]);
  const [showSnomedDropdown, setShowSnomedDropdown] = useState(false);
  const [snomedLoading, setSnomedLoading] = useState(false);
  const snomedRef = useRef<HTMLDivElement>(null);
  const skipSnomedRef = useRef(false);

  const [records, setRecords] = useState<DiagnosisRecord[]>([]);

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
    const q = diagnosisName.trim();
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
          `&state=active&semantictag=disorder&acceptability=preferred&returnlimit=100`;
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
  }, [diagnosisName]);

  const handleSnomedSelect = (item: SnomedItem) => {
    skipSnomedRef.current = true;
    setDiagnosisName(item.term);
    setSnomedCode(item.conceptId);
    setSnomedResults([]);
    setShowSnomedDropdown(false);
  };

  const resetForm = () => {
    setDiagnosisName("");
    setSnomedCode("");
    setStatus("");
    setStartDateTime("");
    setSnomedResults([]);
    setShowSnomedDropdown(false);
  };

  const handleAdd = () => {
    if (!diagnosisName.trim() || !status || !startDateTime) return;

    setRecords(prev => [
      ...prev,
      {
        id: Date.now(),
        diagnosisName: diagnosisName.trim(),
        snomedCode,
        status,
        startDateTime,
      },
    ]);
    resetForm();
  };

  const handleDelete = (id: number) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const formatDateTime = (dt: string) => {
    if (!dt) return "";
    return dt.replace("T", " ");
  };

  return (
    <div className="card">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
        <InputField label="Diagnoses" required>
          <div className="relative" ref={snomedRef}>
            <input
              type="text"
              className="input-field !mb-0"
              placeholder="Search diagnosis…"
              value={diagnosisName}
              onChange={e => {
                setDiagnosisName(e.target.value);
                setSnomedCode("");
              }}
            />
            {(showSnomedDropdown || snomedLoading) && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                {snomedLoading ? (
                  <div className="px-3 py-2 text-sm text-gray-500">Searching…</div>
                ) : snomedResults.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-400">No results found</div>
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
        </InputField>

        <InputField label="Status" required>
          <select className="input-field" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">-- Select --</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </InputField>

        <InputField label="Start Date Time" required>
          <input
            type="datetime-local"
            className="input-field"
            value={startDateTime}
            onChange={e => setStartDateTime(e.target.value)}
          />
        </InputField>

        <div className="mb-4">
          <button type="button" className="save-btn w-full" onClick={handleAdd}>
            Add
          </button>
        </div>
      </div>

      <div className="table-scroll-wrapper mt-2">
        <div className="table-size">
          <table className="base-table">
            <thead className="table-head">
              <tr>
                <th className="table-th">Diagnoses</th>
                <th className="table-th">Status</th>
                <th className="table-th">Start Date Time</th>
                <th className="table-th text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={4} className="table-empty">
                    No records found
                  </td>
                </tr>
              ) : (
                records.map(rec => (
                  <tr key={rec.id} className="table-row">
                    <td className="table-td font-medium text-gray-800">{rec.diagnosisName}</td>
                    <td className="table-td text-orange-500 capitalize">{rec.status}</td>
                    <td className="table-td text-gray-600">{formatDateTime(rec.startDateTime)}</td>
                    <td className="table-action text-center">
                      <button
                        type="button"
                        onClick={() => handleDelete(rec.id)}
                        className="inline-flex items-center justify-center w-7 h-7 rounded bg-red-500 hover:bg-red-600 text-white transition active:scale-90"
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
  );
};

export default DiagnosisMaster;
