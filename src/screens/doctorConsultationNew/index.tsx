import InputField from "@/components/customInputField";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

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
          <InputField label="Date">
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
          </InputField>
        </div>

        {/* RIGHT CARD */}
        <div className="flex-1 card"></div>
      </div>
    </div>
  );
};

export default DoctorConsultationNew;
