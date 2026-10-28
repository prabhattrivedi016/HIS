import { useState } from "react";
import { PatientDetailsInvestigationItem } from "../types";

export default function LabInfoSmallTable({
  investigationLists,
}: {
  investigationLists: PatientDetailsInvestigationItem[];
}) {
  const [selectedTest, setSelectedTest] = useState("CBC");

  // Left Tests List
  const testsList = [
    {
      id: 1,
      name: "CBC (M)",
      status: "In Progress",
      priority: "Routine",
      statusColor: "bg-blue-500",
    },
    // { id: 2, name: "ESR", status: "Pending", priority: "Routine", statusColor: "bg-amber-500" },
    // {
    //   id: 3,
    //   name: "Blood Sugar (F)",
    //   status: "Pending",
    //   priority: "Routine",
    //   statusColor: "bg-amber-500",
    // },
    // {
    //   id: 4,
    //   name: "Creatinine",
    //   status: "Pending",
    //   priority: "Routine",
    //   statusColor: "bg-amber-500",
    // },
    // { id: 5, name: "Urea", status: "Pending", priority: "Routine", statusColor: "bg-amber-500" },
    // { id: 6, name: "LFT", status: "Pending", priority: "Routine", statusColor: "bg-amber-500" },
    // { id: 7, name: "RFT", status: "Pending", priority: "Routine", statusColor: "bg-amber-500" },
    // {
    //   id: 8,
    //   name: "Electrolyte",
    //   status: "Pending",
    //   priority: "Routine",
    //   statusColor: "bg-amber-500",
    // },
    // { id: 9, name: "CRP", status: "Pending", priority: "Urgent", statusColor: "bg-red-500" },
    // { id: 10, name: "PCT", status: "Pending", priority: "Routine", statusColor: "bg-amber-500" },
    // {
    //   id: 11,
    //   name: "Procalcitonin",
    //   status: "Pending",
    //   priority: "Routine",
    //   statusColor: "bg-amber-500",
    // },
    // {
    //   id: 12,
    //   name: "Peripheral Smear",
    //   status: "Pending",
    //   priority: "Routine",
    //   statusColor: "bg-amber-500",
    // },
  ];

  return (
    <div className="card    p-3 space-y-2.5 w-full  lg:h-[850px]">
      {/* ================= TOP ACTION TABS ================= */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button className="bg-blue-900 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-2xs">
          Tests (12)
        </button>
        <button className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-semibold px-3 py-1 rounded-lg transition-colors">
          Pending Reports (3)
        </button>
      </div>

      {/* ================= DEPARTMENTS & STATUS DROPDOWNS ================= */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <select className=" input-field">
            <option>All Department</option>
          </select>
        </div>
        <div className="relative flex-1">
          <select className="input-field">
            <option>All Status</option>
          </select>
        </div>
      </div>

      <div className="flex flex-row gap-2 justify-between">
        {/* ================= CALENDAR DATE INPUT ================= */}
        <div className="relative flex-1 flex items-center">
          <input type="date" defaultValue="2026-01-10" className="input-field" />
        </div>

        {/* ================= SEARCH TEST INPUT ================= */}
        <div className="relative flex-1 flex items-center">
          <input type="text" placeholder="Search Test Name..." className="input-field" />
        </div>
      </div>

      {/* ================= TESTS LIST TABLE (Responsive Scrollable) ================= */}
      <div className="border border-gray-200 rounded-lg overflow-x-auto overflow-y-auto lg:min-h-120">
        <table className="w-full min-w-[320px] text-left text-[11px] ">
          <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th className="py-1.5 px-2 text-center w-[10%]">#</th>
              <th className="py-1.5 px-2">Test Name</th>
              <th className="py-1.5 px-2">Status</th>
              <th className="py-1.5 px-2">Priority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
            {investigationLists.map((t, idx) => {
              const isSelected = selectedTest === t?.Name;
              return (
                <tr
                  key={t?.InvestigationId}
                  onClick={() => setSelectedTest(t?.Name ?? "")}
                  className={`cursor-pointer transition-colors ${isSelected ? "bg-blue-50/80 text-blue-900" : "hover:bg-slate-50"}`}
                >
                  <td className="py-2 px-2 text-center text-gray-500">{idx + 1}</td>
                  <td className="py-2 px-2 font-bold whitespace-nowrap">{t?.Name}</td>
                  <td className="py-2 px-2 whitespace-nowrap">
                    <div className="flex items-center ">
                      {/* <span className={`w-2 h-2 rounded-full shrink-0 ${t.statusColor}`}></span> */}
                      <span>
                        {t?.IsResultDone === 1
                          ? "Done"
                          : t?.IsReportHold === 1
                            ? "Hold"
                            : t?.IsDispatched === 1
                              ? "Dispatched"
                              : t?.IsReportApproved === 1
                                ? "Approved"
                                : t?.IsSampleCollected === 1
                                  ? "Collected"
                                  : t?.IsSampleReceivedByDepartment === 1
                                    ? "Received"
                                    : t?.IsSampleSegregated === 1
                                      ? "Segreagated"
                                      : "Pending"}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-gray-600 whitespace-nowrap">
                    {t?.isUrgent === 1 ? "Urgent" : "Normal"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
