import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const CustomSelect = ({ value, onChange, options, placeholder }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const safeOptions = Array.isArray(options) ? options : [];
  const selectedLabel = safeOptions.find(o => o.value == value)?.label || placeholder;

  return (
    <div className="relative w-full font-sans text-base" ref={ref}>
      {/* Select box exactly like native */}
      <div
        onClick={() => setOpen(!open)}
        className="
          border border-gray-500 bg-white
          rounded-md
          px-3 h-[38px] 
          flex items-center justify-between 
          cursor-pointer
        "
      >
        <span className="text-gray-900 text-md">{selectedLabel}</span>

        {/* Arrow */}
        <div className="pointer-events-none pr-1 flex items-center">
          <ChevronDown size={16} strokeWidth={1.75} className="text-gray-700" />
        </div>
      </div>

      {/* Dropdown list */}
      {open && (
        <div
          className="
            absolute left-0 top-full mt-[1px] w-full
            bg-white border border-[#c0c0c0]
            rounded-b-md  
            rounded-t-sm 
            max-h-60 overflow-auto z-50
          "
          style={{
            boxShadow: "0 0 2px rgba(0,0,0,0.15)",
          }}
        >
          {safeOptions.map(opt => (
            <div
              key={opt.value}
              onClick={() => {
                onChange({ target: { value: opt.value } });
                setOpen(false);
              }}
              className="
                px-3 py-2 text-md cursor-pointer
                hover:bg-[#0066ff] hover:text-white
              "
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
