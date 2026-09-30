import { User, ChevronDown, Barcode } from "lucide-react";

export default function LabInfoFilterBar() {
  return (
    <div className="card bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-2xs mt-2">
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr_1fr_1fr_0.9fr] divide-y lg:divide-y-0 lg:divide-x divide-gray-200 gap-3 sm:gap-4 text-[11px] sm:text-xs text-gray-700">

        {/* Column 1: Patient Details */}
        <div className="flex gap-3 lg:pr-3 items-start pb-3 lg:pb-0">
          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 flex items-center justify-center shrink-0 mt-0.5 rounded-lg">
            <User size={24} className="text-gray-500 lg:w-8 lg:h-8" />
          </div>
          <div className="grid grid-cols-[max-content_12px_1fr] items-center gap-x-1.5 gap-y-1 flex-1 min-w-0">
            <span className="text-gray-500 font-medium">UHID</span>
            <span className="font-bold text-gray-900">:</span>
            <span className="font-bold text-gray-900 truncate">UHID00045896</span>

            <span className="text-gray-500 font-medium">Patient Name</span>
            <span className="font-bold text-gray-900">:</span>
            <span className="font-bold text-gray-900 truncate">Rajesh Kumar</span>

            <span className="text-gray-500 font-medium">Age / Gender</span>
            <span className="font-bold text-gray-900">:</span>
            <span className="font-bold text-gray-900 flex items-center gap-1.5 truncate">
              32 Y / Male
              <User size={12} className="text-blue-500 shrink-0" />
            </span>

            <span className="text-gray-500 font-medium">Mobile No</span>
            <span className="font-bold text-gray-900">:</span>
            <span className="font-bold text-gray-900 truncate">9876543210</span>
          </div>
        </div>

        {/* Column 2: Visit & Admission Details */}
        <div className="grid grid-cols-[max-content_12px_1fr] items-center gap-x-1.5 gap-y-1.5 lg:px-3 py-3 lg:py-0">
          <span className="text-gray-500 font-medium">Visit No.</span>
          <span className="font-bold text-gray-900">:</span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-900 break-all">IPD2026001258</span>
            <span className="bg-blue-100 text-blue-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded shrink-0">IPD</span>
          </div>

          <span className="text-gray-500 font-medium">Department</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900 truncate">Medicine</span>

          <span className="text-gray-500 font-medium">Doctor</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900 truncate" title="Dr. Amit Sharma (MD Medicine)">Dr. Amit Sharma</span>

          <span className="text-gray-500 font-medium">Ward / Bed</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900 truncate">Male Medicine / M-12</span>

          <span className="text-gray-500 font-medium">Admitted On</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900 truncate">08-01-2026 10:25</span>
        </div>

        {/* Column 3: Sample Details */}
        <div className="grid grid-cols-[max-content_12px_1fr] items-center gap-x-1.5 gap-y-1.5 lg:px-3 py-3 lg:py-0">
          <span className="text-gray-500 font-medium">Sample No.</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900 break-all">LB2026001258</span>

          <span className="text-gray-500 font-medium">Barcode</span>
          <span className="font-bold text-gray-900">:</span>
          <div className="font-mono text-[10px] px-1.5 py-0.5 rounded text-gray-900 font-bold truncate">
            <Barcode size={22}   className="font-bold " />
          </div>

          <span className="text-gray-500 font-medium">Sample Type</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900 truncate">Blood (EDTA)</span>

          <span className="text-gray-500 font-medium">Priority</span>
          <span className="font-bold text-gray-900">:</span>
          <div className="relative w-full max-w-[130px]">
            <select className="w-full bg-white border border-gray-200 rounded text-[11px] sm:text-xs px-2 py-0.5 sm:py-1 text-gray-800 font-semibold focus:outline-none appearance-none cursor-pointer">
              <option value="Routine">Routine</option>
              <option value="Urgent">Urgent</option>
              <option value="STAT">STAT</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Column 4: Dates & Notes */}
        <div className="grid grid-cols-[max-content_12px_1fr] items-center gap-x-1.5 gap-y-1.5 lg:px-3 py-3 lg:py-0">
          <span className="text-gray-500 font-medium">Collection Date</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900 truncate">10-01-2026 09:15</span>

          <span className="text-gray-500 font-medium">Received Date</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900 truncate">10-01-2026 09:32</span>

          <span className="text-gray-500 font-medium">Reported Date</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900 truncate">-</span>

          <span className="text-gray-500 font-medium">TAT</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900 truncate">60 Minutes</span>

          <span className="text-gray-500 font-medium">Clinical Notes</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900 truncate" title="Fever, generalized weakness.">Fever, weakness</span>
        </div>

        {/* Column 5: Machine Status */}
        <div className="grid grid-cols-[max-content_12px_1fr] items-center gap-x-1.5 gap-y-1.5 lg:pl-3 pt-3 lg:pt-0">
          <span className="text-gray-500 font-medium">Machine Name</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900 truncate">Sysmex XN</span>

          <span className="text-gray-500 font-medium">Machine Status</span>
          <span className="font-bold text-gray-900">:</span>
          <div>
            <span className="bg-orange-100 text-orange-700 text-[10px] font-extrabold px-2 py-0.5 rounded shadow-2xs">
              M
            </span>
          </div>

          <span className="text-gray-500 font-medium">Connection</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900 truncate">Active</span>

          <span className="text-gray-500 font-medium">QC Status</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-emerald-600 truncate">Passed</span>

          <span className="text-gray-500 font-medium">Last Sync</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900 truncate">09:30 AM</span>
        </div>

      </div>
    </div>
  );
}