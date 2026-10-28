import { AlertCircle, Calendar, CheckCircle2, Clock, Timer, XCircle } from "lucide-react";
import { useMemo } from "react";
import { SampleJourneyItem } from "../types";

const formatMinutes = (minutes: number) => {
  if (!minutes || isNaN(minutes) || minutes <= 0) return "0m";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
};

// parse string or number into minutes
const parseMinutes = (val: any): number => {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  const str = String(val).trim();
  if (!str || str === "-") return 0;
  if (/hr|hour/i.test(str)) {
    const num = parseFloat(str);
    return isNaN(num) ? 0 : Math.round(num * 60);
  }
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
};

export default function TurnAroundTimeDetails({
  sampleJourneyValue,
  nextStep,
}: {
  sampleJourneyValue: SampleJourneyItem | null;
  nextStep: string;
}) {
  const isRejected =
    Number(sampleJourneyValue?.isSampleRejected) === 1 ||
    Boolean(sampleJourneyValue?.SampleRejectedOn);

  // Candidate fields for Actual TAT and Expected/Target TAT given in the API
  const actualRaw =
    sampleJourneyValue?.ActualTat ??
    sampleJourneyValue?.ActualTAT ??
    sampleJourneyValue?.actualTat ??
    sampleJourneyValue?.actual_tat ??
    sampleJourneyValue?.ActualTATInMin;

  const expectedRaw =
    sampleJourneyValue?.ExpectedTat ??
    sampleJourneyValue?.ExpectedTAT ??
    sampleJourneyValue?.expectedTat ??
    sampleJourneyValue?.ExpectedTATInMin ??
    sampleJourneyValue?.TargetTat ??
    sampleJourneyValue?.targetTat ??
    sampleJourneyValue?.TargetTAT ??
    sampleJourneyValue?.expected_tat ??
    sampleJourneyValue?.TargetTATInMin;

  const expectedTat = parseMinutes(expectedRaw);
  const actualTat = parseMinutes(actualRaw);

  // Show only time given in the API (no self-calculation from dates)
  const tatInfo = useMemo(() => {
    if (!sampleJourneyValue) {
      return {
        displayTime: "-",
        subText: "Collection to Report",
        label: "-",
        diffText: "",
        className: "text-gray-400 font-normal",
        title: "",
      };
    }

    // 1. Explicit timeline string from API if provided
    if (sampleJourneyValue?.timeLine && sampleJourneyValue.timeLine !== "-") {
      const lower = sampleJourneyValue.timeLine.toLowerCase();
      if (lower.includes("delay")) {
        return {
          displayTime: actualTat > 0 ? formatMinutes(actualTat) : "-",
          subText: "Collection to Report",
          label: "Delay",
          diffText: "",
          className: "bg-red-50 text-red-600 border border-red-200",
          title: sampleJourneyValue.timeLine,
        };
      }
      if (lower.includes("on time") || lower.includes("ontime")) {
        return {
          displayTime: actualTat > 0 ? formatMinutes(actualTat) : "-",
          subText: "Collection to Report",
          label: "On Time",
          diffText: "",
          className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
          title: sampleJourneyValue.timeLine,
        };
      }
      return {
        displayTime: actualTat > 0 ? formatMinutes(actualTat) : "-",
        subText: "Collection to Report",
        label: sampleJourneyValue.timeLine,
        diffText: "",
        className:
          sampleJourneyValue.timeLineColor ||
          sampleJourneyValue.tmeLineColor ||
          "bg-emerald-50 text-emerald-700 border border-emerald-200",
        title: sampleJourneyValue.timeLine,
      };
    }

    // 2. Direct status keywords in actualRaw or expectedRaw
    if (typeof actualRaw === "string") {
      const lower = actualRaw.trim().toLowerCase();
      if (lower === "delay" || lower.includes("delay")) {
        return {
          displayTime: "-",
          subText: "Collection to Report",
          label: "Delay",
          diffText: "",
          className: "bg-red-50 text-red-600 border border-red-200",
          title: actualRaw,
        };
      }
      if (lower === "on time" || lower === "ontime" || lower.includes("on time")) {
        return {
          displayTime: "-",
          subText: "Collection to Report",
          label: "On Time",
          diffText: "",
          className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
          title: actualRaw,
        };
      }
    }

    if (typeof expectedRaw === "string") {
      const lower = expectedRaw.trim().toLowerCase();
      if (lower === "delay" || lower.includes("delay")) {
        return {
          displayTime: "-",
          subText: "Collection to Report",
          label: "Delay",
          diffText: "",
          className: "bg-red-50 text-red-600 border border-red-200",
          title: expectedRaw,
        };
      }
      if (lower === "on time" || lower === "ontime" || lower.includes("on time")) {
        return {
          displayTime: "-",
          subText: "Collection to Report",
          label: "On Time",
          diffText: "",
          className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
          title: expectedRaw,
        };
      }
    }

    // 3. Numerical comparison of API-provided Actual and Expected TAT
    if (expectedTat > 0 && actualTat > 0) {
      if (actualTat > expectedTat) {
        const diff = actualTat - expectedTat;
        return {
          displayTime: formatMinutes(actualTat),
          subText: "Collection to Report",
          label: "Delay",
          diffText: `Late by ${formatMinutes(diff)}`,
          className: "bg-red-50 text-red-600 border border-red-200",
          title: `Expected: ${expectedTat}m | Actual: ${actualTat}m (Delayed by ${diff}m)`,
        };
      }
      return {
        displayTime: formatMinutes(actualTat),
        subText: "Collection to Report",
        label: "On Time",
        diffText: "",
        className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        title: `Expected: ${expectedTat}m | Actual: ${actualTat}m`,
      };
    }

    // 4. Actual TAT is provided in API, but no expected TAT
    if (actualTat > 0 && expectedTat === 0) {
      return {
        displayTime: formatMinutes(actualTat),
        subText: "Collection to Report",
        label: "On Time",
        diffText: "",
        className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        title: `Actual: ${actualTat}m`,
      };
    }

    // 5. Expected TAT is provided in API, but Actual TAT is pending/not yet in API
    if (expectedTat > 0 && actualTat === 0) {
      return {
        displayTime: "-",
        subText: "Collection to Report",
        label: "On Time",
        diffText: "",
        className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        title: `Expected: ${expectedTat}m`,
      };
    }

    // 6. No TAT data provided in API
    return {
      displayTime: "-",
      subText: "Collection to Report",
      label: "-",
      diffText: "",
      className: "text-gray-400 font-normal",
      title: "",
    };
  }, [sampleJourneyValue, actualRaw, expectedRaw, expectedTat, actualTat]);

  return (
    <div className="w-full space-y-1 lg:mt-1 ">
      {/* ================= 1. TURN AROUND TIME (TAT) ================= */}
      <div className="card">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wide">
          <Clock size={16} className="text-blue-600" />
          <span>Turn Around Time (TAT)</span>
        </div>
        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 mt-2">
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-extrabold text-[#123b70]">{tatInfo.displayTime}</div>
            {expectedTat > 0 && (
              <div className="text-[11px] font-semibold text-gray-500">
                Target: <span className="font-bold text-gray-800">{formatMinutes(expectedTat)}</span>
              </div>
            )}
          </div>
          <div className="text-xs font-medium text-gray-500 mt-0.5">{tatInfo.subText}</div>

          {/* Timeline Status Badge */}
          {tatInfo.label && tatInfo.label !== "-" ? (
            <div
              className={`mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${tatInfo.className}`}
              title={tatInfo.title || undefined}
            >
              {tatInfo.label === "Delay" ? (
                <AlertCircle size={14} className="shrink-0" />
              ) : tatInfo.label === "On Time" ? (
                <CheckCircle2 size={14} className="shrink-0" />
              ) : (
                <Clock size={14} className="shrink-0" />
              )}
              <span>{tatInfo.label}</span>
              {tatInfo.diffText && (
                <span className="text-[11px] font-medium opacity-90">({tatInfo.diffText})</span>
              )}
            </div>
          ) : (
            <div className="mt-2.5 inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full text-xs font-semibold">
              <Clock size={14} className="shrink-0" />
              <span>TAT Not Configured</span>
            </div>
          )}
        </div>
      </div>

      {/* ================= 2. KEY DATES ================= */}
      <div className="card ">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
          <Calendar size={16} className="text-blue-600" />
          <span>Key Dates</span>
        </div>
        <div className="space-y-2.5 text-xs font-medium">
          {/* Timeline Status in Key Dates */}
          <div className="flex justify-between items-center py-.5 border-b border-gray-100">
            <span className="text-gray-500">Timeline:</span>
            <span
              className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                tatInfo.label === "Delay"
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : tatInfo.label === "On Time"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "text-gray-500 font-normal"
              }`}
              title={tatInfo.title || undefined}
            >
              {tatInfo.label}
            </span>
          </div>

          <div className="flex justify-between items-center py-.5 border-b border-gray-100">
            <span className="text-gray-500">Registration Time:</span>
            <span className="font-bold text-center text-gray-800">
              {sampleJourneyValue?.RegistrationOn ?? "-"}
            </span>
          </div>
          {isRejected && (
            <div className="flex justify-between items-center py-.5 border-b border-gray-100">
              <span className="text-gray-500">Rejection Time:</span>
              <span className="font-bold text-center text-rose-600">
                {sampleJourneyValue?.SampleRejectedOn ?? "-"}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center py-.5 border-b border-gray-100">
            <span className="text-gray-500">Collection Time:</span>
            <span className="font-bold text-center text-gray-800">
              {sampleJourneyValue?.SampleCollectedOn ?? "-"}
            </span>
          </div>

          <div className="flex justify-between items-center py-.5 border-b border-gray-100">
            <span className="text-gray-500">Segregation Time:</span>
            <span className="font-bold text-center text-gray-800">
              {sampleJourneyValue?.SampleSegregationOn ?? "-"}
            </span>
          </div>
          <div className="flex justify-between items-center py-.5 border-b border-gray-100">
            <span className="text-gray-500">Result Entry Time:</span>
            <span className="font-bold text-center text-gray-800">
              {sampleJourneyValue?.ResultDoneOn ?? "-"}
            </span>
          </div>
          <div className="flex justify-between items-center py-.5 border-b border-gray-100">
            <span className="text-gray-500">Approved Time:</span>
            <span className="font-bold text-center text-gray-800">
              {sampleJourneyValue?.ReportApprovedOn ?? "-"}
            </span>
          </div>
          <div className="flex justify-between items-center py-.5">
            <span className="text-gray-500">Reported Time:</span>
            <span className="font-bold text-center text-gray-800">
              {sampleJourneyValue?.ReportPrintedOn ?? sampleJourneyValue?.ReportApprovedOn ?? "-"}
            </span>
          </div>
        </div>
      </div>

      {/* ================= 3. NEXT ACTION ================= */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
          <Timer size={16} className="text-blue-600" />
          <span>Next Action</span>
        </div>
        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 flex items-start gap-2.5">
          {isRejected ? (
            <>
              <XCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-bold text-rose-600 text-[13px]">Sample Rejected</div>
                <div className="text-gray-500 mt-1">
                  {sampleJourneyValue?.SampleRejectionReason
                    ? `Reason: ${sampleJourneyValue.SampleRejectionReason}`
                    : "Sample has been rejected."}
                </div>
              </div>
            </>
          ) : nextStep ? (
            <>
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-bold text-gray-800 text-[13px]">{nextStep}</div>
                <div className="text-xs mt-1.5 flex items-center gap-1.5 text-blue-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                  <span>Pending next action</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-bold text-gray-800">No pending action.</div>
                <div className="text-gray-500 mt-0.5">Sample journey completed.</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
