import { PatientInvestigationTableHeader } from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import React from "react";
import { createPortal } from "react-dom";

const LRPatientInvestigation = React.memo(({ isOpen, onClose, data }) => {
  const { loading, error, fetchApi } = useGlobalApi();
  return createPortal(
    <div className={`fixed inset-0 z-999 ${isOpen ? "" : "pointer-events-none"}`}>
      <div className="absolute inset-0">
        <div
          className={`drawer-bg-fade ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={onClose}
        />

        <div className={`drawer-layout drawer-bg ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="drawer-title-border">
            <h2 className="drawer-title">Patient Investigation Details</h2>
            <button onClick={onClose} className="drawer-close-btn">
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
                      {[].map((item, idx) => (
                        <tr key={idx} className="table-row">
                          <td className="table-td">{idx + 1}</td>

                          <td className="table-td">{item?.Name || "-"}</td>
                          <td className="table-td">{item?.BillDate || "-"}</td>
                          <td className="table-td">{item?.BillingBy || "-"}</td>
                          <td className="table-td">{item?.SampleCollectedOn || "-"}</td>

                          <td className="table-td">{item?.SampleCollectedBy || "-"}</td>
                          <td className="table-td">{item?.SampleReceivedByDepartmentOn || "-"}</td>
                          <td className="table-td">{item?.Name || "-"}</td>
                          <td className="table-td items-center">{item?.SampleTypeList || "-"}</td>
                          <td className="table-td">{item?.color || "-"}</td>
                          <td className="table-td">{item?.Barcode || "-"}</td>
                          <td className="table-td">{item?.ResultDoneOn || "-"}</td>
                          <td className="table-td">{item?.ResultDoneBy || "-"}</td>
                          <td className="table-td">{item?.ApprovedDate || "-"}</td>
                          <td className="table-td">{item?.ReportApprovedBy || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,

    document.body
  );
});

export default LRPatientInvestigation;
