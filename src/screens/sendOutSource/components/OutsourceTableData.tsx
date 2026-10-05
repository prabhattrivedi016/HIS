import { useState } from "react";
import {
    ListOrdered,
    Eye,
} from "lucide-react";

export default function OutsourceTableData() {

    // Table data matching "Pending Samples for Outsourcing" from the image
    const [tableData, setTableData] = useState([
        {
            id: 1,
            patientId: "P250928001",
            patientName: "Rakesh Kumar",
            ageSex: "32 Y / M",
            sampleId: "SMP250928001",
            testName: "ANA (IFA)",
            sampleType: "Serum",
            priority: "High",
            priorityColor: "bg-rose-100 text-rose-700",
            outsourceTo: "MediScan Labs",
            status: "Pending",
            statusColor: "bg-amber-100 text-amber-800"
        },
        {
            id: 2,
            patientId: "P250928005",
            patientName: "Suman Gupta",
            ageSex: "28 Y / F",
            sampleId: "SMP250928005",
            testName: "Allergen Specific IgE",
            sampleType: "Serum",
            priority: "Normal",
            priorityColor: "bg-emerald-100 text-emerald-800",
            outsourceTo: "Thyrocare",
            status: "Pending",
            statusColor: "bg-amber-100 text-amber-800"
        },
        {
            id: 3,
            patientId: "P250928007",
            patientName: "Amit Verma",
            ageSex: "45 Y / M",
            sampleId: "SMP250928007",
            testName: "Food Allergen Panel",
            sampleType: "Serum",
            priority: "Normal",
            priorityColor: "bg-emerald-100 text-emerald-800",
            outsourceTo: "SRL Diagnostics",
            status: "Pending",
            statusColor: "bg-amber-100 text-amber-800"
        },
        {
            id: 4,
            patientId: "P250928012",
            patientName: "Neha Singh",
            ageSex: "26 Y / F",
            sampleId: "SMP250928012",
            testName: "Mold Allergen IgE",
            sampleType: "Serum",
            priority: "High",
            priorityColor: "bg-rose-100 text-rose-700",
            outsourceTo: "Metropolis",
            status: "Pending",
            statusColor: "bg-amber-100 text-amber-800"
        },
        {
            id: 5,
            patientId: "P250928014",
            patientName: "Arun Yadav",
            ageSex: "38 Y / M",
            sampleId: "SMP250928014",
            testName: "Latex Allergen IgE",
            sampleType: "Serum",
            priority: "Normal",
            priorityColor: "bg-emerald-100 text-emerald-800",
            outsourceTo: "MediScan Labs",
            status: "Pending",
            statusColor: "bg-amber-100 text-amber-800"
        },
        {
            id: 6,
            patientId: "P250928018",
            patientName: "Priya Sharma",
            ageSex: "30 Y / F",
            sampleId: "SMP250928018",
            testName: "Inhalant Allergen Panel",
            sampleType: "Serum",
            priority: "High",
            priorityColor: "bg-rose-100 text-rose-700",
            outsourceTo: "Thyrocare",
            status: "Pending",
            statusColor: "bg-amber-100 text-amber-800"
        },
        {
            id: 7,
            patientId: "P250928021",
            patientName: "Vijay Kumar",
            ageSex: "52 Y / M",
            sampleId: "SMP250928021",
            testName: "Drug Allergen Panel",
            sampleType: "Serum",
            priority: "Normal",
            priorityColor: "bg-emerald-100 text-emerald-800",
            outsourceTo: "SRL Diagnostics",
            status: "Pending",
            statusColor: "bg-amber-100 text-amber-800"
        },
        {
            id: 8,
            patientId: "P250928023",
            patientName: "Kavita Maurya",
            ageSex: "29 Y / F",
            sampleId: "SMP250928023",
            testName: "Component Resolved Diagnosis (CRD)",
            sampleType: "Serum",
            priority: "Normal",
            priorityColor: "bg-emerald-100 text-emerald-800",
            outsourceTo: "Metropolis",
            status: "Pending",
            statusColor: "bg-amber-100 text-amber-800"
        }
    ]);

    const handleOutsourceChange = (id, newLab) => {
        setTableData(prev => prev.map(row => row.id === id ? { ...row, outsourceTo: newLab } : row));
    };

    const handleActionClick = (actionType, sampleId) => {
        alert(`${actionType} clicked for Sample ID: ${sampleId}`);
    };

    return (
        <div className="card mt-3">

            {/* ================= HEADER: PENDING SAMPLES FOR OUTSOURCING & CONTROLS ================= */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 pb-2">
                <div className="flex items-center gap-2 text-blue-900 font-extrabold text-sm">
                    <ListOrdered size={18} className="text-blue-600" />
                    <span>Pending Samples for Outsourcing</span>
                    <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">8 Records</span>
                </div>
            </div>

            {/* ================= TABLE CONTAINER (OUTSOURCE VIEW) ================= */}
            <div className="overflow-x-auto mt-2 overflow-y-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                <table className="w-full min-w-[1250px] border-collapse text-left text-[11px]">
                    <thead>
                        <tr className="bg-blue-50 text-gray-600 font-bold uppercase text-[10px] tracking-wider">
                            <th className="border border-gray-300 py-2.5 px-2 text-center w-[3%]">
                                <input type="checkbox" className="rounded border-gray-300 text-blue-600 cursor-pointer w-3.5 h-3.5" />
                            </th>
                            <th className="border border-gray-300 py-2.5 px-2 text-center w-[4%]">S.No.</th>
                            <th className="border border-gray-300 py-2.5 px-3 w-[8%]">Patient ID</th>
                            <th className="border border-gray-300 py-2.5 px-3 w-[10%]">Patient Name</th>
                            <th className="border border-gray-300 py-2.5 px-3 text-center w-[6%]">Age/Sex</th>
                            <th className="border border-gray-300 py-2.5 px-3 w-[10%]">Sample ID</th>
                            <th className="border border-gray-300 py-2.5 px-3 w-[18%]">Test Name</th>
                            <th className="border border-gray-300 py-2.5 px-3 text-center w-[8%]">Sample Type</th>
                            <th className="border border-gray-300 py-2.5 px-3 text-center w-[7%]">Priority</th>
                            <th className="border border-gray-300 py-2.5 px-3 w-[12%]">Outsource To</th>
                            <th className="border border-gray-300 py-2.5 px-3 text-center w-[5%]">Status</th>
                            <th className="border border-gray-300 py-2.5 px-2 text-center w-[5%]">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                        {tableData.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                                <td className="border border-gray-300 py-2.5 px-2 text-center">
                                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 cursor-pointer w-3.5 h-3.5" />
                                </td>
                                <td className="border border-gray-300 py-2.5 px-2 text-center font-bold text-gray-900">
                                    {row.id}
                                </td>
                                <td className="border border-gray-300 py-2.5 px-3 text-blue-600 font-bold">
                                    {row.patientId}
                                </td>
                                <td className="border border-gray-300 py-2.5 px-3 text-gray-900 font-bold">
                                    {row.patientName}
                                </td>
                                <td className="border border-gray-300 py-2.5 px-3 text-center text-gray-600">
                                    {row.ageSex}
                                </td>
                                <td className="border border-gray-300 py-2.5 px-3 text-gray-800 font-medium">
                                    {row.sampleId}
                                </td>
                                <td className="border border-gray-300 py-2.5 px-3 text-gray-900">
                                    {row.testName}
                                </td>
                                <td className="border border-gray-300 py-2.5 px-3 text-center text-gray-700">
                                    {row.sampleType}
                                </td>

                                {/* Priority Badge */}
                                <td className="border border-gray-300 py-2.5 px-3 text-center">
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold whitespace-nowrap ${row.priorityColor}`}>
                                        {row.priority}
                                    </span>
                                </td>

                                {/* Outsource To Dropdown */}
                                <td className="border border-gray-300 py-2 px-3">
                                    <select
                                        value={row.outsourceTo}
                                        onChange={(e) => handleOutsourceChange(row.id, e.target.value)}
                                        className="bg-white border border-gray-300 rounded text-xs px-2 py-1 text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer w-full"
                                    >
                                        <option value="MediScan Labs">MediScan Labs</option>
                                        <option value="Thyrocare">Thyrocare</option>
                                        <option value="SRL Diagnostics">SRL Diagnostics</option>
                                        <option value="Metropolis">Metropolis</option>
                                    </select>
                                </td>

                                {/* Status Badge */}
                                <td className="border border-gray-300 py-2.5 px-3 text-center">
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold whitespace-nowrap ${row.statusColor}`}>
                                        {row.status}
                                    </span>
                                </td>

                                {/* Action Icon */}
                                <td className="border border-gray-300 py-2.5 px-2 text-center">
                                    <div className="flex items-center justify-center">
                                        <button
                                            onClick={() => handleActionClick("View", row.sampleId)}
                                            className="text-blue-600 hover:text-blue-800 cursor-pointer p-1 transition-colors bg-blue-50 hover:bg-blue-100 rounded"
                                            title="View Details"
                                        >
                                            <Eye size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
}