import { User } from "lucide-react";
import { InvestigationGeneralInfo, PatientGeneralInfo, SubInvetigationItem } from "../types";

export default function LabInfoFilterBar({
  subInvestigationlists,
  patientGeneralInfo,
  investigationGeneralInfo,
}: {
  subInvestigationlists: SubInvetigationItem[];
  patientGeneralInfo: PatientGeneralInfo;
  investigationGeneralInfo: InvestigationGeneralInfo;
}) {
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
            <span className="font-bold text-gray-900 truncate">{patientGeneralInfo?.uhid}</span>

            <span className="text-gray-500 font-medium">Patient Name</span>
            <span className="font-bold text-gray-900">:</span>
            <span className="font-bold text-gray-900 truncate">
              {patientGeneralInfo?.patientName}
            </span>

            <span className="text-gray-500 font-medium">Age / Gender</span>
            <span className="font-bold text-gray-900">:</span>
            <span className="font-bold text-gray-900 flex items-center gap-1.5 truncate">
              {patientGeneralInfo?.age} / {patientGeneralInfo?.gender}
              <User size={12} className="text-blue-500 shrink-0" />
            </span>

            <span className="text-gray-500 font-medium">Mobile No</span>
            <span className="font-bold text-gray-900">:</span>
            <span className="font-bold text-gray-900 truncate">{patientGeneralInfo?.mobileNo}</span>
          </div>
        </div>

        {/* Column 2: Visit & Admission Details */}
        <div className="grid grid-cols-[max-content_12px_1fr] items-center gap-x-1.5 gap-y-1.5 lg:px-3 py-3 lg:py-0">
          <span className="text-gray-500 font-medium">Visit No.</span>
          <span className="font-bold text-gray-900">:</span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-900 break-all">{patientGeneralInfo?.visitNo}</span>
          </div>

          <span className="text-gray-500 font-medium">Department</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900 truncate">{patientGeneralInfo?.department}</span>

          <span className="text-gray-500 font-medium">Doctor</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900 truncate" title={patientGeneralInfo?.doctor}>
            {patientGeneralInfo?.doctor}
          </span>

          <span className="text-gray-500 font-medium">Ward / Bed</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900 truncate">
            {patientGeneralInfo?.ward ?? "-"} / {patientGeneralInfo?.bed ?? "-"}
          </span>

          <span className="text-gray-500 font-medium">Admitted On</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900 truncate">
            {patientGeneralInfo?.admittedOn} /{patientGeneralInfo?.admissionTime}
          </span>
        </div>

        {/* Column 3: Sample Details */}
        <div className="grid grid-cols-[max-content_12px_1fr] items-center gap-x-1.5 gap-y-1.5 lg:px-3 py-3 lg:py-0">
          <span className="text-gray-500 font-medium">Sample No.</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900 break-all">
            {investigationGeneralInfo?.sampleNo}
          </span>

          <span className="text-gray-500 font-medium">Barcode</span>
          <span className="font-bold text-gray-900">:</span>
          <div className="font-mono text-[10px] px-1.5 py-0.5 rounded text-gray-900 font-bold truncate">
            {investigationGeneralInfo?.barcode}
          </div>

          <span className="text-gray-500 font-medium">Sample Type</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900 truncate">
            {investigationGeneralInfo?.sampleType}
          </span>

          <span className="text-gray-500 font-medium">Priority</span>
          <span className="font-bold text-gray-900">:</span>
          <div className="relative w-full max-w-[130px]">
            <span className="font-bold text-gray-900 truncate">
              {investigationGeneralInfo?.priority}
            </span>
          </div>
        </div>

        {/* Column 4: Dates & Notes */}
        <div className="grid grid-cols-[max-content_12px_1fr] items-center gap-x-1.5 gap-y-1.5 lg:px-3 py-3 lg:py-0">
          <span className="text-gray-500 font-medium">Collection Date</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900 truncate">
            {investigationGeneralInfo?.collectionDate}
          </span>

          <span className="text-gray-500 font-medium">Received Date</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900 truncate">
            {investigationGeneralInfo?.receivedDate}
          </span>

          <span className="text-gray-500 font-medium">Reported Date</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900 truncate">
            {investigationGeneralInfo?.ReportedDate}
          </span>

          <span className="text-gray-500 font-medium">TAT</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900 truncate">{investigationGeneralInfo?.tat}</span>

          <span className="text-gray-500 font-medium">Clinical Notes</span>
          <span className="font-bold text-gray-900">:</span>
          <span
            className="font-bold text-gray-900 truncate"
            title={investigationGeneralInfo?.clinicalNotes}
          >
            {investigationGeneralInfo?.clinicalNotes}
          </span>
        </div>

        {/* Column 5: Machine Status */}
        <div className="grid grid-cols-[max-content_12px_1fr] items-center gap-x-1.5 gap-y-1.5 lg:pl-3 pt-3 lg:pt-0">
          <span className="text-gray-500 font-medium">Machine Name</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900 truncate">
            {investigationGeneralInfo?.machineName}
          </span>

          <span className="text-gray-500 font-medium">Machine Status</span>
          <span className="font-bold text-gray-900">:</span>
          <div>
            <span className="bg-orange-100 text-orange-700 text-[10px] font-extrabold px-2 py-0.5 rounded shadow-2xs">
              M
            </span>
          </div>

          <span className="text-gray-500 font-medium">Connection</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900 truncate">
            {investigationGeneralInfo?.connection}
          </span>

          <span className="text-gray-500 font-medium">QC Status</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-emerald-600 truncate">
            {investigationGeneralInfo?.qcStatus}
          </span>

          <span className="text-gray-500 font-medium">Last Sync</span>
          <span className="font-bold text-gray-900">:</span>
          <span className="font-bold text-gray-900 truncate">
            {investigationGeneralInfo?.lastSync}
          </span>
        </div>
      </div>
    </div>
  );
}
