import CustomDateInput from "@/components/customDateInput";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError } from "@/utils/alert";
import * as am5 from "@amcharts/amcharts5";
import * as am5exporting from "@amcharts/amcharts5/plugins/exporting";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { InvestigationHistoryItem, SubInvetigationItem } from "../types";

type ObservationItem = {
  id: number;
  name: string;
  isChecked: boolean;
};

const colorPalette = [
  "#22c55e", // Green
  "#ef4444", // Red
  "#f59e0b", // Orange
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
  "#ec4899", // Pink
  "#84cc16", // Lime
  "#f97316", // Dark Orange
  "#6366f1", // Indigo
  "#14b8a6", // Teal
  "#a855f7", // Violet
  "#64748b", // Slate
  "#e11d48", // Rose
  "#0d9488", // Dark Teal
];

const ObservationGraphInsights = ({
  subInvestigationlists,
}: {
  subInvestigationlists: SubInvetigationItem[];
}) => {
  const [modifiedObservationList, setModifiedObservationList] = useState<ObservationItem[]>([]);

  const [dateRange, setDateRange] = useState("today");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [resultHistory, setResultHistory] = useState<InvestigationHistoryItem[]>([]);
  const [showObservationOptions, setShowObservationOptions] = useState(false);
  const [chartType, setChartType] = useState<"Line" | "Bar">("Line");
  const [filtered, setFiltered] = useState(false);
  const observationOptionsRef = useRef<HTMLDivElement>(null);
  const chartDivRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<am5.Root | null>(null);
  const exportingRef = useRef<am5exporting.Exporting | null>(null);
  const { loading, fetchApi } = useGlobalApi();
  const fetchApiRef = useRef(fetchApi);
  fetchApiRef.current = fetchApi;

  const patientId = Number(subInvestigationlists?.[0]?.PatientId);
  const investigationId = Number(subInvestigationlists?.[0]?.InvestigationId);

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
    if (activeObservationList.length === 0) {
      showError("Select at least one observation type.");
      return;
    }
    setFiltered(true);
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

  const chartData = useMemo(() => {
    const entries = new Map<string, Record<string, string | number>>();
    filteredHistory.forEach(item => {
      const observation = activeObservationList.find(
        selected => selected.id === Number(item.ObservationId)
      );
      if (!observation || !Number.isFinite(Number(item.ResultValue))) return;

      const key = `${item.BillDate}-${item.LabNo}-${item.BarCode}`;
      const entry = entries.get(key) ?? {
        entryDate: `${item.BillDate} (Lab ${item.LabNo})`,
      };
      entry[observation.name] = Number(item.ResultValue);
      entries.set(key, entry);
    });
    return [...entries.values()];
  }, [activeObservationList, filteredHistory]);

  useLayoutEffect(() => {
    if (!chartDivRef.current || !filtered) return;

    rootRef.current?.dispose();
    rootRef.current = null;
    exportingRef.current = null;
    if (activeObservationList.length === 0 || chartData.length === 0) return;

    const root = am5.Root.new(chartDivRef.current);
    rootRef.current = root;
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        pinchZoomX: true,
        paddingLeft: 0,
        paddingRight: 0,
      })
    );
    const cursor = chart.set("cursor", am5xy.XYCursor.new(root, { behavior: "none" }));
    cursor.lineY.set("visible", false);

    const xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 20 });
    xRenderer.labels.template.setAll({
      rotation: -20,
      centerY: am5.p100,
      centerX: am5.p100,
      paddingRight: 12,
      fontSize: 10,
    });
    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "entryDate",
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {}),
      })
    );
    xAxis.data.setAll(chartData);
    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, { strokeOpacity: 0.1 }),
      })
    );

    activeObservationList.forEach((observation, index) => {
      const color = am5.color(colorPalette[index % colorPalette.length]);
      if (chartType === "Line") {
        const series = chart.series.push(
          am5xy.LineSeries.new(root, {
            name: observation.name,
            xAxis,
            yAxis,
            valueYField: observation.name,
            categoryXField: "entryDate",
            stroke: color,
            fill: color,
            tooltip: am5.Tooltip.new(root, { labelText: "{valueY}" }),
          })
        );
        series.strokes.template.setAll({ strokeWidth: 2 });
        series.bullets.push(() =>
          am5.Bullet.new(root, {
            sprite: am5.Circle.new(root, { radius: 3, fill: color, stroke: color }),
          })
        );
        series.data.setAll(chartData);
        series.appear(1000);
      } else {
        const series = chart.series.push(
          am5xy.ColumnSeries.new(root, {
            name: observation.name,
            xAxis,
            yAxis,
            valueYField: observation.name,
            categoryXField: "entryDate",
            fill: color,
            stroke: color,
            tooltip: am5.Tooltip.new(root, { labelText: "{valueY}" }),
          })
        );
        series.columns.template.setAll({
          cornerRadiusTL: 3,
          cornerRadiusTR: 3,
          strokeOpacity: 0,
          width: am5.percent(60),
        });
        series.data.setAll(chartData);
        series.appear(1000);
      }
    });

    const legend = chart.children.push(
      am5.Legend.new(root, { centerX: am5.percent(50), x: am5.percent(50), marginTop: 8 })
    );
    legend.data.setAll(chart.series.values);
    chart.appear(1000, 100);
    exportingRef.current = am5exporting.Exporting.new(root, {
      title: "Observation Graph",
      printOptions: { printMethod: "css" },
    });

    return () => {
      root.dispose();
      if (rootRef.current === root) rootRef.current = null;
      exportingRef.current = null;
    };
  }, [activeObservationList, chartData, chartType, filtered]);

  const handlePrint = () => exportingRef.current?.print();

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

        {/* chart type */}
        <div className="flex items-center gap-2">
          <label className="whitespace-nowrap text-sm font-semibold">Chart:</label>

          <select
            className="input-field !mb-0 !h-10 w-60"
            value={chartType}
            onChange={event => setChartType(event.target.value as "Line" | "Bar")}
          >
            <option value="Line">Line</option>
            <option value="Bar">Bar</option>
          </select>
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
          <button
            type="button"
            className={filtered ? "cancel-button" : "disabled-btn"}
            disabled={!filtered || loading}
            onClick={handlePrint}
          >
            Print Chart
          </button>
        </div>
      </div>
      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-3">
        {filtered && chartData.length === 0 ? (
          <div className="flex h-80 items-center justify-center text-sm text-gray-500">
            No chart data found
          </div>
        ) : (
          <div ref={chartDivRef} className="h-80 w-full" />
        )}
      </div>

      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default ObservationGraphInsights;
