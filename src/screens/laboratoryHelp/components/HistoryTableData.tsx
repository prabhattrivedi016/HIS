import {
  AlertCircle,
  Bell,
  Calendar,
  CheckSquare,
  Clock,
  FileText,
  Folder,
  ListOrdered,
  Printer,
  RotateCw,
  Search,
  Send,
  Settings,
  Truck,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HistoryTableData() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All Requests");
  const [searchQuery, setSearchQuery] = useState("");

  const tabsData = [
    { name: "All Requests", icon: FileText, count: 24 },
    { name: "Today Sample", icon: Calendar, count: 18 },
    { name: "Outsource Samples", icon: Truck, count: 4 },
    { name: "Collection Pending", icon: CheckSquare, count: 12 },
    { name: "Department Received", icon: Clock, count: 8 },
    { name: "Sample Collected", icon: CheckSquare, count: 18 },
    { name: "In Laboratory", icon: AlertCircle, count: 92 },
    { name: "Report Pending", icon: Clock, count: 38 },
    { name: "Approved / Dispatched", icon: Send, count: 342 },
    { name: "Re-Print / Re-send", icon: Printer, count: 15 },
    { name: "Cancelled / Rejected", icon: XCircle, count: 3 },
  ];

  const tableData = [
    {
      id: 1,
      barcode: "34501",
      labNo: "34501",
      billDate: "29-Sep-2026 10:15 AM",
      type: "OPD",
      uhid: "CR/0084005",
      ipdNo: "-",
      wardBed: "-",
      patientName: "MR. NANDESHWAR SINGH",
      ageGender: "57Y 8M / M",
      investigation: "CBC (COMPLETE BLOOD COUNT)",
      sampleStatus: "Sample Collected",
      sampleStatusColor: "bg-amber-100 text-amber-800",
      outsource: "In House",
      outsourceColor: "bg-emerald-50 text-emerald-700",
      tat: "1 Hrs",
      dispatch: "-",
      report: "-",
    },
    {
      id: 2,
      barcode: "34501",
      labNo: "34501",
      billDate: "29-Sep-2026 10:20 AM",
      type: "OPD",
      uhid: "CR/0084005",
      ipdNo: "-",
      wardBed: "-",
      patientName: "MR. NANDESHWAR SINGH",
      ageGender: "57Y 8M / M",
      investigation: "KFT (SERUM)",
      sampleStatus: "In Laboratory",
      sampleStatusColor: "bg-blue-100 text-blue-800",
      outsource: "In House",
      outsourceColor: "bg-emerald-50 text-emerald-700",
      tat: "2 Hrs",
      dispatch: "-",
      report: "-",
    },
    {
      id: 3,
      barcode: "34501",
      labNo: "34501",
      billDate: "29-Sep-2026 10:20 AM",
      type: "OPD",
      uhid: "CR/0084005",
      ipdNo: "-",
      wardBed: "-",
      patientName: "MR. NANDESHWAR SINGH",
      ageGender: "57Y 8M / M",
      investigation: "LFT (SERUM)",
      sampleStatus: "In Laboratory",
      sampleStatusColor: "bg-blue-100 text-blue-800",
      outsource: "In House",
      outsourceColor: "bg-emerald-50 text-emerald-700",
      tat: "2 Hrs",
      dispatch: "-",
      report: "-",
    },
    {
      id: 4,
      barcode: "34501",
      labNo: "34501",
      billDate: "29-Sep-2026 10:25 AM",
      type: "OPD",
      uhid: "CR/0084005",
      ipdNo: "-",
      wardBed: "-",
      patientName: "MR. NANDESHWAR SINGH",
      ageGender: "57Y 8M / M",
      investigation: "ESR (ERYTHROCYTE SEDIMENTATION RATE)",
      sampleStatus: "Report Pending",
      sampleStatusColor: "bg-gray-100 text-gray-700",
      outsource: "In House",
      outsourceColor: "bg-emerald-50 text-emerald-700",
      tat: "4 Hrs",
      dispatch: "-",
      report: "-",
    },
    {
      id: 5,
      barcode: "34502",
      labNo: "34502",
      billDate: "29-Sep-2026 11:10 AM",
      type: "IPD",
      uhid: "CR/0084360",
      ipdNo: "20909",
      wardBed: "NICU/19",
      patientName: "B/O USHA KUMARI",
      ageGender: "0Y 0M / M",
      investigation: "BILIRUBIN - TOTAL (SERUM)",
      sampleStatus: "Dispatched",
      sampleStatusColor: "bg-emerald-100 text-emerald-800",
      outsource: "In House",
      outsourceColor: "bg-emerald-50 text-emerald-700",
      tat: "3 Hrs",
      dispatch: "29-Sep 01:15 PM",
      report: "-",
    },
    {
      id: 6,
      barcode: "34503",
      labNo: "34503",
      billDate: "29-Sep-2026 11:30 AM",
      type: "OPD",
      uhid: "CR/0084318",
      ipdNo: "-",
      wardBed: "-",
      patientName: "MR. RAJGRIHI PANDEY",
      ageGender: "70Y 8M / M",
      investigation: "CBC (COMPLETE BLOOD COUNT)",
      sampleStatus: "Outsource Pending",
      sampleStatusColor: "bg-purple-100 text-purple-700",
      outsource: "Metropolis",
      outsourceColor: "bg-purple-100 text-purple-700",
      tat: "24 Hrs",
      dispatch: "-",
      report: "-",
    },
    {
      id: 7,
      barcode: "34503",
      labNo: "34503",
      billDate: "29-Sep-2026 11:20 AM",
      type: "OPD",
      uhid: "CR/0084318",
      ipdNo: "-",
      wardBed: "-",
      patientName: "MR. RAJGRIHI PANDEY",
      ageGender: "70Y 8M / M",
      investigation: "KFT (SERUM)",
      sampleStatus: "Outsource Dispatched",
      sampleStatusColor: "bg-purple-100 text-purple-700",
      outsource: "Metropolis",
      outsourceColor: "bg-purple-100 text-purple-700",
      tat: "24 Hrs",
      dispatch: "29-Sep 02:10 PM",
      report: "-",
    },
    {
      id: 8,
      barcode: "34504",
      labNo: "34504",
      billDate: "29-Sep-2026 11:20 AM",
      type: "OPD",
      uhid: "CR/0084365",
      ipdNo: "-",
      wardBed: "-",
      patientName: "MISS. ANUSHKA",
      ageGender: "4Y 1M / F",
      investigation: "ARTERIAL BLOOD GAS (ABG)",
      sampleStatus: "Critical",
      sampleStatusColor: "bg-rose-100 text-rose-700",
      outsource: "In House",
      outsourceColor: "bg-emerald-50 text-emerald-700",
      tat: "30 Mins",
      dispatch: "-",
      report: "-",
    },
    {
      id: 9,
      barcode: "34505",
      labNo: "34505",
      billDate: "29-Sep-2026 11:30 AM",
      type: "OPD",
      uhid: "CR/0084318",
      ipdNo: "-",
      wardBed: "-",
      patientName: "MR. RAM AKWAL SHARMA",
      ageGender: "72Y 8M / M",
      investigation: "CBC (COMPLETE BLOOD COUNT)",
      sampleStatus: "Approved",
      sampleStatusColor: "bg-emerald-100 text-emerald-800",
      outsource: "In House",
      outsourceColor: "bg-emerald-50 text-emerald-700",
      tat: "1 Hrs",
      dispatch: "-",
      report: "29-Sep 12:30 PM",
    },
  ];

  const handleActionClick = (actionType, barcode) => {
    alert(`${actionType} clicked for barcode: ${barcode}`);
  };

  return (
    <div className="card mt-3">
      {/* ================= TOP 11 TABS WITH RESPECTIVE ICONS ================= */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-200 overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
        {tabsData.map(tab => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.name
                  ? "bg-blue-900 text-white shadow-xs"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <IconComponent size={14} />
              <span>
                {tab.name} ({tab.count})
              </span>
            </button>
          );
        })}
      </div>

      {/* ================= SUB-HEADER: INVESTIGATION REQUEST LIST & CONTROLS ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 pb-2">
        <div className="flex items-center gap-2 text-blue-900 font-extrabold text-sm">
          <ListOrdered size={18} className="text-blue-600" />
          <span>Investigation Request List</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search in list..."
              className="bg-white border border-gray-200 rounded-lg text-xs pl-8 pr-3 py-1.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 w-full sm:w-[220px]"
            />
          </div>

          <button
            onClick={() => alert("Reloaded")}
            className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 cursor-pointer"
            title="Reload"
          >
            <RotateCw size={14} />
          </button>
          <button
            onClick={() => alert("File opened")}
            className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 cursor-pointer"
            title="Files"
          >
            <Folder size={14} />
          </button>
          <button
            onClick={() => alert("Settings opened")}
            className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 cursor-pointer"
            title="Settings"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

      {/* ================= TABLE CONTAINER (18 COLUMNS) ================= */}
      <div className="overflow-x-auto mt-2 overflow-y-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
        <table className="w-full min-w-[2000px] border-collapse text-left text-[11px]">
          <thead>
            <tr className="bg-blue-50 text-gray-600 font-bold uppercase text-[10px] tracking-wider">
              <th className="border border-gray-300 py-2.5 px-2 text-center w-[3%]">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 cursor-pointer w-3.5 h-3.5"
                />
              </th>
              <th className="border border-gray-300 py-2.5 px-2 text-center w-[3%]">S.No.</th>
              <th className="border border-gray-300 py-2.5 px-3 w-[5%]">Barcode</th>
              <th className="border border-gray-300 py-2.5 px-3 w-[4%]">Lab No</th>
              <th className="border border-gray-300 py-2.5 px-3 w-[10%]">Bill Date</th>
              <th className="border border-gray-300 py-2.5 px-3 text-center w-[5%]">Type</th>
              <th className="border border-gray-300 py-2.5 px-3 w-[8%]">UHID</th>
              <th className="border border-gray-300 py-2.5 px-3 w-[5%]">IPD No.</th>
              <th className="border border-gray-300 py-2.5 px-3 w-[7%]">Ward/Bed No.</th>
              <th className="border border-gray-300 py-2.5 px-3 w-[12%]">Patient Name</th>
              <th className="border border-gray-300 py-2.5 px-3 text-center w-[7%]">Age/Gender</th>
              <th className="border border-gray-300 py-2.5 px-3 w-[14%]">Investigation</th>
              <th className="border border-gray-300 py-2.5 px-3 text-center w-[7%]">
                Sample Status
              </th>
              <th className="border border-gray-300 py-2.5 px-3 text-center w-[7%]">Outsource</th>
              <th className="border border-gray-300 py-2.5 px-3 text-center w-[8%]">TAT</th>
              <th className="border border-gray-300 py-2.5 px-3 w-[10%]">Dispatch</th>
              <th className="border border-gray-300 py-2.5 px-3 w-[8%]">Report</th>
              <th className="border border-gray-300 py-2.5 px-2 text-center w-[8%]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
            {tableData.map(row => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                <td className="border border-gray-300 py-2.5 px-2 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 cursor-pointer w-3.5 h-3.5"
                  />
                </td>
                <td className="border border-gray-300 py-2.5 px-2 text-center font-bold text-gray-900">
                  {row.id}
                </td>
                <td className="border border-gray-300 py-2.5 px-3 text-blue-600 font-bold">
                  {row.barcode}
                </td>
                <td className="border border-gray-300 py-2.5 px-3 text-gray-800">{row.labNo}</td>
                <td className="border border-gray-300 py-2.5 px-3 text-gray-600 text-[10px]">
                  {row.billDate}
                </td>
                <td className="border border-gray-300 py-2.5 px-3 text-center">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">
                    {row.type}
                  </span>
                </td>
                <td className="border border-gray-300 py-2.5 px-3 text-gray-800">{row.uhid}</td>
                <td className="border border-gray-300 py-2.5 px-3 text-gray-600">{row.ipdNo}</td>
                <td className="border border-gray-300 py-2.5 px-3 text-gray-600">{row.wardBed}</td>
                <td className="border border-gray-300 py-2.5 px-3 text-gray-900 font-bold">
                  {row.patientName}
                </td>
                <td className="border border-gray-300 py-2.5 px-3 text-center text-gray-600">
                  {row.ageGender}
                </td>
                <td className="border border-gray-300 py-2.5 px-3 text-gray-900">
                  {row.investigation}
                </td>

                {/* Sample Status Highlighted Badge */}
                <td className="border border-gray-300 py-2.5 px-3 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold whitespace-nowrap ${row.sampleStatusColor}`}
                  >
                    {row.sampleStatus}
                  </span>
                </td>

                {/* Outsource Badge */}
                <td className="border border-gray-300 py-2.5 px-3 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${row.outsourceColor}`}
                  >
                    {row.outsource}
                  </span>
                </td>

                <td className="border border-gray-300 py-2.5 px-3 text-center text-gray-700">
                  {row.tat}
                </td>
                <td className="border border-gray-300 py-2.5 px-3 text-gray-600 text-[10px]">
                  {row.dispatch}
                </td>
                <td className="border border-gray-300 py-2.5 px-3 text-gray-600 text-[10px]">
                  {row.report}
                </td>

                {/* Action Column with Icons matching image */}
                <td className="border border-gray-300 py-2.5 px-2 text-center">
                  <div className="flex items-center justify-center space-x-1.5">
                    <button
                      onClick={() => handleActionClick("Search", row.barcode)}
                      className="text-blue-600 hover:text-blue-800 cursor-pointer p-0.5 transition-colors"
                      title="Search"
                    >
                      <Printer size={13} />
                    </button>
                    <button
                      onClick={() => handleActionClick("Search", row.barcode)}
                      className="text-blue-600 hover:text-blue-800 cursor-pointer p-0.5 transition-colors"
                      title="Search"
                    >
                      <Search size={13} />
                    </button>
                    <button
                      onClick={() => handleActionClick("File", row.barcode)}
                      className="text-blue-600 hover:text-blue-800 cursor-pointer p-0.5 transition-colors"
                      title="Files"
                    >
                      <Folder size={13} />
                    </button>
                    <button
                      onClick={() => handleActionClick("Alert", row.barcode)}
                      className="text-rose-600 hover:text-rose-800 cursor-pointer p-0.5 transition-colors"
                      title="Alert"
                    >
                      <Bell size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= BOTTOM TOOLBAR & PAGINATION (AS SHOWN IN IMAGE) ================= */}
      <div className="flex items-center justify-between pt-4 mt-3 border-t border-gray-200 text-xs text-gray-600 gap-4 overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full pb-2">
        <div className="flex items-center gap-4 whitespace-nowrap shrink-0">
          <span className="font-bold text-gray-800">
            Total Records: <span className="text-blue-700">124</span>
          </span>
          <span className="font-bold text-gray-800">
            Selected: <span className="text-blue-700">0</span>
          </span>

          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <button onClick={() => alert("Update Status")} className="save-btn shrink-0">
              Update Status
            </button>
            <button onClick={() => navigate("/send-outsource")} className="save-btn shrink-0">
              Send to Outsource
            </button>
            <button onClick={() => alert("Receive from Outsource")} className="save-btn shrink-0">
              Receive from Outsource
            </button>
            <button onClick={() => alert("Approve Reports")} className="save-btn shrink-0">
              Approve Reports
            </button>
            <button onClick={() => alert("Re-Print")} className="save-btn shrink-0">
              Re-Print
            </button>
            <button onClick={() => alert("Approve Reports")} className="save-btn shrink-0">
              Approve Reports
            </button>
            <select
              name="More Action"
              defaultValue=""
              className="input-field shrink-0 mt-1"
              style={{ width: "120px" }}
            >
              <option value="" disabled>
                More Actions
              </option>
              <option value="IPD">IPD</option>
              <option value="OPD">OPD</option>
              <option value="ICU">ICU</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
