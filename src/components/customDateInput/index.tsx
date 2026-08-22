import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  name?: string;
  value?: string | null; // YYYY-MM-DD
  onChange?: ((value: string) => void) | ((e: React.ChangeEvent<HTMLInputElement>) => void);
  min?: string;
  max?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
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
  disabled,
}) => {
  const hiddenRef = useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = useState(value || "");

  const selectedValue = value ?? internalValue;

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const formattedValue = useMemo(() => formatDate(selectedValue), [selectedValue]);

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

    if (value === undefined) {
      setInternalValue(date);
    }

    onChange?.(date); // return YYYY-MM-DD
  };

  return (
    <div className="relative">
      {/* Visible Input */}
      <input
        type="text"
        placeholder={placeholder}
        className={className}
        onClick={disabled ? undefined : handleOpen}
        value={formattedValue}
        disabled={disabled}
        readOnly
      />

      {/* Hidden Native Date Input */}
      <input
        ref={hiddenRef}
        type="date"
        value={selectedValue || ""}
        min={min}
        max={max}
        className="absolute inset-0 opacity-0 pointer-events-none"
        onChange={handleChange}
      />
    </div>
  );
};

export default CustomDateInput;
