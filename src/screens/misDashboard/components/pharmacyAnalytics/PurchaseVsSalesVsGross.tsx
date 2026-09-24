import { TrendingUp } from "lucide-react";

export default function RevenueVsExpenseChart() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];

  // Values matching the 1.6 Cr max scale
  const grossProfit = [0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.75]; // Blue line (bottom)
  const purchase = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.4]; // Red line (middle)
  const sales = [0.6, 0.7, 0.85, 0.95, 1.05, 1.15, 1.25, 1.35, 1.5]; // Green line (top)

  const maxValue = 1.6; // Scale up to 1.6 Cr

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

  // Line points string
  const grossProfitPoints = grossProfit.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const purchasePoints = purchase.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const salesPoints = sales.map((v, i) => `${x(i)},${y(v)}`).join(" ");

  // Stacked Area Paths for Spreading
  // 1. Blue Area (0 to Gross Profit)
  const blueAreaPath = `M ${left},${top + plotHeight} L ${grossProfit.map((v, i) => `${x(i)},${y(v)}`).join(" L ")} L ${x(months.length - 1)},${top + plotHeight} Z`;

  // 2. Red Area (between Gross Profit and Purchase)
  const redAreaPath = `M ${purchase.map((v, i) => `${x(i)},${y(v)}`).join(" L ")} L ${grossProfit
    .slice()
    .reverse()
    .map((v, i) => `${x(months.length - 1 - i)},${y(v)}`)
    .join(" L ")} Z`;

  // 3. Green Area (between Purchase and Sales)
  const greenAreaPath = `M ${sales.map((v, i) => `${x(i)},${y(v)}`).join(" L ")} L ${purchase
    .slice()
    .reverse()
    .map((v, i) => `${x(months.length - 1 - i)},${y(v)}`)
    .join(" L ")} Z`;

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800 flex items-center">
          <TrendingUp size={17} className="text-blue-600 mr-2" />
          Purchase vs Sales vs Gross Profit Trend
        </h3>
      </div>

      {/* Chart Container */}
      <div className="relative w-full h-56 flex items-center justify-center">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          {/* ================= GRID ================= */}
          {[0, 0.4, 0.8, 1.2, 1.6].map(value => (
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
                x={left - 8}
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

          {/* ================= AREA SPREADS ================= */}
          <path d={blueAreaPath} fill="#3b82f6" fillOpacity="0.15" />
          <path d={redAreaPath} fill="#f43f5e" fillOpacity="0.15" />
          <path d={greenAreaPath} fill="#10b981" fillOpacity="0.15" />

          {/* ================= BLUE LINE (Gross Profit) ================= */}
          <polyline
            points={grossProfitPoints}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {grossProfit.map((value, index) => (
            <circle
              key={`gp-dot-${index}`}
              cx={x(index)}
              cy={y(value)}
              r="3.5"
              fill="#3b82f6"
              stroke="blue"
              strokeWidth="3"
            />
          ))}

          {/* ================= RED LINE (Purchase) ================= */}
          <polyline
            points={purchasePoints}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {purchase.map((value, index) => (
            <circle
              key={`purchase-dot-${index}`}
              cx={x(index)}
              cy={y(value)}
              r="3.5"
              fill="#f43f5e"
              stroke="red"
              strokeWidth="3"
            />
          ))}

          {/* ================= GREEN LINE (Sales) ================= */}
          <polyline
            points={salesPoints}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {sales.map((value, index) => (
            <circle
              key={`sales-dot-${index}`}
              cx={x(index)}
              cy={y(value)}
              r="3.5"
              fill="#10b981"
              stroke="green"
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
          <span className="relative w-5 h-3 mr-1.5 flex items-center shrink-0">
            <span className="absolute left-0 right-0 h-[2.5px] bg-blue-500 rounded-full" />
            <span className="absolute left-[7px] w-2 h-2 bg-blue-500 rounded-full" />
          </span>
          Gross Profit
        </span>

        <span className="flex items-center text-gray-600">
          <span className="relative w-5 h-3 mr-1.5 flex items-center shrink-0">
            <span className="absolute left-0 right-0 h-[2.5px] bg-rose-500 rounded-full" />
            <span className="absolute left-[7px] w-2 h-2 bg-rose-500 rounded-full" />
          </span>
          Purchase
        </span>

        <span className="flex items-center text-gray-600">
          <span className="relative w-5 h-3 mr-1.5 flex items-center shrink-0">
            <span className="absolute left-0 right-0 h-[2.5px] bg-emerald-500 rounded-full" />
            <span className="absolute left-[7px] w-2 h-2 bg-emerald-500 rounded-full" />
          </span>
          Sales
        </span>
      </div>
    </div>
  );
}
