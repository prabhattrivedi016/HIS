import InputField from "@/components/customInputField";
import { File } from "lucide-react";
import { useState } from "react";

export default function SearchBar() {
  const [formData, setFormData] = useState({
    scanInput: "",
    collectionDate: "2026-09-23",
    department: "All",
    sampleType: "All",
    priority: "All",
    location: "All",
    searchList: "",
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddToList = () => {
    if (!formData.scanInput) {
      alert("Please enter or scan a barcode/sample ID first!");
      return;
    }
    alert(`Sample added to list: ${formData.scanInput}`);
    setFormData(prev => ({ ...prev, scanInput: "" }));
  };

  const handleImport = () => {
    alert("Import from File clicked");
  };

  const handleClearList = () => {
    alert("Clear List clicked");
  };

  return (
    <div className="w-full lg:flex justify-between bg-[#f8fafc]   space-y-1 gap-1 mt-2">
      {/* =====================================================
          DIV 1: SCAN BARCODE / SAMPLE ID + ADD TO LIST BUTTON
         ===================================================== */}
      <div className="bg-blue-50 rounded-xl p-3.5 border border-gray-200 shadow-2xs ">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <InputField label="Sample ID">
            {/* <Barcode size={18} className="absolute left-3 text-blue-600 pointer-events-none" /> */}
            <input
              type="text"
              name="scanInput"
              value={formData.scanInput}
              onChange={handleChange}
              placeholder="Scan or enter barcode and press enter"
              className="input-field max-w-50"
            />
          </InputField>
          <button onClick={handleAddToList} className="save-btn mt-5">
            <div className="flex">
              {/* <Plus size={16} strokeWidth={2.5} /> */}
              <span className="text-sm">Add</span>
            </div>
          </button>
        </div>
      </div>

      {/* =====================================================
          DIV 2: COLLECTION DATE, DEPARTMENT, SAMPLE TYPE, PRIORITY, LOCATION
         ===================================================== */}
      <div className="bg-blue-50 rounded-xl p-3.5 border border-gray-200 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 items-end">
          {/* Collection Date */}
          <div className="flex flex-col">
            <InputField label="Collection Date">
              <input
                type="date"
                name="collectionDate"
                value={formData.collectionDate}
                onChange={handleChange}
                className="input-field"
              />
            </InputField>
          </div>

          {/* Department */}
          <div className="flex flex-col">
            <InputField label="Department">
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="input-field"
              >
                <option value="All">All</option>
                <option value="Hematology">Hematology</option>
                <option value="Biochemistry">Biochemistry</option>
                <option value="Microbiology">Microbiology</option>
                <option value="Pathology">Pathology</option>
              </select>
            </InputField>
          </div>

          {/* Sample Type */}
          <div className="flex flex-col">
            <InputField label="Sample Type">
              <select
                name="sampleType"
                value={formData.sampleType}
                onChange={handleChange}
                className="input-field"
              >
                <option value="All">All</option>
                <option value="Blood">Blood</option>
                <option value="Serum">Serum</option>
                <option value="Urine">Urine</option>
                <option value="Stool">Stool</option>
              </select>
            </InputField>
          </div>

          {/* Priority */}
          <div className="flex flex-col">
            <InputField label="Priority">
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="input-field"
              >
                <option value="All">All</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </InputField>
          </div>

          {/* Location */}
          <div className="flex flex-col">
            <InputField label="Location">
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="input-field"
              >
                <option value="All">All</option>
                <option value="R1-B1-P3">R1-B1-P3</option>
                <option value="R1-B2-P1">R1-B2-P1</option>
                <option value="R2-B1-P5">R2-B1-P5</option>
              </select>
            </InputField>
          </div>
        </div>
      </div>

      {/* =====================================================
          DIV 3: SAMPLE LIST CARD & ACTIONS HEADER
         ===================================================== */}
      <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between  lg:ml-2 ">
        <div className="flex  gap-2.5 min-w-0 ">
          <div className="w-[58px] h-[58px] rounded-md bg-[#e1f2ff] flex items-center justify-center shrink-0">
            <File size={30} strokeWidth={2.2} className="text-[#0875d1]" />
          </div>

          <div className="min-w-0 flex flex-col">
            <div className="text-[15px] font-bold text-gray-500 truncate sm:ml-4 lg:ml-6">
              Total Samples
            </div>
            <div className="text-[16px] font-extrabold text-[#123b70] mt-0.5 truncate sm:ml-4 lg:ml-6">
              1,248
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
