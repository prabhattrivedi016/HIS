import CustomLoader from "@/components/customLoader";
import ImageDownload from "@/components/SingledrawerAndPopup/components/ImageDownload";
import ImagePreview from "@/components/SingledrawerAndPopup/components/ImagePreview";
import { ENDPOINTS } from "@/config/defaults";
import { PatientDocumentTableHeader } from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { DOcumentListItem } from "../types";

type PatientDocumentPayloadItem = {
  DocumentId: number;
  PatientId: number;
  DocumentFile: File | null;
};

const DocumentPopup = ({
  isOpen,
  onClose,
  patientId,
  fileStore,
  setFileStore,
  payload,
  setPayload,
}: {
  isOpen: boolean;
  onClose: () => void;
  patientId: number;
  fileStore: Record<number, File>;
  setFileStore: React.Dispatch<React.SetStateAction<Record<number, File>>>;
  payload: PatientDocumentPayloadItem[];
  setPayload: React.Dispatch<React.SetStateAction<PatientDocumentPayloadItem[]>>;
}) => {
  const { loading, fetchApi } = useGlobalApi();

  const [documentList, setDocumentList] = React.useState<DOcumentListItem[]>([]);

  // API
  const getDocumentMapping = async (patientId: number = 0) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PATIENT_DOCUMENT_MAPPING,
      {},
      { params: { patientId } },
      { component: "DocumentPopupPatientRegistration" }
    );
    console.log("resp", resp?.data);

    setDocumentList(resp?.data ?? []);
  };

  useEffect(() => {
    if (isOpen) {
      getDocumentMapping(patientId);
    }
  }, [isOpen, patientId]);

  const fileChangeHandler = (e: React.ChangeEvent<HTMLInputElement>, item: DOcumentListItem) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const updatedMap = {
      ...fileStore,
      [item.documentId]: file,
    };

    setFileStore(updatedMap);

    setPayload(prev => {
      const exists = prev.find(d => d.DocumentId === item.documentId);

      if (exists) {
        return prev.map(d => (d.DocumentId === item.documentId ? { ...d, DocumentFile: file } : d));
      }

      return [
        ...prev,
        {
          DocumentId: item.documentId,
          PatientId: patientId,
          DocumentFile: file,
        },
      ];
    });
  };

  return createPortal(
    <div className={`fixed inset-0 z-9999 ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      <div
        className={`central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw]  lg:min-w-250 ${isOpen ? "opacity-full" : ""}`}
      >
        <div className="popup-header">
          <h2 className="popup-helper-text">Patient Documents</h2>
          <button onClick={onClose} className="close-drawer-btn">
            ×
          </button>
        </div>

        <div className="table-container">
          <div className="table-scroll-wrapper">
            <div className="table-size">
              <table className="base-table">
                <thead className="table-head">
                  <tr>
                    {PatientDocumentTableHeader.map((h, index) => (
                      <th key={index} className="table-th">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {documentList.length === 0 && (
                    <tr>
                      <td
                        colSpan={PatientDocumentTableHeader.length}
                        className="table-empty text-center"
                      >
                        No document
                      </td>
                    </tr>
                  )}

                  {documentList.map((item, idx) => {
                    const selectedFile = fileStore[item.documentId];

                    return (
                      <tr key={idx} className="table-row">
                        <td className="table-td">{idx + 1}</td>
                        <td className="table-td">{item?.documentName || "-"}</td>
                        <td className="table-td">{item?.documentCode || "-"}</td>

                        <td className="table-td">
                          {item?.documentPath ? (
                            <ImagePreview pathName={item.documentPath} />
                          ) : (
                            "❌"
                          )}
                        </td>

                        {/* item?.documentPath  */}
                        <td className="table-td">
                          {<ImageDownload pathName={item?.documentPath} />}
                        </td>

                        <td className="table-td">
                          <input
                            type="file"
                            className="file-upload max-w-50"
                            onChange={e => fileChangeHandler(e, item)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {loading && <CustomLoader isLoading={loading} />}
    </div>,
    document.body
  );
};

export default DocumentPopup;
