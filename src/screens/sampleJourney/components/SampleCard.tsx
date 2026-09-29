import { Barcode, Calendar, Droplet, Eye, FlaskConical, User } from "lucide-react";

export default function SampleCard() {
  const handleViewReport = () => {
    alert("View Report clicked!");
  };

  return (
    <div className="card">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 items-center text-xs">
        {/* 1. Sample ID */}
        <div className="flex items-center gap-2.5 pr-3 lg:border-r border-gray-200">
          <div className="text-blue-600 shrink-0">
            <Barcode size={22} />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-gray-400 uppercase">Sample ID</div>
            <div className="font-extrabold text-blue-600 truncate">S-260923-001</div>
          </div>
        </div>

        {/* 2. UHID */}
        <div className="flex items-center gap-2.5 px-3 lg:border-r border-gray-200">
          <div className="text-blue-600 shrink-0 bg-blue-50 p-1.5 rounded-lg">
            <User size={16} />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-gray-400 uppercase">UHID</div>
            <div className="font-extrabold text-gray-800 truncate">UHID0001</div>
          </div>
        </div>

        {/* 3. Patient Name */}
        <div className="flex items-center gap-2.5 px-3 lg:border-r border-gray-200">
          <div className="text-blue-600 shrink-0 bg-blue-50 p-1.5 rounded-lg">
            <User size={16} />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-gray-400 uppercase">Patient Name</div>
            <div className="font-extrabold text-gray-900 truncate">Rahul Sharma</div>
            <div className="text-[10px] text-gray-500 truncate">Male / 34 Years</div>
          </div>
        </div>

        {/* 4. Sample Type */}
        <div className="flex items-center gap-2.5 px-3 lg:border-r border-gray-200">
          <div className="text-rose-600 shrink-0 bg-rose-50 p-1.5 rounded-lg">
            <Droplet size={16} />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-gray-400 uppercase">Sample Type</div>
            <div className="font-extrabold text-gray-800 truncate">Blood</div>
          </div>
        </div>

        {/* 5. Tests Requested */}
        <div className="flex items-center gap-2.5 px-3 lg:border-r border-gray-200">
          <div className="text-emerald-600 shrink-0 bg-emerald-50 p-1.5 rounded-lg">
            <FlaskConical size={16} />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-gray-400 uppercase">Tests Requested</div>
            <div className="font-extrabold text-gray-800 truncate">CBC, LFT, KFT</div>
          </div>
        </div>

        {/* 6. Collection Date & Time */}
        <div className="flex items-center gap-2.5 px-3 lg:border-r border-gray-200">
          <div className="text-blue-600 shrink-0 bg-blue-50 p-1.5 rounded-lg">
            <Calendar size={16} />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-gray-400 uppercase">
              Collection Date & Time
            </div>
            <div className="font-extrabold text-gray-800 text-[11px]">
              23-09-2026
              <br />
              09:15 AM
            </div>
          </div>
        </div>

        {/* 7. Current Status */}
        <div className="flex items-center  px-3 lg:border-r border-gray-200">
          <div className="min-w-0 ">
            <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Current Status</div>
            <span className="inline-block bg-emerald-100 text-emerald-700 font-bold px-3 py-1  text-xs text-center">
              Reported
            </span>
          </div>
        </div>

        {/* 8. View Report Button */}
        <div className="flex items-center justify-start lg:justify-center">
          <button
            onClick={handleViewReport}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-white hover:bg-blue-50 text-blue-600 border border-blue-500 font-bold text-xs py-2 px-3 rounded-xl transition-all cursor-pointer active:scale-95 shadow-2xs whitespace-nowrap"
          >
            <Eye size={15} />
            <span>View Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}
