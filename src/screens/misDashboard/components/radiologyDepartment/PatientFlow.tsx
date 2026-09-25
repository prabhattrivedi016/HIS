import { ArrowUp, UserRound, Users } from "lucide-react";

export default function PatientFlow() {
  const metrics = [
    {
      value: "1,964",
      label: "Total Patients",
      percentage: "11%",
      icon: Users,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      value: "1,210",
      label: "OPD Patients",
      percentage: "9%",
      icon: UserRound,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      value: "754",
      label: "IPD Patients",
      percentage: "15%",
      icon: UserRound,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  const flowData = [
    {
      label: "Registration",
      value: "1,964",
    },
    {
      label: "Test Ordered",
      value: "3,012",
    },
    {
      label: "Test Performed",
      value: "2,846",
    },
    {
      label: "Report Delivered",
      value: "2,732",
    },
  ];

  return (
    <div className="w-full min-w-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* ================= HEADER ================= */}
      <div className="px-3 py-2.5 flex items-center justify-between gap-2 border-b border-gray-100">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Users size={16} className="text-blue-600" />
          </div>

          <h3 className="text-[13px] sm:text-sm font-bold text-blue-950">Patient Flow</h3>
        </div>

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
        {metrics.map(item => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="
                min-w-0
                px-2
                sm:px-3
                py-2.5
              "
            >
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                {/* Icon */}
                <div
                  className={`
                    w-7 h-7
                    sm:w-8 sm:h-8
                    rounded-lg
                    ${item.iconBg}
                    flex
                    items-center
                    justify-center
                    shrink-0
                  `}
                >
                  <Icon size={13} className={item.iconColor} />
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  {/* Number */}
                  <p className="text-sm sm:text-base font-bold text-blue-900 leading-none whitespace-nowrap">
                    {item.value}
                  </p>

                  {/* Label - allowed to wrap */}
                  <p
                    className="
                      mt-1
                      text-[9px]
                      sm:text-[10px]
                      text-gray-500
                      font-medium
                      leading-tight
                      break-words
                    "
                  >
                    {item.label}
                  </p>

                  {/* Percentage */}
                  <p className="mt-0.5 flex items-center text-[9px] text-emerald-600 font-bold whitespace-nowrap">
                    <ArrowUp size={9} className="mr-0.5 shrink-0" />
                    {item.percentage}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= PATIENT FLOW ================= */}
      <div className="p-2.5 sm:p-3">
        <div
          className="
            grid
            grid-cols-1
            min-[400px]:grid-cols-2
            gap-2.5
            sm:gap-3
          "
        >
          {flowData.map((item, index) => (
            <div key={item.label} className="relative min-w-0">
              {/* Card */}
              <div
                className="
                  min-h-[64px]
                  w-full
                  bg-blue-50/60
                  border
                  border-blue-100
                  rounded-lg
                  px-2
                  sm:px-3
                  py-2
                  flex
                  items-center
                  justify-center
                "
              >
                <div className="min-w-0 text-center w-full">
                  {/* Label */}
                  <p
                    className="
                      text-[9px]
                      sm:text-[10px]
                      font-medium
                      text-gray-500
                      leading-tight
                      break-words
                    "
                  >
                    {item.label}
                  </p>

                  {/* Value */}
                  <p
                    className="
                      mt-0.5
                      text-sm
                      sm:text-base
                      font-extrabold
                      text-blue-950
                      leading-tight
                      whitespace-nowrap
                    "
                  >
                    {item.value}
                  </p>
                </div>
              </div>

              {/* Arrow only between cards in desktop/two-column layout */}
              {index % 2 === 0 && (
                <div
                  className="
                    hidden
                    min-[400px]:flex
                    absolute
                    -right-[9px]
                    top-1/2
                    -translate-y-1/2
                    z-10
                    w-[18px]
                    h-[18px]
                    rounded-full
                    bg-white
                    border
                    border-gray-200
                    items-center
                    justify-center
                  "
                >
                  <span className="text-[10px] font-bold text-blue-500">→</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
