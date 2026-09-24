import { FileText } from "lucide-react";

export default function ModalityWiseDistribution() {
  const modalityData = [
    { label: "X-Ray", pct: "28%", val: "796", color: "bg-blue-600" },
    { label: "Ultrasound", pct: "24%", val: "683", color: "bg-emerald-500" },
    { label: "CT Scan", pct: "18%", val: "512", color: "bg-amber-400" },
    { label: "MRI", pct: "14%", val: "398", color: "bg-purple-600" },
    { label: "Mammography", pct: "6%", val: "171", color: "bg-pink-500" },
    { label: "Fluoroscopy", pct: "4%", val: "114", color: "bg-teal-400" },
    { label: "DEXA", pct: "3%", val: "85", color: "bg-sky-400" },
    { label: "Others", pct: "3%", val: "87", color: "bg-gray-400" },
  ];

  // Mapping Tailwind color classes to hex values for dynamic conic-gradient calculation
  const colorMap = {
    "bg-blue-600": "#2563eb",
    "bg-emerald-500": "#10b981",
    "bg-amber-400": "#fbbf24",
    "bg-purple-600": "#9333ea",
    "bg-pink-500": "#ec4899",
    "bg-teal-400": "#2dd4bf",
    "bg-sky-400": "#38bdf8",
    "bg-gray-400": "#94a3b8",
  };

  // Dynamically calculating angles based on 'pct' values
  let currentDeg = 0;
  const gradientStops = modalityData
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
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-2xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800 flex items-center">
          <FileText size={17} className="text-blue-600 mr-2" />
          Modality Wise Distribution (MTD)
        </h3>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between my-auto gap-4 sm:gap-0">
        {/* Large Donut Chart Representation with Dynamic Conic Gradient */}
        <div
          className="relative w-36 h-36 rounded-full p-6 flex flex-col items-center justify-center text-center shadow-xs shrink-0"
          style={dynamicConicStyle}
        >
          <div className="w-full h-full bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
            <span className="text-[12px] font-black text-gray-900 leading-tight">
              2,846
            </span>
            <span className="text-[9px] text-gray-400 font-medium mt-0.5">
              Investigations
            </span>
          </div>
        </div>

        {/* Modality List with Percentages & Counts */}
        <div className="space-y-1.5 text-xs flex-1 w-full sm:w-auto ml-0 sm:ml-8">
          {modalityData.map((item) => (
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

              <div className="flex items-center space-x-3 sm:space-x-6">
                <span className="text-gray-400 font-medium text-[11px] w-8 text-right">
                  {item.pct}
                </span>
                <span className="font-extrabold text-gray-900 w-8 text-right whitespace-nowrap">
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
