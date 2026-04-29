import { Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  readonly?: boolean;
}

const CustomDateTimeInput = ({ value, onChange, disabled, readonly }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const now = new Date();
  const defaultDatetime = now.toISOString().slice(0, 16);

  const [datetime, setDatetime] = useState(value || defaultDatetime);

  useEffect(() => {
    if (value) {
      setDatetime(value);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDatetime(newValue);
    onChange?.(newValue);
  };

  const handleOpenPicker = () => {
    if (disabled || readonly) return;

    //  THIS IS KEY
    if (inputRef.current?.showPicker) {
      inputRef.current.showPicker(); // modern browsers
    } else {
      inputRef.current?.focus(); // fallback
    }
  };

  const displayDate = datetime ? new Date(datetime).toLocaleDateString("en-IN") : "";

  const displayTime = datetime
    ? new Date(datetime).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "";

  return (
    <div className="relative w-full">
      {/* hidden native input */}
      <input
        ref={inputRef}
        type="datetime-local"
        value={datetime}
        onChange={handleChange}
        className="absolute opacity-0 pointer-events-none"
      />

      {/* custom UI */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-2 border-gray-300 rounded-lg bg-white hover:border-indigo-400 transition cursor-pointer"
        onClick={handleOpenPicker}
      >
        <div className="flex-1">
          <span className="text-sm font-semibold text-gray-800">
            {displayDate} {displayTime ? `• ${displayTime}` : ""}
          </span>
        </div>
        <Clock size={16} className="text-indigo-500" />
      </div>
    </div>
  );
};

export default CustomDateTimeInput;
