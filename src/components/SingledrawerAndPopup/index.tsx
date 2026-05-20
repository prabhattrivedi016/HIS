import { ENDPOINTS } from "@/config/defaults";
import { PatientInvestigationTableHeader } from "@/constants/tableHeaders";
import { AuthContext } from "@/context/AuthContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import { PatientAllInvestigationItem } from "@/screens/InvestigationResultEntry/types";
import { LabResultEntryTableData } from "@/screens/labResultEntry/types";
import { RadiologyTableItem } from "@/screens/resultEntryRadiology/types";
import { SampleManagementTableData } from "@/screens/sampleManagement/types";
import React, { useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import CustomLoader from "../customLoader";
import { PatientInfo } from "./types";

const LabPatientInfo = ({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  data:
    | SampleManagementTableData
    | LabResultEntryTableData
    | RadiologyTableItem
    | PatientAllInvestigationItem
    | null;
}) => {
  const { loading, error, fetchApi } = useGlobalApi();
  const branchId = useContext(AuthContext)?.user?.branchId ?? 1;

  console.log("data", data);

  const [patientInfo, setPatientInfo] = useState<PatientInfo[]>([]);

  // get patient information
  const getPatientInfo = async () => {
    if (!data?.UHID || !data?.LabNo) return;

    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PATIENT_INVESTIGATION_DETAILS,
      {},
      {
        params: {
          branchId,
          uhid: data.UHID,
          labNo: data.LabNo,
          visitId: data.VisitId || data?.VisitNo,
        },
      },
      { component: "SingleDrawerAndPopup" }
    );

    setPatientInfo(resp?.data ?? []);
  };

  useEffect(() => {
    if (isOpen && data?.UHID) {
      getPatientInfo();
    }
  }, [isOpen, data?.UHID]);

  useScrollLock(isOpen);
  return createPortal(
    <div className={`fixed inset-0 z-9999 ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`popup-bg-overlay  ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      <div
        className={`central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] lg:min-w-280 ${isOpen ? "opacity-full" : ""}`}
      >
        <div className="popup-header">
          <h2 className="popup-helper-text">Patient Investigation Details</h2>
          <button onClick={onClose} className="close-drawer-btn">
            ×
          </button>
        </div>

        <div className="card m-1 form-grid-2">
          <div className="flex flex-row">
            <h1 className="name-header">UHID : </h1>
            <span className="ml-2">{data?.UHID}</span>
          </div>

          <div className="flex flex-row">
            <h1 className="name-header">Name : </h1>
            <span className="ml-2">{data?.PatientName}</span>
          </div>

          <div className="flex flex-row">
            <h1 className="name-header">Age / Sex : </h1>
            <span className="ml-2">
              {data?.CurrentAge} / {data?.Gender}
            </span>
          </div>

          <div className="flex flex-row">
            <h1 className="name-header">Lab No: </h1>
            <span className="ml-2">{data?.LabNo}</span>
          </div>

          <div className="flex flex-row">
            <h1 className="name-header">Bar Code: </h1>
            <span className="ml-2">{data?.Barcode}</span>
          </div>

          <div className="flex flex-row">
            <h1 className="name-header">Bill Date: </h1>
            <span className="ml-2">{data?.BillDate}</span>
          </div>
        </div>
        {/* table */}
        <div className=" -mt-3 m-1 lg:min-h-[400px] ">
          <div className="table-container  ">
            <div className="table-scroll-wrapper ">
              <div className="table-size lg:min-h-[400px]">
                <table className="base-table ">
                  <thead className="table-head">
                    <tr>
                      {PatientInvestigationTableHeader.map((h, index) => (
                        <th key={index} className="table-th ">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {patientInfo?.length > 0 ? (
                      patientInfo.map((item, idx) => (
                        <tr key={idx} className="table-row">
                          <td className="table-td">{idx + 1}</td>

                          <td className="table-td max-w-50">{item?.Name || "-"}</td>
                          <td className="table-td">{item?.BillDate || "-"}</td>
                          <td className="table-td">{item?.BillingBy || "-"}</td>
                          <td className="table-td">{item?.SampleCollectedOn || "-"}</td>

                          <td className="table-td">{item?.SampleCollectedBy || "-"}</td>
                          <td className="table-td">{item?.SampleReceivedByDepartmentOn || "-"}</td>
                          <td className="table-td">{item?.SampleReceivedBy || "-"}</td>
                          <td className="table-td items-center">
                            {item?.SampleCollectionRejectedOn || "-"}
                          </td>
                          <td className="table-td">{item?.SampleCollectionRejectedBy || "-"}</td>
                          <td className="table-td">
                            {item?.SampleCollectionRejectionReason || "-"}
                          </td>
                          <td className="table-td">{item?.ResultDoneOn || "-"}</td>
                          <td className="table-td">{item?.ResultDoneBy || "-"}</td>
                          <td className="table-td">{item?.ApprovedDate || "-"}</td>
                          <td className="table-td">{item?.ReportApprovedBy || "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={PatientInvestigationTableHeader.length}
                          className="text-center py-6 text-gray-500"
                        >
                          No Data Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      {!!loading && <CustomLoader isLoading={loading} />}
    </div>,
    document.body
  );
};
export default React.memo(LabPatientInfo);
