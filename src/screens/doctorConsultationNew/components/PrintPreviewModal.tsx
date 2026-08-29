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
import { toCanvas } from "html-to-image";
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
  /** "consultation" (default) prints the doctor's normal EMR Sections panel, with the full set of
   * toggles below. "template" prints one Template's own data (opened from TemplateInlineSections)
   * — hides the Vitals/Allergy toggles (not part of a Template) and labels the panel with
   * templateName. The past-visit "Visit" switcher stays available in both variants; in template
   * mode it's additionally scoped down to just this templateId (see printEmrSectionsData). */
  variant?: "consultation" | "template";
  templateName?: string;
  /** only meaningful when variant === "template" — which template's rows to keep when a past
   * visit is selected (a visit's raw rows mix the doctor's plain EMR panel with every template
   * filled that visit, distinguished only by TemplateId). */
  templateId?: number;
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

/** v.recordedOn (usePatientVisitHistory) is ISO yyyy-mm-dd when a visit has no saved rows yet, or
 * a full ISO datetime (from a saved row's real CreatedOn) once it does — displayed as dd-mm-yyyy
 * to match the rest of this screen's date formatting (PreviousSectionVisitsStrip's formatTabDate).
 * Either way `new Date(...)` parses it fine; this just never reads the time portion. */
const formatVisitDate = (isoDate: string): string => {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}-${month}-${d.getFullYear()}`;
};

/** same as formatVisitDate but also renders the time — only used for the Template print variant's
 * Visit picker (per explicit request: date+time there, date-only everywhere else) now that a
 * saved row's real CreatedOn timestamp makes that meaningful. A visit with no saved rows yet still
 * only has the date-only fallback (no "T" in the string) — showing a time for that would just be a
 * fake midnight, so this only appends one when there's a real timestamp to show. */
const formatVisitDateTime = (isoDate: string): string => {
  const datePart = formatVisitDate(isoDate);
  if (!isoDate.includes("T")) return datePart;
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return datePart;
  const timePart = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return `${datePart} ${timePart}`;
};

const formatEntryValue = (value: unknown): ReactNode => {
  if (value === null || value === undefined || value === "") return "-";

  if (Array.isArray(value)) {
    if (value.length === 0) return "-";
    if (typeof value[0] === "object" && value[0] !== null) {
      const rows = value as Record<string, unknown>[];

      // Medicine List entries (MedicineListEntry[] from MedicineListControl) nest each dose's
      // frequency/duration/route inside a `schedule` array — the generic key-dump below just calls
      // String() on that array, which prints "[object Object]" instead of anything useful. Detect
      // the shape and render it the same way the doctor edits it: Medicine Name / Dose / Frequency
      // / Duration / Route, one row per scheduled dose.
      if ("medicineName" in rows[0] && Array.isArray(rows[0].schedule)) {
        type ScheduleRow = {
          doseQty?: string;
          doseUnit?: string;
          frequency?: string;
          durationValue?: string;
          durationUnit?: string;
          route?: string;
        };
        const meds = rows as Array<{
          medicineName?: string;
          isTapering?: boolean;
          schedule?: ScheduleRow[];
        }>;
        const trs: ReactNode[] = [];
        meds.forEach((med, medIdx) => {
          const schedule = med.schedule && med.schedule.length > 0 ? med.schedule : [undefined];
          schedule.forEach((row, rowIdx) => {
            trs.push(
              <tr key={`${medIdx}-${rowIdx}`} className="border-b border-slate-100">
                {rowIdx === 0 && (
                  <td
                    rowSpan={schedule.length}
                    className="py-1 pr-1.5 text-slate-700 align-top break-words font-medium"
                  >
                    {med.medicineName || "-"}
                    {med.isTapering ? " (Tapering)" : ""}
                  </td>
                )}
                <td className="py-1 pr-1.5 text-slate-700 align-top break-words">
                  {row ? [row.doseQty, row.doseUnit].filter(Boolean).join(" ") || "-" : "-"}
                </td>
                <td className="py-1 pr-1.5 text-slate-700 align-top break-words">
                  {row?.frequency || "-"}
                </td>
                <td className="py-1 pr-1.5 text-slate-700 align-top break-words">
                  {row ? [row.durationValue, row.durationUnit].filter(Boolean).join(" ") || "-" : "-"}
                </td>
                <td className="py-1 pr-1.5 text-slate-700 align-top break-words">
                  {row?.route || "-"}
                </td>
              </tr>
            );
          });
        });
        return (
          <table className="w-full table-fixed border-collapse mt-1 text-[9.5px] leading-tight">
            <thead>
              <tr>
                {["Medicine Name", "Dose", "Frequency", "Duration", "Route"].map(col => (
                  <th
                    key={col}
                    className="text-left border-b border-slate-300 pb-1 pr-1.5 font-semibold text-slate-500 uppercase break-words"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>{trs}</tbody>
          </table>
        );
      }

      const columns = Array.from(new Set(rows.flatMap(row => Object.keys(row))));
      return (
        // table-fixed forces columns to share the available width instead of each auto-sizing to
        // its own content's natural width — without it, a table with many columns (e.g. Family
        // History's 8 columns) can force this whole row wider than the printable page, and print
        // silently clips anything past the page edge rather than wrapping/shrinking it
        // a smaller, tighter-tracking font specifically for these dense multi-column tables — with
        // table-fixed splitting width equally, normal body-text size + letter-spacing was forcing
        // even short one-word headers (e.g. "Sex") to wrap, which looked broken
        <table className="w-full table-fixed border-collapse mt-1 text-[9.5px] leading-tight">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col}
                  className="text-left border-b border-slate-300 pb-1 pr-1.5 font-semibold text-slate-500 uppercase break-words"
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
                  <td key={col} className="py-1 pr-1.5 text-slate-700 align-top break-words">
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

/** shared accent-banded heading for every printed section (Vitals/Allergy/each EMR section) — one
 * definition so the whole document reads as a single consistent design instead of three
 * hand-copied header styles drifting apart */
const PrintSectionHeading = ({ children }: { children: ReactNode }) => (
  <div className="flex items-center bg-slate-50 border-l-[3px] border-[#0B5394] pl-2.5 pr-2 py-1.5">
    <h4 className="font-bold text-slate-800 uppercase tracking-wide text-[11px]">{children}</h4>
  </div>
);

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
  variant = "consultation",
  templateName,
  templateId,
}: PrintPreviewModalProps) => {
  const isTemplateVariant = variant === "template";
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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // "print a past visit" — the visit list + each visit's saved rows, same source the History
  // drawer/strip already use, so past-visit prints stay consistent with what "Past Visits" shows
  const { visits: pastVisits, isLoading: isPastVisitsLoading } = usePatientVisitHistory(patientId);
  const [selectedVisitId, setSelectedVisitId] = useState<number | "current">("current");

  useEffect(() => {
    if (isOpen) setSelectedVisitId("current");
  }, [isOpen]);

  // shown in the printed footer's "Printed on ..." line — refreshed each time the preview opens,
  // not on every render, so it doesn't drift while the doctor is just toggling settings
  const [previewOpenedAt, setPreviewOpenedAt] = useState(() => new Date());
  useEffect(() => {
    if (isOpen) setPreviewOpenedAt(new Date());
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
  // back to real names via headerMetaByHeaderId. In template mode, a visit's raw rows mix the
  // doctor's plain EMR panel with every template filled that visit (TemplateId is the only thing
  // distinguishing them), so also filter down to just this templateId.
  const printEmrSectionsData = useMemo<EmrSectionAnswerEntry[]>(() => {
    if (selectedVisitId === "current") return emrSectionsData;
    if (!selectedPastVisit || !headerMetaByHeaderId) return [];
    return selectedPastVisit.rows
      .filter(
        r =>
          headerMetaByHeaderId.has(r.HeaderId) &&
          (!isTemplateVariant || r.TemplateId === templateId)
      )
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
          dataId: r.DataId,
          createdOn: r.CreatedOn,
        };
      });
  }, [
    selectedVisitId,
    selectedPastVisit,
    headerMetaByHeaderId,
    emrSectionsData,
    isTemplateVariant,
    templateId,
  ]);

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
      // "Diagnosis Image" (and any other *Image entry) holds raw file-upload metadata rows
      // (PatientId/HeaderId/FileName/Pages/UploadedOn/...) meant for the attachment viewer, not the
      // printed chart — skip it rather than dumping that metadata as an unreadable generic table.
      if (/image/i.test(e.headerName)) return;
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

  // Every earlier print bug (letterhead offset, overflowing cards, wrapped table headers) came
  // from the same root cause: the browser's @media print pass re-lays-out the DOM differently
  // from how it rendered on screen, so tuning against the on-screen preview never reliably
  // predicted the printed result. Rasterizing the exact preview DOM into an image removes that
  // re-layout step entirely — there is no second CSS pass left to disagree with what's on screen.
  //
  // html-to-image (toCanvas), not html2canvas: html2canvas ships its own hand-rolled CSS color
  // parser that has no support for oklch() — Tailwind v4's default palette — and throws
  // "Attempting to parse an unsupported color function" the moment it walks this DOM. html-to-image
  // instead serializes the DOM into an SVG <foreignObject> and lets the browser's own renderer draw
  // it to an Image/canvas, so color parsing is done by the same engine that already renders this
  // page correctly on screen — no reimplemented CSS parser to disagree with it.
  //
  // Not a PDF: wrapping the captured image in a jsPDF document and opening it in a new tab handed
  // control to Chrome's built-in PDF viewer, whose own "automatic zoom" was inconsistently choosing
  // something other than fit-to-width for this page — sometimes right, sometimes cropped, and a
  // `#zoom=page-width` URL hint didn't reliably fix it either. Printing a plain HTML page containing
  // just the captured <img> sidesteps that viewer entirely: the browser's native print dialog always
  // fits an image sized to 100% of the page to the page, with no separate viewer zoom setting to
  // second-guess it.
  const handlePrint = async () => {
    const node = document.getElementById("emr-print-preview-wrapper");
    if (!node) return;

    // opened synchronously, in direct response to the click — before the async capture below, not
    // after. Calling window.open() once toCanvas has already awaited puts it outside the original
    // click's call stack, and Chrome silently treats that as a script-initiated popup and blocks
    // it instead of a user-initiated one. Grabbing the window handle first, then filling it in
    // once the capture is ready, avoids that.
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.alert("Please allow pop-ups for this site to print.");
      return;
    }
    printWindow.document.write(
      "<title>Print</title><p style=\"font:14px sans-serif;padding:24px\">Preparing print…</p>"
    );

    setIsGeneratingPdf(true);
    try {
      // html-to-image only waits for an <img> to load when it has to fetch/re-encode it as a data
      // URL first — the letterhead is already a data: URI (fetched as base64 from the backend), so
      // that code path is skipped entirely and the capture can run before the browser has actually
      // finished decoding it, silently rendering it blank. Explicitly waiting for every <img> in
      // the node to decode first (data URIs decode fast, but not synchronously) closes that gap.
      await Promise.all(
        Array.from(node.querySelectorAll("img")).map(img =>
          img.decode ? img.decode().catch(() => {}) : Promise.resolve()
        )
      );

      // explicit width/height rather than trusting auto-detection, in case that's disagreeing
      // with the node's real content size for any reason.
      const canvas = await toCanvas(node, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        width: node.scrollWidth,
        height: node.scrollHeight,
      });
      const imgData = canvas.toDataURL("image/png");

      const pageWidthMm = settings.paperSize === "A5" ? 148 : 210;
      const pageHeightMm = settings.paperSize === "A5" ? 210 : 297;
      const imgHeightMm = (canvas.height * pageWidthMm) / canvas.width;
      // -1mm tolerance before rounding up: imgHeightMm frequently lands a hair's width over an
      // exact multiple of the page height (float rounding in the canvas-ratio math above, or the
      // browser's own mm-to-device-pixel conversion at print time), which was always manufacturing
      // one extra, almost-entirely-blank page for that sliver of "overflow" that isn't real content.
      const pageCount = Math.max(1, Math.ceil((imgHeightMm - 1) / pageHeightMm));

      // one <img> per physical page, each showing the same full captured image but shifted up by
      // one page-height and clipped to that page's box — the plain-HTML equivalent of the earlier
      // jsPDF pagination loop. A document that fits on one page (the common case here) is just one
      // page with no shift.
      const pagesHtml = Array.from({ length: pageCount }, (_, i) => {
        const offsetMm = -i * pageHeightMm;
        return `<div class="print-page"><img src="${imgData}" style="margin-top:${offsetMm}mm" /></div>`;
      }).join("");

      // document.open() first: the placeholder written above never called document.close(), so
      // without this a plain document.write() here would just append after "Preparing print…"
      // instead of replacing it — open() resets the document for a fresh write.
      //
      // No auto-triggered window.print(): every time it fires automatically, the right edge of the
      // page comes out cropped; the plain tab underneath (no dialog auto-opening on top of it) has
      // shown the full, correct page every time. Whatever's causing that is inside the print
      // dialog's own preview rendering, not this page's HTML/CSS — so instead of fighting that,
      // show the page plainly and let a real button (hidden from the print output itself) trigger
      // print only once you've already seen it render correctly.
      printWindow.document.open();
      printWindow.document.write(`<!doctype html>
<html>
  <head>
    <title>Print</title>
    <style>
      @page { size: ${settings.paperSize === "A5" ? "A5" : "A4"}; margin: 0; }
      html, body { margin: 0; padding: 0; }
      .print-page { width: ${pageWidthMm}mm; height: ${pageHeightMm}mm; overflow: hidden; }
      .print-page img { display: block; width: 100%; }
      .print-trigger {
        position: fixed; top: 12px; right: 12px; z-index: 10;
        font: 600 13px sans-serif; padding: 8px 16px; border-radius: 6px;
        background: #0B5394; color: #fff; border: none; cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      }
      @media print { .print-trigger { display: none; } }
    </style>
  </head>
  <body>
    <button type="button" class="print-trigger" onclick="window.print()">Print this page</button>
    ${pagesHtml}
  </body>
</html>`);
      printWindow.document.close();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const visibleSections = groupedSections
    .filter(g => !settings.excludedSectionIds.includes(g.sectionId))
    .map(g => ({
      ...g,
      // dataId is only ever set on a past-visit entry (see printEmrSectionsData) — a live/current
      // entry has no dataId yet and is never excludable here
      entries: g.entries.filter(
        e => e.dataId == null || !settings.excludedDataIds.includes(e.dataId)
      ),
    }));

  // headerId -> how many of THIS visible entry set share it — only a multi-entry template's
  // header can be > 1 within one visit; drives both the duplicate-entry time label below and the
  // "which duplicate to exclude" sidebar checklist
  const headerCountsBySection = new Map<number, Map<number, number>>();
  visibleSections.forEach(g => {
    const counts = new Map<number, number>();
    g.entries.forEach(e => counts.set(e.headerId, (counts.get(e.headerId) ?? 0) + 1));
    headerCountsBySection.set(g.sectionId, counts);
  });
  // one group per (section, header) that has more than one entry — each becomes its own
  // "Timespan" dropdown in the sidebar, letting a doctor pick exactly one of that day's several
  // timed fillings to print instead of printing all of them
  const duplicateGroups = visibleSections.flatMap(g => {
    const counts = headerCountsBySection.get(g.sectionId);
    const seen = new Set<number>();
    return g.entries
      .filter(e => (counts?.get(e.headerId) ?? 0) > 1)
      .filter(e => (seen.has(e.headerId) ? false : (seen.add(e.headerId), true)))
      .map(e => ({
        sectionId: g.sectionId,
        headerId: e.headerId,
        headerName: e.headerName,
        entries: g.entries.filter(x => x.headerId === e.headerId),
      }));
  });

  const formatEntryTime = (iso?: string): string => {
    if (!iso) return "";
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
      ? ""
      : d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  };

  // "all" (the default — print every timed entry for this header) or one specific dataId (print
  // only that one), derived from which of the group's dataIds are currently NOT excluded
  const selectedTimespanFor = (group: { entries: { dataId?: number }[] }): "all" | number => {
    const visible = group.entries.filter(
      e => e.dataId != null && !settings.excludedDataIds.includes(e.dataId)
    );
    return visible.length === 1 && visible[0].dataId != null ? visible[0].dataId : "all";
  };

  const chooseTimespan = (
    group: { entries: { dataId?: number }[] },
    choice: "all" | number
  ) => {
    const groupIds = group.entries.map(e => e.dataId).filter((id): id is number => id != null);
    setSettings(prev => {
      const withoutGroup = prev.excludedDataIds.filter(id => !groupIds.includes(id));
      const toExclude = choice === "all" ? [] : groupIds.filter(id => id !== choice);
      return { ...prev, excludedDataIds: [...withoutGroup, ...toExclude] };
    });
  };

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
            <h3 className="text-[13px] font-bold text-slate-700 tracking-wide">
              {isTemplateVariant ? "Print Template" : "Print Settings"}
            </h3>
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
                    {isTemplateVariant ? formatVisitDateTime(v.recordedOn) : formatVisitDate(v.recordedOn)}
                    {" — Dr. "}
                    {v.doctorName || "—"}
                  </option>
                ))}
              </select>
              {isPastVisitsLoading && (
                <p className="text-[11px] text-slate-400 mt-1">Loading past visits…</p>
              )}
              {selectedVisitId !== "current" && groupedSections.length === 0 && (
                <p className="text-[11px] text-amber-600 mt-1">
                  {isTemplateVariant
                    ? "This template wasn't filled during this visit."
                    : "No EMR data saved for this visit."}
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
                )
                  .filter(
                    opt =>
                      !isTemplateVariant || (opt.key !== "showVitals" && opt.key !== "showAllergy")
                  )
                  .map(opt => (
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

            {settings.showLetterhead && (
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Letterhead spacing
                </p>
                {/* every hospital's letterhead image has a differently-sized header (logo, seal,
                    tagline) — there's no way to know that from code, so this is a tunable knob
                    instead of a hardcoded guess. Drag until the content below clears the
                    letterhead's own header art in the preview on the right, then Save as default. */}
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={400}
                    step={5}
                    value={settings.letterheadTopOffset}
                    onChange={e =>
                      setSettings(prev => ({
                        ...prev,
                        letterheadTopOffset: Number(e.target.value),
                      }))
                    }
                    className="flex-1 accent-[#0B5394]"
                  />
                  <span className="text-[11px] font-semibold text-slate-500 w-10 text-right">
                    {settings.letterheadTopOffset}px
                  </span>
                </div>
              </div>
            )}

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

            {/* only shows up when the selected visit actually has a header with more than one
                saved row — structurally only possible for a multi-entry template's header, since
                an ordinary header always upserts. One "Timespan" dropdown per such header, so a
                doctor can print just one of that day's timed fillings instead of always all of
                them — defaults to "All", matching what always printed before this existed. */}
            {duplicateGroups.length > 0 && (
              <div className="shrink-0 flex flex-col gap-3 mt-1 pt-3 border-t border-slate-200">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  Timespan
                </p>
                {duplicateGroups.map(group => {
                  const selected = selectedTimespanFor(group);
                  return (
                    <div key={`${group.sectionId}-${group.headerId}`}>
                      <p className="text-[11px] text-slate-500 mb-1 truncate">{group.headerName}</p>
                      <select
                        className="input-field !mb-0 w-full !py-1.5 text-xs"
                        value={String(selected)}
                        onChange={e => {
                          const v = e.target.value;
                          chooseTimespan(group, v === "all" ? "all" : Number(v));
                        }}
                      >
                        <option value="all">All ({group.entries.length})</option>
                        {group.entries.map(
                          e =>
                            e.dataId != null && (
                              <option key={e.dataId} value={e.dataId}>
                                {formatEntryTime(e.createdOn)}
                              </option>
                            )
                        )}
                      </select>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {!isTemplateVariant && (
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
          )}
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 shrink-0">
            <h3 className="text-[13px] font-bold text-slate-700 tracking-wide">
              {isTemplateVariant && templateName
                ? `Print Preview — ${templateName}`
                : "Print Preview"}
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                disabled={isGeneratingPdf}
                className="save-btn !py-1.5 !text-xs flex items-center gap-1.5 disabled:opacity-60"
              >
                {isGeneratingPdf ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Printer size={14} />
                )}
                {isGeneratingPdf ? "Preparing…" : "Print"}
              </button>
              <button className="close-drawer-btn" onClick={onClose}>
                &times;
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-200 p-8">
            <div
              id="emr-print-preview-wrapper"
              className={`emr-print-page relative mx-auto ${
                settings.paperSize === "A5" ? "emr-print-page-a5" : "emr-print-page-a4"
              } px-4 py-10 ${FONT_SIZE_CLASS[settings.fontSize]}`}
            >
              {/* the letterhead is a whole-page template (header art + watermark + footer baked
                  into one image) — it sits behind everything else, spanning the full page, rather
                  than being squeezed into a small logo strip at the top. Only used this way once
                  the real image has actually loaded; the loading/missing-image states below stay
                  a normal small header line since there's no page template to show yet. */}
              {settings.showLetterhead && letterheadImage && (
                <img
                  src={letterheadImage}
                  alt="Hospital letterhead"
                  className="emr-print-letterhead absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                  // the watermark baked into this letterhead is naturally pale (by design, so it
                  // doesn't fight with printed text) — a mild contrast/saturation boost makes its
                  // faint ink stand out without noticeably darkening the already-bold header/footer
                  // artwork, which stays near its natural look since it's far from mid-gray already
                  style={{ filter: "contrast(1.3) saturate(1.2)" }}
                />
              )}

              <div
                className="relative z-10"
                style={
                  settings.showLetterhead && letterheadImage
                    ? { paddingTop: settings.letterheadTopOffset }
                    : undefined
                }
              >
                {settings.showLetterhead && (isLoadingLetterhead || !letterheadImage) && (
                  <div className="flex flex-col items-center pb-3 mb-5">
                    {isLoadingLetterhead ? (
                      <Loader2 size={18} className="animate-spin text-slate-300" />
                    ) : (
                      <div className="flex items-center gap-2 text-slate-900">
                        <FileImage size={18} />
                        <span className="text-lg font-bold tracking-wide">
                          {branchDetails?.branchName || "Hospital"}
                        </span>
                      </div>
                    )}
                    {/* masthead double-rule — a thick rule with a thin echo below it, the way an
                        official letterhead/report typically separates the header from the body */}
                    <div className="w-full mt-3 border-b-2 border-slate-900" />
                    <div className="w-full mt-[3px] border-b border-slate-300" />
                  </div>
                )}

                {(settings.showPatientDetails || settings.showHospitalDetails) && (
                  <div
                    className={`grid gap-4 mb-5 ${
                      settings.showPatientDetails && settings.showHospitalDetails
                        ? "grid-cols-2"
                        : "grid-cols-1"
                    }`}
                  >
                    {settings.showPatientDetails && (
                      // min-w-0 — this card is a grid-cols-2 item; without it, a CSS grid item
                      // refuses to shrink below its content's natural min-width, so it (and the
                      // Hospital Details card beside it) can grow past its 1fr track and spill off
                      // the right edge of the page. Screen text happens to render just narrow
                      // enough to avoid tipping over this cliff; print's slightly different font
                      // metrics tip it over, which is why this only showed up once actually printed.
                      <div className="border border-slate-300 rounded-sm overflow-hidden min-w-0">
                        <div className="flex items-center gap-1.5 bg-[#0B5394] text-white font-bold uppercase tracking-wide text-[10px] px-3 py-1.5">
                          <User size={11} />
                          Patient Details
                        </div>
                        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 p-3 text-[11.5px]">
                          <span className="text-slate-500 font-medium">Name</span>
                          <span className="font-semibold text-slate-800 min-w-0 break-words">
                            {patient?.PatientName || "-"}
                          </span>
                          <span className="text-slate-500 font-medium">UHID</span>
                          <span className="text-slate-700 min-w-0 break-words">
                            {patient?.UHID || "-"}
                          </span>
                          <span className="text-slate-500 font-medium">Age / Gender</span>
                          <span className="text-slate-700 min-w-0 break-words">
                            {patient?.Age || "-"} / {patient?.Gender || "-"}
                          </span>
                          <span className="text-slate-500 font-medium">Doctor</span>
                          <span className="text-slate-700 min-w-0 break-words">
                            {selectedPastVisit
                              ? selectedPastVisit.doctorName || "-"
                              : patient?.DoctorName || "-"}
                          </span>
                          <span className="text-slate-500 font-medium">Visit</span>
                          <span className="text-slate-700 min-w-0 break-words">
                            {selectedPastVisit
                              ? isTemplateVariant
                                ? formatVisitDateTime(selectedPastVisit.recordedOn)
                                : formatVisitDate(selectedPastVisit.recordedOn)
                              : `${patient?.TypeName || "-"} · ${patient?.AppDateTime || "-"}`}
                          </span>
                          {patient?.BedNo && (
                            <>
                              <span className="text-slate-500 font-medium">Bed</span>
                              <span className="text-slate-700">{patient.BedNo}</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    {settings.showHospitalDetails && (
                      <div className="border border-slate-300 rounded-sm overflow-hidden min-w-0">
                        <div className="flex items-center gap-1.5 bg-slate-700 text-white font-bold uppercase tracking-wide text-[10px] px-3 py-1.5">
                          <Building2 size={11} />
                          Hospital Details
                        </div>
                        <div className="p-3 text-[11.5px]">
                          <p className="font-semibold text-slate-800">
                            {branchDetails?.branchName || "-"}
                          </p>
                          <p className="text-slate-600 mt-0.5">{branchDetails?.address || "-"}</p>
                          <p className="text-slate-600 mt-0.5">
                            {[branchDetails?.contactNo1, branchDetails?.contactNo2]
                              .filter(Boolean)
                              .join(", ") || "-"}
                          </p>
                          {branchDetails?.email && (
                            <p className="text-slate-600 mt-0.5">{branchDetails.email}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {settings.showVitals && filledVitals.length > 0 && (
                  <div className="emr-print-section mb-4 border border-slate-200 rounded-sm overflow-hidden">
                    <PrintSectionHeading>Vitals</PrintSectionHeading>
                    <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 p-3">
                      {filledVitals.map(v => (
                        <div key={v.vitalId} className="grid grid-cols-[1fr_auto] gap-2">
                          <span className="font-semibold text-slate-600 min-w-0 break-words">
                            {v.vitalName}
                          </span>
                          <span className="text-slate-800 shrink-0">
                            {vitalsData[v.vitalId]} {v.unitName || ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {settings.showAllergy && hasAllergyData && allergy && (
                  <div className="emr-print-section mb-4 border border-slate-200 rounded-sm overflow-hidden">
                    <PrintSectionHeading>Allergy</PrintSectionHeading>
                    <div className="p-3">
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
                                  {["Allergy", "Type", "Reaction", "Severity", "Remarks"].map(
                                    col => (
                                      <th
                                        key={col}
                                        className="text-left border-b border-slate-300 pb-1 pr-3 font-semibold text-slate-500 uppercase tracking-wide"
                                      >
                                        {col}
                                      </th>
                                    )
                                  )}
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
                  </div>
                )}

                {/* grid, not flex — a plain flex column relies on align-items:stretch to give each
                    card the container's full width, and print rendering showed that isn't holding:
                    a wide table inside (e.g. Chief Complaints' 4-column row) was pushing the whole
                    card past the page's right edge in the actual printout despite looking fine in
                    the on-screen preview. Grid + min-w-0 on each item is the same combination that
                    already fixed the identical overflow on the Patient/Hospital Details cards above,
                    so reuse it here instead of trusting flex stretch to hold under print layout. */}
                <div className="grid grid-cols-1 gap-4">
                  {visibleSections.length === 0 && (
                    <p className="text-slate-400 text-center py-10">
                      No sections selected to print
                    </p>
                  )}
                  {visibleSections.map(group => (
                    <div
                      key={group.sectionId}
                      className="emr-print-section border border-slate-200 rounded-sm overflow-hidden min-w-0"
                    >
                      <PrintSectionHeading>{group.sectionName}</PrintSectionHeading>
                      <div className="grid grid-cols-1">
                        {group.entries.map((entry, entryIdx) => {
                          const isDuplicateHeader =
                            (headerCountsBySection.get(group.sectionId)?.get(entry.headerId) ??
                              0) > 1;
                          return (
                            <div
                              key={entry.dataId ?? entryIdx}
                              className={`grid grid-cols-[minmax(120px,180px)_1fr] gap-3 px-3 py-1.5 min-w-0 ${
                                entryIdx % 2 === 1 ? "bg-slate-50/70" : ""
                              }`}
                            >
                              <span className="font-semibold text-slate-600 min-w-0">
                                {entry.headerName}
                                {isDuplicateHeader && (
                                  <span className="ml-1.5 font-normal text-slate-400">
                                    {formatEntryTime(entry.createdOn)}
                                  </span>
                                )}
                              </span>
                              {/* min-w-0 is load-bearing here — a CSS grid's 1fr track otherwise
                                refuses to shrink below its content's natural min-width (e.g. a
                                wide table's columns), which pushes the whole row past the page
                                edge in print instead of wrapping within it */}
                              <span className="text-slate-700 min-w-0 overflow-hidden">
                                {formatEntryValue(entry.value)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* signature footer — every printed medical document needs a closing line for the
                  doctor's signature; without it the page just stopped after the last section */}
                <div className="flex items-end justify-between mt-10 pt-4 border-t border-slate-300">
                  <p className="text-[9.5px] text-slate-400">
                    Printed on {previewOpenedAt.toLocaleString()}
                  </p>
                  <div className="text-center">
                    <div className="w-48 border-b border-slate-400 mb-1" />
                    <p className="text-[11px] font-semibold text-slate-700">
                      Dr.{" "}
                      {(selectedPastVisit ? selectedPastVisit.doctorName : patient?.DoctorName) ||
                        "—"}
                    </p>
                    <p className="text-[9.5px] text-slate-400 uppercase tracking-wide">Signature</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PrintPreviewModal;
