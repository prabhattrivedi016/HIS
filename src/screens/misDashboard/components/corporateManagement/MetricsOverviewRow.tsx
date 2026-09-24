import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle,
  Clock,
  FileText,
  Users,
  Wallet,
} from "lucide-react";

export default function MetricsOverviewRow() {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-2 bg-[#f8fafc]">
      {/* =====================================================
          1. TOTAL CORPORATE PATIENTS
         ===================================================== */}
      <div className="bg-[#f1f9ff] border border-[#dcecf7] rounded-xl p-3 flex flex-col justify-between shadow-2xs">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-[#e1f2ff] flex items-center justify-center shrink-0">
                <Users size={18} className="text-[#0875d1]" />
              </div>
              <div>
                <div className="text-base font-extrabold text-[#123b70]">1,246</div>
                <div className="text-[10px] font-bold text-gray-500">Total Corporate Patients</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center text-[10px] font-bold text-[#079669]">
            <div className="flex items-center">
              <ArrowUp size={13} className="mr-0.5" />
              <span className="text-[11px]">12%</span>
            </div>
            <span className="text-gray-400 font-medium text-[10px] mt-0.5">
              vs. previous period
            </span>
          </div>
        </div>

        {/* Bottom Split Row */}
        <div className="pt-2 border-t border-[#dcecf7] flex justify-between text-[11px] font-bold">
          <div className="text-gray-600">
            <h4 className="text-[#123b70]">842</h4>
            <span>OPD Patients</span>
          </div>
          <div className="text-gray-600">
            <h4 className="text-[#123b70]">404</h4>
            <span>IPD Patients</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          2. TOTAL BILLED AMOUNT
         ===================================================== */}
      <div className="bg-[#eafaf6] border border-[#d6eee8] rounded-xl p-3 flex flex-col justify-between shadow-2xs">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-[#d8f3eb] flex items-center justify-center shrink-0">
                <FileText size={18} className="text-[#159879]" />
              </div>
              <div>
                <div className="text-base font-extrabold text-[#123b70]">₹ 1,28,75,600</div>
                <div className="text-[10px] font-bold text-gray-500">Total Billed Amount</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center text-xs font-bold text-[#079669] justify-center">
            <div className="flex items-center">
              <ArrowUp size={13} strokeWidth={2.7} className="mr-0.5" />
              <span>18%</span>
            </div>
            <span className="text-gray-400 font-medium text-[10px] ml-1 truncate">
              vs. previous period
            </span>
          </div>
        </div>

        {/* Bottom Split Row */}
        <div className="pt-2 border-t border-[#d6eee8] flex justify-between text-[11px] font-bold">
          <div className="text-gray-600">
            <h4 className="text-[#123b70]">42,36,200</h4>
            <span>OPD Billing</span>
          </div>
          <div className="text-gray-600">
            <h4 className="text-[#123b70]">86,39,400</h4>
            <span>IPD Billing</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          3. TOTAL APPROVED AMOUNT
         ===================================================== */}
      <div className="bg-[#edf7ff] border border-[#d9eafb] rounded-xl p-3 flex flex-col justify-between shadow-2xs">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-[#dcecff] flex items-center justify-center shrink-0">
                <CheckCircle size={18} className="text-[#176bc1]" />
              </div>
              <div>
                <div className="text-base font-extrabold text-[#123b70]">₹ 1,12,40,300</div>
                <div className="text-[10px] font-bold text-gray-500">Total Approved Amount</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center text-[10px] font-bold text-[#079669]">
            <div className="flex items-center">
              <ArrowUp size={13} className="mr-0.5" />
              <span className="text-[11px]">16%</span>
            </div>
            <span className="text-gray-400 font-medium text-[10px] mt-0.5">
              vs. previous period
            </span>
          </div>
        </div>

        {/* Bottom Split Row */}
        <div className="pt-2 border-t border-[#d9eafb] flex justify-between text-[11px] font-bold">
          <div className="text-gray-600">
            <h4 className="text-[#123b70]">36,85,600</h4>
            <span>OPD Approved</span>
          </div>
          <div className="text-gray-600">
            <h4 className="text-[#123b70]">75,54,700</h4>
            <span>IPD Approved</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          4. TOTAL RECEIVED (SETTLED)
         ===================================================== */}
      <div className="bg-[#fff1f5] border border-[#f5dce5] rounded-xl p-3 flex flex-col justify-between shadow-2xs">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-[#ffe0e8] flex items-center justify-center shrink-0">
                <Wallet size={18} className="text-[#e32655]" />
              </div>
              <div>
                <div className="text-base font-extrabold text-[#123b70]">₹ 94,18,450</div>
                <div className="text-[10px] font-bold text-gray-500">Total Received (Settled)</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center text-[10px] font-bold text-[#ee1919]">
            <div className="flex items-center">
              <ArrowDown size={13} className="mr-0.5" />
              <span className="text-[11px]">14%</span>
            </div>
            <span className="text-gray-400 font-medium text-[10px] mt-0.5">
              vs. previous period
            </span>
          </div>
        </div>

        {/* Bottom Split Row */}
        <div className="pt-2 border-t border-[#f5dce5] flex justify-between text-[11px] font-bold">
          <div className="text-gray-600">
            <span>Collection Rate</span>
            <h4 className="text-[#e20b08]">73%</h4>
          </div>
          <div className="text-gray-600">
            <span>Outstanding</span>
            <h4 className="text-[#e20b08]">₹ 34,56,150</h4>
          </div>
        </div>
      </div>

      {/* =====================================================
          5. PENDING FOR APPROVAL
         ===================================================== */}
      <div className="bg-[#fff7ed] border border-[#f4e4d2] rounded-xl p-3 flex flex-col justify-between shadow-2xs">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-[#ffecd4] flex items-center justify-center shrink-0">
                <Clock size={18} className="text-[#e08b00]" />
              </div>
              <div>
                <div className="text-base font-extrabold text-[#123b70]">₹ 28,64,800</div>
                <div className="text-[10px] font-bold text-gray-500">Pending for Approval</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center text-[10px] font-bold text-[#ee1919]">
            <div className="flex items-center">
              <ArrowDown size={13} className="mr-0.5" />
              <span className="text-[11px]">6%</span>
            </div>
            <span className="text-gray-400 font-medium text-[10px] mt-0.5">
              vs. previous period
            </span>
          </div>
        </div>

        {/* Bottom Split Row */}
        <div className="pt-2 border-t border-[#f4e4d2] flex justify-between text-[11px] font-bold">
          <div className="text-gray-600">
            <h4 className="text-[#e9570e]">285</h4>
            <span>Pending Cases</span>
          </div>
          <div className="text-gray-600">
            <h4 className="text-[#e9570e]">32</h4>
            <span>&gt; 7 Days</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          6. REJECTED / DENIED
         ===================================================== */}
      <div className="bg-[#fdf4ff] border border-[#f5d9fc] rounded-xl p-3 flex flex-col justify-between shadow-2xs">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-[#fae8ff] flex items-center justify-center shrink-0">
                <AlertCircle size={18} className="text-[#c026d3]" />
              </div>
              <div>
                <div className="text-base font-extrabold text-[#123b70]">₹ 6,42,350</div>
                <div className="text-[10px] font-bold text-gray-500">Rejected / Denied</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center text-xs font-bold text-[#079669] justify-center">
            <div className="flex items-center">
              <ArrowUp size={13} strokeWidth={2.7} className="mr-0.5" />
              <span>3%</span>
            </div>
            <span className="text-gray-400 font-medium text-[10px] ml-1 truncate">
              vs. previous period
            </span>
          </div>
        </div>

        {/* Bottom Split Row */}
        <div className="pt-2 border-t border-[#f5d9fc] flex justify-between text-[11px] font-bold">
          <div className="text-gray-600">
            <h4 className="text-[#7b0588]">48</h4>
            <span>Rejected Cases</span>
          </div>
          <div className="text-gray-600">
            <h4 className="text-[#7b0588]">5%</h4>
            <span>Rejection Rate</span>
          </div>
        </div>
      </div>
    </div>
  );
}
