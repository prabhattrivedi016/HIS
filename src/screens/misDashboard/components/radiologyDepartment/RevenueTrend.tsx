import { BarChart2, ChevronDown } from "lucide-react";

export default function RevenueTrendChart() {
  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];

  // Values scaled up to 10L max scale (preserving exact visual proportions)
  const sales = [3.0, 4.4, 5.6, 7.0, 8.2, 9.2];
  const collection = [3.6, 5.0, 6.4, 7.8, 8.8, 9.8];

  const maxValue = 10; // Scale up to 10L

  const chartWidth = 740;
  const chartHeight = 240;
  const left = 65;
  const right = 25;
  const top = 15;
  const bottom = 35;

  const plotWidth = chartWidth - left - right;
  const plotHeight = chartHeight - top - bottom;

  const x = (index) => left + (index * plotWidth) / (months.length - 1);
  const y = (value) => top + plotHeight - (value / maxValue) * plotHeight;

  const collectionPoints = collection
    .map((value, index) => `${x(index)},${y(value)}`)
    .join(" ");

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-2xs flex flex-col justify-between w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-2 min-w-0">
        <h3 className="text-xs sm:text-sm font-bold text-gray-800 flex items-center min-w-0 truncate">
          <BarChart2 size={17} className="text-blue-600 mr-2 shrink-0" />
          <span className="truncate">Revenue Trend (Last 6 Months)</span>
        </h3>

        {/* Monthly Select Dropdown */}
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
          {/* ================= LEFT Y-AXIS GRID & LABELS ================= */}
          {[0, 2, 4, 6, 8, 10].map((value) => (
            <g key={`y-${value}`}>
              <line
                x1={left}
                x2={chartWidth - right}
                y1={y(value)}
                y2={y(value)}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x={left - 22}
                y={y(value) + 4}
                textAnchor="end"
                fontSize="13"
                fill="#6b7280"
                fontWeight="500"
              >
                {value === 0 ? "0" : `${value}L`}
              </text>
            </g>
          ))}

          {/* ================= BARS (Sales) ================= */}
          {sales.map((value, index) => {
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
                fill="#2563eb"
                className="transition-all duration-200 hover:opacity-80"
              />
            );
          })}

          {/* ================= COLLECTION LINE (Green above bars with dots) ================= */}
          <polyline
            points={collectionPoints}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {collection.map((value, index) => (
            <circle
              key={`dot-${index}`}
              cx={x(index)}
              cy={y(value)}
              r="3.5"
              fill="#10b981"
              stroke="#10b981"
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
      <div className="flex items-center justify-center gap-6 mt-4 pt-2 border-t border-gray-100 text-xs font-semibold flex-wrap">
        <span className="flex items-center text-gray-600">
          <span className="w-3 h-3 bg-blue-600 rounded-sm mr-1.5 shrink-0" />
          Sales
        </span>

        <span className="flex items-center text-gray-600">
          <span className="relative w-5 h-3 mr-1.5 flex items-center shrink-0">
            <span className="absolute left-0 right-0 h-[2.5px] bg-emerald-500 rounded-full" />
            <span className="absolute left-[7px] w-2 h-2 bg-emerald-500 rounded-full" />
          </span>
          Collection
        </span>
      </div>
    </div>
  );
}
