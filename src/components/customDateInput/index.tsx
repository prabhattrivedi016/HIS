import React, { useMemo, useRef } from "react";

type Props = {
  value?: string; // YYYY-MM-DD
  onChange?: (value: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  className?: string;
};

const formatDate = (date?: string) => {
  if (!date) return "";
  const [y, m, d] = date.split("-");
  if (!y || !m || !d) return "";
  return `${d}/${m}/${y}`;
};

const CustomDateInput: React.FC<Props> = ({
  value,
  onChange,
  min,
  max,
  placeholder = "DD/MM/YYYY",
  className = "input-field",
}) => {
  const hiddenRef = useRef<HTMLInputElement>(null);

  const formattedValue = useMemo(() => formatDate(value), [value]);

  //  MUST be called directly inside click (user gesture)
  const handleOpen = () => {
    if (hiddenRef.current) {
      try {
        hiddenRef.current.showPicker?.();
      } catch {
        // fallback for unsupported browsers
        hiddenRef.current.click();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    if (!date) return;

    onChange?.(date); // return YYYY-MM-DD
  };

  return (
    <div className="relative">
      {/* Visible Input */}
      <input
        type="text"
        placeholder={placeholder}
        className={className}
        onClick={handleOpen}
        value={formattedValue}
        readOnly
      />

      {/* Hidden Native Date Input */}
      <input
        ref={hiddenRef}
        type="date"
        value={value || ""}
        min={min}
        max={max}
        className="absolute inset-0 opacity-0 pointer-events-none"
        onChange={handleChange}
      />
    </div>
  );
};

export default CustomDateInput;
