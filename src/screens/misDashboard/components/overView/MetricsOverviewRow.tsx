import { ArrowDown, ArrowUp, BedDouble, IndianRupee } from "lucide-react";

export default function MetricsOverviewRow() {
  return (
    <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2 mb-2 bg-[#f8fafc]">
      {/* =====================================================
          1. TOTAL BEDS
          ===================================================== */}
      <div className="h-[120px] bg-[#f1f9ff] border border-[#dcecf7] rounded-lg px-3 py-2.5 flex flex-col justify-between min-w-0">
        <div className="flex items-center justify-between min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* ICON */}
            <div className="w-[40px] h-[40px] rounded-md bg-[#e1f2ff] flex items-center justify-center shrink-0">
              <BedDouble size={23} strokeWidth={2.1} className="text-[#0875d1]" />
            </div>

            {/* VALUE & TITLE */}
            <div className="min-w-0">
              <div className="text-[9px] leading-3 font-bold text-gray-500 truncate">
                Total Beds
              </div>
              <div className="text-[17px] leading-[20px] font-extrabold text-[#123b70] mt-1">
                200
              </div>
            </div>
          </div>

          {/* BIGGER OCCUPANCY GRAPH & LABEL */}
          <div className="flex flex-col items-center shrink-0 ml-1">
            <div className="relative w-[50px] h-[50px] flex items-center justify-center">
              <svg width="50" height="50" viewBox="0 0 52 52" className="-rotate-90">
                {/* BACKGROUND RING */}
                <circle cx="26" cy="26" r="21" fill="none" stroke="#dce9ed" strokeWidth="5" />

                {/* 78% RING */}
                <circle
                  cx="26"
                  cy="26"
                  r="21"
                  fill="none"
                  stroke="#0b9b76"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray="131.95"
                  strokeDashoffset="29.03"
                />
              </svg>

              <span className="absolute text-[10px] font-extrabold text-gray-700">78%</span>
            </div>
            <span className="text-[9px] font-bold text-gray-500 mt-0.5 whitespace-nowrap">
              Bed Occupied
            </span>
          </div>
        </div>

        {/* BED DETAILS — OCCUPIED & VACANT */}
        <div className="flex items-center justify-between sm:justify-between sm:gap-10 px-0.5 text-[10px] font-bold pt-1.5">
          <div className="text-[#0875d1] flex flex-col">
            <span className="text-[13px] font-extrabold">156</span>
            <span className="text-gray-500 font-medium">Occupied</span>
          </div>

          <div className="text-[#e19a00] flex flex-col mr-2">
            <span className="text-[13px] font-extrabold">44</span>
            <span className="text-gray-500 font-medium">Vacant</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          2. TODAY'S COLLECTION
          ===================================================== */}
      <div className="h-[120px] bg-[#eafaf6] border border-[#d6eee8] rounded-lg px-3 py-2.5 flex flex-col justify-between min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-[38px] h-[38px] rounded-md bg-[#d8f3eb] flex items-center justify-center shrink-0">
            <IndianRupee size={22} strokeWidth={2.3} className="text-[#159879]" />
          </div>

          <div className="min-w-0">
            <div className="text-[15px] sm:text-[17px] leading-[20px] font-extrabold text-[#123b70] mt-1 whitespace-nowrap truncate">
              ₹ 12,48,320
            </div>
            <div className="text-[9px] leading-3 font-bold text-gray-500 truncate">
              Today's Collection
            </div>
          </div>
        </div>

        {/* CENTERED PERCENTAGE & SUBTEXT */}
        <div className="flex flex-col items-center justify-center text-[10px] font-bold text-[#079669]">
          <div className="flex items-center">
            <ArrowUp size={14} strokeWidth={2.7} className="mr-0.5" />
            <span className="text-[12px]">12%</span>
          </div>
          <span className="text-gray-400 font-medium text-[12px] mt-0.5 truncate">
            vs. previous day
          </span>
        </div>
      </div>

      {/* =====================================================
          3. MONTHLY REVENUE
          ===================================================== */}
      <div className="h-[120px] bg-[#edf7ff] border border-[#d9eafb] rounded-lg px-3 py-2.5 flex flex-col justify-between min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-[38px] h-[38px] rounded-md bg-[#dcecff] flex items-center justify-center shrink-0">
            <IndianRupee size={22} strokeWidth={2.3} className="text-[#176bc1]" />
          </div>

          <div className="min-w-0">
            <div className="text-[15px] sm:text-[17px] leading-[20px] font-extrabold text-[#123b70] mt-1 whitespace-nowrap truncate">
              ₹ 3,48,75,220
            </div>
            <div className="text-[9px] leading-3 font-bold text-gray-500 truncate">
              Monthly Revenue
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-[10px] font-bold text-[#079669]">
          <div className="flex items-center">
            <ArrowUp size={14} strokeWidth={2.7} className="mr-0.5" />
            <span className="text-[12px]">8%</span>
          </div>
          <span className="text-gray-400 font-medium text-[12px] mt-0.5 truncate">
            vs. last month
          </span>
        </div>
      </div>

      {/* =====================================================
          4. OUTSTANDING RECEIVABLES
          ===================================================== */}
      <div className="h-[120px] bg-[#fff1f5] border border-[#f5dce5] rounded-lg px-3 py-2.5 flex flex-col justify-between min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-[38px] h-[38px] rounded-md bg-[#ffe0e8] flex items-center justify-center shrink-0">
            <IndianRupee size={22} strokeWidth={2.3} className="text-[#e32655]" />
          </div>

          <div className="min-w-0">
            <div className="text-[15px] sm:text-[17px] leading-[20px] font-extrabold text-[#123b70] mt-1 whitespace-nowrap truncate">
              ₹ 62,40,500
            </div>
            <div className="text-[9px] leading-3 font-bold text-gray-500 truncate">
              Outstanding Receivables
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-[10px] font-bold text-[#e32655]">
          <div className="flex items-center">
            <ArrowDown size={14} strokeWidth={2.7} className="mr-0.5" />
            <span className="text-[12px]">5%</span>
          </div>
          <span className="text-gray-400 font-medium text-[12px] mt-0.5 truncate">
            vs. last month
          </span>
        </div>
      </div>

      {/* =====================================================
          5. TOTAL EXPENSES
          ===================================================== */}
      <div className="h-[120px] bg-[#fff7ed] border border-[#f4e4d2] rounded-lg px-3 py-2.5 flex flex-col justify-between min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-[38px] h-[38px] rounded-md bg-[#ffecd4] flex items-center justify-center shrink-0">
            <IndianRupee size={22} strokeWidth={2.3} className="text-[#e08b00]" />
          </div>

          <div className="min-w-0">
            <div className="text-[15px] sm:text-[17px] leading-[20px] font-extrabold text-[#123b70] mt-1 whitespace-nowrap truncate">
              ₹ 2,41,30,600
            </div>
            <div className="text-[9px] leading-3 font-bold text-gray-500 truncate">
              Total Expenses (MTD)
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-[10px] font-bold text-[#e32655]">
          <div className="flex items-center">
            <ArrowDown size={14} strokeWidth={2.7} className="mr-0.5" />
            <span className="text-[12px]">6%</span>
          </div>
          <span className="text-gray-400 font-medium text-[12px] mt-0.5 truncate">
            vs. last month
          </span>
        </div>
      </div>

      {/* =====================================================
          6. NET OPERATING RESULT
          ===================================================== */}
      <div className="h-[120px] bg-[#eafaf6] border border-[#d6eee8] rounded-lg px-3 py-2.5 flex flex-col justify-between min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-[38px] h-[38px] rounded-md bg-[#d8f3eb] flex items-center justify-center shrink-0">
            <IndianRupee size={22} strokeWidth={2.3} className="text-[#159879]" />
          </div>

          <div className="min-w-0">
            <div className="text-[15px] sm:text-[17px] leading-[20px] font-extrabold text-[#123b70] mt-1 whitespace-nowrap truncate">
              ₹ 1,07,44,620
            </div>
            <div className="text-[9px] leading-3 font-bold text-gray-500 truncate">
              Net Operating Result
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-[10px] font-bold text-[#079669]">
          <div className="flex items-center">
            <ArrowUp size={14} strokeWidth={2.7} className="mr-0.5" />
            <span className="text-[12px]">14%</span>
          </div>
          <span className="text-gray-400 font-medium text-[12px] mt-0.5 truncate">
            vs. last month
          </span>
        </div>
      </div>
    </div>
  );
}
