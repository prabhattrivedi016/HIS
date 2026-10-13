import { User, ChevronDown, Barcode } from "lucide-react";

export default function MedicalInfoFilterBar() {
  return (
    <div className="card bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-2xs mt-1">
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr_1fr_1fr] divide-y lg:divide-y-0 lg:divide-x divide-gray-200 gap-3 sm:gap-4 text-[11px] sm:text-xs text-gray-700">

        {/* Column 1: Patient Details */}
        <div className="flex gap-3 lg:pr-3 items-start pb-3 lg:pb-0">
          {/* Avatar */}
          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 flex items-center justify-center shrink-0 mt-0.5 rounded-lg">
            <User size={24} className="text-gray-500 lg:w-8 lg:h-8" />
          </div>

          {/* Right Side Content Container */}
          <div className="flex flex-col flex-1 min-w-0 gap-2">

            {/* Patient Name & Badges */}
            <div className="flex items-center gap-1.5 flex-wrap ">
              <span className="font-bold text-gray-900 text-sm sm:text-base truncate">Rajesh Kumar</span>
              <span className="bg-blue-100 text-blue-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded shrink-0">IPD</span>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded shrink-0">Cash</span>
            </div>

            {/* UHID, IP No, and other details grid */}
            <div className="grid grid-cols-[max-content_12px_1fr] items-center gap-x-1.5 gap-y-1 min-w-0 ">
              <span className="text-gray-500 font-medium">UHID</span>
              <span className="font-bold text-gray-900">:</span>
              <span className="font-bold text-gray-900 truncate">UHID00045896</span>

              <span className="text-gray-500 font-medium">IP No.</span>
              <span className="font-bold text-gray-900">:</span>
              <span className="font-bold text-gray-900 truncate">IP98765432</span>

              
            </div>

          </div>
        </div>

        {/* Column 2: Visit & Admission Details */}
        <div className="grid grid-cols-[max-content_12px_1fr] items-center gap-x-1.5 gap-y-1.5 lg:px-3 py-3 lg:py-0">
          <span className="text-gray-500 font-medium">Age/Gender</span>
          <span className="font-bold text-gray-900">:</span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-900 break-all">32 Y / Male</span>
          </div>

          <span className="text-gray-500 font-medium">Admission Date</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900 truncate">08-01-2026 10:25</span>

          <span className="text-gray-500 font-medium">Department</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900 truncate" title="General Medicine">General Medicine</span>

          <span className="text-gray-500 font-medium">Consultant</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900 truncate" title="Dr. Amit Sharma (MD Medicine)">Dr. Amit Sharma</span>

        </div>


        {/* Column 3: Dates & Notes */}
        <div className="grid grid-cols-[max-content_12px_1fr] items-center gap-x-1.5 gap-y-1.5 lg:px-3 py-3 lg:py-0">
          <span className="text-gray-500 font-medium">Bed No.</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900 truncate">B-12</span>

          <span className="text-gray-500 font-medium">Panel</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900 truncate">Self Pay</span>

          <span className="text-gray-500 font-medium">Allergy</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900 truncate">-</span>

          <span className="text-gray-500 font-medium">Remark</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900 truncate">-</span>

        </div>

        {/* Column 4: Machine Status & View Details Button */}
        <div className="flex flex-col justify-between lg:pl-3 py-4 h-full bg-red-50 px-3 rounded-lg">
          <div className="grid grid-cols-[max-content_12px_1fr] items-center gap-x-1.5 gap-y-1.5">
            <span className="text-gray-500 font-medium">Outstanding</span>
            <span className="font-bold text-gray-900">:</span>
            <span className="font-bold text-red-600 truncate">5480.00</span>

            <span className="text-gray-500 font-medium">Advance</span>
            <span className="font-bold text-gray-900">:</span>
            <div className="flex items-center justify-between gap-2">
              <span className="text-gray-700 text-[10px] font-extrabold ">
                10,000.00
              </span>
              <button
                onClick={() => alert("View Details clicked")}
                className="save-btn flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <User size={14} />
                <span>View Details</span>
              </button>
            </div>

            <span className="text-gray-500 font-medium">Credit Limit</span>
            <span className="font-bold text-gray-900">:</span>
            <span className="font-bold text-red-600 truncate">0.00</span>
          </div>
        </div>

      </div>
    </div>
  );
}