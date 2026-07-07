import { getByPath } from "@/components/dynamicForm/utils/path";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { EmrSectionMappingTableItem, SectionHeaderMappingRecord } from "@/screens/emrControls/types";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ClipboardList, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { EmrSectionAnswerEntry } from "../types";
import EmrSectionRenderer from "./EmrSectionRenderer";

interface ConsultationEmrSectionsProps {
  doctorId?: number;
  onSectionsChange?: (entries: EmrSectionAnswerEntry[]) => void;
}

const dataPathFor = (sectionId: number, headerId: number) => `section_${sectionId}.header_${headerId}`;

/* cycled per section since sections don't carry a color/icon of their own */
const SECTION_STYLES = [
  { grad: "from-blue-500 to-cyan-400", ring: "ring-blue-200", text: "text-blue-600", border: "border-blue-200" },
  {
    grad: "from-purple-500 to-fuchsia-400",
    ring: "ring-purple-200",
    text: "text-purple-600",
    border: "border-purple-200",
  },
  { grad: "from-rose-500 to-pink-400", ring: "ring-rose-200", text: "text-rose-600", border: "border-rose-200" },
  {
    grad: "from-emerald-500 to-teal-400",
    ring: "ring-emerald-200",
    text: "text-emerald-600",
    border: "border-emerald-200",
  },
  {
    grad: "from-orange-500 to-amber-400",
    ring: "ring-orange-200",
    text: "text-orange-600",
    border: "border-orange-200",
  },
  {
    grad: "from-indigo-500 to-violet-400",
    ring: "ring-indigo-200",
    text: "text-indigo-600",
    border: "border-indigo-200",
  },
];

const ConsultationEmrSections = ({ onSectionsChange }: ConsultationEmrSectionsProps) => {
  const { fetchApi } = useGlobalApi();

  const [activeSectionId, setActiveSectionId] = useState<number | null>(null);
  const [data, setData] = useState<Record<string, unknown>>({});
  const [headersBySection, setHeadersBySection] = useState<
    Record<number, SectionHeaderMappingRecord[]>
  >({});

  /* renders every active EMR Section; attributes for the active one are fetched
   * separately by sectionId via EmrSectionRenderer -> EMR/getEMRSectionHeaderMapping */
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, mappedSections, headersBySection]);

  const isSectionAnswered = (sectionId: number) => {
    const sectionData = data[`section_${sectionId}`] as Record<string, unknown> | undefined;
    if (!sectionData) return false;
    return Object.values(sectionData).some(v => v !== undefined && v !== null && String(v).trim() !== "");
  };

  const activeSection = mappedSections.find(s => s.sectionId === activeSectionId);
  const activeIndex = mappedSections.findIndex(s => s.sectionId === activeSectionId);
  const activeStyle = SECTION_STYLES[activeIndex % SECTION_STYLES.length];
  const answeredCount = mappedSections.filter(s => isSectionAnswered(s.sectionId)).length;
  const total = mappedSections.length || 1;
  const percent = Math.round((answeredCount / total) * 100);
  const ringCircumference = 2 * Math.PI * 15.5;

  return (
    <div className="bg-white rounded-xl shadow mt-3 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-gradient-to-r from-slate-50 to-white">
        <h3 className="text-[13px] font-bold text-gray-800 uppercase tracking-wide">EMR Sections</h3>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-medium text-gray-400">
            {answeredCount}/{mappedSections.length || 0} done
          </span>
          <svg width="28" height="28" viewBox="0 0 36 36" className="shrink-0">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7eb" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="url(#emrSectionsProgressGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${(percent / 100) * ringCircumference} ${ringCircumference}`}
              transform="rotate(-90 18 18)"
              className="transition-all duration-500"
            />
            <defs>
              <linearGradient id="emrSectionsProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            <text x="18" y="21.5" textAnchor="middle" fontSize="9" fontWeight="700" fill="#475569">
              {percent}%
            </text>
          </svg>
        </div>
      </div>

      {sectionsLoading ? (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400 py-16">
          <Loader2 size={16} className="animate-spin" />
          Loading EMR sections…
        </div>
      ) : mappedSections.length === 0 ? (
        <div className="text-center text-gray-400 py-10 text-sm">No active EMR sections found</div>
      ) : (
        <div className="flex">
          {/* icon rail */}
          <div className="flex flex-col items-center gap-2 py-4 px-2.5 border-r border-gray-100 bg-gray-50/60 shrink-0">
            {mappedSections.map((section, idx) => {
              const isActive = section.sectionId === activeSectionId;
              const isAnswered = isSectionAnswered(section.sectionId);
              const style = SECTION_STYLES[idx % SECTION_STYLES.length];

              return (
                <button
                  key={section.sectionId}
                  type="button"
                  title={section.displayName || section.sectionName}
                  onClick={() => setActiveSectionId(section.sectionId)}
                  className={`relative flex items-center justify-center w-9 h-9 rounded-full shrink-0 transition-all active:scale-90 ${
                    isActive
                      ? `bg-gradient-to-br ${style.grad} text-white shadow-lg ring-2 ring-offset-2 ${style.ring} scale-110`
                      : `bg-white ${style.text} border ${style.border} hover:shadow-md hover:scale-105`
                  }`}
                >
                  <ClipboardList size={14} />
                  {isAnswered && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                  )}
                </button>
              );
            })}
          </div>

          {/* animated content panel — given the active sectionId, EmrSectionRenderer
           * fetches and renders every attribute mapped to that section */}
          <div className="flex-1 min-w-0 p-5 min-h-64">
            <AnimatePresence mode="wait">
              {activeSection && (
                <motion.div
                  key={activeSection.sectionId}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${activeStyle.grad}`} />
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider ${activeStyle.text}`}
                    >
                      Section
                    </span>
                  </div>
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
      )}
    </div>
  );
};

export default ConsultationEmrSections;
