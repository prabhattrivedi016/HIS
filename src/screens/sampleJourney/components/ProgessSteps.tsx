import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import {
  Barcode,
  CheckCircle,
  Droplet,
  FileCheck,
  FileText,
  Inbox,
  ShieldCheck,
  Truck,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SampleJourneyItem, SampleJourneyStep, StepItem } from "../types";

export default function ProgressSteps({
  sampleJourneyValue,
  setNextStep,
}: {
  sampleJourneyValue?: SampleJourneyItem | null;
  setNextStep: (nextStep: string) => void;
}) {
  const { loading, fetchApi } = useGlobalApi();
  // const [sampleJourneyStepProcess, setSampleJourneyStepProcess] =
  //   useState<SampleJourneyStep | null>(() => {
  //     try {
  //       const stored = localStorage.getItem("sampleJourneyStepProcess");
  //       return stored ? JSON.parse(stored) : null;
  //     } catch {
  //       return null;
  //     }
  //   });

  const [sampleJourneyStepProcess, setSampleJourneyStepProcess] =
    useState<SampleJourneyStep | null>(() => {
      try {
        const stored = localStorage.getItem("sampleJourneyStepProcess");
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    });

  const getSampleJourneyStepProcess = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_COMPANY_SETTINGS,
      {},
      {},
      { component: "SampleJourney" }
    );
    if (resp?.data?.[0]) {
      setSampleJourneyStepProcess(resp.data[0]);
      try {
        localStorage.setItem("sampleJourneyStepProcess", JSON.stringify(resp.data[0]));
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    getSampleJourneyStepProcess();
  }, []);

  const steps: StepItem[] = useMemo(() => {
    const checkRequired = (val: any, defaultVal = true): boolean => {
      if (val === undefined || val === null) return defaultVal;
      if (typeof val === "boolean") return val;
      if (typeof val === "number") return val === 1;
      if (typeof val === "string") return val === "1" || val.toLowerCase() === "true";
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

    const isRejected =
      Number(sampleJourneyValue?.isSampleRejected) === 1 ||
      Boolean(sampleJourneyValue?.SampleRejectedOn);

    const isRegistrationDone = Boolean(
      sampleJourneyValue?.RegistrationOn ||
      sampleJourneyValue?.RegistrationBy ||
      (sampleJourneyValue && Number(sampleJourneyValue?.PatientId) > 0)
    );

    // If sample rejected, show ONLY Registration and Sample Rejected
    if (isRejected) {
      return [
        {
          id: 1,
          title: "Registration",
          icon: FileText,
          date: sampleJourneyValue?.RegistrationOn || "",
          by: sampleJourneyValue?.RegistrationBy || "",
          isDone: true,
          isVisible: true,
          displayIndex: 1,
          isNext: false,
        },
        {
          id: 2,
          title: "Sample Rejected",
          icon: XCircle,
          date: sampleJourneyValue?.SampleRejectedOn || "",
          by: sampleJourneyValue?.SampleRejectedBy || "",
          isDone: true,
          isRejected: true,
          isVisible: true,
          displayIndex: 2,
          isNext: false,
        },
      ];
    }

    const isCollectionDone =
      Number(sampleJourneyValue?.IsSampleCollected) === 1 ||
      Boolean(sampleJourneyValue?.SampleCollectedOn);

    const isReceivedDone =
      Number(sampleJourneyValue?.IsSampleReceivedByDepartment) === 1 ||
      Boolean(sampleJourneyValue?.SampleReceivedByDepartmentOn);

    const isSegregationDone =
      Number(sampleJourneyValue?.IsSampleSegregated) === 1 ||
      Boolean(sampleJourneyValue?.SampleSegregationOn);

    const isResultDone =
      Number(sampleJourneyValue?.IsResultDone) === 1 || Boolean(sampleJourneyValue?.ResultDoneOn);

    const isApprovedDone =
      Number(sampleJourneyValue?.IsReportApproved) === 1 ||
      Boolean(sampleJourneyValue?.ReportApprovedOn);

    const isDispatchedDone =
      Number(sampleJourneyValue?.IsDispatched) === 1 || Boolean(sampleJourneyValue?.DispatchedOn);

    const isPrintedDone =
      Number(sampleJourneyValue?.isReportPrinted) === 1 ||
      Boolean(sampleJourneyValue?.ReportPrintedOn);

    const allSteps = [
      {
        id: 1,
        title: "Registration",
        icon: FileText,
        date: sampleJourneyValue?.RegistrationOn || "",
        by: sampleJourneyValue?.RegistrationBy || "",
        isDone: isRegistrationDone,
        isVisible: true,
      },
      {
        id: 2,
        title: "Sample Collection",
        icon: Droplet,
        date: sampleJourneyValue?.SampleCollectedOn || "",
        by: sampleJourneyValue?.SampleCollectedBy || "",
        isDone: isCollectionDone,
        isVisible: isCollectionRequired,
      },
      {
        id: 3,
        title: "Sample Segregation",
        icon: Barcode,
        date: sampleJourneyValue?.SampleSegregationOn || "",
        by: sampleJourneyValue?.SampleSegregatedBy || "",
        isDone: isSegregationDone,
        isVisible: isSegregationRequired,
      },
      {
        id: 4,
        title: "Department Received",
        icon: Inbox,
        date: sampleJourneyValue?.SampleReceivedByDepartmentOn || "",
        by: sampleJourneyValue?.SampleReceivedBy || "",
        isDone: isReceivedDone,
        isVisible: isDepartmentReceivingRequired,
      },

      {
        id: 5,
        title: "Result Entry & Validation",
        icon: CheckCircle,
        date: sampleJourneyValue?.ResultDoneOn || "",
        by: sampleJourneyValue?.ResultDoneBy || "",
        isDone: isResultDone,
        isVisible: true,
      },
      {
        id: 6,
        title: "Approved",
        icon: ShieldCheck,
        date: sampleJourneyValue?.ReportApprovedOn || "",
        by:
          sampleJourneyValue?.ReportApprovedBy || sampleJourneyValue?.ReportApporvedByDoctor || "",
        isDone: isApprovedDone,
        isVisible: true,
      },
      {
        id: 7,
        title: "Dispatched",
        icon: Truck,
        date: sampleJourneyValue?.DispatchedOn || "",
        by: sampleJourneyValue?.DispatchedBy || "",
        isDone: isDispatchedDone,
        isVisible: true,
      },
      {
        id: 8,
        title: "Report Printed",
        icon: FileCheck,
        date: sampleJourneyValue?.ReportPrintedOn || "",
        by: sampleJourneyValue?.ReportPrintedBy || "",
        isDone: isPrintedDone,
        isVisible: true,
      },
    ];

    const visible = allSteps.filter(s => s.isVisible);
    const nextIdx = visible.findIndex(s => !s.isDone);

    return visible.map((step, idx) => ({
      ...step,
      displayIndex: idx + 1,
      isNext: idx === nextIdx,
    }));
  }, [sampleJourneyValue, sampleJourneyStepProcess]);

  const nextStepTitle = useMemo(() => {
    const isRejected =
      Number(sampleJourneyValue?.isSampleRejected) === 1 ||
      Boolean(sampleJourneyValue?.SampleRejectedOn);
    if (isRejected) {
      return "Sample Rejected";
    }
    const nextItem = steps.find(s => s.isNext);
    return nextItem ? nextItem.title : "";
  }, [steps, sampleJourneyValue]);

  useEffect(() => {
    setNextStep(nextStepTitle);
  }, [nextStepTitle, setNextStep]);

  return (
    <div className="card mt-1 overflow-x-auto">
      <div className="min-w-[1000px] flex items-center justify-between relative px-8 py-7">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isLast = index === steps.length - 1;
          const nextStepItem = steps[index + 1];

          // Determine circle styling: Green if done, gray if pending/future, styled if next
          let circleBgClass = "bg-gray-200 text-gray-400 border border-gray-300";
          let labelColorClass = "text-gray-400";

          if (step.isRejected) {
            circleBgClass = "bg-rose-600 text-white ring-4 ring-rose-100 shadow-md";
            labelColorClass = "text-rose-700 font-bold";
          } else if (step.isDone) {
            circleBgClass = "bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-md";
            labelColorClass = "text-emerald-800 font-bold";
          } else if (step.isNext) {
            circleBgClass =
              "bg-blue-600 text-white ring-4 ring-blue-100 shadow-md scale-105 transition-transform animate-pulse";
            labelColorClass = "text-blue-700 font-extrabold";
          }

          // Connecting line between this step and the next
          const isLineActive =
            step.isDone &&
            (nextStepItem?.isDone || nextStepItem?.isNext || nextStepItem?.isRejected);
          const lineColor = nextStepItem?.isRejected
            ? "bg-rose-500"
            : isLineActive
              ? "bg-emerald-500"
              : "bg-gray-200";

          return (
            <div
              key={`${step.id}-${step.title}`}
              className="relative z-10 flex flex-col items-center flex-1 min-w-[110px]"
            >
              {/* Connecting line to next step */}
              {!isLast && (
                <div
                  className={`absolute left-1/2 right-[-50%] top-6 h-[3px] -z-10 transition-colors duration-300 ${lineColor}`}
                />
              )}

              {/* Step Circle with Icon */}
              <div className="relative">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center relative transition-all duration-300 ${circleBgClass}`}
                  title={`${step.title} (${step.isDone ? "Done" : step.isNext ? "Next" : "Pending"})`}
                >
                  <StepIcon size={20} />
                </div>
              </div>

              {/* Step Title Label */}
              <div className="mt-2.5 text-center px-1">
                <div className={`text-[11px] whitespace-nowrap min-h-[16px] ${labelColorClass}`}>
                  {`${step.displayIndex}. ${step.title}`}
                </div>
                {step.isDone && step.date ? (
                  <div className="text-[10px] text-gray-500 font-medium mt-0.5 truncate max-w-[120px]">
                    {step.date}
                  </div>
                ) : step.isNext ? (
                  <div className="text-[10px] text-blue-600 font-bold mt-0.5">Next Action</div>
                ) : (
                  <div className="text-[10px] text-gray-300 font-normal mt-0.5">Pending</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
}
