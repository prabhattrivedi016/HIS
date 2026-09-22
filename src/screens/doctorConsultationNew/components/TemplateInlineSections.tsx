import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { SectionHeaderMappingRecord } from "@/screens/emrControls/types";
import { TemplateItem, TemplateSectionMappingRecord } from "@/screens/emrTemplates/types";
import { Check, Loader2, Printer } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useVisitSavedHeaderValues } from "../hooks/useVisitSavedHeaderValues";
import { EmrSectionAnswerEntry, EmrSectionVisitSnapshotEntry } from "../types";
import { applySnapshotToSectionData } from "../utils/sectionSnapshot";
import EmrSectionRenderer from "./EmrSectionRenderer";

interface TemplateInlineSectionsProps {
  template: TemplateItem;
  doctorId?: number;
  patientId?: number;
  visitId?: number;
  /** this template's entries from earlier this session (if the doctor filled it, switched back to
   * "EMR Sections", then re-selected it) — re-seeds local state so switching away and back doesn't
   * silently drop what was already typed but not yet saved to the backend */
  initialEntries?: EmrSectionAnswerEntry[];
  /** fired continuously (not just on an explicit Apply click, since this view has no modal footer)
   * — the caller (ConsultationEmrSections → doctorConsultationNew/index.tsx) merges this into
   * templateEntriesByTemplateId, the same bucket TemplateFillerModal's onApply already feeds */
  onEntriesChange: (templateId: number, entries: EmrSectionAnswerEntry[]) => void;
  /** opens a print-preview scoped to just this template's currently-filled data — the caller
   * (ConsultationEmrSections → index.tsx) owns the actual PrintPreviewModal instance, since only
   * index.tsx holds the full PatientItem that modal needs. templateId is passed explicitly (not
   * inferred from entries[0]) because entries can be empty — a doctor opening Print to browse this
   * template's past-visit history, without having typed anything this session, must still be able
   * to filter that history down to just this template. */
  onPrint: (templateName: string, entries: EmrSectionAnswerEntry[], templateId: number) => void;
}

/**
 * Inline (non-modal) sibling of TemplateFillerModal — same section-nav-list + EmrSectionRenderer
 * body, extracted so a Template's sections can render directly inside ConsultationEmrSections'
 * panel instead of only behind a full-screen overlay. Deliberately does NOT reuse
 * ConsultationEmrSections' own scrollspy/favorites/layout-toggle/conditional-visibility machinery
 * — none of that has a template equivalent, and reusing it risks bugs that machinery wasn't built
 * to handle for an arbitrary template's section list.
 *
 * UNVERIFIED backend — GET_TEMPLATE_SECTION_MAPPING is a guessed endpoint (see
 * config/defaults/index.ts); a 404/network error degrades to an empty section list rather than a
 * crash, same convention TemplateFillerModal already follows.
 */
const TemplateInlineSections = ({
  template,
  doctorId,
  patientId,
  visitId,
  initialEntries,
  onEntriesChange,
  onPrint,
}: TemplateInlineSectionsProps) => {
  const { fetchApi } = useGlobalApi();

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
  const [headersBySection, setHeadersBySection] = useState<
    Record<number, SectionHeaderMappingRecord[]>
  >({});
  const handleHeadersLoaded = useCallback((sectionId: number, headers: SectionHeaderMappingRecord[]) => {
    setHeadersBySection(prev => ({ ...prev, [sectionId]: headers }));
  }, []);

  // "Current" vs a past timed filling — lets a doctor look at (and edit) an earlier same-day
  // filling without it ever affecting what gets saved: saving always still inserts a new row
  // regardless of which slot is being viewed (savedDataIdsByHeaderId is always passed as
  // undefined to EmrSectionRenderer below, for every Template).
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<"current" | string>("current");
  // the doctor's in-progress "Current" entry, preserved across a peek at a past slot and back —
  // without this, switching to a past slot to check something and switching back would silently
  // wipe out whatever was already being typed in the new entry
  const currentDraftDataRef = useRef<Record<string, unknown>>({});

  const sectionElRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const setSectionElRef = (sectionId: number) => (el: HTMLDivElement | null) => {
    if (el) sectionElRefs.current.set(sectionId, el);
    else sectionElRefs.current.delete(sectionId);
  };

  // reset + re-seed local form state each time a (possibly different) template is selected
  useEffect(() => {
    setData({});
    setSectionProgress({});
    setSelectedTimeSlot("current");
    currentDraftDataRef.current = {};
    if (initialEntries && initialEntries.length > 0) {
      const bucketed: Record<number, EmrSectionAnswerEntry[]> = {};
      initialEntries.forEach(entry => {
        (bucketed[entry.sectionId] ??= []).push(entry);
      });
      setEntriesBySectionId(bucketed);
    } else {
      setEntriesBySectionId({});
    }
    // only re-seed when switching to a different template, not on every entries change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template.templateId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setSectionsLoading(true);
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_TEMPLATE_SECTION_MAPPING,
        {},
        { params: { templateId: template.templateId } },
        { component: "TemplateInlineSections", silent: true }
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
    // fetchApi (useGlobalApi) is a new function identity every render, not memoized — listing it
    // here would restart this effect (and cancel the in-flight fetch) on every render, so the
    // section mapping would never finish loading. Deliberately depend on template.templateId only,
    // same as TemplateFillerModal's equivalent effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template.templateId]);

  // every Template — not just ones with IsMultipleEntryAllow=1 — always inserts a new row and
  // starts blank on load, per explicit instruction ("in case of template... insert every time,
  // dataId 0 every time"). Fetched unconditionally (needed to build the time-slot list below), but
  // savedHeaderValuesBySectionId/savedDataIdsByHeaderId are never passed to EmrSectionRenderer for
  // a Template (see below): no savedDataIdsByHeaderId means every entry's dataId resolves to
  // undefined -> 0 (insert) all the way down to the actual save call regardless of which time slot
  // is being viewed, and no savedHeaderValues means "Current" starts blank instead of
  // pre-populated with whatever was entered last time. This is Template-only — the doctor's
  // regular, always-visible EMR Sections panel (ConsultationEmrSections.tsx) is untouched and
  // keeps its normal upsert/hydration behavior.
  const { savedHeaderRows } = useVisitSavedHeaderValues(visitId);

  // one entry per distinct HH:MM this template was actually saved at (same granularity already
  // shown in the History strip/print) — every Template inserts a new row on every save, so this
  // naturally stays empty until it's actually been saved more than once today
  const timeSlots = useMemo(() => {
    const bySlot = new Map<string, typeof savedHeaderRows>();
    savedHeaderRows
      .filter(row => row.TemplateId === template.templateId)
      .forEach(row => {
        const d = new Date(row.CreatedOn);
        if (Number.isNaN(d.getTime())) return;
        const label = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
        const bucket = bySlot.get(label) ?? [];
        bucket.push(row);
        bySlot.set(label, bucket);
      });
    return Array.from(bySlot.entries())
      .map(([label, rows]) => ({ label, rows }))
      .sort((a, b) => b.label.localeCompare(a.label));
  }, [savedHeaderRows, template.templateId]);

  const handleSelectTimeSlot = (choice: "current" | string) => {
    if (choice === selectedTimeSlot) return;
    if (choice === "current") {
      setData(currentDraftDataRef.current);
      setSelectedTimeSlot("current");
      return;
    }
    const slot = timeSlots.find(s => s.label === choice);
    if (!slot) return;

    const rowsBySectionId = new Map<number, EmrSectionVisitSnapshotEntry["values"]>();
    slot.rows.forEach(row => {
      let value: unknown;
      try {
        value = JSON.parse(row.HeaderValue);
      } catch {
        value = row.HeaderValue;
      }
      const bucket = rowsBySectionId.get(row.SectionId) ?? [];
      bucket.push({
        headerId: row.HeaderId,
        headerName: "",
        controlType: "",
        value,
        dataId: row.DataId,
        createdOn: row.CreatedOn,
      });
      rowsBySectionId.set(row.SectionId, bucket);
    });

    let next: Record<string, unknown> = {};
    rowsBySectionId.forEach((values, sectionId) => {
      next = applySnapshotToSectionData(next, sectionId, headersBySection[sectionId] ?? [], values);
    });
    setData(next);
    setSelectedTimeSlot(choice);
  };

  // mirrors every "Current" edit into the draft ref so switching to a past slot and back doesn't
  // lose in-progress typing — only while "Current" is actually the active slot, so viewing (and
  // editing) a past slot never overwrites the real draft
  const handleDataChange = useCallback(
    (
      updater: Record<string, unknown> | ((prev: Record<string, unknown>) => Record<string, unknown>)
    ) => {
      setData(prev => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        if (selectedTimeSlot === "current") currentDraftDataRef.current = next;
        return next;
      });
    },
    [selectedTimeSlot]
  );

  const handleSectionEntries = useCallback(
    (sectionId: number, entries: EmrSectionAnswerEntry[]) => {
      setEntriesBySectionId(prev =>
        prev[sectionId] === entries ? prev : { ...prev, [sectionId]: entries }
      );
    },
    []
  );

  // every change (not just an explicit "Apply") propagates up, stamped with this template's id.
  // Content-compared against the last propagated value (same pattern as controlRegistry.tsx's
  // ImageUploadControl lastSyncedRef) before calling onEntriesChange — EmrSectionRenderer's own
  // reportedEntries can produce a new array reference on renders where nothing actually changed
  // (e.g. every section sharing one `data` object re-deriving on any single section's update), and
  // without this guard that reference churn keeps calling back up into the parent's own state
  // indefinitely instead of settling once real content stops changing.
  const lastPropagatedRef = useRef("");
  useEffect(() => {
    const entries = Object.values(entriesBySectionId)
      .flat()
      .map(entry => ({ ...entry, templateId: template.templateId }));
    const serialized = JSON.stringify(entries);
    if (serialized === lastPropagatedRef.current) return;
    lastPropagatedRef.current = serialized;
    onEntriesChange(template.templateId, entries);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entriesBySectionId, template.templateId]);

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

  const handlePrintClick = () => {
    const entries = Object.values(entriesBySectionId)
      .flat()
      .map(entry => ({ ...entry, templateId: template.templateId }));
    onPrint(template.displayName || template.templateName, entries, template.templateId);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-end gap-2">
        {/* only for a multi-entry template that's actually been saved more than once today —
            an ordinary template never has more than one row per header, so never shows this */}
        {timeSlots.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Time slot
            </span>
            <select
              className="input-field !mb-0 !py-1.5 text-xs w-36"
              value={selectedTimeSlot}
              onChange={e => handleSelectTimeSlot(e.target.value)}
            >
              <option value="current">Current (new entry)</option>
              {timeSlots.map(slot => (
                <option key={slot.label} value={slot.label}>
                  {slot.label}
                </option>
              ))}
            </select>
          </div>
        )}
        <button
          type="button"
          onClick={handlePrintClick}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 border border-slate-200 rounded-md px-2.5 py-1.5 hover:bg-white hover:text-[#0B5394] hover:border-[#0B5394]/40 transition-colors"
        >
          <Printer size={13} />
          Print
        </button>
      </div>

      <div className="emr-shell flex min-h-72 max-h-[760px]">
        <div className="emr-sidebar w-64 shrink-0 border-r border-slate-100 bg-slate-50/60 p-3 overflow-y-auto">
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

        <div className="emr-content flex-1 min-w-0 p-4 overflow-y-auto bg-gradient-to-br from-sky-50 via-blue-50/40 to-slate-50">
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
                  onDataChange={handleDataChange}
                  onHeadersLoaded={headers => handleHeadersLoaded(section.sectionId, headers)}
                  doctorId={doctorId}
                  patientId={patientId}
                  visitId={visitId}
                  onProgressChange={handleSectionProgress}
                  onEntriesChange={handleSectionEntries}
                  // never hydrate a Template section from a previous save — see the
                  // useVisitSavedHeaderValues comment above for why
                  savedHeaderValues={undefined}
                  savedDataIdsByHeaderId={undefined}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateInlineSections;
