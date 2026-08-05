import {
  Activity,
  CalendarClock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Droplet,
  Edit,
  Gauge,
  HeartPulse,
  LucideIcon,
  Printer,
  Ruler,
  Save,
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
import { useEmrSectionHistoryStore } from "@/store/useEmrSectionHistoryStore";
import { useVisitReportsStore } from "@/store/useVisitReportsStore";
import { showSuccess } from "@/utils/alert";
import { useQuery } from "@tanstack/react-query";
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
  AllergySection,
  AttributeBuilder,
  EmrConsultationPayload,
  EmrSectionAnswerEntry,
  PatientItem,
} from "./types";

interface VitalMasterItem {
  vitalId: number;
  vitalName: string;
  unitID: number;
  unitName: string;
  minValue: string;
  maxValue: string;
  SnomedCode: string | null;
  IsActive: number;
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
  const authUser = useContext(AuthContext)?.user;
  const branchId = authUser?.branchId ?? 1;
  const addVisitSnapshot = useEmrSectionHistoryStore(s => s.addVisitSnapshot);
  // "imageUpload" sections save through their own store/endpoint (SAVE_PATIENT_VISIT_REPORT) —
  // read here too so a single saveConsultationEmr call can also carry them, instead of the main
  // payload silently omitting whatever's in the Patient Reports panel
  const allVisitReports = useVisitReportsStore(s => s.reports);

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
  const [consultationId, setConsultationId] = useState("");
  const [allergySection, setAllergySection] = useState<AllergySection | null>(null);
  const [emrSectionsData, setEmrSectionsData] = useState<EmrSectionAnswerEntry[]>([]);
  const [vitalsData, setVitalsData] = useState<Record<number, string>>({});
  const updateVital = (vitalId: number, val: string) =>
    setVitalsData(prev => ({ ...prev, [vitalId]: val }));
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
    console.log("resp", resp?.data);
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

  const getVitalMasterList = async (): Promise<VitalMasterItem[]> => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_VITAL_MASTER_LIST,
      {},
      { params: { isActive: 1 } },
      { component: "DoctorConsultationNew" }
    );
    return resp?.data ?? [];
  };

  const { data: vitalMasterList = [] } = useQuery({
    queryKey: ["getVitalMasterList"],
    queryFn: getVitalMasterList,
  });

  const vitalsList = vitalMasterList.map((v: VitalMasterItem) => v.vitalName);
  const vitalUnitsByName = Object.fromEntries(
    vitalMasterList.map((v: VitalMasterItem) => [v.vitalName, v.unitName])
  );

  const buildVitalAttributes: AttributeBuilder = () => {
    const filled = vitalMasterList.filter(
      (v: VitalMasterItem) => (vitalsData[v.vitalId] ?? "").trim() !== ""
    );
    if (filled.length === 0) return [];

    return [
      {
        attributeType: "vital",
        attributeCode: "Vital",
        label: "Vital",
        value: filled.map((v: VitalMasterItem) => ({
          vitalId: v.vitalId,
          vitalName: v.vitalName,
          value: vitalsData[v.vitalId],
          unitName: v.unitName,
        })),
      },
    ];
  };

  const buildAllergyAttributes: AttributeBuilder = () =>
    allergySection
      ? [
          {
            attributeType: "allergy",
            attributeCode: "allergy",
            label: "Allergy",
            value: allergySection,
          },
        ]
      : [];

  const buildEmrSectionAttributes: AttributeBuilder = () => {
    const bySectionId = new Map<
      number,
      { sectionName: string; entries: EmrSectionAnswerEntry[] }
    >();
    emrSectionsData.forEach(e => {
      const bucket = bySectionId.get(e.sectionId) ?? { sectionName: e.sectionName, entries: [] };
      bucket.entries.push(e);
      bySectionId.set(e.sectionId, bucket);
    });

    return Array.from(bySectionId.entries()).map(([sectionId, { sectionName, entries }]) => ({
      attributeType: "emrSection",
      attributeCode: sectionName.replace(/[^a-zA-Z0-9]/g, ""),
      label: sectionName,
      sectionId,
      value: entries.map(e => ({
        headerId: e.headerId,
        headerName: e.headerName,
        controlType: e.controlType,
        controlTypeId: e.controlTypeId,
        value: e.value,
      })),
    }));
  };

  // "imageUpload" controls (the Patient Reports panel) manage their own store scoped only by
  // patientId/visitId, not by section/header — so unlike buildEmrSectionAttributes, this is one
  // flat attribute for the whole visit rather than one per section
  const buildImageUploadAttributes: AttributeBuilder = () => {
    if (!selectedPatient) return [];
    const reports = allVisitReports.filter(
      r => r.patientId === selectedPatient.PatientId && r.visitId === selectedPatient.VisitId
    );
    if (reports.length === 0) return [];

    return [
      {
        attributeType: "imageUpload",
        attributeCode: "patientReports",
        label: "Patient Reports",
        value: reports,
      },
    ];
  };

  // Register a new builder here to add another attribute to the save payload —
  // the payload shape itself never has to change.
  const attributeBuilders: AttributeBuilder[] = [
    buildVitalAttributes,
    buildAllergyAttributes,
    buildEmrSectionAttributes,
    buildImageUploadAttributes,
  ];

  const emrPayload: EmrConsultationPayload | null = useMemo(() => {
    if (!selectedPatient || !consultationId) return null;

    const now = new Date().toISOString();

    return {
      id: consultationId,
      version: "1.0",

      patientId: selectedPatient.PatientId,
      patientName: selectedPatient.PatientName,
      doctorId: selectedPatient.DoctorId,
      doctorName: selectedPatient.DoctorName,
      typeId: selectedPatient.TypeId,
      typeName: selectedPatient.TypeName,
      visitId: selectedPatient.VisitId,
      uhid: selectedPatient.UHID,
      appointmentNo: selectedPatient.AppointmentNo,

      attributes: attributeBuilders.flatMap(build => build()),

      audit: {
        createdBy: authUser?.userId ?? 0,
        createdByName: authUser?.userName ?? "",
        createdOn: now,
        lastUpdatedBy: authUser?.userId ?? 0,
        lastUpdatedByName: authUser?.userName ?? "",
        lastUpdatedOn: now,
      },
    };
  }, [
    selectedPatient,
    consultationId,
    vitalMasterList,
    vitalsData,
    allergySection,
    emrSectionsData,
    allVisitReports,
    authUser,
  ]);

  const handleFinalSave = async () => {
    if (!emrPayload) return;
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.SAVE_CONSULTATION_EMR,
      emrPayload,
      {},
      { component: "DoctorConsultationNew" }
    );
    if (resp?.result) {
      showSuccess("Consultation saved successfully");
      confetti({
        particleCount: 90,
        spread: 75,
        startVelocity: 32,
        origin: { y: 0.35 },
        colors: ["#6366f1", "#a855f7", "#ec4899", "#10b981", "#06b6d4"],
      });

      // stand-in for GET_EMR_SECTION_HISTORY until the backend endpoint exists —
      // see useEmrSectionHistoryStore for the intended API contract
      if (selectedPatient) {
        const bySectionId = new Map<
          number,
          { sectionName: string; entries: EmrSectionAnswerEntry[] }
        >();
        emrSectionsData.forEach(e => {
          const bucket = bySectionId.get(e.sectionId) ?? {
            sectionName: e.sectionName,
            entries: [],
          };
          bucket.entries.push(e);
          bySectionId.set(e.sectionId, bucket);
        });

        const recordedOn = new Date().toISOString();
        bySectionId.forEach(({ sectionName, entries }, sectionId) => {
          addVisitSnapshot({
            patientId: selectedPatient.PatientId,
            sectionId,
            sectionName,
            visitId: selectedPatient.VisitId,
            doctorId: selectedPatient.DoctorId,
            doctorName: selectedPatient.DoctorName,
            recordedOn,
            values: entries.map(e => ({
              headerId: e.headerId,
              headerName: e.headerName,
              controlType: e.controlType,
              value: e.value,
            })),
          });
        });
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
                        setSelectedPatient(item);
                        setConsultationId(crypto.randomUUID());
                        setLeftPanelVisible(false);
                        setAllergySection(null);
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
                          className="inline-flex items-center gap-1.5 text-sm font-medium border border-gray-300 rounded-lg px-3 sm:px-4 py-1.5 text-gray-600 hover:bg-gray-50 active:scale-95 transition-all"
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
                        <button
                          type="button"
                          onClick={handleFinalSave}
                          className="save-btn !px-3 sm:!px-4 !py-1.5 !text-sm inline-flex items-center gap-1.5"
                        >
                          <Save size={14} />
                          Save
                        </button>
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
                                  placeholder="--"
                                  className={`bg-transparent border-none outline-none p-0 text-[13.5px] font-bold leading-none w-11 placeholder:text-slate-300 ${
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
                                    placeholder="--"
                                    className={`bg-transparent border-none outline-none p-0 text-[13.5px] font-bold leading-none w-11 placeholder:text-slate-300 ${
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
                onSectionsChange={setEmrSectionsData}
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
      />
      <AllergyPanel
        isOpen={showAllergyPanel}
        onClose={() => setShowAllergyPanel(false)}
        patientId={selectedPatient?.VisitId}
        visitId={selectedPatient?.VisitId}
        onBind={setAllergySection}
      />
      <PrintPreviewModal
        isOpen={showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
        doctorId={selectedPatient?.DoctorId}
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
