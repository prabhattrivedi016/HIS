import { BarChart2 } from "lucide-react";

export default function RevenueTrendChart() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];

  // Values in Crores
  const revenue = [1.8, 2.3, 2.6, 2.8, 3.1, 3.4, 3.7, 4.0, 4.6];
  const collection = [1.5, 1.8, 2.0, 2.2, 2.5, 2.7, 3.0, 3.3, 3.8];

  const maxValue = 5;

  // Chart dimensions
  const chartWidth = 720;
  const chartHeight = 240;
  const left = 48;
  const right = 20;
  const top = 15;
  const bottom = 35;

  const plotWidth = chartWidth - left - right;
  const plotHeight = chartHeight - top - bottom;

  const x = index => left + (index * plotWidth) / (months.length - 1);

  const y = value => top + plotHeight - (value / maxValue) * plotHeight;

  const collectionPoints = collection.map((value, index) => `${x(index)},${y(value)}`).join(" ");

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800 flex items-center">
          <BarChart2 size={17} className="text-blue-600 mr-2" />
          Monthly Revenue Trend
        </h3>

        <span className="text-xs text-gray-400 font-medium">FY 2026-27</span>
      </div>

      {/* Chart container - Made larger and fully responsive */}
      <div className="relative w-full h-56 flex items-center justify-center">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          {/* ================= GRID ================= */}
          {[0, 1, 2, 3, 4, 5].map(value => (
            <g key={value}>
              {/* Horizontal grid */}
              <line
                x1={left}
                x2={chartWidth - right}
                y1={y(value)}
                y2={y(value)}
                stroke="#e5e7eb"
                strokeWidth="1"
              />

              {/* Y-axis labels */}
              <text
                x={left - 10}
                y={y(value) + 4}
                textAnchor="end"
                fontSize="11"
                fill="#6b7280"
                fontWeight="500"
              >
                {value === 0 ? "0" : `${value} Cr`}
              </text>
            </g>
          ))}

          {/* ================= BARS ================= */}
          {revenue.map((value, index) => {
            const barWidth = 32;
            const barX = x(index) - barWidth / 2;
            const barY = y(value);
            const barHeight = y(0) - barY;

            return (
              <rect
                key={months[index]}
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                rx="3"
                fill="#3b82f6"
                className="transition-all duration-200 hover:opacity-80"
              />
            );
          })}

          {/* ================= COLLECTION LINE ================= */}
          <polyline
            points={collectionPoints}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Collection dots */}
          {collection.map((value, index) => (
            <circle
              key={`dot-${index}`}
              cx={x(index)}
              cy={y(value)}
              r="4"
              fill="#10b981"
              stroke="white"
              strokeWidth="2"
            />
          ))}

          {/* ================= MONTH LABELS ================= */}
          {months.map((month, index) => (
            <text
              key={month}
              x={x(index)}
              y={chartHeight - 8}
              textAnchor="middle"
              fontSize="11"
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
          <span className="w-3 h-3 bg-blue-500 rounded-sm mr-1.5" />
          Revenue
        </span>

        <span className="flex items-center text-gray-600">
          <span className="relative w-5 h-3 mr-1.5 flex items-center">
            <span className="absolute left-0 right-0 h-[2.5px] bg-emerald-500 rounded-full" />
            <span className="absolute left-[7px] w-2 h-2 bg-emerald-500 rounded-full" />
          </span>
          Collection
        </span>
      </div>
    </div>
  );
}
