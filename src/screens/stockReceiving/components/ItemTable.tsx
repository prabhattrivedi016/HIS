import { useState } from "react";
import { Receipt, FileText } from "lucide-react";

export default function ItemTable() {
    const [activeTab, setActiveTab] = useState("Item Details");

    const tabs = ["Item Details", "Batch / Expiry", "Tax Details", "Remarks"];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mt-3 w-full">

            {/* ================= LEFT SIDE: TABS & ITEM DETAILS ================= */}
            <div className="lg:col-span-6 card bg-white border border-gray-200 rounded-xl p-3 shadow-2xs flex flex-col justify-between">

                {/* Tabs Header */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-gray-100 [&::-webkit-scrollbar]:h-1">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap  transition-transform cursor-pointer  ${isActive
                                        ? "bg-[#0B5394] text-white shadow-xs"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                                    }`}
                            >
                                {tab}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="pt-3">
                    {activeTab === "Item Details" && (
                        <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                            {/* Item Image Box */}
                            <div className="w-24 h-24 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                                <span className="text-[10px] text-gray-400 font-bold">[ Mask Image ]</span>
                            </div>

                            {/* Details List with vertical colon alignment */}
                            <div className="grid grid-cols-[max-content_12px_1fr] items-center gap-x-2 gap-y-1.5 text-xs w-full">
                                <span className="text-gray-500 font-medium">Item Code</span>
                                <span className="font-bold text-gray-900">:</span>
                                <span className="font-bold text-blue-600">MED00125</span>

                                <span className="text-gray-500 font-medium">Item Name</span>
                                <span className="font-bold text-gray-900">:</span>
                                <span className="font-bold text-gray-900">Paracetamol 500 mg Tablet</span>

                                <span className="text-gray-500 font-medium">Generic Name</span>
                                <span className="font-bold text-gray-900">:</span>
                                <span className="font-bold text-gray-900">Paracetamol</span>

                                <span className="text-gray-500 font-medium">Category</span>
                                <span className="font-bold text-gray-900">:</span>
                                <span className="font-bold text-gray-900">Allopathy</span>

                                <span className="text-gray-500 font-medium">Shelf</span>
                                <span className="font-bold text-gray-900">:</span>
                                <span className="font-bold text-gray-900">Allopathy - Tablets</span>

                                <span className="text-gray-500 font-medium">Reorder Level</span>
                                <span className="font-bold text-gray-900">:</span>
                                <span className="font-bold text-gray-900">500</span>
                            </div>
                        </div>
                    )}

                    {activeTab === "Batch / Expiry" && (
                        <div className="p-4 text-xs text-gray-600 font-medium">
                            Batch and Expiry details for selected item will appear here...
                        </div>
                    )}

                    {activeTab === "Tax Details" && (
                        <div className="p-4 text-xs text-gray-600 font-medium">
                            Tax details and GST breakdown will appear here...
                        </div>
                    )}

                    {activeTab === "Remarks" && (
                        <div className="p-4 text-xs text-gray-600 font-medium">
                            Item specific remarks and notes will appear here...
                        </div>
                    )}
                </div>

            </div>

            {/* ================= RIGHT SIDE: SUMMARY CARD (TWO PARTS) ================= */}
            <div className="lg:col-span-6 card bg-white border border-gray-200 rounded-xl p-3 shadow-2xs flex flex-col justify-between">

                <div>
                    <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-gray-100 text-blue-900 font-bold text-xs">
                        <Receipt size={14} className="text-blue-600" />
                        <span>Summary</span>
                    </div>

                    {/* Summary Split into Two Parts */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">

                        {/* Left Side: Qty Data with HR Line */}
                        <div className="space-y-2 border-b sm:border-b-0 sm:border-r border-gray-200 pb-3 sm:pb-0 sm:pr-3 flex flex-col justify-center">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500 font-medium">Total Qty (Received)</span>
                                <span className="font-bold text-gray-900">480</span>
                            </div>
                            <hr className="border-gray-200 " />
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500 font-medium">Free Qty</span>
                                <span className="font-bold text-gray-900">15</span>
                            </div>
                            <hr className="border-gray-200" />
                            <div className="flex items-center justify-between">
                                <span className="text-gray-700 font-bold">Total Qty</span>
                                <span className="font-bold text-gray-900">495</span>
                            </div>
                            <hr className="border-gray-200 " />
                        </div>

                        {/* Right Side: 5 Financial Entries (including Grand Total with light green background) */}
                        <div className="space-y-1.5 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500 font-medium text-[11px]">Total Amount (₹)</span>
                                <span className="font-bold text-gray-900 text-[11px]">13,210.00</span>
                            </div>
                            <hr className="border-gray-200 " />
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500 font-medium text-[11px]">Discount Amount (₹)</span>
                                <span className="font-bold text-gray-900 text-[11px]">230.00</span>
                            </div>
                            <hr className="border-gray-200 " />
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500 font-medium text-[11px]">Taxable Amount (₹)</span>
                                <span className="font-bold text-gray-900 text-[11px]">12,980.00</span>
                            </div>
                            <hr className="border-gray-200 " />
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500 font-medium text-[11px]">GST (12%) (₹)</span>
                                <span className="font-bold text-gray-900 text-[11px]">1,557.60</span>
                            </div>
                            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-2 py-1.5 rounded-sm mt-1">
                                <span className="text-emerald-900 font-bold text-xs">Grand Total (₹)</span>
                                <span className="font-bold text-emerald-700 text-xs">14,537.60</span>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

        </div>
    );
}