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

  // Revenue values in Lakhs (matching up to 60L scale)
  const revenue = [15, 22, 28, 32, 38, 42, 45, 48, 58];
  // Number of Tests corresponding to months
  const tests = [400, 600, 850, 950, 1100, 1250, 1350, 1420, 1650];

  const maxRevenue = 60; // in Lakhs
  const maxTests = 2000;

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

  const yRevenue = (value) =>
    top + plotHeight - (value / maxRevenue) * plotHeight;
  const yTests = (value) => top + plotHeight - (value / maxTests) * plotHeight;

  const testPoints = tests
    .map((value, index) => `${x(index)},${yTests(value)}`)
    .join(" ");

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-2xs flex flex-col justify-between w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-2 min-w-0">
        <h3 className="text-xs sm:text-sm font-bold text-gray-800 flex items-center min-w-0 truncate">
          <BarChart2 size={17} className="text-blue-600 mr-2 shrink-0" />
          <span className="truncate">Monthly Lab Revenue & Tests Trend</span>
        </h3>
      </div>

      {/* Chart container - Fully responsive with horizontal scroll safety for small screens */}
      <div className="relative w-full h-56 flex items-center justify-center overflow-x-auto sm:overflow-visible ">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full min-w-[520px] sm:min-w-0 overflow-visible"
          preserveAspectRatio="none"
        >
          {/* ================= LEFT Y-AXIS GRID & LABELS (Revenue in Lakhs) ================= */}
          {[0, 15, 30, 45, 60].map((value) => (
            <g key={`rev-${value}`}>
              <line
                x1={left}
                x2={chartWidth - right}
                y1={yRevenue(value)}
                y2={yRevenue(value)}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x={left - 24}
                y={yRevenue(value) + 4}
                textAnchor="end"
                fontSize="14"
                fill="#6b7280"
                fontWeight="500"
                padding="2"
              >
                {value === 0 ? "0" : `${value} L`}
              </text>
            </g>
          ))}

          {/* ================= RIGHT Y-AXIS LABELS (No. of Tests) ================= */}
          {[0, 500, 1000, 1500, 2000].map((value) => (
            <text
              key={`test-${value}`}
              x={chartWidth - right + 22}
              y={yTests(value) + 4}
              textAnchor="start"
              fontSize="14"
              fill="#6b7280"
              fontWeight="500"
            >
              {value === 0 ? "0" : value}
            </text>
          ))}

          {/* ================= BARS (Revenue) ================= */}
          {revenue.map((value, index) => {
            const barWidth = 26;
            const barX = x(index) - barWidth / 2;
            const barY = yRevenue(value);
            const barHeight = yRevenue(0) - barY;

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

          {/* ================= TESTS LINE ================= */}
          <polyline
            points={testPoints}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Test dots */}
          {tests.map((value, index) => (
            <circle
              key={`dot-${index}`}
              cx={x(index)}
              cy={yTests(value)}
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
          <span className="w-3 h-3 bg-blue-500 rounded-sm mr-1.5 shrink-0" />
          Revenue (₹)
        </span>

        <span className="flex items-center text-gray-600">
          <span className="relative w-5 h-3 mr-1.5 flex items-center shrink-0">
            <span className="absolute left-0 right-0 h-[2.5px] bg-emerald-500 rounded-full" />
            <span className="absolute left-[7px] w-2 h-2 bg-emerald-500 rounded-full" />
          </span>
          No. of Tests
        </span>
      </div>
    </div>
  );
}
