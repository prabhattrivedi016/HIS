import { BarChart2, Bell, Calendar, Clock, FileText, Truck } from "lucide-react";
import HistoryFilterBar from "./components/HistoryFilterBar";
import HistorySearchBar from "./components/HistorySearchBar";
import HistoryTableData from "./components/HistoryTableData";

const LaboratoryHelp = () => {
  return (
    <div>
      <div className="page-container w-full min-w-0 p-3 sm:p-4 lg:p-6">
        <div className="flex items-start xl:items-center justify-between w-full flex-col xl:flex-row gap-4">
          <div className="flex-1">
            <h1 className="page-heading">Laboratory Help</h1>

            <nav className="helper-text">
              Home
              <span>››</span>
              <span>Laboratory Help</span>
            </nav>
          </div>

          {/* 6 Small Metric Cards replacing buttons, matching reference layout[cite: 1] */}
          <div className="flex items-center gap-2 overflow-x-auto w-full xl:w-auto pb-2 xl:pb-0 no-scrollbar mt-2">
            {/* Card 1: Today's Samples */}
            <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 flex items-center gap-2.5 shrink-0 shadow-2xs">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <BarChart2 size={16} />
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-medium">Today's Samples</div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-900">245</span>
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded">
                    +12%
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Pending Samples */}
            <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 flex items-center gap-2.5 shrink-0 shadow-2xs">
              <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                <Clock size={16} />
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-medium">Pending Samples</div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-900">48</span>
                  <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1 rounded">
                    +6%
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Outsource Samples */}
            <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 flex items-center gap-2.5 shrink-0 shadow-2xs">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <Truck size={16} />
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-medium">Outsource Samples</div>
                <div className="text-xs font-bold text-gray-900 mt-0.5">12</div>
              </div>
            </div>

            {/* Card 4: Critical Alerts */}
            <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 flex items-center gap-2.5 shrink-0 shadow-2xs">
              <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                <Bell size={16} />
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-medium">Critical Alerts</div>
                <div className="text-xs font-bold text-gray-900 mt-0.5">6</div>
              </div>
            </div>

            {/* Card 5: Reports Pending */}
            <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 flex items-center gap-2.5 shrink-0 shadow-2xs">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <FileText size={16} />
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-medium">Reports Pending</div>
                <div className="text-xs font-bold text-gray-900 mt-0.5">28</div>
              </div>
            </div>

            {/* Card 6: Date & Time */}
            <div className="bg-blue-50 border border-gray-200 rounded-xl px-3 py-2 flex items-center gap-2.5 shrink-0 shadow-2xs">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <Calendar size={16} />
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-medium">Monday, 29-Sep-2026</div>
                <div className="text-xs font-bold text-gray-900 mt-0.5">10:45 AM</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Table Data */}
        <HistorySearchBar />
        <HistoryFilterBar />
        <HistoryTableData />
      </div>
    </div>
  );
};

export default LaboratoryHelp;
