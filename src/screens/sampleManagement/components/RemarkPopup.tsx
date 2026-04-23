import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { Status } from "@/constants/constants";
import { SampleRejectionRemarkTableHeader } from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import React, { useEffect, useState } from "react";
import { SampleRejectionRemarkItem } from "../types";

const RemarkPopup = React.memo(({ isOpen, onClose, data }) => {
  console.log("data", data);
  const { loading, fetchApi } = useGlobalApi();

  const [sampleRejectionRemarksList, setSampleRejectionRemarksList] = useState<
    SampleRejectionRemarkItem[]
  >([]);

  //   sample remarks
  const getSampleRemarks = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SAMPLE_REJECTION_REMARKS_MASTER,
      {},
      { params: { isActive: Status?.ACTIVE } },
      { component: "RemarkPopup of sample management" }
    );
    setSampleRejectionRemarksList(resp?.data ?? []);
  };

  useEffect(() => {
    getSampleRemarks();
  }, []);

  useScrollLock(isOpen);
  return (
    <div className={`fixed inset-0 z-999 ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      <div className={`central-popup lg:min-w-300 ${isOpen ? "opacity-full" : ""}`}>
        <div className="popup-header">
          <h2 className="popup-helper-text">Add Remarks</h2>
          <button onClick={onClose} className="close-drawer-btn">
            ×
          </button>
        </div>

        {/* {error ? <ErrorMessage text={error?.message} /> : <></>} */}
        {/* {successMessage ? <SuccessMessage text={successMessage} /> : <></>} */}

        <div className="card m-1 form-grid-2">
          <div className="flex flex-row">
            <h1 className="name-header">UHID : </h1>
            <span className="ml-2">{data?.UHID}</span>
          </div>

          <div className="flex flex-row">
            <h1 className="name-header">Test Name : </h1>
            <span className="ml-2">{data?.Name}</span>
          </div>

          <div className="flex flex-row">
            <h1 className="name-header">Patient Name : </h1>
            <span className="ml-2">{data?.PatientName}</span>
          </div>

          <div className="flex flex-row">
            <h1 className="name-header">Bar Code: </h1>
            <span className="ml-2">{data?.Barcode}</span>
          </div>
        </div>
        {/* form */}
        <div className="form-grid-4 card -mt-3">
          <InputField label="Sample Remark">
            <select className="input-field">
              <option>Select</option>
              {sampleRejectionRemarksList?.map(s => (
                <option key={s?.sampleRejectionRemarksID} value={s?.sampleRejectionRemarksID}>
                  {s?.sampleRejectionRemarks}
                </option>
              ))}
            </select>
          </InputField>
          <InputField label="Enter Remark">
            <input className="input-field" placeholder="Enter Remarks" />
          </InputField>

          <InputField label="Is Internal">
            <select className="input-field">
              <option>No</option>
              <option>Yes</option>
            </select>
          </InputField>
          <div className="flex flex-row gap-3 justify-center items-center -mx-1">
            <button type="submit" className="save-btn">
              Save
            </button>
            <button type="button" className="cancel-button">
              Cancel
            </button>
          </div>
        </div>

        {/* table */}
        <div className=" -mt-3 m-1  ">
          <div className="table-container  ">
            <div className="table-scroll-wrapper ">
              <div className="table-size lg:min-h-60">
                <table className="base-table ">
                  <thead className="table-head">
                    <tr>
                      {SampleRejectionRemarkTableHeader.map((h, index) => (
                        <th key={index} className="table-th ">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {[].length === 0 ? (
                      <tr>
                        <td
                          colSpan={SampleRejectionRemarkTableHeader.length}
                          className="table-empty text-center py-4"
                        >
                          No records found
                        </td>
                      </tr>
                    ) : (
                      [].map((item, idx) => (
                        <tr key={idx} className="table-row">
                          <td className="table-td">{idx + 1}</td>

                          <td className="table-td">{item?.Name || "-"}</td>
                          <td className="table-td">{item?.BillDate || "-"}</td>
                          <td className="table-td">{item?.BillingBy || "-"}</td>
                          <td className="table-td">{item?.SampleCollectedOn || "-"}</td>

                          <td className="table-td">{item?.SampleCollectedBy || "-"}</td>
                          <td className="table-td">{item?.SampleReceivedByDepartmentOn || "-"}</td>
                          <td className="table-td">{item?.Name || "-"}</td>
                          <td className="table-td">{item?.SampleTypeList || "-"}</td>
                          <td className="table-td">{item?.color || "-"}</td>
                          <td className="table-td">{item?.Barcode || "-"}</td>
                          <td className="table-td">{item?.ResultDoneOn || "-"}</td>
                          <td className="table-td">{item?.ResultDoneBy || "-"}</td>
                          <td className="table-td">{item?.ApprovedDate || "-"}</td>
                          <td className="table-td">{item?.ReportApprovedBy || "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? <CustomLoader isLoading={loading} /> : <></>}
    </div>
  );
});
export default RemarkPopup;
