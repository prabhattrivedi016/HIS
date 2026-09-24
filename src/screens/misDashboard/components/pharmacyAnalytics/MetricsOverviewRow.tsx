import {
  ArrowUp,
  Pill,
  Receipt,
  RotateCcw,
  ShoppingCart,
  Store,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";

export default function MetricsOverviewRow() {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-2 bg-[#f8fafc]">
      {/* =====================================================
          1. TOTAL PHARMACY SALES
         ===================================================== */}
      <div className="h-[120px] bg-[#f1f9ff] border border-[#dcecf7] rounded-lg px-2.5 py-2.5 flex flex-col justify-between min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-[34px] h-[34px] rounded-md bg-[#e1f2ff] flex items-center justify-center shrink-0">
            <ShoppingCart size={19} strokeWidth={2.1} className="text-[#0875d1]" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] sm:text-[14px] leading-[18px] font-extrabold text-[#123b70] truncate">
              ₹ 72,30,800
            </div>
            <div className="text-[9px] leading-3 font-bold text-gray-500 mt-0.5 break-words">
              Total Pharmacy Sales (MTD)
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-[10px] font-bold text-[#079669]">
          <div className="flex items-center">
            <ArrowUp size={13} strokeWidth={2.7} className="mr-0.5" />
            <span className="text-[11px]">12%</span>
          </div>
          <span className="text-gray-400 font-medium text-[10px] mt-0.5 truncate">
            vs. last month
          </span>
        </div>
      </div>

      {/* =====================================================
          2. OPD PHARMACY COLLECTION
         ===================================================== */}
      <div className="h-[120px] bg-[#eafaf6] border border-[#d6eee8] rounded-lg px-2.5 py-2.5 flex flex-col justify-between min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-[34px] h-[34px] rounded-md bg-[#d8f3eb] flex items-center justify-center shrink-0">
            <Pill size={19} strokeWidth={2.3} className="text-[#159879]" />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] sm:text-[14px] leading-[18px] font-extrabold text-[#123b70] truncate">
              ₹ 28,45,600
            </div>
            <div className="text-[9px] leading-3 font-bold text-gray-500 mt-0.5 break-words">
              OPD Pharmacy Collection (MTD)
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-[10px] font-bold text-[#079669]">
          <div className="flex items-center">
            <ArrowUp size={13} strokeWidth={2.7} className="mr-0.5" />
            <span className="text-[11px]">15%</span>
          </div>
          <span className="text-gray-400 font-medium text-[10px] mt-0.5 truncate">
            vs. last month
          </span>
        </div>
      </div>

      {/* =====================================================
          3. IPD PHARMACY COLLECTION
         ===================================================== */}
      <div className="h-[120px] bg-[#edf7ff] border border-[#d9eafb] rounded-lg px-2.5 py-2.5 flex flex-col justify-between min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-[34px] h-[34px] rounded-md bg-[#dcecff] flex items-center justify-center shrink-0">
            <Store size={19} strokeWidth={2.3} className="text-[#176bc1]" />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] sm:text-[14px] leading-[18px] font-extrabold text-[#123b70] truncate">
              ₹ 39,85,200
            </div>
            <div className="text-[9px] leading-3 font-bold text-gray-500 mt-0.5 break-words">
              IPD Pharmacy Collection (MTD)
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-[10px] font-bold text-[#079669]">
          <div className="flex items-center">
            <ArrowUp size={13} strokeWidth={2.7} className="mr-0.5" />
            <span className="text-[11px]">8%</span>
          </div>
          <span className="text-gray-400 font-medium text-[10px] mt-0.5 truncate">
            vs. last month
          </span>
        </div>
      </div>

      {/* =====================================================
          4. TOTAL DISPENSED PATIENTS
         ===================================================== */}
      <div className="h-[120px] bg-[#fff1f5] border border-[#f5dce5] rounded-lg px-2.5 py-2.5 flex flex-col justify-between min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-[34px] h-[34px] rounded-md bg-[#ffe0e8] flex items-center justify-center shrink-0">
            <Users size={19} strokeWidth={2.3} className="text-[#e32655]" />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] sm:text-[14px] leading-[18px] font-extrabold text-[#123b70] truncate">
              4,286
            </div>
            <div className="text-[9px] leading-3 font-bold text-gray-500 mt-0.5 break-words">
              Total Dispensed Patients (MTD)
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-[10px] font-bold text-[#079669]">
          <div className="flex items-center">
            <ArrowUp size={13} strokeWidth={2.7} className="mr-0.5" />
            <span className="text-[11px]">10%</span>
          </div>
          <span className="text-gray-400 font-medium text-[10px] mt-0.5 truncate">
            vs. last month
          </span>
        </div>
      </div>

      {/* =====================================================
          5. TOTAL PURCHASE
         ===================================================== */}
      <div className="h-[120px] bg-[#fff7ed] border border-[#f4e4d2] rounded-lg px-2.5 py-2.5 flex flex-col justify-between min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-[34px] h-[34px] rounded-md bg-[#ffecd4] flex items-center justify-center shrink-0">
            <Truck size={19} strokeWidth={2.3} className="text-[#e08b00]" />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] sm:text-[14px] leading-[18px] font-extrabold text-[#123b70] truncate">
              ₹ 48,90,400
            </div>
            <div className="text-[9px] leading-3 font-bold text-gray-500 mt-0.5 break-words">
              Total Purchase (MTD)
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-[10px] font-bold text-[#079669]">
          <div className="flex items-center">
            <ArrowUp size={13} strokeWidth={2.7} className="mr-0.5" />
            <span className="text-[11px]">6%</span>
          </div>
          <span className="text-gray-400 font-medium text-[10px] mt-0.5 truncate">
            vs. last month
          </span>
        </div>
      </div>

      {/* =====================================================
          6. OUTSTANDING / DUE
         ===================================================== */}
      <div className="h-[120px] bg-[#fff1f5] border border-[#f5dce5] rounded-lg px-2.5 py-2.5 flex flex-col justify-between min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-[34px] h-[34px] rounded-md bg-[#ffe0e8] flex items-center justify-center shrink-0">
            <Receipt size={19} strokeWidth={2.3} className="text-[#e32655]" />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] sm:text-[14px] leading-[18px] font-extrabold text-[#123b70] truncate">
              ₹ 6,42,300
            </div>
            <div className="text-[9px] leading-3 font-bold text-gray-500 mt-0.5 break-words">
              Outstanding / Due
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-[10px] font-bold text-[#079669]">
          <div className="flex items-center">
            <ArrowUp size={13} strokeWidth={2.7} className="mr-0.5" />
            <span className="text-[11px]">18%</span>
          </div>
          <span className="text-gray-400 font-medium text-[10px] mt-0.5 truncate">
            vs. last month
          </span>
        </div>
      </div>

      {/* =====================================================
          7. PHARMACY RETURNS
         ===================================================== */}
      <div className="h-[120px] bg-[#fdf4ff] border border-[#f5d9fc] rounded-lg px-2.5 py-2.5 flex flex-col justify-between min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-[34px] h-[34px] rounded-md bg-[#fae8ff] flex items-center justify-center shrink-0">
            <RotateCcw size={19} strokeWidth={2.3} className="text-[#c026d3]" />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] sm:text-[14px] leading-[18px] font-extrabold text-[#123b70] truncate">
              ₹ 3,18,450
            </div>
            <div className="text-[9px] leading-3 font-bold text-gray-500 mt-0.5 break-words">
              Pharmacy Returns (MTD)
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-[10px] font-bold text-[#079669]">
          <div className="flex items-center">
            <ArrowUp size={13} strokeWidth={2.7} className="mr-0.5" />
            <span className="text-[11px]">22%</span>
          </div>
          <span className="text-gray-400 font-medium text-[10px] mt-0.5 truncate">
            vs. last month
          </span>
        </div>
      </div>

      {/* =====================================================
          8. GROSS MARGIN
         ===================================================== */}
      <div className="h-[120px] bg-[#eafaf6] border border-[#d6eee8] rounded-lg px-2.5 py-2.5 flex flex-col justify-between min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-[34px] h-[34px] rounded-md bg-[#d8f3eb] flex items-center justify-center shrink-0">
            <TrendingUp size={19} strokeWidth={2.3} className="text-[#159879]" />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] sm:text-[14px] leading-[18px] font-extrabold text-[#123b70] truncate">
              ₹ 23,40,400
            </div>
            <div className="text-[9px] leading-3 font-bold text-gray-500 mt-0.5 break-words">
              Gross Margin (MTD)
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-[10px] font-bold text-[#079669]">
          <div className="flex items-center">
            <ArrowUp size={13} strokeWidth={2.7} className="mr-0.5" />
            <span className="text-[11px]">14%</span>
          </div>
          <span className="text-gray-400 font-medium text-[10px] mt-0.5 truncate">
            vs. last month
          </span>
        </div>
      </div>
    </div>
  );
}
