import CentralPopup from "@/components/centralPopup";
import { ENDPOINTS } from "@/config/defaults";
import { BranchContext } from "@/context/BranchContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import React, { useContext, useEffect, useState } from "react";
import { LaboratoryHelpDeskItem, PatientInfo } from "../types";

const PatientInfoPopup = React.memo(
  ({
    isOpen,
    onClose,
    data,
  }: {
    isOpen: boolean;
    onClose: () => void;
    data: LaboratoryHelpDeskItem | null;
  }) => {
    const { loading, error, fetchApi } = useGlobalApi();
    const branchId = useContext(BranchContext)?.branchId;

    const [patientInfo, setPatientInfo] = useState<PatientInfo[]>([]);

    // get patient information
    const getPatientInfo = async () => {
      if (!data?.UHID || !data?.LabNo) return;
      const resolvedVisitId = Number(data?.VisitId);
      if (!resolvedVisitId) return;

      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_PATIENT_INVESTIGATION_DETAILS,
        {},
        {
          params: {
            branchId,
            uhid: data.UHID,
            labNo: data.LabNo,
            visitId: resolvedVisitId,
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

    return (
      <CentralPopup
        title=" Patient Info"
        isOpen={isOpen}
        onClose={onClose}
        className="w-full sm:max-w-md lg:min-w-250"
      >
        <>
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
                        <th className="table-th ">#</th>
                        <th className="table-th ">Investigation Nam</th>
                        <th className="table-th ">Bill Date</th>
                        <th className="table-th ">Billing By</th>
                        <th className="table-th ">Collected By</th>
                        <th className="table-th ">Received Date</th>
                        <th className="table-th ">Received By</th>
                        <th className="table-th ">Rejected Date</th>
                        <th className="table-th ">Rejected By</th>
                        <th className="table-th ">Sample Rejected Reason</th>
                        <th className="table-th ">Result Entered Date</th>
                        <th className="table-th ">Result Entered By</th>
                        <th className="table-th ">Approved Date</th>
                        <th className="table-th ">Approved By</th>
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
                            <td className="table-td">
                              {item?.SampleReceivedByDepartmentOn || "-"}
                            </td>
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
                          <td colSpan={14} className="text-center py-6 text-gray-500">
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
        </>
      </CentralPopup>
    );
  }
);

export default PatientInfoPopup;
