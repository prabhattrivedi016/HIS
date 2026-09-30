import CentralPopup from "@/components/centralPopup";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { MessageSquareText } from "lucide-react";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";

import { CurrentProcessItem, IpdPatientItem, OtProcessCurrentStepItem } from "../types";

interface AddRemarkProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPatient: IpdPatientItem;
  refreshList: () => void;
  SetAllProcessCompleted: Dispatch<SetStateAction<boolean>>;
  validateDischarge: () => void;
  currProcess: () => void;
  processType: "otProcess" | "dischargeProcess";
}

const AddRemark = ({
  isOpen,
  onClose,
  selectedPatient,
  refreshList,
  SetAllProcessCompleted,
  validateDischarge,
  currProcess,
  processType,
}: AddRemarkProps) => {
  const { loading, fetchApi } = useGlobalApi();

  const [remark, setRemark] = useState<string>("");

  const [currentProcess, setCurrentProcess] = useState<CurrentProcessItem | null>(null);

  const [otCurrentProcess, setOtCurrentProcess] = useState<OtProcessCurrentStepItem | null>(null);

  //  Get current discharge process
  const getCurrentProcess = useCallback(async () => {
    if (!selectedPatient?.VisitId) {
      return;
    }

    try {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_CURRENT_DISCHARGE_PROCESS,
        {},
        {
          params: {
            visitId: selectedPatient.VisitId,
          },
        },
        {
          component: "AddRemark",
        }
      );

      if (!resp?.result) {
        setCurrentProcess(null);
        SetAllProcessCompleted(false);

        showError(resp?.message ?? "Failed to get current discharge process");

        return;
      }

      SetAllProcessCompleted(resp?.data?.AllProcessesCompleted ?? false);

      setCurrentProcess(resp?.data ?? null);
    } catch (error) {
      console.error("Get current discharge process error:", error);

      setCurrentProcess(null);
      SetAllProcessCompleted(false);

      showError("Failed to get current discharge process");
    }
  }, [selectedPatient?.VisitId, SetAllProcessCompleted]);

  // Get current OT process
  const getOtCurrentProcess = useCallback(async () => {
    if (!selectedPatient?.VisitId) {
      return;
    }

    try {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_CURRENT_OT_PROCESS,
        {},
        {
          params: {
            visitId: selectedPatient.VisitId,
          },
        },
        {
          component: "AddRemark",
        }
      );

      if (!resp?.result) {
        setOtCurrentProcess(null);
        SetAllProcessCompleted(false);

        showError(resp?.message ?? "Failed to get current OT process");

        return;
      }

      SetAllProcessCompleted(resp?.data?.AllProcessesCompleted ?? false);

      setOtCurrentProcess(resp?.data ?? null);
    } catch (error) {
      console.error("Get current OT process error:", error);

      setOtCurrentProcess(null);
      SetAllProcessCompleted(false);

      showError("Failed to get current OT process");
    }
  }, [selectedPatient?.VisitId, SetAllProcessCompleted]);

  //  Load current process when popup opens
  useEffect(() => {
    if (!isOpen || !selectedPatient?.VisitId) {
      return;
    }

    // Reset remark whenever popup opens
    setRemark("");

    // Reset previous process data
    setCurrentProcess(null);
    setOtCurrentProcess(null);

    if (processType === "otProcess") {
      getOtCurrentProcess();
    } else {
      getCurrentProcess();
    }
  }, [isOpen, selectedPatient?.VisitId, processType, getCurrentProcess, getOtCurrentProcess]);

  const handleClear = () => {
    if (loading) {
      return;
    }

    setRemark("");
  };

  //  clsoe popup
  const handleClose = () => {
    if (loading) {
      return;
    }

    setRemark("");
    setCurrentProcess(null);
    setOtCurrentProcess(null);

    onClose();
  };

  //  Submit handler
  const handleSubmit = async () => {
    if (loading) {
      return;
    }

    // Patient validation
    if (!selectedPatient?.VisitId) {
      showWarning("Patient is required");
      return;
    }

    // Remark validation
    const trimmedRemark = remark.trim();

    try {
      //  DISCHARGE PROCESS
      if (processType === "dischargeProcess") {
        const dischargeProcessId = currentProcess?.DischargeProcessId;

        if (!dischargeProcessId) {
          showWarning("Current discharge process is not available");
          return;
        }

        //   Start discharge process
        const startResponse = await fetchApi(
          "PATCH",
          ENDPOINTS.START_PATIENT_DISCHARGE_PROCESS,
          {
            visitId: selectedPatient.VisitId,
            dischargeProcessId,
          },
          {},
          {
            component: "AddRemark",
          }
        );

        if (!startResponse?.result) {
          showError(startResponse?.message ?? "Failed while starting the discharge process");

          return;
        }

        //  Complete discharge process
        const completeResponse = await fetchApi(
          "PATCH",
          ENDPOINTS.COMPLETE_PATIENT_DISCHARGE_PROCESS,
          {
            visitId: selectedPatient.VisitId,
            dischargeProcessId,
            remarks: trimmedRemark,
          },
          {},
          {
            component: "AddRemark",
          }
        );

        if (!completeResponse?.result) {
          showError(completeResponse?.message ?? "Failed to complete the discharge process");

          return;
        }

        showSuccess(completeResponse?.message ?? "Discharge process completed successfully");
      }

      //  OT PROCESS
      else {
        const otProcessId = otCurrentProcess?.OTProcessId;

        if (!otProcessId) {
          showWarning("Current OT process is not available");
          return;
        }

        //  Complete OT process
        const response = await fetchApi(
          "PATCH",
          ENDPOINTS.COMPLETE_PATIENT_OT_PROCESS,
          {
            visitId: selectedPatient.VisitId,
            otProcessId,
            remarks: trimmedRemark,
          },
          {},
          {
            component: "AddRemark",
          }
        );

        if (!response?.result) {
          showError(response?.message ?? "Failed to complete OT process");

          return;
        }

        showSuccess(response?.message ?? "OT process completed successfully");
      }

      refreshList?.();
      validateDischarge?.();
      currProcess?.();

      setRemark("");
      setCurrentProcess(null);
      setOtCurrentProcess(null);

      onClose();
    } catch (error) {
      console.error("AddRemark handleSubmit error:", error);

      showError("Something went wrong while completing the process");
    }
  };

  console.log("currentProcess", currentProcess);
  console.log("otCurrentProcess", otCurrentProcess);

  //  Current process name
  const currentProcessName =
    processType === "dischargeProcess"
      ? currentProcess?.ProcessName
      : otCurrentProcess?.ProcessName;

  // Current process availability
  const hasCurrentProcess =
    processType === "dischargeProcess"
      ? Boolean(currentProcess?.DischargeProcessId)
      : Boolean(otCurrentProcess?.OTProcessId);

  const canSubmit = !loading && hasCurrentProcess && remark.trim().length > 0;

  return (
    <CentralPopup isOpen={isOpen} onClose={onClose} title="Add Remark" className="w-full max-w-lg">
      <div className="w-full">
        <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-3 sm:p-4">
          {/* Icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm sm:h-11 sm:w-11">
            <MessageSquareText size={19} />
          </div>

          {/* Process Details */}
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-500">
              Current Step
            </p>

            <h3 className="mt-1 truncate text-sm font-semibold text-gray-800 sm:text-base">
              {currentProcessName || "Current Process"}
            </h3>

            {!hasCurrentProcess && !loading && (
              <p className="mt-1 text-xs text-red-500">Current process is not available.</p>
            )}
          </div>
        </div>

        <div className="mt-3">
          <InputField label="Remarks">
            <textarea
              id="dischargeRemark"
              value={remark}
              onChange={e => setRemark(e.target.value)}
              placeholder="Enter remark for completing this process..."
              rows={3}
              maxLength={500}
              disabled={loading}
              className="input-field resize-none"
            />
          </InputField>

          <div className="mt-1 text-right text-[10px] text-gray-400">{remark.length}/500</div>
        </div>

        {/* buttons */}
        <div className="mt-3 flex items-center justify-end gap-2">
          <button type="button" onClick={handleClose} disabled={loading} className="cancel-button">
            Cancel
          </button>

          <button type="button" onClick={handleSubmit} className="save-btn">
            Save
          </button>
        </div>

        {loading && <CustomLoader isLoading={loading} />}
      </div>
    </CentralPopup>
  );
};

export default AddRemark;
