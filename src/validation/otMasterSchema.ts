import type { InferType } from "yup";
import * as yup from "yup";

const timeToMinutes = (time: string): number => {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (!match) return -1;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3].toUpperCase();

  if (period === "AM") {
    if (hours === 12) {
      hours = 0;
    }
  } else {
    if (hours !== 12) {
      hours += 12;
    }
  }

  return hours * 60 + minutes;
};

export const otMasterSchema = yup.object({
  otId: yup.number().nullable(),

  branchId: yup.number().required("Branch Name is required"),

  otName: yup.string().required("OT Name is required"),

  otStartTime: yup.string().required("OT Start Time is required"),

  otEndTime: yup
    .string()
    .required("OT End Time is required")
    .test("valid-ot-time", "OT End Time must be greater than OT Start Time", function (endTime) {
      const { otStartTime } = this.parent;

      if (!otStartTime || !endTime) {
        return true;
      }

      const startMinutes = timeToMinutes(otStartTime);
      const endMinutes = timeToMinutes(endTime);

      if (startMinutes === -1 || endMinutes === -1) {
        return true;
      }

      // Same time is not allowed
      if (startMinutes === endMinutes) {
        return false;
      }

      // End time must be strictly after start time on the same day
      return endMinutes > startMinutes;
    }),

  otSlotMins: yup.string().required("OT Slot In Mins is required"),

  isActive: yup.number().required("Status is required"),
});

export type OtMasterFormData = InferType<typeof otMasterSchema>;
