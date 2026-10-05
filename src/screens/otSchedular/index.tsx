import InputField from "@/components/customInputField";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { OtMasterItem } from "./types";

type ViewMode = "day" | "week";

type SlotInterval = 30 | 60 | 90 | 120;

type SchedulerStatus = "scheduled" | "in-progress" | "completed";

type ResourceItem = {
  id: number;
  name: string;
  status?: "available" | "maintenance";
};

type SchedulerEvent = {
  id: number;
  resourceId: number;

  // Required for Week View
  bookingDate: string;

  patientName: string;
  uhid: string;
  procedureName: string;
  doctorName: string;

  startTime: string;
  endTime: string;

  status: SchedulerStatus;
};

export default function OtSchedular() {
  const { fetchApi } = useGlobalApi();

  // =========================================================
  // STATE
  // =========================================================

  const [otNameList, setOtNameList] = useState<OtMasterItem[]>([]);

  const [selectedOtId, setSelectedOtId] = useState<number>(0);

  const [selectedDate, setSelectedDate] = useState<string>("2026-10-03");

  const [viewMode, setViewMode] = useState<ViewMode>("day");

  const [slotInterval, setSlotInterval] = useState<SlotInterval>(30);

  const [selectedEvent, setSelectedEvent] = useState<SchedulerEvent | null>(null);

  // =========================================================
  // GET OT MASTER LIST
  // =========================================================

  const getOtMasterList = async () => {
    try {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_OT_MASTER_LIST,
        {},
        {
          params: {
            isActive: 1,
          },
        },
        {
          component: "OtSchedular",
        }
      );

      setOtNameList(resp?.data ?? []);
    } catch (error) {
      console.error("Failed to get OT master list:", error);

      setOtNameList([]);
    }
  };

  useEffect(() => {
    getOtMasterList();
  }, []);

  // =========================================================
  // DATE HELPERS
  // =========================================================

  const parseDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);

    return new Date(year, month - 1, day);
  };

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const addDays = (dateString: string, days: number) => {
    const date = parseDate(dateString);

    date.setDate(date.getDate() + days);

    return formatDateForInput(date);
  };

  const formatFullDate = (dateString: string) => {
    return parseDate(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatWeekDate = (dateString: string) => {
    return parseDate(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  };

  // =========================================================
  // OT RESOURCES
  // =========================================================

  const resources = useMemo<ResourceItem[]>(() => {
    if (selectedOtId === 0) {
      return otNameList.map(ot => ({
        id: Number(ot.OTId),
        name: ot.OTName,
        status: Number(ot.IsActive) === 1 ? "available" : "maintenance",
      }));
    }

    const selectedOT = otNameList.find(ot => Number(ot.OTId) === selectedOtId);

    if (!selectedOT) {
      return [];
    }

    return [
      {
        id: Number(selectedOT.OTId),
        name: selectedOT.OTName,
        status: Number(selectedOT.IsActive) === 1 ? "available" : "maintenance",
      },
    ];
  }, [otNameList, selectedOtId]);

  // =========================================================
  // TIME SLOTS
  //
  // Used ONLY in Day View
  // =========================================================

  const timeSlots = useMemo(() => {
    const slots: string[] = [];

    const startMinutes = 0;
    const endMinutes = 24 * 60;

    for (let minutes = startMinutes; minutes < endMinutes; minutes += slotInterval) {
      const hour = Math.floor(minutes / 60);

      const minute = minutes % 60;

      slots.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
    }

    return slots;
  }, [slotInterval]);

  // =========================================================
  // WEEK DATES
  //
  // Selected date = first date
  // Total = 7 dates
  // =========================================================

  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => addDays(selectedDate, index));
  }, [selectedDate]);

  // =========================================================
  // DEMO EVENTS
  //
  // Replace this with your actual API data.
  // =========================================================

  const events = useMemo<SchedulerEvent[]>(
    () => [
      // =====================================================
      // DAY 1
      // =====================================================

      {
        id: 1,
        resourceId: resources[0]?.id ?? 1,
        bookingDate: selectedDate,
        patientName: "Rahul Kumar",
        uhid: "UHID001245",
        procedureName: "Knee Replacement",
        doctorName: "Dr. Sharma",
        startTime: "08:00",
        endTime: "09:30",
        status: "scheduled",
      },

      {
        id: 2,
        resourceId: resources[1]?.id ?? 2,
        bookingDate: selectedDate,
        patientName: "Amit Singh",
        uhid: "UHID001246",
        procedureName: "Appendectomy",
        doctorName: "Dr. Verma",
        startTime: "08:30",
        endTime: "10:00",
        status: "in-progress",
      },

      {
        id: 3,
        resourceId: resources[2]?.id ?? 3,
        bookingDate: selectedDate,
        patientName: "Priya Sharma",
        uhid: "UHID001247",
        procedureName: "Gallbladder Surgery",
        doctorName: "Dr. Gupta",
        startTime: "09:00",
        endTime: "11:00",
        status: "scheduled",
      },

      // =====================================================
      // DAY 2
      // =====================================================

      {
        id: 4,
        resourceId: resources[0]?.id ?? 1,
        bookingDate: addDays(selectedDate, 1),
        patientName: "Neha Verma",
        uhid: "UHID001248",
        procedureName: "ACL Reconstruction",
        doctorName: "Dr. Sharma",
        startTime: "10:00",
        endTime: "11:30",
        status: "completed",
      },

      // =====================================================
      // DAY 3
      // =====================================================

      {
        id: 5,
        resourceId: resources[1]?.id ?? 2,
        bookingDate: addDays(selectedDate, 2),
        patientName: "Rohit Singh",
        uhid: "UHID001249",
        procedureName: "Hernia Surgery",
        doctorName: "Dr. Mehta",
        startTime: "11:00",
        endTime: "12:30",
        status: "scheduled",
      },

      // =====================================================
      // DAY 4
      // =====================================================

      {
        id: 6,
        resourceId: resources[2]?.id ?? 3,
        bookingDate: addDays(selectedDate, 3),
        patientName: "Pooja Gupta",
        uhid: "UHID001250",
        procedureName: "Spinal Surgery",
        doctorName: "Dr. Kapoor",
        startTime: "12:00",
        endTime: "14:00",
        status: "scheduled",
      },

      // =====================================================
      // DAY 5
      // =====================================================

      {
        id: 7,
        resourceId: resources[0]?.id ?? 1,
        bookingDate: addDays(selectedDate, 4),
        patientName: "Ankit Sharma",
        uhid: "UHID001251",
        procedureName: "Hip Replacement",
        doctorName: "Dr. Singh",
        startTime: "09:00",
        endTime: "11:00",
        status: "scheduled",
      },

      // =====================================================
      // DAY 6
      // =====================================================

      {
        id: 8,
        resourceId: resources[1]?.id ?? 2,
        bookingDate: addDays(selectedDate, 5),
        patientName: "Sneha Gupta",
        uhid: "UHID001252",
        procedureName: "Cataract Surgery",
        doctorName: "Dr. Kumar",
        startTime: "10:00",
        endTime: "11:00",
        status: "completed",
      },

      // =====================================================
      // DAY 7
      // =====================================================

      {
        id: 9,
        resourceId: resources[2]?.id ?? 3,
        bookingDate: addDays(selectedDate, 6),
        patientName: "Vikas Verma",
        uhid: "UHID001253",
        procedureName: "Kidney Surgery",
        doctorName: "Dr. Patel",
        startTime: "14:00",
        endTime: "16:00",
        status: "scheduled",
      },
    ],
    [resources, selectedDate]
  );

  // =========================================================
  // TIME -> MINUTES
  // =========================================================

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);

    return hours * 60 + minutes;
  };

  // =========================================================
  // FORMAT TIME
  // =========================================================

  const formatTime = (time: string) => {
    const minutes = timeToMinutes(time);

    const hours = Math.floor(minutes / 60);

    const mins = minutes % 60;

    const period = hours >= 12 ? "PM" : "AM";

    const displayHour = hours % 12 === 0 ? 12 : hours % 12;

    return `${displayHour}:${String(mins).padStart(2, "0")} ${period}`;
  };

  // =========================================================
  // GET STARTING EVENT
  // =========================================================

  const getStartingEvent = (resourceId: number, time: string) => {
    const slotStart = timeToMinutes(time);

    const slotEnd = slotStart + slotInterval;

    return events.find(event => {
      if (event.resourceId !== resourceId) {
        return false;
      }

      if (event.bookingDate !== selectedDate) {
        return false;
      }

      const eventStart = timeToMinutes(event.startTime);

      return eventStart >= slotStart && eventStart < slotEnd;
    });
  };

  // =========================================================
  // GET ACTIVE EVENT
  // =========================================================

  const getActiveEvent = (resourceId: number, time: string) => {
    const slotStart = timeToMinutes(time);

    const slotEnd = slotStart + slotInterval;

    return events.find(event => {
      if (event.resourceId !== resourceId) {
        return false;
      }

      if (event.bookingDate !== selectedDate) {
        return false;
      }

      const eventStart = timeToMinutes(event.startTime);

      const eventEnd = timeToMinutes(event.endTime);

      return eventStart < slotStart && eventEnd > slotStart && eventEnd > slotEnd;
    });
  };

  // =========================================================
  // ROW SPAN
  // =========================================================

  const getRowSpan = (event: SchedulerEvent) => {
    const start = timeToMinutes(event.startTime);

    const end = timeToMinutes(event.endTime);

    const duration = end - start;

    return Math.max(1, Math.ceil(duration / slotInterval));
  };

  // =========================================================
  // STATUS STYLE
  // =========================================================

  const getStatusStyle = (status: SchedulerStatus) => {
    switch (status) {
      case "in-progress":
        return {
          container: "border-l-4 border-amber-500 bg-amber-50",
          dot: "bg-amber-500",
          text: "text-amber-700",
        };

      case "completed":
        return {
          container: "border-l-4 border-emerald-500 bg-emerald-50",
          dot: "bg-emerald-500",
          text: "text-emerald-700",
        };

      default:
        return {
          container: "border-l-4 border-blue-500 bg-blue-50",
          dot: "bg-blue-500",
          text: "text-blue-700",
        };
    }
  };

  // booking ca

  const renderEventCard = (event: SchedulerEvent) => {
    const statusStyle = getStatusStyle(event.status);

    return (
      <div
        onClick={() => setSelectedEvent(event)}
        className={`cursor-pointer rounded-md p-3 shadow-sm transition-all duration-150 hover:-translate-y-[1px] hover:shadow-md ${statusStyle.container}`}
      >
        {/* PATIENT */}

        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">{event.patientName}</p>

            <p className="mt-0.5 text-[10px] text-slate-500">{event.uhid}</p>
          </div>

          <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${statusStyle.dot}`} />
        </div>

        {/* PROCEDURE */}

        <div className="mt-3">
          <p className="text-xs font-medium text-slate-700">{event.procedureName}</p>
        </div>

        {/* TIME + DOCTOR */}

        <div className="mt-3 border-t border-slate-300/60 pt-2">
          <p className="text-[10px] font-medium text-slate-500">
            {formatTime(event.startTime)} - {formatTime(event.endTime)}
          </p>

          <p className="mt-1 text-[10px] text-slate-500">{event.doctorName}</p>
        </div>

        {/* STATUS */}

        <div className="mt-3">
          <span className={`text-[9px] font-bold uppercase tracking-wide ${statusStyle.text}`}>
            {event.status.replace("-", " ")}
          </span>
        </div>
      </div>
    );
  };

  // day wise

  const renderDayView = () => {
    return (
      <div className="w-full overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="max-h-[650px] w-full overflow-auto">
          <table
            className="w-full table-fixed border-collapse"
            style={{
              minWidth: `max(100%, ${100 + resources.length * 250}px)`,
            }}
          >
            {/* HEADER */}

            <thead>
              <tr>
                <th className=" left-0 top-0 z-40 w-[100px] min-w-[100px] border-b border-r border-slate-300 bg-slate-100 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Time
                </th>

                {resources.map(resource => (
                  <th
                    key={resource.id}
                    className=" top-0 z-30 w-full border-b border-r border-slate-300 bg-slate-100 px-4 py-3 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{resource.name}</p>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* BODY */}

            <tbody>
              {timeSlots.map((time, rowIndex) => (
                <tr key={time}>
                  {/* TIME */}

                  <td className=" left-0 z-20 h-[60px] w-[100px] min-w-[100px] border-b border-r border-slate-200 bg-white px-2 text-center align-top">
                    <span className="relative top-2 text-xs font-semibold text-slate-500">
                      {formatTime(time)}
                    </span>
                  </td>

                  {/* OT CELLS */}

                  {resources.map(resource => {
                    const event = getStartingEvent(resource.id, time);

                    const activeEvent = getActiveEvent(resource.id, time);

                    /*
                     * Event already spanning
                     * this row.
                     */
                    if (activeEvent) {
                      return null;
                    }

                    /*
                     * Empty cell
                     */
                    if (!event) {
                      return (
                        <td
                          key={`${resource.id}-${time}`}
                          className={`h-[60px] w-full border-b border-r border-slate-200 ${
                            rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                          }`}
                        >
                          <div className="h-full border-t border-dashed border-slate-100" />
                        </td>
                      );
                    }

                    /*
                     * Booking
                     */
                    return (
                      <td
                        key={`${resource.id}-${time}`}
                        rowSpan={getRowSpan(event)}
                        className="w-full border-b border-r border-slate-200 bg-white p-1 align-top"
                      >
                        {renderEventCard(event)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const getEventsForDateAndResource = (date: string, resourceId: number) => {
    return events
      .filter(event => event.bookingDate === date && event.resourceId === resourceId)
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  };

  // week wise
  const renderWeekView = () => {
    return (
      <div className="w-full overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="max-h-[700px] w-full overflow-auto">
          <table className="w-full min-w-[1400px] table-fixed border-collapse">
            {/* week header */}

            <thead>
              <tr>
                {/* RESOURCE HEADER */}

                <th className=" left-0 top-0 z-50 w-[120px] min-w-[120px] border-b border-r border-slate-300 bg-slate-100 px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  OT Name
                </th>

                {/* DATES HORIZONTALLY */}

                {weekDates.map(date => (
                  <th
                    key={date}
                    className=" top-0 z-40 min-w-[250px] border-b border-r border-slate-300 bg-slate-100 px-4 py-4 text-center"
                  >
                    <p className="text-sm font-semibold text-slate-800">{formatWeekDate(date)}</p>

                    <p className="mt-1 text-[10px] font-normal text-slate-500">{date}</p>
                  </th>
                ))}
              </tr>
            </thead>

            {/* week body */}
            <tbody>
              {resources.map((resource, resourceIndex) => (
                <tr key={resource.id} className="align-top">
                  <td
                    className={` left-0 z-30 w-[200px] min-w-[200px] border-b border-r border-slate-200 px-4 py-4 align-top ${
                      resourceIndex % 2 === 0 ? "bg-white" : "bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{resource.name}</p>
                      </div>
                    </div>
                  </td>

                  {/* date cells */}
                  {weekDates.map(date => {
                    const dateEvents = getEventsForDateAndResource(date, resource.id);

                    return (
                      <td
                        key={`${resource.id}-${date}`}
                        className="min-w-[250px] border-b border-r border-slate-200 bg-white p-2 align-top"
                      >
                        {dateEvents.length === 0 ? (
                          <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/40">
                            <span className="text-xs text-slate-400">No booking</span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {dateEvents.map(event => (
                              <div key={event.id}>{renderEventCard(event)}</div>
                            ))}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // form handler

  const handleOtChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOtId(Number(e.target.value));
  };

  const handleSlotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSlotInterval(Number(e.target.value) as SlotInterval);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("Selected Date:", selectedDate);

    console.log("Selected OT:", selectedOtId);

    console.log("Selected Slot:", slotInterval);

    console.log("View:", viewMode);
  };

  const handleCancel = () => {
    setSelectedOtId(0);

    setSelectedDate("2026-10-03");

    setSlotInterval(30);

    setViewMode("day");

    setSelectedEvent(null);
  };

  return (
    <div className="page-container">
      <h1 className="page-heading">OT Schedular</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>

        <span>››</span>

        <span>OT Schedular</span>
      </nav>

      <div className="card">
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="form-grid-4">
            {/* BRANCH */}

            <InputField label="Branch" required>
              <input type="text" className="input-field w-full" placeholder="Enter branch" />
            </InputField>

            {/* DATE */}

            <InputField label={viewMode === "week" ? "Start Date" : "Date"} required>
              <input
                type="date"
                className="input-field w-full"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
            </InputField>

            {/* OT */}

            <InputField label="OT Name" required>
              <select className="input-field w-full" value={selectedOtId} onChange={handleOtChange}>
                <option value={0}>All OTs</option>

                {otNameList.map(ot => (
                  <option key={ot.OTId} value={ot.OTId}>
                    {ot.OTName}
                  </option>
                ))}
              </select>
            </InputField>

            {/* TIME SLOT */}

            <InputField label="Time Slot" required>
              <select
                className="input-field w-full"
                value={slotInterval}
                onChange={handleSlotChange}
              >
                <option value={30}>30 Minutes</option>

                <option value={60}>1 Hour</option>

                <option value={90}>1 Hour 30 Minutes</option>

                <option value={120}>2 Hours</option>
              </select>
            </InputField>
          </div>

          {/* VIEW + BUTTONS */}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            {/* VIEW */}

            <div className="flex items-center gap-5">
              <span className="text-sm font-medium text-slate-700">View:</span>

              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="viewMode"
                  value="day"
                  checked={viewMode === "day"}
                  onChange={() => setViewMode("day")}
                />

                <span>Day</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="viewMode"
                  value="week"
                  checked={viewMode === "week"}
                  onChange={() => setViewMode("week")}
                />

                <span>Week</span>
              </label>
            </div>

            {/* BUTTONS */}

            <div className="form-actions-responsive !mt-0">
              <button type="submit" className="save-btn">
                Search
              </button>

              <button type="button" className="cancel-button" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </div>
        </form>

        {/* ===================================================
            DAY / WEEK TABLE
        ==================================================== */}

        {viewMode === "day" ? renderDayView() : renderWeekView()}

        {/* ===================================================
            FOOTER
        ==================================================== */}
      </div>

      {/* =====================================================
          EVENT DETAILS MODAL
      ====================================================== */}

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl">
            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-slate-800">OT Booking Details</h2>

                <p className="mt-0.5 text-xs text-slate-500">{selectedEvent.uhid}</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {/* BODY */}

            <div className="space-y-4 px-5 py-5">
              {/* PATIENT */}

              <div>
                <p className="text-xs text-slate-500">Patient</p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedEvent.patientName}
                </p>
              </div>

              {/* UHID */}

              <div>
                <p className="text-xs text-slate-500">UHID</p>

                <p className="mt-1 text-sm text-slate-800">{selectedEvent.uhid}</p>
              </div>

              {/* PROCEDURE */}

              <div>
                <p className="text-xs text-slate-500">Procedure</p>

                <p className="mt-1 text-sm font-medium text-slate-800">
                  {selectedEvent.procedureName}
                </p>
              </div>

              {/* DATE */}

              <div>
                <p className="text-xs text-slate-500">Booking Date</p>

                <p className="mt-1 text-sm text-slate-800">
                  {formatFullDate(selectedEvent.bookingDate)}
                </p>
              </div>

              {/* DOCTOR + TIME */}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Doctor</p>

                  <p className="mt-1 text-sm text-slate-800">{selectedEvent.doctorName}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Time</p>

                  <p className="mt-1 text-sm text-slate-800">
                    {formatTime(selectedEvent.startTime)} - {formatTime(selectedEvent.endTime)}
                  </p>
                </div>
              </div>

              {/* STATUS */}

              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Status</p>

                <p
                  className={`mt-1 text-sm font-semibold capitalize ${
                    getStatusStyle(selectedEvent.status).text
                  }`}
                >
                  {selectedEvent.status.replace("-", " ")}
                </p>
              </div>
            </div>

            {/* FOOTER */}

            <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-3">
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
