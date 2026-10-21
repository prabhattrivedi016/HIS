import { ArrowDown, ArrowUp, CheckCircle2, Clock, FlaskConical, XCircle } from "lucide-react";
import { StateValueProps } from "../types";

export default function FilterBar({ statsValue }: { statsValue: StateValueProps }) {
  console.log("statsValue", statsValue);

  return (
    <div className="card">
      {/* ================= TOP HEADER ================= */}

      <div className="flex flex-row overflow-x-auto gap-3 px-3 py-2 hide-scrollbar ">
        {/* =====================================================
          1. TOTAL SAMPLES
         ===================================================== */}
        <div className="h-[80px] min-w-[220px] bg-[#f1f9ff] border border-[#dcecf7] rounded-lg px-3 py-2.5 flex flex-col justify-between shrink-0 overflow-hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-[50px] h-[50px] rounded-md bg-[#e1f2ff] flex items-center justify-center shrink-0">
              <FlaskConical size={30} strokeWidth={2.2} className="text-[#0875d1]" />
            </div>

            <div className="min-w-0 flex flex-col pl-2">
              <div className="text-[13px] font-bold text-gray-500 truncate">Total Samples</div>
              <div className="text-[20px] font-extrabold text-[#123b70] mt-0.5 truncate">
                {statsValue?.all}
              </div>
            </div>
          </div>

          <div className="flex items-center text-[12px] font-bold text-[#079669] text-center justify-start pl-[60px]">
            <ArrowUp size={14} strokeWidth={2.7} className="mr-0.5 shrink-0" />
            <span className="shrink-0">12%</span>
            <span className="text-gray-400 font-medium ml-1 truncate">from last week</span>
          </div>
        </div>

        {/* =====================================================
          2. collected
         ===================================================== */}
        <div className="h-[80px] min-w-[220px] bg-purple-200 border border-[#d6eee8] rounded-lg px-3 py-2.5 flex flex-col justify-between shrink-0 overflow-hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-[50px] h-[50px] rounded-md bg-purple-150 flex items-center justify-center shrink-0">
              <CheckCircle2 size={30} strokeWidth={2.2} className="text-purple-500" />
            </div>

            <div className="min-w-0 flex flex-col pl-2">
              <div className="text-[13px] font-bold text-gray-500 truncate">Collected</div>
              <div className="text-[20px] font-extrabold text-[#123b70] mt-0.5 truncate">
                {statsValue?.collected}
              </div>
            </div>
          </div>

          <div className="flex items-center text-[12px] font-bold text-[#079669] text-center justify-start pl-[60px]">
            <ArrowUp size={14} strokeWidth={2.7} className="mr-0.5 shrink-0" />
            <span className="shrink-0">8%</span>
            <span className="text-gray-400 font-medium ml-1 truncate">from yesterday</span>
          </div>
        </div>

        {/* =====================================================
          2. RECEIVED
         ===================================================== */}
        <div className="h-[80px] min-w-[220px] bg-[#eafaf6] border border-[#d6eee8] rounded-lg px-3 py-2.5 flex flex-col justify-between shrink-0 overflow-hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-[50px] h-[50px] rounded-md bg-[#d8f3eb] flex items-center justify-center shrink-0">
              <CheckCircle2 size={30} strokeWidth={2.2} className="text-[#159879]" />
            </div>

            <div className="min-w-0 flex flex-col pl-2">
              <div className="text-[13px] font-bold text-gray-500 truncate">Received</div>
              <div className="text-[20px] font-extrabold text-[#123b70] mt-0.5 truncate">
                {statsValue?.received}
              </div>
            </div>
          </div>

          <div className="flex items-center text-[12px] font-bold text-[#079669] text-center justify-start pl-[60px]">
            <ArrowUp size={14} strokeWidth={2.7} className="mr-0.5 shrink-0" />
            <span className="shrink-0">8%</span>
            <span className="text-gray-400 font-medium ml-1 truncate">from yesterday</span>
          </div>
        </div>

        {/* =====================================================
          3. PROCESSING
         ===================================================== */}
        {/* <div className="h-[80px] min-w-[220px] bg-[#fff7ed] border border-[#f4e4d2] rounded-lg px-3 py-2.5 flex flex-col justify-between shrink-0 overflow-hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-[50px] h-[50px] rounded-md bg-[#ffecd4] flex items-center justify-center shrink-0">
              <Cog size={30} strokeWidth={2.2} className="text-[#e08b00]" />
            </div>

            <div className="min-w-0 flex flex-col pl-2">
              <div className="text-[13px] font-bold text-gray-500 truncate">Processing</div>
              <div className="text-[20px] font-extrabold text-[#123b70] mt-0.5 truncate">74</div>
            </div>
          </div>

          <div className="flex items-center text-[12px] font-bold text-[#079669] text-center justify-start pl-[60px]">
            <ArrowUp size={14} strokeWidth={2.7} className="mr-0.5 shrink-0" />
            <span className="shrink-0">5%</span>
            <span className="text-gray-400 font-medium ml-1 truncate">from yesterday</span>
          </div>
        </div> */}

        {/* =====================================================
          4. PENDING
         ===================================================== */}
        <div className="h-[80px] min-w-[220px] bg-[#fffbeb] border border-[#fef3c7] rounded-lg px-3 py-2.5 flex flex-col justify-between shrink-0 overflow-hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-[50px] h-[50px] rounded-md bg-[#fef3c7] flex items-center justify-center shrink-0">
              <Clock size={30} strokeWidth={2.2} className="text-[#d97706]" />
            </div>

            <div className="min-w-0 flex flex-col pl-2">
              <div className="text-[13px] font-bold text-gray-500 truncate">Pending</div>
              <div className="text-[20px] font-extrabold text-[#123b70] mt-0.5 truncate">
                {statsValue?.pending}
              </div>
            </div>
          </div>

          <div className="flex items-center text-[12px] font-bold text-[#dc2626] text-center justify-start pl-[60px]">
            <ArrowDown size={14} strokeWidth={2.7} className="mr-0.5 shrink-0" />
            <span className="shrink-0">3%</span>
            <span className="text-gray-400 font-medium ml-1 truncate">from yesterday</span>
          </div>
        </div>

        {/* =====================================================
          5. REJECTED
         ===================================================== */}
        <div className="h-[80px] min-w-[220px] bg-[#fff1f5] border border-[#f5dce5] rounded-lg px-3 py-2.5 flex flex-col justify-between shrink-0 overflow-hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-[50px] h-[50px] rounded-md bg-[#ffe0e8] flex items-center justify-center shrink-0">
              <XCircle size={30} strokeWidth={2.2} className="text-[#e32655]" />
            </div>

            <div className="min-w-0 flex flex-col pl-2">
              <div className="text-[13px] font-bold text-gray-500 truncate">Rejected</div>
              <div className="text-[20px] font-extrabold text-[#123b70] mt-0.5 truncate">
                {statsValue?.rejected}
              </div>
            </div>
          </div>

          <div className="flex items-center text-[12px] font-bold text-[#dc2626] text-center justify-start pl-[60px]">
            <ArrowDown size={14} strokeWidth={2.7} className="mr-0.5 shrink-0" />
            <span className="shrink-0">1%</span>
            <span className="text-gray-400 font-medium ml-1 truncate">from yesterday</span>
          </div>
        </div>
      </div>
    </div>
  );
}
