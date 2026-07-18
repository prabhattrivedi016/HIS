import CentralPopup from "@/components/centralPopup";
import CustomLoader from "@/components/customLoader";
import { ErrorMessage } from "@/components/infoText";
import ImageDownload from "@/components/SingledrawerAndPopup/components/ImageDownload";
import ImagePreview from "@/components/SingledrawerAndPopup/components/ImagePreview";
import { ENDPOINTS } from "@/config/defaults";
import { PatientDocumentTableHeader } from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import React, { useEffect } from "react";
import { DOcumentListItem, PatientDocumentPayloadItem } from "../types";

const DocumentPopup = ({
  isOpen,
  onClose,
  patientId,
  fileStore,
  setFileStore,
  payload,
  setPayload,
  validationErrors = {},
  onClearDocumentError,
  documentError,
}: {
  isOpen: boolean;
  onClose: () => void;
  patientId: number | null;
  fileStore: Record<number, File>;
  setFileStore: React.Dispatch<React.SetStateAction<Record<number, File>>>;
  payload: PatientDocumentPayloadItem[];
  setPayload: React.Dispatch<React.SetStateAction<PatientDocumentPayloadItem[]>>;
  validationErrors?: Record<number, string>;
  onClearDocumentError?: (documentId: number) => void;
  documentError: string;
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
    onClearDocumentError?.(item.documentId);

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

  return (
    <>
      <CentralPopup
        isOpen={isOpen}
        onClose={onClose}
        title="Patient Documents"
        className="lg:min-w-200"
      >
        {!!documentError && <ErrorMessage text={documentError} />}
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
                    const fieldError = validationErrors[item.documentId];

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
                            className={`file-upload max-w-50 ${
                              fieldError
                                ? "input-field-error"
                                : item?.isMandatory === 1
                                  ? "input-field-warning"
                                  : ""
                            }`}
                            onChange={e => fileChangeHandler(e, item)}
                          />
                          {!!fieldError && <p className="input-field-error">{fieldError}</p>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CentralPopup>
      {loading && <CustomLoader isLoading={loading} />}
    </>
  );
};

export default DocumentPopup;
