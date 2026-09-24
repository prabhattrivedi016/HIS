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

  // Sales values in Crores/Lakhs matching reference
  const sales = [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.3];
  // Collection values corresponding to months
  const collection = [0.3, 0.4, 0.5, 0.6, 0.7, 0.75, 0.85, 0.95, 1.15];

  const maxSales = 1.6; // in Cr scale
  const maxCollection = 1.6;

  // Chart dimensions with extra left padding for proper label spacing
  const chartWidth = 740;
  const chartHeight = 240;
  const left = 50;
  const right = 45;
  const top = 15;
  const bottom = 35;

  const plotWidth = chartWidth - left - right;
  const plotHeight = chartHeight - top - bottom;

  const x = (index) => left + (index * plotWidth) / (months.length - 1);

  const ySales = (value) =>
    top + plotHeight - (value / maxSales) * plotHeight;
  const yCollection = (value) => top + plotHeight - (value / maxCollection) * plotHeight;

  const collectionPoints = collection
    .map((value, index) => `${x(index)},${yCollection(value)}`)
    .join(" ");

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-2xs flex flex-col justify-between w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-2 min-w-0">
        <h3 className="text-xs sm:text-sm font-bold text-gray-800 flex items-center min-w-0 truncate">
          <BarChart2 size={17} className="text-blue-600 mr-2 shrink-0" />
          <span className="truncate">Monthly Pharmacy Sales Trend</span>
        </h3>
      </div>

      {/* Chart container - Fully responsive with horizontal scroll safety for small screens */}
      <div className="relative w-full h-56 flex items-center justify-center overflow-x-auto sm:overflow-visible ">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full min-w-[520px] sm:min-w-0 overflow-visible"
          preserveAspectRatio="none"
        >
          {/* ================= LEFT Y-AXIS GRID & LABELS (Sales in Cr) ================= */}
          {[0, 0.4, 0.8, 1.2, 1.6].map((value) => (
            <g key={`sales-${value}`}>
              <line
                x1={left}
                x2={chartWidth - right}
                y1={ySales(value)}
                y2={ySales(value)}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x={left - 24}
                y={ySales(value) + 4}
                textAnchor="end"
                fontSize="14"
                fill="#6b7280"
                fontWeight="500"
              >
                {value === 0 ? "0" : `${value} Cr`}
              </text>
            </g>
          ))}

          {/* ================= BARS (Sales) ================= */}
          {sales.map((value, index) => {
            const barWidth = 26;
            const barX = x(index) - barWidth / 2;
            const barY = ySales(value);
            const barHeight = ySales(0) - barY;

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

          {/* ================= COLLECTION LINE ================= */}
          <polyline
            points={collectionPoints}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Collection dots */}
          {collection.map((value, index) => (
            <circle
              key={`dot-${index}`}
              cx={x(index)}
              cy={yCollection(value)}
              r="3.5"
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
              fontSize="14"
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