interface PatientDocumentItem {
  documentId: number;
  documentName: string;
  documentCode: string;
  isActive: number;
  createdBy: string;
  createdOn: string;
  lastModifiedBy: string;
  lastModifiedOn: string;
}

export type { PatientDocumentItem };
