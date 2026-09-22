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

  // Values in Crores
  const revenue = [1.8, 2.3, 2.6, 2.8, 3.1, 3.4, 3.7, 4.0, 4.6];
  const expenses = [1.2, 1.5, 1.9, 2.1, 2.3, 2.4, 2.7, 2.9, 3.2];

  const maxValue = 5;

  // Chart dimensions matching RevenueTrendChart for exact uniform look
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

  const revenuePoints = revenue
    .map((value, index) => `${x(index)},${y(value)}`)
    .join(" ");

  const expensePoints = expenses
    .map((value, index) => `${x(index)},${y(value)}`)
    .join(" ");

  // Closed path for soft area fill under expense curve matching reference screenshot style
  const expenseAreaPath = `M ${left} ${top + plotHeight} L ${expensePoints} L ${x(months.length - 1)} ${top + plotHeight} Z`;

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800 flex items-center">
          <TrendingUp size={17} className="text-indigo-600 mr-2" />
          Revenue vs Expense
        </h3>
        <span className="text-xs text-gray-400 font-medium">Comparison</span>
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

          {/* ================= GRID ================= */}
          {[0, 1, 2, 3, 4, 5].map((value) => (
            <g key={value}>
              <line
                x1={left}
                x2={chartWidth - right}
                y1={y(value)}
                y2={y(value)}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
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

          {/* Soft Expense Area Gradient Fill */}
          <path d={expenseAreaPath} fill="url(#expenseGrad)" />

          {/* ================= EXPENSE LINE ================= */}
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
              r="3.5"
              fill="#f43f5e"
              stroke="white"
              strokeWidth="2"
            />
          ))}

          {/* ================= REVENUE LINE ================= */}
          <polyline
            points={revenuePoints}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {revenue.map((value, index) => (
            <circle
              key={`rev-dot-${index}`}
              cx={x(index)}
              cy={y(value)}
              r="3.5"
              fill="#3b82f6"
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
          <span className="w-3 h-3 bg-rose-500 rounded-sm mr-1.5" />
          Expenses
        </span>
      </div>
    </div>
  );
}
