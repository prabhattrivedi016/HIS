import { getByPath } from "@/components/dynamicForm/utils/path";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import {
  EmrSectionMappingTableItem,
  SectionHeaderMappingRecord,
} from "@/screens/emrControls/types";
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
  NotebookPen,
  Pill,
  Stethoscope,
} from "lucide-react";
import { useEffect, useState } from "react";
import { EmrSectionAnswerEntry } from "../types";
import EmrSectionRenderer from "./EmrSectionRenderer";

interface ConsultationEmrSectionsPatient {
  name: string;
  age?: string | number;
  gender?: string;
  uhid?: string;
}

interface ConsultationEmrSectionsProps {
  doctorId?: number;
  patient?: ConsultationEmrSectionsPatient;
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

const SECTION_ACCENTS = [
  { grad: "from-blue-400 to-cyan-300", tint: "from-blue-50 to-cyan-50", text: "text-blue-700" },
  { grad: "from-violet-400 to-fuchsia-300", tint: "from-violet-50 to-fuchsia-50", text: "text-violet-700" },
  { grad: "from-rose-400 to-orange-300", tint: "from-rose-50 to-orange-50", text: "text-rose-700" },
  { grad: "from-emerald-400 to-teal-300", tint: "from-emerald-50 to-teal-50", text: "text-emerald-700" },
  { grad: "from-amber-400 to-yellow-300", tint: "from-amber-50 to-yellow-50", text: "text-amber-700" },
  { grad: "from-indigo-400 to-blue-300", tint: "from-indigo-50 to-blue-50", text: "text-indigo-700" },
];

const ConsultationEmrSections = ({ patient, onSectionsChange }: ConsultationEmrSectionsProps) => {
  const { fetchApi } = useGlobalApi();

  const [activeSectionId, setActiveSectionId] = useState<number | null>(null);
  const [data, setData] = useState<Record<string, unknown>>({});
  const [headersBySection, setHeadersBySection] = useState<
    Record<number, SectionHeaderMappingRecord[]>
  >({});
  const [panelScrolled, setPanelScrolled] = useState(false);

  const patientInitials = patient?.name
    ? patient.name
        .split(" ")
        .slice(0, 2)
        .map(w => w[0])
        .join("")
        .toUpperCase()
    : "";

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

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm mt-3 overflow-hidden">
      {/* header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h3 className="text-[13px] font-semibold text-slate-700 tracking-wide">EMR Sections</h3>
        <span
          className={`shrink-0 flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5 ${
            percent === 100 ? "text-emerald-600 bg-emerald-50" : "text-slate-500 bg-slate-100"
          }`}
        >
          {percent === 100 && <Check size={10} />}
          {answeredCount}/{mappedSections.length || 0} · {percent}%
        </span>
      </div>

      {sectionsLoading ? (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400 py-16">
          <Loader2 size={16} className="animate-spin" />
          Loading EMR sections…
        </div>
      ) : mappedSections.length === 0 ? (
        <div className="text-center text-gray-400 py-10 text-sm">No active EMR sections found</div>
      ) : (
        <div className="flex max-h-[560px] overflow-hidden">
          {/* vertical "level path" tabs */}
          <div className="relative flex flex-col gap-2 py-4 px-3 w-60 bg-slate-50/60 shadow-[inset_-1px_0_0_0_rgba(15,23,42,0.06)] shrink-0 overflow-y-auto scrollbar-none">
            {mappedSections.length > 1 && (
              <div
                className="absolute left-[28px] w-[2px] bg-slate-200 rounded-full"
                style={{ top: 34, height: (mappedSections.length - 1) * 44 }}
              />
            )}

            {mappedSections.map((section, idx) => {
              const isActive = section.sectionId === activeSectionId;
              const sectionPercent = getSectionPercent(section.sectionId);
              const isComplete = sectionPercent >= 100;
              const accent = SECTION_ACCENTS[idx % SECTION_ACCENTS.length];
              const Icon = getSectionIcon(section.displayName || section.sectionName);

              return (
                <motion.button
                  key={section.sectionId}
                  type="button"
                  onClick={() => setActiveSectionId(section.sectionId)}
                  whileHover={!isActive ? { x: 2 } : undefined}
                  whileTap={{ scale: 0.97 }}
                  className={`relative z-10 flex items-center gap-3 h-9 rounded-xl pr-2 text-left transition-colors ${
                    isActive ? accent.text : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="emrSectionActivePill"
                      className={`absolute inset-0 rounded-xl bg-gradient-to-r ${accent.tint}`}
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}

                  <span className="relative z-10 shrink-0">
                    <motion.span
                      animate={{ scale: isActive ? 1.1 : 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 16 }}
                      className={`relative flex items-center justify-center w-8 h-8 rounded-full shadow-sm ring-2 ring-white bg-gradient-to-br opacity-90 ${accent.grad}`}
                    >
                      {isActive && (
                        <motion.span
                          className="absolute -inset-1 rounded-full pointer-events-none"
                          animate={{
                            boxShadow: [
                              "0 0 0 0 rgba(99,102,241,0.3)",
                              "0 0 0 6px rgba(99,102,241,0)",
                            ],
                          }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                        />
                      )}
                      <Icon size={13} className="text-white" strokeWidth={2} />
                    </motion.span>

                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                        isComplete ? "bg-emerald-500" : "bg-red-400"
                      }`}
                    />
                  </span>

                  <span
                    className={`relative z-10 text-[12.5px] truncate ${isActive ? "font-bold" : "font-medium"}`}
                  >
                    {section.displayName || section.sectionName}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* active section panel */}
          <div
            className="flex-1 min-w-0 overflow-y-auto scrollbar-none"
            onScroll={e => setPanelScrolled(e.currentTarget.scrollTop > 28)}
          >
            <AnimatePresence>
              {panelScrolled && patient?.name && (
                <motion.div
                  initial={{ y: -36, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -36, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 320, damping: 26 }}
                  className="sticky top-0 z-20 flex items-center gap-2.5 px-4 py-2 bg-gradient-to-r from-indigo-300/80 via-violet-300/80 to-fuchsia-300/80 backdrop-blur-sm shadow-sm"
                >
                  <motion.span
                    animate={{ boxShadow: ["0 0 0 0 rgba(99,102,241,0.25)", "0 0 0 5px rgba(99,102,241,0)"] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                    className="shrink-0 w-7 h-7 rounded-full bg-white/50 ring-2 ring-white/70 flex items-center justify-center text-[10.5px] font-bold text-slate-700"
                  >
                    {patientInitials}
                  </motion.span>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[12.5px] font-bold text-slate-700 truncate">{patient.name}</span>
                    <span className="text-[11px] text-slate-600 shrink-0">
                      {[patient.age, patient.gender].filter(Boolean).join(" · ")}
                    </span>
                    {patient.uhid && (
                      <span className="text-[10px] font-semibold text-slate-700 bg-white/50 rounded-full px-2 py-0.5 shrink-0">
                        {patient.uhid}
                      </span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-5 min-h-72">
              <AnimatePresence mode="wait">
                {activeSection && (
                  <motion.div
                    key={activeSection.sectionId}
                    initial={{ opacity: 0, x: 10, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -10, scale: 0.98 }}
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
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationEmrSections;
