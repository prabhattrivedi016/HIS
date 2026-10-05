import { Clock, DownloadIcon, FileText, Upload } from "lucide-react";
import OutsourceAction from "./components/OutsourceAction";
import OutsourceFooter from "./components/OutsourceFooter";
import OutsourceSearchBar from "./components/OutsourceSearchBar";
import OutsourceTableData from "./components/OutsourceTableData";

const SendOutsource = () => {
  return (
    <div>
      <div className="page-container w-full min-w-0 p-3 sm:p-4 lg:p-6">
        <div className="flex items-start xl:items-center justify-between w-full flex-col xl:flex-row gap-4">
          <div className="flex-1">
            <h1 className="page-heading">Send Outsource</h1>

            <nav className="helper-text">
              Home
              <span>››</span>
              <span>Send Outsource</span>
            </nav>
          </div>

          {/* 6 Small Metric Cards replacing buttons, matching reference layout[cite: 1] */}
          <div className="flex items-center gap-2 overflow-x-auto w-full xl:w-auto pb-2 xl:pb-0 no-scrollbar ">
            {/* Card 1: Pending to send */}
            <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 flex items-center gap-2.5 shrink-0 shadow-2xs">
              <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                <Clock size={16} />
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-medium">Pending to send</div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-900">12</span>
                </div>
              </div>
            </div>

            {/* Card 2: Sent Today */}
            <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 flex items-center gap-2.5 shrink-0 shadow-2xs">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <Upload size={16} />
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-medium">Sent Today</div>
                <div className="text-xs font-bold text-gray-900 mt-0.5">8</div>
              </div>
            </div>

            {/* Card 3: Receive Report */}
            <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 flex items-center gap-2.5 shrink-0 shadow-2xs">
              <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                <DownloadIcon size={16} />
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-medium">Receive Report</div>
                <div className="text-xs font-bold text-gray-900 mt-0.5">6</div>
              </div>
            </div>

            {/* Card 4: Total Outsourced */}
            <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 flex items-center gap-2.5 shrink-0 shadow-2xs">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <FileText size={16} />
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-medium">Total Outsourced</div>
                <div className="text-xs font-bold text-gray-900 mt-0.5">28</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Table Data */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-start mt-4 ">
          <div className="lg:col-span-10 min-w-0">
            <OutsourceSearchBar />
            <OutsourceTableData />
            <OutsourceFooter />
          </div>
          <div className="lg:col-span-2 min-w-0">
            <OutsourceAction />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendOutsource;
