import { RotateCcw } from "lucide-react";

export default function PharmacyReturnChart() {
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

  // Values in Lakhs matching the 60L max scale from reference image
  const opdReturns = [15, 22, 18, 25, 30, 28, 35, 40, 45]; // Blue Bars
  const ipdReturns = [20, 18, 24, 32, 38, 35, 42, 48, 52]; // Red/Rose Bars
  const vendorReturns = [10, 15, 12, 18, 22, 20, 25, 30, 35]; // Amber/Yellow Bars

  const maxValue = 60; // Scale up to 60L

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
    for (let v = 0; v <= maxValue; v += 15) {
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
    for (let v = 0; v <= maxValue; v += 5) {
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
          <RotateCcw size={17} className="text-blue-600 mr-2" />
          Pharmacy Return Analysis
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

          {/* ================= GRID AXIS LABELS & LINES ================= */}
          {[0, 20, 40, 60].map((value) => (
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
                x={left - 26}
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

          {/* ================= GROUPED BARS ================= */}
          {months.map((month, index) => {
            const centerX = x(index);
            const barWidth = 12;
            const gap = 2;

            // 3 bars per month: OPD Return, IPD Return, Vendor Return
            const opdY = y(opdReturns[index]);
            const ipdY = y(ipdReturns[index]);
            const vendorY = y(vendorReturns[index]);

            const opdX = centerX - barWidth - gap;
            const ipdX = centerX;
            const vendorX = centerX + barWidth + gap;

            return (
              <g key={month}>
                {/* 1. OPD Return Bar (Blue) */}
                <rect
                  x={opdX - barWidth / 2}
                  y={opdY}
                  width={barWidth}
                  height={y(0) - opdY}
                  rx="2"
                  fill="#2563eb"
                  className="transition-all duration-200 hover:opacity-80"
                />

                {/* 2. IPD Return Bar (Red/Rose) */}
                <rect
                  x={ipdX - barWidth / 2}
                  y={ipdY}
                  width={barWidth}
                  height={y(0) - ipdY}
                  rx="2"
                  fill="#f43f5e"
                  className="transition-all duration-200 hover:opacity-80"
                />

                {/* 3. Vendor Return Bar (Amber/Yellow) */}
                <rect
                  x={vendorX - barWidth / 2}
                  y={vendorY}
                  width={barWidth}
                  height={y(0) - vendorY}
                  rx="2"
                  fill="#f59e0b"
                  className="transition-all duration-200 hover:opacity-80"
                />
              </g>
            );
          })}

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
          <span className="w-3 h-3 bg-blue-600 rounded-sm mr-1.5" />
          OPD Return
        </span>

        <span className="flex items-center text-gray-600">
          <span className="w-3 h-3 bg-rose-500 rounded-sm mr-1.5" />
          IPD Return
        </span>

        <span className="flex items-center text-gray-600">
          <span className="w-3 h-3 bg-amber-500 rounded-sm mr-1.5" />
          Vendor Return
        </span>
      </div>
    </div>
  );
}
