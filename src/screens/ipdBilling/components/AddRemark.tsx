import CentralPopup from "@/components/centralPopup";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { MessageSquareText } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { CurrentProcessItem, IpdPatientItem } from "../types";

interface AddRemarkProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPatient: IpdPatientItem;
  refreshList: () => void;
  SetAllProcessCompleted: Dispatch<SetStateAction<boolean>>;
  validateDischarge: () => void;
  currProcess: () => void;
}

const AddRemark = ({
  isOpen,
  onClose,
  selectedPatient,
  refreshList,
  SetAllProcessCompleted,
  validateDischarge,
  currProcess,
}: AddRemarkProps) => {
  console.log("selectedPatient", selectedPatient);

  const { loading, fetchApi } = useGlobalApi();
  const [remark, setRemark] = useState("");
  const [currentProcess, setCurrentProcess] = useState<CurrentProcessItem | null>(null);

  //   get current process
  const getCurrentProcess = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CURRENT_DISCHARGE_PROCESS,
      {},
      { params: { visitId: selectedPatient?.VisitId } },
      { component: "AddRemark" }
    );
    console.log("resp", resp?.data);

    SetAllProcessCompleted(resp?.data?.AllProcessesCompleted ?? false);
    setCurrentProcess(resp?.data ?? {});
  };

  useEffect(() => {
    if (isOpen && selectedPatient) {
      getCurrentProcess();
    }
  }, [selectedPatient]);

  const handleClear = () => {
    setRemark("");
  };

  const handleSubmit = async () => {
    if (!selectedPatient || remark.trim() === "") {
      showWarning("Remarks is required");
      return;
    }
    const resp = await fetchApi("PATCH", ENDPOINTS.START_PATIENT_DISCHARGE_PROCESS, {
      visitId: selectedPatient?.VisitId,
      dischargeProcessId: currentProcess?.DischargeProcessId,
    });
    if (!resp?.result) {
      showError(resp?.message ?? "Failed while discharging this process");
      return;
    }
    const response = await fetchApi("PATCH", ENDPOINTS.COMPLETE_PATIENT_DISCHARGE_PROCESS, {
      visitId: selectedPatient?.VisitId,
      dischargeProcessId: currentProcess?.DischargeProcessId,
      remarks: remark,
    });
    if (!response?.result) {
      showError(response?.message ?? "Failed to discharge this process");
      return;
    }
    showSuccess(response?.message ?? "Discharged successfully");
    refreshList?.();
    validateDischarge?.();
    currProcess?.();
    onClose();
  };

  return (
    <CentralPopup
      isOpen={isOpen}
      onClose={handleClear}
      title="Add Remark"
      className="w-full max-w-lg"
    >
      <div className="w-full">
        {/* header */}

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

            <h3 className="text-sm font-semibold text-gray-800 mt-1 truncate sm:text-base">
              {currentProcess?.ProcessName}
            </h3>
          </div>
        </div>

        {/* remark field */}

        <div className="mt-2">
          <InputField label="Remarks" required>
            <textarea
              id="dischargeRemark"
              value={remark}
              onChange={e => {
                setRemark(e.target.value);
              }}
              placeholder="Enter remark for completing this process..."
              rows={3}
              className="input-field"
            />
          </InputField>
        </div>

        {/* buttons */}

        <div className="flex items-center justify-end gap-2 ">
          <button type="button" onClick={handleClear} className="cancel-button">
            Cancel
          </button>

          <button type="submit" onClick={handleSubmit} className="save-btn">
            Save
          </button>
        </div>
        {loading && <CustomLoader isLoading={loading} />}
      </div>
    </CentralPopup>
  );
};

export default AddRemark;
