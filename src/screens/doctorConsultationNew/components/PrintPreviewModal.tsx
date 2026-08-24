import { ENDPOINTS } from "@/config/defaults";
import { AuthContext } from "@/context/AuthContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import {
  DEFAULT_PRINT_SETTINGS,
  PrintSettings,
  usePrintSettingsStore,
} from "@/store/usePrintSettingsStore";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  FileImage,
  History,
  Loader2,
  Printer,
  Save,
  Square,
  SquareCheck,
  User,
} from "lucide-react";
import { ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePatientVisitHistory } from "../hooks/usePatientVisitHistory";
import { AllergySection, EmrSectionAnswerEntry, PatientItem } from "../types";

interface VitalMasterLike {
  vitalId: number;
  vitalName: string;
  unitName: string;
}

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId?: number;
  patientId?: number;
  /** filters GET_EMR_SECTION_HEADER_MAPPING_BY_DOCTOR the same way ConsultationEmrSections does —
   * needed to resolve a past visit's raw HeaderId rows back to real section/header names */
  usedForPatientTypeId?: number;
  patient: PatientItem | null;
  emrSectionsData: EmrSectionAnswerEntry[];
  vitals?: VitalMasterLike[];
  vitalsData?: Record<number, string>;
  allergy?: AllergySection | null;
}

/** headerId -> where it lives and what it's called, resolved once per doctor via
 * GET_EMR_SECTION_HEADER_MAPPING_BY_DOCTOR — a past visit's raw rows carry only HeaderId/SectionId,
 * not names, so printing one needs this the same way ConsultationEmrSections needs it live */
interface PrintHeaderMeta {
  headerName: string;
  displayName: string;
  sectionId: number;
  sectionName: string;
  sectionSequenceNo: number;
}

interface BranchDetails {
  branchName: string;
  address: string;
  contactNo1: string;
  contactNo2: string;
  email: string;
}

interface SectionGroup {
  sectionId: number;
  sectionName: string;
  entries: EmrSectionAnswerEntry[];
}

const FONT_SIZE_CLASS: Record<PrintSettings["fontSize"], string> = {
  sm: "text-[11px]",
  md: "text-[12.5px]",
  lg: "text-[14px]",
};

/** v.recordedOn is ISO yyyy-mm-dd (usePatientVisitHistory) — displayed as dd-mm-yyyy to match the
 * rest of this screen's date formatting (PreviousSectionVisitsStrip's formatTabDate) */
const formatVisitDate = (isoDate: string): string => {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}-${month}-${d.getFullYear()}`;
};

const formatEntryValue = (value: unknown): ReactNode => {
  if (value === null || value === undefined || value === "") return "-";

  if (Array.isArray(value)) {
    if (value.length === 0) return "-";
    if (typeof value[0] === "object" && value[0] !== null) {
      const rows = value as Record<string, unknown>[];
      const columns = Array.from(new Set(rows.flatMap(row => Object.keys(row))));
      return (
        <table className="w-full border-collapse mt-1">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col}
                  className="text-left border-b border-slate-300 pb-1 pr-3 font-semibold text-slate-500 uppercase tracking-wide"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="border-b border-slate-100">
                {columns.map(col => (
                  <td key={col} className="py-1 pr-3 text-slate-700 align-top">
                    {String(row[col] ?? "-")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    return value.map(v => String(v)).join(", ");
  }

  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" · ");
  }

  return String(value);
};

const PrintPreviewModal = ({
  isOpen,
  onClose,
  doctorId,
  patientId,
  usedForPatientTypeId,
  patient,
  emrSectionsData,
  vitals = [],
  vitalsData = {},
  allergy,
}: PrintPreviewModalProps) => {
  const authUser = useContext(AuthContext)?.user;
  const branchId = Number(authUser?.branchId ?? 1);
  const { fetchApi } = useGlobalApi();
  const fetchApiRef = useRef(fetchApi);
  fetchApiRef.current = fetchApi;

  const getSettings = usePrintSettingsStore(state => state.getSettings);
  const saveSettings = usePrintSettingsStore(state => state.saveSettings);

  const [settings, setSettings] = useState<PrintSettings>(DEFAULT_PRINT_SETTINGS);
  const [branchDetails, setBranchDetails] = useState<BranchDetails | null>(null);
  const [letterheadImage, setLetterheadImage] = useState<string | null>(null);
  const [isLoadingLetterhead, setIsLoadingLetterhead] = useState(false);

  // "print a past visit" — the visit list + each visit's saved rows, same source the History
  // drawer/strip already use, so past-visit prints stay consistent with what "Past Visits" shows
  const { visits: pastVisits, isLoading: isPastVisitsLoading } = usePatientVisitHistory(patientId);
  const [selectedVisitId, setSelectedVisitId] = useState<number | "current">("current");

  useEffect(() => {
    if (isOpen) setSelectedVisitId("current");
  }, [isOpen]);

  // headerId -> section/header names, resolved once for this doctor — a past visit's raw rows
  // (HeaderId/SectionId only) need this to print with real labels instead of blank ones
  const { data: headerMetaByHeaderId } = useQuery({
    queryKey: ["printHeaderMapping", doctorId, usedForPatientTypeId],
    queryFn: async () => {
      const resp = await fetchApi<{ data?: Record<string, unknown>[] }>(
        "GET",
        ENDPOINTS.GET_EMR_SECTION_HEADER_MAPPING_BY_DOCTOR,
        {},
        { params: { doctorId, usedForPatientTypeId: usedForPatientTypeId ?? 1 } },
        { component: "PrintPreviewModal", silent: true }
      );
      const raw = resp?.data ?? [];
      const map = new Map<number, PrintHeaderMeta>();
      raw.forEach(m => {
        map.set(Number(m.HeaderId), {
          headerName: String(m.HeaderName ?? ""),
          displayName: String(m.DisplayName ?? ""),
          sectionId: Number(m.SectionId),
          sectionName: String(m.SectionName ?? ""),
          sectionSequenceNo: Number(m.SectionSequenceNo ?? 0),
        });
      });
      return map;
    },
    enabled: isOpen && doctorId != null,
    staleTime: 5 * 60_000,
  });

  const selectedPastVisit = useMemo(
    () =>
      selectedVisitId === "current"
        ? null
        : (pastVisits.find(v => v.visitId === selectedVisitId) ?? null),
    [selectedVisitId, pastVisits]
  );

  // what actually gets printed: the live in-progress data, or a past visit's saved rows resolved
  // back to real names via headerMetaByHeaderId
  const printEmrSectionsData = useMemo<EmrSectionAnswerEntry[]>(() => {
    if (selectedVisitId === "current") return emrSectionsData;
    if (!selectedPastVisit || !headerMetaByHeaderId) return [];
    return selectedPastVisit.rows
      .filter(r => headerMetaByHeaderId.has(r.HeaderId))
      .map(r => {
        const meta = headerMetaByHeaderId.get(r.HeaderId)!;
        let value: unknown;
        try {
          value = JSON.parse(r.HeaderValue);
        } catch {
          value = r.HeaderValue;
        }
        return {
          sectionId: meta.sectionId,
          sectionName: meta.sectionName,
          headerId: r.HeaderId,
          headerName: meta.displayName || meta.headerName,
          controlType: "",
          controlTypeId: r.ControlTypeId,
          value,
        };
      });
  }, [selectedVisitId, selectedPastVisit, headerMetaByHeaderId, emrSectionsData]);

  useEffect(() => {
    if (!isOpen) return;
    setSettings(getSettings(doctorId));
  }, [isOpen, doctorId, getSettings]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    fetchApiRef
      .current<{
        data?: BranchDetails[];
      }>(
        "GET",
        ENDPOINTS.GET_BRANCH_DETAILS,
        {},
        { params: { branchId } },
        { component: "PrintPreviewModal", silent: true }
      )
      .then(res => {
        if (cancelled) return;
        setBranchDetails(res?.data?.[0] ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, branchId]);

  useEffect(() => {
    if (!isOpen || !settings.showLetterhead) {
      setLetterheadImage(null);
      return;
    }
    let cancelled = false;
    setIsLoadingLetterhead(true);
    (async () => {
      const listRes = await fetchApiRef.current<{ data?: Record<string, unknown>[] }>(
        "GET",
        ENDPOINTS.GET_LAB_REPORT_LETTER_HEAD_LIST,
        {},
        {},
        { component: "PrintPreviewModal", silent: true }
      );
      const rows = listRes?.data ?? [];
      const match =
        rows.find(r => Number(r.BranchId ?? r.branchId) === branchId) ?? rows[0] ?? null;
      const filePath = (match?.letterHeadFilePath ?? match?.LetterHeadFilePath) as
        | string
        | undefined;
      if (!filePath) {
        if (!cancelled) setIsLoadingLetterhead(false);
        return;
      }
      const imgRes = await fetchApiRef.current<{ data?: { base64Data?: string } }>(
        "GET",
        ENDPOINTS.GET_FILE_AS_BASE_64,
        {},
        { params: { filePath } },
        { component: "PrintPreviewModal", silent: true }
      );
      if (!cancelled) {
        setLetterheadImage(imgRes?.data?.base64Data ?? null);
        setIsLoadingLetterhead(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, settings.showLetterhead, branchId]);

  // vitals ARE saved now (patientVitalValue on SAVE_PATIENT_CONSULTATION), but there's no
  // load-back endpoint for them yet — `vitalsData` (index.tsx) is only ever this session's
  // live/typed values, never hydrated from a past visit's save. Printing them alongside a past
  // visit's saved EMR data would misleadingly imply they belong to it, so they're hidden instead.
  const filledVitals = useMemo(
    () =>
      selectedVisitId === "current"
        ? vitals.filter(v => (vitalsData[v.vitalId] ?? "").trim() !== "")
        : [],
    [selectedVisitId, vitals, vitalsData]
  );

  const hasAllergyData = Boolean(
    allergy && (allergy.notKnownAllergy || allergy.summary?.trim() || allergy.records.length > 0)
  );

  const groupedSections = useMemo(() => {
    const map = new Map<number, SectionGroup>();
    printEmrSectionsData.forEach(e => {
      const bucket = map.get(e.sectionId) ?? {
        sectionId: e.sectionId,
        sectionName: e.sectionName,
        entries: [],
      };
      bucket.entries.push(e);
      map.set(e.sectionId, bucket);
    });
    const groups = Array.from(map.values());
    if (!headerMetaByHeaderId) return groups;
    // order by this doctor's real section sequence rather than raw-row insertion order — matters
    // most for a past visit, whose rows can come back from the backend in any order
    return groups.sort((a, b) => {
      const seqA = headerMetaByHeaderId.get(a.entries[0]?.headerId)?.sectionSequenceNo ?? 0;
      const seqB = headerMetaByHeaderId.get(b.entries[0]?.headerId)?.sectionSequenceNo ?? 0;
      return seqA - seqB;
    });
  }, [printEmrSectionsData, headerMetaByHeaderId]);

  if (!isOpen) return null;

  const toggleSetting = (
    key: keyof Pick<
      PrintSettings,
      "showLetterhead" | "showPatientDetails" | "showHospitalDetails" | "showVitals" | "showAllergy"
    >
  ) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSection = (sectionId: number) => {
    setSettings(prev => ({
      ...prev,
      excludedSectionIds: prev.excludedSectionIds.includes(sectionId)
        ? prev.excludedSectionIds.filter(id => id !== sectionId)
        : [...prev.excludedSectionIds, sectionId],
    }));
  };

  const handleSaveSettings = () => {
    if (doctorId == null) return;
    saveSettings(doctorId, settings);
  };

  const handlePrint = () => {
    const styleEl = document.createElement("style");
    styleEl.id = "emr-print-page-size";
    styleEl.textContent = `@page { size: ${settings.paperSize === "A5" ? "A5" : "A4"}; margin: 14mm; }`;
    document.head.appendChild(styleEl);
    window.print();
    setTimeout(() => styleEl.remove(), 1000);
  };

  const visibleSections = groupedSections.filter(
    g => !settings.excludedSectionIds.includes(g.sectionId)
  );

  return (
    <AnimatePresence>
      <motion.div
        key="print-backdrop"
        className="fixed inset-0 z-[95] bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        key="print-drawer"
        className="emr-print-shell fixed inset-y-0 right-0 z-[96] w-[96vw] max-w-[1500px] bg-white shadow-2xl flex"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
      >
        <div className="emr-print-side w-80 shrink-0 border-r border-slate-200 bg-slate-50/70 flex flex-col overflow-y-auto">
          <div className="flex items-center gap-2 px-4 py-3.5 border-b border-slate-200 bg-white shrink-0">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-[#0B5394] to-[#1C7EC2] shadow-sm">
              <Printer size={13} className="text-white" />
            </span>
            <h3 className="text-[13px] font-bold text-slate-700 tracking-wide">Print Settings</h3>
          </div>

          <div className="flex-1 p-4 flex flex-col gap-5">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <History size={12} />
                Visit
              </p>
              <select
                className="input-field !mb-0 w-full"
                value={String(selectedVisitId)}
                onChange={e => {
                  const v = e.target.value;
                  setSelectedVisitId(v === "current" ? "current" : Number(v));
                }}
                disabled={isPastVisitsLoading}
              >
                <option value="current">Current (unsaved) visit</option>
                {pastVisits.map(v => (
                  <option key={v.visitId} value={v.visitId}>
                    {formatVisitDate(v.recordedOn)} — Dr. {v.doctorName || "—"}
                  </option>
                ))}
              </select>
              {isPastVisitsLoading && (
                <p className="text-[11px] text-slate-400 mt-1">Loading past visits…</p>
              )}
              {selectedVisitId !== "current" && groupedSections.length === 0 && (
                <p className="text-[11px] text-amber-600 mt-1">
                  No EMR data saved for this visit.
                </p>
              )}
            </div>

            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Include
              </p>
              <div className="flex flex-col gap-1.5">
                {(
                  [
                    { key: "showLetterhead", label: "Hospital letterhead" },
                    { key: "showPatientDetails", label: "Patient details" },
                    { key: "showHospitalDetails", label: "Hospital details" },
                    { key: "showVitals", label: "Vitals" },
                    { key: "showAllergy", label: "Allergy" },
                  ] as const
                ).map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => toggleSetting(opt.key)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-[12.5px] font-medium text-slate-700 hover:bg-white transition-colors"
                  >
                    {settings[opt.key] ? (
                      <SquareCheck size={16} className="text-[#0B5394] shrink-0" />
                    ) : (
                      <Square size={16} className="text-slate-300 shrink-0" />
                    )}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Paper size
              </p>
              <div className="flex gap-1.5 bg-white rounded-lg p-1 border border-slate-200">
                {(["A4", "A5"] as const).map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, paperSize: size }))}
                    className={`flex-1 py-1.5 rounded-md text-[12px] font-semibold transition-colors ${
                      settings.paperSize === size
                        ? "bg-[#0B5394] text-white"
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Font size
              </p>
              <div className="flex gap-1.5 bg-white rounded-lg p-1 border border-slate-200">
                {(["sm", "md", "lg"] as const).map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, fontSize: size }))}
                    className={`flex-1 py-1.5 rounded-md text-[12px] font-semibold uppercase transition-colors ${
                      settings.fontSize === size
                        ? "bg-[#0B5394] text-white"
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
                EMR sections ({visibleSections.length}/{groupedSections.length})
              </p>
              <div className="flex flex-col gap-1 overflow-y-auto">
                {groupedSections.length === 0 && (
                  <p className="text-[11px] text-slate-400 px-2.5">No EMR data entered yet</p>
                )}
                {groupedSections.map(group => {
                  const included = !settings.excludedSectionIds.includes(group.sectionId);
                  return (
                    <button
                      key={group.sectionId}
                      type="button"
                      onClick={() => toggleSection(group.sectionId)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-[12.5px] font-medium text-slate-700 hover:bg-white transition-colors"
                    >
                      {included ? (
                        <SquareCheck size={16} className="text-[#0B5394] shrink-0" />
                      ) : (
                        <Square size={16} className="text-slate-300 shrink-0" />
                      )}
                      <span className="truncate">{group.sectionName}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 bg-white shrink-0">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={doctorId == null}
              className="save-btn w-full !py-2 !text-xs flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <Save size={14} />
              Save as default
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 shrink-0">
            <h3 className="text-[13px] font-bold text-slate-700 tracking-wide">Print Preview</h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="save-btn !py-1.5 !text-xs flex items-center gap-1.5"
              >
                <Printer size={14} />
                Print
              </button>
              <button className="close-drawer-btn" onClick={onClose}>
                &times;
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-200 p-8">
            <div
              id="emr-print-preview-wrapper"
              className={`emr-print-page mx-auto ${
                settings.paperSize === "A5" ? "emr-print-page-a5" : "emr-print-page-a4"
              } p-10 ${FONT_SIZE_CLASS[settings.fontSize]}`}
            >
              {settings.showLetterhead && (
                <div className="flex flex-col items-center pb-4 mb-4 border-b-2 border-slate-900">
                  {isLoadingLetterhead ? (
                    <Loader2 size={18} className="animate-spin text-slate-300" />
                  ) : letterheadImage ? (
                    <img
                      src={letterheadImage}
                      alt="Hospital letterhead"
                      className="max-h-24 object-contain"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-slate-900">
                      <FileImage size={18} />
                      <span className="text-lg font-bold tracking-wide">
                        {branchDetails?.branchName || "Hospital"}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {(settings.showPatientDetails || settings.showHospitalDetails) && (
                <div className="grid grid-cols-2 gap-6 pb-4 mb-4 border-b border-slate-300">
                  {settings.showPatientDetails && (
                    <div>
                      <div className="flex items-center gap-1.5 text-slate-900 font-bold uppercase tracking-wide text-[11px] mb-1.5">
                        <User size={12} />
                        Patient Details
                      </div>
                      <p className="font-semibold text-slate-800">{patient?.PatientName || "-"}</p>
                      <p className="text-slate-600">
                        UHID: {patient?.UHID || "-"} · {patient?.Age || "-"} /{" "}
                        {patient?.Gender || "-"}
                      </p>
                      <p className="text-slate-600">
                        Doctor:{" "}
                        {selectedPastVisit
                          ? selectedPastVisit.doctorName || "-"
                          : patient?.DoctorName || "-"}
                      </p>
                      <p className="text-slate-600">
                        Visit:{" "}
                        {selectedPastVisit
                          ? formatVisitDate(selectedPastVisit.recordedOn)
                          : `${patient?.TypeName || "-"} · ${patient?.AppDateTime || "-"}`}
                      </p>
                      {patient?.BedNo && <p className="text-slate-600">Bed: {patient.BedNo}</p>}
                    </div>
                  )}
                  {settings.showHospitalDetails && (
                    <div>
                      <div className="flex items-center gap-1.5 text-slate-900 font-bold uppercase tracking-wide text-[11px] mb-1.5">
                        <Building2 size={12} />
                        Hospital Details
                      </div>
                      <p className="font-semibold text-slate-800">
                        {branchDetails?.branchName || "-"}
                      </p>
                      <p className="text-slate-600">{branchDetails?.address || "-"}</p>
                      <p className="text-slate-600">
                        {[branchDetails?.contactNo1, branchDetails?.contactNo2]
                          .filter(Boolean)
                          .join(", ") || "-"}
                      </p>
                      {branchDetails?.email && (
                        <p className="text-slate-600">{branchDetails.email}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {settings.showVitals && filledVitals.length > 0 && (
                <div className="emr-print-section mb-4">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wide text-[11px] pb-1 mb-2 border-b border-slate-300">
                    Vitals
                  </h4>
                  <div className="grid grid-cols-3 gap-x-4 gap-y-1.5">
                    {filledVitals.map(v => (
                      <div key={v.vitalId} className="grid grid-cols-[1fr_auto] gap-2">
                        <span className="font-semibold text-slate-600">{v.vitalName}</span>
                        <span className="text-slate-800">
                          {vitalsData[v.vitalId]} {v.unitName || ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {settings.showAllergy && hasAllergyData && allergy && (
                <div className="emr-print-section mb-4">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wide text-[11px] pb-1 mb-2 border-b border-slate-300">
                    Allergy
                  </h4>
                  {allergy.notKnownAllergy ? (
                    <p className="text-slate-700">No known allergy</p>
                  ) : (
                    <>
                      {allergy.summary && (
                        <p className="text-slate-700 mb-1.5">{allergy.summary}</p>
                      )}
                      {allergy.records.length > 0 && (
                        <table className="w-full border-collapse">
                          <thead>
                            <tr>
                              {["Allergy", "Type", "Reaction", "Severity", "Remarks"].map(col => (
                                <th
                                  key={col}
                                  className="text-left border-b border-slate-300 pb-1 pr-3 font-semibold text-slate-500 uppercase tracking-wide"
                                >
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {allergy.records.map(r => (
                              <tr key={r.id} className="border-b border-slate-100">
                                <td className="py-1 pr-3 text-slate-700 align-top">
                                  {r.allergyName || "-"}
                                </td>
                                <td className="py-1 pr-3 text-slate-700 align-top">
                                  {r.allergyType || "-"}
                                </td>
                                <td className="py-1 pr-3 text-slate-700 align-top">
                                  {r.reaction || "-"}
                                </td>
                                <td className="py-1 pr-3 text-slate-700 align-top">
                                  {r.interactionSeverity || "-"}
                                </td>
                                <td className="py-1 pr-3 text-slate-700 align-top">
                                  {r.remarks || "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-4">
                {visibleSections.length === 0 && (
                  <p className="text-slate-400 text-center py-10">No sections selected to print</p>
                )}
                {visibleSections.map(group => (
                  <div key={group.sectionId} className="emr-print-section">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wide text-[11px] pb-1 mb-2 border-b border-slate-300">
                      {group.sectionName}
                    </h4>
                    <div className="flex flex-col gap-1.5">
                      {group.entries.map(entry => (
                        <div key={entry.headerId} className="grid grid-cols-[140px_1fr] gap-3">
                          <span className="font-semibold text-slate-600">{entry.headerName}</span>
                          <span className="text-slate-700">{formatEntryValue(entry.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PrintPreviewModal;
