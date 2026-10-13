import { useState } from "react";
import { Trash2, RefreshCw, Download, Percent, FileText } from "lucide-react";

export default function MedicalTable() {
    const [selectedMedicines, setSelectedMedicines] = useState([
        {
            id: 1,
            itemCode: "MED001",
            itemName: "Paracetamol 650mg Tab",
            batchNo: "PCT2301",
            expiry: "12-2026",
            pack: "10 Tab",
            availableStock: "2,500",
            qty: "10",
            unit: "Tab",
            rate: "1.20",
            discount: "0",
            amount: "12.00",
            include: true,
            exclude: false,
            payment: "N/A",
        },
        {
            id: 2,
            itemCode: "MED002",
            itemName: "Pantoprazole 40mg Tab",
            batchNo: "PNT4502",
            expiry: "11-2026",
            pack: "10 Tab",
            availableStock: "1,200",
            qty: "10",
            unit: "Tab",
            rate: "4.50",
            discount: "0",
            amount: "45.00",
            include: true,
            exclude: false,
            payment: "N/A",
        },
        {
            id: 3,
            itemCode: "MED003",
            itemName: "Ceftriaxone 1gm Inj",
            batchNo: "CFT7785",
            expiry: "06-2026",
            pack: "1 Vial",
            availableStock: "300",
            qty: "5",
            unit: "Vial",
            rate: "28.00",
            discount: "0",
            amount: "140.00",
            include: true,
            exclude: false,
            payment: "N/A",
        },
        {
            id: 4,
            itemCode: "MED004",
            itemName: "Metronidazole 500mg Tab",
            batchNo: "MTZ9981",
            expiry: "09-2026",
            pack: "10 Tab",
            availableStock: "800",
            qty: "10",
            unit: "Tab",
            rate: "2.00",
            discount: "0",
            amount: "20.00",
            include: true,
            exclude: false,
            payment: "N/A",
        },
        {
            id: 5,
            itemCode: "MED005",
            itemName: "Amoxicillin 500mg Cap",
            batchNo: "AMX1123",
            expiry: "03-2027",
            pack: "10 Cap",
            availableStock: "1,050",
            qty: "10",
            unit: "Cap",
            rate: "3.50",
            discount: "0",
            amount: "35.00",
            include: false,
            exclude: true,
            payment: "Take Payment",
        },
        {
            id: 6,
            itemCode: "MED006",
            itemName: "ORS Powder",
            batchNo: "ORS5566",
            expiry: "01-2027",
            pack: "1 Pkt",
            availableStock: "450",
            qty: "5",
            unit: "Pkt",
            rate: "5.00",
            discount: "0",
            amount: "25.00",
            include: false,
            exclude: true,
            payment: "Take Payment",
        },
    ]);

    const handleDelete = (id) => {
        alert(`Delete clicked for item id: ${id}`);
    };

    return (
        <div className="card mt-1 p-3 bg-white border border-gray-200 rounded-xl shadow-2xs">

            {/* Table Header / Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between pb-3 mb-3 border-b border-gray-200 gap-2">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wide">
                    <FileText size={16} className="text-blue-800" />
                    <span>Selected Medicines</span>
                </div>

                {/* Fixed Action Buttons Container with universal horizontal scrolling */}
                <div className="flex items-center gap-2 flex-nowrap overflow-x-auto whitespace-nowrap pb-1 [&::-webkit-scrollbar]:h-1 w-full sm:w-auto">
                    <button
                        onClick={() => alert("Remove Selected clicked")}
                        className="border border-rose-300 text-rose-600 hover:bg-rose-50 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs h-[40px] shrink-0"
                    >
                        <Trash2 size={13} />
                        <span>Remove Selected</span>
                    </button>

                    <button
                        onClick={() => alert("Clear All clicked")}
                        className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs h-[40px] shrink-0"
                    >
                        <RefreshCw size={13} />
                        <span>Clear All</span>
                    </button>

                    <button
                        onClick={() => alert("Load From Prescription clicked")}
                        className="bg-white border border-gray-300 hover:bg-gray-50 text-[#0B5394] font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs h-[40px] shrink-0"
                    >
                        <Download size={13} />
                        <span>Load From Prescription</span>
                    </button>

                    <button
                        onClick={() => alert("Apply Scheme clicked")}
                        className="save-btn flex items-center gap-1 shrink-0 h-[40px]"
                    >
                        <Percent size={13} />
                        <span>Apply Scheme</span>
                    </button>
                </div>
            </div>

            {/* ================= TABLE CONTAINER ================= */}
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1400px] border-collapse text-left text-[11px]">
                    <thead>
                        <tr className="bg-blue-50 text-gray-600 font-bold uppercase text-[10px] tracking-wider">
                            <th className="border border-gray-300 py-2.5 px-2 text-center w-[3%]">
                                <input type="checkbox" className="rounded border-gray-300 text-blue-600 cursor-pointer w-3.5 h-3.5" />
                            </th>
                            <th className="border border-gray-300 py-2.5 px-2 text-center w-[4%]">Sr.</th>
                            <th className="border border-gray-300 py-2.5 px-3 w-[7%]">Item Code</th>
                            <th className="border border-gray-300 py-2.5 px-3 w-[15%]">Item Name</th>
                            <th className="border border-gray-300 py-2.5 px-3 w-[8%]">Batch No.</th>
                            <th className="border border-gray-300 py-2.5 px-3 text-center w-[7%]">Expiry</th>
                            <th className="border border-gray-300 py-2.5 px-3 text-center w-[6%]">Pack</th>
                            <th className="border border-gray-300 py-2.5 px-3 text-right w-[7%]">Available Stock</th>
                            <th className="border border-gray-300 py-2.5 px-3 text-center w-[6%]">Qty</th>
                            <th className="border border-gray-300 py-2.5 px-3 text-center w-[6%]">Unit</th>
                            <th className="border border-gray-300 py-2.5 px-3 text-right w-[7%]">Rate (₹)</th>
                            <th className="border border-gray-300 py-2.5 px-3 text-center w-[6%]">Discount (%)</th>
                            <th className="border border-gray-300 py-2.5 px-3 text-right w-[8%]">Amount (₹)</th>
                            <th className="border border-gray-300 py-2.5 px-3 text-center w-[5%]">Include</th>
                            <th className="border border-gray-300 py-2.5 px-3 text-center w-[5%]">Exclude</th>
                            <th className="border border-gray-300 py-2.5 px-3 text-center w-[8%]">Payment</th>
                            <th className="border border-gray-300 py-2.5 px-2 text-center w-[5%]">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                        {selectedMedicines.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                <td className="border border-gray-300 py-2 px-2 text-center">
                                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 cursor-pointer w-3.5 h-3.5" />
                                </td>
                                <td className="border border-gray-300 py-2 px-2 text-center font-bold text-gray-900">
                                    {item.id}
                                </td>
                                <td className="border border-gray-300 py-2 px-3 text-blue-600 font-bold">
                                    {item.itemCode}
                                </td>
                                <td className="border border-gray-300 py-2 px-3 text-gray-900 font-bold">
                                    {item.itemName}
                                </td>
                                <td className="border border-gray-300 py-2 px-3 text-gray-700 font-medium">
                                    {item.batchNo}
                                </td>
                                <td className="border border-gray-300 py-2 px-3 text-center text-gray-600">
                                    {item.expiry}
                                </td>
                                <td className="border border-gray-300 py-2 px-3 text-center text-gray-600">
                                    {item.pack}
                                </td>
                                <td className="border border-gray-300 py-2 px-3 text-right text-gray-700 font-bold">
                                    {item.availableStock}
                                </td>
                                <td className="border border-gray-300 py-2 px-3 text-center">
                                    <input
                                        type="text"
                                        defaultValue={item.qty}
                                        className="w-12 text-center border border-gray-300 rounded px-1 py-0.5 text-xs font-bold text-gray-900 bg-white"
                                    />
                                </td>
                                <td className="border border-gray-300 py-2 px-3 text-center text-gray-600">
                                    {item.unit}
                                </td>
                                <td className="border border-gray-300 py-2 px-3 text-right text-gray-800">
                                    {item.rate}
                                </td>
                                <td className="border border-gray-300 py-2 px-3 text-center text-gray-600">
                                    {item.discount}
                                </td>
                                <td className="border border-gray-300 py-2 px-3 text-right font-bold text-gray-900">
                                    {item.amount}
                                </td>
                                <td className="border border-gray-300 py-2 px-3 text-center">
                                    <input
                                        type="checkbox"
                                        defaultChecked={item.include}
                                        className="rounded border-gray-300 text-blue-600 cursor-pointer w-3.5 h-3.5"
                                    />
                                </td>
                                <td className="border border-gray-300 py-2 px-3 text-center">
                                    <input
                                        type="checkbox"
                                        defaultChecked={item.exclude}
                                        className="rounded border-gray-300 text-rose-600 cursor-pointer w-3.5 h-3.5"
                                    />
                                </td>
                                <td className="border border-gray-300 py-2 px-3 text-center">
                                    {item.payment === "Take Payment" ? (
                                        <select className="border border-gray-300 rounded text-[10px] font-bold px-1.5 py-1 text-rose-600 bg-rose-50 cursor-pointer">
                                            <option value="Take Payment">Take Payment</option>
                                            <option value="Paid">Paid</option>
                                            <option value="Free">Free</option>
                                        </select>
                                    ) : (
                                        <span className="text-gray-400 font-medium">N/A</span>
                                    )}
                                </td>
                                <td className="border border-gray-300 py-2 px-2 text-center">
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer transition-colors"
                                        title="Delete Item"
                                    >
                                        <Trash2 size={14} />
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