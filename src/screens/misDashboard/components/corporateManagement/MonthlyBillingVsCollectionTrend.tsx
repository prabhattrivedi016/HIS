import { BarChart2, ChevronDown } from "lucide-react";

export default function RevenueTrendChart() {
  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];

  // Billed, Received, and Pending Amount values in Crores (Cr) matching 0-4Cr scale
  const billedAmounts = [2.4, 3.1, 2.7, 3.4, 3.8, 3.5];
  const receivedAmounts = [1.8, 2.4, 2.1, 2.7, 3.0, 2.8];
  const pendingAmounts = [1.2, 1.5, 1.3, 1.6, 1.9, 1.7];

  const maxValue = 4; // Max scale for Cr (0 to 4Cr)

  // Chart dimensions with proper left padding for Y-axis numbers
  const chartWidth = 740;
  const chartHeight = 240;
  const left = 55;
  const right = 25;
  const top = 15;
  const bottom = 35;

  const plotWidth = chartWidth - left - right;
  const plotHeight = chartHeight - top - bottom;

  const x = (index) => left + (index * plotWidth) / (months.length - 1);
  const y = (value) => top + plotHeight - (value / maxValue) * plotHeight;

  // Generate dynamic SVG path points for the red pending line
  const pendingPoints = months
    .map((_, index) => `${x(index)},${y(pendingAmounts[index])}`)
    .join(" ");

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-2xs flex flex-col justify-between w-full">
      {/* Header & Dropdown */}
      <div className="flex items-center justify-between mb-4 gap-2 min-w-0">
        <h3 className="text-xs sm:text-sm font-bold text-gray-800 flex items-center min-w-0 truncate">
          <BarChart2 size={17} className="text-blue-600 mr-2 shrink-0" />
          <span className="truncate">Monthly Billing vs Collection Trend</span>
        </h3>

        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-gray-600 shrink-0 cursor-pointer hover:bg-gray-100 transition-colors">
          <span>Last 6 Months</span>
          <ChevronDown size={13} className="ml-1 text-gray-400" />
        </div>
      </div>

      {/* Chart container */}
      <div className="relative w-full h-56 flex items-center justify-center overflow-x-auto sm:overflow-visible">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full min-w-[520px] sm:min-w-0 overflow-visible"
          preserveAspectRatio="none"
        >
          {/* ================= MATH STYLE FULL GRID ================= */}

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

          {/* Horizontal Grid Lines & Left Y-Axis Labels (0, 1Cr, 2Cr, 3Cr, 4Cr) */}
          {[0, 1, 2, 3, 4].map((value) => (
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
                x={left - 24}
                y={y(value) + 4}
                textAnchor="end"
                fontSize="13"
                fill="#6b7280"
                fontWeight="500"
              >
                {value === 0 ? "0" : `${value}Cr`}
              </text>
            </g>
          ))}

          {/* ================= GROUPED BARS (Side-by-Side) ================= */}
          {months.map((month, index) => {
            const centerX = x(index);
            const barWidth = 14;
            const gap = 3;

            const billedVal = billedAmounts[index];
            const receivedVal = receivedAmounts[index];

            const billedY = y(billedVal);
            const receivedY = y(receivedVal);

            const billedX = centerX - barWidth - gap / 2;
            const receivedX = centerX + gap / 2;

            return (
              <g key={month}>
                {/* Billed Amount Bar (Blue) */}
                <rect
                  x={billedX}
                  y={billedY}
                  width={barWidth}
                  height={y(0) - billedY}
                  rx="3"
                  fill="#3b82f6"
                  className="transition-all duration-200 hover:opacity-80"
                />

                {/* Received Amount Bar (Green) */}
                <rect
                  x={receivedX}
                  y={receivedY}
                  width={barWidth}
                  height={y(0) - receivedY}
                  rx="3"
                  fill="#10b981"
                  className="transition-all duration-200 hover:opacity-80"
                />
              </g>
            );
          })}

          {/* ================= DYNAMIC RED PENDING AMOUNT LINE & DOTS ================= */}
          <polyline
            fill="none"
            stroke="#ef4444"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={pendingPoints}
          />

          {months.map((_, index) => (
            <circle
              key={`dot-${index}`}
              cx={x(index)}
              cy={y(pendingAmounts[index])}
              r="4.5"
              fill="red"
              stroke="#ef4444"
              strokeWidth="2.5"
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
      <div className="flex items-center justify-center gap-6 mt-4 pt-2 border-t border-gray-100 text-xs font-semibold flex-wrap">
        <span className="flex items-center text-gray-600">
          <span className="w-3 h-3 bg-blue-500 rounded-sm mr-1.5 shrink-0" />
          Billed Amount
        </span>

        <span className="flex items-center text-gray-600">
          <span className="w-3 h-3 bg-emerald-500 rounded-sm mr-1.5 shrink-0" />
          Received Amount
        </span>

        <span className="flex items-center text-gray-600">
          <span className="w-3 h-3 bg-red-500 rounded-full mr-1.5 shrink-0" />
          Pending Amount
        </span>
      </div>
    </div>
  );
}
