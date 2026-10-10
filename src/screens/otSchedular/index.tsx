import CustomDateInput from "@/components/customDateInput";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import type {
  OtMasterItem,
  OtSchedularItem,
  ResourceItem,
  SchedulerEvent,
  SlotInterval,
  ViewMode,
} from "./types";

const getCurrentDate = (): string => {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/**
 * Converts:
 * 09:30:00 -> 09:30
 * 09:30 -> 09:30
 * 09:30 AM -> 09:30
 * 02:30 PM -> 14:30
 */
const normalizeTime = (value?: string | null): string => {
  if (!value) {
    return "";
  }

  const input = value.trim();

  if (!input) {
    return "";
  }

  const match = input.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);

  if (!match) {
    return input.substring(0, 5);
  }

  let hours = Number(match[1]);

  const minutes = match[2];

  const period = match[3]?.toUpperCase();

  if (period === "PM" && hours < 12) {
    hours += 12;
  }

  if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return `${String(hours).padStart(2, "0")}:${minutes}`;
};

const timeToMinutes = (time: string): number => {
  if (!time) {
    return 0;
  }

  const [hours, minutes] = time.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return 0;
  }

  return hours * 60 + minutes;
};

const formatTime = (time: string): string => {
  const minutes = timeToMinutes(time);

  const hours24 = Math.floor(minutes / 60);

  const mins = minutes % 60;

  const period = hours24 >= 12 ? "PM" : "AM";

  const displayHour = hours24 % 12 === 0 ? 12 : hours24 % 12;

  return `${displayHour}:${String(mins).padStart(2, "0")} ${period}`;
};

const parseDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(year, month - 1, day);
};

const formatDate = (date: Date): string => {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const addDays = (dateString: string, days: number): string => {
  const date = parseDate(dateString);

  date.setDate(date.getDate() + days);

  return formatDate(date);
};

const formatWeekDate = (dateString: string): string => {
  return parseDate(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
};

export default function OtSchedular() {
  const { loading, fetchApi } = useGlobalApi();

  const navigate = useNavigate();

  const [otScheduledList, setOtScheduledList] = useState<OtSchedularItem[]>([]);

  const [otNameList, setOtNameList] = useState<OtMasterItem[]>([]);

  const [selectedOtId, setSelectedOtId] = useState<number>(0);

  const [selectedDate, setSelectedDate] = useState<string>(getCurrentDate());

  const [viewMode, setViewMode] = useState<ViewMode>("day");

  const [slotInterval, setSlotInterval] = useState<SlotInterval>(30);

  // booked scheduled
  const getOtBookingSchedular = async (fromDate: string, toDate: string) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_OT_BOOKING_DETAILS,
      {},
      {
        params: {
          fromDate,
          toDate,
        },
      },
      {
        component: "OtSchedular",
      }
    );

    setOtScheduledList(resp?.data ?? []);
  };

  useEffect(() => {
    getOtBookingSchedular(selectedDate, selectedDate);
  }, [selectedDate]);

  // ot master list
  const getOtMasterList = async () => {
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
  };

  useEffect(() => {
    getOtMasterList();
  }, []);

  // fetch booking when date changes
  useEffect(() => {
    const toDate = viewMode === "week" ? addDays(selectedDate, 6) : selectedDate;

    void getOtBookingSchedular(selectedDate, toDate);
  }, [selectedDate, viewMode]);

  // resources
  const resources = useMemo<ResourceItem[]>(() => {
    if (selectedOtId === 0) {
      return otNameList.map(ot => ({
        id: Number(ot.OTId),
        name: ot.OTName,
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
      },
    ];
  }, [otNameList, selectedOtId]);

  // events booking
  const events = useMemo<SchedulerEvent[]>(() => {
    return otScheduledList.map((item: OtSchedularItem): SchedulerEvent => {
      const bookingDate = item.OTBookingDate?.split("T")[0] || "";

      const startTime = normalizeTime(item.OTBookingFromTime);

      const endTime = normalizeTime(item.OTBookingToTime);

      return {
        id: Number(item.OTBookingId),

        resourceId: Number(item.OTId),

        bookingDate,

        bookingNo: item.OTBookingNo || "",

        patientName: item?.PatientName || "",

        visitId: item.VisitId,

        uhid: item.UHID || "",

        ipdNo: item.IPDNo || "",

        otType: item.OTType || "",

        diagnosisName: item.DiagnosisName || "",

        startTime,

        endTime,
      };
    });
  }, [otScheduledList]);

  // time slot
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

  /* =======================================================
     WEEK DAYS
  ======================================================= */

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => addDays(selectedDate, index));
  }, [selectedDate]);

  /* =======================================================
     EVENT LOOKUP
  ======================================================= */

  const getStartingEvent = (resourceId: number, time: string): SchedulerEvent | undefined => {
    const slotStart = timeToMinutes(time);
    const slotEnd = slotStart + slotInterval;

    return events.find(event => {
      const isSameResource = Number(event.resourceId) === Number(resourceId);
      const isSameDate = String(event.bookingDate).trim() === String(selectedDate).trim();
      const eventStart = timeToMinutes(event.startTime);
      const isWithinSlot = eventStart >= slotStart && eventStart < slotEnd;

      return isSameResource && isSameDate && isWithinSlot;
    });
  };

  const getActiveEvent = (resourceId: number, time: string): SchedulerEvent | undefined => {
    const slotStart = timeToMinutes(time);

    return events.find(event => {
      if (Number(event.resourceId) !== Number(resourceId)) return false;
      if (String(event.bookingDate).trim() !== String(selectedDate).trim()) return false;

      const eventStart = timeToMinutes(event.startTime);
      const eventEnd = timeToMinutes(event.endTime);

      return eventStart < slotStart && eventEnd > slotStart;
    });
  };

  /* =======================================================
     ROW SPAN
  ======================================================= */

  const getRowSpan = (event: SchedulerEvent): number => {
    const start = timeToMinutes(event.startTime);

    const end = timeToMinutes(event.endTime);

    const duration = end - start;

    return Math.max(1, Math.ceil(duration / slotInterval));
  };

  // booking click (single)
  const handleEventClick = (event: SchedulerEvent) => {
    const resource = resources.find(item => item.id === event.resourceId);

    navigate("/ot-booking", {
      state: {
        event,
        resource,
      },
    });
  };

  // booking double click
  const handleEventDoubleClick = (event: SchedulerEvent) => {
    const resource = resources.find(item => item.id === event.resourceId);

    navigate("/ipd-billing", {
      state: {
        event,
        resource,
      },
    });
  };

  //  empty cell click
  const handleEmptyDayCellClick = (resource: ResourceItem, startTime: string) => {
    const startMinutes = timeToMinutes(startTime);

    const endMinutes = Math.min(startMinutes + slotInterval, 24 * 60);

    const endHour = Math.floor(endMinutes / 60);

    const endMinute = endMinutes % 60;

    const endTime = `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;

    navigate("/ot-booking", {
      state: {
        mode: "create",
        bookingDate: selectedDate,
        resourceId: resource.id,
        resourceName: resource.name,
        startTime,
        endTime,
        slotInterval,
      },
    });
  };

  /* =======================================================
     EVENT CARD
  ======================================================= */

  const renderEventCard = (event: SchedulerEvent, index: number = 0) => {
    console.log(`event ${event?.id}`, event);

    const isClickable = Number(event.visitId) > 0;

    return (
      <div
        onDoubleClick={
          isClickable
            ? e => {
                e.stopPropagation();
                handleEventDoubleClick(event);
              }
            : undefined
        }
        className={`group m-2 rounded-lg border p-3 shadow-sm transition-all duration-200 ${
          isClickable
            ? "cursor-pointer border-slate-200 bg-white hover:-translate-y-[1px] hover:border-slate-300 hover:shadow-md"
            : "cursor-not-allowed border-slate-300 bg-slate-100"
        }`}
        title={`Booking ${event.bookingNo || event.id}`}
      >
        {/* HEADER */}
        <div className="flex items-start gap-2.5">
          {/* LEFT ACCENT */}
          <div className="mt-0.5 h-12 w-1 shrink-0 rounded-full bg-blue-500" />

          <div className="min-w-0 flex-1">
            {/* BOOKING NUMBER */}
            <p className="truncate text-sm font-semibold leading-5 text-slate-800">
              {event.bookingNo || `Booking #${event.id}`}
            </p>

            {/* PATIENT NAME */}
            <p className="mt-1 truncate text-xs font-semibold text-slate-700">
              {event.patientName || "Patient Name Not Available"}
            </p>

            {/* UHID */}
            <p className="mt-1 text-[9px] font-semibold uppercase tracking-wide text-slate-400">
              UHID
            </p>

            <p className="truncate text-xs font-medium text-slate-600">{event.uhid || "-"}</p>
          </div>
        </div>

        {/* PATIENT / IPD DETAILS 
        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
              IPD No
            </p>

            <p className="mt-1 truncate text-xs font-medium text-slate-700">{event.ipdNo || "-"}</p>
          </div>

          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
              OT Type
            </p>

            <p className="mt-1 truncate text-xs font-semibold text-slate-700">
              {event.otType || "-"}
            </p>
          </div>
        </div>
        */}

        {/* DIAGNOSIS */}
        {event.diagnosisName && (
          <div className="mt-3 rounded-md bg-slate-50 px-2.5 py-2">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
              Diagnosis
            </p>

            <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-600">
              {event.diagnosisName}
            </p>
          </div>
        )}

        {/* FOOTER / TIME */}
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
              Scheduled Time
            </p>

            <p className="mt-1 text-[11px] font-semibold text-slate-700">
              {formatTime(event.startTime)}
              <span className="mx-1 text-slate-400">–</span>
              {formatTime(event.endTime)}
            </p>
          </div>

          {/* STATUS */}
          <span
            className="
            rounded-full
            bg-emerald-50
            px-2
            py-1
            text-[9px]
            font-semibold
            uppercase
            tracking-wide
            text-emerald-600
          "
          >
            Scheduled
          </span>
        </div>
      </div>
    );
  };

  /* =======================================================
     WEEK EVENT CARD
  ======================================================= */

  const renderWeekEventCard = (event: SchedulerEvent) => {
    const isClickable = Number(event.visitId) > 0;

    return (
      <div
        className={`group rounded-md border p-2 shadow-sm transition-all duration-200 ${
          isClickable
            ? "cursor-pointer border-slate-200 bg-white hover:-translate-y-[1px] hover:border-slate-300 hover:shadow-md"
            : "cursor-not-allowed border-slate-300 bg-slate-100"
        }`}
        title={`Booking ${event.bookingNo || event.id}`}
      >
        <div className="flex items-start gap-2">
          <div className="mt-0.5 h-6 w-1 shrink-0 rounded-full bg-blue-500" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-800">
              {event.bookingNo || `Booking #${event.id}`}
            </p>
            <p className="truncate text-[10px] font-medium text-slate-600">
              {event.patientName || "Patient Name Not Available"}
            </p>
          </div>
        </div>
      </div>
    );
  };

  /* =======================================================
     DAY VIEW
  ======================================================= */

  const renderDayView = () => {
    return (
      <div className="w-full overflow-auto rounded-lg border border-slate-200 bg-white">
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
                <th className="left-0 w-[100px] min-w-[100px] border-b border-r border-slate-300 bg-slate-100 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Time
                </th>

                {resources.map(resource => (
                  <th
                    key={resource.id}
                    className="w-[250px] min-w-[250px] border-b border-r border-slate-300 bg-slate-100 px-4 py-3 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{resource?.name}</p>
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

                  <td className="sticky left-0 z-20 h-[60px] w-[100px] min-w-[100px] border-b border-r border-slate-200 bg-white px-2 text-center align-top">
                    <span className="relative top-2 text-xs font-semibold text-slate-500">
                      {formatTime(time)}
                    </span>
                  </td>

                  {/* OT CELLS */}

                  {resources.map(resource => {
                    const event = getStartingEvent(resource.id, time);

                    console.log("event", event);

                    const activeEvent = getActiveEvent(resource.id, time);

                    /*
                     * Existing booking
                     * is spanning this
                     * row.
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
                          onDoubleClick={() => handleEmptyDayCellClick(resource, time)}
                          className={` h-[60px] w-full cursor-pointer border-b border-r border-slate-200 transition-colors hover:bg-blue-50 ${rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}
                          title={`Create booking: ${resource.name} - ${formatTime(time)}`}
                        >
                          <div className="h-full border-t border-dashed border-slate-100" />
                        </td>
                      );
                    }

                    /*
                     * BOOKED OT
                     */

                    return (
                      <td
                        key={`${resource.id}-${time}`}
                        rowSpan={getRowSpan(event)}
                        className="w-full border-b border-r border-slate-200 bg-white align-top"
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

  /* =======================================================
     WEEK EVENTS
  ======================================================= */

  const getEventsForDateAndResource = (date: string, resourceId: number): SchedulerEvent[] => {
    return events
      .filter(event => event.bookingDate === date && event.resourceId === resourceId)
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  };

  /* =======================================================
     WEEK VIEW
  ======================================================= */

  const renderWeekView = () => {
    return (
      <div className="w-full overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="max-h-[700px] w-full overflow-auto">
          <table className="w-full min-w-[1400px] table-fixed border-collapse">
            {/* HEADER */}

            <thead>
              <tr>
                <th
                  className="
                    sticky
                    left-0
                    top-0
                    z-50
                    w-[200px]
                    min-w-[200px]
                    border-b
                    border-r
                    border-slate-300
                    bg-slate-100
                    px-4
                    py-3
                    text-left
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-slate-600
                  "
                >
                  OT Name
                </th>

                {weekDays.map(date => (
                  <th
                    key={date}
                    className="
                        sticky
                        top-0
                        z-40
                        min-w-[250px]
                        border-b
                        border-r
                        border-slate-300
                        bg-slate-100
                        px-4
                        py-4
                        text-center
                      "
                  >
                    <p className="text-sm font-semibold text-slate-800">{formatWeekDate(date)}</p>

                    <p className="mt-1 text-[10px] font-normal text-slate-500">{date}</p>
                  </th>
                ))}
              </tr>
            </thead>

            {/* BODY */}

            <tbody>
              {resources.map((resource, resourceIndex) => (
                <tr key={resource.id} className="align-top">
                  {/* OT NAME */}

                  <td
                    className={`
                        sticky
                        left-0
                        z-30
                        w-[200px]
                        min-w-[200px]
                        border-b-2
                        border-r
                        border-slate-400
                        px-4
                        py-4
                        align-top
                        ${resourceIndex % 2 === 0 ? "bg-white" : "bg-slate-50"}
                      `}
                  >
                    <p className="text-sm font-semibold text-slate-800">{resource.name}</p>

                    {/* <p className="mt-1 text-[10px] text-slate-500">
                      {resource.status === "available" ? "Available" : "Maintenance"}
                    </p> */}
                  </td>

                  {/* DATES */}

                  {weekDays.map(date => {
                    const dateEvents = getEventsForDateAndResource(date, resource.id);

                    return (
                      <td
                        key={`${resource.id}-${date}`}
                        className="
                              min-w-[250px]
                              border-b-2
                              border-r
                              border-slate-400
                              bg-white
                              p-2
                              align-top
                            "
                      >
                        {dateEvents.length === 0 ? (
                          <button
                            type="button"
                            onDoubleClick={() =>
                              navigate("/ot-booking", {
                                state: {
                                  mode: "create",
                                  bookingDate: date,
                                  resourceId: resource.id,
                                  resourceName: resource.name,
                                  startTime: "09:00",
                                  endTime: "09:30",
                                  slotInterval: 30,
                                },
                              })
                            }
                            className="
                                  flex
                                  min-h-[120px]
                                  w-full
                                  items-center
                                  justify-center
                                  rounded-lg
                                  border
                                  border-dashed
                                  border-slate-200
                                  bg-slate-50/40
                                  transition
                                  hover:bg-blue-50
                                "
                          >
                            <span className="text-xs text-slate-400">No booking</span>
                          </button>
                        ) : (
                          <div className="space-y-2">
                            {dateEvents.map(event => (
                              <div key={event.id}>{renderWeekEventCard(event)}</div>
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

  /* =======================================================
     FILTER HANDLERS
  ======================================================= */

  const handleOtChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOtId(Number(e.target.value));
  };

  const handleSlotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSlotInterval(Number(e.target.value) as SlotInterval);
  };

  /* =======================================================
     SEARCH
  ======================================================= */

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const toDate = viewMode === "week" ? addDays(selectedDate, 6) : selectedDate;

    void getOtBookingSchedular(selectedDate, toDate);
  };

  /* =======================================================
     CANCEL / RESET
  ======================================================= */

  const handleCancel = () => {
    setSelectedOtId(0);

    setSelectedDate(getCurrentDate());

    setSlotInterval(30);

    setViewMode("day");
  };

  return (
    <div className="page-container">
      <h1 className="page-heading">OT Scheduler</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>OT Scheduler</span>
      </nav>

      <div className="card">
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="form-grid-4">
            <InputField label={viewMode === "week" ? "Start Date" : "Date"} required>
              <CustomDateInput
                value={selectedDate}
                onChange={(value: string) => setSelectedDate(value)}
              />
            </InputField>

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

            <div className="form-actions-responsive !mt-0">
              <button type="submit" className="save-btn">
                {/* {loading ? "Loading..." : "Search"} */}
                Search
              </button>

              <button type="button" className="cancel-button" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </div>
        </form>

        {/* SCHEDULER */}

        {resources.length === 0 ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50">
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-600">No OT resources found</p>

              <p className="mt-1 text-xs text-slate-400">Please select a valid OT.</p>
            </div>
          </div>
        ) : viewMode === "day" ? (
          renderDayView()
        ) : (
          renderWeekView()
        )}
      </div>

      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
}
