import * as am5 from "@amcharts/amcharts5";
import * as am5exporting from "@amcharts/amcharts5/plugins/exporting";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

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

interface VitalGraphProps {
  isOpen: boolean;
  vitalsList: string[];
  vitalRecords: PatientVitalGroup[];
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

const SERIES_COLORS = [
  "#22c55e",
  "#ef4444",
  "#f59e0b",
  "#3b82f6",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
  "#14b8a6",
  "#f97316",
  "#64748b",
  "#a855f7",
];

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

const VitalGraph = ({ isOpen, vitalsList, vitalRecords }: VitalGraphProps) => {
  const [selectedVitals, setSelectedVitals] = useState<string[]>([]);
  const [showVitalDrop, setShowVitalDrop] = useState(false);
  const [chartType, setChartType] = useState("Line");
  const [dateOption, setDateOption] = useState("Select All");
  const [showDateDrop, setShowDateDrop] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [activeVitals, setActiveVitals] = useState<string[]>([]);
  const [chartData, setChartData] = useState<Record<string, string | number>[]>([]);
  const [filtered, setFiltered] = useState(false);

  const chartDivRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<am5.Root | null>(null);
  const exportingRef = useRef<am5exporting.Exporting | null>(null);
  const vitalDropRef = useRef<HTMLDivElement>(null);
  const dateDropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedVitals([]);
      setShowVitalDrop(false);
      setChartType("Line");
      setDateOption("Select All");
      setShowDateDrop(false);
      setFromDate("");
      setToDate("");
      setActiveVitals([]);
      setChartData([]);
      setFiltered(false);
      if (rootRef.current) {
        rootRef.current.dispose();
        rootRef.current = null;
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (vitalDropRef.current && !vitalDropRef.current.contains(e.target as Node))
        setShowVitalDrop(false);
      if (dateDropRef.current && !dateDropRef.current.contains(e.target as Node))
        setShowDateDrop(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useLayoutEffect(() => {
    if (!chartDivRef.current || !filtered) return;

    if (rootRef.current) {
      rootRef.current.dispose();
      rootRef.current = null;
    }
    if (activeVitals.length === 0 || chartData.length === 0) return;

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

    const xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 28 });
    xRenderer.labels.template.setAll({
      rotation: -45,
      centerY: am5.p100,
      centerX: am5.p100,
      paddingRight: 15,
      fontSize: 9,
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

    activeVitals.forEach((vital, i) => {
      const color = am5.color(SERIES_COLORS[i % SERIES_COLORS.length]);
      if (chartType === "Line") {
        const series = chart.series.push(
          am5xy.LineSeries.new(root, {
            name: vital,
            xAxis,
            yAxis,
            valueYField: vital,
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
            name: vital,
            xAxis,
            yAxis,
            valueYField: vital,
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
      title: "Vital Graph",
      printOptions: { printMethod: "css" },
    });

    return () => {
      root.dispose();
      rootRef.current = null;
      exportingRef.current = null;
    };
  }, [activeVitals, chartData, chartType, filtered]);

  const toggleVital = (v: string) =>
    setSelectedVitals(prev => (prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]));

  const buildChartData = (vitals: string[]) =>
    vitalRecords
      .filter(group => {
        const d = parseVitalDateTime(group.vitalDateTime);
        return d ? isWithinDateOption(d, dateOption, fromDate, toDate) : true;
      })
      .reverse()
      .map(group => {
        const entry: Record<string, string | number> = {
          entryDate: formatVitalDateTime(group.vitalDateTime),
        };
        vitals.forEach(vitalName => {
          const raw = group.vitals.find(v => v.VitalName === vitalName)?.VitalValue;
          if (raw !== undefined && raw !== "" && !Number.isNaN(Number(raw))) {
            entry[vitalName] = Number(raw);
          }
        });
        return entry;
      });

  const handleFilter = () => {
    if (selectedVitals.length === 0) return;
    setActiveVitals([...selectedVitals]);
    setChartData(buildChartData(selectedVitals));
    setFiltered(true);
  };

  const vitalLabel =
    selectedVitals.length === 0
      ? "Select Vital"
      : selectedVitals.length === 1
        ? selectedVitals[0]
        : `${selectedVitals.length} items checked`;

  const chartTitle = activeVitals.length > 0 ? `EntryDate,  ${activeVitals.join(",  ")}` : "";

  const handlePrint = () => {
    exportingRef.current?.print();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="px-5 py-3 border-b shrink-0"
        style={{ overflow: "visible", position: "relative", zIndex: 60 }}
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide shrink-0">
              Vital
            </span>
            <div className="relative" ref={vitalDropRef} style={{ zIndex: 70 }}>
              <button
                type="button"
                onClick={() => setShowVitalDrop(p => !p)}
                className="input-field !mb-0 !py-1.5 min-w-[160px] flex items-center justify-between gap-2 text-xs cursor-pointer"
              >
                <span className="truncate">{vitalLabel}</span>
                <span className="text-gray-400 text-[10px] shrink-0">▾</span>
              </button>
              {showVitalDrop && (
                <div
                  className="absolute top-full left-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                  style={{ zIndex: 999 }}
                >
                  <label className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b text-xs font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedVitals.length === vitalsList.length && vitalsList.length > 0}
                      onChange={e => setSelectedVitals(e.target.checked ? [...vitalsList] : [])}
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
                        checked={selectedVitals.includes(v)}
                        onChange={() => toggleVital(v)}
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
              Chart
            </span>
            <select
              className="input-field !mb-0 !py-1.5 text-xs min-w-[90px]"
              value={chartType}
              onChange={e => setChartType(e.target.value)}
            >
              <option value="Line">Line</option>
              <option value="Bar">Bar</option>
            </select>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide shrink-0">
              Date
            </span>
            <div className="relative" ref={dateDropRef} style={{ zIndex: 70 }}>
              <button
                type="button"
                onClick={() => setShowDateDrop(p => !p)}
                className="input-field !mb-0 !py-1.5 min-w-[120px] flex items-center justify-between gap-2 text-xs cursor-pointer"
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

          <div className="flex items-center gap-2 ml-auto">
            <button type="button" className="save-btn !py-1.5 !px-5 text-xs" onClick={handleFilter}>
              Apply Filter
            </button>
            <button
              type="button"
              className={
                filtered
                  ? "cancel-button !py-1.5 !px-5 text-xs"
                  : "disabled-btn !py-1.5 !px-5 text-xs"
              }
              disabled={!filtered}
              onClick={handlePrint}
            >
              Print Chart
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 px-5 py-3 overflow-hidden min-h-0">
        {chartTitle && (
          <p className="text-xs font-semibold text-gray-700 mb-2 shrink-0">{chartTitle}</p>
        )}
        {!filtered ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Select vitals and click <span className="font-semibold mx-1 text-blue-600">Filter</span>{" "}
            to view the chart
          </div>
        ) : activeVitals.length === 0 || chartData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-red-500 text-sm font-medium">
            There is no or empty series
          </div>
        ) : (
          <div className="flex-1 min-h-0" style={{ height: 0 }}>
            <div ref={chartDivRef} style={{ width: "100%", height: "100%" }} />
          </div>
        )}
      </div>
    </>
  );
};

export default VitalGraph;
