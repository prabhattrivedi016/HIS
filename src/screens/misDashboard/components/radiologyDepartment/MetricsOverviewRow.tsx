import {
  ArrowDown,
  ArrowUp,
  Clock,
  FileCheck,
  Pill,
  ShoppingCart,
  Store,
  Users,
} from "lucide-react";

export default function MetricsOverviewRow() {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-2 bg-[#f8fafc]">
      {/* =====================================================
          1. TOTAL PHARMACY SALES
         ===================================================== */}
      <div className="bg-[#f1f9ff] border border-[#dcecf7] rounded-xl p-3 flex flex-col justify-between shadow-2xs">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-[#e1f2ff] flex items-center justify-center shrink-0">
                <ShoppingCart size={18} className="text-[#0875d1]" />
              </div>
              <div>
                <div className="text-base font-extrabold text-[#123b70]">₹ 72,30,800</div>
                <div className="text-[10px] font-bold text-gray-500">Total Investigations</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center text-[10px] font-bold text-[#079669]">
            <div className="flex items-center">
              <ArrowUp size={13} className="mr-0.5" />
              <span className="text-[11px]">12%</span>
            </div>
            <span className="text-gray-400 font-medium text-[10px] mt-0.5 ">vs. last month</span>
          </div>
        </div>

        {/* Bottom Split Row */}
        <div className="pt-2 border-t border-[#dcecf7] flex justify-between text-[11px] font-bold">
          <div className="text-gray-600">
            <h4 className="text-[#123b70]">39,85,200</h4>
            <span>OPD</span>
          </div>
          <div className="text-gray-600">
            <h4 className="text-[#123b70]">32,45,600</h4>
            <span>IPD</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          2. TODAY'S COLLECTION
         ===================================================== */}
      <div className="bg-[#eafaf6] border border-[#d6eee8] rounded-xl p-3 flex flex-col justify-between shadow-2xs">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-[#d8f3eb] flex items-center justify-center shrink-0">
                <Pill size={18} className="text-[#159879]" />
              </div>
              <div>
                <div className="text-base font-extrabold text-[#123b70]">₹ 4,28,600</div>
                <div className="text-[10px] font-bold text-gray-500">Today's Collection</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center text-xs font-bold text-[#079669]  justify-center">
            <div className="flex items-center">
              <ArrowUp size={13} strokeWidth={2.7} className="mr-0.5" />
              <span>18%</span>
            </div>
            <span className="text-gray-400 font-medium text-[10px] ml-1 truncate">
              vs. previous day
            </span>
          </div>
        </div>

        {/* Bottom Split Row */}
        <div className="pt-2 border-t border-[#d6eee8] flex justify-between text-[11px] font-bold">
          <div className="text-gray-600">
            <h4 className="text-[#123b70]">2,02,460</h4>
            <span>OPD Collection</span>
          </div>
          <div className="text-gray-600">
            <h4 className="text-[#123b70]">2,26,140</h4>
            <span>IPD Collection</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          3. TOTAL REVENUE (MTD)
         ===================================================== */}
      <div className="bg-[#edf7ff] border border-[#d9eafb] rounded-xl p-3 flex flex-col justify-between shadow-2xs">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-[#dcecff] flex items-center justify-center shrink-0">
                <Store size={18} className="text-[#176bc1]" />
              </div>
              <div>
                <div className="text-base font-extrabold text-[#123b70]">₹ 54,12,300</div>
                <div className="text-[10px] font-bold text-gray-500">Total Revenue (MTD)</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center text-[10px] font-bold text-[#079669]">
            <div className="flex items-center">
              <ArrowUp size={13} className="mr-0.5" />
              <span className="text-[11px]">14%</span>
            </div>
            <span className="text-gray-400 font-medium text-[10px] mt-0.5 ">vs. last month</span>
          </div>
        </div>

        {/* Bottom Split Row */}
        <div className="pt-2 border-t border-[#d9eafb] flex justify-between text-[11px] font-bold">
          <div className="text-gray-600">
            <h4 className="text-[#123b70]">29,80,100</h4>
            <span>OPD Revenue</span>
          </div>
          <div className="text-gray-600">
            <h4 className="text-[#123b70]">24,32,200</h4>
            <span>IPD Revenue</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          4. PATIENTS SERVED
         ===================================================== */}
      <div className="bg-[#fff1f5] border border-[#f5dce5] rounded-xl p-3 flex flex-col justify-between shadow-2xs">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-[#ffe0e8] flex items-center justify-center shrink-0">
                <Users size={18} className="text-[#e32655]" />
              </div>
              <div>
                <div className="text-base font-extrabold text-[#123b70]">4,286</div>
                <div className="text-[10px] font-bold text-gray-500">Patients Served</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center text-[10px] font-bold text-[#ee1919]">
            <div className="flex items-center">
              <ArrowDown size={13} className="mr-0.5" />
              <span className="text-[11px]">4%</span>
            </div>
            <span className="text-gray-400 font-medium text-[10px] mt-0.5 ">vs. previous day</span>
          </div>
        </div>

        {/* Bottom Split Row */}
        <div className="pt-2 border-t border-[#f5dce5] flex justify-between text-[11px] font-bold">
          <div className="text-gray-600">
            <h4 className="text-[#e20b08]">2,840</h4>
            <span>OPD Patient</span>
          </div>
          <div className="text-gray-600">
            <h4 className="text-[#e20b08]">1,446</h4>
            <span>IPD Patient</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          5. AVG. DISPENSING TIME
         ===================================================== */}
      <div className="bg-[#fff7ed] border border-[#f4e4d2] rounded-xl p-3 flex flex-col justify-between shadow-2xs">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-[#ffecd4] flex items-center justify-center shrink-0">
                <Clock size={18} className="text-[#e08b00]" />
              </div>
              <div>
                <div className="text-base font-extrabold text-[#123b70]">18 Mins</div>
                <div className="text-[10px] font-bold text-gray-500">Avg. TAT (Overall)</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center text-[10px] font-bold text-[#ee1919]">
            <div className="flex items-center">
              <ArrowDown size={13} className="mr-0.5" />
              <span className="text-[11px]">15%</span>
            </div>
            <span className="text-gray-400 font-medium text-[10px] mt-0.5 ">vs. last month</span>
          </div>
        </div>

        {/* Bottom Split Row */}
        <div className="pt-2 border-t border-[#f4e4d2] flex justify-between text-[11px] font-bold">
          <div className="text-gray-600">
            <h4 className="text-[#e9570e]">2.1 Hrs</h4>
            <span>OPD TAT</span>
          </div>
          <div className="text-gray-600">
            <h4 className="text-[#e9570e]">2.5 Hrs</h4>
            <span>IPD Hrs</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          6. PRESCRIPTIONS PROCESSED
         ===================================================== */}
      <div className="bg-[#fdf4ff] border border-[#f5d9fc] rounded-xl p-3 flex flex-col justify-between shadow-2xs">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-[#fae8ff] flex items-center justify-center shrink-0">
                <FileCheck size={18} className="text-[#c026d3]" />
              </div>
              <div>
                <div className="text-base font-extrabold text-[#123b70]">5,120</div>
                <div className="text-[10px] font-bold text-gray-500">Report Delivered</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center text-xs font-bold text-[#079669]  justify-center">
            <div className="flex items-center">
              <ArrowUp size={13} strokeWidth={2.7} className="mr-0.5" />
              <span>13%</span>
            </div>
            <span className="text-gray-400 font-medium text-[10px] ml-1 truncate">
              vs. previous day
            </span>
          </div>
        </div>

        {/* Bottom Split Row */}
        <div className="pt-2 border-t border-[#f5d9fc] flex justify-between text-[11px] font-bold">
          <div className="text-gray-600">
            <h4 className="text-[#7b0588]">98%</h4>
            <span>ON Time</span>
          </div>
          <div className="text-gray-600">
            <h4 className="text-[#7b0588]">2%</h4>
            <span>Delayed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
