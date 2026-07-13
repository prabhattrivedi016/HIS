import { useEffect, useMemo, useRef, useState } from "react";

interface PatientVitalEntry {
  VitalId: number;
  VitalName: string;
  VitalValue: string;
  Id: number;
  CreatedOn: string;
}

interface PatientVitalGroup {
  vitalDateTime: string;
  visitId: number;
  vitals: PatientVitalEntry[];
}

interface VitalHistoryProps {
  isOpen: boolean;
  vitalsList: string[];
  vitalRecords: PatientVitalGroup[];
  vitalUnits?: Record<string, string>;
}

interface VitalHistoryRow {
  id: number;
  vitalDate: string;
  values: Record<string, string>;
}

const DATE_OPTIONS = [
  "Select All",
  "Today",
  "Last Week",
  "Last Month",
  "Last Six Months",
  "Last Year",
  "Date Range",
];

/* name-pattern based since the vital list is dynamic (from the vital master API), not fixed columns */
const NORMAL_RANGE_MATCHERS: { test: (name: string) => boolean; range: [number, number] }[] = [
  { test: n => n.includes("r rate") || n.includes("resp"), range: [12, 20] },
  { test: n => n.includes("pulse"), range: [60, 100] },
  { test: n => n.includes("spo2") || n.includes("spo₂"), range: [92, 100] },
  { test: n => n.includes("temp"), range: [97, 99] },
  { test: n => n.includes("systolic"), range: [90, 120] },
];

const PAGE_SIZE = 12;

const MONTHS: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

const parseVitalDateTime = (raw: string): Date | null => {
  const m = raw.match(/^(\d{2})-([A-Za-z]{3})-(\d{4})\s+(\d{2}):(\d{2})/);
  if (!m) return null;
  const monthIdx = MONTHS[m[2]];
  if (monthIdx === undefined) return null;
  return new Date(Number(m[3]), monthIdx, Number(m[1]), Number(m[4]), Number(m[5]));
};

const formatVitalDateTime = (raw: string): string => {
  const m = raw.match(/^(\d{2})-([A-Za-z]{3})-(\d{4})\s+(\d{2}):(\d{2})/);
  if (!m) return raw;
  const [, day, mon, year, hh, mm] = m;
  const hour24 = Number(hh);
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${day}-${mon}-${year} ${String(hour12).padStart(2, "0")}:${mm} ${period}`;
};

const isWithinDateOption = (d: Date, option: string, fromDate: string, toDate: string): boolean => {
  const now = new Date();
  switch (option) {
    case "Today":
      return d.toDateString() === now.toDateString();
    case "Last Week": {
      const from = new Date(now);
      from.setDate(now.getDate() - 7);
      return d >= from && d <= now;
    }
    case "Last Month": {
      const from = new Date(now);
      from.setMonth(now.getMonth() - 1);
      return d >= from && d <= now;
    }
    case "Last Six Months": {
      const from = new Date(now);
      from.setMonth(now.getMonth() - 6);
      return d >= from && d <= now;
    }
    case "Last Year": {
      const from = new Date(now);
      from.setFullYear(now.getFullYear() - 1);
      return d >= from && d <= now;
    }
    case "Date Range": {
      if (!fromDate && !toDate) return true;
      if (fromDate && d < new Date(fromDate)) return false;
      if (toDate) {
        const toEnd = new Date(toDate);
        toEnd.setHours(23, 59, 59, 999);
        if (d > toEnd) return false;
      }
      return true;
    }
    case "Select All":
    default:
      return true;
  }
};

const VitalHistory = ({ isOpen, vitalsList, vitalRecords, vitalUnits }: VitalHistoryProps) => {
  const [dateOption, setDateOption] = useState("Select All");
  const [showDateDrop, setShowDateDrop] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appliedDateOption, setAppliedDateOption] = useState("Select All");
  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");
  const [abnormalOnly, setAbnormalOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedVitalTypes, setSelectedVitalTypes] = useState<string[]>([]);
  const [activeVitalColumns, setActiveVitalColumns] = useState<string[]>([]);
  const [showVitalTypeDrop, setShowVitalTypeDrop] = useState(false);
  const dateDropRef = useRef<HTMLDivElement>(null);
  const vitalTypeDropRef = useRef<HTMLDivElement>(null);

  const rows: VitalHistoryRow[] = useMemo(() => {
    const dateFiltered = vitalRecords.filter(group => {
      const d = parseVitalDateTime(group.vitalDateTime);
      return d ? isWithinDateOption(d, appliedDateOption, appliedFromDate, appliedToDate) : true;
    });
    return dateFiltered.map((group, i) => ({
      id: i + 1,
      vitalDate: group.vitalDateTime,
      values: Object.fromEntries(group.vitals.map(v => [v.VitalName, v.VitalValue ?? ""])),
    }));
  }, [vitalRecords, appliedDateOption, appliedFromDate, appliedToDate]);

  useEffect(() => {
    if (isOpen) {
      setPage(1);
      setAbnormalOnly(false);
      setDateOption("Select All");
      setFromDate("");
      setToDate("");
      setAppliedDateOption("Select All");
      setAppliedFromDate("");
      setAppliedToDate("");
      setSelectedVitalTypes(vitalsList);
      setActiveVitalColumns(vitalsList);
    }
  }, [isOpen, vitalsList]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dateDropRef.current && !dateDropRef.current.contains(e.target as Node))
        setShowDateDrop(false);
      if (vitalTypeDropRef.current && !vitalTypeDropRef.current.contains(e.target as Node))
        setShowVitalTypeDrop(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const toggleVitalType = (v: string) =>
    setSelectedVitalTypes(prev => (prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]));

  const vitalTypeLabel =
    selectedVitalTypes.length === 0
      ? "Select Vital"
      : selectedVitalTypes.length === vitalsList.length
        ? "Select All"
        : selectedVitalTypes.length === 1
          ? selectedVitalTypes[0]
          : `${selectedVitalTypes.length} items checked`;

  const isAbnormal = (key: string, raw: string) => {
    if (!raw) return false;
    const matcher = NORMAL_RANGE_MATCHERS.find(m => m.test(key.toLowerCase()));
    if (!matcher) return false;
    const n = parseFloat(raw);
    if (Number.isNaN(n)) return false;
    return n < matcher.range[0] || n > matcher.range[1];
  };

  const filteredRows = useMemo(() => {
    if (!abnormalOnly) return rows;
    return rows.filter(r => activeVitalColumns.some(c => isAbnormal(c, r.values[c] ?? "")));
  }, [rows, abnormalOnly, activeVitalColumns]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const pagedRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilter = () => {
    setActiveVitalColumns(vitalsList.filter(v => selectedVitalTypes.includes(v)));
    setAppliedDateOption(dateOption);
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
    setPage(1);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Filter row */}
      <div
        className="px-5 py-3 border-b shrink-0"
        style={{ overflow: "visible", position: "relative", zIndex: 60 }}
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide shrink-0">
              Vital Sign Type
            </span>
            <div className="relative" ref={vitalTypeDropRef} style={{ zIndex: 70 }}>
              <button
                type="button"
                onClick={() => setShowVitalTypeDrop(p => !p)}
                className="input-field !mb-0 !py-1.5 min-w-[160px] flex items-center justify-between gap-2 text-xs cursor-pointer"
              >
                <span className="truncate">{vitalTypeLabel}</span>
                <span className="text-gray-400 text-[10px] shrink-0">▾</span>
              </button>
              {showVitalTypeDrop && (
                <div
                  className="absolute top-full left-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                  style={{ zIndex: 999 }}
                >
                  <label className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b text-xs font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={
                        selectedVitalTypes.length === vitalsList.length && vitalsList.length > 0
                      }
                      onChange={e => setSelectedVitalTypes(e.target.checked ? [...vitalsList] : [])}
                      className="accent-blue-600"
                    />
                    Check All
                  </label>
                  {vitalsList.map(v => (
                    <label
                      key={v}
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-blue-50 cursor-pointer text-xs text-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={selectedVitalTypes.includes(v)}
                        onChange={() => toggleVitalType(v)}
                        className="accent-blue-600"
                      />
                      {v}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide shrink-0">
              Date Range
            </span>
            <div className="relative" ref={dateDropRef} style={{ zIndex: 70 }}>
              <button
                type="button"
                onClick={() => setShowDateDrop(p => !p)}
                className="input-field !mb-0 !py-1.5 min-w-[140px] flex items-center justify-between gap-2 text-xs cursor-pointer"
              >
                <span>{dateOption}</span>
                <span className="text-gray-400 text-[10px] shrink-0">▾</span>
              </button>
              {showDateDrop && (
                <div
                  className="absolute top-full left-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-xl"
                  style={{ zIndex: 999 }}
                >
                  {DATE_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setDateOption(opt);
                        setShowDateDrop(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs transition ${
                        dateOption === opt
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {dateOption === "Date Range" && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500 font-medium">From</span>
                <input
                  type="date"
                  className="input-field !mb-0 !py-1 text-xs w-36"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                />
                <span className="text-xs text-gray-500 font-medium">To</span>
                <input
                  type="date"
                  className="input-field !mb-0 !py-1 text-xs w-36"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                />
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="input-checkbox"
              checked={abnormalOnly}
              onChange={e => setAbnormalOnly(e.target.checked)}
            />
            <span className="text-xs font-medium text-gray-700">Abnormal Values</span>
          </label>

          <button
            type="button"
            className="save-btn !py-1.5 !px-5 text-xs ml-auto"
            onClick={handleFilter}
          >
            Apply Filter
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
                  {activeVitalColumns.map(c => (
                    <th key={c} className="table-th text-center whitespace-nowrap">
                      {c}
                      {vitalUnits?.[c] ? `(${vitalUnits[c]})` : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedRows.length === 0 ? (
                  <tr>
                    <td colSpan={activeVitalColumns.length + 1} className="table-empty">
                      No vital records found
                    </td>
                  </tr>
                ) : (
                  pagedRows.map(row => (
                    <tr key={row.id} className="table-row hover:bg-blue-50/50 transition-colors">
                      <td className="table-td whitespace-nowrap font-medium text-gray-700">
                        {formatVitalDateTime(row.vitalDate)}
                      </td>
                      {activeVitalColumns.map(c => {
                        const val = row.values[c] ?? "";
                        return (
                          <td
                            key={c}
                            className={`table-td text-center whitespace-nowrap ${
                              val && isAbnormal(c, val)
                                ? "text-red-500 font-semibold"
                                : "text-gray-600"
                            }`}
                          >
                            {val || "-"}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 shrink-0">
          <span className="text-xs text-gray-400">Total {filteredRows.length} Records</span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-2 py-1 text-xs rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 transition"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`w-6 h-6 text-xs rounded transition ${
                    page === n
                      ? "bg-blue-500 text-white font-semibold"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-2 py-1 text-xs rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 transition"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default VitalHistory;
