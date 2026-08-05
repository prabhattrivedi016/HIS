import CustomDateInput from "@/components/customDateInput";
import CustomTimePicker from "@/components/timePicker";
import { LaboratoryHelpDeskNotificationTableHeader } from "@/constants/tableHeaders";
import { useScrollLock } from "@/hooks/useScrollLock";
import { createPortal } from "react-dom";
import { LaboratoryHelpDeskItem } from "../types";

const Notification = ({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: LaboratoryHelpDeskItem;
}) => {
  useScrollLock(isOpen);
  return createPortal(
    <div className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      <div
        className={`central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] lg:min-w-250 ${isOpen ? "opacity-full" : ""}`}
      >
        <div className="popup-header min-w-0">
          <h2 className="popup-helper-text truncate">Create Notification</h2>
          <button onClick={onClose} className="close-drawer-btn shrink-0 ml-3">
            x
          </button>
        </div>

        {/* <form className="form-grid-1">
          <InputField label="Upload Document">
            <input type="file" className="file-upload mb-2" />
          </InputField>

          <div className="flex items-end gap-2 ">
            <button className="save-btn  my-2 w-full  "> Upload </button>
            <button className="cancel-btn w-full ">Download</button>
          </div>
        </form> */}
        <div className="card m-1 form-grid-2">
          <div className="flex flex-row">
            <h1 className="name-header">Test Name : </h1>
            <span className="ml-2">{data?.Name}</span>
          </div>

          <div className="flex flex-row">
            <h1 className="name-header">UHID : </h1>
            <span className="ml-2">{data?.UHID}</span>
          </div>

          <div className="flex flex-row">
            <h1 className="name-header">IPD No: </h1>
            <span className="ml-2">{data?.IPDNo}</span>
          </div>

          <div className="flex flex-row">
            <h1 className="name-header">Last Date / Time: </h1>
            <span className="ml-2">{""}</span>
          </div>

          {/* <div className="flex flex-row">
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
            <h1 className="name-header">Bill Date: </h1>
            <span className="ml-2">{data?.BillDate}</span>
          </div> */}

          <div className="flex flex-row">
            <h1 className="name-header mr-2 my-2"> Date: </h1>
            <CustomDateInput />
          </div>

          <div className="flex flex-row gap-2">
            <h1 className="name-header mr-2 my-2">Time: </h1>
            <span className="max-w-80">
              <CustomTimePicker />
            </span>
          </div>

          <div className="flex flex-row">
            <h1 className="name-header mr-2 my-2">Remark: </h1>
            <textarea cols={1} className="input-field w-full" />
          </div>
        </div>
        <div className="form-actions-responsive m-1">
          <button type="submit" className="save-btn">
            Save
          </button>
          <button type="button" className="cancel-button ">
            Cancel
          </button>
        </div>

        {/* table */}
        <div className="table-container mt-2">
          <div className="table-scroll-wrapper ">
            <div className="table-size lg:min-h-60 lg:max-h-60">
              <table className="base-table ">
                <thead className="table-head">
                  <tr>
                    {LaboratoryHelpDeskNotificationTableHeader.map((h, index) => (
                      <th key={index} className="table-th ">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {[].length === 0 ? (
                    <tr>
                      <td colSpan={17} className="no-data-text">
                        No data found
                      </td>
                    </tr>
                  ) : (
                    [].map((item, idx) => (
                      <tr key={idx} className="table-row">
                        <td className="table-td">{item.Barcode}</td>
                        <td className="table-td">{item?.LabNo || "-"}</td>
                        <td className="table-td">{item?.BillDate || "-"}</td>
                        <td className="table-td">{item?.UHID || "-"}</td>
                        <td className="table-td">{item?.PatientName || "-"}</td>
                        <td className="table-td">
                          {item?.CurrentAge || "-"} / {item?.Gender}
                        </td>
                        <td className="table-td">{item?.ContactNumber || "-"}</td>
                        <td className="table-td">
                          <span style={getBadgeStyle(item)}>{item?.Name || "-"}</span>
                        </td>
                        <td className="table-td">
                          <input type="checkbox" className="input-checkbox" />
                        </td>
                        <td className="table-td">
                          <i className="fa-solid fa-upload icon-color-button"></i>
                        </td>

                        <td className="table-td">
                          <i className="fa-solid fa-paper-plane icon-color-button"></i>
                        </td>
                        <td className="table-td">
                          <i className="fa-solid fa-search icon-color-button"></i>
                        </td>
                        <td className="table-td">
                          <i className="fa-solid fa-file-lines icon-color-button"></i>
                        </td>

                        <td className="table-td">
                          <i className="fa-solid fa-bell icon-color-button"></i>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Notification;
