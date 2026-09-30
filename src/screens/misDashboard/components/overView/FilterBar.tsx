import InputField from "@/components/customInputField";
import { misDashboardTabs } from "@/constants/constants";

export default function HeaderSection({ activeTab, setActiveTab }) {
  return (
    <div className="w-full bg-white border-b border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)] px-3 sm:px-4 pt-3">
      {/* ================= FILTER SECTION ================= */}
      <div className="w-full pt-2 pb-3 border-t border-gray-100 overflow-x-auto">
        <div className="flex flex-nowrap items-end gap-2.5 min-w-max w-full">
          {/* DATE RANGE */}
          <div className="flex-1 min-w-[140px]">
            <InputField label="Date Range">
              <input className="input-field" />
            </InputField>
          </div>

          {/* DEPARTMENT */}
          <div className="flex-1 min-w-[140px]">
            <InputField label="Department">
              <input className="input-field" />
            </InputField>
          </div>

          {/* PAYMENT MODE */}
          <div className="flex-1 min-w-[140px]">
            <InputField label="Payment Mode">
              <input className="input-field" />
            </InputField>
          </div>

          {/* PAYER / TPA */}
          <div className="flex-1 min-w-[140px]">
            <InputField label="Payable/TPA">
              <input className="input-field" />
            </InputField>
          </div>

          {/* BRANCH */}
          <div className="flex-1 min-w-[140px]">
            <InputField label="Branch">
              <input className="input-field" />
            </InputField>
          </div>

          {/* APPLY BUTTON */}
          <button
            className="
            h-[32px]
            px-7
            bg-[#0969d7]
            hover:bg-[#075bbd]
            text-white
            text-[11px]
            font-bold
            rounded-md
            shadow-sm
            transition-colors
            cursor-pointer
            shrink-0
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
                        bg-[#0875d1]
                        text-white
                        border-[#0875d1]
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
