import { ArrowUp, Eye, File, MoreVertical, Plus, Printer } from "lucide-react";

export default function TableData({ onNavigate }) {
  const sampleData = [
    {
      timeLine: "Delayed",
      timeLineColor: "text-rose-700 bg-rose-50",
      id: 1,
      sampleId: "S-260923-001",
      uhid: "UHID0001",
      patientName: "Rahul S.",
      sampleType: "Blood (EDTA)",
      tests: "CBC",
      collectionTime: "23-09-2026\n09:15 AM",
      receivedTime: "23-09-2026\n09:30 AM",
      priority: "Normal",
      priorityColor: "text-emerald-700 bg-emerald-50",
      status: "Received",
      statusColor: "text-emerald-700 bg-emerald-100",
      location: "Galatic",
    },
    {
      timeLine: "On Time",
      timeLineColor: "text-emerald-700 bg-emerald-50",
      id: 2,
      sampleId: "S-260923-002",
      uhid: "UHID0002",
      patientName: "Priya M.",
      sampleType: "Serum",
      tests: "LFT, KFT",
      collectionTime: "23-09-2026\n09:20 AM",
      receivedTime: "23-09-2026\n09:35 AM",
      priority: "High",
      priorityColor: "text-rose-700 bg-rose-50",
      status: "Processing",
      statusColor: "text-blue-700 bg-blue-100",
      location: "Tulsi",
    },
    {
      timeLine: "On Time",
      timeLineColor: "text-emerald-700 bg-emerald-50",
      id: 3,
      sampleId: "S-260923-003",
      uhid: "UHID0003",
      patientName: "Amit K.",
      sampleType: "Urine",
      tests: "R/M",
      collectionTime: "23-09-2026\n09:45 AM",
      receivedTime: "-",
      priority: "Normal",
      priorityColor: "text-emerald-700 bg-emerald-50",
      status: "Pending",
      statusColor: "text-amber-800 bg-amber-100",
      location: "-",
    },
    {
      timeLine: "Delayed",
      timeLineColor: "text-rose-700 bg-rose-50",
      id: 4,
      sampleId: "S-260923-004",
      uhid: "UHID0004",
      patientName: "Neha T.",
      sampleType: "Blood (Plain)",
      tests: "Lipid Profile",
      collectionTime: "23-09-2026\n10:10 AM",
      receivedTime: "23-09-2026\n10:20 AM",
      priority: "Normal",
      priorityColor: "text-emerald-700 bg-emerald-50",
      status: "Received",
      statusColor: "text-emerald-700 bg-emerald-100",
      location: "Apex",
    },
    {
      timeLine: "On Time",
      timeLineColor: "text-emerald-700 bg-emerald-50",
      id: 5,
      sampleId: "S-260923-005",
      uhid: "UHID0005",
      patientName: "Vikash J.",
      sampleType: "Stool",
      tests: "Stool R/M",
      collectionTime: "23-09-2026\n10:30 AM",
      receivedTime: "-",
      priority: "Normal",
      priorityColor: "text-emerald-700 bg-emerald-50",
      status: "Pending",
      statusColor: "text-amber-800 bg-amber-100",
      location: "-",
    },
    {
      timeLine: "Delayed",
      timeLineColor: "text-rose-700 bg-rose-50",
      id: 6,
      sampleId: "S-260923-006",
      uhid: "UHID0006",
      patientName: "Sneha P.",
      sampleType: "Serum",
      tests: "TFT",
      collectionTime: "23-09-2026\n10:45 AM",
      receivedTime: "23-09-2026\n11:00 AM",
      priority: "High",
      priorityColor: "text-rose-700 bg-rose-50",
      status: "Processing",
      statusColor: "text-blue-700 bg-blue-100",
      location: "Yathart",
    },
    {
      timeLine: "On Time",
      timeLineColor: "text-emerald-700 bg-emerald-50",
      id: 7,
      sampleId: "S-260923-007",
      uhid: "UHID0007",
      patientName: "Manoj K.",
      sampleType: "Blood (Sodium Fluoride)",
      tests: "Blood Sugar",
      collectionTime: "23-09-2026\n11:05 AM",
      receivedTime: "23-09-2026\n11:10 AM",
      priority: "Normal",
      priorityColor: "text-emerald-700 bg-emerald-50",
      status: "Received",
      statusColor: "text-emerald-700 bg-emerald-100",
      location: "Galaxy",
    },
    {
      timeLine: "On Time",
      timeLineColor: "text-emerald-700 bg-emerald-50",
      id: 8,
      sampleId: "S-260923-008",
      uhid: "UHID0008",
      patientName: "Kavita R.",
      sampleType: "CSF",
      tests: "Cell Count",
      collectionTime: "23-09-2026\n11:20 AM",
      receivedTime: "-",
      priority: "High",
      priorityColor: "text-rose-700 bg-rose-50",
      status: "Pending",
      statusColor: "text-amber-800 bg-amber-100",
      location: "-",
    },
    {
      timeLine: "On Time",
      timeLineColor: "text-emerald-700 bg-emerald-50",
      id: 9,
      sampleId: "S-260923-009",
      uhid: "UHID0009",
      patientName: "Suresh P.",
      sampleType: "Sputum",
      tests: "AFB",
      collectionTime: "23-09-2026\n11:35 AM",
      receivedTime: "-",
      priority: "Normal",
      priorityColor: "text-emerald-700 bg-emerald-50",
      status: "Rejected",
      statusColor: "text-rose-700 bg-rose-100",
      location: "-",
    },
    {
      timeLine: "Delayed",
      timeLineColor: "text-rose-700 bg-rose-50",
      id: 10,
      sampleId: "S-260923-010",
      uhid: "UHID0010",
      patientName: "Anjali D.",
      sampleType: "Serum",
      tests: "Vitamin D",
      collectionTime: "23-09-2026\n11:50 AM",
      receivedTime: "23-09-2026\n12:05 PM",
      priority: "Normal",
      priorityColor: "text-emerald-700 bg-emerald-50",
      status: "Received",
      statusColor: "text-emerald-700 bg-emerald-100",
      location: "Haribandhu",
    },
  ];

  const handleViewClick = sampleId => {
    if (onNavigate) {
      onNavigate("sample");
    } else {
      alert(`View details clicked for sample: ${sampleId}`);
    }
  };

  const handleMenuClick = sampleId => {
    alert(`3 dots action menu clicked for sample: ${sampleId}`);
  };

  const handlePrintClick = sampleId => {
    alert(`Print clicked for sample: ${sampleId}`);
  };

  const handleAttachClick = sampleId => {
    alert(`Attach clicked for sample: ${sampleId}`);
  };

  const handleFileClick = sampleId => {
    alert(`File clicked for sample: ${sampleId}`);
  };

  const handleUploadClick = sampleId => {
    alert(`Upload clicked for sample: ${sampleId}`);
  };

  return (
    <div className="card mt-2">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1290px] table-fixed border-collapse text-left text-[10px] sm:text-[11px]">
          <thead>
            <tr className="bg-blue-50 text-gray-500 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider">
              <th className="w-[3%] border border-gray-300 py-2 px-1 text-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 cursor-pointer w-3.5 h-3.5"
                />
              </th>
              <th className="w-[4%] border border-gray-300 py-2 px-1 text-center">#</th>
              <th className="w-[6%] border border-gray-300 py-2 px-1 text-center">Time Line</th>
              <th className="w-[10%] border border-gray-300 py-2 px-2">Sample ID</th>
              <th className="w-[6%] border border-gray-300 py-2 px-1 text-center">Barcode</th>
              <th className="w-[8%] border border-gray-300 py-2 px-2">UHID</th>
              <th className="w-[10%] border border-gray-300 py-2 px-2">Patient Name</th>
              <th className="w-[10%] border border-gray-300 py-2 px-2">Sample Type</th>
              <th className="w-[8%] border border-gray-300 py-2 px-2">Test(s)</th>
              <th className="w-[10%] border border-gray-300 py-2 px-2">Collection Time</th>
              <th className="w-[10%] border border-gray-300 py-2 px-2">Received Time</th>
              <th className="w-[7%] border border-gray-300 py-2 px-2 text-center">Priority</th>
              <th className="w-[8%] border border-gray-300 py-2 px-2 text-center">Status</th>
              <th className="w-[10%] border border-gray-300 py-2 px-2 text-center">
                Location/Beds
              </th>
              <th className="w-[14%] border border-gray-300 py-2 px-1 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
            {sampleData.map(row => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                <td className="border border-gray-300 py-2 px-1 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 cursor-pointer w-3.5 h-3.5"
                  />
                </td>
                <td className="border border-gray-300 py-2 px-1 font-bold text-gray-900 text-center">
                  {row.id}
                </td>
                <td className="border border-gray-300 py-2 px-1 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${row.timeLineColor || row.tmeLineColor || "text-emerald-700 bg-emerald-50"}`}
                  >
                    {row.timeLine}
                  </span>
                </td>
                <td className="border border-gray-300 py-2 px-2 text-blue-600 font-bold">
                  {row.sampleId}
                </td>
                <td className="border border-gray-300 py-2 px-2 text-center">
                  {/* Barcode graphic representation */}
                  <div className="flex items-center justify-center space-x-[1px] h-5 text-gray-800">
                    <div className="w-[2px] h-full bg-black"></div>
                    <div className="w-[1px] h-full bg-black"></div>
                    <div className="w-[3px] h-full bg-black"></div>
                    <div className="w-[1px] h-full bg-black"></div>
                    <div className="w-[2px] h-full bg-black"></div>
                    <div className="w-[2px] h-full bg-black"></div>
                    <div className="w-[1px] h-full bg-black"></div>
                    <div className="w-[3px] h-full bg-black"></div>
                  </div>
                </td>
                <td className="border border-gray-300 py-2 px-2 text-gray-800">{row.uhid}</td>
                <td className="border border-gray-300 py-2 px-2 text-gray-900 font-bold">
                  {row.patientName}
                </td>
                <td className="border border-gray-300 py-2 px-2 text-gray-700">{row.sampleType}</td>
                <td className="border border-gray-300 py-2 px-2 text-gray-800 font-medium">
                  {row.tests}
                </td>
                <td className="border border-gray-300 py-2 px-2 text-gray-600 whitespace-pre-line text-[10px]">
                  {row.collectionTime}
                </td>
                <td className="border border-gray-300 py-2 px-2 text-gray-600 whitespace-pre-line text-[10px]">
                  {row.receivedTime}
                </td>
                <td className="border border-gray-300 py-2 px-2 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${row.priorityColor}`}
                  >
                    {row.priority}
                  </span>
                </td>
                <td className="border border-gray-300 py-2 px-2 text-center">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${row.statusColor}`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="border border-gray-300 py-2 px-2 text-center text-gray-700">
                  {row.location}
                </td>
                <td className="border border-gray-300 py-2 px-1 text-center">
                  <div className="flex items-center justify-center space-x-.2">
                    <button
                      onClick={() => handleViewClick(row.sampleId)}
                      className="text-gray-500 hover:text-blue-600 cursor-pointer p-1 transition-colors"
                      title="View Details"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => handleMenuClick(row.sampleId)}
                      className="text-gray-500 hover:text-gray-800 cursor-pointer p-1 transition-colors"
                      title="More Actions"
                    >
                      <MoreVertical size={15} />
                    </button>
                    <button
                      onClick={() => handlePrintClick(row.sampleId)}
                      className="text-gray-500 hover:text-emerald-600 cursor-pointer p-1 transition-colors"
                      title="Print Sample"
                    >
                      <Printer size={15} />
                    </button>
                    <button
                      onClick={() => handleAttachClick(row.sampleId)}
                      className="text-green-700 hover:text-emerald-600 cursor-pointer p-1 transition-colors"
                      title="Attach File"
                    >
                      <Plus size={15} />
                    </button>
                    <button
                      onClick={() => handleFileClick(row.sampleId)}
                      className="text-gray-500 hover:text-emerald-600 cursor-pointer p-1 transition-colors"
                      title="File"
                    >
                      <File size={15} />
                    </button>
                    <button
                      onClick={() => handleUploadClick(row.sampleId)}
                      className="text-red-500 hover:text-emerald-600 cursor-pointer p-1 transition-colors"
                      title="Upload"
                    >
                      <ArrowUp size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Button */}
      <div className="flex flex-col sm:flex-row items-center justify-end pt-4 mt-2 border-t border-gray-200 text-xs text-gray-500 gap-3">
        <div className="flex items-center  gap-3">
          {/* Barcode Radio Button */}
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer select-none">
            <input
              type="radio"
              name="barcodeOption"
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
            />
            <span>Barcode</span>
          </label>

          {/* Print Button */}
          <button
            onClick={() => alert("Print clicked")}
            className="border border-blue-600 text-blue-600  text-xs font-semibold px-4 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer active:scale-95"
          >
            Print
          </button>

          {/* Save Button */}
          <button
            onClick={() => alert("Save clicked")}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer active:scale-95"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
