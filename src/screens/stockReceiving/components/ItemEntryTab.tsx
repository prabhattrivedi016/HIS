import { useState } from "react";
import { Search, Plus, Upload, Barcode, Trash2, FileText } from "lucide-react";

export default function ItemEntryTab() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="card bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-2xs mt-2 w-full">

            {/* Header / Action Bar Container */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3">

                {/* Left Side: Title, Search Bar & Add Item Button */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto flex-1">

                    {/* Section Title */}
                    <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs shrink-0">
                        <FileText size={15} className="text-blue-600" />
                        <span>Item Entry</span>
                    </div>

                    {/* Search Input with Barcode Icon */}
                    <div className="relative flex items-center flex-1 max-w-xl mt-2 ">
                        
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search Item by Name / Code / Barcode (F2)"
                            className="input-field"
                        />
                        <Barcode size={16} className="absolute right-3 text-gray-400 cursor-pointer hover:text-blue-600 mt-[-4px]" />
                    </div>

                    {/* Add Item Button */}
                    <button
                        onClick={() => alert("Add Item clicked")}
                        className="bg-[#0B5394] hover:bg-blue-900 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0 active:scale-90 "
                    >
                        <Plus size={14} />
                        <span>Add Item</span>
                    </button>

                </div>

                {/* Right Side Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full lg:w-auto justify-end">

                    <button
                        onClick={() => alert("Upload from PO clicked")}
                        className="bg-white border border-gray-300 hover:bg-gray-50 text-blue-700 font-bold   text-xs flex items-center gap-1.5  cursor-pointer shadow-2xs shrink-0 rounded-lg px-3 py-2  transition active:scale-90 "
                    >
                        <Upload size={13} />
                        <span>Upload from PO</span>
                    </button>

                    <button
                        onClick={() => alert("Scan Barcode clicked")}
                        className="bg-white border border-gray-300 hover:bg-gray-50 text-blue-700 font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 transition active:scale-90 cursor-pointer shadow-2xs shrink-0"
                    >
                        <Barcode size={13} />
                        <span>Scan Barcode</span>
                    </button>

                    <button
                        onClick={() => alert("Remove Selected clicked")}
                        className="border border-rose-300 text-rose-600 hover:bg-rose-50 font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 transition active:scale-90 cursor-pointer shadow-2xs shrink-0"
                    >
                        <Trash2 size={13} />
                        <span>Remove Selected</span>
                    </button>

                </div>

            </div>

        </div>
    );
}