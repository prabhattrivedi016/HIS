import { ANNOTATION_STROKE_COLORS, ANNOTATION_TOOLS } from "@/config/annotationTools";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import {
  ReportAnnotationStroke,
  ReportAnnotationTool,
  ReportPage,
  useVisitReportsStore,
} from "@/store/useVisitReportsStore";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { convertPdfToImages } from "@/utils/pdfToImages";
import {
  FileImage,
  FileText,
  Loader2,
  Save,
  Stethoscope,
  Trash2,
  Upload,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type Konva from "konva";
import { ChangeEvent, RefObject, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import DoctorNoteEditor from "./DoctorNoteEditor";
import ReportAnnotationCanvas from "./ReportAnnotationCanvas";

interface ReportAnnotatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: number;
  visitId?: number;
  /** EMR header this control belongs to — used to seed this visit's report list with the
   * header's default template images (via GET_EMR_CONTROL_DOCUMENT_MAPPING) the first time it's
   * opened for a visit that has no reports yet */
  headerId?: number;
  /** that header's numeric control type id — attached to every report saved here, same as every
   * other control type's payload entry */
  controlTypeId?: number;
}

/** one document slot returned by GET_EMR_CONTROL_DOCUMENT_MAPPING for this header */
interface EmrControlDocument {
  DocumentId: number;
  DocumentName: string;
  DocumentPath: string;
}

type ModalTab = "patient" | "doctor";

const MIN_SCALE = 0.2;
const MAX_SCALE = 4;
const CANVAS_PADDING = 48;

const ReportAnnotatorModal = ({
  isOpen,
  onClose,
  patientId,
  visitId,
  headerId,
  controlTypeId,
}: ReportAnnotatorModalProps) => {
  const addReport = useVisitReportsStore(state => state.addReport);
  const updatePages = useVisitReportsStore(state => state.updatePages);
  const removeReport = useVisitReportsStore(state => state.removeReport);
  const allReports = useVisitReportsStore(state => state.reports);
  const { fetchApi } = useGlobalApi();

  // scoped by header too, not just patient+visit — a file uploaded from a different Image
  // Uploader control for the same visit must not show up here
  const reports = allReports.filter(
    report =>
      report.patientId === patientId && report.visitId === visitId && report.headerId === headerId
  );

  const [activeTab, setActiveTab] = useState<ModalTab>("patient");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<ReportAnnotationTool>("pen");
  const [color, setColor] = useState(ANNOTATION_STROKE_COLORS[0]);
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [scale, setScale] = useState(1);
  const [draftPages, setDraftPages] = useState<ReportPage[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasAreaRef = useRef<HTMLDivElement>(null);
  const fetchApiRef = useRef(fetchApi);
  fetchApiRef.current = fetchApi;

  // one Konva stage ref per page, created lazily and reused across renders (a plain useRef map,
  // not one useRef per page, since draftPages' length varies per document) — lets handleSave read
  // each page's live stage.toDataURL() to flatten the image + strokes it's currently showing
  const stageRefsMap = useRef(new Map<number, RefObject<Konva.Stage | null>>());
  const getStageRef = (pageNumber: number) => {
    let ref = stageRefsMap.current.get(pageNumber);
    if (!ref) {
      ref = { current: null };
      stageRefsMap.current.set(pageNumber, ref);
    }
    return ref;
  };

  const selectedReport = reports.find(report => report.id === selectedId) ?? null;

  // keep this visit's report list in sync with the header's current default template images
  // (Image-1/2/3 etc.): add any that are missing (matched by name, not just "any report
  // exists" — so a partially-seeded visit still tops up what's missing), and remove any
  // previously-seeded copy whose master document has since had its file deleted, so a stale
  // seed from before a master-side delete doesn't keep showing up forever
  useEffect(() => {
    if (!isOpen || patientId == null || visitId == null || !headerId) return;
    let cancelled = false;

    const syncDefaultImages = async () => {
      const mappingRes = await fetchApiRef.current<{
        result: boolean;
        data: EmrControlDocument[];
      }>(
        "GET",
        ENDPOINTS.GET_EMR_CONTROL_DOCUMENT_MAPPING,
        {},
        { params: { headerId } },
        { component: "ReportAnnotatorModal", silent: true }
      );
      if (cancelled || !mappingRes?.result || !Array.isArray(mappingRes.data)) return;

      const mappingByName = new Map(mappingRes.data.map(doc => [doc.DocumentName, doc]));

      for (const report of reports) {
        const doc = mappingByName.get(report.fileName);
        if (!doc || doc.DocumentPath) continue;

        removeReport(report.id);
        setSelectedId(prev => (prev === report.id ? null : prev));
      }
      if (cancelled) return;

      const existingNames = new Set(reports.map(r => r.fileName));
      const missingDocs = mappingRes.data.filter(
        doc => doc.DocumentPath && !existingNames.has(doc.DocumentName)
      );

      for (const doc of missingDocs) {
        const fileRes = await fetchApiRef.current<{
          result: boolean;
          data?: { base64Data?: string };
        }>(
          "GET",
          ENDPOINTS.GET_FILE_AS_BASE_64,
          {},
          { params: { filePath: doc.DocumentPath } },
          { component: "ReportAnnotatorModal", silent: true }
        );
        if (cancelled) return;

        const dataUrl = fileRes?.data?.base64Data;
        if (!dataUrl) continue;

        addReport({
          patientId,
          visitId,
          headerId,
          controlTypeId,
          fileName: doc.DocumentName,
          pages: [{ pageNumber: 1, dataUrl }],
        });
      }
    };

    syncDefaultImages();
    return () => {
      cancelled = true;
    };
    // deliberately not depending on `reports` — addReport()/removeReport() below update the
    // store on every iteration, and re-running this effect mid-loop would flip `cancelled` to
    // true and abandon the remaining images after only the first one was processed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, patientId, visitId, headerId, addReport, removeReport]);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedId(prev =>
      prev && reports.some(r => r.id === prev) ? prev : (reports[0]?.id ?? null)
    );
  }, [isOpen, patientId, visitId, reports]);

  useEffect(() => {
    setDraftPages(selectedReport?.pages ?? []);
    setIsDirty(false);
    setScale(1);
  }, [selectedReport?.id]);

  const handleFirstPageSize = useCallback(({ width }: { width: number; height: number }) => {
    const el = canvasAreaRef.current;
    if (!el) return;
    const availWidth = el.clientWidth - CANVAS_PADDING;
    const fitScale = availWidth / width;
    setScale(Number((fitScale > 0 ? Math.min(fitScale, 1) : 1).toFixed(2)));
  }, []);

  if (!isOpen) return null;

  const readImageFile = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        if (typeof dataUrl === "string") resolve(dataUrl);
        else reject(new Error("Could not read file"));
      };
      reader.onerror = () => reject(new Error("Could not read file"));
      reader.readAsDataURL(file);
    });

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (patientId == null || visitId == null) {
      showWarning("Patient visit is not available");
      e.target.value = "";
      return;
    }

    setIsImporting(true);
    let lastCreatedId: string | null = null;

    try {
      for (const file of Array.from(files)) {
        if (file.type === "application/pdf") {
          const pages = await convertPdfToImages(file);
          const created = addReport({
            patientId,
            visitId,
            headerId,
            controlTypeId,
            fileName: file.name,
            pages,
          });
          lastCreatedId = created.id;
        } else {
          const dataUrl = await readImageFile(file);
          const created = addReport({
            patientId,
            visitId,
            headerId,
            controlTypeId,
            fileName: file.name,
            pages: [{ pageNumber: 1, dataUrl }],
          });
          lastCreatedId = created.id;
        }
      }
      if (lastCreatedId) setSelectedId(lastCreatedId);
    } catch {
      showError("Could not import one or more files");
    } finally {
      setIsImporting(false);
      e.target.value = "";
    }
  };

  const handlePageStrokesChange = (pageNumber: number, strokes: ReportAnnotationStroke[]) => {
    setDraftPages(prev =>
      prev.map(page => (page.pageNumber === pageNumber ? { ...page, strokes } : page))
    );
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!selectedReport) return;

    // bake each page's strokes into its base image now, at full (unzoomed) resolution, so "the
    // image" is correct wherever it's shown as a plain <img> instead of through this live canvas
    // — the sidebar thumbnail below, and eventually whatever a real backend endpoint stores and
    // later returns as "the image" (it can stay completely unaware strokes exist at all)
    const flattenedPages = draftPages.map(page => {
      const stage = stageRefsMap.current.get(page.pageNumber)?.current;
      if (!stage) return page;
      const pixelRatio = scale > 0 ? 1 / scale : 1;
      return { ...page, flattenedDataUrl: stage.toDataURL({ pixelRatio }) };
    });

    updatePages(selectedReport.id, flattenedPages);
    setIsDirty(false);
    showSuccess("Annotations saved — click the page's main Save to persist them");
  };

  const handleDelete = () => {
    if (!selectedReport) return;
    const deletedId = selectedReport.id;
    removeReport(deletedId);
    setSelectedId(reports.find(r => r.id !== deletedId)?.id ?? null);
  };

  const zoomBy = (delta: number) => {
    setScale(prev => Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number((prev + delta).toFixed(2)))));
  };

  return createPortal(
    <>
      <div className="fixed inset-0 z-[90] bg-black/40" onClick={onClose} />

      <div className="fixed inset-0 z-[91] pointer-events-none">
        <div className="bg-white w-screen h-screen flex flex-col pointer-events-auto overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b bg-gradient-to-r from-slate-50 via-white to-slate-50 shrink-0">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 shadow-sm">
                <FileImage size={13} className="text-white" />
              </span>
              <h3 className="text-[13px] font-bold text-slate-700 tracking-wide">
                Patient Reports
              </h3>
            </div>
            <button className="close-drawer-btn" onClick={onClose}>
              &times;
            </button>
          </div>

          <div className="flex items-center gap-1 px-5 pt-2.5 border-b border-slate-100 bg-white shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("patient")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === "patient"
                  ? "border-teal-500 text-teal-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <FileImage size={14} />
              Patient
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("doctor")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === "doctor"
                  ? "border-teal-500 text-teal-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Stethoscope size={14} />
              Doctor
            </button>
          </div>

          {activeTab === "doctor" ? (
            <div className="flex-1 min-h-0">
              <DoctorNoteEditor patientId={patientId} visitId={visitId} />
            </div>
          ) : (
            <div className="flex flex-1 min-h-0">
              <div className="w-56 shrink-0 border-r border-slate-100 bg-slate-50/70 flex flex-col">
                <div className="p-3 border-b border-slate-100">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                    className="save-btn w-full !py-2 !text-xs flex items-center justify-center gap-1.5 disabled:opacity-60"
                  >
                    {isImporting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Upload size={14} />
                    )}
                    {isImporting ? "Importing…" : "Upload Report"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    multiple
                    className="hidden"
                    onChange={handleUpload}
                  />
                </div>

                <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
                  {reports.length === 0 && (
                    <p className="text-[11px] text-slate-400 text-center mt-8 px-2">
                      No reports uploaded for this visit yet
                    </p>
                  )}
                  {reports.map(report => (
                    <button
                      key={report.id}
                      type="button"
                      onClick={() => setSelectedId(report.id)}
                      className={`relative rounded-lg border-2 overflow-hidden text-left transition-colors bg-white ${
                        selectedReport?.id === report.id
                          ? "border-teal-400 shadow-sm"
                          : "border-transparent hover:border-slate-200"
                      }`}
                    >
                      <img
                        src={report.pages[0]?.flattenedDataUrl ?? report.pages[0]?.dataUrl}
                        alt={report.fileName}
                        className="w-full h-20 object-cover bg-slate-100"
                      />
                      {report.pages.length > 1 && (
                        <span className="absolute top-1 right-1 flex items-center gap-0.5 bg-slate-900/70 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
                          <FileText size={9} />
                          {report.pages.length}
                        </span>
                      )}
                      <span className="block px-1.5 py-1 text-[10px] text-slate-600 truncate">
                        {report.fileName}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 bg-white flex-wrap shrink-0">
                  {ANNOTATION_TOOLS.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setTool(id)}
                      title={label}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        tool === id
                          ? "bg-teal-100 text-teal-600"
                          : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      <Icon size={15} />
                    </button>
                  ))}

                  <div className="w-px h-6 bg-slate-200 mx-1" />

                  {ANNOTATION_STROKE_COLORS.map(swatch => (
                    <button
                      key={swatch}
                      type="button"
                      onClick={() => setColor(swatch)}
                      title={swatch}
                      className={`w-6 h-6 rounded-full border-2 shadow-sm shrink-0 ${
                        color === swatch ? "border-slate-700" : "border-white"
                      }`}
                      style={{ backgroundColor: swatch }}
                    />
                  ))}

                  <div className="w-px h-6 bg-slate-200 mx-1" />

                  <input
                    type="range"
                    min={2}
                    max={20}
                    value={strokeWidth}
                    onChange={e => setStrokeWidth(Number(e.target.value))}
                    className="w-20 accent-teal-500"
                    title="Stroke width"
                  />

                  <div className="flex-1" />

                  <button
                    type="button"
                    onClick={() => zoomBy(-0.2)}
                    disabled={scale <= MIN_SCALE}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                  >
                    <ZoomOut size={15} />
                  </button>
                  <span className="text-[11px] font-semibold text-slate-500 w-10 text-center">
                    {Math.round(scale * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => zoomBy(0.2)}
                    disabled={scale >= MAX_SCALE}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                  >
                    <ZoomIn size={15} />
                  </button>

                  <div className="w-px h-6 bg-slate-200 mx-1" />

                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={!selectedReport}
                    title="Delete report"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
                  >
                    <Trash2 size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!selectedReport || !isDirty}
                    className="save-btn !py-1.5 !text-xs flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <Save size={14} />
                    Save
                  </button>
                </div>

                <div ref={canvasAreaRef} className="flex-1 overflow-auto bg-slate-100 p-6">
                  {draftPages.length > 0 ? (
                    <div className="flex flex-col items-center gap-6">
                      {draftPages.map((page, index) => (
                        <div key={page.pageNumber} className="flex flex-col items-center gap-1.5">
                          {draftPages.length > 1 && (
                            <span className="text-[11px] font-semibold text-slate-500">
                              Page {page.pageNumber} of {draftPages.length}
                            </span>
                          )}
                          <ReportAnnotationCanvas
                            src={page.dataUrl}
                            strokes={page.strokes}
                            onStrokesChange={strokes =>
                              handlePageStrokesChange(page.pageNumber, strokes)
                            }
                            tool={tool}
                            color={color}
                            strokeWidth={strokeWidth}
                            scale={scale}
                            stageRef={getStageRef(page.pageNumber)}
                            onImageSize={index === 0 ? handleFirstPageSize : undefined}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 m-auto w-fit">
                      Upload a report to get started
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};

export default ReportAnnotatorModal;
