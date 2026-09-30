import Animation from "@/components/animation";
import CustomDateInput from "@/components/customDateInput";
import InputField from "@/components/customInputField";
import {
  Building2,
  Clock,
  Droplet,
  Microscope,
  Printer,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
  XCircle,
} from "lucide-react";
import { useState } from "react";

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

  const handleChange = e => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    alert(
      `Search initiated!\nApplied filters:\n- Sample ID: ${filters.sampleId || "None"}\n- Patient Name: ${filters.patientName || "None"}\n- UHID: ${filters.uhid || "None"}\n- Sample Type: ${filters.sampleType}\n- Status: ${filters.status}\n- Priority: ${filters.priority}\n- Department: ${filters.department}\n- Corporate: ${filters.corporate}`
    );
  };

  return (
    <div className={`card mt-1`}>
      {/* Search button to open/close fields */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setShowSearchInputs(!showSearchInputs)}
          className="flex  gap-1.5 items-center save-btn lg:max-h-8"
        >
          <Search size={14} />
          <span>{showSearchInputs ? "Hide Search Filters" : "Open Search Filters"}</span>
        </button>
      </div>

      {/* Collapsible search fields */}
      {showSearchInputs && (
        <Animation>
          <div className="transition-all duration-300 ease-in-out space-y-3 mb-4 pt-2 border-t border-blue-200">
            {/* ================= ROW 1 ================= */}
            <div className="form-grid-5">
              <InputField label="Sample ID / Barcode / Test">
                <input
                  type="text"
                  name="sampleId"
                  value={filters.sampleId}
                  onChange={handleChange}
                  placeholder="Search..."
                  className="input-field"
                />
              </InputField>

              <InputField label="Patient Name">
                <input
                  type="text"
                  name="patientName"
                  value={filters.patientName}
                  onChange={handleChange}
                  placeholder="Enter name"
                  className="input-field"
                />
              </InputField>

              <InputField label="UHID">
                <input
                  type="text"
                  name="uhid"
                  value={filters.uhid}
                  onChange={handleChange}
                  placeholder="Enter UHID"
                  className="input-field"
                />
              </InputField>

              <InputField label="Sample Type">
                <select
                  name="sampleType"
                  value={filters.sampleType}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="All">All</option>
                  <option value="Blood (EDTA)">Blood (EDTA)</option>
                  <option value="Serum">Serum</option>
                  <option value="Urine">Urine</option>
                </select>
              </InputField>

              <InputField label="Status">
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="All">All</option>
                  <option value="Received">Received</option>
                  <option value="Processing">Processing</option>
                </select>
              </InputField>

              {/* ================= ROW 2 ================= */}
              <InputField label="Collection Date">
                <div className="flex gap-1">
                  <CustomDateInput />
                  <CustomDateInput />
                </div>
              </InputField>

              <InputField label="Priority">
                <select
                  name="priority"
                  value={filters.priority}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="All">All</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                </select>
              </InputField>

              <InputField label="Department">
                <select
                  name="department"
                  value={filters.department}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="All">All</option>
                  <option value="Hematology">Hematology</option>
                </select>
              </InputField>

              <InputField label="Corporate">
                <select
                  name="corporate"
                  value={filters.corporate}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="All">All</option>
                  <option value="Varanasi">Varanasi</option>
                </select>
              </InputField>

              <div className="flex items-center justify-end mt-4">
                <button onClick={handleSearch} className="save-btn w-30">
                  <span>Search</span>
                </button>
              </div>
            </div>
          </div>
        </Animation>
      )}

      {/* ================= ALWAYS VISIBLE STATUS PILL BADGES ================= */}
      <div
        className="card mt-2"
        style={{
          backgroundColor: "transparent",
          border: "none",
          boxShadow: "none",
          paddingBottom: 0,
        }}
      >
        <div className="flex flex-wrap justify-between items-center gap-x-6 gap-y-3 text-xs font-semibold text-gray-700">
          <div
            className="flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            onClick={() => alert("New clicked")}
          >
            <Sparkles size={14} className="text-purple-600" />
            <span>New</span>
          </div>

          <div
            className="flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            onClick={() => alert("Sample Collected clicked")}
          >
            <Droplet size={14} className="text-amber-600" />
            <span>Sample Collected</span>
          </div>

          <div
            className="flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            onClick={() => alert("Sample Rejected clicked")}
          >
            <XCircle size={14} className="text-red-600" />
            <span>Sample Rejected</span>
          </div>

          <div
            className="flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            onClick={() => alert("Department Receive clicked")}
          >
            <Building2 size={14} className="text-blue-500" />
            <span>Department Receive</span>
          </div>

          <div
            className="flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            onClick={() => alert("Tested clicked")}
          >
            <Microscope size={14} className="text-pink-600" />
            <span>Tested</span>
          </div>

          <div
            className="flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            onClick={() => alert("Approved clicked")}
          >
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Approved</span>
          </div>

          <div
            className="flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            onClick={() => alert("Printed clicked")}
          >
            <Printer size={14} className="text-blue-600" />
            <span>Printed</span>
          </div>

          <div
            className="flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            onClick={() => alert("Hold clicked")}
          >
            <Clock size={14} className="text-amber-500" />
            <span>Hold</span>
          </div>

          <div
            className="flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            onClick={() => alert("Dispatched clicked")}
          >
            <Truck size={14} className="text-emerald-700" />
            <span>Dispatched</span>
          </div>
        </div>
      </div>
    </div>
  );
}
