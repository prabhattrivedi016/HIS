import * as yup from "yup";

const doctorTimingSchema = yup.object({
  doctorId: yup.number().nullable(),
  branchId: yup.number().typeError("Please select a branch").required("Please select a branch"),

  day: yup
    .array()
    .min(1, "Please select at least one day")
    .required("Please select at least one day"),

  startTiming: yup.string().required("Start time is required"),

  endTiming: yup
    .string()
    .required("End time is required")
    .test("time-check", "End time must be greater than start time", function (endTime) {
      const { startTiming } = this.parent;
      if (!startTiming || !endTime) return true;

      const toMinutes = (t: string) => {
        const [time, meridian] = t.split(" ");
        let [h, m] = time.split(":").map(Number);
        if (meridian === "PM" && h !== 12) h += 12;
        if (meridian === "AM" && h === 12) h = 0;
        return h * 60 + m;
      };

      return toMinutes(endTime) > toMinutes(startTiming);
    }),
});

export default doctorTimingSchema;
