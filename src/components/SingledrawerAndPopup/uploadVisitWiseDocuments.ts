import { ENDPOINTS } from "@/config/defaults";
import { VisitWiseDocumentPayloadItem } from "./types";

type FetchApiFn = (
  method: string,
  endpoint: string,
  body?: unknown,
  options?: Record<string, unknown>,
  config?: Record<string, unknown>
) => Promise<{ result?: boolean; message?: string } | null | undefined>;

export const uploadVisitWisePatientDocuments = async (
  fetchApi: FetchApiFn,
  documents: VisitWiseDocumentPayloadItem[],
  component: string
): Promise<{ success: boolean; message?: string }> => {
  if (!documents.length) {
    return { success: true };
  }

  const formData = new FormData();

  documents.forEach(item => {
    if (!item.DocumentFile) {
      return;
    }

    formData.append("DocumentId", String(item.DocumentId));
    formData.append("PatientId", String(item.PatientId));
    formData.append("VisitId", String(item.VisitId));
    formData.append("DocumentCategoryId", String(item.DocumentCategoryId));
    formData.append("DocumentFile", item.DocumentFile);
  });

  const response = await fetchApi(
    "POST",
    ENDPOINTS.UPLOAD_VISIT_WISE_PATIENT_DOCUMENT,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
    { component }
  );

  if (!response?.result) {
    return {
      success: false,
      message: response?.message || "Failed to upload visit documents",
    };
  }

  return { success: true, message: response?.message };
};

export const resolveVisitIdFromResponse = (data: unknown): number => {
  if (!data || typeof data !== "object") {
    return 0;
  }

  const item = data as Record<string, unknown>;

  return Number(item.visitId ?? item.VisitId ?? item.visitNo ?? item.VisitNo ?? 0);
};
