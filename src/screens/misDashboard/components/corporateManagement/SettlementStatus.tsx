import { CheckCircle2 } from "lucide-react";

export default function SettlementStatus() {
  const settlementStatuses = [
    { label: "Settled", pct: "73%", val: "94,18,450", color: "bg-emerald-500" },
    { label: "Pending", pct: "22%", val: "28,64,800", color: "bg-amber-400" },
    { label: "Rejected", pct: "5%", val: "6,42,350", color: "bg-rose-500" },
  ];

  // Mapping Tailwind color classes to hex values for dynamic conic-gradient calculation
  const colorMap = {
    "bg-emerald-500": "#10b981",
    "bg-amber-400": "#fbbf24",
    "bg-rose-500": "#f43f5e",
  };

  // Dynamically calculating angles based on 'pct' values
  let currentDeg = 0;
  const gradientStops = settlementStatuses
    .map((item) => {
      const percentage = parseFloat(item.pct);
      const deg = (percentage / 100) * 360;
      const start = currentDeg;
      currentDeg += deg;
      const hexColor = colorMap[item.color] || "#94a3b8";
      return `${hexColor} ${start}deg ${currentDeg}deg`;
    })
    .join(", ");

  const dynamicConicStyle = {
    background: `conic-gradient(${gradientStops})`,
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-2xs flex flex-col justify-between w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800 flex items-center">
          <CheckCircle2 size={17} className="text-blue-600 mr-2" />
          Settlement Status (This Month)
        </h3>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between my-auto gap-4 sm:gap-0">
        {/* Large Donut Chart Representation with Dynamic Conic Gradient */}
        <div
          className="relative w-36 h-36 rounded-full p-6 flex flex-col items-center justify-center text-center shadow-xs shrink-0"
          style={dynamicConicStyle}
        >
          <div className="w-full h-full bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
            <span className="text-xs sm:text-sm font-black text-gray-900 leading-tight">
              ₹ 1,28,75,600
            </span>
            <span className="text-[9px] text-gray-400 font-medium mt-0.5">
              Total Billed
            </span>
          </div>
        </div>

        {/* Settlement Status List with Percentages & Amounts */}
        <div className="space-y-2.5 text-xs flex-1 w-full sm:w-auto ml-0 sm:ml-8">
          {settlementStatuses.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between text-[11px]"
            >
              <span className="flex items-center text-gray-600 font-semibold truncate max-w-[120px]">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${item.color} mr-2 shrink-0`}
                />
                {item.label}
              </span>

              <div className="flex items-center space-x-3 sm:space-x-4">
                <span className="text-gray-400 font-medium text-[11px] w-8 text-right">
                  {item.pct}
                </span>
                <span className="font-extrabold text-gray-900 w-24 text-right whitespace-nowrap">
                  {item.val}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
