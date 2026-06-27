import { CalendarClock, ChevronDown, ChevronLeft, ChevronRight, Edit, Stethoscope, User } from "lucide-react";
import { useCallback, useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import { ENDPOINTS } from "@/config/defaults";
import { AuthContext } from "@/context/AuthContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useQuery } from "@tanstack/react-query";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import VitalDrawer from "./components/VitalDrawer";
import { PatientItem } from "./types";

/* ---------- format helper ---------- */
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
  const branchId = useContext(AuthContext)?.user?.branchId ?? 1;

  const [selectedType, setSelectedType] = useState<number>(1);

  const [appliedRange, setAppliedRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showFullCalendar, setShowFullCalendar] = useState(false);

  const [renderVitalDrawer, setRenderVitalDrawer] = useState<boolean>(false);
  const [openVitalDrawer, setOpenVitalDrawer] = useState<boolean>(false);
  const [leftPanelVisible, setLeftPanelVisible] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState("0");
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedPatient, setSelectedPatient] = useState<PatientItem | null>(null);
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
    queryKey: ["getPatientLists", selectedType, appliedRange.startDate, appliedRange.endDate, selectedDepartment],
    queryFn: getPatientLists,
  });

  /* reset tab when type changes */
  useEffect(() => {
    setActiveTab(selectedType === 1 ? "pending" : "admitted");
  }, [selectedType]);

  /* tab + search filtering */
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

  const pendingCount = data.filter((p: PatientItem) => p.IsConsultationDone == 0 && p.IsOut == 0).length;
  const outCount = data.filter((p: PatientItem) => p.IsConsultationDone == 0 && p.IsOut == 1).length;
  const fileCloseCount = data.filter((p: PatientItem) => p.IsConsultationDone == 1).length;
  const admittedCount = data.filter((p: PatientItem) => !p.IsDischarged || p.IsDischarged == 0).length;
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

  /* ---------- handlers ---------- */

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
    if (hrs < 24) return future ? `in ${hrs}h ${mins}m` : `${hrs}:${String(mins).padStart(2, "0")} hrs ago`;
    return future ? `in ${Math.floor(hrs / 24)}d` : `${Math.floor(hrs / 24)}d ago`;
  };

  const vitalsList = [
    "Pulse",
    "Systolic",
    "Diastolic",
    "SPO2",
    "Temperature",
    "R rate",
    "Height",
    "Weight",
    "Ofc",
    "Waist",
    "Hip",
    "PEFR",
    "Body Fat",
    "Upper Segment",
    "Lower Segment",
    "Arm Span",
    "Sitting Height",
    "Height Age",
    "EGFR",
    "BMI",
    "Fundal Ht.",
    "Diastolic (Rt)",
    "Diastolic (Lt)",
    "Systolic (Rt)",
    "Systolic (Lt)",
    "MUAC",
    "ECOG Score",
    "CAT Score",
    "ACT Score",
    "BSA",
    "HGT",
    "Systolic (Lying)",
    "Diastolic (Lying)",
    "Systolic (Standing)",
    "Diastolic (Standing)",
    "General-RBS",
    "Spot Blood Sugar",
  ];

  const vitalDrawerHandler = () => {
    setRenderVitalDrawer(true);
    requestAnimationFrame(() => {
      setOpenVitalDrawer(true);
    });
  };

  const closeHandler = useCallback(() => {
    setOpenVitalDrawer(false);
  }, []);
 
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
  useEffect(() => {
    if (openVitalDrawer) return;

    const closeTimer = setTimeout(() => {
      setRenderVitalDrawer(false);
    }, 300);

    return () => clearTimeout(closeTimer);
  }, [openVitalDrawer]);
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
            leftPanelVisible ? "lg:w-80 w-full opacity-100" : "lg:w-0 w-full opacity-0 lg:opacity-100"
          }`}
        >
          <div className="card mr-1 h-full flex flex-col gap-2 p-3">
            {/* Doctor + Type in one row */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-0.5">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-0.5">Doctor</label>
                <div className="relative">
                  <select
                    value={selectedDepartment}
                    onChange={e => setSelectedDepartment(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-2 pr-6 py-2 text-xs text-gray-700 cursor-pointer shadow-sm hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                  >
                    <option value="0">-- All --</option>
                    {doctorList.map((dept: any) => (
                      <option key={dept.doctorId} value={dept.doctorId}>{dept.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-0.5">Type</label>
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
                  <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
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
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                    <button onClick={cancelHandler} className="cancel-button">Cancel</button>
                    <button onClick={applyHandler} className="save-btn">Apply</button>
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              {selectedType === 1 ? (
                [
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
              ) : (
                [
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
                ))
              )}
            </div>

            {/* Patient List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 max-h-[calc(100vh-340px)]">
              {filteredData.length === 0 ? (
                <div className="text-center text-gray-400 py-10 text-sm">No patients found</div>
              ) : (
                filteredData.map((item: PatientItem, idx: number) => (
                  <div
                    key={`${item.VisitId}-${item.DoctorId}`}
                    onClick={() => setSelectedPatient(item)}
                    className={`w-full rounded-xl border shadow-sm p-2.5 cursor-pointer active:scale-[0.98] transition-all duration-150 ${
                      selectedPatient?.VisitId === item.VisitId && selectedPatient?.DoctorId === item.DoctorId
                        ? "bg-gradient-to-br from-blue-100 to-cyan-100 border-blue-500 ring-2 ring-blue-300 shadow-md"
                        : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md hover:bg-blue-50"
                    }`}
                  >
                    {/* Row 1 — Avatar + Name + Type + UP NEXT */}
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                        <User size={11} className="text-white" />
                      </div>
                      <span className="text-xs font-bold text-gray-800 flex-1 truncate">{item.PatientName}</span>
                      {idx === 0 && activeTab === "pending" && (
                        <span className="text-[10px] font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded-full shrink-0">UP NEXT</span>
                      )}
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${item.TypeName === "IPD" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                        {item.TypeName}
                      </span>
                    </div>

                    {/* Row 2 — UHID | Age / Gender */}
                    <div className="flex items-center gap-1 text-[11px] text-gray-600 mb-1">
                      <span className="text-gray-400 text-[10px]">🪪</span>
                      <span className="font-medium text-gray-700">{item.UHID}</span>
                      <span className="text-gray-300">|</span>
                      <span className="truncate">{item.Age} / {item.Gender}</span>
                    </div>

                    {/* Row 3 — Doctor + timeAgo on the right */}
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1 min-w-0">
                        <Stethoscope size={10} className="text-gray-400 shrink-0" />
                        <span className="text-[11px] text-gray-600 truncate">{item.DoctorName}</span>
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
                ))
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
              <p className="text-sm text-gray-300">Select a patient from the list to view details</p>
            </div>
          ) : (
            <>
              {/* Patient Info Bar */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-sm flex flex-wrap gap-x-5 gap-y-1 mb-3">
                <span><strong className="text-gray-500 font-medium">UHID:</strong> <span className="text-gray-800">{selectedPatient.UHID}</span></span>
                <span><strong className="text-gray-500 font-medium">Name:</strong> <span className="text-gray-800">{selectedPatient.PatientName}</span></span>
                <span><strong className="text-gray-500 font-medium">Age / Gender:</strong> <span className="text-gray-800">{selectedPatient.Age} / {selectedPatient.Gender}</span></span>
                <span><strong className="text-gray-500 font-medium">Doctor:</strong> <span className="text-gray-800">{selectedPatient.DoctorName}</span></span>
                {selectedPatient.BedNo && (
                  <span><strong className="text-gray-500 font-medium">Bed No:</strong> <span className="text-gray-800">{selectedPatient.BedNo}</span></span>
                )}
                <span><strong className="text-gray-500 font-medium">Appt:</strong> <span className="text-gray-800">{selectedPatient.AppDateTime}</span></span>
              </div>

              {/* Tab */}
              <div className="bg-white border-b px-4 py-2 text-gray-700 font-medium">Consultation</div>

              {/* Vitals Card */}
              <div className="bg-white rounded-xl shadow mt-3 max-w-120">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <h3 className="font-semibold text-gray-800">Vitals Trend</h3>
                  <Edit size={16} className="text-blue-500 cursor-pointer" onClick={vitalDrawerHandler} />
                </div>
                <div className="lg:max-h-108 overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-100">
                      <tr className="border-b border-gray-200">
                        <th className="text-left px-4 py-2 font-medium text-gray-600">Vital Type</th>
                        <th className="text-right px-4 py-2 font-medium text-gray-600">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vitalsList.map((vital, i) => (
                        <tr key={i} className="border-t border-gray-200 hover:bg-gray-50">
                          <td className="px-4 py-2 text-gray-700">{vital}</td>
                          <td className="px-10 py-2 text-right text-gray-400">-</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {/* Drawer */}
      {renderVitalDrawer && <VitalDrawer isOpen={openVitalDrawer} onClose={closeHandler} />}
    </div>
  );
};

export default DoctorConsultationNew;
