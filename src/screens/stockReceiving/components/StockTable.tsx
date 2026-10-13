import { useState } from "react";
import { Edit2, Trash2 } from "lucide-react";

export default function StockTable() {
    const [items, setItems] = useState([
        {
            id: 1,
            itemCode: "MED00125",
            itemName: "Paracetamol 500 mg Tablet",
            hsn: "30049099",
            batchNo: "PT2410",
            expiryDate: "12-2027",
            pack: "Strip (10)",
            mrp: "25.00",
            rate: "18.50",
            qtyReceived: "100",
            freeQty: "10",
            totalQty: "110",
            discPercent: "0.00",
            discAmt: "0.00",
            amount: "1,850.00",
        },
        {
            id: 2,
            itemCode: "MED00566",
            itemName: "Cefixime 200 mg Tablet",
            hsn: "30042010",
            batchNo: "CF2410",
            expiryDate: "08-2027",
            pack: "Strip (10)",
            mrp: "120.00",
            rate: "92.00",
            qtyReceived: "50",
            freeQty: "5",
            totalQty: "55",
            discPercent: "5.00",
            discAmt: "230.00",
            amount: "4,370.00",
        },
        {
            id: 3,
            itemCode: "MED000890",
            itemName: "Pantoprazole 40 mg Inj",
            hsn: "30049099",
            batchNo: "PT2309",
            expiryDate: "03-2028",
            pack: "Vial",
            mrp: "85.00",
            rate: "62.00",
            qtyReceived: "30",
            freeQty: "0",
            totalQty: "30",
            discPercent: "0.00",
            discAmt: "0.00",
            amount: "1,860.00",
        },
        {
            id: 4,
            itemCode: "MED01560",
            itemName: "Normal Saline 100 ml",
            hsn: "30049099",
            batchNo: "NS2410",
            expiryDate: "11-2027",
            pack: "Bottle",
            mrp: "32.00",
            rate: "24.00",
            qtyReceived: "100",
            freeQty: "0",
            totalQty: "100",
            discPercent: "0.00",
            discAmt: "0.00",
            amount: "2,400.00",
        },
        {
            id: 5,
            itemCode: "MED02145",
            itemName: "Surgical Gloves (M)",
            hsn: "40151900",
            batchNo: "GL2410",
            expiryDate: "10-2029",
            pack: "Pair",
            mrp: "18.00",
            rate: "12.50",
            qtyReceived: "200",
            freeQty: "0",
            totalQty: "200",
            discPercent: "0.00",
            discAmt: "0.00",
            amount: "2,500.00",
        },
    ]);

    const handleEdit = (itemCode) => {
        alert(`Edit clicked for item: ${itemCode}`);
    };

    const handleDelete = (itemCode) => {
        alert(`Delete clicked for item: ${itemCode}`);
    };

    return (
        <div className="card mt-2 p-3 bg-white border border-gray-200 rounded-xl shadow-2xs w-full">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1550px] border-collapse text-left text-[11px]">
                    <thead>
                        <tr className="bg-blue-50 text-gray-600 font-bold uppercase text-[10px] tracking-wider">
                            <th className="border border-gray-300 py-2.5 px-2 text-center w-[3%]">S.No.</th>
                            <th className="border border-gray-300 py-2.5 px-3 w-[7%]">Item Code</th>
                            <th className="border border-gray-300 py-2.5 px-3 w-[15%]">Item Name</th>
                            <th className="border border-gray-300 py-2.5 px-3 w-[6%]">HSN</th>
                            <th className="border border-gray-300 py-2.5 px-3 w-[7%]">Batch No.</th>
                            <th className="border border-gray-300 py-2.5 px-3 text-center w-[7%]">Expiry Date</th>
                            <th className="border border-gray-300 py-2.5 px-3 text-center w-[6%]">Pack</th>
                            <th className="border border-gray-300 py-2.5 px-3 text-right w-[5%]">MRP (₹)</th>
                            <th className="border border-gray-300 py-2.5 px-3 text-right w-[6%]">Rate (₹)</th>
                            <th className="border border-gray-300 py-2.5 px-3 text-center w-[8%]">Qty Received</th>
                            <th className="border border-gray-300 py-2.5 px-3 text-center w-[5%]">Free Qty</th>
                            <th className="border border-gray-300 py-2.5 px-3 text-center w-[6%]">Total Qty</th>
                            <th className="border border-gray-300 py-2.5 px-3 text-center w-[5%]">Disc. %</th>
                            <th className="border border-gray-300 py-2.5 px-3 text-center w-[7%]">Disc. Amt (₹)</th>
                            <th className="border border-gray-300 py-2.5 px-3 text-right w-[6%]">Amount (₹)</th>
                            <th className="border border-gray-300 py-2.5 px-2 text-center w-[6%]">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                <td className="border border-gray-300 py-2 px-2 text-center font-bold text-gray-900">
                                    {item.id}
                                </td>
                                <td className="border border-gray-300 py-2 px-3 text-blue-600 font-bold">
                                    {item.itemCode}
                                </td>
                                <td className="border border-gray-300 py-2 px-3 text-gray-900 font-bold">
                                    {item.itemName}
                                </td>
                                <td className="border border-gray-300 py-2 px-3 text-gray-600">
                                    {item.hsn}
                                </td>
                                <td className="border border-gray-300 py-2 px-3 text-gray-700 font-medium">
                                    {item.batchNo}
                                </td>
                                <td className="border border-gray-300 py-2 px-3 text-center text-gray-600">
                                    {item.expiryDate}
                                </td>
                                <td className="border border-gray-300 py-2 px-3 text-center text-gray-600">
                                    {item.pack}
                                </td>
                                <td className="border border-gray-300 py-2 px-3 text-right text-gray-800">
                                    {item.mrp}
                                </td>
                                <td className="border border-gray-300 py-2 px-3 text-right text-gray-800">
                                    {item.rate}
                                </td>
                                <td className="border border-gray-300 py-2 px-3 text-center text-gray-800">
                                    {item.qtyReceived}
                                </td>
                                <td className="border border-gray-300 py-2 px-3 text-center text-gray-800">
                                    {item.freeQty}
                                </td>
                                <td className="border border-gray-300 py-2 px-3 text-center font-bold text-gray-900">
                                    {item.totalQty}
                                </td>
                                <td className="border border-gray-300 py-2 px-3 text-center text-gray-600">
                                    {item.discPercent}
                                </td>
                                <td className="border border-gray-300 py-2 px-3 text-center text-gray-800">
                                    {item.discAmt}
                                </td>
                                <td className="border border-gray-300 py-2 px-3 text-right font-bold text-gray-900">
                                    {item.amount}
                                </td>
                                <td className="border border-gray-300 py-2 px-2 text-center">
                                    <div className="flex items-center justify-center space-x-1.5">
                                        <button
                                            onClick={() => handleEdit(item.itemCode)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded cursor-pointer transition-colors shadow-2xs"
                                            title="Edit Item"
                                        >
                                            <Edit2 size={13} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.itemCode)}
                                            className="bg-rose-600 hover:bg-rose-700 text-white p-1 rounded cursor-pointer transition-colors shadow-2xs"
                                            title="Delete Item"
                                        >
                                            <Trash2 size={13} />
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