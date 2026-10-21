import { AlertCircle, Calendar, CheckCircle2, Clock, Timer, XCircle } from "lucide-react";
import { useMemo } from "react";
import { SampleJourneyItem } from "../types";

const formatMinutes = (minutes: number) => {
  if (!minutes || isNaN(minutes) || minutes <= 0) return "0 m";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
};

const parseDateToMs = (dateStr?: string | null): number | null => {
  if (!dateStr || typeof dateStr !== "string") return null;
  const trimmed = dateStr.trim();
  if (!trimmed || trimmed === "-") return null;

  // 1. Try ISO or YYYY-MM-DD
  if (/^\d{4}/.test(trimmed)) {
    const isoCandidate = trimmed.replace(" ", "T");
    const direct = new Date(isoCandidate);
    if (!isNaN(direct.getTime())) return direct.getTime();
  }

  // 2. Try DD-MM-YYYY or DD/MM/YYYY or DD-MMM-YYYY
  const match = trimmed.match(
    /^(\d{1,2})[-/]([A-Za-z]+|\d{1,2})[-/](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?(?:\s*(AM|PM))?)?$/i
  );
  if (match) {
    const [, dayStr, monthStr, yearStr, hourStr, minStr, secStr, ampm] = match;
    const day = parseInt(dayStr, 10);
    const year = parseInt(yearStr, 10);

    let month = 0;
    if (isNaN(Number(monthStr))) {
      const monthMap: Record<string, number> = {
        jan: 0,
        feb: 1,
        mar: 2,
        apr: 3,
        may: 4,
        jun: 5,
        jul: 6,
        aug: 7,
        sep: 8,
        oct: 9,
        nov: 10,
        dec: 11,
      };
      month = monthMap[monthStr.toLowerCase().slice(0, 3)] ?? 0;
    } else {
      month = parseInt(monthStr, 10) - 1;
    }

    let hours = hourStr ? parseInt(hourStr, 10) : 0;
    const minutes = minStr ? parseInt(minStr, 10) : 0;
    const seconds = secStr ? parseInt(secStr, 10) : 0;

    if (ampm) {
      const upper = ampm.toUpperCase();
      if (upper === "PM" && hours < 12) hours += 12;
      if (upper === "AM" && hours === 12) hours = 0;
    }

    const d = new Date(year, month, day, hours, minutes, seconds);
    if (!isNaN(d.getTime())) return d.getTime();
  }

  // 3. General fallback
  const fallback = new Date(trimmed);
  if (!isNaN(fallback.getTime())) return fallback.getTime();

  return null;
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

  const targetTAT = Math.max(0, Number(sampleJourneyValue?.TargetTATInMin) || 0);
  const apiActualTAT = Math.max(0, Number(sampleJourneyValue?.ActualTATInMin) || 0);

  // Compute effective actual TAT: use API value if > 0, otherwise compute from timestamps if report is ready
  const effectiveActualTAT = useMemo(() => {
    if (apiActualTAT > 0) return apiActualTAT;

    const startDate = sampleJourneyValue?.SampleCollectedOn || sampleJourneyValue?.RegistrationOn;
    const endDate = sampleJourneyValue?.ReportPrintedOn || sampleJourneyValue?.ReportApprovedOn;

    if (startDate && endDate) {
      const startMs = parseDateToMs(startDate);
      const endMs = parseDateToMs(endDate);
      if (startMs && endMs && endMs >= startMs) {
        return Math.round((endMs - startMs) / 60000);
      }
    }
    return 0;
  }, [apiActualTAT, sampleJourneyValue]);

  // If report not ready yet, calculate elapsed time since collection/registration
  const elapsedTime = useMemo(() => {
    if (effectiveActualTAT > 0) return 0;
    const startDate = sampleJourneyValue?.SampleCollectedOn || sampleJourneyValue?.RegistrationOn;
    if (startDate) {
      const startMs = parseDateToMs(startDate);
      if (startMs && Date.now() >= startMs) {
        return Math.round((Date.now() - startMs) / 60000);
      }
    }
    return 0;
  }, [effectiveActualTAT, sampleJourneyValue]);

  const tatInfo = useMemo(() => {
    if (!sampleJourneyValue) {
      return {
        displayTime: "-",
        subText: "Collection to Report",
        badge: null,
      };
    }

    // Case 1: Both Target and Actual TAT are > 0
    if (targetTAT > 0 && effectiveActualTAT > 0) {
      if (effectiveActualTAT > targetTAT) {
        const diff = effectiveActualTAT - targetTAT;
        return {
          displayTime: formatMinutes(effectiveActualTAT),
          subText: "Collection to Report",
          badge: (
            <div className="mt-2.5 inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full text-xs font-bold border border-rose-200">
              <AlertCircle size={14} />
              <span>Late by {formatMinutes(diff)}</span>
            </div>
          ),
        };
      }
      return {
        displayTime: formatMinutes(effectiveActualTAT),
        subText: "Collection to Report",
        badge: (
          <div className="mt-2.5 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-200">
            <CheckCircle2 size={14} />
            <span>Within Expected TAT</span>
          </div>
        ),
      };
    }

    // Case 2: TargetTAT > 0 but ActualTAT === 0 (In-progress sample or pending report)
    if (targetTAT > 0 && effectiveActualTAT === 0) {
      if (elapsedTime > 0) {
        if (elapsedTime > targetTAT) {
          const diff = elapsedTime - targetTAT;
          return {
            displayTime: formatMinutes(elapsedTime),
            subText: "Collection to Report",
            badge: (
              <div className="mt-2.5 inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full text-xs font-bold border border-rose-200">
                <AlertCircle size={14} />
                <span>Late by {formatMinutes(diff)}</span>
              </div>
            ),
          };
        }
        return {
          displayTime: formatMinutes(elapsedTime),
          subText: "Collection to Report",
          badge: (
            <div className="mt-2.5 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-200">
              <CheckCircle2 size={14} />
              <span>Within Expected Time</span>
            </div>
          ),
        };
      }

      return {
        displayTime: formatMinutes(targetTAT),
        subText: "Collection to Report",
        badge: (
          <div className="mt-2.5 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-200">
            <Clock size={14} />
            <span>Within Expected Time</span>
          </div>
        ),
      };
    }

    // Case 3: TargetTAT === 0 and ActualTAT > 0 (Actual recorded, target not configured)
    if (targetTAT === 0 && effectiveActualTAT > 0) {
      return {
        displayTime: formatMinutes(effectiveActualTAT),
        subText: "Collection to Report",
        badge: (
          <div className="mt-2.5 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-200">
            <CheckCircle2 size={14} />
            <span>Within Expected TAT</span>
          </div>
        ),
      };
    }

    // Case 4: TargetTAT === 0 and ActualTAT === 0
    if (elapsedTime > 0) {
      return {
        displayTime: formatMinutes(elapsedTime),
        subText: "Collection to Report",
        badge: (
          <div className="mt-2.5 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-200">
            <Clock size={14} />
            <span>Within Expected Time</span>
          </div>
        ),
      };
    }

    return {
      displayTime: "0m",
      subText: "Collection to Report",
      badge: (
        <div className="mt-2.5 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-200">
          <Clock size={14} />
          <span>Within Expected Time</span>
        </div>
      ),
    };
  }, [sampleJourneyValue, targetTAT, effectiveActualTAT, elapsedTime]);

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
            {targetTAT > 0 && (
              <div className="text-[11px] font-semibold text-gray-500">
                Target: <span className="font-bold text-gray-800">{formatMinutes(targetTAT)}</span>
              </div>
            )}
          </div>
          <div className="text-xs font-medium text-gray-500 mt-0.5">{tatInfo.subText}</div>
          {tatInfo.badge}
        </div>
      </div>

      {/* ================= 2. KEY DATES ================= */}
      <div className="card ">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
          <Calendar size={16} className="text-blue-600" />
          <span>Key Dates</span>
        </div>
        <div className="space-y-2.5 text-xs font-medium">
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
