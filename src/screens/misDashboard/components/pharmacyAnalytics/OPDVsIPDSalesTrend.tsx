import { TrendingUp } from "lucide-react";

export default function RevenueVsExpenseChart() {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
  ];

  // Values matching the 80L max scale
  const ipdSales = [20, 28, 35, 42, 50, 55, 60, 65, 72]; // Red Line (Bottom / Base)
  const opdSales = [30, 38, 45, 52, 58, 62, 68, 73, 78]; // Blue Line (Top / Above Red)

  const maxValue = 80; // Scale up to 80L

  const chartWidth = 720;
  const chartHeight = 240;
  const left = 48;
  const right = 20;
  const top = 15;
  const bottom = 35;

  const plotWidth = chartWidth - left - right;
  const plotHeight = chartHeight - top - bottom;

  const x = (index) => left + (index * plotWidth) / (months.length - 1);
  const y = (value) => top + plotHeight - (value / maxValue) * plotHeight;

  const ipdPoints = ipdSales.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const opdPoints = opdSales.map((v, i) => `${x(i)},${y(v)}`).join(" ");

  // 1. Red Area Path (Base to Red Line)
  const ipdAreaPath = `M ${left},${top + plotHeight} L ${ipdPoints} L ${x(months.length - 1)},${top + plotHeight} Z`;

  // 2. Blue Area Path (Red Line to Blue Line)
  const opdAreaPath = `M ${ipdPoints} L ${opdSales
    .slice()
    .reverse()
    .map((v, i) => `${x(months.length - 1 - i)},${y(v)}`)
    .join(" L ")} Z`;

  // Math Grid generator
  const renderGrid = () => {
    const lines = [];
    for (let i = 0; i < months.length; i++) {
      lines.push(
        <line
          key={`grid-x-${i}`}
          x1={x(i)}
          x2={x(i)}
          y1={top}
          y2={top + plotHeight}
          stroke="#e5e7eb"
          strokeWidth="0.5"
        />,
      );
    }
    for (let v = 0; v <= maxValue; v += 10) {
      lines.push(
        <line
          key={`grid-y-${v}`}
          x1={left}
          x2={chartWidth - right}
          y1={y(v)}
          y2={y(v)}
          stroke="#e5e7eb"
          strokeWidth="0.5"
        />,
      );
    }
    for (let i = 0; i <= (months.length - 1) * 2; i++) {
      lines.push(
        <line
          key={`minor-x-${i}`}
          x1={left + (i * plotWidth) / ((months.length - 1) * 2)}
          x2={left + (i * plotWidth) / ((months.length - 1) * 2)}
          y1={top}
          y2={top + plotHeight}
          stroke="#f3f4f6"
          strokeWidth="0.25"
        />,
      );
    }
    for (let v = 0; v <= maxValue; v += 2.5) {
      lines.push(
        <line
          key={`minor-y-${v}`}
          x1={left}
          x2={chartWidth - right}
          y1={y(v)}
          y2={y(v)}
          stroke="#f3f4f6"
          strokeWidth="0.25"
        />,
      );
    }
    return lines;
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800 flex items-center">
          <TrendingUp size={17} className="text-blue-600 mr-2" />
          OPD vs IPD Pharmacy Sales Trend
        </h3>
      </div>

      {/* Chart Container */}
      <div className="relative w-full h-56 flex items-center justify-center">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          {/* ================= MATH GRID ================= */}
          {renderGrid()}

          {/* ================= GRID AXIS LINES ================= */}
          {[0, 20, 40, 60, 80].map((value) => (
            <g key={value}>
              <line
                x1={left}
                x2={chartWidth - right}
                y1={y(value)}
                y2={y(value)}
                stroke="#d1d5db"
                strokeWidth="1"
              />
              <text
                x={left - 20}
                y={y(value) + 4}
                textAnchor="end"
                fontSize="13"
                fill="#6b7280"
                fontWeight="500"
              >
                {value === 0 ? "0" : `${value} L`}
              </text>
            </g>
          ))}

          {/* ================= AREA SPREADS ================= */}
          {/* Red Area (Base to Red Line) */}
          <path d={ipdAreaPath} fill="#f43f5e" fillOpacity="0.15" />
          {/* Blue Area (Red Line to Blue Line) */}
          <path d={opdAreaPath} fill="#2563eb" fillOpacity="0.15" />

          {/* ================= IPD SALES LINE (Red - Bottom) ================= */}
          <polyline
            points={ipdPoints}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {ipdSales.map((value, index) => (
            <circle
              key={`ipd-dot-${index}`}
              cx={x(index)}
              cy={y(value)}
              r="3.5"
              fill="#f43f5e"
              stroke="red"
              strokeWidth="3"
            />
          ))}

          {/* ================= OPD SALES LINE (Blue - Top) ================= */}
          <polyline
            points={opdPoints}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {opdSales.map((value, index) => (
            <circle
              key={`opd-dot-${index}`}
              cx={x(index)}
              cy={y(value)}
              r="3.5"
              fill="#2563eb"
              stroke="blue"
              strokeWidth="3"
            />
          ))}

          {/* ================= MONTH LABELS ================= */}
          {months.map((month, index) => (
            <text
              key={month}
              x={x(index)}
              y={chartHeight - 8}
              textAnchor="middle"
              fontSize="13"
              fontWeight="600"
              fill="#6b7280"
            >
              {month}
            </text>
          ))}
        </svg>
      </div>

      {/* ================= LEGEND ================= */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-2 border-t border-gray-100 text-xs font-semibold">
        <span className="flex items-center text-gray-600">
          <span className="relative w-5 h-3 mr-1.5 flex items-center shrink-0">
            <span className="absolute left-0 right-0 h-[2.5px] bg-blue-600 rounded-full" />
            <span className="absolute left-[7px] w-2 h-2 bg-blue-600 rounded-full" />
          </span>
          OPD Sales
        </span>

        <span className="flex items-center text-gray-600">
          <span className="relative w-5 h-3 mr-1.5 flex items-center shrink-0">
            <span className="absolute left-0 right-0 h-[2.5px] bg-rose-500 rounded-full" />
            <span className="absolute left-[7px] w-2 h-2 bg-rose-500 rounded-full" />
          </span>
          IPD Sales
        </span>
      </div>
    </div>
  );
}
