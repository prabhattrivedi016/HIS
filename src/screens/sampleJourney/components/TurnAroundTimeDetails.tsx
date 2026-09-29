import { Calendar, CheckCircle2, Clock, Timer } from "lucide-react";

export default function TurnAroundTimeDetails() {
  return (
    <div className="w-full space-y-3 lg:mt-3 ">
      {/* ================= 1. TURN AROUND TIME (TAT) ================= */}
      <div className="card">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wide">
          <Clock size={16} className="text-blue-600" />
          <span>Turn Around Time (TAT)</span>
        </div>
        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
          <div className="text-2xl font-extrabold text-[#123b70]">2h 9m</div>
          <div className="text-xs font-medium text-gray-500 mt-0.5">Collection to Report</div>
          <div className="mt-2.5 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold">
            <CheckCircle2 size={14} />
            <span>Within Expected TAT</span>
          </div>
        </div>
      </div>

      {/* ================= 2. KEY DATES ================= */}
      <div className="card">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
          <Calendar size={16} className="text-blue-600" />
          <span>Key Dates</span>
        </div>
        <div className="space-y-2.5 text-xs font-medium">
          <div className="flex justify-between items-center py-.5 border-b border-gray-100">
            <span className="text-gray-500">Collection Time</span>
            <span className="font-bold text-gray-800">23-09-2026 09:15 AM</span>
          </div>
          <div className="flex justify-between items-center py-.5 border-b border-gray-100">
            <span className="text-gray-500">Accession Time</span>
            <span className="font-bold text-gray-800">23-09-2026 09:22 AM</span>
          </div>
          <div className="flex justify-between items-center py-.5 border-b border-gray-100">
            <span className="text-gray-500">Result Validation</span>
            <span className="font-bold text-gray-800">23-09-2026 11:05 AM</span>
          </div>
          <div className="flex justify-between items-center py-.5 border-b border-gray-100">
            <span className="text-gray-500">Approved Time</span>
            <span className="font-bold text-gray-800">23-09-2026 11:20 AM</span>
          </div>
          <div className="flex justify-between items-center py-.5">
            <span className="text-gray-500">Reported Time</span>
            <span className="font-bold text-gray-800">23-09-2026 11:24 AM</span>
          </div>
        </div>
      </div>

      {/* ================= 3. NEXT ACTION ================= */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
          <Timer size={16} className="text-blue-600" />
          <span>Next Action</span>
        </div>
        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 flex items-start gap-2.5">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-bold text-gray-800">No pending action.</div>
            <div className="text-gray-500 mt-0.5">Sample journey completed.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
