import { useState } from "react";
import { Search, Calendar, ChevronDown, Barcode, Sparkles, Droplet, XCircle, Building2, Microscope, ShieldCheck, Printer, Clock, Truck } from "lucide-react";

export default function SearchBar() {
  const [showSearchInputs, setShowSearchInputs] = useState(false);
  const [filters, setFilters] = useState({
    sampleId: "",
    patientName: "",
    uhid: "",
    sampleType: "All",
    status: "All",
    fromDate: "",
    toDate: "",
    priority: "All",
    department: "All",
    corporate: "All",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    alert(
      `Search initiated!\nApplied filters:\n- Sample ID: ${filters.sampleId || "None"}\n- Patient Name: ${filters.patientName || "None"}\n- UHID: ${filters.uhid || "None"}\n- Sample Type: ${filters.sampleType}\n- Status: ${filters.status}\n- Priority: ${filters.priority}\n- Department: ${filters.department}\n- Corporate: ${filters.corporate}`
    );
  };

  return (
    <div
      className={`card mt-2 p-3 sm:p-4  transition-all duration-300 ease-in-out ${showSearchInputs
          ? "bg-[#eff6ff] border border-blue-200 shadow-sm"
          : "bg-transparent border-none shadow-none"
        }` }
      style={{ backgroundColor:"#f1f9ff"}}>

      {/* Search button to open/close fields */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setShowSearchInputs(!showSearchInputs)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
        >
          <Search size={14} />
          <span>{showSearchInputs ? "Hide Search Filters" : "Open Search Filters"}</span>
        </button>
      </div>

      {/* Collapsible search fields */}
      {showSearchInputs && (
        <div className="transition-all duration-300 ease-in-out space-y-3 mb-4 pt-2 border-t border-blue-200">

          {/* ================= ROW 1 ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-gray-600 mb-1">
                Sample ID / Barcode / Test
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  name="sampleId"
                  value={filters.sampleId}
                  onChange={handleChange}
                  placeholder="Search..."
                  className="w-full bg-white border border-gray-200 rounded-lg text-xs px-3 py-1.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 pr-8"
                />
                <Barcode size={15} className="absolute right-2.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-gray-600 mb-1">
                Patient Name
              </label>
              <input
                type="text"
                name="patientName"
                value={filters.patientName}
                onChange={handleChange}
                placeholder="Enter name"
                className="w-full bg-white border border-gray-200 rounded-lg text-xs px-3 py-1.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-gray-600 mb-1">
                UHID
              </label>
              <input
                type="text"
                name="uhid"
                value={filters.uhid}
                onChange={handleChange}
                placeholder="Enter UHID"
                className="w-full bg-white border border-gray-200 rounded-lg text-xs px-3 py-1.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-gray-600 mb-1">
                Sample Type
              </label>
              <div className="relative">
                <select
                  name="sampleType"
                  value={filters.sampleType}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-lg text-xs px-3 py-1.5 text-gray-800 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="Blood (EDTA)">Blood (EDTA)</option>
                  <option value="Serum">Serum</option>
                  <option value="Urine">Urine</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-gray-600 mb-1">
                Status
              </label>
              <div className="relative">
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-lg text-xs px-3 py-1.5 text-gray-800 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="Received">Received</option>
                  <option value="Processing">Processing</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* ================= ROW 2 ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 items-end">
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-gray-600 mb-1">
                Collection Date
              </label>
              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-800">
                <Calendar size={14} className="text-gray-400 shrink-0" />
                <input
                  type="date"
                  name="fromDate"
                  value={filters.fromDate}
                  onChange={handleChange}
                  className="bg-transparent text-[10px] text-gray-700 focus:outline-none w-full"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="date"
                  name="toDate"
                  value={filters.toDate}
                  onChange={handleChange}
                  className="bg-transparent text-[10px] text-gray-700 focus:outline-none w-full"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-gray-600 mb-1">
                Priority
              </label>
              <div className="relative">
                <select
                  name="priority"
                  value={filters.priority}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-lg text-xs px-3 py-1.5 text-gray-800 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-gray-600 mb-1">
                Department
              </label>
              <div className="relative">
                <select
                  name="department"
                  value={filters.department}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-lg text-xs px-3 py-1.5 text-gray-800 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="Hematology">Hematology</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-gray-600 mb-1">
                Corporate
              </label>
              <div className="relative">
                <select
                  name="corporate"
                  value={filters.corporate}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-lg text-xs px-3 py-1.5 text-gray-800 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="Varanasi">Varanasi</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center">
              <button
                onClick={handleSearch}
                className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-1.5 px-3 rounded-lg shadow-xs transition-all cursor-pointer"
              >
                <Search size={14} />
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ALWAYS VISIBLE STATUS PILL BADGES ================= */}
      <div className="card mt-2" style={{ backgroundColor: "transparent", border: "none", boxShadow: "none", paddingBottom: 0 }}>
        <div className="flex flex-wrap justify-between items-center gap-x-6 gap-y-3 text-xs font-semibold text-gray-700">

          <div className="flex items-center gap-2 transition-all cursor-pointer active:scale-95" onClick={() => alert("New clicked")}>
            <Sparkles size={14} className="text-purple-600" />
            <span>New</span>
          </div>

          <div className="flex items-center gap-2 transition-all cursor-pointer active:scale-95" onClick={() => alert("Sample Collected clicked")}>
            <Droplet size={14} className="text-amber-600" />
            <span>Sample Collected</span>
          </div>

          <div className="flex items-center gap-2 transition-all cursor-pointer active:scale-95" onClick={() => alert("Sample Rejected clicked")}>
            <XCircle size={14} className="text-red-600" />
            <span>Sample Rejected</span>
          </div>

          <div className="flex items-center gap-2 transition-all cursor-pointer active:scale-95" onClick={() => alert("Department Receive clicked")}>
            <Building2 size={14} className="text-blue-500" />
            <span>Department Receive</span>
          </div>

          <div className="flex items-center gap-2 transition-all cursor-pointer active:scale-95" onClick={() => alert("Tested clicked")}>
            <Microscope size={14} className="text-pink-600" />
            <span>Tested</span>
          </div>

          <div className="flex items-center gap-2 transition-all cursor-pointer active:scale-95" onClick={() => alert("Approved clicked")}>
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Approved</span>
          </div>

          <div className="flex items-center gap-2 transition-all cursor-pointer active:scale-95" onClick={() => alert("Printed clicked")}>
            <Printer size={14} className="text-blue-600" />
            <span>Printed</span>
          </div>

          <div className="flex items-center gap-2 transition-all cursor-pointer active:scale-95" onClick={() => alert("Hold clicked")}>
            <Clock size={14} className="text-amber-500" />
            <span>Hold</span>
          </div>

          <div className="flex items-center gap-2 transition-all cursor-pointer active:scale-95" onClick={() => alert("Dispatched clicked")}>
            <Truck size={14} className="text-emerald-700" />
            <span>Dispatched</span>
          </div>

        </div>
      </div>

    </div>
  );
}