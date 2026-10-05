import InputField from "@/components/customInputField";
import { Printer, RotateCcw, Search, Share2, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

export default function HistorySearchBar() {
  const [activeTab, setActiveTab] = useState("Advanced Search");
  const [filters, setFilters] = useState({
    uhid: "",
    ipdNo: "",
    investigationName: "",
    barcode: "",
    labNo: "",
    fromDate: "2026-09-29",
    patientName: "",
    department: "All",
    toDate: "2026-09-29",
    type: "All",
    subDepartment: "All",
    outsource: "All",
  });

  const [statuses, setStatuses] = useState({
    urgent: false,
    stat: false,
    routine: false,
    collectionPending: false,
    sampleCollected: false,
    inLaboratory: false,
    approved: false,
    dispatched: false,
    outsourcePending: false,
    outsourceDispatched: false,
    outsourceReceived: false,
    reportPending: false,
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = key => {
    setStatuses(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="card mt-2">
      {/* Main Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Side: Tabs + Search Inputs */}
        <div
          className={`flex flex-col gap-3 ${activeTab === "Advanced Search" ? "lg:col-span-9 lg:border-r lg:border-gray-300 lg:pr-4 lg:shadow-[4px_0_2px_-1px_rgba(0,0,0,0.08)]" : "lg:col-span-12"}`}
        >
          {/* Top Tabs: Quick Search & Advanced Search */}
          <div className="flex items-center justify-between pb-2 border-b border-blue-200 bg-blue-50 px-2 py-2.5 rounded-t-lg">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab("Quick Search")}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "Quick Search"
                    ? "bg-blue-900 text-white shadow-xs"
                    : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200"
                }`}
              >
                <Search size={13} />
                <span>Quick Search</span>
              </button>
              <button
                onClick={() => setActiveTab("Advanced Search")}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "Advanced Search"
                    ? "bg-blue-900 text-white shadow-xs"
                    : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200"
                }`}
              >
                <SlidersHorizontal size={13} />
                <span>Advanced Search</span>
              </button>
            </div>
          </div>

          {/* Search Inputs Container - Visible ONLY when Advanced Search is active */}
          {activeTab === "Advanced Search" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Row 1 */}
              <div className="flex flex-col">
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
              </div>

              <div className="flex flex-col">
                <InputField label="Barcode">
                  <input
                    type="text"
                    name="barcode"
                    value={filters.barcode}
                    onChange={handleChange}
                    placeholder="Scan / Enter Barcode No."
                    className="input-field"
                  />
                </InputField>
              </div>

              <div className="flex flex-col">
                <InputField label="Patient Name">
                  <input
                    type="text"
                    name="patientName"
                    value={filters.patientName}
                    onChange={handleChange}
                    placeholder="Enter Patient Name"
                    className="input-field"
                  />
                </InputField>
              </div>

              <div className="flex flex-col">
                <InputField label="Type">
                  <select
                    name="type"
                    value={filters.type}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="All">All</option>
                    <option value="OPD">OPD</option>
                    <option value="IPD">IPD</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </InputField>
              </div>

              {/* Row 2 */}
              <div className="flex flex-col">
                <InputField label="IPD No">
                  <input
                    type="text"
                    name="ipdNo"
                    value={filters.ipdNo}
                    onChange={handleChange}
                    placeholder="Enter IPD No"
                    className="input-field"
                  />
                </InputField>
              </div>

              <div className="flex flex-col">
                <InputField label="Lab No">
                  <input
                    type="text"
                    name="labNo"
                    value={filters.labNo}
                    onChange={handleChange}
                    placeholder="Enter Lab No"
                    className="input-field"
                  />
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
                    <option value="All">--All--</option>
                    <option value="Hematology">Hematology</option>
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Pathology">Pathology</option>
                  </select>
                </InputField>
              </div>

              <div className="flex flex-col">
                <InputField label="Sub Department">
                  <select
                    name="subDepartment"
                    value={filters.subDepartment}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="All">--All--</option>
                    <option value="Routine Hematology">Routine Hematology</option>
                    <option value="Clinical Pathology">Clinical Pathology</option>
                  </select>
                </InputField>
              </div>

              {/* Row 3 */}
              <div className="flex flex-col">
                <InputField label="Investigation Name">
                  <input
                    type="text"
                    name="investigationName"
                    value={filters.investigationName}
                    onChange={handleChange}
                    placeholder="Enter Investigation Name"
                    className="input-field"
                  />
                </InputField>
              </div>

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
                <InputField label="Outsource">
                  <select
                    name="outsource"
                    value={filters.outsource}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="All">All</option>
                    <option value="In House">In House</option>
                    <option value="Metropolis">Metropolis</option>
                  </select>
                </InputField>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Sample Status Section - Visible ONLY when Advanced Search is active */}
        {activeTab === "Advanced Search" && (
          <div className="lg:col-span-3 flex flex-col">
            <div className="flex items-center pb-2 mb-3 border-b border-blue-200 bg-blue-50 px-2 py-3.5 rounded-t-lg">
              <div className="text-[15px] font-bold text-blue-900">Sample Status</div>
            </div>

            <div className="bg-white p-3 flex flex-col justify-between shadow-2xs flex-1">
              <div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-5 text-[13px] font-semibold text-gray-700">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={statuses.urgent}
                      onChange={() => handleStatusChange("urgent")}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer w-3.5 h-3.5"
                    />
                    <span className="text-red-600">Urgent</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={statuses.approved}
                      onChange={() => handleStatusChange("approved")}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer w-3.5 h-3.5"
                    />
                    <span className="text-emerald-700">Approved</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={statuses.stat}
                      onChange={() => handleStatusChange("stat")}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer w-3.5 h-3.5"
                    />
                    <span className="text-orange-500">STAT</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={statuses.dispatched}
                      onChange={() => handleStatusChange("dispatched")}
                      className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer w-3.5 h-3.5"
                    />
                    <span className="text-green-500">Dispatched</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={statuses.routine}
                      onChange={() => handleStatusChange("routine")}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-3.5 h-3.5"
                    />
                    <span className="text-blue-700">Routine</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={statuses.outsourcePending}
                      onChange={() => handleStatusChange("outsourcePending")}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer w-3.5 h-3.5"
                    />
                    <span className="text-purple-700">Outsource Pending</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={statuses.collectionPending}
                      onChange={() => handleStatusChange("collectionPending")}
                      className="rounded border-gray-300 text-gray-600 focus:ring-gray-500 cursor-pointer w-3.5 h-3.5"
                    />
                    <span className="text-pink-500">Collection Pending</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={statuses.outsourceDispatched}
                      onChange={() => handleStatusChange("outsourceDispatched")}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer w-3.5 h-3.5"
                    />
                    <span className="text-purple-800">Outsource Dispatched</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={statuses.sampleCollected}
                      onChange={() => handleStatusChange("sampleCollected")}
                      className="rounded border-gray-300 text-gray-600 focus:ring-gray-500 cursor-pointer w-3.5 h-3.5"
                    />
                    <span className="text-yellow-600">Sample Collected</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={statuses.outsourceReceived}
                      onChange={() => handleStatusChange("outsourceReceived")}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer w-3.5 h-3.5"
                    />
                    <span className="text-purple-600">Outsource Received</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={statuses.inLaboratory}
                      onChange={() => handleStatusChange("inLaboratory")}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-3.5 h-3.5"
                    />
                    <span className="text-blue-700">In Laboratory</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={statuses.reportPending}
                      onChange={() => handleStatusChange("reportPending")}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer w-3.5 h-3.5"
                    />
                    <span className="text-gray-700">Report Pending</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Filter Options & Action Buttons Bar - Visible ONLY when Advanced Search is active */}
      {activeTab === "Advanced Search" && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-3 border-t border-gray-200 text-xs font-semibold text-gray-700">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>More Filters</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Show Only My Department</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Include Cancelled</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Show Remark</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Group By Patient</span>
            </label>
            <div className="relative">
              <select className="input-field">
                <option value="All Sources">All Sources</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert("Cleared filters")}
              className="save-btn flex items-center justify-center gap-1.5 w-[90px] relative"
            >
              <RotateCcw size={13} />
              <span>Clear</span>
            </button>
            <button
              onClick={() => alert("Print initiated")}
              className="save-btn flex items-center justify-center gap-1.5 w-[90px] relative"
            >
              <Printer size={13} />
              <span>Print</span>
            </button>
            <button
              onClick={() => alert("Export initiated")}
              className="save-btn flex items-center justify-center gap-1.5 w-[90px] relative"
            >
              <Share2 size={13} />
              <span>Export</span>
            </button>
            <button
              onClick={() => alert("Search initiated")}
              className="save-btn flex items-center justify-center gap-1.5 w-[90px] relative"
            >
              <Search size={13} />
              <span>Search</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
