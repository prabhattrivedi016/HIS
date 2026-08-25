import { safeRandomUUID } from "@/utils/uuid";
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

// this store persists uploaded/annotated report images as base64 data URLs, which can be large —
// localStorage has a hard per-origin quota (~5-10MB), and once it's full, a plain
// `localStorage.setItem` throws synchronously. Uncaught, that exception surfaces from inside this
// store's own `set()` call — often from a React effect — and crashes the whole render tree (blank
// screen) rather than just failing to persist. Swallow that one failure mode so a full quota
// degrades to "this update won't survive a refresh" instead of "the app is gone".
const quotaSafeLocalStorage: StateStorage = {
  getItem: name => localStorage.getItem(name),
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch (err) {
      console.warn(`useVisitReportsStore: could not persist "${name}" (storage quota exceeded?)`, err);
    }
  },
  removeItem: name => localStorage.removeItem(name),
};

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
  /** the base image + strokes composited into one flat PNG (recomputed on every save from the
   * live Konva stage) — this, not `dataUrl` + `strokes` separately, is what any plain <img> (the
   * sidebar thumbnail here, and eventually whatever a real backend endpoint stores/returns as
   * "the image") should show, so a sketch survives anywhere strokes aren't re-rendered live.
   * Undefined until the first save — falls back to the plain `dataUrl` until then. */
  flattenedDataUrl?: string;
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
  /** replaces this one header's reports (for this patient+visit) with `documents`, leaving every
   * other header's reports untouched — used to seed the store from a hydrated
   * savedHeaderValues entry (the last-saved-to-backend state) without wiping out whatever's
   * locally cached for a different Image Uploader control on the same visit */
  setHeaderReports: (
    patientId: number,
    visitId: number,
    headerId: number | undefined,
    documents: VisitReportDocument[]
  ) => void;
}

export const useVisitReportsStore = create<VisitReportsState>()(
  persist(
    set => ({
      reports: [],

      addReport: entry => {
        const now = new Date().toISOString();
        const report: VisitReportDocument = {
          patientId: entry.patientId,
          visitId: entry.visitId,
          headerId: entry.headerId,
          controlTypeId: entry.controlTypeId,
          fileName: entry.fileName,
          id: safeRandomUUID(),
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

      setHeaderReports: (patientId, visitId, headerId, documents) =>
        set(state => ({
          reports: [
            ...state.reports.filter(
              report =>
                !(
                  report.patientId === patientId &&
                  report.visitId === visitId &&
                  report.headerId === headerId
                )
            ),
            ...documents,
          ],
        })),
    }),
    { name: "emr-visit-reports-v2", storage: createJSONStorage(() => quotaSafeLocalStorage) }
  )
);
