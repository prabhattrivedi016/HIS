import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ReportAnnotationTool = "pen" | "erase" | "rectangle" | "ellipse" | "line" | "arrow";

export interface ReportAnnotationStroke {
  id: string;
  tool: ReportAnnotationTool;
  points: number[];
  color: string;
  strokeWidth: number;
}

export interface ReportPage {
  pageNumber: number;
  dataUrl: string;
  strokes: ReportAnnotationStroke[];
}

export interface VisitReportDocument {
  id: string;
  patientId: number;
  visitId: number;
  /** which EMR header/Image Uploader control this report was uploaded/seeded under — reports are
   * scoped by header as well as patient+visit, so a file uploaded from one Image Uploader control
   * doesn't also show up under a different one for the same visit */
  headerId?: number;
  /** that header's numeric control type id, same "attach it if present" treatment every other
   * control type's payload entry already gets */
  controlTypeId?: number;
  fileName: string;
  pages: ReportPage[];
  uploadedOn: string;
  updatedOn: string;
}

interface VisitReportsState {
  reports: VisitReportDocument[];
  addReport: (entry: {
    patientId: number;
    visitId: number;
    headerId?: number;
    controlTypeId?: number;
    fileName: string;
    pages: { pageNumber: number; dataUrl: string }[];
  }) => VisitReportDocument;
  updatePages: (id: string, pages: ReportPage[]) => void;
  removeReport: (id: string) => void;
  getReports: (patientId: number, visitId: number) => VisitReportDocument[];
  setReports: (patientId: number, visitId: number, documents: VisitReportDocument[]) => void;
}

export const useVisitReportsStore = create<VisitReportsState>()(
  persist(
    (set, get) => ({
      reports: [],

      addReport: entry => {
        const now = new Date().toISOString();
        const report: VisitReportDocument = {
          patientId: entry.patientId,
          visitId: entry.visitId,
          headerId: entry.headerId,
          controlTypeId: entry.controlTypeId,
          fileName: entry.fileName,
          id: crypto.randomUUID(),
          pages: entry.pages.map(page => ({ ...page, strokes: [] })),
          uploadedOn: now,
          updatedOn: now,
        };
        set(state => ({ reports: [...state.reports, report] }));
        return report;
      },

      updatePages: (id, pages) =>
        set(state => ({
          reports: state.reports.map(report =>
            report.id === id ? { ...report, pages, updatedOn: new Date().toISOString() } : report
          ),
        })),

      removeReport: id =>
        set(state => ({ reports: state.reports.filter(report => report.id !== id) })),

      getReports: (patientId, visitId) =>
        get()
          .reports.filter(report => report.patientId === patientId && report.visitId === visitId)
          .sort((a, b) => a.uploadedOn.localeCompare(b.uploadedOn)),

      setReports: (patientId, visitId, documents) =>
        set(state => ({
          reports: [
            ...state.reports.filter(
              report => !(report.patientId === patientId && report.visitId === visitId)
            ),
            ...documents,
          ],
        })),
    }),
    { name: "emr-visit-reports-v2" }
  )
);
