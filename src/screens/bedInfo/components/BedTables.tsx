import { useState } from "react";
import { PieChart } from "lucide-react";

export default function BedTables() {
    const [summaryTab, setSummaryTab] = useState("By Floor");
    const [activeTab, setActiveTab] = useState("ward");

    // Bed Type Distribution data for Donut Chart calculation
    const bedTypes = [
        { label: "General", count: 180, percent: "60%", color: "#22c55e" },      // green-500
        { label: "Semi Private", count: 60, percent: "20%", color: "#0ea5e9" }, // sky-500
        { label: "Private", count: 40, percent: "13%", color: "#f97316" },      // orange-500
        { label: "ICU / HDU", count: 20, percent: "7%", color: "#ef4444" },     // red-500
    ];

    const wardData = [
        { name: "General Ward", total: 120, occ: 98, avail: 15, res: 3, clean: 4, block: 0, rate: "81.7%", color: "bg-rose-500" },
        { name: "Private Ward", total: 60, occ: 42, avail: 14, res: 2, clean: 1, block: 1, rate: "70.0%", color: "bg-sky-500" },
        { name: "ICU", total: 30, occ: 28, avail: 1, res: 0, clean: 1, block: 0, rate: "93.3%", color: "bg-blue-600" },
        { name: "HDU", total: 30, occ: 24, avail: 4, res: 1, clean: 1, block: 0, rate: "80.0%", color: "bg-amber-500" },
        { name: "NICU", total: 20, occ: 15, avail: 3, res: 1, clean: 1, block: 0, rate: "75.0%", color: "bg-purple-600" },
        { name: "PICU", total: 20, occ: 16, avail: 2, res: 1, clean: 0, block: 1, rate: "80.0%", color: "bg-emerald-600" },
        { name: "Isolation Ward", total: 20, occ: 15, avail: 4, res: 0, clean: 0, block: 1, rate: "75.0%", color: "bg-indigo-600" },
    ];

    const doctorData = [
        { name: "Dr. R. Sharma (Cardiology)", total: 25, occ: 22, avail: 2, res: 1, clean: 0, block: 0, rate: "88.0%", color: "bg-blue-500" },
        { name: "Dr. A. Verma (Neurology)", total: 20, occ: 17, avail: 2, res: 1, clean: 0, block: 0, rate: "85.0%", color: "bg-indigo-500" },
        { name: "Dr. P. Singh (Orthopedics)", total: 30, occ: 25, avail: 3, res: 1, clean: 1, block: 0, rate: "83.3%", color: "bg-emerald-500" },
        { name: "Dr. M. Gupta (Pediatrics)", total: 25, occ: 19, avail: 4, res: 1, clean: 1, block: 0, rate: "76.0%", color: "bg-purple-500" },
        { name: "Dr. S. Das (General Surgery)", total: 40, occ: 35, avail: 3, res: 1, clean: 1, block: 0, rate: "87.5%", color: "bg-rose-500" },
    ];

    const corporateData = [
        { name: "Tata Consultancy", total: 30, occ: 26, avail: 3, res: 1, clean: 0, block: 0, rate: "86.7%", color: "bg-sky-600" },
        { name: "Reliance Industries", total: 25, occ: 21, avail: 3, res: 1, clean: 0, block: 0, rate: "84.0%", color: "bg-blue-700" },
        { name: "Infosys Ltd", total: 20, occ: 16, avail: 3, res: 0, clean: 1, block: 0, rate: "80.0%", color: "bg-teal-600" },
        { name: "Aditya Birla Group", total: 15, occ: 12, avail: 2, res: 1, clean: 0, block: 0, rate: "80.0%", color: "bg-amber-600" },
        { name: "State Bank of India", total: 20, occ: 14, avail: 5, res: 1, clean: 0, block: 0, rate: "70.0%", color: "bg-cyan-600" },
    ];

    const getCurrentData = () => {
        if (activeTab === "doctor") return doctorData;
        if (activeTab === "corporate") return corporateData;
        return wardData;
    };

    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    let accumulatedPercent = 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 w-full">

            {/* ================= 1. WARD WISE BED STATUS TABLE (Col span 7) ================= */}
            <div className="lg:col-span-6 bg-white border border-gray-200 rounded-xl p-3 shadow-2xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 gap-2">
                    <div className="overflow-x-auto [&::-webkit-scrollbar]:h-1 flex-1">
                        <div className="flex gap-4 cursor-pointer whitespace-nowrap">
                            <span
                                onClick={() => setActiveTab("ward")}
                                className={`font-bold text-xs uppercase tracking-wider transition-colors ${activeTab === "ward" ? "text-blue-900 border-b-2 border-blue-900 pb-0.5" : "text-gray-400 hover:text-gray-600"}`}
                            >
                                Ward Wise Bed Status
                            </span>
                            <span
                                onClick={() => setActiveTab("doctor")}
                                className={`font-bold text-xs uppercase tracking-wider transition-colors ${activeTab === "doctor" ? "text-blue-900 border-b-2 border-blue-900 pb-0.5" : "text-gray-400 hover:text-gray-600"}`}
                            >
                                Doctor Bed Status
                            </span>
                            <span
                                onClick={() => setActiveTab("corporate")}
                                className={`font-bold text-xs uppercase tracking-wider transition-colors ${activeTab === "corporate" ? "text-blue-900 border-b-2 border-blue-900 pb-0.5" : "text-gray-400 hover:text-gray-600"}`}
                            >
                                Corporate Bed Status
                            </span>
                        </div>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium shrink-0">Real-time status</span>
                </div>
                <div className="overflow-x-auto [&::-webkit-scrollbar]:h-1.5">
                    <table className="w-full min-w-[600px] text-left text-[11px] border-collapse">
                        <thead>
                            <tr className="bg-blue-50 text-gray-600 font-bold uppercase text-[10px]">
                                <th className="py-2 px-2.5 border-b border-gray-200">
                                    {activeTab === "doctor" ? "Doctor" : activeTab === "corporate" ? "Corporate" : "Ward"}
                                </th>
                                <th className="py-2 px-2 border-b border-gray-200 text-center">Total</th>
                                <th className="py-2 px-2 border-b border-gray-200 text-center">Occupied</th>
                                <th className="py-2 px-2 border-b border-gray-200 text-center">Available</th>
                                <th className="py-2 px-2 border-b border-gray-200 text-center">Reserved</th>
                                <th className="py-2 px-2 border-b border-gray-200 text-center">Cleaning</th>
                                <th className="py-2 px-2 border-b border-gray-200 text-center">Blocked</th>
                                <th className="py-2 px-2.5 border-b border-gray-200 text-right">Occupancy</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                            {getCurrentData().map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-2 px-2.5 font-bold text-gray-900 flex items-center gap-1.5">
                                        <span className={`w-2 h-2 rounded-full ${row.color}`}></span>
                                        {row.name}
                                    </td>
                                    <td className="py-2 px-2 text-center text-gray-900">{row.total}</td>
                                    <td className="py-2 px-2 text-center text-rose-600">{row.occ}</td>
                                    <td className="py-2 px-2 text-center text-emerald-600">{row.avail}</td>
                                    <td className="py-2 px-2 text-center text-amber-600">{row.res}</td>
                                    <td className="py-2 px-2 text-center text-cyan-600">{row.clean}</td>
                                    <td className="py-2 px-2 text-center text-gray-500">{row.block}</td>
                                    <td className="py-2 px-2.5 text-right font-bold text-gray-900">
                                        <div className="flex items-center justify-end gap-2">
                                            <span>{row.rate}</span>
                                            <div className="w-12 bg-gray-200 h-1.5 rounded-full overflow-hidden hidden sm:block">
                                                <div className="bg-rose-500 h-full rounded-full" style={{ width: row.rate }}></div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ================= 2. FLOOR WISE SUMMARY TABLE (Col span 5 - Top) ================= */}
            <div className="lg:col-span-3 flex flex-col gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
                        <span className="font-bold text-xs text-blue-900 uppercase tracking-wider">
                            {summaryTab === "By Floor" ? "Floor Wise Summary" : "Ward Wise Summary"}
                        </span>
                        <div className="bg-gray-100 p-0.5 rounded-lg flex text-[10px] font-bold">
                            <button
                                onClick={() => setSummaryTab("By Floor")}
                                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${summaryTab === "By Floor" ? "bg-[#0B5394] text-white shadow-xs" : "text-gray-600"}`}
                            >
                                By Floor
                            </button>
                            <button
                                onClick={() => setSummaryTab("By Ward")}
                                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${summaryTab === "By Ward" ? "bg-[#0B5394] text-white shadow-xs" : "text-gray-600"}`}
                            >
                                By Ward
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto [&::-webkit-scrollbar]:h-1.5">
                        {summaryTab === "By Floor" ? (
                            <table className="w-full min-w-[400px] text-left text-[11px] border-collapse">
                                <thead>
                                    <tr className="bg-blue-50 text-gray-600 font-bold uppercase text-[10px]">
                                        <th className="py-4 px-2.5 border-b border-gray-200">Floor</th>
                                        <th className="py-2 px-2 border-b border-gray-200 text-center">Total</th>
                                        <th className="py-2 px-2 border-b border-gray-200 text-center">Occupied</th>
                                        <th className="py-2 px-2 border-b border-gray-200 text-center">Available</th>
                                        <th className="py-2 px-2 border-b border-gray-200 text-center">Reserved</th>
                                        <th className="py-2 px-2.5 border-b border-gray-200 text-right">Other</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                                    {[
                                        { floor: "Ground Floor", total: 80, occ: 62, avail: 12, res: 4, other: 2 },
                                        { floor: "First Floor", total: 80, occ: 60, avail: 14, res: 4, other: 2 },
                                        { floor: "Second Floor", total: 70, occ: 55, avail: 10, res: 3, other: 2 },
                                        { floor: "Third Floor", total: 70, occ: 61, avail: 9, res: 3, other: 3 },
                                    ].map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-2.5 font-bold text-gray-900">{item.floor}</td>
                                            <td className="py-2 px-2 text-center text-gray-900">{item.total}</td>
                                            <td className="py-2 px-2 text-center text-rose-600">{item.occ}</td>
                                            <td className="py-2 px-2 text-center text-emerald-600">{item.avail}</td>
                                            <td className="py-2 px-2 text-center text-amber-600">{item.res}</td>
                                            <td className="py-2 px-2.5 text-right text-blue-600">{item.other}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <table className="w-full min-w-[400px] text-left text-[11px] border-collapse">
                                <thead>
                                    <tr className="bg-blue-50 text-gray-600 font-bold uppercase text-[10px]">
                                        <th className="py-4 px-2.5 border-b border-gray-200">Ward</th>
                                        <th className="py-2 px-2 border-b border-gray-200 text-center">Total</th>
                                        <th className="py-2 px-2 border-b border-gray-200 text-center">Occupied</th>
                                        <th className="py-2 px-2 border-b border-gray-200 text-center">Available</th>
                                        <th className="py-2 px-2 border-b border-gray-200 text-center">Reserved</th>
                                        <th className="py-2 px-2.5 border-b border-gray-200 text-right">Other</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                                    {[
                                        { ward: "General Ward", total: 40, occ: 32, avail: 5, res: 2, other: 1 },
                                        { ward: "Private Ward", total: 30, occ: 22, avail: 6, res: 1, other: 1 },
                                        { ward: "ICU", total: 20, occ: 18, avail: 1, res: 1, other: 0 },
                                        { ward: "Emergency Ward", total: 30, occ: 25, avail: 3, res: 1, other: 1 },
                                    ].map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-2.5 font-bold text-gray-900">{item.ward}</td>
                                            <td className="py-2 px-2 text-center text-gray-900">{item.total}</td>
                                            <td className="py-2 px-2 text-center text-rose-600">{item.occ}</td>
                                            <td className="py-2 px-2 text-center text-emerald-600">{item.avail}</td>
                                            <td className="py-2 px-2 text-center text-amber-600">{item.res}</td>
                                            <td className="py-2 px-2.5 text-right text-blue-600">{item.other}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
            
           

                {/* ================= 3. BED TYPE DISTRIBUTION DONUT (Col span 5 - Bottom) ================= */}
                 <div className="lg:col-span-3 flex flex-col gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
                        <span className="font-bold text-xs text-blue-900 uppercase tracking-wider">Bed Type Distribution</span>
                        <PieChart size={15} className="text-blue-600" />
                    </div>

                    <div className="flex flex-row lg:flex-col items-center justify-between gap-4 py-1">
                        {/* Donut Chart with SVG */}
                        <div className="relative w-34 h-34 flex items-center justify-center shrink-0">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                {bedTypes.map((item, i) => {
                                    const val = parseInt(item.percent);
                                    const strokeDasharray = `${(val / 100) * circumference} ${circumference}`;
                                    const strokeDashoffset = -1 * (accumulatedPercent / 100) * circumference;
                                    accumulatedPercent += val;

                                    return (
                                        <circle
                                            key={i}
                                            cx="18"
                                            cy="18"
                                            r={radius}
                                            fill="transparent"
                                            stroke={item.color}
                                            strokeWidth="4"
                                            strokeDasharray={strokeDasharray}
                                            strokeDashoffset={strokeDashoffset}
                                        />
                                    );
                                })}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <span className="text-xs font-extrabold text-gray-900 leading-none">300</span>
                                <span className="text-[9px] font-bold text-gray-400 mt-0.5">Total Beds</span>
                            </div>
                        </div>

                        {/* Legend / Breakdown Labels */}
                        <div className="grid grid-cols-1 gap-x-4 gap-y-3 w-full text-[11px] font-medium text-gray-700">
                            {bedTypes.map((bt, index) => (
                                <div key={index} className="flex items-center justify-between ">
                                    <div className="flex items-center gap-1.5 truncate">
                                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: bt.color }}></span>
                                        <span className="font-bold text-gray-800 truncate">{bt.label}</span>
                                    </div>
                                    <span className="font-extrabold text-gray-900 ml-2">{bt.count} <span className="text-[9px] text-gray-500 font-normal">({bt.percent})</span></span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}