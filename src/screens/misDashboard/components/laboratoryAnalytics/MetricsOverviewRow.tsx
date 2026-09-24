import {
  ArrowDown,
  ArrowUp,
  Clock,
  FileText,
  FlaskConical,
  IndianRupee,
  Users,
} from "lucide-react";

export default function MetricsOverviewRow() {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 px-3 py-3 bg-[#f8fafc]">
      {/* =====================================================
          1. TOTAL TESTS (MTD)
          ===================================================== */}
      <div className="h-[120px] bg-[#f1f9ff] border border-[#dcecf7] rounded-lg px-3 py-2.5 flex flex-col justify-between min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-[38px] h-[38px] rounded-md bg-[#e1f2ff] flex items-center justify-center shrink-0">
            <FlaskConical size={22} strokeWidth={2.1} className="text-[#0875d1]" />
          </div>
          <div className="min-w-0">
            <div className="text-[17px] leading-[20px] font-extrabold text-[#123b70] mt-1 whitespace-nowrap">
              1,248
            </div>
            <div className="text-[9px] leading-3 font-bold text-gray-500 truncate">
              Total Tests (MTD)
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-[10px] font-bold text-[#079669]">
          <div className="flex items-center">
            <ArrowUp size={14} strokeWidth={2.7} className="mr-0.5" />
            <span className="text-[12px]">12%</span>
          </div>
          <span className="text-gray-400 font-medium text-[12px] mt-0.5 truncate">
            vs. last month
          </span>
        </div>
      </div>

      {/* =====================================================
          2. TOTAL PATIENTS (MTD)
          ===================================================== */}
      <div className="h-[120px] bg-[#eafaf6] border border-[#d6eee8] rounded-lg px-3 py-2.5 flex flex-col justify-between min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-[38px] h-[38px] rounded-md bg-[#d8f3eb] flex items-center justify-center shrink-0">
            <Users size={22} strokeWidth={2.1} className="text-[#159879]" />
          </div>
          <div className="min-w-0">
            <div className="text-[17px] leading-[20px] font-extrabold text-[#123b70] mt-1 whitespace-nowrap">
              1,020
            </div>
            <div className="text-[9px] leading-3 font-bold text-gray-500 truncate">
              Total Patients (MTD)
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-[10px] font-bold text-[#079669]">
          <div className="flex items-center">
            <ArrowUp size={14} strokeWidth={2.7} className="mr-0.5" />
            <span className="text-[12px]">10%</span>
          </div>
          <span className="text-gray-400 font-medium text-[12px] mt-0.5 truncate">
            vs. last month
          </span>
        </div>
      </div>

      {/* =====================================================
          3. LAB REVENUE (MTD)
          ===================================================== */}
      <div className="h-[120px] bg-[#fff1f5] border border-[#f5dce5] rounded-lg px-3 py-2.5 flex flex-col justify-between min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-[38px] h-[38px] rounded-md bg-[#ffe0e8] flex items-center justify-center shrink-0">
            <IndianRupee size={22} strokeWidth={2.3} className="text-[#e32655]" />
          </div>
          <div className="min-w-0">
            <div className="text-[15px] sm:text-[16px] leading-[20px] font-extrabold text-[#123b70] mt-1 whitespace-nowrap truncate">
              ₹ 48,12,450
            </div>
            <div className="text-[9px] leading-3 font-bold text-gray-500 truncate">
              Lab Revenue (MTD)
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-[10px] font-bold text-[#079669]">
          <div className="flex items-center">
            <ArrowUp size={14} strokeWidth={2.7} className="mr-0.5" />
            <span className="text-[12px]">15%</span>
          </div>
          <span className="text-gray-400 font-medium text-[12px] mt-0.5 truncate">
            vs. last month
          </span>
        </div>
      </div>

      {/* =====================================================
          4. BILLED AMOUNT (MTD)
          ===================================================== */}
      <div className="h-[120px] bg-[#fff7ed] border border-[#f4e4d2] rounded-lg px-3 py-2.5 flex flex-col justify-between min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-[38px] h-[38px] rounded-md bg-[#ffecd4] flex items-center justify-center shrink-0">
            <IndianRupee size={22} strokeWidth={2.3} className="text-[#e08b00]" />
          </div>
          <div className="min-w-0">
            <div className="text-[15px] sm:text-[16px] leading-[20px] font-extrabold text-[#123b70] mt-1 whitespace-nowrap truncate">
              ₹ 42,18,600
            </div>
            <div className="text-[9px] leading-3 font-bold text-gray-500 truncate">
              Billed Amount (MTD)
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

      {/* =====================================================
          5. COLLECTED AMOUNT (MTD)
          ===================================================== */}
      <div className="h-[120px] bg-[#f5f3ff] border border-[#ede9fe] rounded-lg px-3 py-2.5 flex flex-col justify-between min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-[38px] h-[38px] rounded-md bg-[#ede9fe] flex items-center justify-center shrink-0">
            <IndianRupee size={22} strokeWidth={2.3} className="text-[#7c3aed]" />
          </div>
          <div className="min-w-0">
            <div className="text-[15px] sm:text-[16px] leading-[20px] font-extrabold text-[#123b70] mt-1 whitespace-nowrap truncate">
              ₹ 39,45,230
            </div>
            <div className="text-[9px] leading-3 font-bold text-gray-500 truncate">
              Collected Amount (MTD)
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-[10px] font-bold text-[#079669]">
          <div className="flex items-center">
            <ArrowUp size={14} strokeWidth={2.7} className="mr-0.5" />
            <span className="text-[12px]">16%</span>
          </div>
          <span className="text-gray-400 font-medium text-[12px] mt-0.5 truncate">
            vs. last month
          </span>
        </div>
      </div>

      {/* =====================================================
          6. AVG. TAT
          ===================================================== */}
      <div className="h-[120px] bg-[#eafaf6] border border-[#d6eee8] rounded-lg px-3 py-2.5 flex flex-col justify-between min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-[38px] h-[38px] rounded-md bg-[#d8f3eb] flex items-center justify-center shrink-0">
            <Clock size={22} strokeWidth={2.1} className="text-[#159879]" />
          </div>
          <div className="min-w-0">
            <div className="text-[17px] leading-[20px] font-extrabold text-[#123b70] mt-1 whitespace-nowrap">
              12.4 Hrs
            </div>
            <div className="text-[9px] leading-3 font-bold text-gray-500 truncate">Avg. TAT</div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-[10px] font-bold text-[#079669]">
          <div className="flex items-center">
            <ArrowDown size={14} strokeWidth={2.7} className="mr-0.5" />
            <span className="text-[12px]">18%</span>
          </div>
          <span className="text-gray-400 font-medium text-[12px] mt-0.5 truncate">
            vs. last month
          </span>
        </div>
      </div>

      {/* =====================================================
          7. PENDING REPORTS
          ===================================================== */}
      <div className="h-[120px] bg-[#fff1f5] border border-[#f5dce5] rounded-lg px-3 py-2.5 flex flex-col justify-between min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-[38px] h-[38px] rounded-md bg-[#ffe0e8] flex items-center justify-center shrink-0">
            <FileText size={22} strokeWidth={2.1} className="text-[#e32655]" />
          </div>
          <div className="min-w-0">
            <div className="text-[17px] leading-[20px] font-extrabold text-[#123b70] mt-1 whitespace-nowrap">
              186
            </div>
            <div className="text-[9px] leading-3 font-bold text-gray-500 truncate">
              Pending Reports
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-[10px] font-bold text-[#e32655]">
          <div className="flex items-center">
            <ArrowUp size={14} strokeWidth={2.7} className="mr-0.5" />
            <span className="text-[12px]">8%</span>
          </div>
          <span className="text-gray-400 font-medium text-[12px] mt-0.5 truncate">
            vs. last month
          </span>
        </div>
      </div>
    </div>
  );
}
