export default function ExpenseCategory() {
  const expenseCategories = [
    {
      label: "Medicine & Consumables",
      pct: "32%",
      color: "bg-blue-600",
    },
    {
      label: "Staff Salary",
      pct: "26%",
      color: "bg-emerald-500",
    },
    {
      label: "Utilities & Maintenance",
      pct: "18%",
      color: "bg-amber-400",
    },
    {
      label: "Equipment AMC",
      pct: "12%",
      color: "bg-purple-600",
    },
    {
      label: "Administration",
      pct: "8%",
      color: "bg-pink-500",
    },
    { label: "Others", pct: "4%", color: "bg-gray-400" },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-2xs flex flex-col justify-between">
      <h3 className="text-sm font-bold text-gray-800 mb-4">
        Expense Category (MTD)
      </h3>

      <div className="flex flex-col sm:flex-row items-center justify-between my-auto gap-4 sm:gap-0">
        {/* Large Donut Chart Representation */}
        <div className="relative w-36 h-36 rounded-full p-6 flex flex-col items-center justify-center text-center shadow-xs shrink-0 bg-[conic-gradient(#2563eb_0deg_115deg,#10b981_115deg_208deg,#fbbf24_208deg_273deg,#9333ea_273deg_316deg,#ec4899_316deg_345deg,#94a3b8_345deg_360deg)]">
          <div className="w-full h-full bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
            <span className="text-[11px] font-black text-gray-900 leading-tight">
              ₹ 2,41,30,600
            </span>
            <span className="text-[9px] text-gray-400 font-medium mt-0.5">
              Total Expenses
            </span>
          </div>
        </div>

        {/* Expense Categories List with Full Text & Percentages */}
        <div className="space-y-2 text-xs flex-1 w-full sm:w-auto ml-0 sm:ml-12">
          {expenseCategories.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between text-[13px]"
            >
              <span className="flex items-center text-gray-600 font-semibold truncate max-w-[180px] sm:max-w-none">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${item.color} mr-2 shrink-0`}
                />
                {item.label}
              </span>

              <span className="text-gray-700 font-extrabold text-[11px] shrink-0">
                {item.pct}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
