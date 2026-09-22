import { KeyboardEvent, useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (combined: string) => void;
  disabled?: boolean;
};

const AadhaarSplitInput = ({ value, onChange, disabled }: Props) => {
  const [masked, setMasked] = useState(true);
  const parts = [value.slice(0, 4), value.slice(4, 8), value.slice(8, 12)];
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const setPart = (idx: number, raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    const next = [...parts];
    next[idx] = digits;
    onChange(next.join(""));
    if (digits.length === 4 && idx < 2) refs[idx + 1].current?.focus();
  };

  const handleKeyDown = (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !parts[idx] && idx > 0) refs[idx - 1].current?.focus();
  };

  return (
    <div className="flex items-center gap-1.5">
      {parts.map((part, idx) => (
        <input
          key={idx}
          ref={refs[idx]}
          type={masked ? "password" : "text"}
          className="input-field text-center tracking-widest"
          style={{ width: 64 }}
          maxLength={4}
          placeholder="XXXX"
          value={part}
          disabled={disabled}
          onChange={e => setPart(idx, e.target.value)}
          onKeyDown={e => handleKeyDown(idx, e)}
        />
      ))}
      <button
        type="button"
        onClick={() => setMasked(m => !m)}
        className="text-lg text-gray-500"
        title={masked ? "Show" : "Hide"}
      >
        {masked ? "👁" : "🙈"}
      </button>
    </div>
  );
};

export default AadhaarSplitInput;
