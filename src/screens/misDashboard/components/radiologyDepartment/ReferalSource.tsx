import { ChevronDown, Share2 } from "lucide-react";

export default function ReferralSource() {
  const referralSources = [
    { label: "OPD", pct: "42%", val: "1,195", color: "bg-blue-600" },
    { label: "IPD", pct: "34%", val: "967", color: "bg-teal-500" },
    { label: "External Doctor", pct: "12%", val: "341", color: "bg-amber-400" },
    { label: "Corporate / TPA", pct: "7%", val: "199", color: "bg-purple-600" },
    { label: "Health Checkup", pct: "4%", val: "114", color: "bg-pink-500" },
    { label: "Others", pct: "1%", val: "30", color: "bg-gray-400" },
  ];

  // Mapping Tailwind color classes to hex values for dynamic conic-gradient calculation
  const colorMap = {
    "bg-blue-600": "#2563eb",
    "bg-teal-500": "#14b8a6",
    "bg-amber-400": "#fbbf24",
    "bg-purple-600": "#9333ea",
    "bg-pink-500": "#ec4899",
    "bg-gray-400": "#94a3b8",
  };

  // Dynamically calculating angles based on 'pct' values
  let currentDeg = 0;
  const gradientStops = referralSources
    .map(item => {
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
      {/* Header & Dropdown */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800 flex items-center">
          <Share2 size={17} className="text-blue-600 mr-2 shrink-0" />
          Referrals Source (MTD)
        </h3>

        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-gray-600 shrink-0 cursor-pointer hover:bg-gray-100 transition-colors">
          <span>This Month</span>
          <ChevronDown size={13} className="ml-1 text-gray-400" />
        </div>
      </div>

      <div className="flex flex-col sm:flex mb-2 items-center justify-between my-auto gap-4 sm:gap-0">
        {/* Large Donut Chart Representation with Dynamic Conic Gradient */}
        <div
          className="relative w-30 h-30 rounded-full p-6 flex flex-col items-center justify-center text-center shadow-xs shrink-0"
          style={dynamicConicStyle}
        >
          <div className="w-full h-full bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
            <span className="text-[12px] font-black text-gray-900 leading-tight">2,846</span>
            <span className="text-[9px] text-gray-400 font-medium mt-0.5">Investigations</span>
          </div>
        </div>

        {/* Referral Source List with Percentages & Counts */}
        <div className="space-y-1.5 text-xs flex-1 w-full sm:w-auto ml-0 sm:ml-6">
          {referralSources.map(item => (
            <div key={item.label} className="flex items-center justify-between text-[11px]">
              <span className="flex items-center text-gray-600 font-semibold truncate max-w-[120px]">
                <span className={`w-2.5 h-2.5 rounded-full ${item.color} mr-2 shrink-0`} />
                {item.label}
              </span>

              <div className="flex items-center space-x-3 sm:space-x-5">
                <span className="text-gray-400 font-medium text-[11px] w-8 text-right">
                  {item.pct}
                </span>
                <span className="font-extrabold text-gray-900 w-10 text-right whitespace-nowrap">
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
