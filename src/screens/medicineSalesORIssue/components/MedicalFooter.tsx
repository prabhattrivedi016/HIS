import { useState } from "react";
import { FileText, CreditCard, Receipt, Send, Printer, Eye, XCircle } from "lucide-react";

export default function MedicalFooter() {
    const [issueRemarks, setIssueRemarks] = useState("");
    const [paymentMode, setPaymentMode] = useState("Cash");
    const [receivedAmount, setReceivedAmount] = useState("60.00");

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2 mt-1 w-full">

            {/* ================= 1. ISSUE REMARKS ================= */}
            <div className="card bg-white border border-gray-200 rounded-xl p-3 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-gray-100 text-blue-900 font-bold text-xs">
                    <FileText size={14} className="text-blue-600" />
                    <span>Issue Remarks</span>
                </div>
                <div className="flex flex-col flex-1">
                    <textarea
                        value={issueRemarks}
                        onChange={(e) => setIssueRemarks(e.target.value)}
                        maxLength={250}
                        placeholder="Enter issue remarks, instructions or notes..."
                        className="w-full flex-1 border border-gray-300 rounded-lg p-2 text-xs text-gray-800 bg-white focus:outline-none focus:border-blue-500 resize-none min-h-[90px]"
                    />
                    <div className="text-right text-[10px] text-gray-400 mt-1">
                        {issueRemarks.length}/250
                    </div>
                </div>
            </div>

            {/* ================= 2. PAYMENT DETAILS (FOR EXCLUDED ITEMS) ================= */}
            <div className="card bg-white border border-gray-200 rounded-xl p-3 shadow-2xs flex flex-col ">
                <div className="flex items-center gap-1.5 pb-2  border-b border-gray-100 text-blue-900 font-bold text-xs mb-4">
                    <CreditCard size={14} className="text-blue-600" />
                    <span>Payment Details (for Excluded Items)</span>
                </div>
                <div className="space-y-2 text-xs ">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">Excluded Items Total (₹)</span>
                        <span className="font-bold text-gray-900">60.00</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">Payment Mode</span>
                        <select
                            value={paymentMode}
                            onChange={(e) => setPaymentMode(e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-xs font-bold text-gray-800 bg-white cursor-pointer w-[100px] h-[40px] focus:outline-none focus:border-blue-500"
                        >
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                            <option value="UPI">UPI</option>
                        </select>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">Received Amount (₹)</span>
                        <input
                            type="text"
                            value={receivedAmount}
                            onChange={(e) => setReceivedAmount(e.target.value)}
                            className="w-[100px] border border-gray-300 rounded px-2 py-1 text-xs font-bold text-right text-gray-900 bg-white h-[40px] focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                        <span className="text-gray-500 font-medium">Balance (₹)</span>
                        <span className="font-bold text-gray-900">0.00</span>
                    </div>
                </div>
            </div>

            {/* ================= 3. BILLING SUMMARY ================= */}
            <div className="card bg-white border border-gray-200 rounded-xl p-3 shadow-2xs flex flex-col ">
                <div className="flex items-center gap-1.5 pb-2 mb-4 border-b border-gray-100 text-blue-900 font-bold text-xs">
                    <Receipt size={14} className="text-blue-600" />
                    <span>Billing Summary</span>
                </div>
                <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">Total Items</span>
                        <span className="font-bold text-gray-900">6</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">Total Qty</span>
                        <span className="font-bold text-gray-900">50</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">Total Amount (₹)</span>
                        <span className="font-bold text-gray-900">277.00</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">Excluded Items Amount (₹)</span>
                        <span className="font-bold text-gray-900">60.00</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">Amount to Add in IPD Bill (₹)</span>
                        <span className="font-bold text-gray-900">217.00</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">Discount Amount (₹)</span>
                        <span className="font-bold text-gray-900">0.00</span>
                    </div>
                    <div className="flex items-center justify-between pt-1.5 border-t border-gray-200 text-sm font-bold text-blue-900">
                        <span>Net Amount (₹)</span>
                        <span className="text-blue-600">277.00</span>
                    </div>
                </div>
            </div>

            {/* ================= 4. ACTIONS ================= */}
            <div className="card bg-white border border-gray-200 rounded-xl p-3 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-gray-100 text-blue-900 font-bold text-xs">
                    <FileText size={14} className="text-blue-600" />
                    <span>Actions</span>
                </div>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => alert("Save & Issue (F9) clicked")}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer h-[40px]"
                    >
                        <Send size={14} />
                        <span>Save & Issue (F9)</span>
                    </button>

                    <button
                        onClick={() => alert("Print Issue Slip clicked")}
                        className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    >
                        <Printer size={14} />
                        <span>Print Issue Slip</span>
                    </button>

                    <button
                        onClick={() => alert("Preview Bill clicked")}
                        className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer h-[40px]"
                    >
                        <Eye size={14} />
                        <span>Preview Bill</span>
                    </button>

                    <button
                        onClick={() => alert("Cancel clicked")}
                        className="w-full border border-rose-300 text-rose-600 hover:bg-rose-50 font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer h-[40px]"
                    >
                        <XCircle size={14} />
                        <span>Cancel</span>
                    </button>
                </div>
            </div>

        </div>
    );
}