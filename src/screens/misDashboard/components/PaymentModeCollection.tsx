export default function PaymentModeCollection() {
  const paymentModes = [
    { label: "Cash", pct: "28%", val: "₹ 97,65,062", color: "bg-blue-600" },
    {
      label: "UPI / Digital",
      pct: "22%",
      val: "₹ 76,72,548",
      color: "bg-teal-500",
    },
    { label: "Card", pct: "18%", val: "₹ 62,77,540", color: "bg-amber-400" },
    {
      label: "Insurance / TPA",
      pct: "24%",
      val: "₹ 83,70,053",
      color: "bg-purple-600",
    },
    { label: "Corporate", pct: "6%", val: "₹ 20,92,513", color: "bg-pink-500" },
    { label: "Others", pct: "2%", val: "₹ 6,97,504", color: "bg-gray-400" },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-2xs flex flex-col justify-between">
      <h3 className="text-sm font-bold text-gray-800 mb-4">
        Payment Mode Wise Collection (MTD)
      </h3>

      <div className="flex flex-col sm:flex-row items-center justify-between my-auto gap-4 sm:gap-0">
        {/* Large Donut Chart Representation */}
        <div className="relative w-36 h-36 rounded-full p-6 flex flex-col items-center justify-center text-center shadow-xs shrink-0 bg-[conic-gradient(#2563eb_0deg_100deg,#14b8a6_100deg_180deg,#fbbf24_180deg_245deg,#9333ea_245deg_330deg,#ec4899_330deg_355deg,#94a3b8_355deg_360deg)]">
          <div className="w-full h-full bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
            <span className="text-[11px] font-black text-gray-900 leading-tight">
              ₹ 3,48,75,220
            </span>
            <span className="text-[9px] text-gray-400 font-medium mt-0.5">
              Total Collection
            </span>
          </div>
        </div>

        {/* Payment Modes List with Percentages */}
        <div className="space-y-2 text-xs flex-1 w-full sm:w-auto ml-0 sm:ml-10">
          {paymentModes.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between text-[11px]"
            >
              <span className="flex items-center text-gray-600 font-semibold truncate max-w-[120px] sm:max-w-[100px]">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${item.color} mr-2 shrink-0`}
                />
                {item.label}
              </span>

              <div className="flex items-center space-x-4 sm:space-x-8">
                <span className="text-gray-400 font-medium text-[13px]">
                  {item.pct}
                </span>
                <span className="font-extrabold text-gray-900 whitespace-nowrap">
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
