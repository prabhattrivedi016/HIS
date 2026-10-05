import { useState } from "react";
import {
    Trash2,
    ExternalLink,
    Building2,
    FileUp,
    FileText
} from "lucide-react";

export default function OutsourceAction() {
    const [selectedTests, setSelectedTests] = useState([
        { id: 1, testName: "ANA (IFA)", sampleId: "SMP250928001" },
        { id: 2, testName: "Food Allergen Panel", sampleId: "SMP250928007" },
        { id: 3, testName: "Latex Allergen IgE", sampleId: "SMP250928014" },
    ]);

    const handleDeleteTest = (id) => {
        setSelectedTests(prev => prev.filter(test => test.id !== id));
    };

    return (
        <div className="w-full space-y-2 mt-[-5px] ">

            {/* ================= 1. SELECTED TESTS CARD ================= */}
            <div className="card">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wide">
                        <FileText size={15} className="text-blue-600" />
                        <span>Selected Tests ({selectedTests.length})</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] border-collapse">
                        <thead>
                            <tr className="bg-blue-50 text-gray-600 font-bold uppercase text-[9px]">
                                <th className="border border-gray-300 py-2 px-2 text-center w-[15%]">S.No.</th>
                                <th className="border border-gray-300 py-2 px-2 w-[40%]">Test Name</th>
                                <th className="border border-gray-300 py-2 px-2 w-[30%]">Sample ID</th>
                                <th className="border border-gray-300 py-2 px-2 text-center w-[15%]">Remove</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                            {selectedTests.length > 0 ? (
                                selectedTests.map((test, index) => (
                                    <tr key={test.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="border border-gray-300 py-2 px-2 text-center text-gray-900 font-bold">
                                            {index + 1}
                                        </td>
                                        <td className="border border-gray-300 py-2 px-2 text-gray-900">
                                            {test.testName}
                                        </td>
                                        <td className="border border-gray-300 py-2 px-2 text-blue-600 font-medium">
                                            {test.sampleId}
                                        </td>
                                        <td className="border border-gray-300 py-2 px-2 text-center">
                                            <button
                                                onClick={() => handleDeleteTest(test.id)}
                                                className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer transition-colors"
                                                title="Remove Test"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-3 text-gray-400 font-normal">
                                        No tests selected
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ================= 2. OUTSOURCE LABORATORY DETAILS ================= */}
            <div className="card">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wide pb-2 mb-3 border-b border-gray-200">
                    <Building2 size={15} className="text-blue-600" />
                    <span>Outsource Laboratory Details</span>
                </div>

                <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                        <span className="text-gray-500 font-medium">Lab Name</span>
                        <span className="font-bold text-gray-900">MediScan Labs</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                        <span className="text-gray-500 font-medium">Contact Person</span>
                        <span className="font-medium text-gray-800">Mr. Rohit Sharma</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                        <span className="text-gray-500 font-medium">Mobile</span>
                        <span className="font-medium text-gray-800">9876543210</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                        <span className="text-gray-500 font-medium">Email</span>
                        <span className="font-medium text-blue-600 truncate max-w-[170px]">info@mediscanlabs.com</span>
                    </div>
                    <div className="flex justify-between items-start border-b border-gray-100 pb-1.5">
                        <span className="text-gray-500 font-medium">Address</span>
                        <span className="font-medium text-gray-800 text-right max-w-[170px]">A-12, Medical Hub, New Delhi</span>
                    </div>

                    <div className="pt-2 w-full">
                        <button
                            onClick={() => alert("View Lab Master clicked")}
                            className="save-btn w-full flex justify-center items-center gap-2"
                        >
                            <ExternalLink size={13} />
                            <span>View Lab Master</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ================= 3. DOCUMENTS CARD ================= */}
            <div className="card">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wide pb-2 mb-3 border-b border-gray-200">
                    <FileUp size={15} className="text-blue-600" />
                    <span>Documents</span>
                </div>

                <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                        <label className="block text-gray-700 font-bold">Attach Requisition Form</label>
                        <div className="flex items-center gap-2">
                            <label className="flex-1 flex items-center justify-between border border-gray-300 rounded-lg px-3 py-1.5 bg-white cursor-pointer hover:bg-gray-50 transition-colors">
                                <span className="text-gray-500 truncate text-[11px]">Choose File</span>
                                <input type="file" className="hidden" onChange={(e) => alert(e.target.files[0]?.name || "File selected")} />
                                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-bold border border-gray-200">Browse</span>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-gray-700 font-bold">Attach Sample List (Optional)</label>
                        <div className="flex items-center gap-2">
                            <label className="flex-1 flex items-center justify-between border border-gray-300 rounded-lg px-3 py-1.5 bg-white cursor-pointer hover:bg-gray-50 transition-colors">
                                <span className="text-gray-500 truncate text-[11px]">No file chosen</span>
                                <input type="file" className="hidden" onChange={(e) => alert(e.target.files[0]?.name || "File selected")} />
                                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-bold border border-gray-200">Browse</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}