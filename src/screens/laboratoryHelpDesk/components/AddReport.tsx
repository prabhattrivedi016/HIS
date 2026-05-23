import InputField from "@/components/customInputField";
import { LaboratoryHelpDeskAddReportTableHeader } from "@/constants/tableHeaders";
import { useScrollLock } from "@/hooks/useScrollLock";
import { createPortal } from "react-dom";
import { LaboratoryHelpDeskItem } from "../types";

const AddReport = ({
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
          <h2 className="popup-helper-text truncate">Add Report</h2>
          <button onClick={onClose} className="close-drawer-btn shrink-0 ml-3">
            x
          </button>
        </div>

        <div className="form-grid-4 card ">
          <InputField label="Investigation">
            <input type="text" className="input-field" />
          </InputField>

          <InputField label="Document Name">
            <input type="text" className="input-field" />
          </InputField>
          <InputField label="Upload Document">
            <input type="file" className="file-upload mb-2" />
          </InputField>

          <div className="flex items-end gap-2 justify-end lg:mr-2">
            <button className="save-btn"> Upload </button>
          </div>
        </div>

        {/* table */}
        <div className="table-container -mt-2">
          <div className="table-scroll-wrapper ">
            <div className="table-size lg:min-h-60 lg:max-h-60">
              <table className="base-table ">
                <thead className="table-head">
                  <tr>
                    {LaboratoryHelpDeskAddReportTableHeader.map((h, index) => (
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

export default AddReport;
