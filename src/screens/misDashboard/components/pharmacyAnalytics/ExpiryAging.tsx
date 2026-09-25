import { Clock } from "lucide-react";

export default function ExpiryAging() {
  const expiryData = [
    {
      label: "0-30 Days",
      amt: "1,420",
      height: "71%",
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
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-2xs w-full">
      {/* Header */}
      <h3 className="text-sm font-bold text-gray-800 flex items-center">
        <Clock size={17} className="text-blue-600 mr-2 shrink-0" />
        Expiry Aging
      </h3>

      {/* Chart wrapper */}
      <div className="flex items-start w-full mt-36">
        {/* Y-Axis */}
        <div className="flex flex-col justify-between text-[9px] text-gray-400 font-semibold pr-2 text-right select-none shrink-0 h-44">
          {yAxisLabels.map((label, idx) => (
            <span key={idx} className="leading-none">
              {label}
            </span>
          ))}
        </div>

        {/* Chart + X Axis */}
        <div className="flex-1 min-w-0">
          {/* Main Chart */}
          <div className="relative h-44 border-l border-b border-gray-200 px-2">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none px-2 py-3">
              <div className="w-full border-b border-gray-100 border-dashed" />
              <div className="w-full border-b border-gray-100 border-dashed" />
              <div className="w-full border-b border-gray-100 border-dashed" />
              <div className="w-full border-b border-gray-100 border-dashed" />
            </div>

            {/* Bars */}
            <div className="relative z-10 h-full flex items-end justify-between gap-2 sm:gap-3">
              {expiryData.map(item => (
                <div
                  key={item.label}
                  className="flex-1 h-full flex flex-col justify-end items-center min-w-0 group"
                >
                  {/* Amount */}
                  <span className="text-[10px] sm:text-[11px] font-bold text-gray-700 mb-1 whitespace-nowrap">
                    {item.amt}
                  </span>

                  {/* Bar */}
                  <div
                    style={{ height: item.height }}
                    className={`
                      w-full
                      max-w-[55px]
                      rounded-t-md
                      ${item.color}
                      transition-all
                      duration-200
                      group-hover:opacity-90
                    `}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* X-Axis Labels */}
          <div className="flex justify-between gap-2 sm:gap-3 px-0.5 pt-2">
            {expiryData.map(item => (
              <div key={item.label} className="flex-1 min-w-0 text-center">
                <span className="text-[9px] sm:text-[10px] font-semibold text-gray-500 whitespace-nowrap">
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
    </div>
  );
}
