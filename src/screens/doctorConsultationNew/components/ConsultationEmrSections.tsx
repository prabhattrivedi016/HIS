import SubmitButton from "@/components/globalButtons/SubmitButton";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import {
  EmrSectionMappingTableItem,
  SectionHeaderMappingRecord,
} from "@/screens/emrControls/types";
import { useEmrSectionLayout } from "@/store/useEmrSectionLayout";
import "@/styles/emr.css";
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
  Eye,
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
import {
  MouseEvent as ReactMouseEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useInView } from "react-intersection-observer";
import { EmrSectionAnswerEntry } from "../types";
import CircularProgress from "./CircularProgress";
import EmrSectionHistoryDrawer from "./EmrSectionHistoryDrawer";
import EmrSectionRenderer from "./EmrSectionRenderer";
import ReportAnnotatorModal from "./ReportAnnotatorModal";

interface ConsultationEmrSectionsProps {
  doctorId?: number;
  patientId?: number;
  visitId?: number;
  onSectionsChange?: (entries: EmrSectionAnswerEntry[]) => void;
}

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

// scrollspy tuning for react-intersection-observer — module-level so these keep a stable
// reference across renders (an inline array/object here would make useInView tear down and
// recreate its observer on every keystroke, since this screen re-renders constantly as data changes)
const SCROLLSPY_ROOT_MARGIN = "-10% 0px -70% 0px";
const SCROLLSPY_THRESHOLD = [0, 0.25, 0.5, 0.75, 1];

const SECTION_ACCENTS = [
  {
    grad: "from-[#0B5394] to-[#1C7EC2]",
    ring: "text-[#0B5394]",
    text: "text-[#0B5394]",
    soft: "bg-blue-50",
    wash: "bg-blue-50/40",
    activeBorder: "border-[#0B5394]",
    cardBg: "bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100/70",
    glow: "11,83,148",
  },
];

// per-section icon tint only — kept separate from SECTION_ACCENTS (which drives the active pill's
// gradient, card border/background, and progress rail, all still uniformly blue) so each section's
// icon reads as its own color without recoloring the rest of the shell
const ICON_COLORS = [
  "text-rose-500",
  "text-amber-500",
  "text-emerald-500",
  "text-sky-500",
  "text-violet-500",
  "text-fuchsia-500",
  "text-orange-500",
  "text-teal-500",
  "text-indigo-500",
  "text-lime-600",
];

interface SectionPillProps {
  section: EmrSectionMappingTableItem;
  accent: (typeof SECTION_ACCENTS)[number];
  iconColor: string;
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
  iconColor,
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
      whileHover={{ scale: 1.025, y: -1 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`group relative flex items-center gap-1.5 h-9 rounded-full pl-1.5 pr-2.5 text-[12.5px] font-semibold transition-colors ${
        fullWidth ? "w-full" : "shrink-0"
      } ${isActive ? "text-white" : "text-slate-600 hover:bg-white hover:shadow-md"}`}
    >
      {isActive && (
        <motion.span
          layoutId="emrSectionActivePill"
          className={`absolute inset-0 rounded-full bg-gradient-to-r ${accent.grad} shadow-md`}
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
        >
          <motion.span
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [`0 0 0 0 rgba(${accent.glow},0.35)`, `0 0 0 6px rgba(${accent.glow},0)`],
            }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
        </motion.span>
      )}

      <span
        className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full shrink-0 transition-transform duration-200 group-hover:scale-110 ${
          isActive ? "bg-white/25" : "bg-slate-100"
        }`}
      >
        <Icon size={12} className={iconColor} strokeWidth={2.25} />
      </span>

      <span
        className={`relative z-10 ${fullWidth ? "flex-1 min-w-0 text-left truncate" : "whitespace-nowrap"}`}
      >
        {section.displayName || section.sectionName}
      </span>

      {isComplete ? (
        <motion.span
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
          title="Section complete"
          className={`relative z-10 flex items-center justify-center w-4 h-4 rounded-full shrink-0 shadow-sm ${
            isActive ? "bg-white text-[#0B5394]" : "bg-emerald-500 text-white"
          }`}
        >
          <Check size={10} strokeWidth={3.5} />
        </motion.span>
      ) : (
        <span
          title="Section incomplete"
          className={`relative z-10 w-1.5 h-1.5 rounded-full shrink-0 ${
            isActive ? "bg-white/60" : "bg-red-300"
          }`}
        />
      )}

      <span
        role="button"
        tabIndex={-1}
        onClick={onToggleFavorite}
        title={isFavorite ? "Remove from favourites" : "Mark as favourite"}
        className={`relative z-10 shrink-0 flex items-center justify-center w-4 h-4 rounded-full transition-all duration-150 hover:scale-125 ${
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

interface SectionCardProps {
  sectionId: number;
  isActive: boolean;
  accent: (typeof SECTION_ACCENTS)[number];
  innerRef: (el: HTMLDivElement | null) => void;
  /** the scrollable panel to observe against — null until it mounts, in which case useInView
   * is paused (skip) rather than falling back to the browser viewport as root */
  rootEl: HTMLDivElement | null;
  onVisibilityChange: (
    sectionId: number,
    inView: boolean,
    entry: IntersectionObserverEntry | undefined
  ) => void;
  children: ReactNode;
}

/**
 * Each scrolled section's card — tinted per-section background, a soft pulsing glow while it's
 * the scrollspy-active one, and a cursor-tracked spotlight highlight on hover (no extra library,
 * just a radial-gradient overlay positioned from mouse coordinates on every mousemove). Visibility
 * tracking itself is react-intersection-observer's useInView, reporting up to the shared scrollspy
 * logic in ConsultationEmrSections instead of each card managing its own observer by hand.
 */
const SectionCard = ({
  sectionId,
  isActive,
  accent,
  innerRef,
  rootEl,
  onVisibilityChange,
  children,
}: SectionCardProps) => {
  const [spotlight, setSpotlight] = useState<{ x: number; y: number } | null>(null);

  const { ref: inViewRef } = useInView({
    root: rootEl,
    rootMargin: SCROLLSPY_ROOT_MARGIN,
    threshold: SCROLLSPY_THRESHOLD,
    skip: !rootEl,
    onChange: (inView, entry) => onVisibilityChange(sectionId, inView, entry),
  });

  const setRefs = (el: HTMLDivElement | null) => {
    innerRef(el);
    inViewRef(el);
  };

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setSpotlight({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      ref={setRefs}
      data-section-id={sectionId}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setSpotlight(null)}
      className={`emr-section-card relative overflow-hidden rounded-2xl border mb-4 last:mb-0 scroll-mt-3 transition-colors duration-300 ${accent.cardBg} ${
        isActive ? `${accent.activeBorder} shadow-md` : "border-slate-200 shadow-sm hover:shadow-lg"
      }`}
    >
      {/* bold, solid-colored band — the obvious "which section is this" marker, not a faint wash */}
      <div className={`h-1 w-full bg-gradient-to-r ${accent.grad}`} />

      {isActive && (
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-2xl"
          animate={{
            boxShadow: [`0 0 0 0 rgba(${accent.glow},0.28)`, `0 0 30px 6px rgba(${accent.glow},0)`],
          }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
        />
      )}

      {spotlight && (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background: `radial-gradient(260px circle at ${spotlight.x}px ${spotlight.y}px, rgba(${accent.glow},0.16), transparent 70%)`,
          }}
        />
      )}

      <div className="relative p-4">{children}</div>
    </motion.div>
  );
};

const ConsultationEmrSections = ({
  doctorId,
  patientId,
  visitId,
  onSectionsChange,
}: ConsultationEmrSectionsProps) => {
  const { fetchApi } = useGlobalApi();
  const { layout, toggleLayout } = useEmrSectionLayout();

  const [activeSectionId, setActiveSectionId] = useState<number | null>(null);
  const [data, setData] = useState<Record<string, unknown>>({});
  const [headersBySection, setHeadersBySection] = useState<
    Record<number, SectionHeaderMappingRecord[]>
  >({});
  const [sectionProgress, setSectionProgress] = useState<
    Record<number, { filled: number; total: number }>
  >({});
  const [entriesBySectionId, setEntriesBySectionId] = useState<
    Record<number, EmrSectionAnswerEntry[]>
  >({});
  const [favoriteSectionIds, setFavoriteSectionIds] = useState<number[]>([]);
  const [savedFavoriteSectionIds, setSavedFavoriteSectionIds] = useState<number[]>([]);
  const [isSavingFavorites, setIsSavingFavorites] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [historySectionId, setHistorySectionId] = useState<number | null>(null);
  const [isReportAnnotatorOpen, setIsReportAnnotatorOpen] = useState(false);

  const moreMenuRef = useRef<HTMLDivElement>(null);

  // scrollspy for both layouts — every section renders together in one scrollable panel, and
  // the nav (left list or top tabs) highlights whichever one is currently in view. Detection
  // itself is react-intersection-observer (one useInView per SectionCard); this component just
  // aggregates "which of the currently-visible sections is topmost" and debounces the switch.
  const verticalScrollRef = useRef<HTMLDivElement>(null);
  const [scrollContainerEl, setScrollContainerEl] = useState<HTMLDivElement | null>(null);
  const sectionElRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const visibleEntriesRef = useRef<Map<number, IntersectionObserverEntry>>(new Map());
  const isClickScrollingRef = useRef(false);
  const clickScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spyDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setSectionElRef = (sectionId: number) => (el: HTMLDivElement | null) => {
    if (el) sectionElRefs.current.set(sectionId, el);
    else sectionElRefs.current.delete(sectionId);
  };

  const setScrollContainerRef = useCallback((el: HTMLDivElement | null) => {
    verticalScrollRef.current = el;
    setScrollContainerEl(prev => (prev === el ? prev : el));
  }, []);

  const handleSectionProgress = useCallback((sectionId: number, filled: number, total: number) => {
    setSectionProgress(prev => {
      const existing = prev[sectionId];
      if (existing && existing.filled === filled && existing.total === total) return prev;
      return { ...prev, [sectionId]: { filled, total } };
    });
  }, []);

  const handleSectionEntries = useCallback(
    (sectionId: number, entries: EmrSectionAnswerEntry[]) => {
      setEntriesBySectionId(prev =>
        prev[sectionId] === entries ? prev : { ...prev, [sectionId]: entries }
      );
    },
    []
  );

  const handleSectionVisibility = useCallback(
    (sectionId: number, inView: boolean, entry: IntersectionObserverEntry | undefined) => {
      if (inView && entry) visibleEntriesRef.current.set(sectionId, entry);
      else visibleEntriesRef.current.delete(sectionId);

      if (isClickScrollingRef.current) return;
      const visible = Array.from(visibleEntriesRef.current.values());
      if (visible.length === 0) return;
      visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      const topSectionId = Number(visible[0].target.getAttribute("data-section-id"));
      if (!topSectionId) return;

      // hold briefly before switching so scrolling past a section boundary doesn't flicker
      // the highlight back and forth
      if (spyDebounceTimerRef.current) clearTimeout(spyDebounceTimerRef.current);
      spyDebounceTimerRef.current = setTimeout(() => {
        setActiveSectionId(current => (current === topSectionId ? current : topSectionId));
      }, 300);
    },
    []
  );

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
    onSectionsChange(Object.values(entriesBySectionId).flat());
  }, [entriesBySectionId, onSectionsChange]);

  // sectionProgress (populated by each mounted EmrSectionRenderer via onProgressChange) is the
  // single source of truth for "is this section filled in" — it's the only place that knows the
  // card-group data shape (values live under section_X.group, not one path per header), so
  // deriving completion here independently from `data` would silently disagree with the section's
  // own progress bar for card-group sections
  const isSectionAnswered = (sectionId: number) => (sectionProgress[sectionId]?.filled ?? 0) > 0;

  const getSectionPercent = (sectionId: number) => {
    const progress = sectionProgress[sectionId];
    if (!progress || progress.total === 0) return 0;
    return Math.round((progress.filled / progress.total) * 100);
  };

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

  const iconColorBySectionId = useMemo(() => {
    const map = new Map<number, string>();
    mappedSections.forEach((s, idx) => map.set(s.sectionId, ICON_COLORS[idx % ICON_COLORS.length]));
    return map;
  }, [mappedSections]);

  // Favourites always render first; selecting a tab never changes its position.
  const orderedSections = useMemo(() => {
    const favoriteIds = new Set(favoriteSectionIds);
    const favorites = mappedSections.filter(s => favoriteIds.has(s.sectionId));
    const rest = mappedSections.filter(s => !favoriteIds.has(s.sectionId));
    return [...favorites, ...rest];
  }, [mappedSections, favoriteSectionIds]);

  // scroll-progress rail/bar — where the active section sits among all of them, used to give
  // both layouts a distinct "how far through the list" visual tied to the scrollspy behavior
  const activeSectionIndex = orderedSections.findIndex(s => s.sectionId === activeSectionId);
  const sectionCount = orderedSections.length || 1;
  const activeAccent =
    (activeSectionId != null && accentBySectionId.get(activeSectionId)) || SECTION_ACCENTS[0];

  // a section's top may never reach the shrunk "-70% bottom" trigger zone useInView is
  // configured with above — there's nothing left to scroll past the LAST section, so it can be
  // under-reported as never active. Once the container is scrolled to (or near) its bottom,
  // force the last section active directly instead of waiting on intersection math that can't
  // fire for it.
  useEffect(() => {
    const container = scrollContainerEl;
    if (!container || orderedSections.length === 0) return;

    const handleScrollToEnd = () => {
      if (isClickScrollingRef.current) return;
      const atBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 24;
      if (!atBottom) return;

      const lastSectionId = orderedSections[orderedSections.length - 1].sectionId;
      if (spyDebounceTimerRef.current) clearTimeout(spyDebounceTimerRef.current);
      setActiveSectionId(current => (current === lastSectionId ? current : lastSectionId));
    };
    container.addEventListener("scroll", handleScrollToEnd, { passive: true });

    return () => container.removeEventListener("scroll", handleScrollToEnd);
  }, [scrollContainerEl, orderedSections]);

  const handleSelectSection = (sectionId: number) => {
    setActiveSectionId(sectionId);

    isClickScrollingRef.current = true;
    if (spyDebounceTimerRef.current) clearTimeout(spyDebounceTimerRef.current);

    const container = scrollContainerEl;
    const target = sectionElRefs.current.get(sectionId);
    if (container && target) {
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const nextScrollTop = container.scrollTop + (targetRect.top - containerRect.top);
      container.scrollTo({ top: nextScrollTop, behavior: "smooth" });
    }

    if (clickScrollTimeoutRef.current) clearTimeout(clickScrollTimeoutRef.current);
    clickScrollTimeoutRef.current = setTimeout(() => {
      isClickScrollingRef.current = false;
    }, 700);
  };

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
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-[#0B5394] to-[#1C7EC2] shadow-sm">
            <Sparkles size={13} className="text-white" />
          </span>
          <h3 className="text-[13px] font-bold text-slate-700 tracking-wide">EMR Sections</h3>
        </div>

        <div className="flex items-center gap-2">
          <CircularProgress
            percent={percent}
            size={30}
            strokeWidth={3}
            progressClassName={percent === 100 ? "text-emerald-500" : "text-[#0B5394]"}
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
            onClick={() => setIsReportAnnotatorOpen(true)}
            title="View & annotate patient reports"
            className="flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:text-teal-600 hover:border-teal-300 transition-colors"
          >
            <Eye size={14} />
          </button>

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
        <div className="flex emr-shell">
          <div className="emr-sidebar flex flex-col w-64 shrink-0 min-h-0 border-r border-slate-100 bg-gradient-to-b from-blue-50 via-sky-50/50 to-white p-2.5 max-h-[760px] overflow-y-auto scrollbar-none">
            {/* scroll-progress rail — tracks the active section's position in the list as you scroll */}
            <div className="relative">
              <div className="absolute left-[7px] top-1 bottom-1 w-[3px] rounded-full bg-slate-200/70" />
              {orderedSections.length > 0 && (
                <motion.div
                  className={`absolute left-[7px] w-[3px] rounded-full bg-gradient-to-b ${activeAccent.grad}`}
                  animate={{
                    top: `${(Math.max(activeSectionIndex, 0) / sectionCount) * 100}%`,
                    height: `${(1 / sectionCount) * 100}%`,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              <div className="flex flex-col gap-1 pl-4">
                {orderedSections.map(section => {
                  const isActive = section.sectionId === activeSectionId;
                  const isComplete = getSectionPercent(section.sectionId) >= 100;
                  const accent = accentBySectionId.get(section.sectionId) ?? SECTION_ACCENTS[0];

                  return (
                    <SectionPill
                      key={section.sectionId}
                      section={section}
                      accent={accent}
                      iconColor={iconColorBySectionId.get(section.sectionId) ?? ICON_COLORS[0]}
                      isActive={isActive}
                      isComplete={isComplete}
                      isFavorite={favoriteSectionIds.includes(section.sectionId)}
                      onSelect={() => handleSelectSection(section.sectionId)}
                      onToggleFavorite={e => toggleFavorite(section.sectionId, e)}
                      fullWidth
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── all sections, scrolled together — left nav highlight follows scroll position ── */}
          <div
            ref={setScrollContainerRef}
            className="emr-content flex-1 min-w-0 p-4 min-h-72 max-h-[760px] overflow-y-auto scrollbar-none bg-gradient-to-br from-sky-50 via-blue-50/60 to-slate-50"
          >
            {orderedSections.map(section => {
              const sectionAccent = accentBySectionId.get(section.sectionId) ?? SECTION_ACCENTS[0];
              const isActive = section.sectionId === activeSectionId;
              return (
                <SectionCard
                  key={section.sectionId}
                  sectionId={section.sectionId}
                  isActive={isActive}
                  accent={sectionAccent}
                  innerRef={setSectionElRef(section.sectionId)}
                  rootEl={scrollContainerEl}
                  onVisibilityChange={handleSectionVisibility}
                >
                  <EmrSectionRenderer
                    sectionId={section.sectionId}
                    sectionName={section.sectionName}
                    displayName={section.displayName}
                    data={data}
                    onDataChange={setData}
                    onHeadersLoaded={headers =>
                      setHeadersBySection(prev => ({ ...prev, [section.sectionId]: headers }))
                    }
                    doctorId={doctorId}
                    patientId={patientId}
                    visitId={visitId}
                    accent={sectionAccent}
                    onOpenHistory={() => setHistorySectionId(section.sectionId)}
                    onProgressChange={handleSectionProgress}
                    onEntriesChange={handleSectionEntries}
                  />
                </SectionCard>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="relative flex items-center gap-1.5 px-3 py-1.5 border-b border-slate-100 bg-gradient-to-r from-blue-50 via-sky-50/40 to-white">
            {/* only the pills themselves scroll horizontally on mobile — the "More" button and
                its dropdown live outside this wrapper, since an overflow-x:auto ancestor clips
                any absolutely-positioned popover inside it (that's what broke the ⋯ menu) */}
            <div className="emr-tabbar flex items-center gap-1.5 min-w-0 flex-1">
              {visibleSections.map(section => {
                const isActive = section.sectionId === activeSectionId;
                const isComplete = getSectionPercent(section.sectionId) >= 100;
                const accent = accentBySectionId.get(section.sectionId) ?? SECTION_ACCENTS[0];

                return (
                  <SectionPill
                    key={section.sectionId}
                    section={section}
                    accent={accent}
                    iconColor={iconColorBySectionId.get(section.sectionId) ?? ICON_COLORS[0]}
                    isActive={isActive}
                    isComplete={isComplete}
                    isFavorite={favoriteSectionIds.includes(section.sectionId)}
                    onSelect={() => handleSelectSection(section.sectionId)}
                    onToggleFavorite={e => toggleFavorite(section.sectionId, e)}
                  />
                );
              })}
            </div>

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
                              handleSelectSection(section.sectionId);
                              setIsMoreOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors ${
                              isActive ? "bg-slate-100" : "hover:bg-slate-50"
                            }`}
                          >
                            <span
                              className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 ${accent.soft}`}
                            >
                              <Icon
                                size={12}
                                className={
                                  iconColorBySectionId.get(section.sectionId) ?? ICON_COLORS[0]
                                }
                                strokeWidth={2.25}
                              />
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
                            {isComplete ? (
                              <span
                                title="Section complete"
                                className="flex items-center justify-center w-4 h-4 rounded-full shrink-0 bg-emerald-500 text-white shadow-sm"
                              >
                                <Check size={10} strokeWidth={3.5} />
                              </span>
                            ) : (
                              <span
                                title="Section incomplete"
                                className="w-1.5 h-1.5 rounded-full shrink-0 bg-red-300"
                              />
                            )}
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

          {/* scroll-progress bar — how far through the section list the current scroll position is */}
          <div className="h-[3px] bg-slate-100 relative overflow-hidden">
            <motion.div
              className={`absolute inset-y-0 left-0 rounded-r-full bg-gradient-to-r ${activeAccent.grad}`}
              animate={{
                width: `${((Math.max(activeSectionIndex, 0) + 1) / sectionCount) * 100}%`,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>

          {/* ── all sections, scrolled together — tab highlight follows scroll position ── */}
          <div
            ref={setScrollContainerRef}
            className="emr-content p-4 min-h-72 max-h-[720px] overflow-y-auto scrollbar-none bg-gradient-to-br from-sky-50 via-blue-50/60 to-slate-50"
          >
            {orderedSections.map(section => {
              const sectionAccent = accentBySectionId.get(section.sectionId) ?? SECTION_ACCENTS[0];
              const isActive = section.sectionId === activeSectionId;
              return (
                <SectionCard
                  key={section.sectionId}
                  sectionId={section.sectionId}
                  isActive={isActive}
                  accent={sectionAccent}
                  innerRef={setSectionElRef(section.sectionId)}
                  rootEl={scrollContainerEl}
                  onVisibilityChange={handleSectionVisibility}
                >
                  <EmrSectionRenderer
                    sectionId={section.sectionId}
                    sectionName={section.sectionName}
                    displayName={section.displayName}
                    data={data}
                    onDataChange={setData}
                    onHeadersLoaded={headers =>
                      setHeadersBySection(prev => ({ ...prev, [section.sectionId]: headers }))
                    }
                    doctorId={doctorId}
                    patientId={patientId}
                    visitId={visitId}
                    accent={sectionAccent}
                    onOpenHistory={() => setHistorySectionId(section.sectionId)}
                    onProgressChange={handleSectionProgress}
                    onEntriesChange={handleSectionEntries}
                  />
                </SectionCard>
              );
            })}
          </div>
        </div>
      )}

      <EmrSectionHistoryDrawer
        isOpen={historySectionId !== null}
        onClose={() => setHistorySectionId(null)}
        patientId={patientId}
        sections={mappedSections}
        headersBySection={headersBySection}
        initialSectionId={historySectionId ?? mappedSections[0]?.sectionId ?? 0}
        data={data}
        onDataChange={setData}
      />

      <ReportAnnotatorModal
        isOpen={isReportAnnotatorOpen}
        onClose={() => setIsReportAnnotatorOpen(false)}
        patientId={patientId}
        visitId={visitId}
      />
    </div>
  );
};

export default ConsultationEmrSections;
