import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import { TemplateItem, TemplateSectionMappingRecord } from "@/screens/emrTemplates/types";
import { Check, LayoutTemplate, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { EmrSectionAnswerEntry, EmrSectionVisitSnapshotEntry, RawConsultationHeaderRow } from "../types";
import EmrSectionRenderer from "./EmrSectionRenderer";

interface TemplateFillerModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: TemplateItem | null;
  doctorId?: number;
  patientId?: number;
  visitId?: number;
  /** flattened, templateId-stamped entries for every section in this template — merged by the
   * caller into the same consultationPayload the doctor's normal EMR Sections panel builds, so
   * one Save action covers both (see doctorConsultationNew/index.tsx's consultationPayload) */
  onApply: (templateId: number, entries: EmrSectionAnswerEntry[]) => void;
}

/**
 * Full-screen "fill this template" modal — its sections render via the EXACT same
 * EmrSectionRenderer used by the doctor's always-visible EMR Sections panel (ConsultationEmrSections
 * .tsx), looped over just this template's ordered section list instead of the doctor's full
 * assigned set. No new rendering engine; only the section list source, the internal nav
 * (a plain list here — no scrollspy/favorites/layout-toggle, that polish belongs to the main
 * panel), and the save destination (an onApply callback instead of its own network call) differ.
 *
 * UNVERIFIED backend — GET_TEMPLATE_SECTION_MAPPING is a guessed endpoint (see
 * config/defaults/index.ts); a 404/network error degrades to an empty section list rather than
 * a crash, same graceful-degradation convention as every other silent query in this codebase.
 */
const TemplateFillerModal = ({
  isOpen,
  onClose,
  template,
  doctorId,
  patientId,
  visitId,
  onApply,
}: TemplateFillerModalProps) => {
  const { fetchApi } = useGlobalApi();
  useScrollLock(isOpen);

  const [templateSections, setTemplateSections] = useState<TemplateSectionMappingRecord[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<number | null>(null);
  const [data, setData] = useState<Record<string, unknown>>({});
  const [entriesBySectionId, setEntriesBySectionId] = useState<
    Record<number, EmrSectionAnswerEntry[]>
  >({});
  const [sectionProgress, setSectionProgress] = useState<
    Record<number, { filled: number; total: number }>
  >({});

  const sectionElRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const setSectionElRef = (sectionId: number) => (el: HTMLDivElement | null) => {
    if (el) sectionElRefs.current.set(sectionId, el);
    else sectionElRefs.current.delete(sectionId);
  };

  // reset local form state each time the modal is opened for a (possibly different) template
  useEffect(() => {
    if (!isOpen) return;
    setData({});
    setEntriesBySectionId({});
    setSectionProgress({});
  }, [isOpen, template?.templateId]);

  useEffect(() => {
    if (!isOpen || !template) {
      setTemplateSections([]);
      return;
    }

    let cancelled = false;
    (async () => {
      setSectionsLoading(true);
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_TEMPLATE_SECTION_MAPPING,
        {},
        { params: { templateId: template.templateId } },
        { component: "TemplateFillerModal", silent: true }
      );
      if (cancelled) return;
      const raw: any[] = resp?.data ?? [];
      const mapped: TemplateSectionMappingRecord[] = raw
        .map(m => ({
          mappingId: m.MappingId,
          templateId: m.TemplateId,
          sectionId: m.SectionId,
          sectionName: m.SectionName,
          displayName: m.DisplayName,
          sequenceNo: m.SequenceNo,
        }))
        .sort((a, b) => a.sequenceNo - b.sequenceNo);
      setTemplateSections(mapped);
      setActiveSectionId(mapped[0]?.sectionId ?? null);
      setSectionsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, template]);

  // this visit's previously-saved header values, so reopening/refilling a template shows prior
  // answers and upserts (dataId) instead of duplicating rows — verbatim copy of
  // ConsultationEmrSections.tsx's own savedHeaderValuesBySectionId/savedDataIdsByHeaderId, fetched
  // independently here since this modal has no access to the main panel's already-loaded copy
  const [savedHeaderRows, setSavedHeaderRows] = useState<RawConsultationHeaderRow[]>([]);

  useEffect(() => {
    if (!isOpen || visitId == null) {
      setSavedHeaderRows([]);
      return;
    }

    let cancelled = false;
    (async () => {
      const resp = await fetchApi<{ data?: RawConsultationHeaderRow[] }>(
        "GET",
        ENDPOINTS.GET_DOCTOR_CONSULTATION_BY_VISIT_ID,
        {},
        { params: { visitId } },
        { component: "TemplateFillerModal", silent: true }
      );
      if (cancelled) return;
      setSavedHeaderRows(resp?.data ?? []);
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, visitId]);

  const savedHeaderValuesBySectionId = useMemo(() => {
    const map = new Map<number, EmrSectionVisitSnapshotEntry["values"]>();
    savedHeaderRows.forEach(row => {
      let value: unknown;
      try {
        value = JSON.parse(row.HeaderValue);
      } catch {
        value = row.HeaderValue;
      }
      const bucket = map.get(row.SectionId) ?? [];
      bucket.push({ headerId: row.HeaderId, headerName: "", controlType: "", value });
      map.set(row.SectionId, bucket);
    });
    return map;
  }, [savedHeaderRows]);

  const savedDataIdsByHeaderId = useMemo(() => {
    const map = new Map<number, number>();
    savedHeaderRows.forEach(row => map.set(row.HeaderId, row.DataId));
    return map;
  }, [savedHeaderRows]);

  const handleSectionEntries = useCallback(
    (sectionId: number, entries: EmrSectionAnswerEntry[]) => {
      setEntriesBySectionId(prev =>
        prev[sectionId] === entries ? prev : { ...prev, [sectionId]: entries }
      );
    },
    []
  );

  const handleSectionProgress = useCallback((sectionId: number, filled: number, total: number) => {
    setSectionProgress(prev => {
      const existing = prev[sectionId];
      if (existing && existing.filled === filled && existing.total === total) return prev;
      return { ...prev, [sectionId]: { filled, total } };
    });
  }, []);

  const isSectionAnswered = (sectionId: number) => (sectionProgress[sectionId]?.filled ?? 0) > 0;

  const handleSelectSection = (sectionId: number) => {
    setActiveSectionId(sectionId);
    sectionElRefs.current.get(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleApply = () => {
    if (!template) return;
    const entries: EmrSectionAnswerEntry[] = Object.values(entriesBySectionId)
      .flat()
      .map(entry => ({ ...entry, templateId: template.templateId }));
    onApply(template.templateId, entries);
    onClose();
  };

  if (!isOpen || !template) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[90] bg-black/40" onClick={onClose} />

      <div className="fixed inset-0 z-[91] pointer-events-none">
        <div className="bg-white w-screen h-screen flex flex-col pointer-events-auto overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3.5 border-b bg-gradient-to-r from-slate-50 via-white to-slate-50 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg shadow-sm bg-gradient-to-br from-[#0B5394] to-[#1C7EC2]">
                <LayoutTemplate size={15} className="text-white" />
              </span>
              <h3 className="text-sm font-bold text-slate-700 tracking-wide">
                {template.displayName || template.templateName}
              </h3>
            </div>
            <button onClick={onClose} className="close-drawer-btn">
              ×
            </button>
          </div>

          <div className="flex flex-1 min-h-0">
            {/* "All Sections" nav — plain list, no scrollspy/favorites/layout-toggle (that
                polish belongs to ConsultationEmrSections' always-visible panel, not this
                ad-hoc filler) */}
            <div className="w-64 shrink-0 border-r border-slate-100 bg-slate-50/60 p-3 overflow-y-auto">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide px-1 mb-2">
                All Sections
              </p>
              {sectionsLoading ? (
                <div className="flex items-center gap-2 text-xs text-gray-400 px-1 py-2">
                  <Loader2 size={13} className="animate-spin" />
                  Loading…
                </div>
              ) : templateSections.length === 0 ? (
                <p className="text-xs text-gray-400 px-1">No sections configured</p>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {templateSections.map(section => {
                    const isActive = section.sectionId === activeSectionId;
                    const isComplete = isSectionAnswered(section.sectionId);
                    return (
                      <button
                        key={section.sectionId}
                        type="button"
                        onClick={() => handleSelectSection(section.sectionId)}
                        className={`flex items-center justify-between gap-2 text-left px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                          isActive
                            ? "bg-white shadow-sm text-[#0B5394]"
                            : "text-slate-600 hover:bg-white/70"
                        }`}
                      >
                        <span className="truncate">{section.displayName || section.sectionName}</span>
                        {isComplete && (
                          <Check size={12} className="text-emerald-500 shrink-0" strokeWidth={3} />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 p-4 overflow-y-auto bg-gradient-to-br from-sky-50 via-blue-50/40 to-slate-50">
              {sectionsLoading ? (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400 py-16">
                  <Loader2 size={16} className="animate-spin" />
                  Loading template…
                </div>
              ) : templateSections.length === 0 ? (
                <div className="text-center text-gray-400 py-16 text-sm">
                  This template has no sections mapped yet
                </div>
              ) : (
                templateSections.map(section => (
                  <div
                    key={section.sectionId}
                    ref={setSectionElRef(section.sectionId)}
                    className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 mb-4 last:mb-0 scroll-mt-3"
                  >
                    <EmrSectionRenderer
                      sectionId={section.sectionId}
                      sectionName={section.sectionName}
                      displayName={section.displayName}
                      data={data}
                      onDataChange={setData}
                      doctorId={doctorId}
                      patientId={patientId}
                      visitId={visitId}
                      onProgressChange={handleSectionProgress}
                      onEntriesChange={handleSectionEntries}
                      savedHeaderValues={savedHeaderValuesBySectionId.get(section.sectionId)}
                      savedDataIdsByHeaderId={savedDataIdsByHeaderId}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-slate-100 shrink-0">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="save-btn" onClick={handleApply}>
              Apply to visit
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default TemplateFillerModal;
