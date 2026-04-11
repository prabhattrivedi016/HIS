import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { PatientDocumentTableHeader } from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { DOcumentListItem } from "../types";

const DocumentPopup = ({ isOpen, onClose }) => {
  const { loading, error, fetchApi } = useGlobalApi();
  const [documentList, setDocumentList] = useState<DOcumentListItem[]>([]);
  // document mapping
  const getDocumentMapping = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PATIENT_DOCUMENT_MAPPING,
      {},
      {},
      { component: "DocumentPopupPatientRegistration" }
    );
    console.log("resp", resp?.data);
    setDocumentList(resp?.data ?? []);
  };

  useEffect(() => {
    if (isOpen) {
      getDocumentMapping();
    }
  }, [isOpen]);
  return createPortal(
    <div className={`fixed inset-0 z-9999 ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`popup-bg-overlay   ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      <div
        className={`central-popup lg:min-w-5xl lg:min-h-120 lg:max-h-110 h-[calc(100%-20px)] overflow-auto ${isOpen ? "opacity-full" : ""}`}
      >
        <div className="popup-header">
          <h2 className="popup-helper-text">Patient Documents</h2>
          <button onClick={onClose} className="close-drawer-btn">
            ×
          </button>
        </div>
        <div className="table-container ">
          <div className="table-scroll-wrapper ">
            <div className="table-size ">
              <table className="base-table ">
                <thead className="table-head">
                  <tr>
                    {PatientDocumentTableHeader.map((h, index) => (
                      <th key={index} className="table-th ">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {documentList?.length === 0 && (
                    <tr>
                      <td colSpan={PatientDocumentTableHeader.length} className="table-empty">
                        No document records found
                      </td>
                    </tr>
                  )}

                  {documentList.map((item, idx) => (
                    <tr key={idx} className="table-row cursor-pointer">
                      <td className="table-td">{idx + 1}</td>
                      <td className="table-td">{item?.documentName || "-"}</td>
                      <td className="table-td ">{item?.documentCode || "-"}</td>
                      <td className="table-td">{item?.documentPath ? "✔️" : "❌"}</td>
                      <td className="table-td">
                        <i className="fa-solid fa-download icon-color-button"></i>
                      </td>
                      <td className="table-td">
                        <input type="file" className="file-upload max-w-50" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {!!loading && <CustomLoader isLoading={loading} />}
    </div>,
    document.body
  );
};

export default DocumentPopup;
