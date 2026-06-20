import { DocumentItem, VisitWiseDocumentPayloadItem } from "./types";

export const isVisitWiseDocumentProvided = (
  item: DocumentItem,
  fileStore: Record<number, File>
): boolean => {
  if (item.DocumentPath) {
    return true;
  }

  return Boolean(fileStore[item.DocumentId]);
};

export const getVisitWiseMandatoryDocumentErrors = (
  documentList: DocumentItem[],
  fileStore: Record<number, File>
): Record<number, string> => {
  const errors: Record<number, string> = {};

  for (const item of documentList) {
    if (item.IsMandatory !== 1) {
      continue;
    }

    if (!isVisitWiseDocumentProvided(item, fileStore)) {
      const documentName = item.DocumentName?.trim() || "Document";
      errors[item.DocumentId] = `${documentName} file is required`;
    }
  }

  return errors;
};

export const buildVisitWiseUploadPayload = (
  documentList: DocumentItem[],
  fileStore: Record<number, File>,
  patientId: number,
  visitId: number
): VisitWiseDocumentPayloadItem[] =>
  documentList
    .filter(item => Boolean(fileStore[item.DocumentId]))
    .map(item => ({
      DocumentId: item.DocumentId,
      PatientId: patientId,
      VisitId: visitId,
      DocumentCategoryId: item.DocumentCategoryId,
      DocumentFile: fileStore[item.DocumentId],
    }));
