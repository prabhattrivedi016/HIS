import CentralPopup from "@/components/centralPopup";
import CustomLoader from "@/components/customLoader";
import ImageDownload from "@/components/SingledrawerAndPopup/components/ImageDownload";
import ImagePreview from "@/components/SingledrawerAndPopup/components/ImagePreview";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { EmrControlDocumentItem } from "@/screens/consultationHeaderMaster/types";
import { showSuccess, showWarning } from "@/utils/alert";
import { useEffect, useState } from "react";

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** general (not tied to any one EMR header) visit documents — same GET/UPLOAD/DELETE
 * _EMR_CONTROL_DOCUMENT endpoints Header Master's per-header "Image Upload" already uses, just
 * scoped to headerId 0 instead of a real header id */
const GENERAL_DOCUMENT_HEADER_ID = 0;

const UploadDocumentModal = ({ isOpen, onClose }: UploadDocumentModalProps) => {
  const { fetchApi } = useGlobalApi();
  const [documents, setDocuments] = useState<EmrControlDocumentItem[]>([]);
  const [imageNames, setImageNames] = useState<Record<number, string>>({});
  const [uploadingDocumentId, setUploadingDocumentId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDocuments = async () => {
    setIsLoading(true);
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_EMR_CONTROL_DOCUMENT_MAPPING,
      {},
      { params: { headerId: GENERAL_DOCUMENT_HEADER_ID } },
      { component: "UploadDocumentModal" }
    );
    setIsLoading(false);
    setDocuments((resp?.data ?? []) as EmrControlDocumentItem[]);
  };

  useEffect(() => {
    if (isOpen) fetchDocuments();
  }, [isOpen]);

  const imageNameChangeHandler = (documentId: number, value: string) => {
    setImageNames(prev => ({ ...prev, [documentId]: value }));
  };

  const uploadHandler = async (doc: EmrControlDocumentItem, file: File) => {
    const imageName = imageNames[doc.DocumentId] ?? doc.ImageName ?? doc.DocumentName;

    setUploadingDocumentId(doc.DocumentId);
    const formData = new FormData();
    formData.append("HeaderId", String(GENERAL_DOCUMENT_HEADER_ID));
    formData.append("DocumentId", String(doc.DocumentId));
    formData.append("ImageName", imageName);
    formData.append("DocumentFile", file);

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.UPLOAD_EMR_CONTROL_DOCUMENT,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
      { component: "UploadDocumentModal" }
    );
    setUploadingDocumentId(null);

    if (!resp?.result) {
      showWarning(resp?.message ?? "Failed to upload document");
      return;
    }
    showSuccess(resp?.message ?? "Document uploaded successfully");
    await fetchDocuments();
  };

  const deleteHandler = async (documentId: number) => {
    const resp = await fetchApi(
      "PATCH",
      ENDPOINTS.DELETE_EMR_CONTROL_DOCUMENT_MAPPING,
      {},
      { params: { headerId: GENERAL_DOCUMENT_HEADER_ID, documentId } },
      { component: "UploadDocumentModal" }
    );

    if (!resp?.result) {
      showWarning(resp?.message ?? "Failed to delete document");
      return;
    }
    showSuccess(resp?.message ?? "Document deleted successfully");
    await fetchDocuments();
  };

  return (
    <>
      <CentralPopup
        isOpen={isOpen}
        onClose={onClose}
        title="Upload Document"
        className="lg:min-w-200"
      >
        <div className="table-container">
          <div className="table-scroll-wrapper">
            <div className="table-size">
              <table className="base-table w-full">
                <thead className="table-head">
                  <tr>
                    <th className="table-th w-40">Document</th>
                    <th className="table-th w-20 text-center">Preview</th>
                    <th className="table-th w-24 text-center">Download</th>
                    <th className="table-th min-w-[220px]">Image Name</th>
                    <th className="table-th w-56">File</th>
                    <th className="table-th w-16 text-center">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="table-empty text-center">
                        No documents configured
                      </td>
                    </tr>
                  )}
                  {documents.map(doc => (
                    <tr key={doc.DocumentId} className="table-row">
                      <td className="table-td font-medium">{doc.DocumentName}</td>
                      <td className="table-td text-center">
                        {doc.DocumentPath ? (
                          <ImagePreview pathName={doc.DocumentPath} />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="table-td text-center">
                        {doc.DocumentPath ? (
                          <ImageDownload pathName={doc.DocumentPath} />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="table-td">
                        <input
                          type="text"
                          className="input-field !mb-0"
                          placeholder="Enter image name"
                          value={imageNames[doc.DocumentId] ?? doc.ImageName ?? doc.DocumentName}
                          onChange={e => imageNameChangeHandler(doc.DocumentId, e.target.value)}
                        />
                      </td>
                      <td className="table-td">
                        <input
                          type="file"
                          accept="image/*"
                          className="file-upload w-full"
                          disabled={uploadingDocumentId === doc.DocumentId}
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) uploadHandler(doc, file);
                            e.target.value = "";
                          }}
                        />
                        {uploadingDocumentId === doc.DocumentId && (
                          <p className="text-[11px] text-gray-400 mt-1">Uploading…</p>
                        )}
                      </td>
                      <td className="table-td text-center">
                        {doc.DocumentPath && (
                          <button
                            type="button"
                            className="delete-icon"
                            onClick={() => deleteHandler(doc.DocumentId)}
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CentralPopup>
      {isLoading && <CustomLoader isLoading={isLoading} />}
    </>
  );
};

export default UploadDocumentModal;
