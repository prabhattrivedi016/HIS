import { Layers, ChevronDown } from "lucide-react";

export default function DeptRevenueChart() {
  const tatData = [
    {
      name: "X-Ray",
      opdVal: "0.6",
      ipdVal: "1.2",
      opdWidth: "25%",
      ipdWidth: "45%",
    },
    {
      name: "Ultrasound",
      opdVal: "1.2",
      ipdVal: "2.4",
      opdWidth: "35%",
      ipdWidth: "60%",
    },
    {
      name: "CT Scan",
      opdVal: "2.8",
      ipdVal: "5.1",
      opdWidth: "55%",
      ipdWidth: "85%",
    },
    {
      name: "MRI",
      opdVal: "4.2",
      ipdVal: "7.6",
      opdWidth: "70%",
      ipdWidth: "100%",
    },
    {
      name: "Mammography",
      opdVal: "1.8",
      ipdVal: "3.1",
      opdWidth: "40%",
      ipdWidth: "65%",
    },
    {
      name: "Fluoroscopy",
      opdVal: "1.5",
      ipdVal: "2.9",
      opdWidth: "38%",
      ipdWidth: "62%",
    },
    {
      name: "DEXA",
      opdVal: "1.1",
      ipdVal: "2.0",
      opdWidth: "30%",
      ipdWidth: "50%",
    },
    {
      name: "Others",
      opdVal: "1.9",
      ipdVal: "3.4",
      opdWidth: "42%",
      ipdWidth: "68%",
    },
  ];

  return (
    <div className="w-full md:max-w-full bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-2xs flex flex-col justify-between overflow-hidden">
      <div>
        {/* Header & Dropdown */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-800 flex items-center">
            <Layers size={17} className="text-blue-600 mr-2" /> Turn Around Time
            (TAT)
          </h3>

          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-gray-600 shrink-0 cursor-pointer hover:bg-gray-100 transition-colors">
            <span>This Month</span>
            <ChevronDown size={13} className="ml-1 text-gray-400" />
          </div>
        </div>

        {/* Legends below heading */}
        <div className="flex items-center space-x-6 mb-4 text-[11px] font-semibold justify-center">
          <span className="flex items-center text-gray-600">
            <span className="w-3 h-3 bg-blue-600 rounded-sm mr-1.5 shrink-0" />
            OPD TAT (Hrs)
          </span>
          <span className="flex items-center text-gray-600">
            <span className="w-3 h-3 bg-emerald-500 rounded-sm mr-1.5 shrink-0" />
            IPD TAT (Hrs)
          </span>
        </div>

        {/* TAT Rows */}
        <div className="space-y-5 pt-1">
          {tatData.map((item) => (
            <div key={item.name} className="flex items-center text-xs">
              <span className="w-28 font-bold text-gray-700 truncate">
                {item.name}
              </span>
              <div className="flex-1 mx-2 grid grid-cols-2 gap-3 items-center">
                {/* OPD Bar (Blue) - Starts from left with value closer to bar width */}
                <div className="flex items-center space-x-1">
                  <div className="w-full h-5 flex justify-start overflow-hidden">
                    <div
                      style={{ width: item.opdWidth }}
                      className="h-full bg-blue-600 flex items-center px-1"
                    />
                  </div>
                  <span className="font-extrabold text-gray-800 text-[11px] shrink-0">
                    {item.opdVal}
                  </span>
                </div>

                {/* IPD Bar (Green) - Starts from left with value closer to bar width */}
                <div className="flex items-center space-x-1">
                  <div className="w-full h-5 flex overflow-hidden">
                    <div
                      style={{ width: item.ipdWidth }}
                      className="h-full bg-emerald-500 flex items-center px-1"
                    />
                  </div>
                  <span className="font-extrabold text-gray-800 text-[11px] shrink-0">
                    {item.ipdVal}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
