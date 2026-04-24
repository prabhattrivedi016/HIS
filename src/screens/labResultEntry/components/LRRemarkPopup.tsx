import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { LRPatientRemarkTableHeader } from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import { createPortal } from "react-dom";

const LRRemarkPopup = ({ isOpen, onClose, data }) => {
  console.log("data", data);
  const { loading, error, fetchApi } = useGlobalApi();

  useScrollLock(isOpen);

  return createPortal(
    <div className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />
      <div
        className={`central-popup overflow-auto max-h-[calc(100vh-20px)]  lg:min-w-[1000px] ${isOpen ? "opacity-full" : ""}`}
      >
        <div className="popup-header min-w-0">
          <h2 className="popup-helper-text truncate">{"Add Remarks"}</h2>
          <button onClick={onClose} className="close-drawer-btn shrink-0 ml-3">
            ×
          </button>
        </div>
        <div className=" form-grid-2">
          <div className="flex flex-row">
            <h1 className="name-header">UHID : </h1>
            <span className="ml-2">{data?.UHID}</span>
          </div>

          <div className="flex flex-row">
            <h1 className="name-header">Test Name : </h1>
            <span className="ml-2">{data?.Name}</span>
          </div>

          <div className="flex flex-row">
            <h1 className="name-header">Patient Name: </h1>
            <span className="ml-2">{data?.PatientName}</span>
          </div>

          <div className="flex flex-row">
            <h1 className="name-header">Bar Code: </h1>
            <span className="ml-2">{data?.Barcode}</span>
          </div>
        </div>
        <div className="form-grid-4">
          <InputField label="Sample Remark">
            <input type="text" className="input-field" />
          </InputField>

          <InputField label="Enter Remark">
            <input type="text" className="input-field" />
          </InputField>

          <InputField label="Is Internal">
            <input type="text" className="input-field" />
          </InputField>

          {/* Buttons */}
          <div className="flex items-end gap-2 ">
            <button className="save-btn  my-2 w-full  "> Save </button>
            <button className="cancel-btn w-full ">Cancel</button>
          </div>
        </div>
        <div className="table-container ">
          <div className="table-scroll-wrapper ">
            <div className="table-size lg:min-h-60 lg:max-h-60">
              <table className="base-table ">
                <thead className="table-head">
                  <tr>
                    {LRPatientRemarkTableHeader.map((h, index) => (
                      <th key={index} className="table-th ">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {[].length === 0 ? (
                    <tr>
                      <td colSpan={17} className="text-center py-6 text-gray-500">
                        No data found
                      </td>
                    </tr>
                  ) : (
                    [].map((item, idx) => (
                      <tr key={idx} className="table-row">
                        <td className="table-td">{idx + 1}</td>
                        <td className="table-td">{item?.LabNo || "-"}</td>
                        <td className="table-td">{item?.BillDate || "-"}</td>
                        <td className="table-td">{item?.UHID || "-"}</td>
                        <td className="table-td">{item?.PatientName || "-"}</td>
                        <td className="table-td">
                          {item?.CurrentAge || "-"} / {item?.Gender}
                        </td>
                        <td className="table-td">{item?.ClientName || "-"}</td>
                        <td className="table-td">{item?.TotalBalanceAmount || "-"}</td>
                        <td className="table-td">{item?.xv || "-"}</td>
                        <td className="table-td">{item?.sv || "-"}</td>
                        <td className="table-td">{item?.ts || "-"}</td>
                        <td className="table-td">{item?.Name || "-"}</td>
                        <td className="table-td">{item?.Barcode || "-"}</td>
                        <td className="table-td">{item?.DeliveryDate || "-"}</td>
                        <td className="table-td">{item?.ts || "-"}</td>
                        <td className="table-td">{item?.rema || "-"}</td>
                        <td className="table-td">{item?.lastModifiedOn || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {!!loading && <CustomLoader isLoading={loading} />}
      </div>
      ,
    </div>,
    document.body
  );
};

export default LRRemarkPopup;
