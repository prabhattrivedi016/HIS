import { ChevronDown, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/** a click-to-open popup list (title + clear + scrollable options) instead of a plain <select> —
 * used by any grid-shaped control whose cells pick from a fixed value scale (Vision's acuity
 * cells, Eye Refraction's SPH/CYL/AXIS/Visual Acuity cells). Rendered through a portal rather
 * than a plain absolutely-positioned child, since these cells typically live inside a panel with
 * `overflow-hidden` (for rounded corners against a dark header bar) that would otherwise clip an
 * in-place popup. */
const ComboDropdownCell = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value?: string;
  options: string[];
  onChange: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [menuRect, setMenuRect] = useState<{ top: number; left: number; width: number } | null>(
    null
  );
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement)?.closest?.("[data-combo-dropdown-menu]")
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    const updateRect = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) {
        setMenuRect({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    };
    updateRect();
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className="input-field !mb-0 flex items-center justify-between gap-1 w-full text-left"
      >
        <span className="truncate">{value || ""}</span>
        <ChevronDown size={12} className="text-slate-400 shrink-0" />
      </button>

      {open &&
        menuRect &&
        createPortal(
          <div
            data-combo-dropdown-menu
            className="absolute z-[9999] mt-1 w-36 max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg"
            style={{ top: menuRect.top, left: menuRect.left, width: Math.max(menuRect.width, 144) }}
          >
            <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-slate-100 text-xs font-semibold text-slate-500 sticky top-0 bg-white">
              {label}
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={12} />
              </button>
            </div>
            {options.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`block w-full text-left px-3 py-1.5 text-sm hover:bg-blue-50 ${
                  opt === value ? "bg-blue-50 text-blue-600 font-medium" : "text-slate-700"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
};

export default ComboDropdownCell;
