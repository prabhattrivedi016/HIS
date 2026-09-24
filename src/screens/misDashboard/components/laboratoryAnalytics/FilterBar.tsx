import { Calendar, ChevronDown, Activity } from "lucide-react";

export default function HeaderSection() {
  const tabs = [
    "Overview",
    "Test Analytics",
    "Department",
    "Sample Tracking",
    "Pending Reports",
    "Quality Control",
    "Revenue",
    "TAT Analysis",
    "Doctor Wise",
    "Patient Wise",
    "Inventory",
    "Detailed Reports",
  ];

  return (
    <div className="w-full bg-white border-b border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)] px-3 sm:px-4 pt-3">
      {/* ================= TOP HEADER ================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3">
        {/* LEFT: LOGO + TITLE */}
        <div className="flex items-center min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center mr-2.5 sm:mr-3 shrink-0 bg-blue-50 rounded-lg">
            <Activity size={24} strokeWidth={2.2} className="text-blue-600" />
          </div>

          <div className="min-w-0">
            <h1 className="text-base sm:text-[18px] md:text-[20px] leading-tight sm:leading-6 font-extrabold text-[#123b70] tracking-[-0.3px] truncate">
              Laboratory Information System - MIS Dashboard
            </h1>

            <p className="text-[10px] sm:text-[11px] leading-3 sm:leading-4 text-gray-500 font-medium mt-0.5 truncate">
              Real-time lab operations, testing, billing & quality insights
            </p>
          </div>
        </div>

        {/* RIGHT: FILTERS & DATE/TIME */}
        <div className="flex flex-wrap items-center gap-2">
          {/* DATE RANGE */}
          <div className="min-w-[160px] flex-1 sm:flex-initial">
            <label className="block text-[9px] font-semibold text-gray-500 mb-0.5">
              Date Range
            </label>
            <div className="h-[30px] flex items-center justify-between bg-white border border-gray-300 rounded-md px-2 text-[10px] sm:text-[11px] text-gray-700 cursor-pointer hover:border-blue-400 transition-colors">
              <div className="flex items-center min-w-0">
                <Calendar size={12} className="mr-1 text-gray-500 shrink-0" />
                <span className="truncate">01 Sep 2026 - 15 Sep 2026</span>
              </div>
              <ChevronDown size={12} className="ml-1 text-gray-500 shrink-0" />
            </div>
          </div>

          {/* DEPARTMENT */}
          <div className="min-w-[120px] flex-1 sm:flex-initial">
            <label className="block text-[9px] font-semibold text-gray-500 mb-0.5">
              Department
            </label>
            <div className="h-[30px] flex items-center justify-between bg-white border border-gray-300 rounded-md px-2 text-[10px] sm:text-[11px] text-gray-700 cursor-pointer hover:border-blue-400 transition-colors">
              <span className="truncate">All Departments</span>
              <ChevronDown size={12} className="ml-1 text-gray-500 shrink-0" />
            </div>
          </div>

          {/* SAMPLE TYPE */}
          <div className="min-w-[90px] flex-1 sm:flex-initial">
            <label className="block text-[9px] font-semibold text-gray-500 mb-0.5">
              Sample Type
            </label>
            <div className="h-[30px] flex items-center justify-between bg-white border border-gray-300 rounded-md px-2 text-[10px] sm:text-[11px] text-gray-700 cursor-pointer hover:border-blue-400 transition-colors">
              <span className="truncate">All</span>
              <ChevronDown size={12} className="ml-1 text-gray-500 shrink-0" />
            </div>
          </div>

          {/* PATIENT TYPE */}
          <div className="min-w-[90px] flex-1 sm:flex-initial">
            <label className="block text-[9px] font-semibold text-gray-500 mb-0.5">
              Patient Type
            </label>
            <div className="h-[30px] flex items-center justify-between bg-white border border-gray-300 rounded-md px-2 text-[10px] sm:text-[11px] text-gray-700 cursor-pointer hover:border-blue-400 transition-colors">
              <span className="truncate">All</span>
              <ChevronDown size={12} className="ml-1 text-gray-500 shrink-0" />
            </div>
          </div>

          {/* BRANCH */}
          <div className="min-w-[110px] flex-1 sm:flex-initial">
            <label className="block text-[9px] font-semibold text-gray-500 mb-0.5">
              Branch
            </label>
            <div className="h-[30px] flex items-center justify-between bg-white border border-gray-300 rounded-md px-2 text-[10px] sm:text-[11px] text-gray-700 cursor-pointer hover:border-blue-400 transition-colors">
              <span className="truncate">Main Hospital</span>
              <ChevronDown size={12} className="ml-1 text-gray-500 shrink-0" />
            </div>
          </div>

          {/* DATE/TIME + APPLY BUTTON */}
          <div className="flex items-center gap-2 self-end mt-1 sm:mt-0">
            <div className="hidden xl:flex items-center gap-1.5 text-[10px] font-semibold text-gray-600 whitespace-nowrap bg-gray-50 px-2 py-1.5 rounded-md border border-gray-100">
              <Calendar size={13} strokeWidth={2} className="text-[#173f75]" />
              <span>Mon, 15 Sep 2026</span>
              <span className="text-gray-300 mx-0.5">|</span>
              <span className="text-gray-500 font-medium">06:24 PM</span>
            </div>

            <button
              className="
                h-[30px]
                px-5
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
              "
            >
              Apply
            </button>
          </div>
        </div>
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
