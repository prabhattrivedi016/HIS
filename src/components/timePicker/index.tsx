import { useEffect, useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const TIME_REGEX = /^(0?[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/i;

const CustomTimePicker = ({ value, onChange, disabled }: Props) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState<"AM" | "PM">("AM");

  const [textValue, setTextValue] = useState(value);

  /* sync from parent */
  useEffect(() => {
    if (!value) return;

    setTextValue(value);

    const [time, p] = value.split(" ");
    const [h, m] = time.split(":");

    setHour(Number(h));
    setMinute(m);
    setPeriod(p as "AM" | "PM");
  }, [value]);

  const emitChange = (h = hour, m = minute, p = period) => {
    const newVal = `${h}:${m} ${p}`;
    setTextValue(newVal);
    onChange(newVal);
  };

  /* handle manual typing */
  const handleBlur = () => {
    const trimmed = textValue.trim().toUpperCase();

    if (!TIME_REGEX.test(trimmed)) {
      // revert if invalid
      setTextValue(`${hour}:${minute} ${period}`);
      return;
    }

    const [time, p] = trimmed.split(" ");
    const [h, m] = time.split(":");

    setHour(Number(h));
    setMinute(m);
    setPeriod(p as "AM" | "PM");
    onChange(`${Number(h)}:${m} ${p}`);
  };

  /* click outside */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      {/* INPUT */}
      <div className="relative">
        <input
          type="text"
          value={textValue}
          disabled={disabled}
          onChange={e => setTextValue(e.target.value)}
          onFocus={() => !disabled && setOpen(true)}
          onBlur={handleBlur}
          placeholder="hh:mm AM"
          className={`input-field pr-10 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        />
        <span
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
          onClick={() => !disabled && setOpen(o => !o)}
        >
          ⏱
        </span>
      </div>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute mt-1 w-full bg-white border rounded-lg shadow-lg z-50 p-3">
          <div className="flex justify-between gap-4">
            {/* HOURS */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => {
                  const h = hour === 12 ? 1 : hour + 1;
                  setHour(h);
                  emitChange(h);
                }}
              >
                ▲
              </button>
              <span className="py-1">{hour}</span>
              <button
                type="button"
                onClick={() => {
                  const h = hour === 1 ? 12 : hour - 1;
                  setHour(h);
                  emitChange(h);
                }}
              >
                ▼
              </button>
            </div>

            {/* MINUTES */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => {
                  const m =
                    minute === "59" ? "00" : (Number(minute) + 1).toString().padStart(2, "0");
                  setMinute(m);
                  emitChange(undefined, m);
                }}
              >
                ▲
              </button>
              <span className="py-1">{minute}</span>
              <button
                type="button"
                onClick={() => {
                  const m =
                    minute === "00" ? "59" : (Number(minute) - 1).toString().padStart(2, "0");
                  setMinute(m);
                  emitChange(undefined, m);
                }}
              >
                ▼
              </button>
            </div>

            {/* AM / PM */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => {
                  const p = period === "AM" ? "PM" : "AM";
                  setPeriod(p);
                  emitChange(undefined, undefined, p);
                }}
              >
                ▲
              </button>
              <span className="py-1">{period}</span>
              <button
                type="button"
                onClick={() => {
                  const p = period === "AM" ? "PM" : "AM";
                  setPeriod(p);
                  emitChange(undefined, undefined, p);
                }}
              >
                ▼
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTimePicker;
