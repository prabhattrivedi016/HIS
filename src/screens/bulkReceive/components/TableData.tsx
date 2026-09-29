import { ChevronDown, Search, Trash2, Upload } from "lucide-react";
import { useState } from "react";

export default function TableData() {
  const [searchQuery, setSearchQuery] = useState("");

  // Dynamic sample data with state so dropdowns/pickers are fully functional
  const [sampleData, setSampleData] = useState([
    {
      id: 1,
      sampleId: "S-260923-001",
      uhid: "UHID0001",
      patientName: "Rahul Sharma",
      ageSex: "34 / M",
      sampleType: "Blood",
      tests: "CBC, LFT (+2)",
      department: "Hematology",
      priority: "Normal",
      collectionTime: "2026-09-23T09:15",
      status: "To Receive",
    },
    {
      id: 2,
      sampleId: "S-260923-002",
      uhid: "UHID0002",
      patientName: "Priya Singh",
      ageSex: "28 / F",
      sampleType: "Serum",
      tests: "LFT, KFT (+1)",
      department: "Biochemistry",
      priority: "High",
      collectionTime: "2026-09-23T09:20",
      status: "To Receive",
    },
    {
      id: 3,
      sampleId: "S-260923-003",
      uhid: "UHID0003",
      patientName: "Amit Kumar",
      ageSex: "45 / M",
      sampleType: "Urine",
      tests: "R/M, C/S (+1)",
      department: "Microbiology",
      priority: "Normal",
      collectionTime: "2026-09-23T09:45",
      status: "To Receive",
    },
    {
      id: 4,
      sampleId: "S-260923-004",
      uhid: "UHID0004",
      patientName: "Neha Tiwari",
      ageSex: "32 / F",
      sampleType: "Blood",
      tests: "Lipid Profile (+1)",
      department: "Biochemistry",
      priority: "Normal",
      collectionTime: "2026-09-23T10:10",
      status: "To Receive",
    },
    {
      id: 5,
      sampleId: "S-260923-005",
      uhid: "UHID0005",
      patientName: "Vikash Yadav",
      ageSex: "40 / M",
      sampleType: "Stool",
      tests: "Stool R/M (+1)",
      department: "Microbiology",
      priority: "Normal",
      collectionTime: "2026-09-23T10:30",
      status: "To Receive",
    },
    {
      id: 6,
      sampleId: "S-260923-006",
      uhid: "UHID0006",
      patientName: "Sneha Patel",
      ageSex: "36 / F",
      sampleType: "Serum",
      tests: "TFT (+3)",
      department: "Biochemistry",
      priority: "High",
      collectionTime: "2026-09-23T10:45",
      status: "To Receive",
    },
    {
      id: 7,
      sampleId: "S-260923-007",
      uhid: "UHID0007",
      patientName: "Manoj Gupta",
      ageSex: "50 / M",
      sampleType: "Blood",
      tests: "Blood Sugar (+1)",
      department: "Biochemistry",
      priority: "Normal",
      collectionTime: "2026-09-23T11:05",
      status: "To Receive",
    },
    {
      id: 8,
      sampleId: "S-260923-008",
      uhid: "UHID0008",
      patientName: "Kavita Singh",
      ageSex: "29 / F",
      sampleType: "Serum",
      tests: "Vitamin D (+1)",
      department: "Biochemistry",
      priority: "Normal",
      collectionTime: "2026-09-23T11:20",
      status: "To Receive",
    },
    {
      id: 9,
      sampleId: "S-260923-009",
      uhid: "UHID0009",
      patientName: "Suresh P.",
      ageSex: "42 / M",
      sampleType: "Sputum",
      tests: "AFB",
      department: "Pathology",
      priority: "Normal",
      collectionTime: "2026-09-23T11:35",
      status: "To Receive",
    },
    {
      id: 10,
      sampleId: "S-260923-010",
      uhid: "UHID0010",
      patientName: "Anjali D.",
      ageSex: "26 / F",
      sampleType: "Serum",
      tests: "Vitamin D",
      department: "Biochemistry",
      priority: "Normal",
      collectionTime: "2026-09-23T11:50",
      status: "To Receive",
    },
    {
      id: 11,
      sampleId: "S-260923-011",
      uhid: "UHID0011",
      patientName: "Rajesh Verma",
      ageSex: "38 / M",
      sampleType: "Blood",
      tests: "CBC",
      department: "Hematology",
      priority: "Normal",
      collectionTime: "2026-09-23T12:05",
      status: "To Receive",
    },
    {
      id: 12,
      sampleId: "S-260923-012",
      uhid: "UHID0012",
      patientName: "Sunita Roy",
      ageSex: "31 / F",
      sampleType: "Urine",
      tests: "Routine",
      department: "Microbiology",
      priority: "Normal",
      collectionTime: "2026-09-23T12:20",
      status: "To Receive",
    },
  ]);

  const handleFieldChange = (id, field, value) => {
    setSampleData(prev => prev.map(row => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const handleDeleteClick = sampleId => {
    alert(`Delete sample clicked for: ${sampleId}`);
  };

  const handleImport = () => {
    alert("Import from File clicked");
  };

  const handleClearList = () => {
    alert("Clear List clicked");
  };

  return (
    <div className="card mt-2">
      {/* ================= SINGLE ROW HEADER ACTION BAR ================= */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-3">
        {/* Left Tabs / Counts */}
        <div className="flex items-center gap-4 text-xs font-bold overflow-x-auto w-full md:w-auto">
          <button className="text-blue-600 border-b-2 border-blue-600 pb-1 cursor-pointer whitespace-nowrap">
            Sample List (12)
          </button>
          <button className="text-gray-500 hover:text-gray-800 pb-1 cursor-pointer whitespace-nowrap">
            Invalid/Not Found (0)
          </button>
          <button className="text-gray-500 hover:text-gray-800 pb-1 cursor-pointer whitespace-nowrap">
            Duplicates (0)
          </button>
        </div>

        {/* Right Action Buttons & Search in Single Row */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          <button
            onClick={handleImport}
            className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
          >
            <Upload size={14} className="text-blue-600" />
            <span>Import from File</span>
          </button>

          <button
            onClick={handleClearList}
            className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-rose-600 border border-rose-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
          >
            <Trash2 size={14} />
            <span>Clear List</span>
          </button>

          <div className="relative flex items-center">
            <Search size={14} className="absolute left-2.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search in list..."
              className="bg-gray-50 border border-gray-200 rounded-lg text-xs pl-8 pr-3 py-1.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 w-[160px] sm:w-[180px]"
            />
          </div>
        </div>
      </div>

      {/* ================= VERTICAL & HORIZONTAL SCROLLABLE TABLE CONTAINER ================= */}
      <div className="max-h-[460px] overflow-y-auto overflow-x-auto border border-gray-200 ">
        <table className="w-full min-w-[1200px] border-collapse text-left text-[11px]">
          <thead className="sticky top-0 bg-blue-50 text-gray-600 font-bold uppercase text-[10px] tracking-wider z-10">
            <tr>
              <th className="border border-gray-300 py-2.5 px-2 text-center w-[3%]">
                <input type="checkbox" defaultChecked className="cursor-pointer" />
              </th>
              <th className="border border-gray-300 py-2.5 px-2 text-center w-[4%]">#</th>
              <th className="border border-gray-300 py-2.5 px-3 w-[10%]">Sample ID</th>
              <th className="border border-gray-300 py-2.5 px-2 text-center w-[3%]">Barcode</th>
              <th className="border border-gray-300 py-2.5 px-3 w-[8%]">UHID</th>
              <th className="border border-gray-300 py-2.5 px-3 w-[10%]">Patient Name</th>
              <th className="border border-gray-300 py-2.5 px-3 w-[4%]">Age/Sex</th>
              <th className="border border-gray-300 py-2.5 px-3 w-[9%]">Sample Type</th>
              <th className="border border-gray-300 py-2.5 px-3 w-[9%]">Tests</th>
              <th className="border border-gray-300 py-2.5 px-3 w-[10%]">Department</th>
              <th className="border border-gray-300 py-2.5 px-3 w-[8%]">Priority</th>
              <th className="border border-gray-300 py-2.5 px-3 w-[12%]">Collection Time</th>
              <th className="border border-gray-300 py-2.5 px-3 text-center w-[7%]">Status</th>
              <th className="border border-gray-300 py-2.5 px-2 text-center w-[5%]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 font-semibold text-gray-700 bg-white">
            {sampleData.map(row => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                <td className="border border-gray-300 py-2 px-2 text-center">
                  <input type="checkbox" defaultChecked className="cursor-pointer" />
                </td>
                <td className="border border-gray-300 py-2 px-2 text-center font-bold text-gray-900">
                  {row.id}
                </td>
                <td className="border border-gray-300 py-2 px-3 text-blue-600 font-bold">
                  {row.sampleId}
                </td>
                <td className="border border-gray-300 py-2 px-2 text-center">
                  <div className="flex items-center justify-center space-x-[1px] h-5 text-gray-800">
                    <div className="w-[2px] h-full bg-black"></div>
                    <div className="w-[1px] h-full bg-black"></div>
                    <div className="w-[3px] h-full bg-black"></div>
                    <div className="w-[1px] h-full bg-black"></div>
                    <div className="w-[2px] h-full bg-black"></div>
                    <div className="w-[1px] h-full bg-black"></div>
                  </div>
                </td>
                <td className="border border-gray-300 py-2 px-3 text-gray-800">{row.uhid}</td>
                <td className="border border-gray-300 py-2 px-3 text-gray-900 font-bold">
                  {row.patientName}
                </td>
                <td className="border border-gray-300 py-2 px-3 text-gray-700">{row.ageSex}</td>
                {/* Dynamic Sample Type Dropdown */}
                <td className="border border-gray-300 py-2 px-2">
                  <div className="relative">
                    <select
                      value={row.sampleType}
                      onChange={e => handleFieldChange(row.id, "sampleType", e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs text-gray-800 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                    >
                      <option value="Blood">Blood</option>
                      <option value="Serum">Serum</option>
                      <option value="Urine">Urine</option>
                      <option value="Stool">Stool</option>
                      <option value="Sputum">Sputum</option>
                    </select>
                    <ChevronDown
                      size={12}
                      className="absolute right-2 top-2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </td>
                <td className="border border-gray-300 py-2 px-3 text-gray-800 font-medium">
                  {row.tests}
                </td>
                {/* Dynamic Department Dropdown */}
                <td className="border border-gray-300 py-2 px-2">
                  <div className="relative">
                    <select
                      value={row.department}
                      onChange={e => handleFieldChange(row.id, "department", e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs text-gray-800 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                    >
                      <option value="Hematology">Hematology</option>
                      <option value="Biochemistry">Biochemistry</option>
                      <option value="Microbiology">Microbiology</option>
                      <option value="Pathology">Pathology</option>
                    </select>
                    <ChevronDown
                      size={12}
                      className="absolute right-2 top-2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </td>
                {/* Dynamic Priority Dropdown */}
                <td className="border border-gray-300 py-2 px-2">
                  <div className="relative">
                    <select
                      value={row.priority}
                      onChange={e => handleFieldChange(row.id, "priority", e.target.value)}
                      className={`w-full border rounded px-2 py-1 text-[11px] font-bold focus:outline-none appearance-none cursor-pointer ${
                        row.priority === "High"
                          ? "text-rose-700 bg-rose-50 border-rose-200"
                          : "text-emerald-700 bg-emerald-50 border-emerald-200"
                      }`}
                    >
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                    <ChevronDown
                      size={12}
                      className="absolute right-2 top-2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </td>
                {/* Dynamic Collection Date & Time Picker */}
                <td className="border border-gray-300 py-2 px-2">
                  <input
                    type="datetime-local"
                    value={row.collectionTime}
                    onChange={e => handleFieldChange(row.id, "collectionTime", e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-[10px] text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer"
                  />
                </td>
                <td className="border border-gray-300 py-2 px-3 text-center">
                  <span className="inline-block px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-blue-700 bg-blue-100">
                    {row.status}
                  </span>
                </td>
                <td className="border border-gray-300 py-2 px-2 text-center">
                  <button
                    onClick={() => handleDeleteClick(row.sampleId)}
                    className="text-gray-400 hover:text-rose-600 cursor-pointer p-1 transition-colors"
                    title="Delete Sample"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
