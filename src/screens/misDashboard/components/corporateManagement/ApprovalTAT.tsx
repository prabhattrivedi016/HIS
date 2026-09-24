import { Clock, ChevronDown } from "lucide-react";

export default function ApprovalTAT() {
  const tatData = [
    {
      label: "Cashless Approval",
      val: "28 Hrs",
      numericVal: 28,
    },
    {
      label: "Reimbursement",
      val: "72 Hrs",
      numericVal: 72,
    },
    {
      label: "Pre-Authorization",
      val: "6.4 Hrs",
      numericVal: 6.4,
    },
    {
      label: "Final Settlement",
      val: "36.4 Hrs",
      numericVal: 36.4,
    },
  ];

  const maxValue = 28; // Scale max limit set to 28

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-2xs flex flex-col justify-between w-full">
      {/* Header & Dropdown */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800 flex items-center">
          <Clock size={17} className="text-blue-600 mr-2" />
          Approval Turn Around Time (TAT)
        </h3>

        {/* Monthly Select Dropdown */}
        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-gray-600 shrink-0 cursor-pointer hover:bg-gray-100 transition-colors">
          <span>This Month</span>
          <ChevronDown size={13} className="ml-1 text-gray-400" />
        </div>
      </div>

      {/* Main Chart Container with Y-Axis and Grid */}
      <div className="flex items-stretch h-30 mt-2">
        {/* Left Y-Axis Labels with Proper Gap */}
        <div className="flex flex-col justify-between text-[11px] font-semibold text-gray-500 pr-3 pb-6 text-right select-none w-8 shrink-0">
          <span>28</span>
          <span>14</span>
          <span>0</span>
        </div>

        {/* Plot Area */}
        <div className="relative flex-1 border-l border-b border-gray-300 flex items-end justify-around px-4 pb-1">
          {/* Background Grid Lines behind bars */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none px-4 py-1">
            <div className="w-full border-b border-gray-100 border-dashed" />
            <div className="w-full border-b border-gray-100 border-dashed" />
            <div className="w-full border-b border-gray-100 border-dashed" />
            <div className="w-full border-b border-gray-100 border-dashed" />
            <div className="w-full border-b border-transparent" />
          </div>

          {/* Blue Bars */}
          {tatData.map((item) => {
            const heightPct = `${Math.min((item.numericVal / maxValue) * 100, 100)}%`;
            return (
              <div
                key={item.label}
                className="relative z-10 flex flex-col items-center flex-1 h-full justify-end group min-w-[60px] mx-1"
              >
                <span className="text-[10px] sm:text-[11px] font-bold text-gray-700 mb-1.5 whitespace-nowrap">
                  {item.val}
                </span>
                <div
                  style={{ height: heightPct }}
                  className="w-8 sm:w-11 rounded-t-md bg-blue-500 transition-all group-hover:opacity-90 shadow-xs"
                />
                <span className="absolute -bottom-7 text-[9px] sm:text-[10px] font-semibold text-gray-500 whitespace-nowrap text-center leading-tight">
                  {item.label.split(" ").map((word, i) => (
                    <span key={i} className="block">
                      {word}
                    </span>
                  ))}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spacing for X-axis labels */}
      <div className="h-6" />
    </div>
  );
}
