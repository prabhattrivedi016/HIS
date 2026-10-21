import { useMemo, useState } from "react";
import { SampleJourneyItem, SampleJourneyStep } from "../types";

export default function TableData({
  sampleJourneyValue,
}: {
  sampleJourneyValue: SampleJourneyItem | null;
}) {
  const [activeTab, setActiveTab] = useState("Journey Details");

  const journeyDetailsData = useMemo(() => {
    const val = sampleJourneyValue;

    let sampleJourneyStepProcess: SampleJourneyStep | null = null;
    try {
      const raw = localStorage.getItem("sampleJourneyStepProcess");
      if (raw) sampleJourneyStepProcess = JSON.parse(raw);
    } catch {
      sampleJourneyStepProcess = null;
    }

    const checkRequired = (settingVal: any, defaultVal = true): boolean => {
      if (settingVal === undefined || settingVal === null) return defaultVal;
      if (typeof settingVal === "boolean") return settingVal;
      if (typeof settingVal === "number") return settingVal === 1;
      if (typeof settingVal === "string")
        return settingVal === "1" || settingVal.toLowerCase() === "true";
      return defaultVal;
    };

    const isCollectionRequired = checkRequired(
      sampleJourneyStepProcess?.IsSampleCollectionRequired ??
        sampleJourneyStepProcess?.IsSampleRequired,
      true
    );

    const isDepartmentReceivingRequired = checkRequired(
      sampleJourneyStepProcess?.IsSampleDepartmentReceivingRequired ??
        sampleJourneyStepProcess?.IsDepartmentReceivingRequired,
      true
    );

    const isSegregationRequired = checkRequired(
      sampleJourneyStepProcess?.IsSampleSegregationRequired,
      true
    );

    const isRejected = Number(val?.isSampleRejected) === 1 || Boolean(val?.SampleRejectedOn);

    if (isRejected) {
      return [
        {
          id: 1,
          stage: "Registration",
          dateTime: val?.RegistrationOn || "-",
          performedBy: val?.RegistrationBy || "-",
          remarks: "-",
        },
        {
          id: 2,
          stage: "Sample Rejected",
          dateTime: val?.SampleRejectedOn || "-",
          performedBy: val?.SampleRejectedBy || "-",
          remarks: val?.SampleRejectionReason || "Sample rejected",
        },
      ];
    }

    const stages: Array<{
      id: number;
      stage: string;
      dateTime: string;
      location?: string;
      performedBy: string;
      remarks: string;
    }> = [];

    let currentId = 1;

    // 1. Registration
    stages.push({
      id: currentId++,
      stage: "Registration",
      dateTime: val?.RegistrationOn || "-",
      performedBy: val?.RegistrationBy || "-",
      remarks: "-",
    });

    // Subsequent steps only if not rejected and enabled by rights
    if (!isRejected) {
      if (isCollectionRequired) {
        stages.push({
          id: currentId++,
          stage: "Sample Collection",
          dateTime: val?.SampleCollectedOn || "-",
          performedBy: val?.SampleCollectedBy || "-",
          remarks:
            Number(val?.IsSampleCollected) === 1
              ? `Sample collected${val?.SampleType ? ` (${val.SampleType})` : ""}.`
              : "-",
        });
      }

      if (isDepartmentReceivingRequired) {
        stages.push({
          id: currentId++,
          stage: "Sample Received in Lab",
          dateTime: val?.SampleReceivedByDepartmentOn || "-",
          performedBy: val?.SampleReceivedBy || "-",
          remarks:
            Number(val?.IsSampleReceivedByDepartment) === 1 ? "Sample received and verified." : "-",
        });
      }

      if (isSegregationRequired) {
        stages.push({
          id: currentId++,
          stage: "Accessioned / Segregated",
          dateTime: val?.SampleSegregationOn || "-",
          performedBy: val?.SampleSegregatedBy || "-",
          remarks:
            Number(val?.IsSampleSegregated) === 1 ? "Sample segregated and barcode verified." : "-",
        });
      }

      stages.push(
        {
          id: currentId++,
          stage: "Result Entry & Validation",
          dateTime: val?.ResultDoneOn || "-",
          performedBy: val?.ResultDoneBy || "-",
          remarks: Number(val?.IsResultDone) === 1 ? "Results entered and validated." : "-",
        },
        {
          id: currentId++,
          stage: "Approved",
          dateTime: val?.ReportApprovedOn || "-",
          performedBy: val?.ReportApprovedBy || val?.ReportApporvedByDoctor || "-",
          remarks:
            Number(val?.IsReportApproved) === 1 ? "Approved by consultant pathologist." : "-",
        },
        {
          id: currentId++,
          stage: "Dispatched",
          dateTime: val?.DispatchedOn || "-",
          performedBy: val?.DispatchedBy || "-",
          remarks: Number(val?.IsDispatched) === 1 ? "Report dispatched to patient." : "-",
        },
        {
          id: currentId++,
          stage: "Reported / Printed",
          dateTime: val?.ReportPrintedOn || "-",
          performedBy: val?.ReportPrintedBy || "-",
          remarks: Number(val?.isReportPrinted) === 1 ? "Report printed and released." : "-",
        }
      );
    }

    return stages;
  }, [sampleJourneyValue]);

  return (
    <div className="card mt-1">
      {/* ================= TABS HEADER ================= */}
      <div className="flex items-center gap-4  text-xs font-bold mb-4 overflow-x-auto">
        {["Journey Details", "Related Documents"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2.5 cursor-pointer whitespace-nowrap transition-colors relative ${
              activeTab === tab
                ? "text-blue-600 border-b-2 border-blue-600 "
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ================= CONTENT CONTAINER ================= */}
      {activeTab === "Journey Details" ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] lg:min-h-102 border-collapse text-left text-[11px]">
            <thead>
              <tr className="bg-blue-50 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="border border-gray-300 text-center py-2.5 px-2 text-center w-[6%]">
                  #
                </th>
                <th className="border border-gray-300 text-center py-2.5 px-3 w-[22%]">Stage</th>
                <th className="border border-gray-300  text-center py-2.5 px-3 w-[18%]">
                  Date & Time
                </th>
                <th className="border border-gray-300 text-center py-2.5 px-3 w-[18%]">
                  Performed By
                </th>
                <th className="border border-gray-300 text-center py-2.5 px-3 w-[19%]">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
              {journeyDetailsData.map(row => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="border border-gray-300 py-2.5 px-2 text-center font-bold text-gray-900">
                    {row.id}
                  </td>
                  <td className="border border-gray-300 text-center py-2.5 px-3 text-blue-600 font-bold">
                    {row.stage}
                  </td>
                  <td className="border border-gray-300 text-center py-2.5 px-3 text-gray-600">
                    {row.dateTime}
                  </td>

                  <td className="border border-gray-300 text-center py-2.5 px-3 text-gray-900">
                    {row.performedBy}
                  </td>
                  <td className="border border-gray-300 text-center py-2.5 px-3 text-gray-600 font-normal">
                    {row.remarks ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-6 text-center text-xs text-gray-500 font-medium">
          No related documents available.
        </div>
      )}
    </div>
  );
}
