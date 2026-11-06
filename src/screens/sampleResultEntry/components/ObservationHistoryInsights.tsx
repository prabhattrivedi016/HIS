import CustomDateInput from "@/components/customDateInput";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError } from "@/utils/alert";
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { InvestigationHistoryItem, SubInvetigationItem } from "../types";

type ObservationItem = {
  id: number;
  name: string;
  isChecked: boolean;
};

const ObservationHistoryInsights = ({
  subInvestigationlists,
}: {
  subInvestigationlists: SubInvetigationItem[];
}) => {
  const [modifiedObservationList, setModifiedObservationList] = useState<ObservationItem[]>([]);

  console.log("modifiedObservationListmodifiedObservationList", modifiedObservationList);

  const [dateRange, setDateRange] = useState("today");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [resultHistory, setResultHistory] = useState<InvestigationHistoryItem[]>([]);
  const [showObservationOptions, setShowObservationOptions] = useState(false);
  const observationOptionsRef = useRef<HTMLDivElement>(null);
  const { loading, fetchApi } = useGlobalApi();
  const fetchApiRef = useRef(fetchApi);
  fetchApiRef.current = fetchApi;

  const patientId = Number(subInvestigationlists[0]?.PatientId);
  const investigationId = Number(subInvestigationlists[0]?.InvestigationId);

  // Prepare observation list
  const observationTypeList = useMemo(() => {
    return (
      subInvestigationlists?.map(o => ({
        id: Number(o?.ObservationId),
        name: o?.ObservationName ?? "",
        isChecked: true,
      })) ?? []
    );
  }, [subInvestigationlists]);

  useEffect(() => {
    setModifiedObservationList(observationTypeList);
  }, [observationTypeList]);

  // Only checked observations
  const activeObservationList = useMemo(
    () => modifiedObservationList.filter(o => o.isChecked),
    [modifiedObservationList]
  );

  const observationTypeLabel =
    activeObservationList.length === 0
      ? "Select Observation"
      : activeObservationList.length === modifiedObservationList.length
        ? "Select All"
        : activeObservationList.length === 1
          ? activeObservationList[0].name
          : `${activeObservationList.length} selected`;

  // Checkbox change handler
  const observationCheckHandler = (id: number) => {
    setModifiedObservationList(previous =>
      previous.map(o => (o.id === id ? { ...o, isChecked: !o.isChecked } : o))
    );
  };

  const toggleAllObservations = (checked: boolean) => {
    setModifiedObservationList(previous => previous.map(o => ({ ...o, isChecked: checked })));
  };

  // Date range change handler
  const dateRangeSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    setDateRange(e.target.value);
  };

  const getDateBounds = useCallback(() => {
    const today = new Date();
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const start = new Date(end);

    switch (dateRange) {
      case "lastWeek":
        start.setDate(start.getDate() - 7);
        break;
      case "lastMonth":
        start.setMonth(start.getMonth() - 1);
        break;
      case "lastSixMonth":
        start.setMonth(start.getMonth() - 6);
        break;
      case "lastYear":
        start.setFullYear(start.getFullYear() - 1);
        break;
      case "dateRange":
        return { fromDate, toDate };
      default:
        break;
    }

    const toInputDate = (date: Date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    return { fromDate: toInputDate(start), toDate: toInputDate(end) };
  }, [dateRange, fromDate, toDate]);

  const loadHistory = useCallback(
    async (dateBounds?: { fromDate: string; toDate: string }) => {
      const params: Record<string, string | number> = { patientId, investigationId };
      if (dateBounds) {
        params.fromDate = dateBounds.fromDate;
        params.toDate = dateBounds.toDate;
      }
      const response = await fetchApiRef.current(
        "GET",
        ENDPOINTS.GET_PATIENT_TABULAR_RESULT_ENTRY_HISTORY,
        {},
        { params },
        { component: "ObservationHistoryInsights" }
      );
      if (!response?.result) {
        showError(response?.message ?? "Unable to load observation history.");
        setResultHistory([]);
        return;
      }
      setResultHistory(response?.data ?? []);
    },
    [investigationId, patientId]
  );

  useEffect(() => {
    if (patientId && investigationId) loadHistory();
  }, [loadHistory, patientId, investigationId]);

  const handleApplyFilter = () => {
    const dateBounds = getDateBounds();
    if (!dateBounds.fromDate || !dateBounds.toDate) {
      showError("Please select both From Date and To Date.");
      return;
    }
    if (dateBounds.fromDate > dateBounds.toDate) {
      showError("From Date cannot be later than To Date.");
      return;
    }
    loadHistory(dateBounds);
  };

  const filteredHistory = useMemo(() => {
    const selectedIds = new Set(activeObservationList.map(o => o.id));
    const { fromDate: startDate, toDate: endDate } = getDateBounds();

    const toComparableDate = (value: string) => {
      const [day, month, year] = value.split("-");
      return `${year}-${month}-${day}`;
    };

    return resultHistory.filter(item => {
      const itemDate = toComparableDate(item.BillDate);
      return (
        selectedIds.has(Number(item.ObservationId)) &&
        (!startDate || itemDate >= startDate) &&
        (!endDate || itemDate <= endDate)
      );
    });
  }, [activeObservationList, getDateBounds, resultHistory]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!observationOptionsRef.current?.contains(event.target as Node)) {
        setShowObservationOptions(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className="mt-1">
      <div className="form-grid-4">
        {/* Observation Type */}
        <div className="flex items-center gap-2">
          <label className="whitespace-nowrap text-sm font-semibold">Observation Type:</label>

          <div className="relative w-60" ref={observationOptionsRef}>
            <button
              type="button"
              onClick={() => setShowObservationOptions(previous => !previous)}
              aria-expanded={showObservationOptions}
              className="input-field !mb-0 !h-10 flex w-full items-center justify-between gap-2 text-sm"
            >
              <span className="truncate">{observationTypeLabel}</span>
              <span className="shrink-0 text-gray-400">▾</span>
            </button>
            {showObservationOptions && (
              <div className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl">
                <label className="flex cursor-pointer items-center gap-2 border-b px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={
                      modifiedObservationList.length > 0 &&
                      activeObservationList.length === modifiedObservationList.length
                    }
                    onChange={event => toggleAllObservations(event.target.checked)}
                    className="h-4 w-4 accent-blue-600"
                  />
                  Select All
                </label>
                {modifiedObservationList.map(o => (
                  <label
                    key={o.id}
                    className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50"
                  >
                    <input
                      type="checkbox"
                      checked={o.isChecked}
                      onChange={() => observationCheckHandler(o.id)}
                      className="h-4 w-4 accent-blue-600"
                    />
                    <span className="truncate">{o.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-2">
          <label className="whitespace-nowrap text-sm font-semibold">Date:</label>

          <select
            className="input-field !mb-0 !h-10 w-60"
            onChange={dateRangeSelectHandler}
            value={dateRange}
          >
            <option value="">Select</option>
            <option value="today">Today</option>
            <option value="lastWeek">Last Week</option>
            <option value="lastMonth">Last Month</option>
            <option value="lastSixMonth">Last Six Month</option>
            <option value="lastYear">Last Year</option>
            <option value="dateRange">Date Range</option>
          </select>
        </div>

        {dateRange === "dateRange" && (
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap text-sm font-semibold">From:</label>
            <CustomDateInput className="!mb-0 !h-10 w-60" value={fromDate} onChange={setFromDate} />
            <label className="whitespace-nowrap text-sm font-semibold">To:</label>
            <CustomDateInput className="!mb-0 !h-10 w-60" value={toDate} onChange={setToDate} />
          </div>
        )}

        {/* Apply Filter */}
        <div className="flex items-center justify-end gap-2 w-full">
          <button className="save-btn" type="button" onClick={handleApplyFilter} disabled={loading}>
            Apply Filter
          </button>
        </div>
      </div>
      <div className="table-scroll-wrapper">
        <div className="table-size min-h-80 max-h-80">
          <table className="base-table">
            <thead className="table-head">
              <tr>
                <th className="table-th">#</th>
                <th className="table-th">Lab No</th>
                <th className="table-th">Barcode</th>
                <th className="table-th">Bill Date</th>
                <th className="table-th">Observation Name</th>
                <th className="table-th">Result Value</th>
                <th className="table-th">Min Value</th>
                <th className="table-th">Max Value</th>
                <th className="table-th">Display Range</th>
                <th className="table-th">Unit</th>
                <th className="table-th">Method</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={11} className="table-empty">
                    No records found
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item, index) => (
                  <tr key={`${item.LabNo}-${item.ObservationId}-${index}`} className="table-row">
                    <td className="table-td">{index + 1}</td>
                    <td className="table-td">{item.LabNo || "-"}</td>
                    <td className="table-td">{item.BarCode || "-"}</td>
                    <td className="table-td">{item.BillDate || "-"}</td>
                    <td className="table-td">{item.ObservationName || "-"}</td>
                    <td className="table-td">{item.ResultValue || "-"}</td>
                    <td className="table-td">{item.MinValue || "-"}</td>
                    <td className="table-td">{item.MaxValue || "-"}</td>
                    <td className="table-td">{item.DisplayRange || "-"}</td>
                    <td className="table-td">{item.Unit || "-"}</td>
                    <td className="table-td">{item.MethodName || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {loading && <CustomLoader isLoading={loading} />}
      </div>
    </div>
  );
};

export default ObservationHistoryInsights;
