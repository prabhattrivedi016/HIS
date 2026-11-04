import { ENDPOINTS } from "@/config/defaults";
import { BranchContext } from "@/context/BranchContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { Printer, X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { useContext, useEffect, useRef, useState } from "react";

type ApprovedDoctor = {
  doctorId: number;
  name: string;
};

type Props = {
  onSaveButtonClick: () => void;
  onApproveButtonClick: () => void;
  onHoldButtonClick: () => void;
  onRejectButtonClick: () => void;
  isApproved: boolean;
  isResultDone: boolean;
  approvedDoctorId: number;
  onApprovedDoctorChange: Dispatch<SetStateAction<number>>;
};

const FooterButton = ({
  onSaveButtonClick,
  onApproveButtonClick,
  onHoldButtonClick,
  onRejectButtonClick,
  isApproved,
  isResultDone,
  approvedDoctorId,
  onApprovedDoctorChange,
}: Props) => {
  const { fetchApi } = useGlobalApi();
  const fetchApiRef = useRef(fetchApi);
  fetchApiRef.current = fetchApi;
  const branchId = useContext(BranchContext)?.branchId;
  const [approvedDoctorList, setApprovedDoctorList] = useState<ApprovedDoctor[]>([]);

  useEffect(() => {
    const getApprovedDoctorList = async () => {
      const resp = await fetchApiRef.current(
        "GET",
        ENDPOINTS.GET_DOCTOR_MASTER_LIST_BY_BRANCH_ID,
        {},
        { params: { branchId, canApproveLabReport: 1, isDoctorUnit: 0 } },
        { component: "SampleResultEntry" }
      );
      setApprovedDoctorList(resp?.data ?? []);
    };

    getApprovedDoctorList();
  }, [branchId]);

  return (
    <div>
      {/* ================= FIXED BOTTOM ACTION BUTTONS BAR ================= */}
      <div className="flex w-full items-center justify-end gap-2 overflow-x-auto rounded-xl border border-gray-200 bg-white p-3 shadow-sm mt-1">
        {/* <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            defaultChecked
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
          />
          <span>Print Report After Authorization</span>
        </label> */}

        <div className="flex min-w-max flex-nowrap items-center justify-end gap-2">
          <button
            onClick={onSaveButtonClick}
            className="flex items-center gap-1 bg-[#0B5394] hover:bg-blue-950 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
          >
            Save
          </button>

          {isResultDone && (
            <>
              {!isApproved && (
                <select
                  className="input-field !h-9 !w-44 !min-w-0 shrink-0 !py-1 text-xs"
                  value={approvedDoctorId}
                  onChange={e => onApprovedDoctorChange(Number(e.target.value))}
                >
                  <option value={0}>Select Approved by</option>
                  {approvedDoctorList.map(doctor => (
                    <option key={doctor.doctorId} value={doctor.doctorId}>
                      {doctor.name}
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={onApproveButtonClick}
                className={`flex items-center gap-1 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer ${
                  isApproved
                    ? "bg-orange-600 hover:bg-orange-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {isApproved ? "Un-Approve" : "Approve"}
              </button>

              <button
                onClick={onHoldButtonClick}
                disabled={isApproved}
                className="flex items-center gap-1 bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                Hold Result
              </button>
            </>
          )}

          <button
            onClick={onRejectButtonClick}
            disabled={isApproved}
            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-red-600"
          >
            <X size={14} /> Reject Sample
          </button>

          <button
            onClick={() => alert("Print Preview")}
            className="flex items-center gap-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
          >
            <Printer size={14} /> Print Preview
          </button>

          {/* <button
            onClick={() => alert("Report Released")}
            className="flex items-center gap-1 bg-[#0B5394] hover:bg-blue-950 text-white text-xs font-semibold px-4 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <Lock size={14} /> Release Report
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default FooterButton;
