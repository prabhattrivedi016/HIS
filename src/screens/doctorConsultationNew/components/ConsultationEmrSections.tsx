import { getByPath } from "@/components/dynamicForm/utils/path";
import SubmitButton from "@/components/globalButtons/SubmitButton";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import {
  EmrSectionMappingTableItem,
  SectionHeaderMappingRecord,
} from "@/screens/emrControls/types";
import { useEmrSectionLayout } from "@/store/useEmrSectionLayout";
import { showError, showSuccess } from "@/utils/alert";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  Baby,
  CalendarClock,
  Check,
  ClipboardList,
  FlaskConical,
  Loader2,
  LucideIcon,
  MoreHorizontal,
  NotebookPen,
  PanelLeft,
  PanelTop,
  Pill,
  Sparkles,
  Star,
  Stethoscope,
} from "lucide-react";
import { MouseEvent as ReactMouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { EmrSectionAnswerEntry } from "../types";
import CircularProgress from "./CircularProgress";
import EmrSectionRenderer from "./EmrSectionRenderer";

interface ConsultationEmrSectionsProps {
  doctorId?: number;
  onSectionsChange?: (entries: EmrSectionAnswerEntry[]) => void;
}

const dataPathFor = (sectionId: number, headerId: number) =>
  `section_${sectionId}.header_${headerId}`;

const getSectionIcon = (name: string): LucideIcon => {
  const key = (name || "").toLowerCase();
  if (key.includes("diagnos")) return Stethoscope;
  if (key.includes("complaint")) return AlertCircle;
  if (key.includes("prescription") || key.includes("medicine") || key.includes("drug")) return Pill;
  if (key.includes("note") || key.includes("progress")) return NotebookPen;
  if (key.includes("investig") || key.includes("lab") || key.includes("test")) return FlaskConical;
  if (key.includes("follow")) return CalendarClock;
  if (key.includes("deliver")) return Baby;
  if (key.includes("vital")) return Activity;
  return ClipboardList;
};

const VISIBLE_TAB_LIMIT = 5;

const SECTION_ACCENTS = [
  {
    grad: "from-blue-500 to-cyan-400",
    ring: "text-blue-500",
    text: "text-blue-700",
    soft: "bg-blue-50",
  },
  {
    grad: "from-violet-500 to-fuchsia-400",
    ring: "text-violet-500",
    text: "text-violet-700",
    soft: "bg-violet-50",
  },
  {
    grad: "from-rose-500 to-orange-400",
    ring: "text-rose-500",
    text: "text-rose-700",
    soft: "bg-rose-50",
  },
  {
    grad: "from-emerald-500 to-teal-400",
    ring: "text-emerald-500",
    text: "text-emerald-700",
    soft: "bg-emerald-50",
  },
  {
    grad: "from-amber-500 to-yellow-400",
    ring: "text-amber-500",
    text: "text-amber-700",
    soft: "bg-amber-50",
  },
  {
    grad: "from-indigo-500 to-blue-400",
    ring: "text-indigo-500",
    text: "text-indigo-700",
    soft: "bg-indigo-50",
  },
];

interface SectionPillProps {
  section: EmrSectionMappingTableItem;
  accent: (typeof SECTION_ACCENTS)[number];
  isActive: boolean;
  isComplete: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: (e: ReactMouseEvent) => void;
  fullWidth?: boolean;
}

const SectionPill = ({
  section,
  accent,
  isActive,
  isComplete,
  isFavorite,
  onSelect,
  onToggleFavorite,
  fullWidth,
}: SectionPillProps) => {
  const Icon = getSectionIcon(section.displayName || section.sectionName);
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileTap={{ scale: 0.96 }}
      className={`group relative flex items-center gap-1.5 h-9 rounded-full pl-1.5 pr-2.5 text-[12.5px] font-semibold transition-colors ${
        fullWidth ? "w-full" : "shrink-0"
      } ${isActive ? "text-white" : "text-slate-600 hover:bg-white hover:shadow-sm"}`}
    >
      {isActive && (
        <motion.span
          layoutId="emrSectionActivePill"
          className={`absolute inset-0 rounded-full bg-gradient-to-r ${accent.grad} shadow-md`}
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
        />
      )}

      <span
        className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full shrink-0 ${
          isActive ? "bg-white/25" : accent.soft
        }`}
      >
        <Icon size={12} className={isActive ? "text-white" : accent.text} strokeWidth={2.25} />
      </span>

      <span
        className={`relative z-10 ${fullWidth ? "flex-1 min-w-0 text-left truncate" : "whitespace-nowrap"}`}
      >
        {section.displayName || section.sectionName}
      </span>

      <span
        className={`relative z-10 w-1.5 h-1.5 rounded-full shrink-0 ${
          isComplete ? "bg-emerald-400" : isActive ? "bg-white/60" : "bg-red-300"
        }`}
      />

      <span
        role="button"
        tabIndex={-1}
        onClick={onToggleFavorite}
        title={isFavorite ? "Remove from favourites" : "Mark as favourite"}
        className={`relative z-10 shrink-0 flex items-center justify-center w-4 h-4 rounded-full transition-opacity ${
          isFavorite ? "opacity-100" : "opacity-0 group-hover:opacity-70"
        }`}
      >
        <Star
          size={11}
          className={
            isFavorite
              ? isActive
                ? "fill-white text-white"
                : "fill-sky-500 text-sky-500"
              : isActive
                ? "text-white"
                : "text-slate-400"
          }
        />
      </span>
    </motion.button>
  );
};

const ConsultationEmrSections = ({ doctorId, onSectionsChange }: ConsultationEmrSectionsProps) => {
  const { fetchApi } = useGlobalApi();
  const { layout, toggleLayout } = useEmrSectionLayout();

  const [activeSectionId, setActiveSectionId] = useState<number | null>(null);
  const [data, setData] = useState<Record<string, unknown>>({});
  const [headersBySection, setHeadersBySection] = useState<
    Record<number, SectionHeaderMappingRecord[]>
  >({});
  const [favoriteSectionIds, setFavoriteSectionIds] = useState<number[]>([]);
  const [savedFavoriteSectionIds, setSavedFavoriteSectionIds] = useState<number[]>([]);
  const [isSavingFavorites, setIsSavingFavorites] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const moreMenuRef = useRef<HTMLDivElement>(null);

  // load this doctor's saved favourite sections so they render first on page load
  useEffect(() => {
    if (doctorId == null) {
      setFavoriteSectionIds([]);
      setSavedFavoriteSectionIds([]);
      return;
    }

    let cancelled = false;
    (async () => {
      const resp = await fetchApi<{ data?: Array<{ DoctorId: number; SectionId: number }> }>(
        "GET",
        ENDPOINTS.GET_DOCTOR_FAVOURITE_EMR_SECTIONS,
        {},
        { params: { doctorId } },
        { component: "ConsultationEmrSections", silent: true }
      );
      if (cancelled) return;
      const raw = resp?.data ?? [];
      const ids = raw.map(s => Number(s.SectionId)).filter(id => !Number.isNaN(id));
      setFavoriteSectionIds(ids);
      setSavedFavoriteSectionIds(ids);
    })();

    return () => {
      cancelled = true;
    };
  }, [doctorId]);

  const hasUnsavedFavorites = useMemo(() => {
    if (favoriteSectionIds.length !== savedFavoriteSectionIds.length) return true;
    const savedSet = new Set(savedFavoriteSectionIds);
    return favoriteSectionIds.some(id => !savedSet.has(id));
  }, [favoriteSectionIds, savedFavoriteSectionIds]);

  const toggleFavorite = (sectionId: number, e: ReactMouseEvent) => {
    e.stopPropagation();
    setFavoriteSectionIds(prev =>
      prev.includes(sectionId) ? prev.filter(id => id !== sectionId) : [...prev, sectionId]
    );
  };

  const handleSaveFavorites = async () => {
    if (doctorId == null || !hasUnsavedFavorites) return;
    setIsSavingFavorites(true);
    try {
      await fetchApi(
        "POST",
        ENDPOINTS.SAVE_DOCTOR_FAVOURITE_EMR_SECTIONS,
        { doctorId, sectionIds: favoriteSectionIds },
        {},
        { component: "ConsultationEmrSections", throwOnError: true }
      );
      setSavedFavoriteSectionIds(favoriteSectionIds);
      showSuccess("Favourite sections saved");
    } catch {
      showError("Could not save favourite sections");
    } finally {
      setIsSavingFavorites(false);
    }
  };

  const getAllEmrSections = async (): Promise<EmrSectionMappingTableItem[]> => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_ALL_EMR_SECTIONS,
      {},
      { params: { isActive: 1 } },
      { component: "ConsultationEmrSections", silent: true }
    );
    const raw: any[] = resp?.data ?? [];
    return raw
      .map(s => ({
        sectionId: s.SectionId,
        sectionName: s.SectionName,
        displayName: s.DisplayName,
        isActive: s.IsActive,
        mappingId: 0,
        sequenceNo: 0,
      }))
      .filter(s => Number(s.isActive) === 1);
  };

  const { data: mappedSections = [], isLoading: sectionsLoading } = useQuery<
    EmrSectionMappingTableItem[]
  >({
    queryKey: ["consultationEmrSections"],
    queryFn: getAllEmrSections,
  });

  useEffect(() => {
    setActiveSectionId(mappedSections[0]?.sectionId ?? null);
  }, [mappedSections]);

  useEffect(() => {
    if (!onSectionsChange) return;

    const entries: EmrSectionAnswerEntry[] = [];
    mappedSections.forEach(section => {
      const headers = headersBySection[section.sectionId] ?? [];
      headers.forEach(h => {
        const value = getByPath(data, dataPathFor(section.sectionId, h.headerId));
        if (value === undefined || value === null || value === "") return;
        entries.push({
          sectionId: section.sectionId,
          sectionName: section.sectionName,
          headerId: h.headerId,
          headerName: h.headerName,
          controlType: h.controlType,
          value,
        });
      });
    });
    onSectionsChange(entries);
  }, [data, mappedSections, headersBySection]);

  const isSectionAnswered = (sectionId: number) => {
    const sectionData = data[`section_${sectionId}`] as Record<string, unknown> | undefined;
    if (!sectionData) return false;
    return Object.values(sectionData).some(
      v => v !== undefined && v !== null && String(v).trim() !== ""
    );
  };

  const getSectionPercent = (sectionId: number) => {
    const headers = headersBySection[sectionId] ?? [];
    if (headers.length === 0) return 0;
    const filled = headers.filter(h => {
      const value = getByPath(data, dataPathFor(sectionId, h.headerId));
      return value !== undefined && value !== null && String(value).trim() !== "";
    }).length;
    return Math.round((filled / headers.length) * 100);
  };

  const activeSection = mappedSections.find(s => s.sectionId === activeSectionId);
  const answeredCount = mappedSections.filter(s => isSectionAnswered(s.sectionId)).length;
  const total = mappedSections.length || 1;
  const percent = Math.round((answeredCount / total) * 100);

  const accentBySectionId = useMemo(() => {
    const map = new Map<number, (typeof SECTION_ACCENTS)[number]>();
    mappedSections.forEach((s, idx) =>
      map.set(s.sectionId, SECTION_ACCENTS[idx % SECTION_ACCENTS.length])
    );
    return map;
  }, [mappedSections]);

  // Favourites always render first; selecting a tab never changes its position.
  const orderedSections = useMemo(() => {
    const favoriteIds = new Set(favoriteSectionIds);
    const favorites = mappedSections.filter(s => favoriteIds.has(s.sectionId));
    const rest = mappedSections.filter(s => !favoriteIds.has(s.sectionId));
    return [...favorites, ...rest];
  }, [mappedSections, favoriteSectionIds]);

  const visibleSections = orderedSections.slice(0, VISIBLE_TAB_LIMIT);
  const overflowSections = orderedSections.slice(VISIBLE_TAB_LIMIT);

  useEffect(() => {
    if (!isMoreOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMoreOpen]);

  return (
    <div className="relative rounded-2xl border border-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)] mt-3 overflow-hidden bg-white">
      {/* ── glow header ── */}
      <div className="relative flex items-center justify-between gap-3 px-4 py-2 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 shadow-sm">
            <Sparkles size={13} className="text-white" />
          </span>
          <h3 className="text-[13px] font-bold text-slate-700 tracking-wide">EMR Sections</h3>
        </div>

        <div className="flex items-center gap-2">
          <CircularProgress
            percent={percent}
            size={30}
            strokeWidth={3}
            progressClassName={percent === 100 ? "text-emerald-500" : "text-indigo-500"}
          >
            {percent === 100 ? (
              <Check size={12} className="text-emerald-500" />
            ) : (
              <span className="text-[9px] font-bold text-slate-600">{percent}%</span>
            )}
          </CircularProgress>
          <span className="text-[11px] font-semibold text-slate-500">
            {answeredCount}/{mappedSections.length || 0} done
          </span>

          <button
            type="button"
            onClick={toggleLayout}
            title={layout === "horizontal" ? "Switch to side tabs" : "Switch to top tabs"}
            className="flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:text-slate-700 hover:border-slate-300 transition-colors"
          >
            {layout === "horizontal" ? <PanelLeft size={14} /> : <PanelTop size={14} />}
          </button>
        </div>
      </div>

      {sectionsLoading ? (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400 py-16">
          <Loader2 size={16} className="animate-spin" />
          Loading EMR sections…
        </div>
      ) : mappedSections.length === 0 ? (
        <div className="text-center text-gray-400 py-10 text-sm">No active EMR sections found</div>
      ) : layout === "vertical" ? (
        <div className="flex">
          <div className="flex flex-col gap-1 w-64 shrink-0 border-r border-slate-100 bg-slate-50/40 p-2.5 max-h-[560px] overflow-y-auto scrollbar-none">
            {orderedSections.map(section => {
              const isActive = section.sectionId === activeSectionId;
              const isComplete = getSectionPercent(section.sectionId) >= 100;
              const accent = accentBySectionId.get(section.sectionId) ?? SECTION_ACCENTS[0];

              return (
                <SectionPill
                  key={section.sectionId}
                  section={section}
                  accent={accent}
                  isActive={isActive}
                  isComplete={isComplete}
                  isFavorite={favoriteSectionIds.includes(section.sectionId)}
                  onSelect={() => setActiveSectionId(section.sectionId)}
                  onToggleFavorite={e => toggleFavorite(section.sectionId, e)}
                  fullWidth
                />
              );
            })}

            {doctorId != null && (
              <SubmitButton
                type="button"
                label={
                  isSavingFavorites ? "Saving…" : hasUnsavedFavorites ? "Save favourites" : "Saved"
                }
                onClick={handleSaveFavorites}
                disabled={!hasUnsavedFavorites || isSavingFavorites}
                className="!h-9 !w-full !px-3 !py-0 !text-[12px] !rounded-full mt-1 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-sky-500"
              />
            )}
          </div>

          {/* ── active section panel ── */}
          <div className="flex-1 min-w-0 px-4 pt-3 pb-4 min-h-72 max-h-[560px] overflow-y-auto scrollbar-none">
            <AnimatePresence mode="wait">
              {activeSection && (
                <motion.div
                  key={activeSection.sectionId}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <EmrSectionRenderer
                    sectionId={activeSection.sectionId}
                    sectionName={activeSection.sectionName}
                    displayName={activeSection.displayName}
                    data={data}
                    onDataChange={setData}
                    onHeadersLoaded={headers =>
                      setHeadersBySection(prev => ({ ...prev, [activeSection.sectionId]: headers }))
                    }
                    doctorId={doctorId}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="relative flex items-center gap-1.5 px-3 py-1.5 border-b border-slate-100 bg-slate-50/40">
            {visibleSections.map(section => {
              const isActive = section.sectionId === activeSectionId;
              const isComplete = getSectionPercent(section.sectionId) >= 100;
              const accent = accentBySectionId.get(section.sectionId) ?? SECTION_ACCENTS[0];

              return (
                <SectionPill
                  key={section.sectionId}
                  section={section}
                  accent={accent}
                  isActive={isActive}
                  isComplete={isComplete}
                  isFavorite={favoriteSectionIds.includes(section.sectionId)}
                  onSelect={() => setActiveSectionId(section.sectionId)}
                  onToggleFavorite={e => toggleFavorite(section.sectionId, e)}
                />
              );
            })}

            {overflowSections.length > 0 && (
              <div className="relative shrink-0" ref={moreMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsMoreOpen(o => !o)}
                  title="More sections"
                  className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${
                    isMoreOpen
                      ? "bg-white shadow-sm ring-1 ring-slate-200 text-slate-700"
                      : "text-slate-500 hover:bg-white hover:shadow-sm"
                  }`}
                >
                  <MoreHorizontal size={16} />
                </button>

                <AnimatePresence>
                  {isMoreOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.97 }}
                      transition={{ duration: 0.14 }}
                      className="absolute right-0 top-11 z-30 w-56 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg p-1.5"
                    >
                      {overflowSections.map(section => {
                        const isActive = section.sectionId === activeSectionId;
                        const isComplete = getSectionPercent(section.sectionId) >= 100;
                        const isFavorite = favoriteSectionIds.includes(section.sectionId);
                        const accent =
                          accentBySectionId.get(section.sectionId) ?? SECTION_ACCENTS[0];
                        const Icon = getSectionIcon(section.displayName || section.sectionName);

                        return (
                          <button
                            key={section.sectionId}
                            type="button"
                            onClick={() => {
                              setActiveSectionId(section.sectionId);
                              setIsMoreOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors ${
                              isActive ? "bg-slate-100" : "hover:bg-slate-50"
                            }`}
                          >
                            <span
                              className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 ${accent.soft}`}
                            >
                              <Icon size={12} className={accent.text} strokeWidth={2.25} />
                            </span>
                            <span
                              className={`flex-1 min-w-0 text-[12.5px] truncate ${
                                isActive
                                  ? "font-bold text-slate-900"
                                  : "font-semibold text-slate-700"
                              }`}
                            >
                              {section.displayName || section.sectionName}
                            </span>
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                isComplete ? "bg-emerald-400" : "bg-red-300"
                              }`}
                            />
                            <span
                              role="button"
                              tabIndex={-1}
                              onClick={e => toggleFavorite(section.sectionId, e)}
                              title={isFavorite ? "Remove from favourites" : "Mark as favourite"}
                              className="shrink-0 flex items-center justify-center w-5 h-5 rounded hover:bg-slate-100"
                            >
                              <Star
                                size={12}
                                className={
                                  isFavorite ? "fill-sky-500 text-sky-500" : "text-slate-300"
                                }
                              />
                            </span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {doctorId != null && (
              <SubmitButton
                type="button"
                label={
                  isSavingFavorites ? "Saving…" : hasUnsavedFavorites ? "Save favourites" : "Saved"
                }
                onClick={handleSaveFavorites}
                disabled={!hasUnsavedFavorites || isSavingFavorites}
                className="!h-9 !w-auto !px-3 !py-0 !text-[12px] !rounded-full shrink-0 ml-auto bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-sky-500"
              />
            )}
          </div>

          {/* ── active section panel ── */}
          <div className="px-4 pt-3 pb-4 min-h-72 max-h-[520px] overflow-y-auto scrollbar-none">
            <AnimatePresence mode="wait">
              {activeSection && (
                <motion.div
                  key={activeSection.sectionId}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <EmrSectionRenderer
                    sectionId={activeSection.sectionId}
                    sectionName={activeSection.sectionName}
                    displayName={activeSection.displayName}
                    data={data}
                    onDataChange={setData}
                    onHeadersLoaded={headers =>
                      setHeadersBySection(prev => ({ ...prev, [activeSection.sectionId]: headers }))
                    }
                    doctorId={doctorId}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationEmrSections;
