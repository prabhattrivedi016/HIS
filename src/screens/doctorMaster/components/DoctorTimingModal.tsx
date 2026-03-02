import { SelectStyles } from "@/components/customSelect";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import MultiCheckboxOption from "@/components/multiSelectCheckBox";
import CustomTimePicker from "@/components/timePicker";
import { ENDPOINTS } from "@/config/defaults";
import { DoctorTimingTableHeader } from "@/constants/constants";
import useGetBranchList from "@/hooks/useGetBranchList";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import Select from "react-select";
import CustomLoader from "../../../components/customLoader";
import useGlobalApi from "../../../hooks/useGlobalApi";
import doctorTimingSchema from "../../../validation/doctorTimingSchema";

import { useScrollLock } from "@/hooks/useScrollLock";
import InputField from "../..//../components/customInputField";
import { DoctorTimingItem, DoctorTimingModalProps, SelectItem } from "../types";

// "11:30 AM" → minutes
export const convertToMinutes = (time12h: string): number => {
  const [time, meridian] = time12h.split(" ");
  let [h, m] = time.split(":").map(Number);

  if (meridian === "PM" && h !== 12) h += 12;
  if (meridian === "AM" && h === 12) h = 0;

  return h * 60 + m;
};

// minutes → "02:30 PM"
export const minutesTo12Hour = (mins: number): string => {
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const period = h >= 12 ? "PM" : "AM";

  if (h === 0) h = 12;
  if (h > 12) h -= 12;

  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${period}`;
};

// minutes → "14:30"
export const minutesToHHMM = (mins: number): string => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

// "14:30" → minutes (API response)
export const hhmmToMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

export const validateOverlap = ({
  selectedDays,
  startTime,
  endTime,
  branchId,
  doctorId,
  existingTimings,
}: any): string | null => {
  const newStart = convertToMinutes(startTime);
  const newEnd = convertToMinutes(endTime);

  for (const day of selectedDays) {
    for (const slot of existingTimings) {
      //  same day + same branch + same doctor
      if (slot.day === day && slot.branchId === branchId && slot.doctorId === doctorId) {
        const existingStart = slot.startTiming;
        const existingEnd = slot.endTiming;

        //  CASE 1: EXACT SAME SLOT
        if (newStart === existingStart && newEnd === existingEnd) {
          return `This exact timing already exists on ${day}`;
        }

        // CASE 2: OVERLAPPING SLOT
        if (newStart < existingEnd && newEnd > existingStart) {
          return `Please select another timing. Slot timing already exists on ${day}`;
        }
      }
    }
  }

  return null;
};

export const DOCTOR_TIMING_STORAGE_KEY = "doctorTimingsDraft";

const DoctorTimingModal = ({ isOpen, onClose, doctorId }: DoctorTimingModalProps) => {
  const { loading, error, fetchApi } = useGlobalApi();
  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
    reset,
    clearErrors,
    setError,
  } = useForm({
    resolver: yupResolver(doctorTimingSchema),
    defaultValues: {
      doctorId: doctorId,
      branchId: 1,
      day: [],
      startTiming: "01:00 PM",
      endTiming: "01:00 PM",
    },
  });

  useScrollLock(isOpen);

  const drawerTitle = "Doctor Timing ";

  const [doctorTimings, setDoctorTiming] = useState<DoctorTimingItem[]>([]);

  const [selectedWeekDays, setSelectedWeekDays] = useState<SelectItem[]>([]);

  const getBranches = useGetBranchList();

  const branches = useMemo(() => getBranches?.branchList?.data ?? [], [getBranches]);

  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [startTime, setStartTime] = useState("01:00 PM");
  const [endTime, setEndTime] = useState("01:00 PM");

  const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const weekDayOptions = useMemo(
    () =>
      weekDays.map((day, index) => ({
        label: day,
        value: index + 1,
      })),
    []
  );

  const weekDayChangeHandler = (options: any[]) => {
    const selected = options ?? [];

    setSelectedWeekDays(selected);

    setValue(
      "day",
      selected.map(o => o.label),
      {
        shouldValidate: true,
        shouldDirty: true,
      }
    );

    clearErrors("day");
  };

  const startTimeChangeHandler = (val: string) => {
    setStartTime(val);
    setValue("startTiming", val, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const endTimeChangeHandler = (val: string) => {
    setEndTime(val);
    setValue("endTiming", val, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const getDoctorTiming = async (doctorId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_TIMING_DETAILS,
      {},
      { params: { doctorId } },
      { silent: true }
    );

    const normalized = (resp?.data ?? []).map((t: any) => ({
      ...t,
      startTiming: hhmmToMinutes(t.startTiming),
      endTiming: hhmmToMinutes(t.endTiming),
    }));

    setDoctorTiming(normalized);
  };

  /*--------------------------get doctor timing --------------- */

  useEffect(() => {
    const saved = localStorage.getItem(DOCTOR_TIMING_STORAGE_KEY);

    if (saved) {
      setDoctorTiming(JSON.parse(saved));
    } else {
      getDoctorTiming(doctorId);
    }
  }, [doctorId]);

  const onSubmit = (formData: any) => {
    const overlapError = validateOverlap({
      selectedDays: formData.day,
      startTime,
      endTime,
      branchId: Number(formData.branchId),
      doctorId,
      existingTimings: doctorTimings,
    });

    if (overlapError) {
      setError("endTiming", { type: "manual", message: overlapError });
      return;
    }

    const startMinutes = convertToMinutes(startTime);
    const endMinutes = convertToMinutes(endTime);

    const newRows: DoctorTimingItem[] = formData.day.map((day: string) => ({
      doctorId,
      branchId: Number(formData.branchId),
      branchName: branches.find(b => b.branchId === Number(formData.branchId))?.branchName ?? "",
      day,
      startTiming: startMinutes,
      endTiming: endMinutes,
    }));

    setDoctorTiming(prev => {
      const updated = [...prev, ...newRows];

      localStorage.setItem(DOCTOR_TIMING_STORAGE_KEY, JSON.stringify(updated));
      setErrorMessage("");
      return updated;
    });

    reset({
      branchId: formData.branchId,
      day: [],
      startTiming: startTime,
      endTiming: endTime,
    });

    setSelectedWeekDays([]);
  };

  const buildPayloadFromLocalStorage = () => {
    const stored = localStorage.getItem(DOCTOR_TIMING_STORAGE_KEY);
    const timings: DoctorTimingItem[] = stored ? JSON.parse(stored) : [];

    return {
      doctorId,
      doctorTimings: timings.map(t => ({
        branchId: t.branchId,
        day: t.day,
        startTiming: minutesToHHMM(Number(t.startTiming)),
        endTiming: minutesToHHMM(Number(t.endTiming)),
      })),
    };
  };

  const handleRemoveTiming = (index: number) => {
    setDoctorTiming(prev => {
      const updated = prev.filter((_, i) => i !== index);

      localStorage.setItem(DOCTOR_TIMING_STORAGE_KEY, JSON.stringify(updated));

      return updated;
    });
  };

  const submitTimingHandler = async () => {
    const payload = buildPayloadFromLocalStorage();

    if (payload?.doctorTimings?.length === 0) {
      setErrorMessage("Please change slot timings");
      return;
    }

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_DOCTOR_TIMING_DETAILS,
      payload,
      {},
      {
        component: "DoctorTimingModal",
      }
    );
    if (!resp) return;

    setSuccessMessage(resp?.message);

    localStorage.removeItem(DOCTOR_TIMING_STORAGE_KEY);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}>
      <div className="absolute inset-0">
        {/* BACKDROP */}
        <div
          className={`drawer-bg-fade w ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={onClose}
        />

        {/* RIGHT DRAWER */}
        <div
          className={`drawer-layout  drawer-bg ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="drawer-title-border">
            <h2 className="drawer-title">{drawerTitle}</h2>
            <button onClick={onClose} className="drawer-close-btn">
              ×
            </button>
          </div>

          {successMessage ? <SuccessMessage text={successMessage} /> : <></>}
          {error || errorMessage ? <ErrorMessage text={error?.message || errorMessage} /> : <></>}

          <div className="drawer-body">
            <div className="card m-1">
              <h2 className="card-title ">Doctor Timing Mapping</h2>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-grid-2 m-2">
                  <InputField label="Branches" required>
                    <select
                      className="input-field"
                      {...register("branchId", { valueAsNumber: true })}
                    >
                      <option value="">Select</option>
                      {branches.map(b => (
                        <option key={b.branchId} value={b.branchId}>
                          {b.branchName}
                        </option>
                      ))}
                    </select>

                    {errors.branchId && (
                      <p className="input-field-error">{errors.branchId.message}</p>
                    )}
                  </InputField>

                  <InputField label="Week Days">
                    <Select
                      isMulti
                      value={selectedWeekDays}
                      options={weekDayOptions}
                      closeMenuOnSelect={false}
                      hideSelectedOptions={false}
                      onChange={(option: any) => weekDayChangeHandler(option)}
                      components={{ Option: MultiCheckboxOption }}
                      styles={SelectStyles}
                      menuPortalTarget={document.body}
                    />

                    {errors.day && <p className="input-field-error">{errors.day.message}</p>}
                  </InputField>

                  <InputField label="Start Time" required>
                    <CustomTimePicker value={startTime} onChange={startTimeChangeHandler} />
                    {errors.startTiming && (
                      <p className="input-field-error">{errors.startTiming.message}</p>
                    )}
                  </InputField>

                  <InputField label="End Time" required>
                    <CustomTimePicker value={endTime} onChange={endTimeChangeHandler} />
                    {errors.endTiming && (
                      <p className="input-field-error">{errors.endTiming.message}</p>
                    )}
                  </InputField>
                </div>

                <div className="form-actions-responsive mt-5">
                  <button type="submit" className="save-btn">
                    {"Add Timing"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className=" m-1">
            <div className="w-full  max-w-[800px]">
              <div className=" mx-auto my-auto w-full  max-w-[1000px]     h-[600px] sm:h-[420px] md:h-[300px] rounded-xl  border border-gray-200 bg-white shadow overflow-auto">
                <div className="w-full h-full overflow-auto">
                  <table className="w-full min-w-max  border-collapse text-sm text-gray-700">
                    <thead className="sticky top-0 z-20 border-b bg-blue-100 border-blue-200 ">
                      <tr>
                        {DoctorTimingTableHeader.map((h, index) => (
                          <th
                            key={index}
                            className="px-4 py-3 text-left font-semibold whitespace-normal "
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {doctorTimings.length === 0 && (
                        <tr>
                          <td colSpan={[].length} className="table-empty text-center">
                            No records found
                          </td>
                        </tr>
                      )}

                      {doctorTimings.map((item, idx) => (
                        <tr key={idx} className="even:bg-gray-50 hover:bg-gray-100 transition">
                          <td className="table-td">{item?.branchName}</td>
                          <td className="table-td">{item?.day}</td>

                          <td>{minutesTo12Hour(Number(item?.startTiming))}</td>
                          <td>{minutesTo12Hour(Number(item?.endTiming))}</td>
                          <td className="table-action">
                            <button type="button" onClick={() => handleRemoveTiming(idx)}>
                              <i className="fa-solid fa-trash text-xl text-red-600 active:scale-90" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="form-actions-responsive mt-5">
              <button type="button" className="save-btn" onClick={submitTimingHandler}>
                Save
              </button>
              <button type="button" className="cancel-button ">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};
export default DoctorTimingModal;
