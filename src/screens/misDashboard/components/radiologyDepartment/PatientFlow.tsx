import { Users, UserRound, ArrowUp } from "lucide-react";

export default function PatientFlow() {
  return (
    <div className="w-full min-w-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* ================= HEADER ================= */}
      <div className="px-3 py-2.5 flex items-center justify-between gap-2 border-b border-gray-100">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Users size={16} className="text-blue-600" />
          </div>

          <h3 className="text-[13px] sm:text-sm font-bold text-blue-950 truncate">
            Patient Flow
          </h3>
        </div>

        {/* Today dropdown */}
        <select
          className="
            shrink-0
            h-7
            px-2
            text-[10px]
            sm:text-[11px]
            font-medium
            text-gray-700
            bg-white
            border
            border-gray-200
            rounded-md
            outline-none
            focus:border-blue-400
          "
          defaultValue="Today"
        >
          <option>Today</option>
          <option>This Week</option>
          <option>This Month</option>
        </select>
      </div>

      {/* ================= KEY METRICS ================= */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
        {/* Total Patients */}
        <div className="min-w-0 px-2 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
              <Users size={17} className="text-emerald-600" />
            </div>

            <div className="min-w-0">
              <p className="text-base sm:text-lg font-extrabold text-blue-900 leading-none truncate">
                1,964
              </p>

              <p className="mt-1 text-[9px] sm:text-[10px] text-gray-500 font-medium truncate">
                Total Patients
              </p>

              <p className="mt-0.5 flex items-center text-[9px] text-emerald-600 font-bold">
                <ArrowUp size={10} className="mr-0.5 shrink-0" />
                11%
              </p>
            </div>
          </div>
        </div>

        {/* OPD Patients */}
        <div className="min-w-0 px-2 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <UserRound size={17} className="text-blue-600" />
            </div>

            <div className="min-w-0">
              <p className="text-base sm:text-lg font-extrabold text-blue-900 leading-none truncate">
                1,210
              </p>

              <p className="mt-1 text-[9px] sm:text-[10px] text-gray-500 font-medium truncate">
                OPD Patients
              </p>

              <p className="mt-0.5 flex items-center text-[9px] text-emerald-600 font-bold">
                <ArrowUp size={10} className="mr-0.5 shrink-0" />
                9%
              </p>
            </div>
          </div>
        </div>

        {/* IPD Patients */}
        <div className="min-w-0 px-2 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
              <UserRound size={17} className="text-purple-600" />
            </div>

            <div className="min-w-0">
              <p className="text-base sm:text-lg font-extrabold text-blue-900 leading-none truncate">
                754
              </p>

              <p className="mt-1 text-[9px] sm:text-[10px] text-gray-500 font-medium truncate">
                IPD Patients
              </p>

              <p className="mt-0.5 flex items-center text-[9px] text-emerald-600 font-bold">
                <ArrowUp size={10} className="mr-0.5 shrink-0" />
                15%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= PATIENT FLOW ================= */}
      <div className="p-2.5 sm:p-3">
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {/* ================= CARD 1 ================= */}
          <div className="relative min-w-0">
            <div
              className="
                h-[64px]
                w-full
                bg-blue-50/60
                border border-blue-100
                rounded-lg
                px-2
                sm:px-3
                flex
                items-center
                justify-center
                gap-2
              "
            >
              

              <div className="min-w-0 text-center">
                <p className="text-[9px] sm:text-[10px] font-medium text-gray-500 leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                  Registration
                </p>

                <p className="mt-0.5 text-sm sm:text-base font-extrabold text-blue-950 leading-tight">
                  1,964
                </p>
              </div>
            </div>

            {/* Arrow */}
            <div
              className="
                absolute
                -right-[9px]
                top-1/2
                -translate-y-1/2
                z-10
                w-[18px]
                h-[18px]
                rounded-full
                bg-white
                border border-gray-200
                flex items-center justify-center
              "
            >
              <span className="text-[10px] font-bold text-blue-500">→</span>
            </div>
          </div>

          {/* ================= CARD 2 ================= */}
          <div className="min-w-0">
            <div
              className="
                h-[64px]
                w-full
                bg-blue-50/60
                border border-blue-100
                rounded-lg
                px-2
                sm:px-3
                flex
                items-center
                justify-center
                gap-2
              "
            >
              

              <div className="min-w-0 text-center">
                <p className="text-[9px] sm:text-[10px] font-medium text-gray-500 leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                  Test Ordered
                </p>

                <p className="mt-0.5 text-sm sm:text-base font-extrabold text-blue-950 leading-tight">
                  3,012
                </p>
              </div>
            </div>
          </div>

          {/* ================= CARD 3 ================= */}
          <div className="relative min-w-0">
            <div
              className="
                h-[64px]
                w-full
                bg-blue-50/60
                border border-blue-100
                rounded-lg
                px-2
                sm:px-3
                flex
                items-center
                justify-center
                gap-2
              "
            >
             

              <div className="min-w-0 text-center">
                <p className="text-[9px] sm:text-[10px] font-medium text-gray-500 leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                  Test Performed
                </p>

                <p className="mt-0.5 text-sm sm:text-base font-extrabold text-blue-950 leading-tight">
                  2,846
                </p>
              </div>
            </div>

            {/* Arrow */}
            <div
              className="
                absolute
                -right-[9px]
                top-1/2
                -translate-y-1/2
                z-10
                w-[18px]
                h-[18px]
                rounded-full
                bg-white
                border border-gray-200
                flex items-center justify-center
              "
            >
              <span className="text-[10px] font-bold text-blue-500">→</span>
            </div>
          </div>

          {/* ================= CARD 4 ================= */}
          <div className="min-w-0">
            <div
              className="
                h-[64px]
                w-full
                bg-blue-50/60
                border border-blue-100
                rounded-lg
                px-2
                sm:px-3
                flex
                items-center
                justify-center
                gap-2
              "
            >
              

              <div className="min-w-0 text-center">
                <p className="text-[9px] sm:text-[10px] font-medium text-gray-500 leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                  Report Delivered
                </p>

                <p className="mt-0.5 text-sm sm:text-base font-extrabold text-blue-950 leading-tight">
                  2,732
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
