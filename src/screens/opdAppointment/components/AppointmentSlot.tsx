import CentralPopup from "@/components/centralPopup";
import CustomDateInput from "@/components/customDateInput";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import CancelButton from "@/components/globalButtons/CancelButton";
import SubmitButton from "@/components/globalButtons/SubmitButton";
import { ENDPOINTS } from "@/config/defaults";
import { BranchContext } from "@/context/BranchContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { formatToDDMMYYYY } from "@/utils/dateConvertHandler";
import { useQuery } from "@tanstack/react-query";
import { useContext, useEffect, useMemo, useState } from "react";
import { SlotListItem } from "../types";

interface AppointmentSlotProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: number | string;
  selectedSlotTimingId: string;
  onSelectSlot: (slotId: string, appDateTime: string) => void;
}

const AppointmentSlot = ({
  isOpen,
  onClose,
  doctorId,
  selectedSlotTimingId,
  onSelectSlot,
}: AppointmentSlotProps) => {
  const { loading, fetchApi } = useGlobalApi();

  const branchId = useContext(BranchContext)?.branchId ?? 1;

  const today = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(today);

  const getAppointmentLists = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_APPOINTMENT_SLOTS,
      {},
      {
        params: {
          branchId,
          doctorId,
          appointmentDate: formatToDDMMYYYY(selectedDate),
        },
      },
      {
        component: "AppointmentSlot",
      }
    );

    return resp?.data ?? [];
  };

  const { data: appointmentLists = [] } = useQuery({
    queryKey: ["appointmentSlots", selectedDate, doctorId],
    queryFn: getAppointmentLists,
    enabled: isOpen && doctorId > 0,
  });

  const [localSelectedSlot, setLocalSelectedSlot] = useState<SlotListItem | null>(null);

  // Sync prop selectedSlotTimingId when data is fetched/changed
  useEffect(() => {
    if (selectedSlotTimingId && appointmentLists.length > 0) {
      const found = appointmentLists.find(
        (s: SlotListItem) => s.SlotTimingId === selectedSlotTimingId
      );
      if (found) {
        setLocalSelectedSlot(found);
      }
    } else {
      setLocalSelectedSlot(null);
    }
  }, [selectedSlotTimingId, appointmentLists]);

  const handleSlotClick = (slot: SlotListItem) => {
    if (slot.IsBooked === 1 || slot.IsExpired === 1) return;
    setLocalSelectedSlot(slot);
  };

  const handleSave = () => {
    if (localSelectedSlot) {
      onSelectSlot(localSelectedSlot.SlotTimingId, localSelectedSlot.SlotStartDateTime);
      onClose();
    }
  };

  /**
   * Group by AppointmentDate
   */

  const groupedSlots = useMemo(() => {
    const groups: Record<string, SlotListItem[]> = {};

    appointmentLists.filter((slot: SlotListItem) => {
      const key = slot.AppointmentDate;
      console.log("key", key);

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(slot);
    });

    return Object.entries(groups);
  }, [appointmentLists]);

  return (
    <CentralPopup
      isOpen={isOpen}
      onClose={onClose}
      title="Appointment Slots"
      className="w-[95vw] lg:min-w-350"
    >
      <div>
        <div className="flex flex-row justify-between">
          <div className="form-grid-4 mb-5">
            <InputField label="Appointment Date">
              <CustomDateInput
                value={selectedDate}
                onChange={(value: string) => setSelectedDate(value)}
                min={today}
              />
            </InputField>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-circle text-xs slot-available-dot"></i>
              <span className="font-medium text-gray-700">Available</span>
            </div>

            <div className="flex items-center gap-2">
              <i className="fa-solid fa-circle text-xs slot-selected-dot"></i>
              <span className="font-medium text-gray-700">Selected</span>
            </div>

            <div className="flex items-center gap-2">
              <i className="fa-solid fa-circle text-xs slot-booked-dot"></i>
              <span className="font-medium text-gray-700">Booked</span>
            </div>

            <div className="flex items-center gap-2">
              <i className="fa-solid fa-circle text-xs slot-expired-dot"></i>
              <span className="font-medium text-gray-500">Not Available</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto hide-scrollbar  ">
          <div className="flex gap-10 min-w-max">
            {groupedSlots.slice(0, 7).map(([date, slots]) => (
              <div
                key={date}
                className="w-[230px] border border-gray-200 rounded-lg bg-white shadow-sm flex flex-col"
              >
                {/* Header */}

                <div className=" p-3 font-semibold text-center">
                  <div className="text-lg">{date}</div>

                  <div className="text-gray-600">({slots[0]?.Day})</div>
                </div>

                {/* Slot List */}

                <div className="p-2 space-y-2 overflow-y-auto hide-scrollbar  max-h-100">
                  {slots.map(slot => {
                    const isBooked = slot.IsBooked === 1;
                    const isExpired = slot.IsExpired === 1;
                    const isSelected = localSelectedSlot?.SlotTimingId === slot.SlotTimingId;

                    let buttonClass =
                      "w-full rounded py-2 text-sm font-semibold transition border select-none ";

                    if (isBooked) {
                      buttonClass += " slot-booked cursor-not-allowed opacity-90 ";
                    } else if (isExpired) {
                      buttonClass += " slot-expired cursor-not-allowed opacity-70 ";
                    } else if (isSelected) {
                      buttonClass += " slot-selected transform scale-102 shadow-md cursor-pointer ";
                    } else {
                      // Available
                      buttonClass +=
                        " slot-available hover:brightness-95 hover:shadow-sm active:scale-98 cursor-pointer ";
                    }

                    return (
                      <button
                        key={slot.SlotTimingId}
                        className={buttonClass}
                        onClick={() => handleSlotClick(slot)}
                        disabled={isBooked || isExpired}
                      >
                        {slot.SlotStartTime} - {slot.SlotEndTime}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <SubmitButton
            label="Save"
            className="save-btn-color"
            onClick={handleSave}
            disabled={!localSelectedSlot}
          />

          <CancelButton label="Cancel" className="cancel-btn-color" onClick={onClose} />
        </div>
      </div>
      {loading && <CustomLoader isLoading={loading} />}
    </CentralPopup>
  );
};

export default AppointmentSlot;
