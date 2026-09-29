import {
  Activity,
  Plus,
  Barcode,
  Upload,
  Download,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  FlaskConical,
  CheckCircle2,
  Clock,
  XCircle,
  Cog,
} from "lucide-react";

export default function FilterBar() {

  return (
    <div className="card">
      {/* ================= TOP HEADER ================= */}
      

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 px-3 ">
        {/* =====================================================
          1. TOTAL SAMPLES
         ===================================================== */}
        <div className="h-[110px] bg-[#f1f9ff] border border-[#dcecf7] rounded-lg px-3 py-2.5 flex flex-col justify-between min-w-0 overflow-hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-[68px] h-[68px] rounded-md bg-[#e1f2ff] flex items-center justify-center shrink-0">
              <FlaskConical
                size={40}
                strokeWidth={2.2}
                className="text-[#0875d1]"
              />
            </div>

            <div className="min-w-0 flex flex-col">
              <div className="text-[15px] font-bold text-gray-500 truncate sm:ml-4 lg:ml-6">
                Total Samples
              </div>
              <div className="text-[20px] font-extrabold text-[#123b70] mt-0.5 truncate sm:ml-4 lg:ml-6">
                1,248
              </div>
            </div>
          </div>

          <div className="flex items-center text-[14px] font-bold text-[#079669] text-center justify-center sm:ml-10 lg:ml-21">
            <ArrowUp size={16} strokeWidth={2.7} className="mr-0.5 shrink-0" />
            <span className="shrink-0">12%</span>
            <span className="text-gray-400 font-medium ml-1 truncate">
              from last week
            </span>
          </div>
        </div>

        {/* =====================================================
          2. RECEIVED
         ===================================================== */}
        <div className="h-[110px] bg-[#eafaf6] border border-[#d6eee8] rounded-lg px-3 py-2.5 flex flex-col justify-between min-w-0 overflow-hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-[68px] h-[68px] rounded-md bg-[#d8f3eb] flex items-center justify-center shrink-0">
              <CheckCircle2
                size={40}
                strokeWidth={2.2}
                className="text-[#159879]"
              />
            </div>

            <div className="min-w-0">
              <div className="text-[15px] font-bold text-gray-500 truncate sm:ml-4 lg:ml-6">
                Received
              </div>
              <div className="text-[20px] font-extrabold text-[#123b70] mt-0.5 truncate sm:ml-4 lg:ml-6">
                186
              </div>
            </div>
          </div>

          <div className="flex items-center text-[14px] font-bold text-[#079669] text-center justify-center sm:ml-10 lg:ml-21">
            <ArrowUp size={16} strokeWidth={2.7} className="mr-0.5 shrink-0" />
            <span className="shrink-0">8%</span>
            <span className="text-gray-400 font-medium ml-1 truncate">
              from yesterday
            </span>
          </div>
        </div>

        {/* =====================================================
          3. PROCESSING
         ===================================================== */}
        <div className="h-[110px] bg-[#fff7ed] border border-[#f4e4d2] rounded-lg px-3 py-2.5 flex flex-col justify-between min-w-0 overflow-hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-[68px] h-[68px] rounded-md bg-[#ffecd4] flex items-center justify-center shrink-0">
              <Cog size={40} strokeWidth={2.2} className="text-[#e08b00]" />
            </div>

            <div className="min-w-0">
              <div className="text-[15px] font-bold text-gray-500 truncate sm:ml-4 lg:ml-6">
                Processing
              </div>
              <div className="text-[20px] font-extrabold text-[#123b70] mt-0.5 truncate sm:ml-4 lg:ml-6">
                74
              </div>
            </div>
          </div>

          <div className="flex items-center text-[14px] font-bold text-[#079669] text-center justify-center sm:ml-10 lg:ml-21">
            <ArrowUp size={16} strokeWidth={2.7} className="mr-0.5 shrink-0" />
            <span className="shrink-0">5%</span>
            <span className="text-gray-400 font-medium ml-1 truncate">
              from yesterday
            </span>
          </div>
        </div>

        {/* =====================================================
          4. PENDING
         ===================================================== */}
        <div className="h-[110px] bg-[#fffbeb] border border-[#fef3c7] rounded-lg px-3 py-2.5 flex flex-col justify-between min-w-0 overflow-hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-[68px] h-[68px] rounded-md bg-[#fef3c7] flex items-center justify-center shrink-0">
              <Clock size={40} strokeWidth={2.2} className="text-[#d97706]" />
            </div>

            <div className="min-w-0">
              <div className="text-[15px] font-bold text-gray-500 truncate sm:ml-4 lg:ml-6">
                Pending
              </div>
              <div className="text-[20px] font-extrabold text-[#123b70] mt-0.5 truncate sm:ml-4 lg:ml-6">
                32
              </div>
            </div>
          </div>

          <div className="flex items-center text-[14px] font-bold text-[#dc2626] text-center justify-center sm:ml-10 lg:ml-21">
            <ArrowDown
              size={16}
              strokeWidth={2.7}
              className="mr-0.5 shrink-0"
            />
            <span className="shrink-0">3%</span>
            <span className="text-gray-400 font-medium ml-1 truncate">
              from yesterday
            </span>
          </div>
        </div>

        {/* =====================================================
          5. REJECTED
         ===================================================== */}
        <div className="h-[110px] bg-[#fff1f5] border border-[#f5dce5] rounded-lg px-3 py-2.5 flex flex-col justify-between min-w-0 overflow-hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-[68px] h-[68px] rounded-md bg-[#ffe0e8] flex items-center justify-center shrink-0">
              <XCircle size={40} strokeWidth={2.2} className="text-[#e32655]" />
            </div>

            <div className="min-w-0">
              <div className="text-[15px] font-bold text-gray-500 truncate sm:ml-4 lg:ml-6">
                Rejected
              </div>
              <div className="text-[20px] font-extrabold text-[#123b70] mt-0.5 truncate sm:ml-4 lg:ml-6">
                8
              </div>
            </div>
          </div>

          <div className="flex items-center text-[14px] font-bold text-[#dc2626] text-center justify-center sm:ml-10 lg:ml-21">
            <ArrowDown
              size={16}
              strokeWidth={2.7}
              className="mr-0.5 shrink-0"
            />
            <span className="shrink-0">1%</span>
            <span className="text-gray-400 font-medium ml-1 truncate">
              from yesterday
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}