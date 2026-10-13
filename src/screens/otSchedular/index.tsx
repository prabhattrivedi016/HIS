import CentralPopup from "@/components/centralPopup";
import CustomDateInput from "@/components/customDateInput";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import type {
  BreakItem,
  OtMasterItem,
  OtSchedularItem,
  ResourceItem,
  SchedulerEvent,
  SelectedSlot,
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

  // breaks state with localStorage persistence
  const [breaks, setBreaks] = useState<BreakItem[]>(() => {
    try {
      const saved = localStorage.getItem("ot_scheduler_breaks");
      return saved ? (JSON.parse(saved) as BreakItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("ot_scheduler_breaks", JSON.stringify(breaks));
    } catch (e) {
      console.error("Failed to save breaks", e);
    }
  }, [breaks]);

  // selected slots for multi-selection
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);

  // empty slot context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    resource: ResourceItem;
    date: string;
    time: string;
  } | null>(null);

  const contextMenuRef = useRef<HTMLDivElement>(null);

  // booked OT card context menu state
  const [bookedOtContextMenu, setBookedOtContextMenu] = useState<{
    x: number;
    y: number;
    event: SchedulerEvent;
    resource?: ResourceItem;
  } | null>(null);

  const bookedOtContextMenuRef = useRef<HTMLDivElement>(null);

  // cancel OT confirmation modal state
  const [cancelModalEvent, setCancelModalEvent] = useState<SchedulerEvent | null>(null);
  const [cancelReason, setCancelReason] = useState<string>("");

  // validation toast state
  const [validationToast, setValidationToast] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showValidationToast = (msg: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setValidationToast(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setValidationToast(null);
    }, 3500);
  };

  // clear selection & close context menus on filter change
  useEffect(() => {
    setSelectedSlots([]);
    setContextMenu(null);
    setBookedOtContextMenu(null);
  }, [selectedDate, slotInterval, selectedOtId, viewMode]);

  // close context menus on Escape key or outside click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (contextMenu) {
          setContextMenu(null);
        }
        if (bookedOtContextMenu) {
          setBookedOtContextMenu(null);
        }
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
      if (
        bookedOtContextMenuRef.current &&
        !bookedOtContextMenuRef.current.contains(e.target as Node)
      ) {
        setBookedOtContextMenu(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    if (contextMenu || bookedOtContextMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [contextMenu, bookedOtContextMenu]);

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

  /* =======================================================
     BREAK LOOKUP & ROW SPAN
  ======================================================= */

  const getStartingBreak = (
    resourceId: number,
    time: string,
    date: string
  ): BreakItem | undefined => {
    const slotStart = timeToMinutes(time);
    const slotEnd = slotStart + slotInterval;

    return breaks.find(b => {
      if (Number(b.resourceId) !== Number(resourceId)) return false;
      if (String(b.bookingDate).trim() !== String(date).trim()) return false;
      const bStart = timeToMinutes(b.startTime);
      return bStart >= slotStart && bStart < slotEnd;
    });
  };

  const getActiveBreak = (
    resourceId: number,
    time: string,
    date: string
  ): BreakItem | undefined => {
    const slotStart = timeToMinutes(time);

    return breaks.find(b => {
      if (Number(b.resourceId) !== Number(resourceId)) return false;
      if (String(b.bookingDate).trim() !== String(date).trim()) return false;
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);
      return bStart < slotStart && bEnd > slotStart;
    });
  };

  const getBreakRowSpan = (breakItem: BreakItem): number => {
    const start = timeToMinutes(breakItem.startTime);
    const end = timeToMinutes(breakItem.endTime);
    const duration = Math.max(0, end - start);
    return Math.max(1, Math.ceil(duration / slotInterval));
  };

  const getBreaksForDateAndResource = (date: string, resourceId: number): BreakItem[] => {
    return breaks
      .filter(
        b =>
          String(b.bookingDate).trim() === String(date).trim() &&
          Number(b.resourceId) === Number(resourceId)
      )
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  };

  /* =======================================================
     SLOT OCCUPATION & TIME RANGE CALCULATION
  ======================================================= */

  const isSlotOccupied = (resourceId: number, date: string, time: string): boolean => {
    const slotStart = timeToMinutes(time);
    const slotEnd = slotStart + slotInterval;

    // Check booked events
    const hasEvent = events.some(event => {
      if (Number(event.resourceId) !== Number(resourceId)) return false;
      if (String(event.bookingDate).trim() !== String(date).trim()) return false;
      const eventStart = timeToMinutes(event.startTime);
      const eventEnd = timeToMinutes(event.endTime);
      return Math.max(slotStart, eventStart) < Math.min(slotEnd, eventEnd);
    });
    if (hasEvent) return true;

    // Check breaks
    const hasBreak = breaks.some(b => {
      if (Number(b.resourceId) !== Number(resourceId)) return false;
      if (String(b.bookingDate).trim() !== String(date).trim()) return false;
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);
      return Math.max(slotStart, bStart) < Math.min(slotEnd, bEnd);
    });
    if (hasBreak) return true;

    return false;
  };

  const calculatedRange = useMemo(() => {
    if (selectedSlots.length === 0) return null;
    const sorted = [...selectedSlots].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
    const startTime = sorted[0].time;
    const lastSlotMinutes = timeToMinutes(sorted[sorted.length - 1].time);
    const endMinutes = Math.min(lastSlotMinutes + slotInterval, 24 * 60);
    const endHour = Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;
    const endTime = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;
    const durationMinutes = endMinutes - timeToMinutes(startTime);

    return {
      startTime,
      endTime,
      durationMinutes,
      resourceId: sorted[0].resourceId,
      resourceName: sorted[0].resourceName,
      date: sorted[0].date,
      count: sorted.length,
    };
  }, [selectedSlots, slotInterval]);

  /* =======================================================
     SELECTION & CONTEXT MENU ACTIONS
  ======================================================= */

  const handleSlotClick = (
    e: React.MouseEvent,
    resource: ResourceItem,
    time: string,
    date: string
  ) => {
    if (isSlotOccupied(resource.id, date, time)) {
      showValidationToast("Cannot select a time slot that overlaps an existing booking or break.");
      return;
    }

    const isMultiSelect = e.ctrlKey || e.metaKey;

    if (!isMultiSelect) {
      setSelectedSlots([
        {
          resourceId: resource.id,
          resourceName: resource.name,
          date,
          time,
        },
      ]);
      return;
    }

    // Multi-selection with Ctrl (Win) or Cmd (Mac)
    if (selectedSlots.length === 0) {
      setSelectedSlots([
        {
          resourceId: resource.id,
          resourceName: resource.name,
          date,
          time,
        },
      ]);
      return;
    }

    const first = selectedSlots[0];

    // Check if selecting across different OTs
    if (first.resourceId !== resource.id) {
      showValidationToast("Cannot select slots across different OTs.");
      return;
    }

    // Check if selecting across different dates
    if (first.date !== date) {
      showValidationToast("Cannot select slots across different dates.");
      return;
    }

    const isAlreadySelected = selectedSlots.some(s => s.time === time);

    if (isAlreadySelected) {
      if (selectedSlots.length === 1) {
        setSelectedSlots([]);
        return;
      }

      const remaining = selectedSlots.filter(s => s.time !== time);
      const remainingMinutes = remaining.map(s => timeToMinutes(s.time)).sort((a, b) => a - b);

      // Check if removing creates gaps
      let hasGap = false;
      for (let i = 0; i < remainingMinutes.length - 1; i++) {
        if (remainingMinutes[i + 1] - remainingMinutes[i] !== slotInterval) {
          hasGap = true;
          break;
        }
      }

      if (hasGap) {
        showValidationToast(
          "Deselecting this slot creates a gap. Selections must remain contiguous."
        );
        return;
      }

      setSelectedSlots(remaining);
      return;
    }

    // Adding a new slot
    const targetMinutes = timeToMinutes(time);
    const allMinutes = [...selectedSlots.map(s => timeToMinutes(s.time)), targetMinutes].sort(
      (a, b) => a - b
    );

    // Check if addition creates gaps
    let hasGap = false;
    for (let i = 0; i < allMinutes.length - 1; i++) {
      if (allMinutes[i + 1] - allMinutes[i] !== slotInterval) {
        hasGap = true;
        break;
      }
    }

    if (hasGap) {
      showValidationToast(
        "Selections with gaps are not allowed. Please select consecutive time slots."
      );
      return;
    }

    // Ensure no occupied slot within the new contiguous span
    for (const m of allMinutes) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      const timeStr = `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
      if (isSlotOccupied(resource.id, date, timeStr)) {
        showValidationToast("Selection overlaps with an existing booking or break.");
        return;
      }
    }

    setSelectedSlots(prev => [
      ...prev,
      {
        resourceId: resource.id,
        resourceName: resource.name,
        date,
        time,
      },
    ]);
  };

  const handleSlotContextMenu = (
    e: React.MouseEvent,
    resource: ResourceItem,
    time: string,
    date: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSlotOccupied(resource.id, date, time)) {
      return;
    }

    const isAlreadyPart = selectedSlots.some(
      s => s.resourceId === resource.id && s.date === date && s.time === time
    );

    if (!isAlreadyPart) {
      setSelectedSlots([
        {
          resourceId: resource.id,
          resourceName: resource.name,
          date,
          time,
        },
      ]);
    }

    const menuWidth = 260;
    const menuHeight = 240;
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 12);
    const y = Math.min(e.clientY, window.innerHeight - menuHeight - 12);

    setContextMenu({
      x,
      y,
      resource,
      date,
      time,
    });
  };

  const handleBookOtFromSelection = () => {
    if (!calculatedRange) return;

    navigate("/ot-booking", {
      state: {
        mode: "create",
        bookingDate: calculatedRange.date,
        resourceId: calculatedRange.resourceId,
        resourceName: calculatedRange.resourceName,
        otId: calculatedRange.resourceId,
        otName: calculatedRange.resourceName,
        startTime: calculatedRange.startTime,
        endTime: calculatedRange.endTime,
        slotInterval,
      },
    });

    setContextMenu(null);
  };

  const handleTakeBreakFromSelection = () => {
    if (!calculatedRange) return;

    const newBreak: BreakItem = {
      id: `break-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      resourceId: calculatedRange.resourceId,
      resourceName: calculatedRange.resourceName,
      bookingDate: calculatedRange.date,
      startTime: calculatedRange.startTime,
      endTime: calculatedRange.endTime,
      title: "OT Break",
    };

    setBreaks(prev => [...prev, newBreak]);
    setSelectedSlots([]);
    setContextMenu(null);
  };

  const handleRemoveBreak = (breakId: string) => {
    setBreaks(prev => prev.filter(b => b.id !== breakId));
  };

  const handleClearSelection = () => {
    setSelectedSlots([]);
    setContextMenu(null);
  };

  /* =======================================================
     BOOKED OT CONTEXT MENU HANDLERS
  ======================================================= */

  const handleEventContextMenu = (e: React.MouseEvent, event: SchedulerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Close slot selection context menu if open
    setContextMenu(null);

    const resource = resources.find(r => r.id === event.resourceId);

    const menuWidth = 240;
    const menuHeight = 160;
    const x = Math.max(12, Math.min(e.clientX, window.innerWidth - menuWidth - 12));
    const y = Math.max(12, Math.min(e.clientY, window.innerHeight - menuHeight - 12));

    setBookedOtContextMenu({
      x,
      y,
      event,
      resource,
    });
  };

  const handleRescheduleOt = (event: SchedulerEvent) => {
    const resource = resources.find(item => item.id === event.resourceId);

    navigate("/ot-booking", {
      state: {
        mode: "reschedule",
        event,
        resource,
        bookingDate: event.bookingDate,
        startTime: event.startTime,
        endTime: event.endTime,
        resourceId: event.resourceId,
        resourceName: resource?.name,
        otId: event.resourceId,
        otName: resource?.name,
        otType: event.otType,
        patientName: event.patientName,
        bookingNo: event.bookingNo,
        uhid: event.uhid,
        visitId: event.visitId,
      },
    });

    setBookedOtContextMenu(null);
  };

  const handleInitiateCancel = (event: SchedulerEvent) => {
    setBookedOtContextMenu(null);
    setCancelModalEvent(event);
    setCancelReason("");
  };

  const handleConfirmCancel = () => {
    if (!cancelModalEvent) return;

    setOtScheduledList(prev =>
      prev.filter(item => Number(item.OTBookingId) !== cancelModalEvent.id)
    );

    showValidationToast(
      `OT Booking ${cancelModalEvent.bookingNo || `#${cancelModalEvent.id}`} has been cancelled.`
    );
    setCancelModalEvent(null);
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
        otId: resource.id,
        otName: resource.name,
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
        onContextMenu={e => handleEventContextMenu(e, event)}
        className={`group m-2 rounded-lg border p-3 shadow-sm transition-all duration-200 ${
          isClickable
            ? "cursor-pointer border-slate-200 bg-white hover:-translate-y-[1px] hover:border-slate-300 hover:shadow-md"
            : "cursor-not-allowed border-slate-300 bg-slate-100"
        }`}
        title={`Booking ${event.bookingNo || event.id} (Right-click for options)`}
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
        onContextMenu={e => handleEventContextMenu(e, event)}
        className={`group rounded-md border p-2 shadow-sm transition-all duration-200 ${
          isClickable
            ? "cursor-pointer border-slate-200 bg-white hover:-translate-y-[1px] hover:border-slate-300 hover:shadow-md"
            : "cursor-not-allowed border-slate-300 bg-slate-100"
        }`}
        title={`Booking ${event.bookingNo || event.id} (Right-click for options)`}
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
     BREAK CARDS (AMBER)
  ======================================================= */

  const renderBreakCard = (breakItem: BreakItem) => {
    const duration = timeToMinutes(breakItem.endTime) - timeToMinutes(breakItem.startTime);

    return (
      <div
        className="group relative m-2 rounded-lg border border-amber-300 bg-gradient-to-r from-amber-50 to-amber-100/70 p-3 shadow-sm transition-all duration-200 hover:border-amber-400 hover:shadow-md"
        title={`Break: ${formatTime(breakItem.startTime)} – ${formatTime(breakItem.endTime)}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5 min-w-0">
            {/* Amber Left Accent */}
            <div className="mt-0.5 h-12 w-1 shrink-0 rounded-full bg-amber-500" />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="rounded-full bg-amber-200/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-900">
                  Break
                </span>
                <span className="text-[10px] font-semibold text-amber-800">{duration} mins</span>
              </div>

              <p className="mt-1 truncate text-xs font-semibold text-amber-950">
                {breakItem.title || "OT Break"}
              </p>

              <p className="mt-1 text-[11px] font-medium text-amber-800">
                {formatTime(breakItem.startTime)}
                <span className="mx-1 text-amber-500">–</span>
                {formatTime(breakItem.endTime)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              handleRemoveBreak(breakItem.id);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity rounded p-1 text-amber-700 hover:bg-amber-200/80 hover:text-amber-950"
            title="Remove break"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  const renderWeekBreakCard = (breakItem: BreakItem) => {
    const duration = timeToMinutes(breakItem.endTime) - timeToMinutes(breakItem.startTime);

    return (
      <div
        className="group rounded-md border border-amber-300 bg-amber-50 p-2 shadow-sm transition-all duration-200 hover:border-amber-400 hover:shadow"
        title={`Break: ${formatTime(breakItem.startTime)} – ${formatTime(breakItem.endTime)}`}
      >
        <div className="flex items-start justify-between gap-1.5">
          <div className="flex items-start gap-2 min-w-0">
            <div className="mt-0.5 h-6 w-1 shrink-0 rounded-full bg-amber-500" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="truncate text-xs font-semibold text-amber-900">Break</p>
                <span className="text-[9px] font-medium text-amber-700">({duration}m)</span>
              </div>
              <p className="truncate text-[10px] font-medium text-amber-800">
                {formatTime(breakItem.startTime)} – {formatTime(breakItem.endTime)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              handleRemoveBreak(breakItem.id);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-600 hover:text-amber-900 text-xs px-1"
            title="Remove break"
          >
            ✕
          </button>
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
                    const activeEvent = getActiveEvent(resource.id, time);

                    const breakItem = getStartingBreak(resource.id, time, selectedDate);
                    const activeBreak = getActiveBreak(resource.id, time, selectedDate);

                    /*
                     * Existing booking or break is spanning this row.
                     */
                    if (activeEvent || activeBreak) {
                      return null;
                    }

                    /*
                     * BOOKED OT
                     */
                    if (event) {
                      return (
                        <td
                          key={`${resource.id}-${time}`}
                          rowSpan={getRowSpan(event)}
                          className="w-full border-b border-r border-slate-200 bg-white align-top"
                        >
                          {renderEventCard(event)}
                        </td>
                      );
                    }

                    /*
                     * BREAK BLOCK (AMBER)
                     */
                    if (breakItem) {
                      return (
                        <td
                          key={`break-${resource.id}-${time}`}
                          rowSpan={getBreakRowSpan(breakItem)}
                          className="w-full border-b border-r border-slate-200 bg-white align-top p-1"
                        >
                          {renderBreakCard(breakItem)}
                        </td>
                      );
                    }

                    /*
                     * EMPTY CELL
                     */
                    const isSelected = selectedSlots.some(
                      s =>
                        s.resourceId === resource.id && s.date === selectedDate && s.time === time
                    );

                    return (
                      <td
                        key={`${resource.id}-${time}`}
                        onClick={e => handleSlotClick(e, resource, time, selectedDate)}
                        onContextMenu={e => handleSlotContextMenu(e, resource, time, selectedDate)}
                        onDoubleClick={() => handleEmptyDayCellClick(resource, time)}
                        className={`h-[60px] w-full cursor-pointer border-b border-r transition-all ${
                          isSelected
                            ? "border-blue-400 bg-blue-100/90 text-blue-900 border-l-4 border-l-blue-600 shadow-inner"
                            : rowIndex % 2 === 0
                              ? "bg-white hover:bg-blue-50/70 border-slate-200"
                              : "bg-slate-50/30 hover:bg-blue-50/70 border-slate-200"
                        }`}
                        title={
                          isSelected
                            ? `Selected: ${resource.name} - ${formatTime(time)} (Right-click for options)`
                            : `Click / Ctrl+Click: ${resource.name} - ${formatTime(time)} (Double click to book)`
                        }
                      >
                        {isSelected ? (
                          <div className="flex h-full items-center justify-between px-3 select-none">
                            <div className="flex items-center gap-1.5">
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white font-bold">
                                ✓
                              </span>
                              <span className="text-xs font-semibold text-blue-900">
                                {formatTime(time)}
                              </span>
                            </div>
                            <span className="rounded bg-blue-200/90 px-1.5 py-0.5 text-[10px] font-semibold text-blue-800">
                              Selected
                            </span>
                          </div>
                        ) : (
                          <div className="h-full border-t border-dashed border-slate-100" />
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
                    const dateBreaks = getBreaksForDateAndResource(date, resource.id);
                    const hasItems = dateEvents.length > 0 || dateBreaks.length > 0;

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
                        {!hasItems ? (
                          <button
                            type="button"
                            onDoubleClick={() =>
                              navigate("/ot-booking", {
                                state: {
                                  mode: "create",
                                  bookingDate: date,
                                  resourceId: resource.id,
                                  resourceName: resource.name,
                                  otId: resource.id,
                                  otName: resource.name,
                                  startTime: "09:00",
                                  endTime: "09:30",
                                  slotInterval: 30,
                                },
                              })
                            }
                            onContextMenu={e => handleSlotContextMenu(e, resource, "09:00", date)}
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
                            title="Double-click to book (09:00 - 09:30) or right-click for options"
                          >
                            <span className="text-xs text-slate-400">No booking</span>
                          </button>
                        ) : (
                          <div className="space-y-2">
                            {dateEvents.map(event => (
                              <div key={event.id}>{renderWeekEventCard(event)}</div>
                            ))}
                            {dateBreaks.map(breakItem => (
                              <div key={breakItem.id}>{renderWeekBreakCard(breakItem)}</div>
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

        {/* INSTRUCTIONAL TIP / SELECTION SUMMARY BAR */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center rounded bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-700">
              Shortcuts
            </span>
            <span>
              <strong>Ctrl + Click</strong> (Win) or <strong>⌘ + Click</strong> (Mac) to select
              multiple empty slots • <strong>Right-click</strong> a slot to open context menu •{" "}
              <strong>Esc</strong> to close menu
            </span>
          </div>
          {selectedSlots.length > 0 && calculatedRange && (
            <div className="flex items-center gap-2.5">
              <span className="font-semibold text-blue-700">
                {calculatedRange.count} slot{calculatedRange.count > 1 ? "s" : ""} selected (
                {formatTime(calculatedRange.startTime)} – {formatTime(calculatedRange.endTime)})
              </span>
              <button
                type="button"
                onClick={handleClearSelection}
                className="font-semibold text-slate-500 hover:text-slate-800 underline"
              >
                Clear
              </button>
            </div>
          )}
        </div>

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

        {/* FLOATING SELECTION BAR */}
        {selectedSlots.length > 0 && calculatedRange && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-3 rounded-xl border border-blue-200 bg-white/95 px-4 py-2.5 shadow-2xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-2 text-xs">
              <span className="flex h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
              <span className="font-semibold text-slate-800">{calculatedRange.resourceName}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600">{calculatedRange.date}</span>
              <span className="text-slate-300">•</span>
              <span className="font-bold text-blue-700">
                {formatTime(calculatedRange.startTime)} – {formatTime(calculatedRange.endTime)}
              </span>
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-800">
                {calculatedRange.count} slot{calculatedRange.count > 1 ? "s" : ""} (
                {calculatedRange.durationMinutes}m)
              </span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBookOtFromSelection}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
              >
                Book OT
              </button>
              <button
                type="button"
                onClick={handleTakeBreakFromSelection}
                className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-600 transition"
              >
                Take Break
              </button>
              <button
                type="button"
                onClick={handleClearSelection}
                className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                title="Clear selection"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* CONTEXT MENU */}
        {contextMenu && calculatedRange && (
          <div
            ref={contextMenuRef}
            style={{
              position: "fixed",
              left: `${contextMenu.x}px`,
              top: `${contextMenu.y}px`,
              zIndex: 1000,
            }}
            className="w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 select-none"
          >
            {/* Header */}
            <div className="border-b border-slate-100 px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="truncate text-xs font-bold text-slate-800">
                  {calculatedRange.resourceName}
                </span>
                <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                  {calculatedRange.count} slot{calculatedRange.count > 1 ? "s" : ""}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                {calculatedRange.date} • {formatTime(calculatedRange.startTime)} –{" "}
                {formatTime(calculatedRange.endTime)}
              </p>
            </div>

            {/* Menu Items */}
            <div className="mt-1 space-y-0.5">
              {/* Book OT */}
              <button
                type="button"
                onClick={handleBookOtFromSelection}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-100 text-blue-600">
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800">Book OT</p>
                  <p className="text-[10px] text-slate-500">
                    {formatTime(calculatedRange.startTime)} – {formatTime(calculatedRange.endTime)}
                  </p>
                </div>
              </button>

              {/* Take Break */}
              <button
                type="button"
                onClick={handleTakeBreakFromSelection}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-slate-700 transition-colors hover:bg-amber-50 hover:text-amber-800"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-100 text-amber-700">
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800">Take Break</p>
                  <p className="text-[10px] text-slate-500">
                    Block amber break ({calculatedRange.durationMinutes}m)
                  </p>
                </div>
              </button>

              <div className="my-1 border-t border-slate-100" />

              {/* Clear Selection */}
              <button
                type="button"
                onClick={handleClearSelection}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-700">Clear Selection</p>
                  <p className="text-[10px] text-slate-400">Deselect slots (or press Esc)</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* BOOKED OT CONTEXT MENU */}
        {bookedOtContextMenu && (
          <div
            ref={bookedOtContextMenuRef}
            style={{
              position: "fixed",
              left: `${bookedOtContextMenu.x}px`,
              top: `${bookedOtContextMenu.y}px`,
              zIndex: 1000,
            }}
            className="w-60 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 select-none"
          >
            {/* Header */}
            <div className="border-b border-slate-100 px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="truncate text-xs font-bold text-slate-800">
                  {bookedOtContextMenu.event.bookingNo ||
                    `Booking #${bookedOtContextMenu.event.id}`}
                </span>
                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-700">
                  Scheduled
                </span>
              </div>
              <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-700">
                {bookedOtContextMenu.event.patientName || "Patient"}
              </p>
              <p className="mt-0.5 text-[10px] font-medium text-slate-500">
                {bookedOtContextMenu.resource?.name} •{" "}
                {formatTime(bookedOtContextMenu.event.startTime)} –{" "}
                {formatTime(bookedOtContextMenu.event.endTime)}
              </p>
            </div>

            {/* Menu Items */}
            <div className="mt-1 space-y-0.5">
              {/* Reschedule */}
              <button
                type="button"
                onClick={() => handleRescheduleOt(bookedOtContextMenu.event)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-100 text-blue-600">
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800">Reschedule</p>
                  <p className="text-[10px] text-slate-500">Change date, time or OT</p>
                </div>
              </button>

              {/* Cancel OT */}
              <button
                type="button"
                onClick={() => handleInitiateCancel(bookedOtContextMenu.event)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-red-100 text-red-600">
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-red-700">Cancel OT</p>
                  <p className="text-[10px] text-red-500">Cancel this scheduled booking</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* CANCEL OT CONFIRMATION MODAL */}
        <CentralPopup
          isOpen={!!cancelModalEvent}
          onClose={() => setCancelModalEvent(null)}
          title="Cancel OT Booking"
          className="!max-w-md"
        >
          {cancelModalEvent && (
            <div className="space-y-4">
              <div className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-800">
                <p className="text-sm font-semibold text-red-900">
                  Are you sure you want to cancel this booking?
                </p>
                <div className="mt-2 space-y-1 text-slate-700">
                  <p>
                    Booking:{" "}
                    <strong>{cancelModalEvent.bookingNo || `#${cancelModalEvent.id}`}</strong>
                  </p>
                  <p>
                    Patient: <strong>{cancelModalEvent.patientName || "N/A"}</strong>
                  </p>
                  <p>
                    Scheduled:{" "}
                    <strong>
                      {cancelModalEvent.bookingDate} ({formatTime(cancelModalEvent.startTime)} –{" "}
                      {formatTime(cancelModalEvent.endTime)})
                    </strong>
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Reason for Cancellation (Optional)
                </label>
                <textarea
                  rows={3}
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  placeholder="Enter reason for cancelling this OT booking..."
                  className="input-field w-full text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setCancelModalEvent(null)}
                  className="cancel-button text-xs"
                >
                  Keep Booking
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                >
                  Confirm Cancel
                </button>
              </div>
            </div>
          )}
        </CentralPopup>

        {/* VALIDATION TOAST */}
        {validationToast && (
          <div className="fixed bottom-6 right-6 z-[120] flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50/95 px-4 py-3 text-sm text-red-800 shadow-xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
            <svg className="h-5 w-5 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-semibold text-xs text-red-900">{validationToast}</span>
            <button
              type="button"
              onClick={() => setValidationToast(null)}
              className="ml-2 text-red-400 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
}
