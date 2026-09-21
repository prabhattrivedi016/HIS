import { Calendar, ChevronDown } from "lucide-react";

export default function HeaderSection() {
  const tabs = [
    "Overview",
    "Income",
    "Expenses",
    "Receivables",
    "Payables",
    "Refunds",
    "Advances",
    "Doctor Payout",
    "GST / TDS",
    "P&L",
    "Cost Centre",
    "Detailed Reports",
  ];

  return (
    <div className="w-full bg-white border-b border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)] px-3 sm:px-4 pt-3">
      {/* ================= TOP HEADER ================= */}
      {/* // <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3"> */}
      {/* LEFT: LOGO + TITLE */}
      {/* <div className="flex items-center min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center mr-2.5 sm:mr-3 shrink-0">
            <BarChart2
              size={30}
              strokeWidth={2.2}
              className="text-blue-700 sm:w-[34px] sm:h-[34px]"
            />
          </div>

          <div className="min-w-0">
            <h1 className="text-base sm:text-[20px] leading-tight sm:leading-6 font-extrabold text-[#123b70] tracking-[-0.3px] truncate">
              IPD Billing Dashboard
            </h1>

            <p className="text-[10px] sm:text-[11px] leading-3 sm:leading-4 text-gray-500 font-medium mt-0.5 truncate">
              Real-time dashboard insights for better decisions
            </p>
          </div>
        </div> */}

      {/* RIGHT: DATE + TIME */}
      {/* <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-semibold text-gray-600 whitespace-nowrap self-start md:self-auto bg-gray-50 md:bg-transparent px-2.5 py-1 md:p-0 rounded-md border md:border-0 border-gray-100">
          <Calendar size={14} strokeWidth={2} className="text-[#173f75] shrink-0" />

          <span>Mon, 15 Sep 2026</span>

          <span className="text-gray-300 mx-1">|</span>

          <span className="text-gray-500 font-medium">06:24 PM</span>
        </div> */}
      {/* </div> */}

      {/* ================= FILTER SECTION ================= */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-end justify-between gap-3 pt-2 pb-3 border-t border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:flex xl:flex-wrap items-end gap-2.5 flex-1 min-w-0">
          {/* DATE RANGE */}
          <div className="w-full xl:w-auto xl:min-w-[180px] flex-1">
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Date Range</label>

            <div className="h-[32px] flex items-center justify-between bg-white border border-gray-300 rounded-md px-2.5 text-[11px] text-gray-700 cursor-pointer hover:border-blue-400 transition-colors">
              <div className="flex items-center min-w-0">
                <Calendar size={13} className="mr-1.5 text-gray-500 shrink-0" />

                <span className="truncate">01 Sep 2026 - 15 Sep 2026</span>
              </div>

              <ChevronDown size={13} className="ml-2 text-gray-500 shrink-0" />
            </div>
          </div>

          {/* DEPARTMENT */}
          <div className="w-full xl:w-auto xl:min-w-[140px] flex-1">
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Department</label>

            <div className="h-[32px] flex items-center justify-between bg-white border border-gray-300 rounded-md px-2.5 text-[11px] text-gray-700 cursor-pointer hover:border-blue-400 transition-colors">
              <span className="truncate">All Departments</span>

              <ChevronDown size={13} className="ml-2 text-gray-500 shrink-0" />
            </div>
          </div>

          {/* PAYMENT MODE */}
          <div className="w-full xl:w-auto xl:min-w-[115px] flex-1">
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">
              Payment Mode
            </label>

            <div className="h-[32px] flex items-center justify-between bg-white border border-gray-300 rounded-md px-2.5 text-[11px] text-gray-700 cursor-pointer hover:border-blue-400 transition-colors">
              <span className="truncate">All</span>

              <ChevronDown size={13} className="ml-2 text-gray-500 shrink-0" />
            </div>
          </div>

          {/* PAYER / TPA */}
          <div className="w-full xl:w-auto xl:min-w-[115px] flex-1">
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">
              Payer / TPA
            </label>

            <div className="h-[32px] flex items-center justify-between bg-white border border-gray-300 rounded-md px-2.5 text-[11px] text-gray-700 cursor-pointer hover:border-blue-400 transition-colors">
              <span className="truncate">All</span>

              <ChevronDown size={13} className="ml-2 text-gray-500 shrink-0" />
            </div>
          </div>

          {/* BRANCH */}
          <div className="w-full xl:w-auto xl:min-w-[150px] flex-1">
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Branch</label>

            <div className="h-[32px] flex items-center justify-between bg-white border border-gray-300 rounded-md px-2.5 text-[11px] text-gray-700 cursor-pointer hover:border-blue-400 transition-colors">
              <span className="truncate">Main Hospital</span>

              <ChevronDown size={13} className="ml-2 text-gray-500 shrink-0" />
            </div>
          </div>
        </div>

        {/* APPLY BUTTON */}
        <button
          className="
            h-[32px]
            px-7
            bg-[#0969d7]
            hover:bg-[#075bbd]
            text-white
            text-[11px]
            font-bold
            rounded-md
            shadow-sm
            transition-colors
            cursor-pointer
            shrink-0
            w-full xl:w-auto
          "
        >
          Apply
        </button>
      </div>

      {/* =========================================================
    DASHBOARD TABS - FULL WIDTH
    ========================================================= */}
      <div className="w-full bg-[#f7f9fc] border border-gray-200 border-b-0 rounded-t-md overflow-x-auto">
        <div className="flex w-max xl:w-full items-stretch">
          {tabs.map((tab, index) => {
            const isActive = index === 0;

            return (
              <button
                key={tab}
                className={`
            shrink-0 xl:flex-1
            min-w-[100px] sm:min-w-[110px] xl:min-w-0
            h-[36px]
            flex
            items-center
            justify-center
            whitespace-nowrap
            px-3
            text-[11px]
            font-semibold
            border-r
            border-gray-200
            last:border-r-0
            transition-all
            duration-150
            cursor-pointer

            ${
              isActive
                ? `
                  bg-[#0875d1]
                  text-white
                  border-[#0875d1]
                  shadow-[0_1px_2px_rgba(0,0,0,0.08)]
                `
                : `
                  bg-[#f7f9fc]
                  text-[#526174]
                  hover:bg-white
                  hover:text-[#1769aa]
                `
            }
          `}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
