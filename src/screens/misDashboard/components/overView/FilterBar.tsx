import InputField from "@/components/customInputField";
import { misDashboardTabs } from "@/constants/constants";

export default function HeaderSection({ activeTab, setActiveTab }) {
  return (
    <div className="w-full bg-white border-b border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)] px-3 sm:px-4 pt-3">
      {/* ================= FILTER SECTION ================= */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-end justify-between gap-3 pt-2 pb-3 border-t border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:flex xl:flex-wrap items-center gap-2.5 flex-1 min-w-0">
          {/* DATE RANGE */}
          <div className="w-full xl:w-auto xl:min-w-[180px] flex-1">
            <InputField label="Date Range">
              <input className="input-field" />
            </InputField>
          </div>

          {/* DEPARTMENT */}
          <div className="w-full xl:w-auto xl:min-w-[140px] flex-1">
            <InputField label="Department">
              <input className="input-field" />
            </InputField>
          </div>

          {/* PAYMENT MODE */}
          <div className="w-full xl:w-auto xl:min-w-[115px] flex-1">
            <InputField label="Payment Mode">
              <input className="input-field" />
            </InputField>
          </div>

          {/* PAYER / TPA */}
          <div className="w-full xl:w-auto xl:min-w-[115px] flex-1">
            <InputField label="Payable/TPA">
              <input className="input-field" />
            </InputField>
          </div>

          {/* BRANCH */}
          <div className="w-full xl:w-auto xl:min-w-[150px] flex-1">
            <InputField label="Branch">
              <input className="input-field" />
            </InputField>
          </div>

          {/* APPLY BUTTON */}
          <button
            className="
           save-btn mt-3.5
          "
          >
            Apply
          </button>
        </div>
      </div>

      {/* =========================================================
      DASHBOARD TABS - FULL WIDTH
      ========================================================= */}
      <div className="w-full bg-[#f7f9fc] border border-gray-200 border-b-0 rounded-t-md overflow-x-auto">
        <div className="flex w-max xl:w-full items-stretch">
          {misDashboardTabs.map(tab => {
            // FIXED: Checking against dynamic state instead of hardcoded index 0
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)} // FIXED: Updates parent state on click
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
                        bg-[#0B5394]
                        text-white
                        border-[#09457A]
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
