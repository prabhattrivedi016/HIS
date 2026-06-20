import { ENDPOINTS } from "@/config/defaults";
import { IpdOpdTypeName } from "@/constants/constants";
import { IpdOpdDocumentTableHeader } from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showWarning } from "@/utils/alert";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import { DocumentItem, IpdOpdDocumentHandle, IpdOpdDocumentProps } from "../types";
import { uploadVisitWisePatientDocuments } from "../uploadVisitWiseDocuments";
import {
  buildVisitWiseUploadPayload,
  getVisitWiseMandatoryDocumentErrors,
} from "../visitWiseDocumentValidation";
import ImageDownload from "./ImageDownload";
import ImagePreview from "./ImagePreview";

const getDocumentCategoryId = (type: string) => (type === IpdOpdTypeName?.OPD ? 2 : 3);

const IpdOpdDocument = forwardRef<IpdOpdDocumentHandle, IpdOpdDocumentProps>(({ type }, ref) => {
  const { fetchApi } = useGlobalApi();
  const [documentFileStore, setDocumentFileStore] = useState<Record<number, File>>({});
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({});
  const documentFileStoreRef = useRef(documentFileStore);
  const documentListRef = useRef<DocumentItem[]>([]);

  documentFileStoreRef.current = documentFileStore;

  const getIpdOpdDocument = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_VISIT_WISE_PATIENT_DOCUMENT_MAPPING,
      {},
      { params: { documentCategoryId: getDocumentCategoryId(type) } },
      { component: "IpdOpdDocument" }
    );

    return (resp?.data ?? []) as DocumentItem[];
  };

  const { data: documentLists = [] } = useQuery({
    queryKey: ["getOpdIpdDocument", type],
    queryFn: getIpdOpdDocument,
  });

  documentListRef.current = documentLists;

  const clearDocumentValidationError = useCallback((documentId: number) => {
    setValidationErrors(prev => {
      if (!prev[documentId]) {
        return prev;
      }

      const next = { ...prev };
      delete next[documentId];
      return next;
    });
  }, []);

  const fileChangeHandler = (e: ChangeEvent<HTMLInputElement>, item: DocumentItem) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    setDocumentFileStore(prev => ({
      ...prev,
      [item.DocumentId]: file,
    }));
    clearDocumentValidationError(item.DocumentId);
  };

  const resetForm = useCallback(() => {
    setDocumentFileStore({});
    setValidationErrors({});
  }, []);

  const validateMandatoryDocuments = useCallback(async (): Promise<boolean> => {
    const errors = getVisitWiseMandatoryDocumentErrors(
      documentListRef.current,
      documentFileStoreRef.current
    );

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      showWarning("Please upload all mandatory documents");
      return false;
    }

    setValidationErrors({});
    return true;
  }, []);

  const uploadDocuments = useCallback(
    async (patientId: number, visitId: number): Promise<boolean> => {
      const payload = buildVisitWiseUploadPayload(
        documentListRef.current,
        documentFileStoreRef.current,
        patientId,
        visitId
      );

      if (!payload.length) {
        return true;
      }

      const { success, message } = await uploadVisitWisePatientDocuments(
        fetchApi,
        payload,
        "IpdOpdDocumentUpload"
      );

      if (!success) {
        showWarning(message || "Failed to upload visit documents");
        return false;
      }

      resetForm();
      return true;
    },
    [fetchApi, resetForm]
  );

  useImperativeHandle(
    ref,
    () => ({
      validateMandatoryDocuments,
      uploadDocuments,
      resetForm,
    }),
    [resetForm, uploadDocuments, validateMandatoryDocuments]
  );

  return (
    <div className="table-container mt-1">
      <div className="table-scroll-wrapper">
        <div className="table-size lg:min-h-125">
          <table className="base-table">
            <thead className="table-head">
              <tr>
                {IpdOpdDocumentTableHeader.map((h, index) => (
                  <th key={index} className="table-th">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {documentLists.length === 0 && (
                <tr>
                  <td
                    colSpan={IpdOpdDocumentTableHeader.length}
                    className="table-empty text-center"
                  >
                    No document
                  </td>
                </tr>
              )}

              {documentLists.map((item: DocumentItem, idx: number) => {
                const fieldError = validationErrors[item.DocumentId];
                console.log("item", item);

                return (
                  <tr key={idx} className="table-row">
                    <td className="table-td">{idx + 1}</td>
                    <td className="table-td">{item?.DocumentCategory || "-"}</td>
                    <td className="table-td">{item?.DocumentName || "-"}</td>
                    <td className="table-td">{item?.DocumentCode || "-"}</td>

                    <td className="table-td">
                      {item?.DocumentPath ? <ImagePreview pathName={item.DocumentPath} /> : "❌"}
                    </td>

                    <td className="table-td">{<ImageDownload pathName={item?.DocumentPath} />}</td>

                    <td className="table-td">
                      <input
                        type="file"
                        className={`file-upload max-w-50 ${
                          fieldError
                            ? "input-field-error"
                            : item?.IsMandatory === 1
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
  );
});

IpdOpdDocument.displayName = "IpdOpdDocument";

export default IpdOpdDocument;
