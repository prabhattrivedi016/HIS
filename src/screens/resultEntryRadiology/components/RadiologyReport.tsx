import InputField from "@/components/customInputField";
import { ResultEntryRadiologyReportTableHeader } from "@/constants/tableHeaders";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import AddDocument from "./AddDocument";

const RadiologyReport = ({ isOpen, onClose }) => {
  const [renderAddDocument, setRenderAddDocument] = useState<boolean>(false);
  const [openAddDocument, setOpenAddDocument] = useState<boolean>(false);

  const addDocumentHandler = () => {
    setRenderAddDocument(true);
    requestAnimationFrame(() => {
      setOpenAddDocument(true);
    });
  };

  useEffect(() => {
    if (openAddDocument) return;

    const closeTimer = setTimeout(() => {
      setRenderAddDocument(false);
    }, 300);

    return () => clearTimeout(closeTimer);
  }, [openAddDocument]);

  const closeHandler = useCallback(() => {
    setOpenAddDocument(false);
  }, []);
  useScrollLock(isOpen);

  return createPortal(
    <div className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />
      <div
        className={`central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] lg:min-w-250 ${isOpen ? "opacity-full" : ""}`}
      >
        <div className="popup-header min-w-0">
          <h2 className="popup-helper-text truncate">{"Add Report"}</h2>
          <button onClick={onClose} className="close-drawer-btn shrink-0 ml-3">
            ×
          </button>
        </div>

        <div className="form-grid-4">
          <InputField label="Investigation">
            <input type="text" className="input-field" />
          </InputField>

          <InputField label="Document Name">
            <div className="flex gap-2 items-center">
              <input type="text" className="input-field" />
              <button className="-mt-2" onClick={addDocumentHandler}>
                <i className="fa-solid fa-circle-plus fa-xl active:scale-95"></i>
              </button>
            </div>
          </InputField>

          <InputField label="Upload Document">
            <input type="file" className="file-upload" />
          </InputField>

          <div className="flex items-end gap-2 ">
            <button className="save-btn  my-2 w-full  "> Upload </button>
            <button className="cancel-btn w-full ">Cancel</button>
          </div>
        </div>

        <div className="table-container ">
          <div className="table-scroll-wrapper ">
            <div className="table-size lg:min-h-60 lg:max-h-60">
              <table className="base-table ">
                <thead className="table-head">
                  <tr>
                    {ResultEntryRadiologyReportTableHeader.map((h, index) => (
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
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {!!renderAddDocument && <AddDocument isOpen={renderAddDocument} onClose={closeHandler} />}
    </div>,
    document.body
  );
};

export default RadiologyReport;
