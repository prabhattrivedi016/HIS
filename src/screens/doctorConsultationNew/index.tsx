import {
  Activity,
  CalendarClock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Droplet,
  Edit,
  FileCheck,
  Gauge,
  HeartPulse,
  LogOut,
  LucideIcon,
  Printer,
  Ruler,
  Scale,
  Stethoscope,
  Thermometer,
  Upload,
  User,
  Wind,
} from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";

import { ENDPOINTS } from "@/config/defaults";
import { AuthContext } from "@/context/AuthContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess } from "@/utils/alert";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import AllergyPanel from "./components/AllergyPanel";
import ConsultationEmrSections from "./components/ConsultationEmrSections";
import MedicineAssistantWidget from "./components/MedicineAssistantWidget";
import PrintPreviewModal from "./components/PrintPreviewModal";
import UploadDocumentModal from "./components/UploadDocumentModal";
import VitalInsights from "./components/VitalInsights";
import {
  AllergyRecordEntry,
  AllergySection,
  ConsultationHeaderDataEntry,
  EmrSectionAnswerEntry,
  PatientConsultationPayload,
  PatientItem,
  PatientVitalValueEntry,
} from "./types";

interface VitalMasterItem {
  vitalId: number;
  vitalName: string;
  unitName: string;
  minValue: string;
  maxValue: string;
}

/** raw wire shape of GET_VITAL_DEPARTMENT_MAPPING_BY_DOCTOR_ID
 * (EMR/getVitalDepartmentMappingByDoctorId) — already scoped/ordered for one doctor, so unlike
 * the generic admin mapping endpoint there's no MappingId to filter by or SequenceNo to sort by */
interface VitalDepartmentMappingItem {
  VitalId: number;
  VitalName: string;
  UnitId: number;
  UnitName: string;
  MinValue: string;
  MaxValue: string;
  SnomedCode: string | null;
  IsMandatory: number;
  IsBodyMeasurement: number;
  VitalValue: string;
}

const VITAL_ACCENTS = [
  { text: "text-red-600", bg: "bg-red-50", ring: "ring-red-100", grad: "from-red-500 to-rose-400" },
  {
    text: "text-emerald-600",
    bg: "bg-emerald-50",
    ring: "ring-emerald-100",
    grad: "from-emerald-500 to-teal-400",
  },
  {
    text: "text-slate-600",
    bg: "bg-slate-50",
    ring: "ring-slate-100",
    grad: "from-slate-500 to-slate-400",
  },
  {
    text: "text-blue-600",
    bg: "bg-blue-50",
    ring: "ring-blue-100",
    grad: "from-blue-500 to-cyan-400",
  },
  {
    text: "text-orange-600",
    bg: "bg-orange-50",
    ring: "ring-orange-100",
    grad: "from-orange-500 to-amber-400",
  },
  {
    text: "text-purple-600",
    bg: "bg-purple-50",
    ring: "ring-purple-100",
    grad: "from-purple-500 to-fuchsia-400",
  },
  {
    text: "text-teal-600",
    bg: "bg-teal-50",
    ring: "ring-teal-100",
    grad: "from-teal-500 to-emerald-400",
  },
  {
    text: "text-pink-600",
    bg: "bg-pink-50",
    ring: "ring-pink-100",
    grad: "from-pink-500 to-rose-400",
  },
];

const iconForVital = (name: string): LucideIcon => {
  const key = (name || "").toLowerCase();
  if (key.includes("pulse") || key.includes("heart")) return HeartPulse;
  if (key.includes("temp")) return Thermometer;
  if (key.includes("rate") || key.includes("resp")) return Wind;
  if (key.includes("spo2") || key.includes("oxygen")) return Droplet;
  if (key.includes("weight")) return Scale;
  if (key.includes("height")) return Ruler;
  if (key.includes("systolic") || key.includes("bp") || key.includes("pressure")) return Gauge;
  return Activity;
};

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(date)
    .replace(/ /g, "-");

const DoctorConsultationNew = () => {
  const { loading, fetchApi } = useGlobalApi();
  const queryClient = useQueryClient();
  const authUser = useContext(AuthContext)?.user;
  const branchId = authUser?.branchId ?? 1;

  const [selectedType, setSelectedType] = useState<number>(1);

  const [appliedRange, setAppliedRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showFullCalendar, setShowFullCalendar] = useState(false);

  const [showAllergyPanel, setShowAllergyPanel] = useState<boolean>(false);
  const [showVitalInsights, setShowVitalInsights] = useState<boolean>(false);
  const [showPrintPreview, setShowPrintPreview] = useState<boolean>(false);
  const [showUploadDocument, setShowUploadDocument] = useState<boolean>(false);
  // phones only — the full vitals chip row is too tall to show inline on a small screen, so it
  // starts collapsed behind a compact summary bar instead of pushing EMR Sections far below the fold
  const [isVitalsExpandedMobile, setIsVitalsExpandedMobile] = useState(false);
  // same idea as vitals — UHID/Visit ID/Visit Date/etc. are secondary details, collapsed by
  // default on phones so the header stays short and EMR Sections is reachable right away
  const [isDetailsExpandedMobile, setIsDetailsExpandedMobile] = useState(false);
  const [leftPanelVisible, setLeftPanelVisible] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState("0");
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedPatient, setSelectedPatient] = useState<PatientItem | null>(null);
  // a closed file is locked: every EMR/allergy/vitals field renders read-only and none of the
  // Save buttons can fire another save on it
  const isFileClosed = selectedPatient?.IsConsultationDone === 1;
  const [allergySection, setAllergySection] = useState<AllergySection | null>(null);
  const [emrSectionsData, setEmrSectionsData] = useState<EmrSectionAnswerEntry[]>([]);
  const [vitalsData, setVitalsData] = useState<Record<number, string>>({});
  const updateVital = (vitalId: number, val: string) =>
    setVitalsData(prev => ({ ...prev, [vitalId]: val }));
  // the real id off this visit's saved vital rows (if any), so the next save sends a proper
  // upsert via consultationDetails.patientVitalId instead of always inserting a duplicate — see
  // loadVitalsForPatient below, which is what actually populates this
  const [savedPatientVitalId, setSavedPatientVitalId] = useState(0);

  // eagerly loads this patient's saved allergy details as soon as a patient is selected, so the
  // allergy badge is already populated by the time the consultation loads rather than staying
  // empty until the doctor manually opens the Allergy panel. Fired from the patient-select click
  // handler (below) as the very first statement — dispatched synchronously there, before
  // setSelectedPatient triggers the re-render that mounts/updates ConsultationEmrSections, so
  // this GET_PATIENT_ALLERGY_DETAIL_LIST call always goes out before that component's own
  // GET_DOCTOR_CONSULTATION_BY_VISIT_ID call. Mirrors AllergyPanel's own load/summary logic —
  // kept as a separate copy here since AllergyPanel's local AllergyRecord shape differs (extra
  // UI-only fields like `date`) and isn't a fit to share directly.
  const loadAllergySectionForPatient = async (patientId: number) => {
    if (!patientId) return;

    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PATIENT_ALLERGY_DETAIL_LIST,
      {},
      { params: { patientId } },
      { component: "DoctorConsultationNew", silent: true }
    );

    const rows: any[] = resp?.data ?? [];

    const records: AllergyRecordEntry[] = rows.map(r => ({
      id: Number(r.Id ?? r.id ?? 0),
      allergyId: Number(r.AllergyId ?? r.allergyId ?? 0),
      allergyName: r.AllergyName ?? r.allergyName ?? "",
      allergyTypeId: Number(r.AllergyTypeId ?? r.allergyTypeId ?? 0),
      allergyType: r.AllergyType ?? r.allergyType ?? "",
      reaction: r.Reaction ?? r.reaction ?? "",
      remarks: r.Remarks ?? r.remarks ?? "",
      interactionSeverity: r.InteractionSeverity ?? r.interactionSeverity ?? "",
      clinicalStatus: r.ClinicalStatus ?? r.clinicalStatus ?? "",
      verificationStatus: r.VerificationStatus ?? r.verificationStatus ?? "",
      snomedCode: r.SnomedCode ?? r.snomedCode ?? "",
      notKnownAllergy: Number(r.NotKnownAllergy ?? r.notKnownAllergy ?? 0),
      isPersisted: true,
    }));

    const notKnownAllergy = rows.some(
      r => Number(r.NotKnownAllergy ?? r.notKnownAllergy ?? 0) === 1
    );

    // same grouping/format as AllergyPanel's buildAllergySummary — "Type: name1,name2 ; Type2: name3"
    const order: string[] = [];
    const groups: Record<string, string[]> = {};
    records.forEach(r => {
      if (!r.allergyName) return;
      const type = r.allergyType || "Other";
      if (!groups[type]) {
        groups[type] = [];
        order.push(type);
      }
      groups[type].push(r.allergyName);
    });

    const summary =
      notKnownAllergy && records.length === 0
        ? "No Known Allergy"
        : order.map(type => `${type}: ${groups[type].join(",")}`).join(" ; ");

    setAllergySection({ summary: summary || null, notKnownAllergy, records });
  };

  // eagerly loads this visit's previously-saved vitals (if any), same trigger/ordering as
  // loadAllergySectionForPatient just above. GET_PATIENT_VITAL params { patientId, visitId }
  // returns flat rows already scoped to that one visit (confirmed contract — see the ENDPOINTS
  // comment) — this hydrates vitalsData from them and captures PatientVitalId (shared by every
  // row in the same saved batch) into savedPatientVitalId for the next save's upsert.
  const loadVitalsForPatient = async (patientId: number, visitId: number) => {
    if (!patientId) return;

    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PATIENT_VITAL,
      {},
      { params: { patientId, visitId } },
      { component: "DoctorConsultationNew", silent: true }
    );

    const rows: { PatientVitalId: number; VitalId: number; VitalValue: string }[] = resp?.data ?? [];
    if (rows.length === 0) return;

    setVitalsData(Object.fromEntries(rows.map(r => [r.VitalId, r.VitalValue])));
    setSavedPatientVitalId(rows[0].PatientVitalId);
  };

  const getPatientLists = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.SEARCH_PATIENT_FOR_CONSULTATION,
      {},
      {
        params: {
          branchId,
          typeId: selectedType,
          fromDate: appliedRange.startDate.toISOString(),
          toDate: appliedRange.endDate.toISOString(),
          doctorId: selectedDepartment,
        },
      },
      { component: "DoctorConsultationNew" }
    );
    return resp?.data ?? [];
  };

  const { data = [] } = useQuery({
    queryKey: [
      "getPatientLists",
      selectedType,
      appliedRange.startDate,
      appliedRange.endDate,
      selectedDepartment,
    ],
    queryFn: getPatientLists,
  });

  useEffect(() => {
    setActiveTab(selectedType === 1 ? "pending" : "admitted");
  }, [selectedType]);

  const tabFilteredData = data.filter((p: PatientItem) => {
    if (selectedType === 1) {
      if (activeTab === "pending") return p.IsConsultationDone == 0 && p.IsOut == 0;
      if (activeTab === "out") return p.IsConsultationDone == 0 && p.IsOut == 1;
      if (activeTab === "fileClose") return p.IsConsultationDone == 1;
    } else {
      if (activeTab === "admitted") return !p.IsDischarged || p.IsDischarged == 0;
      if (activeTab === "discharged") return p.IsDischarged == 1;
    }
    return true;
  });

  const filteredData = searchText
    ? tabFilteredData.filter((item: PatientItem) => {
        const q = searchText.toLowerCase();
        return (
          item.PatientName?.toLowerCase().includes(q) ||
          item.UHID?.toLowerCase().includes(q) ||
          item.ContactNumber?.includes(q)
        );
      })
    : tabFilteredData;

  const pendingCount = data.filter(
    (p: PatientItem) => p.IsConsultationDone == 0 && p.IsOut == 0
  ).length;
  const outCount = data.filter(
    (p: PatientItem) => p.IsConsultationDone == 0 && p.IsOut == 1
  ).length;
  const fileCloseCount = data.filter((p: PatientItem) => p.IsConsultationDone == 1).length;
  const admittedCount = data.filter(
    (p: PatientItem) => !p.IsDischarged || p.IsDischarged == 0
  ).length;
  const dischargedCount = data.filter((p: PatientItem) => p.IsDischarged == 1).length;

  /* 👉 temp range while selecting */
  const [tempRange, setTempRange] = useState(appliedRange);

  const changeDay = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    if (direction === "prev") newDate.setDate(selectedDate.getDate() - 1);
    else newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
    setAppliedRange(prev => ({ ...prev, startDate: newDate, endDate: newDate }));
    setTempRange(prev => ({ ...prev, startDate: newDate, endDate: newDate }));
  };

  const handleSelect = (ranges: any) => {
    setTempRange(ranges.selection);
  };

  const applyHandler = () => {
    setAppliedRange(tempRange);
    setSelectedDate(tempRange.startDate);
    setShowFullCalendar(false);
  };

  const cancelHandler = () => {
    setTempRange(appliedRange);
    setShowFullCalendar(false);
  };

  const displayText =
    appliedRange.startDate.toDateString() === appliedRange.endDate.toDateString()
      ? formatDate(appliedRange.startDate)
      : `${formatDate(appliedRange.startDate)} - ${formatDate(appliedRange.endDate)}`;

  const timeAgo = (dateStr: string): string => {
    if (!dateStr) return "";
    const cleaned = dateStr.trim().replace(/(\d{2})-([A-Za-z]{3})-(\d{4})\s+(.*)/, "$2 $1 $3 $4");
    const parsed = new Date(cleaned);
    if (isNaN(parsed.getTime())) return "";
    const diffMs = Date.now() - parsed.getTime();
    const diffMins = Math.floor(Math.abs(diffMs) / 60000);
    const future = diffMs < 0;
    if (diffMins < 60) return future ? `in ${diffMins}m` : `${diffMins} min ago`;
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hrs < 24)
      return future ? `in ${hrs}h ${mins}m` : `${hrs}:${String(mins).padStart(2, "0")} hrs ago`;
    return future ? `in ${Math.floor(hrs / 24)}d` : `${Math.floor(hrs / 24)}d ago`;
  };

  const getDoctorList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_MASTER,
      {},
      {},
      { component: "DoctorConsultationNew" }
    );
    return resp?.data ?? [];
  };

  const { data: doctorList = [] } = useQuery({
    queryKey: ["getDoctorList"],
    queryFn: getDoctorList,
  });

  // vitals shown are scoped to the treating doctor. Falls back to no vitals at all until a
  // patient (and therefore a doctor) is selected, rather than showing every vital in the system
  // unfiltered.
  const getVitalsForDoctor = async (doctorId: number): Promise<VitalMasterItem[]> => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_VITAL_DEPARTMENT_MAPPING_BY_DOCTOR_ID,
      {},
      { params: { doctorId } },
      { component: "DoctorConsultationNew" }
    );
    const data: VitalDepartmentMappingItem[] = resp?.data ?? [];
    return data.map(v => ({
      vitalId: v.VitalId,
      vitalName: v.VitalName,
      unitName: v.UnitName,
      minValue: v.MinValue,
      maxValue: v.MaxValue,
    }));
  };

  const { data: vitalMasterList = [] } = useQuery({
    queryKey: ["getVitalsForDoctor", selectedPatient?.DoctorId],
    queryFn: () => getVitalsForDoctor(selectedPatient!.DoctorId),
    enabled: selectedPatient?.DoctorId != null,
  });

  const vitalsList = vitalMasterList.map((v: VitalMasterItem) => v.vitalName);
  const vitalUnitsByName = Object.fromEntries(
    vitalMasterList.map((v: VitalMasterItem) => [v.vitalName, v.unitName])
  );

  // matches the real backend contract (api/EMR/savePatientConsultation) — one flat row per EMR
  // header, headerValue always a JSON string (JSON.stringify'd regardless of the underlying
  // value's own type, so the backend can uniformly JSON.parse it back on load rather than having
  // to guess whether a given headerValue is raw text or JSON-encoded text). dataId 0 means "new
  // row, let the backend assign one" — GET_DOCTOR_CONSULTATION_BY_VISIT_ID returns each header's
  // real dataId once saved, for a proper upsert on the next save.
  //
  // allergy/uploaded documents don't fit this contract (it's per-EMR-header only, no
  // attribute-type concept) — they aren't sent here. Allergy is saved separately via
  // saveAllergyDetails() (CREATE_UPDATE_PATIENT_ALLERGY_DETAILS, one row per record) as a gate
  // before handleFinalSave calls SAVE_PATIENT_CONSULTATION. Vitals DO fit — they ride along in the
  // same call as the payload's own patientVitalValue array (see below), not consultationHeadersData.
  const consultationPayload: PatientConsultationPayload | null = useMemo(() => {
    if (!selectedPatient) return null;

    const consultationHeadersData: ConsultationHeaderDataEntry[] = emrSectionsData
      // headerId 0 is a synthetic frontend-only row (e.g. a radioScoreGroup section's aggregate
      // "Total Score", card-group's masterless-group fallback) — no such header exists in Header
      // Master, so sending it as a real headerId would either violate a FK constraint or save
      // meaningless orphan data now that this hits a real backend.
      .filter(e => e.headerId > 0)
      .map(e => ({
        dataId: e.dataId ?? 0,
        sectionId: e.sectionId,
        headerId: e.headerId,
        controlTypeId: e.controlTypeId,
        templateId: 0,
        headerValue: JSON.stringify(e.value),
      }));

    // only vitals the doctor actually typed a value into — an empty chip means "not recorded",
    // not "recorded as blank"
    const patientVitalValue: PatientVitalValueEntry[] = Object.entries(vitalsData)
      .filter(([, value]) => value.trim() !== "")
      .map(([vitalId, value]) => ({ vitalId: Number(vitalId), vitalValue: value }));

    return {
      consultationDetails: {
        doctorId: selectedPatient.DoctorId,
        patientId: selectedPatient.PatientId,
        visitId: selectedPatient.VisitId,
        visitTypeId: selectedPatient.TypeId,
        isFileClosed: 0,
        // 0 for a visit with no vitals saved yet (insert); otherwise the id loadVitalsForPatient
        // captured off this visit's existing saved vitals (upsert)
        patientVitalId: savedPatientVitalId,
        // placeholder — handleFinalSave overwrites this with the actual save-time timestamp, the
        // same way it overwrites isFileClosed; this memo only shapes the data, not when it's sent
        vitalDateTime: "",
      },
      consultationHeadersData,
      patientVitalValue,
    };
  }, [selectedPatient, emrSectionsData, vitalsData, savedPatientVitalId]);

  // Allergy has its own save endpoint (CREATE_UPDATE_PATIENT_ALLERGY_DETAILS), one row per
  // allergy record — it doesn't fit SAVE_PATIENT_CONSULTATION's flat EMR-header contract, so it
  // must be persisted separately before the final save. `id` is only sent for a record already
  // persisted (loaded from GET_PATIENT_ALLERGY_DETAIL_LIST, or saved earlier this session); a
  // record added in this session but never saved sends id 0 so the backend inserts it.
  const saveAllergyDetails = async (): Promise<boolean> => {
    if (!selectedPatient || !allergySection || allergySection.records.length === 0) {
      return true;
    }

    for (const record of allergySection.records) {
      const resp = await fetchApi(
        "POST",
        ENDPOINTS.CREATE_UPDATE_PATIENT_ALLERGY_DETAILS,
        {
          id: record.isPersisted ? record.id : 0,
          patientId: selectedPatient.PatientId,
          allergyId: record.allergyId,
          allergyName: record.allergyName,
          allergyTypeId: record.allergyTypeId,
          allergyType: record.allergyType,
          reaction: record.reaction,
          remarks: record.remarks,
          interactionSeverity: record.interactionSeverity,
          clinicalStatus: record.clinicalStatus,
          verificationStatus: record.verificationStatus,
          snomedCode: record.snomedCode,
          notKnownAllergy: record.notKnownAllergy,
        },
        {},
        { component: "DoctorConsultationNew" }
      );

      if (!resp?.result) {
        showError(resp?.message ?? `Failed to save allergy "${record.allergyName || "record"}"`);
        return false;
      }
    }

    return true;
  };

  // "Save", "Save & Out", and "Save & File Close" all hit the same SAVE_PATIENT_CONSULTATION
  // endpoint with the same consultationHeadersData — the only thing that actually differs on the
  // wire is consultationDetails.isFileClosed (0 for Save/Out, 1 for File Close). "Out" has no
  // backend flag of its own (confirmed) — it behaves exactly like Save, just also returns the
  // doctor to the patient list afterward instead of staying on this consultation.
  const handleFinalSave = async (options?: {
    isFileClosed?: 0 | 1;
    goBackAfterSave?: boolean;
    goToTab?: string;
  }) => {
    if (!consultationPayload) return;
    const isFileClosed = options?.isFileClosed ?? 0;

    const isAllergySaved = await saveAllergyDetails();
    if (!isAllergySaved) return;

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.SAVE_PATIENT_CONSULTATION,
      {
        ...consultationPayload,
        consultationDetails: {
          ...consultationPayload.consultationDetails,
          isFileClosed,
          vitalDateTime: new Date().toISOString(),
        },
      },
      {},
      { component: "DoctorConsultationNew" }
    );
    if (resp?.result) {
      showSuccess(
        isFileClosed ? "Consultation saved and file closed" : "Consultation saved successfully"
      );
      confetti({
        particleCount: 90,
        spread: 75,
        startVelocity: 32,
        origin: { y: 0.35 },
        colors: ["#6366f1", "#a855f7", "#ec4899", "#10b981", "#06b6d4"],
      });

      // this visit's data (and possibly a brand-new visit entry) just changed on the backend —
      // refetch so the "Past Visits" history (usePatientVisitHistory) picks it up next time it's
      // opened instead of serving a stale react-query cache. Also refresh the patient list so its
      // Pending/Out/File Close tab counts reflect whatever this save just changed server-side.
      if (selectedPatient) {
        queryClient.invalidateQueries({
          queryKey: ["patientVisitHistory", selectedPatient.PatientId],
        });
        queryClient.invalidateQueries({
          queryKey: ["doctorConsultationByVisitId", selectedPatient.VisitId],
        });
        // refetches this visit's just-saved vitals so savedPatientVitalId picks up the real id —
        // otherwise a second Save in the same session (without leaving/reopening this patient)
        // would send patientVitalId 0 again and insert a duplicate row instead of upserting
        void loadVitalsForPatient(selectedPatient.PatientId, selectedPatient.VisitId);
        // VitalInsights' own history/graph tabs read this same endpoint — invalidate so they don't
        // serve a stale pre-save cache next time they're opened
        queryClient.invalidateQueries({ queryKey: ["getPatientVital", selectedPatient.PatientId] });
      }
      queryClient.invalidateQueries({ queryKey: ["getPatientLists"] });

      if (options?.goToTab) setActiveTab(options.goToTab);
      if (options?.goBackAfterSave) {
        setSelectedPatient(null);
        setLeftPanelVisible(true);
      }
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-heading">Doctor Consultation New</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Doctor Consultation New</span>
      </nav>

      <div className="relative flex flex-col lg:flex-row w-full gap-0">
        {/* LEFT PANEL */}
        <div
          className={`transition-all duration-300 flex-shrink-0 ${
            showFullCalendar ? "overflow-visible" : "overflow-hidden"
          } ${
            leftPanelVisible
              ? "lg:w-80 w-full opacity-100"
              : "hidden lg:block lg:w-0 lg:opacity-100"
          }`}
        >
          <div className="card mr-1 h-full flex flex-col gap-2 p-3">
            {/* Doctor + Type in one row */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-0.5">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-0.5">
                  Doctor
                </label>
                <div className="relative">
                  <select
                    value={selectedDepartment}
                    onChange={e => setSelectedDepartment(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-2 pr-6 py-2 text-xs text-gray-700 cursor-pointer shadow-sm hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                  >
                    <option value="0">-- All --</option>
                    {doctorList.map((dept: any) => (
                      <option key={dept.doctorId} value={dept.doctorId}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-0.5">
                  Type
                </label>
                <div className="relative">
                  <select
                    onChange={e => setSelectedType(Number(e.target.value))}
                    className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-2 pr-6 py-2 text-xs text-gray-700 cursor-pointer shadow-sm hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                  >
                    <option value={1}>OPD</option>
                    <option value={2}>IPD</option>
                    <option value={6}>Daycare</option>
                    <option value={7}>Dialysis</option>
                    <option value={9}>Emergency</option>
                  </select>

                  <ChevronDown
                    size={12}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                />
              </svg>
              <input
                className="w-full bg-white border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-xs text-gray-700 placeholder:text-gray-400 shadow-sm hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                placeholder="Search name, UHID, mobile..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
              />
              {searchText && (
                <button
                  onClick={() => setSearchText("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Compact date navigator */}
            <div className="relative flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-1 py-1">
              <button
                onClick={() => changeDay("prev")}
                className="p-1.5 rounded-md hover:bg-gray-200 active:scale-95 transition-all text-gray-600"
              >
                <ChevronLeft size={16} />
              </button>
              <div
                className="flex-1 text-center text-sm font-medium text-gray-700 cursor-pointer hover:text-blue-600 py-1 rounded-md hover:bg-blue-50 transition-all select-none"
                onClick={() => setShowFullCalendar(prev => !prev)}
              >
                {displayText}
              </div>
              <button
                onClick={() => changeDay("next")}
                className="p-1.5 rounded-md hover:bg-gray-200 active:scale-95 transition-all text-gray-600"
              >
                <ChevronRight size={16} />
              </button>

              {showFullCalendar && (
                <div className="absolute left-0 top-full mt-1 z-50 bg-white shadow-xl rounded-xl p-3 border border-gray-100">
                  <DateRangePicker
                    ranges={[tempRange]}
                    onChange={handleSelect}
                    months={2}
                    direction="horizontal"
                    showMonthAndYearPickers={true}
                    staticRanges={[]}
                    inputRanges={[]}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={cancelHandler} className="cancel-button">
                      Cancel
                    </button>
                    <button onClick={applyHandler} className="save-btn">
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              {selectedType === 1
                ? [
                    { key: "pending", label: "Pending", count: pendingCount },
                    { key: "out", label: "Out", count: outCount },
                    { key: "fileClose", label: "File Close", count: fileCloseCount },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex-1 py-1.5 text-xs font-semibold transition-all border-b-2 ${
                        activeTab === tab.key
                          ? "text-blue-600 border-blue-600"
                          : "text-gray-500 border-transparent hover:text-gray-700"
                      }`}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))
                : [
                    { key: "admitted", label: "Admitted", count: admittedCount },
                    { key: "discharged", label: "Discharged", count: dischargedCount },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex-1 py-1.5 text-xs font-semibold transition-all border-b-2 ${
                        activeTab === tab.key
                          ? "text-blue-600 border-blue-600"
                          : "text-gray-500 border-transparent hover:text-gray-700"
                      }`}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
            </div>

            {/* Patient List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 max-h-[calc(100vh-340px)]">
              {filteredData.length === 0 ? (
                <div className="text-center text-gray-400 py-10 text-sm">No patients found</div>
              ) : (
                filteredData.map((item: PatientItem, idx: number) => {
                  const isEmergency = item.TypeName === "OPD" && item.OPDConsultationTypeId === 3;
                  const isSelected =
                    selectedPatient !== null &&
                    selectedPatient.VisitId === item.VisitId &&
                    selectedPatient.DoctorId === item.DoctorId &&
                    selectedPatient.Id === item.Id &&
                    selectedPatient.AppointmentNo === item.AppointmentNo;
                  return (
                    <div
                      key={`${item.VisitId}-${item.DoctorId}-${item.Id}-${item.AppointmentNo}`}
                      onClick={() => {
                        // dispatched first so GET_PATIENT_ALLERGY_DETAIL_LIST/GET_PATIENT_VITAL
                        // always go out before ConsultationEmrSections'
                        // GET_DOCTOR_CONSULTATION_BY_VISIT_ID call
                        void loadAllergySectionForPatient(item.PatientId);
                        void loadVitalsForPatient(item.PatientId, item.VisitId);
                        setAllergySection(null);
                        // reset rather than leaving the previous patient's typed vitals showing
                        // until loadVitalsForPatient resolves (or forever, if this visit has none)
                        setVitalsData({});
                        setSavedPatientVitalId(0);
                        setSelectedPatient(item);
                        setLeftPanelVisible(false);
                      }}
                      className={`w-full rounded-xl border shadow-sm p-2.5 cursor-pointer active:scale-[0.98] transition-all duration-150 ${
                        isSelected
                          ? "bg-gradient-to-br from-blue-100 to-cyan-100 border-blue-500 ring-2 ring-blue-300 shadow-md"
                          : isEmergency
                            ? "bg-red-50/70 border-red-300 ring-1 ring-red-200 hover:border-red-400 hover:shadow-md"
                            : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md hover:bg-blue-50"
                      }`}
                    >
                      {/* Row 1 — Avatar + Name + Type + UP NEXT */}
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                          <User size={11} className="text-white" />
                        </div>
                        <span className="text-xs font-bold text-gray-800 flex-1 truncate">
                          {item.PatientName}
                        </span>
                        {isEmergency && (
                          <span className="flex items-center gap-1 text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded-full shrink-0">
                            <span className="relative flex w-1.5 h-1.5">
                              <span className="animate-ping absolute inline-flex w-full h-full rounded-full bg-white opacity-75" />
                              <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-white" />
                            </span>
                            EMERGENCY
                          </span>
                        )}
                        {idx === 0 && activeTab === "pending" && (
                          <span className="text-[10px] font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded-full shrink-0">
                            UP NEXT
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${item.TypeName === "IPD" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}
                        >
                          {item.TypeName}
                        </span>
                      </div>

                      {/* Row 2 — UHID | Age / Gender */}
                      <div className="flex items-center gap-1 text-[11px] text-gray-600 mb-1">
                        <span className="text-gray-400 text-[10px]">🪪</span>
                        <span className="font-medium text-gray-700">{item.UHID}</span>
                        <span className="text-gray-300">|</span>
                        <span className="truncate">
                          {item.Age} / {item.Gender}
                        </span>
                      </div>

                      {/* Row 3 — Doctor + timeAgo on the right */}
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1 min-w-0">
                          <Stethoscope size={10} className="text-gray-400 shrink-0" />
                          <span className="text-[11px] text-gray-600 truncate">
                            {item.DoctorName}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 bg-white/80 border border-gray-200 px-1.5 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                          {timeAgo(item.AppDateTime)}
                        </span>
                      </div>

                      {/* Row 4 — Date + Appt No */}
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <div className="flex items-center gap-1">
                          <CalendarClock size={10} className="text-gray-400 shrink-0" />
                          <span>{item.AppDateTime}</span>
                        </div>
                        <span className="font-medium shrink-0"># {item.AppointmentNo}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Toggle — outside the panel so it stays visible when panel collapses */}
        <button
          onClick={() => setLeftPanelVisible(prev => !prev)}
          title={leftPanelVisible ? "Hide panel" : "Show panel"}
          className={`hidden lg:flex absolute top-1/2 -translate-y-1/2 z-30 w-7 h-7 items-center justify-center rounded-full bg-white border border-gray-300 text-gray-500 shadow-sm hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-all duration-300 ${
            leftPanelVisible ? "left-80 -translate-x-3.5" : "left-0 translate-x-1"
          }`}
        >
          {leftPanelVisible ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* RIGHT CARD */}
        <div className="flex-1 min-w-0">
          {selectedPatient === null ? (
            /* ── Empty state ── */
            <div className="flex flex-col items-center justify-center h-full min-h-64 text-gray-400 gap-3 py-20">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <User size={32} className="text-gray-300" />
              </div>
              <p className="text-base font-medium text-gray-400">No patient selected</p>
              <p className="text-sm text-gray-300">
                Select a patient from the list to view details
              </p>
            </div>
          ) : (
            <div className="max-h-[calc(100vh-150px)] overflow-y-auto scrollbar-none pr-0.5">
              {/* Patient Header */}
              {(() => {
                const initials = selectedPatient.PatientName.split(" ")
                  .slice(0, 2)
                  .map((w: string) => w[0])
                  .join("")
                  .toUpperCase();
                const vitals = vitalMasterList.map((vm: VitalMasterItem, i: number) => ({
                  label: vm.vitalName,
                  key: vm.vitalId,
                  value: vitalsData[vm.vitalId] ?? "",
                  unit: vm.unitName,
                  Icon: iconForVital(vm.vitalName),
                  ...VITAL_ACCENTS[i % VITAL_ACCENTS.length],
                }));

                const visitFields = [
                  { label: "UHID / MRN", value: selectedPatient.UHID, highlight: false },
                  { label: "VISIT ID", value: selectedPatient.AppointmentNo, highlight: false },
                  { label: "VISIT DATE", value: selectedPatient.AppDateTime, highlight: false },
                  { label: "VISIT TYPE", value: selectedPatient.TypeName, highlight: false },
                  ...(selectedPatient.BedNo
                    ? [{ label: "BED NO", value: selectedPatient.BedNo, highlight: false }]
                    : []),
                  { label: "DOCTOR", value: selectedPatient.DoctorName, highlight: true },
                ];
                return (
                  <div className="sticky top-0 z-40 bg-white border border-slate-200/70 rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)] mb-3 overflow-hidden">
                    <div className="h-1 w-full bg-[#0B5394]" />
                    {/* ── Section 1: Name / badges / actions ── */}
                    <div className="flex flex-wrap items-start justify-between gap-3 px-3 sm:px-4 py-3">
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Avatar */}
                        <div className="relative w-12 h-12 rounded-xl bg-[#0B5394] flex items-center justify-center shrink-0 shadow-md ring-2 ring-white">
                          <span className="text-white font-bold text-base tracking-wide">
                            {initials}
                          </span>
                          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-white" />
                        </div>
                        <div className="flex flex-col gap-1">
                          {/* Name + age + allergy */}
                          <div className="flex items-center flex-wrap gap-2">
                            <span className="text-base font-bold text-gray-900">
                              {selectedPatient.PatientName}
                            </span>
                            <span className="text-sm text-gray-500">
                              {selectedPatient.Age} · {selectedPatient.Gender}
                            </span>
                            {/* Allergy badge */}
                            <button
                              type="button"
                              onClick={() => setShowAllergyPanel(true)}
                              title={allergySection?.summary || undefined}
                              className={`flex items-center gap-1 max-w-[220px] text-[11px] font-medium px-2 py-0.5 rounded-full border transition-colors ${
                                allergySection?.summary
                                  ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                                  : "bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                              }`}
                            >
                              <span className="truncate">
                                {allergySection?.summary || "No Allergy"}
                              </span>
                              <Edit size={10} className="shrink-0" />
                            </button>
                          </div>
                          {/* Phone + ABHA */}
                          <div className="flex items-center gap-3 flex-wrap">
                            {selectedPatient.ContactNumber && (
                              <div className="flex items-center gap-1.5">
                                <div className="w-4 h-4 rounded bg-blue-500 flex items-center justify-center shrink-0">
                                  <svg
                                    className="w-2.5 h-2.5 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </div>
                                <span className="text-sm text-blue-600 font-medium">
                                  {selectedPatient.ContactNumber}
                                </span>
                              </div>
                            )}
                            {/* ABHA Not Linked */}
                            <span className="text-[11px] bg-gray-100 text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full font-medium">
                              ABHA Not Linked
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:shrink-0 mt-1">
                        <button
                          type="button"
                          onClick={() => setShowUploadDocument(true)}
                          disabled={isFileClosed}
                          className="inline-flex items-center gap-1.5 text-sm font-medium border border-gray-300 rounded-lg px-3 sm:px-4 py-1.5 text-gray-600 hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:active:scale-100"
                        >
                          <Upload size={14} />
                          Upload Document
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPatient(null);
                            setLeftPanelVisible(true);
                          }}
                          className="inline-flex items-center gap-1.5 text-sm font-medium border border-gray-300 rounded-lg px-3 sm:px-4 py-1.5 text-gray-600 hover:bg-gray-50 active:scale-95 transition-all"
                        >
                          <ChevronLeft size={14} />
                          Back
                        </button>
                        <button className="text-sm font-medium border border-gray-300 rounded-lg px-3 sm:px-4 py-1.5 text-gray-600 hover:bg-gray-50 active:scale-95 transition-all">
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowPrintPreview(true)}
                          className="inline-flex items-center gap-1.5 text-sm font-medium border border-gray-300 rounded-lg px-3 sm:px-4 py-1.5 text-gray-600 hover:bg-gray-50 active:scale-95 transition-all"
                        >
                          <Printer size={14} />
                          Print
                        </button>
                        {isFileClosed ? (
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded-lg px-3 sm:px-4 py-1.5">
                            <FileCheck size={14} />
                            File Closed — read only
                          </span>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleFinalSave({ goBackAfterSave: true, goToTab: "out" })}
                              className="save-btn !px-3 sm:!px-4 !py-1.5 !text-sm inline-flex items-center gap-1.5"
                            >
                              <LogOut size={14} />
                              Save &amp; Out
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleFinalSave({
                                  isFileClosed: 1,
                                  goBackAfterSave: true,
                                  goToTab: "fileClose",
                                })
                              }
                              className="save-btn !px-3 sm:!px-4 !py-1.5 !text-sm inline-flex items-center gap-1.5"
                            >
                              <FileCheck size={14} />
                              Save &amp; File Close
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* ── Section 2: Visit info strip ──
                        desktop/tablet shows the full grid inline; phones get it collapsed behind
                        a one-line toggle so it doesn't compete with EMR Sections for screen space */}
                    <div className="hidden sm:flex bg-slate-50/70 border-t border-b border-slate-100 px-3 sm:px-4 py-2.5 flex-wrap gap-x-6 gap-y-2">
                      {visitFields.map(f => (
                        <div
                          key={f.label}
                          className={`flex flex-col px-2.5 py-1 rounded-lg ${f.highlight ? "bg-teal-50 ring-1 ring-teal-100" : ""}`}
                        >
                          <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">
                            {f.label}
                          </span>
                          <span
                            className={`text-sm font-semibold ${f.highlight ? "text-teal-600" : "text-gray-800"}`}
                          >
                            {f.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* phones only — compact visit-details summary bar, expands inline on tap */}
                    <div className="sm:hidden bg-slate-50/70 border-t border-b border-slate-100 px-3 py-2">
                      <button
                        type="button"
                        onClick={() => setIsDetailsExpandedMobile(v => !v)}
                        className="w-full flex items-center justify-between gap-2 active:scale-[0.98] transition-all"
                      >
                        <span className="min-w-0 flex-1 text-left text-xs text-gray-600 truncate">
                          <span className="font-semibold text-gray-800">
                            {selectedPatient.UHID}
                          </span>
                          {" · "}
                          {selectedPatient.TypeName}
                          {" · "}
                          <span className="text-teal-600 font-medium">
                            {selectedPatient.DoctorName}
                          </span>
                        </span>
                        <ChevronDown
                          size={14}
                          className={`text-slate-400 shrink-0 transition-transform ${isDetailsExpandedMobile ? "rotate-180" : ""}`}
                        />
                      </button>

                      {isDetailsExpandedMobile && (
                        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
                          {visitFields.map(f => (
                            <div
                              key={f.label}
                              className={`flex flex-col px-2.5 py-1 rounded-lg ${f.highlight ? "bg-teal-50 ring-1 ring-teal-100" : ""}`}
                            >
                              <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">
                                {f.label}
                              </span>
                              <span
                                className={`text-sm font-semibold ${f.highlight ? "text-teal-600" : "text-gray-800"}`}
                              >
                                {f.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* ── Section 3: Vitals strip — icon stat chips, editable ──
                        desktop/tablet shows every chip inline; phones get a compact summary bar
                        that expands the same chips on tap, so this card doesn't eat the whole
                        screen and push EMR Sections out of view */}
                    <div className="hidden sm:flex items-center gap-2 w-full px-4 py-3">
                      <div className="flex items-center gap-2 flex-1 flex-wrap">
                        {vitals.map(v => (
                          <div
                            key={v.key}
                            className={`group flex items-center gap-2 rounded-xl px-2.5 py-1.5 ring-1 flex-1 basis-32 min-w-[110px] transition-all ${
                              v.value
                                ? `${v.bg} ${v.ring}`
                                : "bg-slate-50 ring-slate-100 hover:ring-slate-200"
                            }`}
                          >
                            <span
                              className={`flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br ${v.grad} shrink-0 shadow-sm`}
                            >
                              <v.Icon size={13} className="text-white" strokeWidth={2.25} />
                            </span>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-0.5 whitespace-nowrap">
                                {v.label}
                              </span>
                              <div className="flex items-baseline gap-1">
                                <input
                                  type="text"
                                  value={v.value}
                                  onChange={e => updateVital(v.key, e.target.value)}
                                  disabled={isFileClosed}
                                  placeholder="--"
                                  className={`bg-transparent border-none outline-none p-0 text-[13.5px] font-bold leading-none w-11 placeholder:text-slate-300 disabled:cursor-not-allowed ${
                                    v.value ? v.text : "text-slate-300"
                                  }`}
                                />
                                <span className="text-[9px] text-slate-400 leading-none whitespace-nowrap">
                                  {v.unit}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowVitalInsights(true)}
                        title="View vitals insights"
                        className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 text-white shrink-0 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
                      >
                        <Activity size={16} />
                      </button>
                    </div>

                    {/* phones only — compact vitals summary bar, expands inline on tap */}
                    <div className="sm:hidden w-full px-3 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsVitalsExpandedMobile(v => !v)}
                          className="flex-1 min-w-0 flex items-center justify-between gap-2 rounded-xl bg-slate-50 ring-1 ring-slate-100 px-3 py-2 active:scale-[0.98] transition-all"
                        >
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                            <HeartPulse size={13} className="text-slate-400" />
                            Vitals
                            <span className="text-[10px] font-medium text-slate-400">
                              {vitals.filter(v => v.value).length}/{vitals.length} recorded
                            </span>
                          </span>
                          <ChevronDown
                            size={14}
                            className={`text-slate-400 transition-transform ${isVitalsExpandedMobile ? "rotate-180" : ""}`}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowVitalInsights(true)}
                          title="View vitals insights"
                          className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 text-white shrink-0 shadow-md active:scale-95 transition-all"
                        >
                          <Activity size={16} />
                        </button>
                      </div>

                      {isVitalsExpandedMobile && (
                        <div className="flex items-center gap-2 flex-wrap mt-2">
                          {vitals.map(v => (
                            <div
                              key={v.key}
                              className={`group flex items-center gap-2 rounded-xl px-2.5 py-1.5 ring-1 flex-1 basis-32 min-w-[110px] transition-all ${
                                v.value ? `${v.bg} ${v.ring}` : "bg-slate-50 ring-slate-100"
                              }`}
                            >
                              <span
                                className={`flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br ${v.grad} shrink-0 shadow-sm`}
                              >
                                <v.Icon size={13} className="text-white" strokeWidth={2.25} />
                              </span>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-0.5 whitespace-nowrap">
                                  {v.label}
                                </span>
                                <div className="flex items-baseline gap-1">
                                  <input
                                    type="text"
                                    value={v.value}
                                    onChange={e => updateVital(v.key, e.target.value)}
                                    disabled={isFileClosed}
                                    placeholder="--"
                                    className={`bg-transparent border-none outline-none p-0 text-[13.5px] font-bold leading-none w-11 placeholder:text-slate-300 disabled:cursor-not-allowed ${
                                      v.value ? v.text : "text-slate-300"
                                    }`}
                                  />
                                  <span className="text-[9px] text-slate-400 leading-none whitespace-nowrap">
                                    {v.unit}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              <ConsultationEmrSections
                doctorId={selectedPatient?.DoctorId}
                patientId={selectedPatient?.PatientId}
                visitId={selectedPatient?.VisitId}
                usedForPatientTypeId={selectedPatient?.TypeId}
                onSectionsChange={setEmrSectionsData}
                disabled={isFileClosed}
              />
            </div>
          )}
        </div>
      </div>

      <VitalInsights
        isOpen={showVitalInsights}
        onClose={() => setShowVitalInsights(false)}
        patientId={selectedPatient?.PatientId}
        vitalsList={vitalsList}
        vitalUnits={vitalUnitsByName}
        vitalMasterList={vitalMasterList}
      />
      <AllergyPanel
        isOpen={showAllergyPanel}
        onClose={() => setShowAllergyPanel(false)}
        patientId={selectedPatient?.PatientId}
        visitId={selectedPatient?.VisitId}
        onBind={setAllergySection}
        disabled={isFileClosed}
      />
      <PrintPreviewModal
        isOpen={showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
        doctorId={selectedPatient?.DoctorId}
        patientId={selectedPatient?.PatientId}
        usedForPatientTypeId={selectedPatient?.TypeId}
        patient={selectedPatient}
        emrSectionsData={emrSectionsData}
        vitals={vitalMasterList}
        vitalsData={vitalsData}
        allergy={allergySection}
      />
      <UploadDocumentModal
        isOpen={showUploadDocument}
        onClose={() => setShowUploadDocument(false)}
      />
      {selectedPatient && <MedicineAssistantWidget emrSectionsData={emrSectionsData} />}
    </div>
  );
};

export default DoctorConsultationNew;
