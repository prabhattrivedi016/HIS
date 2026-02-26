import InputField from "@/components/customInputField";
import { ArrowLeft, ArrowRight, CalendarClock, Edit, Stethoscope, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import VitalDrawer from "./components/VitalDrawer";

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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showFullCalendar, setShowFullCalendar] = useState(false);

  const [renderVitalDrawer, setRenderVitalDrawer] = useState<boolean>(false);
  const [openVitalDrawer, setOpenVitalDrawer] = useState<boolean>(false);

  /* 👉 final applied range */
  const [appliedRange, setAppliedRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });

  /* 👉 temp range while selecting */
  const [tempRange, setTempRange] = useState(appliedRange);

  const changeDay = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);

    if (direction === "prev") newDate.setDate(selectedDate.getDate() - 1);
    else newDate.setDate(selectedDate.getDate() + 1);

    setSelectedDate(newDate);
  };

  /* ---------- handlers ---------- */

  const handleSelect = (ranges: any) => {
    setTempRange(ranges.selection);
  };

  const applyHandler = () => {
    setAppliedRange(tempRange);
    setShowFullCalendar(false);
  };

  const cancelHandler = () => {
    setTempRange(appliedRange);
    setShowFullCalendar(false);
  };

  const displayText = `${formatDate(appliedRange.startDate)} - ${formatDate(appliedRange.endDate)}`;

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

      <div className="flex flex-col lg:flex-row gap-2 w-full">
        {/* LEFT CARD */}
        <div className="lg:w-1/3 w-full card">
          <div className="form-grid-2">
            <InputField label="Doctor">
              <input className="input-field" />
            </InputField>

            <InputField label="Type">
              <input className="input-field" />
            </InputField>
          </div>

          {/* Search */}
          <div className="relative w-full">
            <input className="input-field pr-10" placeholder="Search by Name, UHID, Mobile No" />
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2 input-field lg:h-11">
            <button
              onClick={() => changeDay("prev")}
              className="p-1 rounded-md bg-white shadow hover:bg-gray-50 active:scale-95"
            >
              <ArrowLeft size={20} />
            </button>

            {/* Date text */}
            <div className="relative flex-1">
              <div
                className="text-center px-4 py-2 bg-gray-200 rounded-md font-medium text-gray-700 cursor-pointer"
                onClick={() => setShowFullCalendar(prev => !prev)}
              >
                {displayText}
              </div>

              {showFullCalendar && (
                <div className="absolute -left-10 top-full mt-2 z-50 bg-white shadow-lg rounded-lg p-3">
                  <DateRangePicker
                    ranges={[tempRange]}
                    onChange={handleSelect}
                    months={2}
                    direction="horizontal"
                    showMonthAndYearPickers={true}
                  />

                  {/* footer */}
                  <div className="flex flex-row justify-end gap-2 mt-2">
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

            <button
              onClick={() => changeDay("next")}
              className="p-1 rounded-md bg-white shadow hover:bg-gray-50 active:scale-95"
            >
              <ArrowRight size={20} />
            </button>
          </div>
          <div className="w-full">
            {/* Scroll Area */}
            <div className="max-h-[380px] overflow-y-auto space-y-3 pr-1">
              {[1, 2, 3, 4, 5, 6].map(item => (
                <div
                  key={item}
                  className="w-full rounded-lg border border-blue-400 bg-slate-200 shadow-sm p-1.5"
                >
                  {/* Top Row */}
                  <div className="flex items-start justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">MR. SHREYANSH</h2>

                    <span className="bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded">
                      IPD
                    </span>
                  </div>

                  {/* Details */}
                  <div className="mt-2 space-y-1 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-500" />
                      <span>202512020010 | 50Y 0M 0D / MALE</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Stethoscope size={16} className="text-gray-500" />
                      <span>Dr. ANAMIKA KUMARI</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CalendarClock size={16} className="text-gray-500" />
                        <span>04-Dec-2025 9:55:00 AM</span>
                      </div>

                      <span className="text-gray-500">#251204001</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT CARD */}
        <div className="flex-1 ">
          {/* Patient Info Bar */}
          <div className="bg-gray-200 border-b border-gray-300 px-2 py-2 text-sm flex flex-wrap gap-4 card">
            <span>
              <strong>UHID:</strong> 202512020010
            </span>
            <span>
              <strong>Name:</strong> MR. SHREYANSH
            </span>
            <span>
              <strong>Age / Gender:</strong> 50Y 0M 0D / MALE
            </span>
            <span>
              <strong>Doctor:</strong> Dr. ANAMIKA KUMARI
            </span>
            <span>
              <strong>Bed No:</strong> SURGERIE/3
            </span>
          </div>

          {/* Tab */}
          <div className="bg-white border-b px-4 py-2 text-gray-700 font-medium ">Consultation</div>

          {/* Card */}
          <div className="bg-white rounded-md shadow mt-4 max-w-120">
            {/* Card Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-gray-800">Vitals Trend</h3>
              <Edit
                size={16}
                className="text-blue-500 cursor-pointer"
                onClick={vitalDrawerHandler}
              />
            </div>

            {/* Table */}
            <div className="lg:max-h-108 overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-100">
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Vital Type</th>
                    <th className="text-right px-4 py-2 font-medium text-gray-600">
                      24-Feb-2026 06:09
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {vitalsList.map((vital, i) => (
                    <tr key={i} className="border-t border-gray-200">
                      <td className="px-4 py-2 text-gray-700">{vital}</td>
                      <td className="px-10 py-2 text-right text-gray-500">-</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* Drawer */}
      {renderVitalDrawer && <VitalDrawer isOpen={openVitalDrawer} onClose={closeHandler} />}
    </div>
  );
};

export default DoctorConsultationNew;
