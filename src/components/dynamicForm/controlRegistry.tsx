import TextEditor from "@/components/ckEditor";
import { SelectStyles } from "@/components/customSelect";
import DOMPurify from "dompurify";
import { Check, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";
import { ControlSchema, OptionSchema } from "./types";

export interface ControlRenderProps {
  schema: ControlSchema;
  value: unknown;
  onChange: (value: unknown) => void;
  onBlur?: () => void;
}

const mergeClass = (base: string, schema: ControlSchema) =>
  schema.props?.class ? `${base} ${schema.props.class}` : base;

const TextControl = ({ schema, value, onChange, onBlur }: ControlRenderProps) => (
  <input
    type="text"
    className={mergeClass("input-field", schema)}
    placeholder={schema.props?.placeholder as string}
    required={schema.props?.required}
    maxLength={schema.props?.maxlength ? Number(schema.props.maxlength) : undefined}
    value={(value as string) ?? ""}
    onChange={e => onChange(e.target.value)}
    onBlur={onBlur}
  />
);

const TextareaControl = ({ schema, value, onChange, onBlur }: ControlRenderProps) => (
  <textarea
    className={mergeClass("input-field resize-y min-h-[38px]", schema)}
    rows={1}
    placeholder={(schema.props?.placeholder as string) || "Type here…"}
    required={schema.props?.required}
    value={(value as string) ?? ""}
    onChange={e => onChange(e.target.value)}
    onBlur={onBlur}
  />
);

const NumberControl = ({ schema, value, onChange, onBlur }: ControlRenderProps) => (
  <input
    type="number"
    className={mergeClass("input-field", schema)}
    placeholder={schema.props?.placeholder as string}
    required={schema.props?.required}
    maxLength={schema.props?.maxlength ? Number(schema.props.maxlength) : undefined}
    value={(value as string) ?? ""}
    onChange={e => onChange(e.target.value)}
    onBlur={onBlur}
  />
);

const DateControl = ({ schema, value, onChange, onBlur }: ControlRenderProps) => (
  <input
    type="date"
    className={mergeClass("input-field", schema)}
    required={schema.props?.required}
    value={(value as string) ?? ""}
    onChange={e => onChange(e.target.value)}
    onBlur={onBlur}
  />
);

const CurrencyControl = ({ schema, value, onChange, onBlur }: ControlRenderProps) => (
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
    <input
      type="number"
      className={mergeClass("input-field pl-6", schema)}
      placeholder={schema.props?.placeholder as string}
      required={schema.props?.required}
      value={(value as string) ?? ""}
      onChange={e => onChange(e.target.value)}
      onBlur={onBlur}
    />
  </div>
);

const SwitchControl = ({ schema, value, onChange, onBlur }: ControlRenderProps) => (
  <label className="flex items-center gap-2 cursor-pointer select-none h-10">
    <input
      type="checkbox"
      className={mergeClass("input-checkbox", schema)}
      checked={value === true || value === "true"}
      onChange={e => onChange(e.target.checked ? "true" : "false")}
      onBlur={onBlur}
    />
  </label>
);

const DropdownControl = ({ schema, value, onChange, onBlur }: ControlRenderProps) => (
  <select
    className={mergeClass("input-field", schema)}
    required={schema.props?.required}
    value={(value as string) ?? ""}
    onChange={e => onChange(e.target.value)}
    onBlur={onBlur}
  >
    <option value="">-- Select --</option>
    {schema.options?.map((opt, i) => (
      <option key={opt.key ?? i} value={opt.value as string}>
        {opt.label}
      </option>
    ))}
  </select>
);

const SearchDropdownControl = ({ schema, value, onChange, onBlur }: ControlRenderProps) => {
  const options = (schema.options ?? []).map(opt => ({
    label: opt.label,
    value: opt.value as string | number,
  }));
  const selected = options.find(opt => opt.value === value) ?? null;

  return (
    <Select
      value={selected}
      options={options}
      placeholder={schema.props?.placeholder as string}
      isSearchable
      isClearable
      onChange={opt => onChange((opt as { value: unknown } | null)?.value ?? null)}
      onBlur={onBlur}
      styles={SelectStyles}
      menuPortalTarget={document.body}
      menuPosition="fixed"
      className={schema.props?.class as string}
    />
  );
};

const RadioControl = ({ schema, value, onChange }: ControlRenderProps) => (
  <div className={mergeClass("flex flex-wrap gap-2", schema)}>
    {schema.options?.map((opt, i) => {
      const selected = value === opt.value;
      return (
        <button
          key={opt.key ?? i}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-all active:scale-95 ${
            selected
              ? "bg-blue-500 border-blue-500 text-white shadow-sm"
              : "bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
          }`}
        >
          {selected && <Check size={13} />}
          {opt.label}
        </button>
      );
    })}
  </div>
);

const MultiSelectSearchControl = ({ schema, value, onChange, onBlur }: ControlRenderProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OptionSchema[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [menuRect, setMenuRect] = useState<{ top: number; left: number; width: number } | null>(
    null
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const asyncSearchRef = useRef(schema.asyncSearch);
  asyncSearchRef.current = schema.asyncSearch;

  const selected: OptionSchema[] = Array.isArray(value) ? (value as OptionSchema[]) : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement)?.closest?.("[data-multiselect-search-menu]")
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useLayoutEffect(() => {
    if (!showDropdown) return;

    const updateRect = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setMenuRect({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
      }
    };

    updateRect();
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [showDropdown]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2 || !asyncSearchRef.current) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const options = await asyncSearchRef.current!(q);
        if (cancelled) return;
        setResults(options ?? []);
        setShowDropdown(true);
      } catch {
        if (!cancelled) {
          setResults([]);
          setShowDropdown(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const handleSelect = (opt: OptionSchema) => {
    if (!selected.some(s => s.value === opt.value)) {
      onChange([...selected, opt]);
    }
    setQuery("");
    setResults([]);
    setShowDropdown(false);
  };

  const handleRemove = (val: unknown) => {
    onChange(selected.filter(s => s.value !== val));
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        className={mergeClass("input-field !mb-0", schema)}
        placeholder={(schema.props?.placeholder as string) || "Search…"}
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setShowDropdown(true)}
        onBlur={onBlur}
      />

      {(showDropdown || loading) &&
        menuRect &&
        createPortal(
          <div
            data-multiselect-search-menu
            className="absolute z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto"
            style={{ top: menuRect.top, left: menuRect.left, width: menuRect.width }}
          >
            {loading ? (
              <div className="px-3 py-2 text-sm text-gray-500">Searching…</div>
            ) : results.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-400">No results found</div>
            ) : (
              results.map((opt, i) => (
                <button
                  key={`${opt.value}-${i}`}
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => handleSelect(opt)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>,
          document.body
        )}

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.map((opt, i) => (
            <span
              key={`${opt.value}-${i}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded-full pl-2.5 pr-1.5 py-1"
            >
              {opt.label}
              <button
                type="button"
                onClick={() => handleRemove(opt.value)}
                className="text-blue-400 hover:text-blue-700"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const RichTextControl = ({ value, onChange }: ControlRenderProps) => (
  <TextEditor value={(value as string) ?? ""} onChange={onChange} />
);

const DynamicContentControl = ({ schema }: ControlRenderProps) => (
  <div
    className={mergeClass("text-sm text-gray-700", schema)}
    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(schema.value ?? "") }}
  />
);

export const CONTROL_REGISTRY: Record<string, React.FC<ControlRenderProps>> = {
  text: TextControl,
  textarea: TextareaControl,
  number: NumberControl,
  number2: NumberControl,
  date: DateControl,
  currency: CurrencyControl,
  switch: SwitchControl,
  dropdown: DropdownControl,
  "search-dropdown": SearchDropdownControl,
  radio: RadioControl,
  richtext: RichTextControl,
  dynamicContent: DynamicContentControl,
  "multiselect-search": MultiSelectSearchControl,
};

export const DEFAULT_CONTROL = TextControl;
