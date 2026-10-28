import { useState, useMemo } from "react";
import {
    Bed,
    LayoutGrid,
    List,
    ExternalLink,
    User,
    ArrowRightLeft,
    LogOut,
    ShieldAlert,
    Clock,
    History
} from "lucide-react";

export default function BedLayoutAndDetails() {
    const [selectedFloor, setSelectedFloor] = useState("Ground Floor");
    const [selectedWard, setSelectedWard] = useState("General Ward");
    const [viewMode, setViewMode] = useState("grid");
    const [showRecentActivities, setShowRecentActivities] = useState(false);

    // Dynamic Selected Bed State
    const [selectedBed, setSelectedBed] = useState({
        bedNo: "GF-101",
        status: "Available",
        ward: "General Ward",
        floor: "Ground Floor",
        type: "General",
        charge: "₹ 1,500 / Day",
        patientName: "N/A",
        ageGender: "N/A",
        uhid: "N/A",
        ipNo: "N/A",
        admissionDate: "N/A",
        doctor: "N/A"
    });

    // Dynamic Bed Generator based on Floor and Ward
    const bedList = useMemo(() => {
        let count = 20;
        if (selectedFloor === "Ground Floor") count = 80;
        else if (selectedFloor === "First Floor") count = 20;
        else if (selectedFloor === "Second Floor") count = 20;
        else if (selectedFloor === "Third Floor") count = 20;

        const prefix = selectedFloor === "Ground Floor" ? "GF" : selectedFloor === "First Floor" ? "FF" : selectedFloor === "Second Floor" ? "SF" : "TF";
        const statuses = ["Available", "Occupied", "Reserved", "Cleaning", "Blocked"];
        const patientNames = ["Rajesh Kumar", "Sunita Devi", "Amit Singh", "Neha Patel", "Vijay Sharma", "Rahul Singh", "Suman Devi"];
        const doctors = ["Dr. S. Verma", "Dr. A. Mehta", "Dr. R. Gupta"];

        const list = [];
        for (let i = 1; i <= count; i++) {
            const id = `${prefix}-${100 + i}`;
            const statusIndex = (i + (selectedWard === "Private Ward" ? 1 : selectedWard === "ICU Ward" ? 2 : 0)) % statuses.length;
            const status = statuses[statusIndex];

            let type = "green";
            let patient = undefined;
            let ip = undefined;
            let ageGender = undefined;
            let doctor = undefined;
            let sub = undefined;

            if (status === "Occupied") {
                type = "red";
                patient = patientNames[i % patientNames.length];
                ip = `IPD-00${1200 + i}`;
                ageGender = `${30 + (i % 30)} Y / ${i % 2 === 0 ? "Male" : "Female"}`;
                doctor = doctors[i % doctors.length];
            } else if (status === "Available") {
                type = "green";
            } else if (status === "Reserved") {
                type = "yellow";
                sub = "For Surgery";
            } else if (status === "Cleaning") {
                type = "blue";
            } else if (status === "Blocked") {
                type = "gray";
                sub = "Maintenance";
            }

            list.push({ id, status, type, patient, ip, ageGender, doctor, sub });
        }
        return list;
    }, [selectedFloor, selectedWard]);

    const handleBedClick = (bed) => {
        setSelectedBed({
            bedNo: bed.id,
            status: bed.status,
            ward: selectedWard,
            floor: selectedFloor,
            type: selectedWard.includes("Private") ? "Private" : selectedWard.includes("ICU") ? "ICU / HDU" : "General",
            charge: selectedWard.includes("Private") ? "₹ 3,500 / Day" : selectedWard.includes("ICU") ? "₹ 5,000 / Day" : "₹ 1,500 / Day",
            patientName: bed.patient || "N/A",
            ageGender: bed.ageGender || "N/A",
            uhid: bed.ip ? `UHID-000${Math.floor(1000 + Math.random() * 9000)}` : "N/A",
            ipNo: bed.ip || "N/A",
            admissionDate: bed.patient ? "06 Oct 2026 09:00 AM" : "N/A",
            doctor: bed.doctor || "N/A"
        });
    };

    const recentActivities = [
        { text: "Bed B-102 Occupied - Rahul Singh (IPD-001245)", time: "11:20 AM", type: "occupied" },
        { text: "Bed A-15 Discharged - Suman Devi (IPD-001198)", time: "10:45 AM", type: "available" },
        { text: "Bed ICU-03 Cleaning", time: "10:30 AM", type: "cleaning" },
        { text: "Bed P-210 Reserved - For Surgery", time: "10:15 AM", type: "reserved" },
        { text: "Bed G-45 Occupied - Amit Kumar (IPD-001230)", time: "09:50 AM", type: "occupied" },
    ];

    // Summary calculations
    const totalBeds = bedList.length;
    const occupiedCount = bedList.filter(b => b.status === "Occupied").length;
    const availableCount = bedList.filter(b => b.status === "Available").length;
    const reservedCount = bedList.filter(b => b.status === "Reserved").length;
    const cleaningCount = bedList.filter(b => b.status === "Cleaning").length;
    const blockedCount = bedList.filter(b => b.status === "Blocked").length;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 w-full mt-2 items-start">

            {/* ================= LEFT SECTION: BED LAYOUT (9 Cols) ================= */}
            <div className="lg:col-span-9 flex flex-col gap-4">

                {/* Bed Layout Container */}
                <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-2xs space-y-3">

                    {/* Top Controls: Floor Tabs, Ward Dropdown, View Mode & Recent Activities Toggle Button */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-gray-100">
                        {/* Floor Tabs */}
                        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 [&::-webkit-scrollbar]:h-1">
                            {["Ground Floor", "First Floor", "Second Floor", "Third Floor"].map((floor) => (
                                <button
                                    key={floor}
                                    onClick={() => setSelectedFloor(floor)}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap transition-colors shrink-0 ${selectedFloor === floor ? "bg-[#0B5394] text-white shadow-xs" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                >
                                    {floor}
                                </button>
                            ))}
                        </div>

                        {/* Ward Dropdown, View Toggles & Recent Button */}
                        <div className="flex items-center gap-2 w-full lg:w-auto justify-start sm:justify-end flex-nowrap overflow-x-auto pb-1 [&::-webkit-scrollbar]:h-1">
                            <select
                                value={selectedWard}
                                onChange={(e) => setSelectedWard(e.target.value)}
                                className="border border-gray-300 rounded-lg text-xs px-2.5 py-1.5 bg-white font-medium text-gray-700 cursor-pointer focus:outline-none focus:border-[#0B5394] shrink-0"
                            >
                                <option value="General Ward">General Ward</option>
                                <option value="Private Ward">Private Ward</option>
                                <option value="ICU Ward">ICU Ward</option>
                            </select>

                            <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200 shrink-0">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${viewMode === "grid" ? "bg-[#0B5394] text-white shadow-xs" : "text-gray-600"}`}
                                >
                                    <LayoutGrid size={13} />
                                    <span className="hidden sm:inline">Bed View</span>
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${viewMode === "list" ? "bg-[#0B5394] text-white shadow-xs" : "text-gray-600"}`}
                                >
                                    <List size={13} />
                                    <span className="hidden sm:inline">List View</span>
                                </button>
                            </div>

                            {/* Recent Activities Toggle Button */}
                            <button
                                onClick={() => setShowRecentActivities(!showRecentActivities)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all shadow-2xs shrink-0 ${showRecentActivities ? "bg-blue-900 text-white" : "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                                    }`}
                                title="Toggle Recent Bed Activities"
                            >
                                <History size={14} />
                                <span>Recent</span>
                            </button>
                        </div>
                    </div>

                    {/* Collapsible Recent Activities Dropdown */}
                    {showRecentActivities && (
                        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 space-y-2.5 transition-all duration-300 animate-fadeIn">
                            <div className="flex items-center justify-between pb-1.5 border-b border-blue-200">
                                <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                                    <Clock size={14} className="text-blue-600" />
                                    <span>Recent Bed Activities Log</span>
                                </div>
                                <span
                                    onClick={() => setShowRecentActivities(false)}
                                    className="text-[11px] font-bold text-gray-500 hover:text-rose-600 cursor-pointer"
                                >
                                    ✕ Close
                                </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[11px]">
                                {recentActivities.map((act, index) => (
                                    <div key={index} className="flex items-start justify-between gap-2 bg-white p-2 rounded-lg border border-blue-100 shadow-2xs">
                                        <div className="flex items-start gap-1.5">
                                            <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${act.type === "occupied" ? "bg-rose-500" :
                                                    act.type === "available" ? "bg-emerald-500" :
                                                        act.type === "cleaning" ? "bg-cyan-500" : "bg-amber-500"
                                                }`}></span>
                                            <span className="font-semibold text-gray-800 leading-tight">{act.text}</span>
                                        </div>
                                        <span className="text-[10px] text-gray-400 whitespace-nowrap font-medium">{act.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Layout Info Sub-header */}
                    <div className="flex flex-wrap items-center justify-between text-[11px] font-bold text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 ">
                        <span className="text-blue-900">Bed Layout - {selectedFloor} ({selectedWard})</span>
                        <div className="flex items-center gap-3 flex-wrap">
                            <span>Total Beds: <strong className="text-gray-900">{totalBeds}</strong></span>
                            <span>Occupied: <strong className="text-rose-600">{occupiedCount}</strong></span>
                            <span>Available: <strong className="text-emerald-600">{availableCount}</strong></span>
                            <span>Reserved: <strong className="text-amber-600">{reservedCount}</strong></span>
                            <span>Cleaning: <strong className="text-cyan-600">{cleaningCount}</strong></span>
                            <span>Blocked: <strong className="text-gray-500">{blockedCount}</strong></span>
                        </div>
                    </div>

                    {/* CONDITIONAL VIEW: GRID VIEW vs LIST VIEW */}
                    {viewMode === "grid" ? (
                        /* Bed Cards Grid View (Scrollable for large counts like 80 beds) */
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 max-h-[320px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5  ">
                            {bedList.map((bed, index) => {
                                const isSelected = selectedBed.bedNo === bed.id;
                                let borderColor = "border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50";
                                let textColor = "text-emerald-700";

                                if (bed.type === "red") {
                                    borderColor = "border-rose-200 bg-rose-50/50 hover:bg-rose-50";
                                    textColor = "text-rose-700";
                                } else if (bed.type === "yellow") {
                                    borderColor = "border-amber-200 bg-amber-50/50 hover:bg-amber-50";
                                    textColor = "text-amber-700";
                                } else if (bed.type === "blue") {
                                    borderColor = "border-cyan-200 bg-cyan-50/50 hover:bg-cyan-50";
                                    textColor = "text-cyan-700";
                                } else if (bed.type === "gray") {
                                    borderColor = "border-gray-300 bg-gray-100 hover:bg-gray-200";
                                    textColor = "text-gray-700";
                                }

                                return (
                                    <div
                                        key={index}
                                        onClick={() => handleBedClick(bed)}
                                        className={`border rounded-xl p-2.5 flex flex-col justify-between cursor-pointer transition-all shadow-2xs mt-2 ml-1 ${borderColor} ${isSelected ? "ring-2 ring-[#0B5394] shadow-sm" : ""}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-xs text-gray-900">{bed.id}</span>
                                            <Bed size={16} className={textColor} />
                                        </div>
                                        <div className="mt-2">
                                            <div className={`text-xs font-extrabold ${textColor}`}>{bed.status}</div>
                                            {bed.patient && <div className="text-[11px] font-bold text-gray-800 truncate mt-0.5">{bed.patient}</div>}
                                            {bed.ip && <div className="text-[10px] text-gray-500 font-medium">{bed.ip}</div>}
                                            {bed.sub && <div className="text-[10px] text-gray-500 font-medium">{bed.sub}</div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* Bed Table List View */
                        <div className="overflow-x-auto max-h-[320px] overflow-y-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5 ">
                            <table className="w-full min-w-[550px] text-left text-xs border-collapse">
                                <thead className="sticky top-0 bg-blue-50 text-gray-700 font-bold uppercase text-[10px]">
                                    <tr>
                                        <th className="py-2.5 px-3 border-b border-gray-200">Bed No</th>
                                        <th className="py-2.5 px-3 border-b border-gray-200">Status</th>
                                        <th className="py-2.5 px-3 border-b border-gray-200">Patient Name</th>
                                        <th className="py-2.5 px-3 border-b border-gray-200">IPD / Sub</th>
                                        <th className="py-2.5 px-3 border-b border-gray-200">Doctor</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 font-medium text-gray-700 ">
                                    {bedList.map((bed, index) => {
                                        const isSelected = selectedBed.bedNo === bed.id;
                                        return (
                                            <tr
                                                key={index}
                                                onClick={() => handleBedClick(bed)}
                                                className={`hover:bg-blue-50/50 cursor-pointer transition-colors ${isSelected ? "bg-blue-50 font-bold" : ""}`}
                                            >
                                                <td className="py-2 px-3 font-bold text-gray-900">{bed.id}</td>
                                                <td className="py-2 px-3">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${bed.status === "Occupied" ? "bg-rose-100 text-rose-700" :
                                                            bed.status === "Available" ? "bg-emerald-100 text-emerald-700" :
                                                                bed.status === "Reserved" ? "bg-amber-100 text-amber-700" :
                                                                    bed.status === "Cleaning" ? "bg-cyan-100 text-cyan-700" : "bg-gray-200 text-gray-700"
                                                        }`}>
                                                        {bed.status}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-3 text-gray-900">{bed.patient || "-"}</td>
                                                <td className="py-2 px-3 text-gray-500">{bed.ip || bed.sub || "-"}</td>
                                                <td className="py-2 px-3 text-blue-600">{bed.doctor || "-"}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                </div>

            </div>

            {/* ================= RIGHT SECTION: BED DETAILS PANEL (3 Cols) ================= */}
            <div className="lg:col-span-3 flex flex-col gap-4">

                {/* Selected Bed Details Sidebar Panel */}
                <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Bed Details</span>
                            <div className="text-base font-extrabold text-gray-900">{selectedBed.bedNo}</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className={`font-extrabold text-[10px] px-2 py-0.5 rounded ${selectedBed.status === "Occupied" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                                }`}>
                                {selectedBed.status}
                            </span>
                            <ExternalLink size={14} className="text-[#0B5394] cursor-pointer hover:text-blue-800" />
                        </div>
                    </div>

                    {/* Details List */}
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between border-b border-gray-100 pb-1.5">
                            <span className="text-gray-500 font-medium">Ward</span>
                            <span className="font-bold text-gray-900">{selectedBed.ward}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1.5">
                            <span className="text-gray-500 font-medium">Floor</span>
                            <span className="font-bold text-gray-900">{selectedBed.floor}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1.5">
                            <span className="text-gray-500 font-medium">Bed Type</span>
                            <span className="font-bold text-gray-900">{selectedBed.type}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1.5">
                            <span className="text-gray-500 font-medium">Bed Charge</span>
                            <span className="font-bold text-gray-900">{selectedBed.charge}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1.5">
                            <span className="text-gray-500 font-medium">Patient Name</span>
                            <span className="font-bold text-gray-900">{selectedBed.patientName}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1.5">
                            <span className="text-gray-500 font-medium">Age / Gender</span>
                            <span className="font-bold text-gray-900">{selectedBed.ageGender}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1.5">
                            <span className="text-gray-500 font-medium">UHID / IPD No.</span>
                            <span className="font-bold text-gray-900">{selectedBed.uhid} / {selectedBed.ipNo}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1.5">
                            <span className="text-gray-500 font-medium">Admission Date</span>
                            <span className="font-bold text-gray-900">{selectedBed.admissionDate}</span>
                        </div>
                        <div className="flex justify-between pb-1">
                            <span className="text-gray-500 font-medium">Attending Doctor</span>
                            <span className="font-bold text-[#0B5394]">{selectedBed.doctor}</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                        <button onClick={() => alert("Patient Details clicked")} className="bg-[#0B5394] hover:bg-blue-900 text-white font-bold py-1.5 px-2 rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs">
                            <User size={13} /> <span>Patient Details</span>
                        </button>
                        <button onClick={() => alert("Transfer clicked")} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-1.5 px-2 rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs">
                            <ArrowRightLeft size={13} /> <span>Transfer</span>
                        </button>
                        <button onClick={() => alert("Discharge clicked")} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-1.5 px-2 rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs">
                            <LogOut size={13} /> <span>Discharge</span>
                        </button>
                        <button onClick={() => alert("Block Bed clicked")} className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 px-2 rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs">
                            <ShieldAlert size={13} /> <span>Block Bed</span>
                        </button>
                    </div>

                </div>

            </div>

        </div>
    );
}