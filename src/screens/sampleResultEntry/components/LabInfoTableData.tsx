import { useState } from "react";
import {
  FileText,
  LineChart,
  History,
  ShieldCheck,
  Paperclip,
  Info,
  Settings,
  ChevronDown,
  MessageSquare
} from "lucide-react";

export default function LabInfoTableData({ isExpanded, onToggleExpand }) {
  const [activeSubTab, setActiveSubTab] = useState("Result Entry");

  // CBC Investigation Parameters Data with state support for method dropdown
  const [cbcParameters, setCbcParameters] = useState([
    { id: 1, param: "Hemoglobin (Hb)", result: "13.2", unit: "g/dL", refM: "13.0 - 17.0", refF: "12.0 - 15.0", flag: "N", flagColor: "bg-emerald-100 text-emerald-700", prev: "12.8", method: "Photometry" },
    { id: 2, param: "Total Leukocyte Count (TLC)", result: "12,500", unit: "/µL", refM: "4,000 - 11,000", refF: "4,000 - 11,000", flag: "H", flagColor: "bg-rose-100 text-rose-700", prev: "11,200", method: "Impedance" },
    { id: 3, param: "Differential Neutrophils", result: "72", unit: "%", refM: "40 - 75", refF: "40 - 75", flag: "N", flagColor: "bg-emerald-100 text-emerald-700", prev: "68", method: "Flowcytometry" },
    { id: 4, param: "Differential Lymphocytes", result: "18", unit: "%", refM: "20 - 40", refF: "20 - 40", flag: "L", flagColor: "bg-blue-100 text-blue-700", prev: "22", method: "Flowcytometry" },
    { id: 5, param: "Differential Monocytes", result: "6", unit: "%", refM: "2 - 10", refF: "2 - 10", flag: "N", flagColor: "bg-emerald-100 text-emerald-700", prev: "5", method: "Flowcytometry" },
    { id: 6, param: "Differential Eosinophils", result: "3", unit: "%", refM: "1 - 6", refF: "1 - 6", flag: "N", flagColor: "bg-emerald-100 text-emerald-700", prev: "3", method: "Flowcytometry" },
    { id: 7, param: "Differential Basophils", result: "1", unit: "%", refM: "0 - 1", refF: "0 - 1", flag: "N", flagColor: "bg-emerald-100 text-emerald-700", prev: "1", method: "Flowcytometry" },
    { id: 8, param: "Platelet Count", result: "1.8", unit: "Lakh/µL", refM: "1.5 - 4.5", refF: "1.5 - 4.5", flag: "N", flagColor: "bg-emerald-100 text-emerald-700", prev: "1.6", method: "Impedance" },
    { id: 9, param: "RBC Count", result: "4.6", unit: "Million/µL", refM: "4.5 - 5.9", refF: "4.1 - 5.1", flag: "N", flagColor: "bg-emerald-100 text-emerald-700", prev: "4.5", method: "Calculated" },
    { id: 10, param: "PCV (HCT)", result: "41", unit: "%", refM: "40 - 52", refF: "36 - 46", flag: "N", flagColor: "bg-emerald-100 text-emerald-700", prev: "39", method: "Calculated" },
    { id: 11, param: "MCV", result: "89", unit: "fL", refM: "80 - 100", refF: "80 - 100", flag: "N", flagColor: "bg-emerald-100 text-emerald-700", prev: "90", method: "Calculated" },
    { id: 12, param: "MCH", result: "28.7", unit: "pg", refM: "27 - 32", refF: "27 - 32", flag: "N", flagColor: "bg-emerald-100 text-emerald-700", prev: "28.4", method: "Calculated" },
    { id: 13, param: "MCHC", result: "32.1", unit: "g/dL", refM: "32 - 36", refF: "32 - 36", flag: "N", flagColor: "bg-emerald-100 text-emerald-700", prev: "31.9", method: "Calculated" },
  ]);

  const handleMethodChange = (id, newMethod) => {
    setCbcParameters(prev =>
      prev.map(row => row.id === id ? { ...row, method: newMethod } : row)
    );
  };

  return (
    <div className="card space-y-2">

      {/* ================= MAIN SUB-TABS BAR ================= */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-1.5 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200 whitespace-nowrap">
          {[
            { name: "Result Entry", icon: FileText },
            { name: "Graphical View", icon: LineChart },
            { name: "Previous Result", icon: History },
            { name: "Test Details", icon: Info },
            { name: "Validation", icon: ShieldCheck },
            { name: "Attachments", icon: Paperclip },
          ].map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeSubTab === tab.name;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveSubTab(tab.name)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-md transition-all cursor-pointer ${isActive
                    ? "bg-white text-blue-900 shadow-xs border border-gray-200/60"
                    : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                <IconComponent size={13} className={isActive ? "text-blue-900" : "text-gray-400"} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= INVESTIGATION HEADER TOOLBAR ================= */}
      <div className="flex flex-nowrap items-center justify-between bg-blue-50/60 border border-blue-100 px-3 py-2 rounded-xl overflow-x-auto gap-4 whitespace-nowrap no-scrollbar">
        <div className="flex items-center shrink-0">
          <span className="text-xs font-extrabold text-blue-900">Investigation : Complete Blood Count (CBC)</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
            <span>Method :</span>
            <span className="font-bold text-gray-900 bg-white border border-gray-200 px-2 py-0.5 rounded shadow-2xs">Automated Analyzer</span>
          </div>
          <button className="bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-2xs transition-all cursor-pointer shrink-0">
            Auto Fill
          </button>
          <button
            onClick={onToggleExpand}
            className={`p-1 border rounded-lg shadow-2xs transition-all cursor-pointer shrink-0 ${isExpanded ? "bg-blue-900 text-white border-blue-950" : "bg-white border-gray-200 hover:bg-gray-50 text-gray-600"
              }`}
            title="Toggle Right Panel"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

      {/* ================= FULL-WIDTH CENTER BIG TABLE ================= */}
      <div className="w-full bg-white border border-gray-200 rounded-xl p-2 overflow-x-auto shadow-2xs">
        <table className="w-full min-w-[900px] text-left text-[11px] border-collapse">
          <thead>
            <tr className="bg-blue-50/80 text-gray-600 font-bold border border-gray-200 text-[10px] uppercase">
              <th className="border border-gray-200 py-1.5 px-1 text-center w-[5%]">#</th>
              <th className="border border-gray-200 py-1.5 px-2 w-[19%]">Parameter</th>
              <th className="border border-gray-200 py-1.5 px-2 w-[11%]">Result</th>
              <th className="border border-gray-200 py-1.5 px-2 w-[9%]">Unit</th>
              <th className="border border-gray-200 py-1.5 px-2 text-center" colSpan="2">Reference Range</th>
              <th className="border border-gray-200 py-1.5 px-2 text-center w-[6%]">Flag</th>
              <th className="border border-gray-200 py-1.5 px-2 w-[12%]">Previous Result</th>
              <th className="border border-gray-200 py-1.5 px-2 w-[10%]">Method</th>
              <th className="border border-gray-200 py-1.5 px-1 text-center w-[6%]">Comment</th>
            </tr>
            <tr className="bg-gray-50 text-gray-500 font-semibold text-[9px] border border-gray-200">
              <th className="border border-gray-200 py-0.5 px-1"></th>
              <th className="border border-gray-200 py-0.5 px-2"></th>
              <th className="border border-gray-200 py-0.5 px-2"></th>
              <th className="border border-gray-200 py-0.5 px-2"></th>
              <th className="border border-gray-200 py-0.5 px-2 text-center">Adult (M)</th>
              <th className="border border-gray-200 py-0.5 px-2 text-center">Adult (F)</th>
              <th className="border border-gray-200 py-0.5 px-2"></th>
              <th className="border border-gray-200 py-0.5 px-1 text-center relative">
                <div className="relative flex items-center justify-center">
                  <select className="w-full bg-transparent text-[9px] font-bold text-gray-700 text-center focus:outline-none cursor-pointer appearance-none pr-3">
                    <option value="12-12-2025">12-12-2025</option>
                    <option value="05-11-2025">05-11-2025</option>
                    <option value="18-10-2025">18-10-2025</option>
                  </select>
                  <ChevronDown size={11} className="absolute right-0.5 text-gray-400 pointer-events-none" />
                </div>
              </th>
              <th className="border border-gray-200 py-0.5 px-2"></th>
              <th className="border border-gray-200 py-0.5 px-1"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 font-semibold text-gray-800">
            {cbcParameters.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                <td className="border border-gray-200 py-1 px-1 text-center text-gray-500">{row.id}</td>
                <td className="border border-gray-200 py-1 px-2 font-bold text-gray-900">{row.param}</td>
                <td className="border border-gray-200 py-1 px-2">
                  <input type="text" defaultValue={row.result} className="w-full bg-blue-50/50 border border-blue-200 rounded px-1.5 py-0.5 text-xs font-bold text-blue-900 focus:outline-none focus:border-blue-500" />
                </td>
                <td className="border border-gray-200 py-1 px-2 text-gray-600">{row.unit}</td>
                <td className="border border-gray-200 py-1 px-2 text-center text-gray-500 text-[10px]">{row.refM}</td>
                <td className="border border-gray-200 py-1 px-2 text-center text-gray-500 text-[10px]">{row.refF}</td>
                <td className="border border-gray-200 py-1 px-2 text-center">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${row.flagColor}`}>{row.flag}</span>
                </td>
                <td className="border border-gray-200 py-1 px-2 text-gray-600">{row.prev}</td>
                <td className="border border-gray-200 py-1 px-2 relative">
                  <div className="relative">
                    <select
                      value={row.method}
                      onChange={(e) => handleMethodChange(row.id, e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded text-[10px] px-1.5 py-1 text-gray-800 font-semibold focus:outline-none appearance-none cursor-pointer pr-4"
                    >
                      <option value="Photometry">Photometry</option>
                      <option value="Impedance">Impedance</option>
                      <option value="Flowcytometry">Flowcytometry</option>
                      <option value="Calculated">Calculated</option>
                    </select>
                    <ChevronDown size={11} className="absolute right-1.5 top-1.5 text-gray-400 pointer-events-none" />
                  </div>
                </td>
                <td className="border border-gray-200 py-1 px-1 text-center">
                  <button
                    onClick={() => alert(`Add comment for ${row.param}`)}
                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer inline-flex items-center justify-center"
                    title="Add Comment"
                  >
                    <MessageSquare size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}