import { useState } from "react";

export default function TableData() {
  const [activeTab, setActiveTab] = useState("Journey Details");

  const journeyDetailsData = [
    {
      id: 1,
      stage: "Registration",
      dateTime: "23-09-2026 09:10 AM",
      location: "Reception",
      performedBy: "Anita Singh",
      remarks: "Patient registered and lab request created.",
    },
    {
      id: 2,
      stage: "Sample Collection",
      dateTime: "23-09-2026 09:15 AM",
      location: "Sample Collection Room",
      performedBy: "Ravi Kumar",
      remarks: "Sample collected (Blood).",
    },
    {
      id: 3,
      stage: "Sample Received in Lab",
      dateTime: "23-09-2026 09:20 AM",
      location: "Lab Reception",
      performedBy: "Pooja Verma",
      remarks: "Sample received and verified.",
    },
    {
      id: 4,
      stage: "Accessioned",
      dateTime: "23-09-2026 09:22 AM",
      location: "Accessioning Desk",
      performedBy: "Amit Yadav",
      remarks: "Barcode generated and tests assigned.",
    },
    {
      id: 5,
      stage: "Processing",
      dateTime: "23-09-2026 10:15 AM",
      location: "Hematology Analyzer",
      performedBy: "Analyzer (Hematology)",
      remarks: "Auto Processing on Mindray BC-6800.",
    },
    {
      id: 6,
      stage: "Result Entry & Validation",
      dateTime: "23-09-2026 11:05 AM",
      location: "Result Entry",
      performedBy: "Sneha Patel",
      remarks: "Results entered and validated.",
    },
    {
      id: 7,
      stage: "Approved",
      dateTime: "23-09-2026 11:20 AM",
      location: "Pathology",
      performedBy: "Dr. P. Singh",
      remarks: "Approved by consultant pathologist.",
    },
    {
      id: 8,
      stage: "Reported",
      dateTime: "23-09-2026 11:24 AM",
      location: "HIS / Patient Portal",
      performedBy: "Auto Patient Auto",
      remarks: "Report released and sent to patient portal.",
    },
  ];

  return (
    <div className="card mt-3">
      {/* ================= TABS HEADER ================= */}
      <div className="flex items-center gap-4 border-b border-gray-200 text-xs font-bold mb-4 overflow-x-auto">
        {[
          "Journey Details",
          "Test Details",
          "Sample Information",
          "Patient Information",
          "Related Documents",
        ].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2.5 cursor-pointer whitespace-nowrap transition-colors relative ${
              activeTab === tab
                ? "text-blue-600 border-b-2 border-blue-600 -mb-[1px]"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ================= TABLE CONTAINER ================= */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] border-collapse text-left text-[11px]">
          <thead>
            <tr className="bg-blue-50 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
              <th className="border border-gray-300 py-2.5 px-2 text-center w-[6%]">#</th>
              <th className="border border-gray-300 py-2.5 px-3 w-[22%]">Stage</th>
              <th className="border border-gray-300 py-2.5 px-3 w-[18%]">Date & Time</th>
              <th className="border border-gray-300 py-2.5 px-3 w-[18%]">Location</th>
              <th className="border border-gray-300 py-2.5 px-3 w-[18%]">Performed By</th>
              <th className="border border-gray-300 py-2.5 px-3 w-[19%]">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
            {journeyDetailsData.map(row => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                <td className="border border-gray-300 py-2.5 px-2 text-center font-bold text-gray-900">
                  {row.id}
                </td>
                <td className="border border-gray-300 py-2.5 px-3 text-blue-600 font-bold">
                  {row.stage}
                </td>
                <td className="border border-gray-300 py-2.5 px-3 text-gray-600">{row.dateTime}</td>
                <td className="border border-gray-300 py-2.5 px-3 text-gray-800">{row.location}</td>
                <td className="border border-gray-300 py-2.5 px-3 text-gray-900">
                  {row.performedBy}
                </td>
                <td className="border border-gray-300 py-2.5 px-3 text-gray-600 font-normal">
                  {row.remarks}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
