import { useEffect, useMemo, useRef, useState } from "react";
import { History } from "lucide-react";

interface VitalHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: number;
}

interface VitalHistoryRow {
  id: number;
  vitalDate: string;
  values: Record<string, string>;
  enteredBy: string;
}

const VITAL_COLUMNS = [
  "YO", "YO2", "GRBS", "HT", "WT", "HC", "T", "R", "P", "BPS", "BPD",
  "MAC", "BMI", "MAP", "BSA", "Pain", "SPO2", "LMP", "RBS", "PRG",
];

const DATE_OPTIONS = [
  "Select All",
  "Today",
  "Last Week",
  "Last Month",
  "Last Six Months",
  "Last Year",
  "Date Range",
];

const NORMAL_RANGE: Record<string, [number, number]> = {
  R: [12, 20],
  P: [60, 100],
  SPO2: [92, 100],
};

const PAGE_SIZE = 12;

/* TODO: replace with real API call
 * GET /EMR/getPatientVitalHistoryList
 * params: { patientId, vitalType, fromDate, toDate, abnormalOnly, page, pageSize }
 * Response: [{ id, vitalDate, values: { T, R, P, BPS, BPD, Pain, SPO2, ... }, enteredBy }]
 */
const mockRows = (): VitalHistoryRow[] => {
  const enterers = ["Ankush Adhik Thorat", "Mayura Vishal Dhanawale", "Bharatkumar Gite", "Shrikant Ballal", "Tulsi Kadam"];
  const base = new Date("2026-06-27T04:48:00");
  return Array.from({ length: 46 }, (_, i) => {
    const d = new Date(base);
    d.setHours(base.getHours() - i * 7);
    const dateLabel =
      `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()} ` +
      d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).replace(" ", "");
    const r = 18 + Math.floor(Math.random() * 8);
    const p = 84 + Math.floor(Math.random() * 16);
    const hasBp = i % 3 === 0;

    return {
      id: i + 1,
      vitalDate: dateLabel,
      values: {
        T: `${97 + Math.floor(Math.random() * 2)} F`,
        R: String(r),
        P: String(p),
        BPS: hasBp ? String(110 + Math.floor(Math.random() * 15)) : "",
        BPD: hasBp ? String(70 + Math.floor(Math.random() * 15)) : "",
        Pain: i % 5 === 0 ? "10" : "2010",
        SPO2: `${92 + Math.floor(Math.random() * 8)} %`,
      },
      enteredBy: enterers[i % enterers.length],
    };
  });
};

const VitalHistory = ({ isOpen, onClose, patientId: _patientId }: VitalHistoryProps) => {
  const [dateOption, setDateOption] = useState("Select All");
  const [showDateDrop, setShowDateDrop] = useState(false);
  const [abnormalOnly, setAbnormalOnly] = useState(false);
  const [rows, setRows] = useState<VitalHistoryRow[]>([]);
  const [page, setPage] = useState(1);
  const dateDropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setRows(mockRows());
      setPage(1);
      setAbnormalOnly(false);
      setDateOption("Select All");
    }
  }, [isOpen]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dateDropRef.current && !dateDropRef.current.contains(e.target as Node)) setShowDateDrop(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const isAbnormal = (key: string, raw: string) => {
    const range = NORMAL_RANGE[key];
    if (!range || !raw) return false;
    const n = parseFloat(raw);
    if (Number.isNaN(n)) return false;
    return n < range[0] || n > range[1];
  };

  const filteredRows = useMemo(() => {
    if (!abnormalOnly) return rows;
    return rows.filter((r) => VITAL_COLUMNS.some((c) => isAbnormal(c, r.values[c] ?? "")));
  }, [rows, abnormalOnly]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const pagedRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilter = () => {
    setPage(1);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[88] bg-black/30" onClick={onClose} />

      <div className="fixed inset-0 z-[89] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white w-full max-w-6xl rounded-xl shadow-2xl flex flex-col pointer-events-auto"
          style={{ height: 640, maxHeight: "88vh" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50 rounded-t-xl shrink-0">
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800 uppercase tracking-wide">
              <History size={16} className="text-blue-500" />
              Vital History
            </h3>
            <button className="close-drawer-btn" onClick={onClose}>&times;</button>
          </div>

          {/* Filter row */}
          <div className="px-5 py-3 border-b shrink-0" style={{ overflow: "visible", position: "relative", zIndex: 60 }}>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide shrink-0">Vital Sign Type</span>
                <div className="input-field !mb-0 !py-1.5 min-w-[160px] flex items-center text-xs text-gray-500 bg-white cursor-not-allowed">
                  Select All
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide shrink-0">Date Range</span>
                <div className="relative" ref={dateDropRef} style={{ zIndex: 70 }}>
                  <button
                    type="button"
                    onClick={() => setShowDateDrop((p) => !p)}
                    className="input-field !mb-0 !py-1.5 min-w-[140px] flex items-center justify-between gap-2 text-xs cursor-pointer"
                  >
                    <span>{dateOption}</span>
                    <span className="text-gray-400 text-[10px] shrink-0">▾</span>
                  </button>
                  {showDateDrop && (
                    <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-xl" style={{ zIndex: 999 }}>
                      {DATE_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => { setDateOption(opt); setShowDateDrop(false); }}
                          className={`w-full text-left px-3 py-2 text-xs transition ${
                            dateOption === opt ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="input-checkbox"
                  checked={abnormalOnly}
                  onChange={(e) => setAbnormalOnly(e.target.checked)}
                />
                <span className="text-xs font-medium text-gray-700">Abnormal Values</span>
              </label>

              <button type="button" className="save-btn !py-1.5 !px-5 text-xs ml-auto" onClick={handleFilter}>
                Filter
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 flex flex-col min-h-0 px-5 py-3 overflow-hidden">
            <div className="table-scroll-wrapper flex-1 min-h-0">
              <div className="table-size">
                <table className="base-table">
                  <thead className="table-head">
                    <tr>
                      <th className="table-th whitespace-nowrap">Vital Date</th>
                      {VITAL_COLUMNS.map((c) => (
                        <th key={c} className="table-th text-center whitespace-nowrap">{c}</th>
                      ))}
                      <th className="table-th whitespace-nowrap">Entered By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRows.length === 0 ? (
                      <tr>
                        <td colSpan={VITAL_COLUMNS.length + 2} className="table-empty">No vital records found</td>
                      </tr>
                    ) : (
                      pagedRows.map((row) => (
                        <tr key={row.id} className="table-row hover:bg-blue-50/50 transition-colors">
                          <td className="table-td whitespace-nowrap font-medium text-gray-700">{row.vitalDate}</td>
                          {VITAL_COLUMNS.map((c) => {
                            const val = row.values[c] ?? "";
                            return (
                              <td
                                key={c}
                                className={`table-td text-center whitespace-nowrap ${
                                  val && isAbnormal(c, val) ? "text-red-500 font-semibold" : "text-gray-600"
                                }`}
                              >
                                {val || "-"}
                              </td>
                            );
                          })}
                          <td className="table-td whitespace-nowrap text-gray-600">{row.enteredBy}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer — total + pagination */}
            <div className="flex items-center justify-between mt-2 shrink-0">
              <span className="text-xs text-gray-400">Total {filteredRows.length} Records</span>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-2 py-1 text-xs rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 transition"
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPage(n)}
                      className={`w-6 h-6 text-xs rounded transition ${
                        page === n ? "bg-blue-500 text-white font-semibold" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-2 py-1 text-xs rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 transition"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VitalHistory;
