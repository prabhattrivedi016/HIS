import CentralPopup from "@/components/centralPopup";
import CustomLoader from "@/components/customLoader";
import CancelButton from "@/components/globalButtons/CancelButton";
import SubmitButton from "@/components/globalButtons/SubmitButton";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import OtSchedular from "@/screens/otSchedular";
import { showError, showSuccess } from "@/utils/alert";
import {
  formatBookingDate,
  normalizeToDDMMYYYY,
  normalizeToYYYYMMDD,
} from "@/utils/dateConvertHandler";
import React, { useEffect, useState } from "react";
import { OtBookingDetailsItem } from "../types";

type SelectedSlotRange = {
  otId: number;
  otName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
};

type RescheduleOtBookingProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  item: OtBookingDetailsItem | null;
};

// Converts time strings (e.g. "04:40", "4:40 PM", "16:40:00") to 24-hour "HH:mm:ss"
const formatTimeTo24Hour = (timeStr?: string): string => {
  if (!timeStr) return "";
  const trimmed = timeStr.trim();
  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed;

  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if (!match) return trimmed;

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const modifier = match[3]?.toUpperCase();

  if (modifier === "PM" && hours < 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  return `${String(hours).padStart(2, "0")}:${minutes}:00`;
};

// Converts any date format to YYYY-MM-DD for the scheduler
const getInitialDate = (dateStr?: string | null): string => {
  if (!dateStr) return new Date().toISOString().split("T")[0];
  const normalized = normalizeToYYYYMMDD(dateStr);
  return normalized || new Date().toISOString().split("T")[0];
};

const RescheduleOtBooking: React.FC<RescheduleOtBookingProps> = ({
  isOpen,
  onClose,
  onSuccess,
  item,
}) => {
  const isRescheduleBooking = true;
  const { loading, fetchApi } = useGlobalApi();

  const [selectedSlot, setSelectedSlot] = useState<SelectedSlotRange | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelectedSlot(null);
      setErrorMessage("");
      setSuccessMessage("");
    }
  }, [isOpen, item]);

  useScrollLock(isOpen);

  const handleSave = async () => {
    if (!item?.OTBookingId) {
      showError("No valid OT booking selected to reschedule.");
      return;
    }

    if (!selectedSlot) {
      showError("Please select a new slot on the OT Scheduler.");
      return;
    }

    const startTime24 = formatTimeTo24Hour(selectedSlot.startTime);
    const endTime24 = formatTimeTo24Hour(selectedSlot.endTime);

    if (startTime24 >= endTime24) {
      showError("From time must be earlier than To time.");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const dateFormatted = normalizeToYYYYMMDD(selectedSlot.bookingDate);
      const payload = {
        otBookingId: Number(item.OTBookingId),
        otId: Number(selectedSlot.otId),
        otBookingDate: dateFormatted,
        otBookingFromTime: startTime24,
        otBookingToTime: endTime24,
      };

      let resp = await fetchApi(
        "PATCH",
        ENDPOINTS.RESCHEDULE_OT_BOOKING,
        payload,
        {},
        { component: "RescheduleOtBooking" }
      );

      // Fallback to POST if server endpoint requires POST
      if (
        !resp?.result &&
        (resp?.status === 405 ||
          resp?.message?.includes("Method Not Allowed") ||
          resp?.message?.includes("405"))
      ) {
        resp = await fetchApi(
          "POST",
          ENDPOINTS.RESCHEDULE_OT_BOOKING,
          payload,
          {},
          { component: "RescheduleOtBooking" }
        );
      }

      // If error indicates date format issue, try DD-MM-YYYY format
      if (!resp?.result && resp?.message?.toLowerCase().includes("date")) {
        const altPayload = {
          ...payload,
          otBookingDate: normalizeToDDMMYYYY(selectedSlot.bookingDate),
        };
        resp = await fetchApi(
          "PATCH",
          ENDPOINTS.RESCHEDULE_OT_BOOKING,
          altPayload,
          {},
          { component: "RescheduleOtBooking" }
        );
      }

      if (!resp?.result) {
        showError(resp?.message ?? "Failed to reschedule OT Booking.");
        setErrorMessage(resp?.message ?? "Failed to reschedule OT Booking.");
        setIsSubmitting(false);
        return;
      }

      showSuccess(resp?.message ?? "OT Booking rescheduled successfully.");
      setSuccessMessage(resp?.message ?? "OT Booking rescheduled successfully.");
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 500);
    } catch (error) {
      console.error("Error rescheduling OT booking:", error);
      showError("Failed to reschedule OT Booking.");
      setErrorMessage("Failed to reschedule OT Booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const initialDate = getInitialDate(item?.OTBookingDate);
  const initialOtId = Number(item?.OTId ?? 0);

  return (
    <CentralPopup
      isOpen={isOpen}
      onClose={onClose}
      title="Reschedule OT Booking"
      className="w-[95vw] lg:min-w-350"
    >
      <div>
        {!!successMessage && <SuccessMessage text={successMessage} />}
        {!!errorMessage && <ErrorMessage text={errorMessage} />}

        {/* Current Booking Details Summary */}
        <div className="w-full card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Patient Name:</span>
            <span className="truncate">{item?.PatientName || "-"}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">UHID:</span>
            <span className="truncate">{item?.UHID || "-"}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Age / Gender:</span>
            <span className="truncate">
              {item ? `${item?.Age ?? "-"} / ${item?.Gender ?? "-"}` : "-"}
            </span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Contact Number:</span>
            <span className="truncate">{item?.ContactNumber || "-"}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">OT Type:</span>
            <span className="truncate">{item?.OTType || "-"}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Current Date:</span>
            <span className="truncate">{formatBookingDate(item?.OTBookingDate)}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Current Timing:</span>
            <span className="truncate">
              {item?.OTBookingFromTime || "-"} – {item?.OTBookingToTime || "-"}
            </span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="name-header whitespace-nowrap">Surgeon:</span>
            <span className="truncate">{item?.SurgeonNameList || "-"}</span>
          </div>
        </div>

        {/* Selected Reschedule Slot Information Banner */}
        {selectedSlot ? (
          <div className="w-full bg-blue-50/90 border border-blue-200 rounded-lg p-3 mb-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex flex-wrap items-center gap-3 text-xs text-blue-950 font-medium">
              <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-[11px] font-bold text-white uppercase tracking-wider">
                New Slot Selected
              </span>
              <span>
                <strong>OT Theater:</strong> {selectedSlot.otName}
              </span>
              <span className="text-blue-300">•</span>
              <span>
                <strong>Date:</strong> {formatBookingDate(selectedSlot.bookingDate)}
              </span>
              <span className="text-blue-300">•</span>
              <div className="flex items-center gap-1.5">
                <strong>Time:</strong>
                <input
                  type="time"
                  value={selectedSlot.startTime.substring(0, 5)}
                  onChange={e =>
                    setSelectedSlot(prev => (prev ? { ...prev, startTime: e.target.value } : null))
                  }
                  className="rounded border border-blue-300 bg-white px-1.5 py-0.5 text-xs font-semibold text-slate-800"
                  title="Adjust Start Time"
                />
                <span>–</span>
                <input
                  type="time"
                  value={selectedSlot.endTime.substring(0, 5)}
                  onChange={e =>
                    setSelectedSlot(prev => (prev ? { ...prev, endTime: e.target.value } : null))
                  }
                  className="rounded border border-blue-300 bg-white px-1.5 py-0.5 text-xs font-semibold text-slate-800"
                  title="Adjust End Time"
                />
              </div>
            </div>
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              ✓ Ready to save
            </span>
          </div>
        ) : (
          <div className="w-full bg-amber-50 border border-amber-200 rounded-lg p-2.5 mb-3 text-xs text-amber-900 flex items-center justify-between">
            <span>
              ℹ️ Click on available slot(s) in the scheduler below to select the new OT, date, and
              time.
            </span>
            <span className="text-[11px] text-amber-700 font-medium">No new slot selected</span>
          </div>
        )}

        {/* Embedded OT Scheduler */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <OtSchedular
            hideSomeDetails={isRescheduleBooking}
            onSlotSelectRange={setSelectedSlot}
            initialDate={initialDate}
            initialOtId={initialOtId}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <SubmitButton
            label={isSubmitting ? "Rescheduling..." : "Reschedule"}
            className="save-btn-color disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSave}
            disabled={!selectedSlot || isSubmitting || loading}
          />

          <CancelButton
            label="Cancel"
            className="cancel-btn-color"
            onClick={onClose}
            disabled={isSubmitting}
          />
        </div>
      </div>
      {(loading || isSubmitting) && <CustomLoader isLoading={true} />}
    </CentralPopup>
  );
};

export default React.memo(RescheduleOtBooking);
