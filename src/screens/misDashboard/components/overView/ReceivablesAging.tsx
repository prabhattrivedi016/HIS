import {FileText} from 'lucide-react'

export default function ReceivablesAging() {
  const agingData = [
    {
      label: "0-30 Days",
      amt: "₹ 12.4L",
      height: "60%",
      color: "bg-emerald-500",
    },
    {
      label: "31-60 Days",
      amt: "₹ 18.6L",
      height: "20%",
      color: "bg-amber-500",
    },
    {
      label: "61-90 Days",
      amt: "₹ 16.5L",
      height: "80%",
      color: "bg-rose-500",
    },
    {
      label: "91-180 Days",
      amt: "₹ 9.2L",
      height: "45%",
      color: "bg-blue-500",
    },
    {
      label: ">180 Days",
      amt: "₹ 5.7L",
      height: "30%",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-2xs flex flex-col justify-between w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800 flex items-center">
          <FileText size={17} className="text-blue-600 mr-2" />
          Receivables Aging
        </h3>
      </div>

      <div className="relative h-44 flex items-center sm:items-end justify-between space-x-1 sm:space-x-2 pt-4 pb-1 px-1 sm:px-2 border-b border-gray-200 overflow-x-auto sm:overflow-visible">
        {/* Background Grid Lines behind bars */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none px-2 py-4">
          <div className="w-full border-b border-gray-100 border-dashed" />
          <div className="w-full border-b border-gray-100 border-dashed" />
          <div className="w-full border-b border-gray-100 border-dashed" />
        </div>

        {agingData.map((age) => (
          <div
            key={age.label}
            className="relative z-10 flex flex-col items-center flex-1 h-full justify-end group min-w-[50px] sm:min-w-0"
          >
            <span className="text-[10px] sm:text-[12px] md:text-[14px] font-bold text-gray-700 mb-1 whitespace-nowrap">
              {age.amt}
            </span>
            <div
              style={{ height: age.height }}
              className={`w-8 sm:w-10 md:w-12 rounded-t-sm ${age.color} transition-all group-hover:opacity-90`}
            />
            <span className="text-[9px] sm:text-[10px] font-semibold text-gray-500 mt-2 whitespace-nowrap text-center leading-tight">
              {age.label.split(" ").map((word, i) => (
                <span key={i} className="block">
                  {word}
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
