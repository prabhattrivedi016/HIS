import InputField from "@/components/customInputField";
import { AlertTriangle, Barcode, FileText, Percent, Plus, Search } from "lucide-react";
import { useState } from "react";

export default function MedicineActionCards() {
  const [activeTab, setActiveTab] = useState("Search by Item");
  const [searchQuery, setSearchQuery] = useState("");

  const searchTabs = ["Search by Item", "Search by Generic", "Search by Category", "Fav Items"];

  const prescriptions = [
    { name: "Paracetamol 650", dose: "1 Tab TDS" },
    { name: "Pantoprazole 40", dose: "1 Tab OD" },
    { name: "Ceftriaxone 1gm Inj", dose: "1 Inj BD" },
    { name: "Metronidazole 500", dose: "1 Tab TDS" },
  ];

  return (
    <div className=" card grid grid-cols-1 lg:grid-cols-12 gap-2 mt-1">
      {/* ================= 1. ADD MEDICINE SECTION (Left - Wider) ================= */}
      <div className="lg:col-span-6 card ">
        <div className="space-y-3">
          {/* Header Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-gray-100">
            {searchTabs.map(tab => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#0B5394] text-white shadow-xs"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative flex items-center w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search medicine by name, code, brand, or scan barcode..."
              className="input-field "
            />
            <button
              onClick={() => alert("Search triggered")}
              className="absolute right-1.5 bg-[#0B5394] hover:bg-blue-900 text-white p-1.5 rounded-md cursor-pointer transition-colors mt-[-8px]"
            >
              <Search size={13} />
            </button>
          </div>

          {/* Filters Row (Category, Manufacturer, Form, Add, Reset) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
            {/* Category */}
            <div className="flex flex-col gap-1">
              <InputField label="Category" />
              <select className="input-field">
                <option>-- All Category --</option>
                <option>Tablets</option>
                <option>Capsules</option>
                <option>Injections</option>
              </select>
            </div>

            {/* Manufacturer */}
            <div className="flex flex-col gap-1">
              <InputField label="Manufacturer" />
              <select className="input-field">
                <option>-- All Manufacturer --</option>
                <option>Cipla</option>
                <option>Sun Pharma</option>
                <option>Dr. Reddy's</option>
              </select>
            </div>

            {/* Form */}
            <div className="flex flex-col gap-1">
              <InputField label="Form" />
              <select className="input-field">
                <option>-- All Form --</option>
                <option>Tablet</option>
                <option>Syrup</option>
                <option>Vial</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bottom Action Buttons inside Add Medicine */}
        <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-gray-100">
          <button
            onClick={() => alert("Reset clicked")}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700  rounded-lg px-3 py-2  text-base font-medium transition active:scale-90 cursor-pointer"
          >
            Reset
          </button>
          <button onClick={() => alert("Add clicked")} className="save-btn">
            Add
          </button>
        </div>
      </div>

      {/* ================= 2. QUICK OPTIONS & LAST PRESCRIPTION (Right Column) ================= */}
      <div className="lg:col-span-6 flex flex-col lg:flex-row gap-3">
        {/* Quick Options Box */}
        <div className="card bg-white border border-gray-200 rounded-xl p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-gray-100 text-blue-900 font-bold text-xs">
            <FileText size={14} className="text-blue-600" />
            <span>Quick Options</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => alert("Add to Favourite clicked")}
              className="flex items-center gap-1.5 p-2 rounded-lg bg-blue-50/50 hover:bg-blue-50 border border-blue-100 text-blue-700 font-bold transition-colors cursor-pointer h-[50px]"
            >
              <Plus size={14} />
              <span>Add to Favourite</span>
            </button>

            <button
              onClick={() => alert("Apply Discount clicked")}
              className="flex items-center gap-1.5 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold transition-colors cursor-pointer h-[50px]"
            >
              <Percent size={14} />
              <span>Apply Discount</span>
            </button>

            <button
              onClick={() => alert("Scan Barcode clicked")}
              className="flex items-center gap-1.5 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold transition-colors cursor-pointer h-[50px]"
            >
              <Barcode size={14} />
              <span>Scan Barcode</span>
            </button>

            <button
              onClick={() => alert("Check Interaction clicked")}
              className="flex items-center gap-1.5 p-2 rounded-lg bg-rose-50/50 hover:bg-rose-50 border border-rose-100 text-rose-700 font-bold transition-colors cursor-pointer h-[50px]"
            >
              <AlertTriangle size={14} />
              <span>Check Interaction</span>
            </button>
          </div>
        </div>

        {/* Last Prescription (IPD) Box */}
        <div className="card ">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
            <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
              <FileText size={14} className="text-blue-600" />
              <span>Last Prescription (IPD)</span>
            </div>
          </div>

          {/* Prescription Items List */}
          <div className="space-y-1.5 overflow-y-auto pr-1">
            {prescriptions.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 hover:bg-blue-50/30 border border-gray-100 px-2.5 py-1.5 rounded-lg text-xs transition-colors h-[45px]"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900">{item.name}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500">{item.dose}</span>
                </div>
                <button
                  onClick={() => alert(`Added ${item.name}`)}
                  className="bg-[#0B5394] hover:bg-blue-900 text-white font-bold px-3 py-1 rounded text-[11px] shadow-2xs transition-colors cursor-pointer"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
