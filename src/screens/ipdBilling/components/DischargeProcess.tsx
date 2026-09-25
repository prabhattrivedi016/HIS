import CustomDateInput from "@/components/customDateInput";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import CustomTimePicker from "@/components/timePicker";
import { ENDPOINTS } from "@/config/defaults";
import { dischargeProcessType } from "@/constants/constants";
import { BranchContext } from "@/context/BranchContext";
import { IpdPatientDetailsContext } from "@/context/IpdPatientDetailsContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { PickMasterItem } from "@/types";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  FileCheck2,
  Lock,
  LockKeyhole,
  PlayCircle,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { DischargeProcessStepItem, IpdPatientItem } from "../types";
import AbscondedDischargeDetails from "./AbscondedDischargeDetails";
import AddRemark from "./AddRemark";
import DeathDischargeDetails from "./DeathDischargeDetails";
import LamaDamaDischargeDetails from "./LamaDamaDischargeDetails";
import NormalDischargeDetails from "./NormalDischargeDetails";
import ReferralDischargeDetails from "./ReferralDischargeDetails";

const DischargeProcess = ({ patient }: { patient: IpdPatientItem }) => {
  const { loading, fetchApi } = useGlobalApi();
  const branchId = useContext(BranchContext)?.branchId ?? 1;

  const { updatedIpdPatientDetails } = useContext(IpdPatientDetailsContext)! ?? {};

  const dischargeProcessTypeList = usePickMaster("DischargeType")?.pickMasterValue ?? [];

  const [isDischargeInitiated, setIsDischargeInitiated] = useState(false);

  const [isInitiating, setIsInitiating] = useState(false);

  const [steps, setSteps] = useState<DischargeProcessStepItem[]>([]);

  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const [openAddRemark, setOpenAddRemark] = useState<boolean>(false);
  const [renderAddRemark, setRenderAddRemark] = useState<boolean>(false);

  const [allProcessCompleted, SetAllProcessCompleted] = useState<boolean>(false);

  const [canDischarge, setCanDischarge] = useState<boolean>(false);

  // current date
  const currentLocalYYYYMMDD = useMemo(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
      today.getDate()
    ).padStart(2, "0")}`;
  }, []);

  // current time
  const currentLocalTime = useMemo(() => {
    const today = new Date();
    let hours = today.getHours();
    const minutes = today.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? "0" + minutes : minutes.toString();
    return `${hours}:${minutesStr} ${ampm}`;
  }, []);

  const [dischargeType, setDischargeType] = useState<string>("");
  const [dischargeDate, setDischargeDate] = useState<string>(currentLocalYYYYMMDD);
  const [dischargeTime, setDischargeTime] = useState<string>(currentLocalTime);

  // min date
  const minDate = useMemo(() => {
    if (!patient?.AdmissionDate) return undefined;
    const clean = patient.AdmissionDate.replace(/\//g, "-");
    const parts = clean.split("-");
    if (parts.length >= 3) {
      const [day, month, year] = parts;
      const cleanYear = year.split(" ")[0];
      const monthMap: Record<string, string> = {
        jan: "01",
        feb: "02",
        mar: "03",
        apr: "04",
        may: "05",
        jun: "06",
        jul: "07",
        aug: "08",
        sep: "09",
        oct: "10",
        nov: "11",
        dec: "12",
      };
      const cleanMonth = monthMap[month.trim().toLowerCase()] || month.trim().padStart(2, "0");
      return `${cleanYear.trim()}-${cleanMonth}-${day.trim().padStart(2, "0")}`;
    }
    return undefined;
  }, [patient?.AdmissionDate]);

  // max date
  const maxDate = currentLocalYYYYMMDD;

  // get current process

  const getCurrentProcess = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CURRENT_DISCHARGE_PROCESS,
      {},
      { params: { visitId: patient?.VisitId } },
      { component: "DischargeProcess" }
    );

    SetAllProcessCompleted(resp?.data?.AllProcessesCompleted ?? false);
    if (resp?.result?.AllProcessesCompleted) {
      setOpenAddRemark(false);
      setRenderAddRemark(false);
      return;
    }
  };

  // validate patient discharge
  const getValidatePatientDischarge = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.VALIDATE_PATIENT_DISCHARGE,
      {},
      { params: { visitId: patient?.VisitId } },
      { component: "DischargeProcess" }
    );
    if (!resp?.result) {
      setCanDischarge(false);
    }
    if (Number(resp?.data?.CanDischarge) === 0) {
      setCanDischarge(false);
    } else {
      setCanDischarge(true);
    }
  };

  useEffect(() => {
    if (patient?.VisitId) {
      getCurrentProcess();
      getValidatePatientDischarge();
    }
  }, [patient?.VisitId]);

  // get discharge process
  const getDischargeProcessLists = async () => {
    try {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_PATIENT_DISCHARGE_PROCESS,
        {},
        {
          params: {
            visitId: patient?.VisitId,
            branchId,
          },
        },
        {
          component: "DischargeProcess",
        }
      );

      if (!resp?.result) {
        setIsDischargeInitiated(false);
        setSteps([]);
        return;
      }

      setIsDischargeInitiated(true);
      setSteps([
        ...(resp?.data ?? []),

        {
          PatientVisitDischargeProcessId: 0,
          VisitId: 0,
          DischargeProcessId: 0,
          ProcessKey: "FINAL_DISCHARGED",
          ProcessName: "Final Discharged",
          SequenceNo: 0,
          DischargeProcessStep: resp?.data?.length + 1,
          IsMandatory: true,
          Status: 0,
          IconName: "fa-hospital-user",
          IconClass: "fa-solid fa-hospital-user",
          StartedBy: "",
          StartedOn: "",
          CompletedBy: updatedIpdPatientDetails?.DischargedBy ?? patient?.DischargedBy,
          CompletedOn:
            `${updatedIpdPatientDetails?.DischargeDate} ${updatedIpdPatientDetails?.DischargeTime}` ||
            `${patient?.DischargeDate} ${patient?.DischargeTime}` ||
            "--",
          Remarks: "",
          IsCompleted: updatedIpdPatientDetails?.IsDischarged ?? patient?.IsDischarged,
          IsPending: 1,
          IsCurrentProcess: 0,
          CanExecute: 0,
          IsFuture: 0,
          IsUserAuthorized: 1,
        },

        {
          PatientVisitDischargeProcessId: 0,
          VisitId: 0,
          DischargeProcessId: 0,
          ProcessKey: "BILL_GENERATED",
          ProcessName: "Bill Generated",
          SequenceNo: 0,
          DischargeProcessStep: resp?.data?.length + 2,
          IsMandatory: true,
          Status: 0,
          IconName: "fa-indian-rupee-sign",
          IconClass: "fa-solid fa-indian-rupee-sign",
          StartedBy: "",
          StartedOn: "",
          CompletedBy: updatedIpdPatientDetails?.BillGeneratedBy ?? patient?.BillGeneratedBy,
          CompletedOn: updatedIpdPatientDetails?.BillGeneratedOn ?? patient?.BillGeneratedOn,
          Remarks: "",
          IsCompleted: updatedIpdPatientDetails?.IsBillGenerated ?? patient?.IsBillGenerated,
          IsPending: 1,
          IsCurrentProcess: 0,
          CanExecute: 0,
          IsFuture: 0,
          IsUserAuthorized: 1,
        },

        {
          PatientVisitDischargeProcessId: 0,
          VisitId: 0,
          DischargeProcessId: 0,
          ProcessKey: "FILE_CLOSED",
          ProcessName: "File Closed",
          SequenceNo: 0,
          DischargeProcessStep: resp?.data?.length + 3,
          IsMandatory: true,
          Status: 0,
          IconName: "fa-folder-closed",
          IconClass: "fa-solid fa-folder-closed",
          StartedBy: "",
          StartedOn: "",
          CompletedBy: updatedIpdPatientDetails?.FileClosedBy ?? patient?.FileClosedBy,
          CompletedOn: updatedIpdPatientDetails?.FileClosedOn ?? patient?.FileClosedOn,
          Remarks: "",
          IsCompleted: updatedIpdPatientDetails?.IsFileClosed ?? patient?.IsFileClosed,
          IsPending: 1,
          IsCurrentProcess: 0,
          CanExecute: 0,
          IsFuture: 0,
          IsUserAuthorized: 1,
        },
      ]);
    } catch (error) {
      console.error("Get discharge process error:", error);

      setIsDischargeInitiated(false);
      setSteps([]);
    }
  };

  //  initial load
  useEffect(() => {
    if (patient?.VisitId) {
      getDischargeProcessLists();
    } else {
      setIsDischargeInitiated(false);
      setSteps([]);
    }
  }, [patient?.VisitId, updatedIpdPatientDetails]);

  //   initial discharge

  const initiateDischargeHandler = async () => {
    if (!patient?.VisitId) {
      showError("Visit information is not available");
      return;
    }

    try {
      setIsInitiating(true);

      const resp = await fetchApi(
        "POST",
        ENDPOINTS.INITIALIZE_PATIENT_DISCHARGE_PROCESS,
        {
          corporateId: patient?.CorporateId,
          visitId: patient?.VisitId,
          branchId,
        },
        {},
        {
          component: "DischargeProcess",
        }
      );

      if (!resp?.result) {
        showError(resp?.message ?? "Failed to initiate discharge");
        return;
      }

      showSuccess(resp?.message ?? "Discharge initiated successfully");

      await getDischargeProcessLists();
    } catch (error) {
      console.error("Initiate discharge error:", error);

      showError("Something went wrong while initiating discharge");
    } finally {
      setIsInitiating(false);
    }
  };

  // completed steps

  const completedSteps = useMemo(() => {
    return steps.filter(step => Number(step?.IsCompleted) === 1).length;
  }, [steps]);

  // current step

  // const currentStep = useMemo(() => {
  //   return steps.find(step => Number(step?.IsCurrentProcess) === 1);
  // }, [steps]);

  //  progress

  const progressPercentage = useMemo(() => {
    if (!steps.length) {
      return 0;
    }

    return Math.round((completedSteps / steps.length) * 100);
  }, [completedSteps, steps.length]);

  //   all completed
  const isAllCompleted = allProcessCompleted && canDischarge;

  //   step status
  const getStepStatus = (
    step: DischargeProcessStepItem
  ): "completed" | "current" | "locked" | "future" | "unAuthorized" => {
    if (Number(step?.IsCompleted) === 1) {
      return "completed";
    }

    if (Number(step?.IsUserAuthorized) === 0) {
      return "unAuthorized";
    }

    if (Number(step?.IsCurrentProcess) === 1) {
      return "current";
    }

    if (Number(step?.IsFuture) === 1) {
      return "future";
    }

    return "locked";
  };

  //   step icons

  const getStepIcon = (step: DischargeProcessStepItem) => {
    const processName = step?.ProcessName?.toLowerCase() ?? "";

    if (processName.includes("nursing")) {
      return <Stethoscope size={18} />;
    }

    if (processName.includes("medical")) {
      return <Stethoscope size={18} />;
    }

    if (processName.includes("billing")) {
      return <FileCheck2 size={18} />;
    }

    if (processName.includes("discharge")) {
      return <ShieldCheck size={18} />;
    }

    if (processName.includes("unAuthorized") || processName.includes("unauthorized")) {
      return <Lock size={18} />;
    }

    return <FileCheck2 size={18} />;
  };

  //   mark step handler

  const markStepCompleteHandler = async (step: DischargeProcessStepItem) => {
    if (Number(step?.IsUserAuthorized) === 0) {
      showWarning("You are unauthorized to complete this step.");
      return;
    }

    if (Number(step?.IsCurrentProcess) === 1) {
      setOpenAddRemark(true);
      setRenderAddRemark(true);
      return;
    }
    setSteps(prevSteps => {
      const currentIndex = prevSteps.findIndex(
        item => item?.DischargeProcessId === step?.DischargeProcessId
      );

      if (currentIndex === -1) {
        return prevSteps;
      }

      return prevSteps.map((item, index) => {
        // Current step -> Completed
        if (index === currentIndex) {
          return {
            ...item,
            IsCompleted: 1,
            IsCurrentProcess: 0,
          };
        }

        // Next step -> Current
        if (index === currentIndex + 1) {
          return {
            ...item,
            IsCompleted: 0,
            IsCurrentProcess: 1,
          };
        }

        return item;
      });
    });

    showSuccess(`${step?.ProcessName} completed successfully`);
  };

  // toggle step details

  const toggleStepDetails = (stepId: number) => {
    setExpandedStep(prev => (prev === stepId ? null : stepId));
  };

  //step action icon
  const renderStepStatusIcon = (
    status: "completed" | "current" | "locked" | "future" | "unAuthorized"
  ) => {
    if (status === "completed") {
      return (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-green-500 text-white shadow-sm">
          <Check size={11} strokeWidth={3} />
        </span>
      );
    }

    if (status === "locked" || status === "future") {
      return (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-gray-400 text-white shadow-sm">
          <LockKeyhole size={10} />
        </span>
      );
    }

    if (status === "unAuthorized") {
      return (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 text-white shadow-sm">
          <Lock size={10} />
        </span>
      );
    }

    return null;
  };

  //  step action button
  const renderStepActionButton = (
    step: DischargeProcessStepItem,
    status: "completed" | "current" | "locked" | "future" | "unAuthorized"
  ) => {
    //    completed

    // if (status === "completed") {
    //   return (
    //     <button
    //       type="button"
    //       disabled
    //       className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-md border border-green-200 bg-green-50 px-3 py-1.5 text-[10px] font-semibold text-green-700 cursor-default"
    //     >
    //       <Check size={12} />
    //       Completed
    //     </button>
    //   );
    // }

    // current

    if (status === "current") {
      return (
        <button
          type="button"
          onClick={event => {
            event.stopPropagation();

            markStepCompleteHandler(step);
          }}
          className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-[10px] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md active:scale-95"
        >
          <Check size={12} />
          Complete
        </button>
      );
    }
  };

  // discharge process type handler
  const dischargeProcessSelectHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    setDischargeType(selectedValue);
  };

  return (
    <div className="w-full overflow-hidden">
      {/* before discharge initiation */}

      {!isDischargeInitiated ? (
        <div className="flex min-h-80 items-center justify-center px-1 py-2 sm:px-2 sm:py-2">
          <div className="w-full max-w-lg text-center">
            {/* Icon */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 sm:h-16 sm:w-16">
              <FileCheck2 size={28} className="sm:hidden" />

              <FileCheck2 size={30} className="hidden sm:block" />
            </div>

            {/* Heading */}
            <h3 className="mt-5 text-base font-semibold text-gray-800 sm:text-lg">
              Ready to initiate discharge
            </h3>

            {/* Description */}
            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-gray-500 sm:text-sm sm:leading-6">
              Start the discharge workflow to begin the required billing, nursing and medical
              clearance process.
            </p>

            {/* Initiate Button */}
            <button
              type="button"
              onClick={initiateDischargeHandler}
              disabled={isInitiating}
              className="save-btn mt-5 inline-flex w-full items-center justify-center gap-2 sm:w-auto"
            >
              <PlayCircle size={17} />

              {isInitiating ? "Initiating Discharge..." : "Initiate Discharge"}
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full">
          {/* process flow */}
          <div className="rounded-xl border border-gray-200 p-4 sm:p-5">
            {/* Flow Header */}
            {/*   <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between ">
               <div>
                <h3 className="text-xs font-bold uppercase tracking-wide text-gray-700 sm:text-sm">
                  Discharge Process Flow
                </h3>

                <p className="mt-1 text-[11px] text-gray-500 sm:text-xs">
                  {completedSteps} of {steps.length} steps completed
                </p>
              </div> */}

            {/* Percentage */}
            {/* <div className="self-start rounded-full bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm sm:self-auto">
                {progressPercentage}%
              </div> 
            </div>*/}

            {/* Progress Bar */}
            <div className="mb-6 h-1.5  w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-500"
                style={{
                  width: `${progressPercentage}%`,
                }}
              />
            </div>

            {/* desktop flow process */}

            <div className="hidden lg:flex lg:items-start lg:gap-0 pb-3">
              {steps.map((step, index) => {
                const status = getStepStatus(step);

                const isLast = index === steps.length - 1;

                return (
                  <div
                    key={`${step?.DischargeProcessId}-${index}`}
                    className="flex min-w-0 flex-1 items-start"
                  >
                    {/* step count */}
                    <div className="flex min-w-0 flex-1 flex-col items-center text-center">
                      {/* Icon */}
                      {/* <div
                        className={`flex h-11 w-11 items-center justify-center rounded-full border-2 shadow-sm transition-all duration-200 ${
                          status === "completed"
                            ? "border-green-500 bg-green-50 text-green-600"
                            : status === "current"
                              ? "border-blue-500 bg-blue-50 text-blue-600 shadow-blue-100"
                              : "border-gray-300 bg-white text-gray-400"
                        }`}
                      >
                        <i
                          className={`${step?.IconClass || "fa-solid fa-circle"} text-lg`}
                          aria-hidden="true"
                        />
                      </div> */}
                      <div
                        className={`relative flex h-11 w-11 items-center justify-center rounded-full border-2 shadow-sm transition-all duration-200 ${
                          status === "completed"
                            ? "border-green-500 bg-green-50 text-green-600"
                            : status === "current"
                              ? "border-blue-500 bg-blue-50 text-blue-600 shadow-blue-100"
                              : status === "unAuthorized"
                                ? "border-red-300 bg-red-50 text-red-500"
                                : "border-gray-300 bg-white text-gray-400"
                        }`}
                      >
                        <i
                          className={`${step?.IconClass || "fa-solid fa-circle"} text-lg`}
                          aria-hidden="true"
                        />

                        {/* Status indicator */}
                        {renderStepStatusIcon(status)}
                      </div>

                      {/* Step Number */}
                      <span className="mt-1 text-[9px] font-medium text-gray-400">
                        Step {step?.DischargeProcessStep || index + 1}
                      </span>

                      {/* Step Name */}
                      <p
                        className={`mt-1 max-w-32 text-xs font-semibold leading-tight ${
                          status === "locked" ? "text-gray-400" : "text-gray-700"
                        }`}
                      >
                        {step?.ProcessName?.split(" ").map((word, index) => (
                          <span key={index} className="block">
                            {word}
                          </span>
                        ))}
                      </p>

                      {/* Status Badge 
                      <span
                        className={`mt-1  rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          status === "completed"
                            ? "bg-green-50 text-green-600"
                            : status === "current"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-gray-100 text-gray-400"
                        }
                          `}
                      >
                        {status === "completed"
                          ? "Completed"
                          : status === "current"
                            ? "Current"
                            : "Locked"}
                      </span>
                       */}

                      {/* mark button */}
                      {renderStepActionButton(step, status)}
                    </div>

                    {/* connector */}

                    {!isLast && (
                      <div className="mt-5 h-0.5 flex-1 bg-gray-200">
                        <div
                          className={`h-full w-0 transition-all duration-500 ${
                            status === "completed" ? "w-full bg-green-500" : "w-0"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* mobile / tablet process flow */}

            <div className="space-y-2 lg:hidden">
              {steps.map((step, index) => {
                const status = getStepStatus(step);

                const isLast = index === steps.length - 1;

                return (
                  <div
                    key={`${step?.DischargeProcessId}-mobile-${index}`}
                    className="relative flex items-center rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition hover:border-gray-200"
                  >
                    {/* step icon */}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                        status === "completed"
                          ? "border-green-500 bg-green-50 text-green-600"
                          : status === "current"
                            ? "border-blue-500 bg-blue-50 text-blue-600"
                            : "border-gray-300 bg-gray-50 text-gray-400"
                      }
                        `}
                    >
                      {status === "completed" ? (
                        <Check size={14} />
                      ) : status === "locked" ? (
                        <LockKeyhole size={14} />
                      ) : (
                        getStepIcon(step)
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="ml-3 min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-gray-700 sm:text-sm">
                        {index + 1}. {step?.ProcessName}
                      </p>

                      <span
                        className={`
                            text-[10px]
                            font-medium

                            ${
                              status === "completed"
                                ? "text-green-600"
                                : status === "current"
                                  ? "text-blue-600"
                                  : "text-gray-400"
                            }
                          `}
                      >
                        {status === "completed"
                          ? "Completed"
                          : status === "current"
                            ? "Current Step"
                            : "Locked"}
                      </span>

                      {/* mobile mark button */}
                      <div>{renderStepActionButton(step, status)}</div>
                    </div>

                    {/* Arrow */}
                    {!isLast && (
                      <ChevronRight
                        size={15}
                        className="
                            ml-2
                            shrink-0
                            text-gray-300
                          "
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* final discharge or discharged */}

          {patient?.IsDischarged ? (
            // patient discharged
            // <div className="mt-1.5 flex w-full flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-2 py-2 text-center shadow-sm">
            //   {/* Success Icon
            //   <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-green-200 bg-green-100 shadow-sm">
            //     <i className="fa-solid fa-circle-check text-4xl text-green-600"></i>
            //   </div>
            //   */}

            //   {/* Heading */}
            //   <h2 className="mb-1 text-xl font-bold text-gray-800">Discharge Process Completed</h2>

            //   {/* Description */}
            //   <p className="mb-0 text-sm text-gray-500">
            //     The patient has been successfully discharged and all formalities are finalized.
            //   </p>
            // </div>
            <></>
          ) : (
            <div className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
              {/* discharge in process */}
              <div className="flex flex-col gap-3">
                {/* Top content */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Information */}
                  <div className="flex min-w-0 items-start gap-2">
                    {isAllCompleted ? (
                      <ShieldCheck size={18} className="mt-0.5 shrink-0 text-green-600" />
                    ) : (
                      <Clock3 size={18} className="mt-0.5 shrink-0 text-gray-400" />
                    )}

                    <div>
                      <p className="text-xs font-semibold text-gray-700 sm:text-sm">
                        {isAllCompleted ? "Ready For Discharge." : "Final discharge is locked."}
                      </p>

                      <p className="mt-0.5 text-xs text-gray-500">
                        {isAllCompleted
                          ? "Select discharge type to view and complete the required details."
                          : "Complete all required steps before final discharge."}
                      </p>
                    </div>
                  </div>

                  {/* Discharge Details */}
                  {(isAllCompleted || Number(canDischarge) === 1) && (
                    <div className="form-grid-3">
                      <InputField>
                        <select
                          className="input-field lg:max-h-13 lg:max-w-35"
                          onChange={dischargeProcessSelectHandler}
                        >
                          <option value="">--Select--</option>

                          {dischargeProcessTypeList.map((d: PickMasterItem) => (
                            <option key={d?.key} value={d?.key}>
                              {d?.value}
                            </option>
                          ))}
                        </select>
                      </InputField>

                      <InputField>
                        <CustomDateInput
                          className="input-field lg:max-h-13 lg:max-w-35"
                          value={dischargeDate}
                          onChange={setDischargeDate}
                          min={minDate}
                          max={maxDate}
                        />
                      </InputField>

                      <InputField>
                        <CustomTimePicker
                          className="lg:max-h-13 lg:max-w-35"
                          value={dischargeTime}
                          onChange={setDischargeTime}
                        />
                      </InputField>

                      {/* <p className="whitespace-nowrap text-xs text-gray-600 sm:text-sm">
                        <span className="font-semibold">Discharge Date & Time:</span>{" "}
                        {patient?.DischargeDate || "--"} & {patient?.DischargeTime || "--"}
                      </p> */}
                    </div>
                  )}

                  {/* Final Button */}
                  <button
                    type="button"
                    disabled={
                      (!isAllCompleted && Number(canDischarge) !== 1) ||
                      Number(patient?.IsDischarged) === 1
                    }
                    className={`flex w-full items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition sm:w-auto ${
                      (isAllCompleted || Number(canDischarge) === 1) &&
                      Number(patient?.IsDischarged) !== 1
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "cursor-not-allowed border border-gray-200 bg-white text-gray-400"
                    }`}
                  >
                    <ShieldCheck size={16} />

                    {Number(patient?.IsDischarged) === 1
                      ? "Discharged"
                      : isAllCompleted || Number(canDischarge) === 1
                        ? "Ready For Discharge"
                        : "Discharge Pending"}
                  </button>
                </div>

                {/* discharge types */}
                {(isAllCompleted || Number(canDischarge) === 1) &&
                dischargeType === dischargeProcessType?.NORMAL ? (
                  <NormalDischargeDetails
                    patientDetails={patient}
                    dischargeDate={dischargeDate}
                    dischargeTime={dischargeTime}
                    refreshDischargeProcess={getDischargeProcessLists}
                  />
                ) : dischargeType === dischargeProcessType?.LAMA_DAMA ? (
                  <LamaDamaDischargeDetails
                    patientDetails={patient}
                    dischargeDate={dischargeDate}
                    dischargeTime={dischargeTime}
                    refreshDischargeProcess={getDischargeProcessLists}
                  />
                ) : dischargeType === dischargeProcessType?.REFERRAL ? (
                  <ReferralDischargeDetails
                    patientDetails={patient}
                    dischargeDate={dischargeDate}
                    dischargeTime={dischargeTime}
                    refreshDischargeProcess={getDischargeProcessLists}
                  />
                ) : dischargeType === dischargeProcessType?.ABSCONDED ? (
                  <AbscondedDischargeDetails
                    patientDetails={patient}
                    dischargeDate={dischargeDate}
                    dischargeTime={dischargeTime}
                    refreshDischargeProcess={getDischargeProcessLists}
                  />
                ) : dischargeType === dischargeProcessType?.DEATH ? (
                  <DeathDischargeDetails
                    patientDetails={patient}
                    dischargeDate={dischargeDate}
                    dischargeTime={dischargeTime}
                    refreshDischargeProcess={getDischargeProcessLists}
                  />
                ) : null}
              </div>
            </div>
          )}

          {/*table */}
          <div className="mt-1.5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
            {/* action history */}

            <div className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white">
              {/* Header */}
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                <h3 className="text-xs font-bold uppercase tracking-wide text-gray-700 sm:text-sm">
                  Process Details & Action History
                </h3>

                <p className="mt-0.5 text-[11px] text-gray-500 sm:text-xs">
                  Discharge workflow activity
                </p>
              </div>

              {/* desktop history table */}

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-250 border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/70">
                      <th className="px-3 py-3 text-left text-[11px] font-semibold text-gray-500">
                        Step No.
                      </th>

                      <th className="px-3 py-3 text-left text-[11px] font-semibold text-gray-500">
                        Process Step
                      </th>

                      <th className="px-3 py-3 text-left text-[11px] font-semibold text-gray-500">
                        Status
                      </th>

                      <th className="px-3 py-3 text-left text-[11px] font-semibold text-gray-500">
                        Completed By
                      </th>

                      <th className="px-3 py-3 text-left text-[11px] font-semibold text-gray-500">
                        Completed On
                      </th>

                      <th className="px-3 py-3 text-left text-[11px] font-semibold text-gray-500">
                        Remarks
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {steps
                      .slice()
                      .reverse()
                      .map((step, index) => {
                        const status = getStepStatus(step);

                        return (
                          <>
                            <tr
                              key={`${step?.DischargeProcessId}-row`}
                              className={`cursor-pointer border-b border-gray-100 transition hover:bg-gray-50 ${status === "current" ? "bg-blue-50/30" : ""}`}
                            >
                              {/* Step No */}
                              <td className="w-16 px-3 py-3 align-top">
                                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 text-xs font-semibold text-gray-600">
                                  {step?.DischargeProcessStep || index + 1}
                                </div>
                              </td>

                              {/* Process */}
                              <td className="min-w-48 px-3 py-3 align-top">
                                <div className="flex items-start gap-2">
                                  <div
                                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                      status === "completed"
                                        ? "bg-green-50 text-green-600"
                                        : status === "current"
                                          ? "bg-blue-50 text-blue-600"
                                          : "bg-gray-100 text-gray-400"
                                    }`}
                                  >
                                    <i
                                      className={`${step?.IconClass || "fa-solid fa-circle"} text-sm`}
                                      aria-hidden="true"
                                    />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-gray-800 mt-3">
                                      {step?.ProcessName || "-"}
                                    </p>

                                    {/* <p className="mt-0.5 text-[10px] text-gray-400">
                                    {step?.ProcessKey || "-"}
                                  </p> */}
                                  </div>
                                </div>
                              </td>

                              {/* Status */}
                              <td className="px-3 py-3 align-top">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${
                                    status === "completed"
                                      ? "bg-green-50 text-green-700"
                                      : status === "current"
                                        ? "bg-blue-50 text-blue-700"
                                        : "bg-gray-100 text-gray-400"
                                  }
                                  `}
                                >
                                  {status === "completed" ? <Check size={11} /> : null}

                                  {status === "completed"
                                    ? "Completed"
                                    : status === "current"
                                      ? "Current"
                                      : "Locked"}
                                </span>
                              </td>

                              {/* started By */}

                              <td className="px-3 py-3 align-top">
                                <div className="text-xs font-medium text-gray-700">
                                  {step?.CompletedBy}
                                </div>
                              </td>

                              <td className="px-3 py-3 align-top">
                                <div className="text-xs font-medium text-gray-700">
                                  {step?.CompletedOn}
                                </div>
                              </td>

                              {/* Remarks */}
                              <td className="max-w-52 px-3 py-3 align-top">
                                <div className="flex items-start justify-between gap-2">
                                  <span className="line-clamp-2 text-md font-semibold text-gray-500">
                                    {step?.Remarks}
                                  </span>
                                </div>
                              </td>
                            </tr>

                            {/* Expanded Details 
                          {isExpanded && (
                            <tr key={`${step?.DischargeProcessId}-details`}>
                              <td colSpan={6} className="border-b border-gray-100 px-3 pb-3">
                                <div
                                  className={`
                                      rounded-lg
                                      border
                                      p-4

                                      ${
                                        status === "completed"
                                          ? "border-green-100 bg-green-50/50"
                                          : status === "current"
                                            ? "border-blue-100 bg-blue-50/50"
                                            : "border-gray-100 bg-gray-50"
                                      }
                                    `}
                                >
                                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                    <div>
                                      <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                                        Process Key
                                      </p>

                                      <p className="mt-1 text-xs font-medium text-gray-700">
                                        {step?.ProcessKey}
                                      </p>
                                    </div>

                                    <div>
                                      <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                                        Sequence
                                      </p>

                                      <p className="mt-1 text-xs font-medium text-gray-700">
                                        {step?.SequenceNo}
                                      </p>
                                    </div>

                                    <div>
                                      <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                                        Completed By
                                      </p>

                                      <p className="mt-1 text-xs font-medium text-gray-700">
                                        {step?.CompletedBy || "-"}
                                      </p>
                                    </div>

                                    <div>
                                      <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                                        Completed On
                                      </p>

                                      <p className="mt-1 text-xs font-medium text-gray-700">
                                        {step?.CompletedOn || "-"}
                                      </p>
                                    </div>
                                  </div>

                                
                                  {status === "current" && (
                                    <div className="mt-4 border-t border-blue-100 pt-3">
                                      <button
                                        type="button"
                                        onClick={event => {
                                          event.stopPropagation();

                                          markStepCompleteHandler(step);
                                        }}
                                        className="save-btn flex items-center justify-center gap-2"
                                      >
                                        <Check size={15} />
                                        Mark Complete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                            */}
                          </>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* mobile history */}

              <div className="divide-y divide-gray-100 lg:hidden">
                {steps.map((step, index) => {
                  const status = getStepStatus(step);

                  const isExpanded = expandedStep === step?.DischargeProcessId;

                  return (
                    <div key={`${step?.DischargeProcessId}-mobile-card`} className="p-4">
                      {/* Step Header */}
                      <button
                        type="button"
                        onClick={() => toggleStepDetails(step?.DischargeProcessId)}
                        className="w-full text-left"
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                              status === "completed"
                                ? "bg-green-50 text-green-600"
                                : status === "current"
                                  ? "bg-blue-50 text-blue-600"
                                  : "bg-gray-100 text-gray-400"
                            }
                              `}
                          >
                            {status === "completed" ? (
                              <Check size={16} />
                            ) : status === "locked" ? (
                              <LockKeyhole size={15} />
                            ) : (
                              getStepIcon(step)
                            )}
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-semibold text-gray-800">
                                  {index + 1}. {step?.ProcessName}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">{step?.ProcessKey}</p>
                              </div>

                              <span
                                className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${
                                  status === "completed"
                                    ? "bg-green-50 text-green-700"
                                    : status === "current"
                                      ? "bg-blue-50 text-blue-700"
                                      : "bg-gray-100 text-gray-400"
                                }
                                  `}
                              >
                                {status === "completed"
                                  ? "Completed"
                                  : status === "current"
                                    ? "Current"
                                    : status === "future"
                                      ? "Future"
                                      : "Locked"}
                              </span>
                            </div>

                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                {step?.CompletedBy || "Pending"}
                              </span>

                              <ChevronDown
                                size={15}
                                className={`
                                    text-gray-400
                                    transition

                                    ${isExpanded ? "rotate-180" : ""}
                                  `}
                              />
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-[10px] uppercase text-gray-400">Sequence</p>

                              <p className="mt-1 text-xs font-medium text-gray-700">
                                {step?.SequenceNo}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] uppercase text-gray-400">Status</p>

                              <p className="mt-1 text-xs font-medium text-gray-700">{status}</p>
                            </div>

                            <div>
                              <p className="text-[10px] uppercase text-gray-400">Completed By</p>

                              <p className="mt-1 text-xs font-medium text-gray-700">
                                {step?.CompletedBy || "-"}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] uppercase text-gray-400">Date</p>

                              <p className="mt-1 text-xs font-medium text-gray-700">
                                {step?.CompletedOn || "-"}
                              </p>
                            </div>
                          </div>

                          {/* Current action */}
                          {status === "current" && (
                            <button
                              type="button"
                              onClick={() => markStepCompleteHandler(step)}
                              className="save-btn mt-4 flex w-full items-center justify-center gap-2"
                            >
                              <Check size={15} />
                              Complete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* right sidebar */}

            <div className="space-y-4">
              {/* process summary */}

              <div className="rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-200 px-4 py-3">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-blue-700">
                    Process Summary
                  </h3>
                </div>

                <div className="divide-y divide-gray-100">
                  {/* Total */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-xs text-gray-500">Total Steps</span>

                    <span className="text-xs font-semibold text-gray-700">{steps.length}</span>
                  </div>

                  {/* Completed */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-xs text-gray-500">Completed Steps</span>

                    <span className="text-xs font-semibold text-green-600">{completedSteps}</span>
                  </div>

                  {/* Pending */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-xs text-gray-500">Pending Steps</span>

                    <span className="text-xs font-semibold text-amber-600">
                      {Math.max(steps.length - completedSteps, 0)}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-xs text-gray-500">Progress</span>

                    <span className="text-xs font-bold text-gray-700">{progressPercentage}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* add remark */}
      {renderAddRemark && !allProcessCompleted && (
        <AddRemark
          isOpen={openAddRemark}
          onClose={() => {
            setOpenAddRemark(false);
            setRenderAddRemark(false);
          }}
          selectedPatient={patient}
          refreshList={getDischargeProcessLists}
          SetAllProcessCompleted={SetAllProcessCompleted}
          validateDischarge={getValidatePatientDischarge}
          currProcess={getCurrentProcess}
        />
      )}

      {/* loader */}
      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default DischargeProcess;
