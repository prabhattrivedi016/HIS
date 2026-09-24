import { Clock } from "lucide-react";

export default function ExpiryAging() {
  const expiryData = [
    {
      label: "0-30 Days",
      amt: "1,420",
      height: "71%", // Scaled relative to max 2.0K (2000)
      color: "bg-emerald-500",
    },
    {
      label: "31-60 Days",
      amt: "980",
      height: "49%",
      color: "bg-amber-400",
    },
    {
      label: "61-90 Days",
      amt: "760",
      height: "38%",
      color: "bg-rose-500",
    },
    {
      label: "91-180 Days",
      amt: "620",
      height: "31%",
      color: "bg-purple-600",
    },
    {
      label: ">180 Days",
      amt: "410",
      height: "20.5%",
      color: "bg-blue-600",
    },
  ];

  const yAxisLabels = ["2.0 K", "1.5 K", "1.0 K", "0.5 K", "0"];

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-2xs flex flex-col justify-between w-full">
      <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center">
        <Clock size={17} className="text-blue-600 mr-2 shrink-0" />
        Expiry Aging
      </h3>

      <div className="flex items-stretch w-full">
        {/* Y-Axis Labels Column */}
        <div className="flex flex-col justify-between text-[9px] text-gray-400 font-semibold pr-2 pb-6 text-right select-none shrink-0">
          {yAxisLabels.map((label, idx) => (
            <span key={idx} className="leading-none">
              {label}
            </span>
          ))}
        </div>

        {/* Main Chart Area */}
        <div className="relative flex-1 h-44 flex items-center sm:items-end justify-between space-x-1 sm:space-x-2 pt-2 pb-1 px-1 sm:px-2 border-l border-b border-gray-200 overflow-x-auto sm:overflow-visible">
          {/* Background Grid Lines behind bars */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none px-2 py-3 z-0">
            <div className="w-full border-b border-gray-100 border-dashed" />
            <div className="w-full border-b border-gray-100 border-dashed" />
            <div className="w-full border-b border-gray-100 border-dashed" />
            <div className="w-full border-b border-gray-100 border-dashed" />
          </div>

          {expiryData.map(item => (
            <div
              key={item.label}
              className="relative z-10 flex flex-col items-center flex-1 h-full justify-end group min-w-[50px] sm:min-w-0"
            >
              <span className="text-[10px] sm:text-[11px] md:text-[12px] font-bold text-gray-700 mb-1 whitespace-nowrap">
                {item.amt}
              </span>
              <div
                style={{ height: item.height }}
                className={`w-7 sm:w-9 md:w-11 rounded-t-sm ${item.color} transition-all group-hover:opacity-90`}
              />
              <span className="text-[9px] sm:text-[10px] font-semibold text-gray-500 mt-2 whitespace-nowrap text-center leading-tight">
                {item.label.split(" ").map((word, i) => (
                  <span key={i} className="block">
                    {word}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
