import InputField from "@/components/customInputField";
import { RotateCcw, Search } from "lucide-react";
import { useState } from "react";

export default function OutsourceSearchBar() {
  const [filters, setFilters] = useState({
    fromDate: "2026-09-28",
    toDate: "2026-09-28",
    sampleType: "All",
    department: "All",
    physician: "All",
    outsourceLab: "All",
    patientIdName: "",
    sampleIdBarcode: "",
    testName: "",
    outsourceStatus: "Pending to Send",
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="card mt-[-8px]">
      {/* Header Bar */}
      <div className="flex items-center gap-2 pb-2 mb-3 text-blue-900 font-bold text-[15px]">
        <Search size={16} className="text-blue-900" />
        <span>Search / Select Samples</span>
      </div>

      {/* Filters Container */}
      <div className="p-3 flex flex-col gap-3">
        {/* Row 1: 6 Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="flex flex-col">
            <InputField label="From Date">
              <input
                type="date"
                name="fromDate"
                value={filters.fromDate}
                onChange={handleChange}
                className="input-field"
              />
            </InputField>
          </div>

          <div className="flex flex-col">
            <InputField label="To Date">
              <input
                type="date"
                name="toDate"
                value={filters.toDate}
                onChange={handleChange}
                className="input-field"
              />
            </InputField>
          </div>

          <div className="flex flex-col">
            <InputField label="Sample Type">
              <select
                name="sampleType"
                value={filters.sampleType}
                onChange={handleChange}
                className="input-field"
              >
                <option value="All">All</option>
                <option value="Serum">Serum</option>
                <option value="Plasma">Plasma</option>
                <option value="Urine">Urine</option>
              </select>
            </InputField>
          </div>

          <div className="flex flex-col">
            <InputField label="Department">
              <select
                name="department"
                value={filters.department}
                onChange={handleChange}
                className="input-field"
              >
                <option value="All">All</option>
                <option value="Hematology">Hematology</option>
                <option value="Biochemistry">Biochemistry</option>
              </select>
            </InputField>
          </div>

          <div className="flex flex-col">
            <InputField label="Physician">
              <select
                name="physician"
                value={filters.physician}
                onChange={handleChange}
                className="input-field"
              >
                <option value="All">All</option>
                <option value="Dr. A. Verma">Dr. A. Verma</option>
                <option value="Dr. R. Sharma">Dr. R. Sharma</option>
              </select>
            </InputField>
          </div>

          <div className="flex flex-col">
            <InputField label="Outsource Lab">
              <select
                name="outsourceLab"
                value={filters.outsourceLab}
                onChange={handleChange}
                className="input-field"
              >
                <option value="All">All</option>
                <option value="MediScan Labs">MediScan Labs</option> &nbsp;
                <option value="Thyrocare">Thyrocare</option>
                <option value="Metropolis">Metropolis</option>
              </select>
            </InputField>
          </div>
        </div>

        {/* Row 2: 4 Inputs + Search & Reset Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 items-center ">
          <div className="flex flex-col">
            <InputField label="Patient ID / Name">
              <div className="relative flex items-center">
                <input
                  type="text"
                  name="patientIdName"
                  value={filters.patientIdName}
                  onChange={handleChange}
                  placeholder="Search patient..."
                  className="input-field"
                />
              </div>
            </InputField>
          </div>

          <div className="flex flex-col">
            <InputField label="Sample ID / Barcode">
              <input
                type="text"
                name="sampleIdBarcode"
                value={filters.sampleIdBarcode}
                onChange={handleChange}
                placeholder="Search sample ID / barcode..."
                className="input-field"
              />
            </InputField>
          </div>

          <div className="flex flex-col">
            <InputField label="Test Name">
              <input
                type="text"
                name="testName"
                value={filters.testName}
                onChange={handleChange}
                placeholder="Search test name..."
                className="input-field"
              />
            </InputField>
          </div>

          <div className="flex flex-col">
            <InputField label="Outsource Status">
              <select
                name="outsourceStatus"
                value={filters.outsourceStatus}
                onChange={handleChange}
                className="input-field"
              >
                <option value="Pending to Send">Pending to Send</option>
                <option value="Sent Today">Sent Today</option>
                <option value="All">All</option>
              </select>
            </InputField>
          </div>

          {/* Action Buttons Container spanning remaining 2 grid columns */}
          <div className="flex items-center gap-2 col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2 h-[38px] mt-5">
            <button
              onClick={() => alert("Search clicked")}
              className="save-btn flex-1 flex items-center justify-center gap-1.5  cursor-pointer"
            >
              <Search size={14} />
              <span>Search</span>
            </button>
            <button
              onClick={() => alert("Reset clicked")}
              className="save-btn flex-1 flex items-center justify-center  cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
