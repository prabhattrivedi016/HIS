import { Check, Lock, Printer, Save, ShieldCheck, X } from "lucide-react";

const FooterButton = () => {
  return (
    <div>
      {/* ================= FIXED BOTTOM ACTION BUTTONS BAR ================= */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white border border-gray-200 rounded-xl p-3 shadow-sm gap-3 mt-1">
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            defaultChecked
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
          />
          <span>Print Report After Authorization</span>
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => alert("Saved as Draft")}
            className="flex items-center gap-1 bg-white hover:bg-gray-50 text-blue-900 border border-blue-900 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
          >
            <Save size={14} /> Save Draft
          </button>

          <button
            onClick={() => alert("Saved & Next")}
            className="flex items-center gap-1 bg-[#0B5394] hover:bg-blue-950 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
          >
            Save & Next »
          </button>

          <button
            onClick={() => alert("Verified successfully")}
            className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <Check size={14} /> Verify
          </button>

          <button
            onClick={() => alert("Authorized successfully")}
            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <ShieldCheck size={14} /> Authorize
          </button>

          <button
            onClick={() => alert("Result put on Hold")}
            className="flex items-center gap-1 bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
          >
            Hold Result
          </button>

          <button
            onClick={() => alert("Sample Rejected")}
            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <X size={14} /> Reject Sample
          </button>

          <button
            onClick={() => alert("Print Preview")}
            className="flex items-center gap-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
          >
            <Printer size={14} /> Print Preview
          </button>

          <button
            onClick={() => alert("Report Released")}
            className="flex items-center gap-1 bg-[#0B5394] hover:bg-blue-950 text-white text-xs font-semibold px-4 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <Lock size={14} /> Release Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default FooterButton;

