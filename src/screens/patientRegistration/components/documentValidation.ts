import { DOcumentListItem, PatientDocumentPayloadItem } from "../types";

export const isPatientDocumentProvided = (
  item: DOcumentListItem,
  fileStore: Record<number, File>,
  payload: PatientDocumentPayloadItem[]
): boolean => {
  if (item.documentPath) {
    return true;
  }

  if (fileStore[item.documentId]) {
    return true;
  }

  const payloadItem = payload.find(entry => entry.DocumentId === item.documentId);

  return Boolean(payloadItem?.DocumentFile);
};

export const getMandatoryDocumentErrors = (
  documentList: DOcumentListItem[],
  fileStore: Record<number, File>,
  payload: PatientDocumentPayloadItem[]
): Record<number, string> => {
  const errors: Record<number, string> = {};

  for (const item of documentList) {
    if (item.isMandatory !== 1) {
      continue;
    }

    if (!isPatientDocumentProvided(item, fileStore, payload)) {
      const documentName = item.documentName?.trim() || "Document";
      errors[item.documentId] = `${documentName} file is required`;
    }
  }

  return errors;
};
