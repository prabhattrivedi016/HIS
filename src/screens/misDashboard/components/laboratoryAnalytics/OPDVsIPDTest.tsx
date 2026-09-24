import { BarChart2 } from "lucide-react";

export default function RevenueTrendChart() {
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

  // OPD and IPD test count values
  const opdTests = [320, 450, 600, 720, 890, 980, 1100, 1200, 1380];
  const ipdTests = [540, 720, 950, 1100, 1280, 1420, 1550, 1680, 1920];

  const maxValue = 3500; // Combined max scale for stacked bars

  // Chart dimensions with proper left padding for Y-axis numbers
  const chartWidth = 740;
  const chartHeight = 240;
  const left = 60;
  const right = 25;
  const top = 15;
  const bottom = 35;

  const plotWidth = chartWidth - left - right;
  const plotHeight = chartHeight - top - bottom;

  const x = (index) => left + (index * plotWidth) / (months.length - 1);
  const y = (value) => top + plotHeight - (value / maxValue) * plotHeight;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-2xs flex flex-col justify-between w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-2 min-w-0">
        <h3 className="text-xs sm:text-sm font-bold text-gray-800 flex items-center min-w-0 truncate">
          <BarChart2 size={17} className="text-blue-600 mr-2 shrink-0" />
          <span className="truncate">OPD vs IPD Tests Trend</span>
        </h3>
      </div>

      {/* Chart container - Fully responsive with horizontal scroll safety for small screens */}
      <div className="relative w-full h-56 flex items-center justify-center overflow-x-auto sm:overflow-visible">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full min-w-[520px] sm:min-w-0 overflow-visible"
          preserveAspectRatio="none"
        >
          {/* ================= MATH STYLE FULL GRID (Vertical & Horizontal Lines) ================= */}

          {/* Vertical Grid Lines */}
          {months.map((_, index) => (
            <line
              key={`v-grid-${index}`}
              x1={x(index)}
              x2={x(index)}
              y1={top}
              y2={top + plotHeight}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
          ))}

          {/* Horizontal Grid Lines & Left Y-Axis Labels (0, 1000, 2000, 3000) */}
          {[0, 1000, 2000, 3000].map((value) => (
            <g key={`grid-${value}`}>
              <line
                x1={left}
                x2={chartWidth - right}
                y1={y(value)}
                y2={y(value)}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray={value === 0 ? "0" : "3,3"}
              />
              <text
                x={left - 22}
                y={y(value) + 4}
                textAnchor="end"
                fontSize="13"
                fill="#6b7280"
                fontWeight="500"
              >
                {value === 0 ? "0" : value.toLocaleString()}
              </text>
            </g>
          ))}

          {/* ================= STACKED BARS (OPD + IPD combined into single bar) ================= */}
          {months.map((month, index) => {
            const barX = x(index) - 10;
            const barWidth = 30;

            const opdVal = opdTests[index];
            const ipdVal = ipdTests[index];
            const totalVal = opdVal + ipdVal;

            const baseY = y(0);
            const opdY = y(opdVal);
            const totalY = y(totalVal);

            // Seamless adjacent stack coordinates calculation
            const opdHeight = baseY - opdY;
            const ipdHeight = opdY - totalY;

            return (
              <g key={month}>
                {/* Bottom Segment: OPD Tests (Emerald/Green) */}
                <rect
                  x={barX}
                  y={opdY}
                  width={barWidth}
                  height={opdHeight}
                  fill="#10b981"
                  className="transition-all duration-200 hover:opacity-80"
                />

                {/* Top Segment: IPD Tests (Blue) stacked directly over OPD */}
                <rect
                  x={barX}
                  y={totalY}
                  width={barWidth}
                  height={ipdHeight}
                  fill="#3b82f6"
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
      <div className="flex items-center justify-center gap-6 mt-4 pt-2 border-t border-gray-100 text-xs font-semibold flex-wrap">
        <span className="flex items-center text-gray-600">
          <span className="w-3 h-3 bg-emerald-500 rounded-sm mr-1.5 shrink-0" />
          OPD Tests
        </span>

        <span className="flex items-center text-gray-600">
          <span className="w-3 h-3 bg-blue-500 rounded-sm mr-1.5 shrink-0" />
          IPD Tests
        </span>
      </div>
    </div>
  );
}
