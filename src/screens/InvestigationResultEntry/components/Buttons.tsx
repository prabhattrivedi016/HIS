import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { AuthContext } from "@/context/AuthContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useContext, useEffect, useState } from "react";
import { ApprovedDoctorItem } from "../types";

type ButtonAction =
  | "bulkPrint"
  | "previous"
  | "next"
  | "reRun"
  | "deltaCheck"
  | "patientDetails"
  | "addReport"
  | "printReport"
  | "approve"
  | "hold"
  | "save"
  | "close";
const Buttons = ({
  onButtonClick,
  isApprove,
  isResultDone,
  approvedDoctorId,
  onApprovedDoctorChange,
}: {
  onButtonClick: (value: ButtonAction) => void;
  isApprove?: boolean;
  isResultDone?: boolean;
  approvedDoctorId?: number;
  onApprovedDoctorChange?: (doctorId: number) => void;
}) => {
  const { loading, fetchApi } = useGlobalApi();
  const branchId = useContext(AuthContext)?.user?.branchId ?? 1;

  console.log("isApprove", isApprove);
  console.log("isResultDone", isResultDone);
  console.log("approvedDoctorId", approvedDoctorId);

  const [approvedDoctorList, setApprovedDoctorList] = useState<ApprovedDoctorItem[]>([]);
  const getApprovedDoctorList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_MASTER_LIST_BY_BRANCH_ID,
      {},
      {
        params: { branchId, canApproveLabReport: 1, isDoctorUnit: 0 },
      },
      { component: "Buttons - getApprovedDoctorList" }
    );
    setApprovedDoctorList(resp?.data ?? []);
  };

  useEffect(() => {
    getApprovedDoctorList();
  }, []);

  return (
    <div
      className="fixed bottom-0 right-0 z-20 bg-white border-t border-gray-200 shadow-lg px-2 py-2"
      style={{ left: "var(--app-sidebar-width, 0px)" }}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left */}
        <div className="flex shrink-0 gap-2">
          <button type="button" className="save-btn" onClick={() => onButtonClick("bulkPrint")}>
            Bulk Print
          </button>
        </div>

        {/* Right */}
        <div className="flex flex-nowrap items-center justify-end gap-2 overflow-x-auto">
          <button type="button" className="prevNext-btn" onClick={() => onButtonClick("previous")}>
            <i className="fa-solid fa-chevron-left"></i>
            Previous
          </button>

          <button type="button" className="prevNext-btn" onClick={() => onButtonClick("next")}>
            Next
            <i className="fa-solid fa-chevron-right"></i>
          </button>

          {/* <button type="button" className="save-btn" onClick={() => onButtonClick("reRun")}>
            Re-Run
          </button> */}

          <button type="button" className="save-btn" onClick={() => onButtonClick("deltaCheck")}>
            Delta Check
          </button>

          <button
            type="button"
            className="save-btn"
            onClick={() => onButtonClick("patientDetails")}
          >
            Patient Details
          </button>

          <button type="button" className="save-btn" onClick={() => onButtonClick("addReport")}>
            Add Report
          </button>

          {isResultDone === true && (
            <>
              <button
                type="button"
                className="save-btn"
                onClick={() => onButtonClick("printReport")}
              >
                Print Report
              </button>

              {isApprove === false && (
                <InputField>
                  <select
                    className="input-field min-w-50"
                    value={Number(approvedDoctorId) || 0}
                    onChange={e => onApprovedDoctorChange?.(Number(e.target.value) || 0)}
                  >
                    <option value={0}>Select Approved by</option>
                    {approvedDoctorList.map(doctor => (
                      <option key={doctor.doctorId} value={doctor.doctorId}>
                        {doctor.name}
                      </option>
                    ))}
                  </select>
                </InputField>
              )}

              <button
                type="button"
                className={isApprove === false ? "approve-btn" : "un-approve-btn"}
                onClick={() => onButtonClick("approve")}
              >
                {isApprove === false ? "Approve" : "Un-Approve"}
              </button>

              <button
                type="button"
                disabled={isApprove}
                className={isApprove ? "disabled-btn" : "hold-btn"}
                onClick={() => onButtonClick("hold")}
              >
                Hold
              </button>
            </>
          )}

          <button
            type="button"
            className={isApprove ? "disabled-btn" : "save-btn"}
            onClick={() => onButtonClick("save")}
          >
            Save
          </button>

          <button type="button" className="cancel-button" onClick={() => onButtonClick("close")}>
            Close
          </button>
        </div>
      </div>

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default Buttons;
