import { TrendingUp } from "lucide-react";

export default function RevenueVsExpenseChart() {
  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];

  // Values in Crores (Matched to 6 months: Apr to Sep)
  const revenue = [2.8, 3.1, 3.4, 3.7, 4.0, 4.6];
  const expenses = [2.1, 2.3, 2.4, 2.7, 2.9, 3.2];

  const maxValue = 5;

  // Chart dimensions with extra left padding for proper label spacing
  const chartWidth = 740;
  const chartHeight = 240;
  const left = 56;
  const right = 24;
  const top = 15;
  const bottom = 35;

  const plotWidth = chartWidth - left - right;
  const plotHeight = chartHeight - top - bottom;

  const x = (index) => left + (index * plotWidth) / (months.length - 1);
  const y = (value) => top + plotHeight - (value / maxValue) * plotHeight;

  const revenuePoints = revenue
    .map((value, index) => `${x(index)},${y(value)}`)
    .join(" ");

  const expensePoints = expenses
    .map((value, index) => `${x(index)},${y(value)}`)
    .join(" ");

  // Closed path for soft area fill under expense curve
  const expenseAreaPath = `M ${left} ${top + plotHeight} L ${expensePoints} L ${x(months.length - 1)} ${top + plotHeight} Z`;

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800 flex items-center">
          <TrendingUp size={17} className="text-indigo-600 mr-2" />
          Cash Flow Trend (Last 6 Months)
        </h3>
      </div>

      {/* Chart Container */}
      <div className="relative w-full h-56 flex items-center justify-center">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* ================= MATH STYLE FULL GRID (Horizontal & Vertical Lines) ================= */}

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

          {/* Horizontal Grid Lines & Properly Spaced Y-Axis Labels */}
          {[0, 1, 2, 3, 4, 5].map((value) => (
            <g key={value}>
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
                x={left - 14}
                y={y(value) + 4}
                textAnchor="end"
                fontSize="11"
                fill="#6b7280"
                fontWeight="600"
              >
                {value === 0 ? "0" : `${value} Cr`}
              </text>
            </g>
          ))}

          {/* Soft Expense Area Gradient Fill */}
          <path d={expenseAreaPath} fill="url(#expenseGrad)" />

          {/* ================= OUTFLOW (EXPENSES) LINE & DOTS ================= */}
          <polyline
            points={expensePoints}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {expenses.map((value, index) => (
            <circle
              key={`exp-dot-${index}`}
              cx={x(index)}
              cy={y(value)}
              r="4"
              fill="#f43f5e"
              stroke="white"
              strokeWidth="2"
            />
          ))}

          {/* ================= INFLOW (REVENUE) LINE & DOTS ================= */}
          <polyline
            points={revenuePoints}
            fill="none"
            stroke="#22c55e"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {revenue.map((value, index) => (
            <circle
              key={`rev-dot-${index}`}
              cx={x(index)}
              cy={y(value)}
              r="4"
              fill="#22c55e"
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
              fill="#4b5563"
            >
              {month}
            </text>
          ))}
        </svg>
      </div>

      {/* ================= LEGEND ================= */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-2 border-t border-gray-100 text-xs font-semibold">
        <span className="flex items-center text-gray-600">
          <span className="w-3 h-3 bg-green-500 rounded-sm mr-1.5" />
          Inflow
        </span>

        <span className="flex items-center text-gray-600">
          <span className="w-3 h-3 bg-rose-500 rounded-sm mr-1.5" />
          Outflow
        </span>
      </div>
    </div>
  );
}
