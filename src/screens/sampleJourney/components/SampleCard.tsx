import { Calendar, Droplet, FlaskConical, FlaskConicalIcon, User } from "lucide-react";
import { SampleJourneyItem } from "../types";

export default function SampleCard({
  sampleJourneyValue,
}: {
  sampleJourneyValue: SampleJourneyItem | null;
}) {
  const handleViewReport = () => {
    alert("View Report clicked!");
  };

  return (
    <div className="card w-full overflow-x-auto hide-scrollbar">
      <div className="flex items-center gap-4 text-xs min-w-max pb-1">
        {/* 1. Sample ID */}
        <div className="flex items-center gap-2 pr-4 border-r border-gray-200 shrink-0">
          <div className="text-blue-600 shrink-0">
            <FlaskConicalIcon size={20} />
          </div>
          <div className="whitespace-nowrap">
            <div className="text-[10px] font-bold text-gray-400 uppercase">Lab No. </div>
            <div className="font-extrabold text-center text-blue-600">
              {sampleJourneyValue?.LabNo ?? "-"}
            </div>
          </div>
        </div>

        {/* 2. UHID */}
        <div className="flex items-center gap-2.5 px-4 border-r border-gray-200 shrink-0">
          <div className="text-blue-600 shrink-0 bg-blue-50 p-1.5 rounded-lg">
            <User size={16} />
          </div>
          <div className="whitespace-nowrap">
            <div className="text-[10px] font-bold text-gray-400 uppercase">UHID</div>
            <div className="font-extrabold text-center text-gray-800">
              {sampleJourneyValue?.UHID ?? "-"}
            </div>
          </div>
        </div>

        {/* 3. Patient Name */}
        <div className="flex items-center gap-2.5 px-4 border-r border-gray-200 shrink-0">
          <div className="text-blue-600 shrink-0 bg-blue-50 p-1.5 rounded-lg">
            <User size={16} />
          </div>
          <div className="whitespace-nowrap">
            <div className="text-[10px] font-bold text-gray-400 uppercase">Patient Name</div>
            <div className="font-extrabold text-gray-900">
              {sampleJourneyValue?.PatientName ?? "-"}
            </div>
            <div className="text-[10px] text-center text-gray-500">
              {sampleJourneyValue?.Age ?? "-"} / {sampleJourneyValue?.Gender ?? "-"}
            </div>
          </div>
        </div>

        {/* 4. Sample Type */}
        <div className="flex items-center gap-2.5 px-4 border-r border-gray-200 shrink-0">
          <div className="text-rose-600 shrink-0 bg-rose-50 p-1.5 rounded-lg">
            <Droplet size={16} />
          </div>
          <div className="whitespace-nowrap">
            <div className="text-[10px] font-bold text-gray-400 uppercase">Sample Type</div>
            <div className="font-extrabold text-center text-gray-800">
              {sampleJourneyValue?.SampleType ?? "-"}
            </div>
          </div>
        </div>

        {/* 5. Tests Requested */}
        <div className="flex items-center gap-2.5 px-4 border-r border-gray-200 shrink-0">
          <div className="text-emerald-600 shrink-0 bg-emerald-50 p-1.5 rounded-lg">
            <FlaskConical size={16} />
          </div>
          <div className="whitespace-nowrap">
            <div className="text-[10px] font-bold text-gray-400 uppercase">Tests Requested</div>
            <div className="font-extrabold text-gray-800">
              {sampleJourneyValue?.InvestigationName ?? "-"}
            </div>
          </div>
        </div>

        {/* 6. Collection Date & Time */}
        <div className="flex items-center gap-2.5 px-4 border-r border-gray-200 shrink-0">
          <div className="text-blue-600 shrink-0 bg-blue-50 p-1.5 rounded-lg">
            <Calendar size={16} />
          </div>
          <div className="whitespace-nowrap">
            <div className="text-[10px] font-bold text-gray-400 uppercase">
              Collection Date & Time
            </div>
            <div className="font-extrabold text-center text-gray-800 text-[11px]">
              {sampleJourneyValue?.SampleCollectedOn ?? "-"}
            </div>
          </div>
        </div>

        {/* 7. Current Status */}
        {/* <div className="flex items-center px-4 border-r border-gray-200 shrink-0">
          <div className="whitespace-nowrap">
            <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Current Status</div>
            <span className="inline-block bg-emerald-100 text-emerald-700 font-bold px-3 py-1 text-xs text-center">
              {sampleJourneyValue?.IsResultDone === 1 ? "Result Done" : "Pending"}
            </span>
          </div>
        </div> */}

        {/* 8. View Report Button */}
        <div className="flex items-center justify-center pl-2 shrink-0">
          <button onClick={handleViewReport} className="save-btn whitespace-nowrap">
            <span>View Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}
