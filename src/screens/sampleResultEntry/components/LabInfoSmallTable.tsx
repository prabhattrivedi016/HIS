import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { PatientDetailsInvestigationItem } from "../types";

type Investigation = PatientDetailsInvestigationItem & {
  BillDate?: string;
  PatientInvestigationId: number;
  Name?: string;
  IsResultDone?: number;
  IsReportHold?: number;
  IsDispatched?: number;
  IsReportApproved?: number;
  IsSampleCollected?: number;
  IsSampleReceivedByDepartment?: number;
  IsSampleSegregated?: number;
  isUrgent?: number;
};

type Props = {
  investigationLists: PatientDetailsInvestigationItem[];
  setSelectedInvestigation: (investigation: PatientDetailsInvestigationItem) => void;
  allInvestigationListsOfPatient: Investigation[];
  selectedInvestigation?: PatientDetailsInvestigationItem | null;
};

type Status =
  | "Done"
  | "Hold"
  | "Dispatched"
  | "Approved"
  | "Collected"
  | "Received"
  | "Segregated"
  | "Pending";

const getInvestigationStatus = (t: Investigation): Status => {
  if (Number(t.IsResultDone) === 1) return "Done";
  if (Number(t.IsReportHold) === 1) return "Hold";
  if (Number(t.IsDispatched) === 1) return "Dispatched";
  if (Number(t.IsReportApproved) === 1) return "Approved";
  if (Number(t.IsSampleCollected) === 1) return "Collected";
  if (Number(t.IsSampleReceivedByDepartment) === 1) return "Received";
  if (Number(t.IsSampleSegregated) === 1) return "Segregated";

  return "Pending";
};

const getStatusClass = (status: Status) => {
  const styles: Record<Status, string> = {
    Done: "bg-green-100 text-green-700",
    Hold: "bg-red-100 text-red-700",
    Dispatched: "bg-purple-100 text-purple-700",
    Approved: "bg-blue-100 text-blue-700",
    Collected: "bg-amber-100 text-amber-700",
    Received: "bg-cyan-100 text-cyan-700",
    Segregated: "bg-indigo-100 text-indigo-700",
    Pending: "bg-gray-100 text-gray-600",
  };

  return styles[status];
};

// Convert DD-MMM-YYYY into a sortable timestamp.
const parseBillDate = (value?: string): number => {
  if (!value) return 0;

  const match = value.trim().match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);

  if (!match) return 0;

  const [, day, month, year] = match;

  const monthIndex = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ].indexOf(month.toLowerCase());

  if (monthIndex === -1) return 0;

  return new Date(Number(year), monthIndex, Number(day)).getTime();
};

const getDateInputValue = (value?: string) => {
  const timestamp = parseBillDate(value);

  if (!timestamp) return "";

  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function LabInfoSmallTable({
  investigationLists = [],
  setSelectedInvestigation,
  allInvestigationListsOfPatient = [],
  selectedInvestigation,
}: Props) {
  const [activeTab, setActiveTab] = useState<"current" | "old">("current");

  const [expandedDates, setExpandedDates] = useState<Set<string>>(() => new Set());

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");

  // Group old investigations by BillDate.
  const groupedInvestigations = useMemo(() => {
    const groups = new Map<string, { date: string; investigations: Investigation[] }>();

    allInvestigationListsOfPatient.forEach(item => {
      const date = item.BillDate?.trim() || "Unknown Date";

      if (!groups.has(date)) {
        groups.set(date, {
          date,
          investigations: [],
        });
      }

      groups.get(date)!.investigations.push(item);
    });

    return Array.from(groups.values()).sort(
      (a, b) => parseBillDate(b.date) - parseBillDate(a.date)
    );
  }, [allInvestigationListsOfPatient]);

  // Apply search, date and status filters.
  const filteredGroups = useMemo(() => {
    return groupedInvestigations
      .map(group => {
        const filteredTests = group.investigations.filter(test => {
          const matchesSearch = (test.Name || "")
            .toLowerCase()
            .includes(search.trim().toLowerCase());

          const matchesStatus =
            selectedStatus === "All" || getInvestigationStatus(test) === selectedStatus;

          const matchesDate = !selectedDate || getDateInputValue(group.date) === selectedDate;

          return matchesSearch && matchesStatus && matchesDate;
        });

        return {
          ...group,
          investigations: filteredTests,
        };
      })
      .filter(group => group.investigations.length > 0);
  }, [groupedInvestigations, search, selectedStatus, selectedDate]);

  const totalFilteredTests = filteredGroups.reduce(
    (total, group) => total + group.investigations.length,
    0
  );

  const toggleDate = (date: string) => {
    setExpandedDates(previous => {
      const updated = new Set(previous);

      if (updated.has(date)) {
        updated.delete(date);
      } else {
        updated.add(date);
      }

      return updated;
    });
  };

  const handleSelectInvestigation = (investigation: Investigation) => {
    if (
      !Number.isFinite(investigation.PatientInvestigationId) ||
      investigation.PatientInvestigationId <= 0
    ) {
      return;
    }

    setSelectedInvestigation(investigation);
  };

  const renderStatus = (test: Investigation) => {
    const status = getInvestigationStatus(test);

    return (
      <span
        className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${getStatusClass(status)}`}
      >
        {status}
      </span>
    );
  };

  const renderInvestigationRow = (test: Investigation, idx: number, showDate = false) => {
    const isSelected =
      Number(selectedInvestigation?.PatientInvestigationId) === Number(test.PatientInvestigationId);
    const selectedCellClass = isSelected ? "bg-gray-100 text-blue-950" : "";

    return (
      <tr
        key={test.PatientInvestigationId}
        onClick={() => handleSelectInvestigation(test)}
        aria-selected={isSelected}
        className={`cursor-pointer transition-colors ${
          isSelected ? "hover:bg-gray-200" : "hover:bg-blue-50/70"
        }`}
        title="Click to open investigation"
      >
        <td
          className={`px-2 py-2 text-center ${
            isSelected ? "border-l-4 border-l-gray-500" : ""
          } ${selectedCellClass || "text-gray-500"}`}
        >
          {idx + 1}
        </td>

        {showDate && (
          <td className={`px-2 py-2 whitespace-nowrap ${selectedCellClass || "text-gray-500"}`}>
            {test.BillDate}
          </td>
        )}

        <td className={`px-2 py-2 font-bold whitespace-nowrap ${selectedCellClass}`}>
          {test.Name || "Unnamed Test"}
        </td>

        <td className={`px-2 py-2 whitespace-nowrap ${selectedCellClass}`}>{renderStatus(test)}</td>

        <td className={`px-2 py-2 whitespace-nowrap ${selectedCellClass}`}>
          {Number(test.isUrgent) === 1 ? (
            <span className="font-bold text-red-600">Urgent</span>
          ) : (
            <span className="text-gray-500">Normal</span>
          )}
        </td>
      </tr>
    );
  };
  return (
    <div className="card w-full space-y-3 p-3 flex flex-col min-h-[555px] overflow-hidden">
      {/* TOP TABS */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 shrink-0">
        <button
          onClick={() => setActiveTab("current")}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
            activeTab === "current"
              ? "bg-blue-900 text-white"
              : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          Current Tests ({investigationLists.length})
        </button>

        <button
          onClick={() => setActiveTab("old")}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
            activeTab === "old"
              ? "bg-blue-900 text-white"
              : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          All Tests ({allInvestigationListsOfPatient.length})
        </button>
      </div>

      {/* OLD TESTS */}
      {activeTab === "old" ? (
        <>
          {/* FILTERS */}

          {/* RESULT SUMMARY */}
          <div className="flex items-center justify-between shrink-0">
            <span className="text-xs font-semibold text-gray-600">
              {filteredGroups.length} date(s) found
            </span>

            <span className="text-xs font-bold text-blue-900">
              {totalFilteredTests} investigation(s)
            </span>
          </div>

          {/* DATE-WISE ACCORDION */}
          <div className="overflow-y-auto rounded-lg border border-gray-200">
            {filteredGroups.length === 0 ? (
              <div className="flex min-h-40 flex-col items-center justify-center gap-2 text-gray-400">
                <Search size={28} />
                <p className="text-sm font-semibold">No investigations found</p>
                <p className="text-xs">Try changing your search or filters.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredGroups.map(group => {
                  const isExpanded = expandedDates.has(group.date);

                  return (
                    <div key={group.date}>
                      {/* DATE HEADER */}
                      <button
                        type="button"
                        onClick={() => toggleDate(group.date)}
                        aria-expanded={isExpanded}
                        className={`flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition-colors ${
                          isExpanded ? "bg-blue-50" : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-800">
                            {isExpanded ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                          </span>

                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-bold text-gray-800">{group.date}</span>

                            <span className="text-[10px] text-gray-500">
                              {group.investigations.length} investigation(s)
                            </span>
                          </div>
                        </div>

                        <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold text-blue-800">
                          {group.investigations.length} Tests
                        </span>
                      </button>

                      {/* EXPANDED INVESTIGATIONS */}
                      {isExpanded && (
                        <div className="overflow-x-auto border-t border-gray-100 bg-white">
                          <table className="w-full  text-left text-[11px]">
                            <thead className=" top-0 z-10 border-b border-gray-200 bg-gray-50 text-gray-500">
                              <tr>
                                <th className=" px-2 py-2 text-center w-[5%]">#</th>
                                <th className="whitespace-nowrap px-2 py-2">Test Name</th>
                                <th className=" whitespace-nowrap px-2 py-2">Status</th>
                                <th className=" whitespace-nowrap px-2 py-2">Priority</th>
                              </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                              {group.investigations.map((test, idx) =>
                                renderInvestigationRow(test, idx)
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        /* CURRENT TESTS */
        <div className="overflow-auto rounded-lg border border-gray-200">
          <table className="w-full  text-left text-[11px]">
            <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50 text-gray-500">
              <tr>
                <th className="px-2 py-2 text-center w-[5%]">#</th>
                <th className="whitespace-nowrap px-2 py-2">Test Name</th>
                <th className="whitespace-nowrap px-2 py-2">Status</th>
                <th className="whitespace-nowrap px-2 py-2">Priority</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
              {investigationLists.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-gray-400">
                    No current investigations found
                  </td>
                </tr>
              ) : (
                investigationLists.map((test, idx) =>
                  renderInvestigationRow(test as Investigation, idx)
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
