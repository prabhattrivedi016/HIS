import TextEditor from "@/components/ckEditor";
import { SelectStyles } from "@/components/customSelect";
import { useDoctorFavourites } from "@/hooks/useDoctorFavourites";
import ReportAnnotatorModal from "@/screens/doctorConsultationNew/components/ReportAnnotatorModal";
import { useVisitReportsStore, VisitReportDocument } from "@/store/useVisitReportsStore";
import { showWarning } from "@/utils/alert";
import { useQueryClient } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { motion } from "framer-motion";
import {
  BookmarkCheck,
  Check,
  Eye,
  History,
  Layers,
  Pencil,
  Plus,
  Search as SearchIcon,
  Settings,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";
import AddMasterEntryDrawer from "./AddMasterEntryDrawer";
import ComparisonGridControl from "./ComparisonGridControl";
import DentalChartControl from "./DentalChartControl";
import GonioscopyControl from "./GonioscopyControl";
import MedicineListControl from "./MedicineListControl";
import CompactFormGroupControl from "./CompactFormGroupControl";
import EyeRefractionControl from "./EyeRefractionControl";
import FrameDetailsControl from "./FrameDetailsControl";
import IntraOcularPressureControl from "./IntraOcularPressureControl";
import MultiLevelInputGridControl from "./MultiLevelInputGridControl";
import OpticNerveExaminationControl from "./OpticNerveExaminationControl";
import OrderSetDrawer from "./OrderSetDrawer";
import TreatmentObjectivesControl from "./TreatmentObjectivesControl";
import VisionControl from "./VisionControl";
import RadioScoreGroupControl from "./RadioScoreGroupControl";
import { TableFieldInput } from "./TableFieldInput";
import { ControlSchema, OptionSchema } from "./types";

export interface ControlRenderProps {
  schema: ControlSchema;
  value: unknown | string;
  onChange: (value: unknown) => void;
  onBlur?: () => void;
  rows?: number;
  isMulti?: boolean;
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

const FavouriteTextBar = ({
  schema,
  value,
  onChange,
  isHtml,
}: {
  schema: ControlSchema;
  value: unknown;
  onChange: (value: unknown) => void;
  isHtml?: boolean;
}) => {
  const headerId = Number(schema.key.replace(/^header_/, "")) || undefined;
  const { favorites, setFavorite } = useDoctorFavourites(schema.doctorId, headerId);
  const [showFavorites, setShowFavorites] = useState(true);
  // the favourite currently being edited — re-saving updates this one in place instead of
  // piling up a new favourite for every revision; cleared once the field is emptied out
  const [activeFavouriteId, setActiveFavouriteId] = useState<unknown>(null);
  const currentText = typeof value === "string" ? value : "";
  const stripHtml = (html: string) =>
    html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  useEffect(() => {
    if (!currentText.trim()) setActiveFavouriteId(null);
  }, [currentText]);

  const handleSaveFavourite = () => {
    const trimmed = currentText.trim();
    if (!trimmed) return;

    const activeEntry = favorites.find(f => f.__recordId === activeFavouriteId);
    if (activeEntry) {
      // update the favourite this text came from instead of adding another one
      setFavorite(activeEntry, false, activeEntry.__recordId);
      setFavorite({ text: currentText }, true, activeEntry.__recordId);
      return;
    }

    const isDuplicate = favorites.some(entry => String(entry.text ?? "").trim() === trimmed);
    if (isDuplicate) {
      showWarning("This text is already added to favourites");
      return;
    }
    const newId = Date.now();
    setFavorite({ text: currentText }, true, newId);
    setActiveFavouriteId(newId);
  };

  const handleUseFavourite = (entry: Record<string, unknown>) => {
    const favText = String(entry.text ?? "");
    if (!favText) return;
    const plainFavText = isHtml ? stripHtml(favText) : favText;
    if (plainFavText && (isHtml ? stripHtml(currentText) : currentText).includes(plainFavText)) {
      showWarning("This text is already in the note");
      return;
    }
    const next = currentText.trim()
      ? isHtml
        ? `${currentText}${favText}`
        : `${currentText}\n${favText}`
      : favText;
    onChange(next);
    setActiveFavouriteId(entry.__recordId);
  };

  const handleRemoveFavourite = (entry: Record<string, unknown>) => {
    setFavorite(entry, false, entry.__recordId);
    if (entry.__recordId === activeFavouriteId) setActiveFavouriteId(null);
  };

  if (!schema.doctorId) return null;

  return (
    <div className="mb-1.5">
      {/* toolbar — same circular icon-button style as the "table" control's favourites toggle */}
      <div className="flex items-center justify-end gap-1.5">
        <button
          type="button"
          onClick={handleSaveFavourite}
          title="Save current text as a favourite"
          disabled={!currentText.trim()}
          className="flex items-center justify-center w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Plus size={14} />
        </button>

        <button
          type="button"
          onClick={() => setShowFavorites(v => !v)}
          title={showFavorites ? "Hide favourites" : "Show favourites"}
          className={`flex items-center justify-center w-7 h-7 rounded-full border transition-colors ${
            showFavorites
              ? "bg-amber-50 border-amber-200 text-amber-500"
              : "bg-white border-slate-200 text-slate-500 hover:text-amber-500 hover:border-amber-200"
          }`}
        >
          <Star size={13} className={showFavorites ? "fill-amber-400" : ""} />
        </button>
      </div>

      {/* favourites bar — same pill-chip layout/colors as the "table" control's favourites bar */}
      {showFavorites && (
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto px-3 py-2 mt-1.5 rounded-lg border border-slate-100 bg-amber-50/30">
          {favorites.length === 0 ? (
            <span className="text-[12px] text-slate-400">No favourites saved yet</span>
          ) : (
            favorites.map((entry, idx) => {
              const text = String(entry.text ?? "");
              const preview = isHtml ? stripHtml(text) : text;
              const label = preview.length > 40 ? `${preview.slice(0, 40)}…` : preview;
              return (
                <span
                  key={idx}
                  title={preview}
                  className="flex items-center gap-1.5 shrink-0 whitespace-nowrap bg-blue-50 border border-blue-200 text-blue-700 text-[12px] font-medium rounded-full pl-1 pr-1.5 py-1"
                >
                  <button
                    type="button"
                    onClick={() => handleUseFavourite(entry)}
                    className="flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full hover:bg-blue-100"
                  >
                    <Plus size={11} />
                    {label}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveFavourite(entry)}
                    className="flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:text-blue-700 hover:bg-blue-100"
                  >
                    <X size={11} />
                  </button>
                </span>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

const TextareaControl = ({ schema, value, onChange, onBlur, rows }: ControlRenderProps) => {
  const isLarge = schema.textLarge ?? false;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isLarge) return;
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value, isLarge]);

  return (
    <div>
      {schema.textFavouritesEnabled && (
        <FavouriteTextBar schema={schema} value={value} onChange={onChange} />
      )}
      <textarea
        ref={textareaRef}
        className={mergeClass(
          isLarge
            ? "input-field min-h-[160px] overflow-hidden !text-base"
            : "input-field resize-y min-h-[38px]",
          schema
        )}
        rows={rows ?? (isLarge ? 6 : 1)}
        placeholder={(schema.props?.placeholder as string) || "Type here…"}
        required={schema.props?.required}
        value={(value as string) ?? ""}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
      />
    </div>
  );
};

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

const SearchDropdownControl = ({
  schema,
  value,
  onChange,
  onBlur,
  isMulti,
}: ControlRenderProps) => {
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
      isMulti={isMulti}
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

// "EmojiScore" — each option carries an image (a data: URL, e.g. a Wong-Baker pain-face scale
// icon) plus a numeric score alongside its label, sourced from GET_DOCTOR_HEARDER_LOVS'
// base64Data/score fields
const EmojiScoreControl = ({ schema, value, onChange }: ControlRenderProps) => (
  <div className={mergeClass("flex flex-wrap gap-2", schema)}>
    {schema.options?.map((opt, i) => {
      const selected = value === opt.value;
      return (
        <button
          key={opt.key ?? i}
          type="button"
          onClick={() => onChange(opt.value)}
          title={opt.label}
          className={`flex flex-col items-center gap-1 w-20 px-2 py-2 rounded-lg border transition-all active:scale-95 ${
            selected
              ? "bg-blue-50 border-blue-400 shadow-sm"
              : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50"
          }`}
        >
          {opt.imageUrl ? (
            <img src={opt.imageUrl} alt={opt.label} className="w-12 h-12 object-contain" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-100" />
          )}
          <span className="text-[11px] font-medium text-gray-700 text-center leading-tight truncate w-full">
            {opt.label}
          </span>
          {opt.score !== undefined && (
            <span className="text-[10px] font-semibold text-blue-500">{opt.score}</span>
          )}
        </button>
      );
    })}
  </div>
);

// "Dental Treatment Type" — each option carries an image + a short description alongside its
// label, sourced from GET_DOCTOR_HEARDER_LOVS' base64Data/Description fields (set via Header
// Master's "Image, Value & Description" LOV editor for this control type). Single-select,
// toggle-off on reclick.
const DentalTreatmentTypeControl = ({ schema, value, onChange }: ControlRenderProps) => (
  <div className={mergeClass("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3", schema)}>
    {schema.options?.map((opt, i) => {
      const selected = value === opt.value;
      return (
        <button
          key={opt.key ?? i}
          type="button"
          onClick={() => onChange(selected ? undefined : opt.value)}
          className={`flex items-start gap-3 text-left rounded-xl border p-4 transition-colors ${
            selected
              ? "border-blue-500 bg-blue-50 ring-1 ring-blue-200"
              : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50"
          }`}
        >
          {opt.imageUrl ? (
            <img
              src={opt.imageUrl}
              alt={opt.label}
              className="w-10 h-10 rounded-lg object-cover shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0" />
          )}
          <span>
            <p className="text-sm font-bold text-gray-700">{opt.label}</p>
            {opt.description && (
              <p className="text-[11px] text-gray-400 mt-0.5">{opt.description}</p>
            )}
          </span>
        </button>
      );
    })}
  </div>
);

// multiple selectable options driven by the header's own List Of Values — distinct from
// SwitchControl (a single on/off toggle) and from RadioControl (single-select)
const CheckboxListControl = ({ schema, value, onChange }: ControlRenderProps) => {
  const selected: string[] = Array.isArray(value) ? (value as string[]) : [];

  const toggleOption = (optValue: string) => {
    onChange(
      selected.includes(optValue) ? selected.filter(v => v !== optValue) : [...selected, optValue]
    );
  };

  return (
    <div className={mergeClass("flex flex-wrap gap-x-4 gap-y-2", schema)}>
      {schema.options?.map((opt, i) => {
        const optValue = String(opt.value);
        return (
          <label
            key={opt.key ?? i}
            className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer select-none"
          >
            <input
              type="checkbox"
              className="input-checkbox"
              checked={selected.includes(optValue)}
              onChange={() => toggleOption(optValue)}
            />
            {opt.label}
          </label>
        );
      })}
    </div>
  );
};

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

const TableControl = ({ schema, value, onChange }: ControlRenderProps) => {
  const columns = schema.columns ?? [];
  const rows: Record<string, unknown>[] = Array.isArray(value) ? (value as any) : [];
  const containerRef = useRef<HTMLDivElement>(null);
  const focusRowIndexRef = useRef<number | null>(null);
  const headerId = Number(schema.key.replace(/^header_/, "")) || undefined;
  const queryClient = useQueryClient();

  const [searchText, setSearchText] = useState("");
  const [showFavorites, setShowFavorites] = useState(true);
  const [recentFirst, setRecentFirst] = useState(false);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [orderSetMode, setOrderSetMode] = useState<"all" | "favourites" | null>(null);
  // existing rows render read-only (plain text) until hovered/focused, so a long table of
  // already-filled rows doesn't look like a wall of active inputs — a row just added always
  // starts editable (forceEditableRowIndex) since there's nothing to "read" yet
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null);
  const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);
  const [forceEditableRowIndex, setForceEditableRowIndex] = useState<number | null>(null);
  const favouritesEnabled = schema.favouritesEnabled !== false;
  const { favorites: doctorFavorites, setFavorite: setDoctorFavorite } = useDoctorFavourites(
    favouritesEnabled ? schema.doctorId : undefined,
    headerId
  );

  useEffect(() => {
    if (focusRowIndexRef.current === null) return;
    const rowIndex = focusRowIndexRef.current;
    focusRowIndexRef.current = null;
    containerRef.current
      ?.querySelector<HTMLElement>(
        `tr[data-row-index="${rowIndex}"] input, tr[data-row-index="${rowIndex}"] select`
      )
      ?.focus();
    setForceEditableRowIndex(null);
  }, [rows.length]);

  const handleCellChange = (rowIndex: number, columnKey: string, cellValue: unknown) => {
    // dropdown options may carry a backend id in `key` (e.g. ComplaintId) — stash it
    // alongside the picked value so it can be used to update the right master record later
    const matchedOption = columns
      .find(col => col.key === columnKey)
      ?.options?.find(opt => opt.value === cellValue);
    const idKey = `__${columnKey}Id`;

    const nextRows = rows.map((row, idx) => {
      if (idx !== rowIndex) return row;
      const updated = { ...row, [columnKey]: cellValue };
      if (matchedOption?.key) updated[idKey] = matchedOption.key;
      else delete updated[idKey];
      return updated;
    });
    onChange(nextRows);
  };

  // the record id (e.g. complaintId) can live either directly under masterEntryConfig.idField
  // (rows added via the "Add entry" drawer) or under `__<nameColumnKey>Id` (rows where the
  // name column's dropdown was picked inline — see handleCellChange)
  const resolveRecordId = (row: Record<string, unknown>) => {
    if (!schema.masterEntryConfig) return undefined;
    const direct = row[schema.masterEntryConfig.idField];
    if (direct !== undefined) return direct;
    const nameColKey = columns[0]?.key;
    return nameColKey ? row[`__${nameColKey}Id`] : undefined;
  };

  // duplicate check against the name column (e.g. "Complaints") only — Duration/Severity etc.
  // can legitimately differ between two entries of the same name, so only the name matters here
  const nameColumnKey = columns[0]?.key;
  const isDuplicateName = (value: unknown) => {
    if (!nameColumnKey) return false;
    const candidate = String(value ?? "")
      .trim()
      .toLowerCase();
    if (!candidate) return false;
    return rows.some(
      row =>
        String(row[nameColumnKey] ?? "")
          .trim()
          .toLowerCase() === candidate
    );
  };

  // same-name check against the doctor's existing favourites (not just the current rows) so a
  // second row with the same name can't be favourited as a duplicate entry
  const isDuplicateFavorite = (value: unknown) => {
    if (!nameColumnKey) return false;
    const candidate = String(value ?? "")
      .trim()
      .toLowerCase();
    if (!candidate) return false;
    return doctorFavorites.some(
      f =>
        String(f[nameColumnKey] ?? "")
          .trim()
          .toLowerCase() === candidate
    );
  };

  const handleAddRow = () => {
    focusRowIndexRef.current = rows.length;
    setForceEditableRowIndex(rows.length);
    onChange([...rows, {}]);
  };
  const handleRemoveRow = (rowIndex: number) => onChange(rows.filter((_, idx) => idx !== rowIndex));
  const handleToggleFavorite = (rowIndex: number) => {
    const row = rows[rowIndex];
    const isFavoriting = !row.__favorite;

    if (isFavoriting && isDuplicateFavorite(row[nameColumnKey ?? ""])) {
      showWarning(`${columns[0]?.label ?? "This entry"} is already in favourites`);
      return;
    }

    onChange(rows.map((r, idx) => (idx === rowIndex ? { ...r, __favorite: isFavoriting } : r)));

    const entry: Record<string, unknown> = {};
    Object.keys(row).forEach(key => {
      if (key !== "__favorite") entry[key] = row[key];
    });
    setDoctorFavorite(entry, isFavoriting, resolveRecordId(row));
  };
  const handleAddFromFavorite = (favoriteRow: Record<string, unknown>) => {
    if (isDuplicateName(favoriteRow[nameColumnKey ?? ""])) {
      showWarning(`${columns[0]?.label ?? "This entry"} is already added`);
      return;
    }
    // __recordId is favourites-list bookkeeping (see useDoctorFavourites) — strip it so it
    // doesn't leak into the row and get re-saved if this row is favourited again later
    const row: Record<string, unknown> = {};
    Object.keys(favoriteRow).forEach(key => {
      if (key !== "__recordId") row[key] = favoriteRow[key];
    });
    focusRowIndexRef.current = rows.length;
    setForceEditableRowIndex(rows.length);
    onChange([...rows, row]);
  };
  const handleRemoveDoctorFavorite = (entry: Record<string, unknown>) =>
    setDoctorFavorite(entry, false, entry.__recordId);

  const handleSaveFromDrawer = (entry: Record<string, unknown>) => {
    if (isDuplicateName(entry[nameColumnKey ?? ""])) {
      showWarning(`${columns[0]?.label ?? "This entry"} is already added`);
      return;
    }
    onChange([...rows, entry]);
  };
  const handleApplyOrderSet = (newRows: Record<string, unknown>[]) => {
    const seen = new Set<string>();
    const toAdd = newRows.filter(row => {
      const value = String(row[nameColumnKey ?? ""] ?? "")
        .trim()
        .toLowerCase();
      if (!value || isDuplicateName(value) || seen.has(value)) return false;
      seen.add(value);
      return true;
    });

    if (toAdd.length < newRows.length) {
      showWarning("Some items were already in the list and were skipped");
    }
    if (toAdd.length > 0) onChange([...rows, ...toAdd]);
  };

  const handleCellKeyDown = (rowIndex: number) => (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key !== "Enter" || e.currentTarget.tagName === "TEXTAREA") return;
    e.preventDefault();
    if (rowIndex === rows.length - 1) handleAddRow();
  };

  const indexedRows = rows.map((row, originalIndex) => ({ row, originalIndex }));
  const query = searchText.trim().toLowerCase();
  const displayRows = indexedRows.filter(
    ({ row }) =>
      !query ||
      columns.some(col =>
        String(row[col.key] ?? "")
          .toLowerCase()
          .includes(query)
      )
  );
  if (recentFirst) displayRows.reverse();

  if (columns.length === 0) {
    return <p className="text-sm text-gray-400">No columns configured</p>;
  }

  return (
    <div
      ref={containerRef}
      className={mergeClass(
        "rounded-xl border border-slate-200 bg-white/55 overflow-hidden",
        schema
      )}
    >
      {/* toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 gap-y-2 px-3 py-2.5 bg-gradient-to-r from-slate-100 via-slate-50 to-white border-b border-slate-200">
        <button
          type="button"
          onClick={() => (schema.masterEntryConfig ? setIsAddDrawerOpen(true) : handleAddRow())}
          title={schema.masterEntryConfig ? "Add entry (search SNOMED)" : "Add row"}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-600 text-white shadow-sm hover:bg-slate-700 active:scale-95 transition-all shrink-0"
        >
          <Plus size={15} />
        </button>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={handleAddRow}
            title="Add a blank row to fill in directly"
            className="flex items-center justify-center w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
          >
            <Plus size={14} />
          </button>

          <div className="relative">
            <SearchIcon
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="Search Favourite"
              className="w-40 sm:w-52 bg-white border border-slate-200 rounded-full pl-7 pr-2.5 py-1.5 text-[12px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setSearchText("");
              setRecentFirst(false);
            }}
            title="Reset filters"
            className="flex items-center justify-center w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
          >
            <Settings size={13} />
          </button>

          {favouritesEnabled && (
            <button
              type="button"
              onClick={() => setShowFavorites(v => !v)}
              title={showFavorites ? "Hide favourites" : "Show favourites"}
              className={`flex items-center justify-center w-7 h-7 rounded-full border transition-colors ${
                showFavorites
                  ? "bg-amber-50 border-amber-200 text-amber-500"
                  : "bg-white border-slate-200 text-slate-500 hover:text-amber-500 hover:border-amber-200"
              }`}
            >
              <Star size={13} className={showFavorites ? "fill-amber-400" : ""} />
            </button>
          )}

          <button
            type="button"
            onClick={() => setRecentFirst(v => !v)}
            title={recentFirst ? "Show default order" : "Show most recent first"}
            className={`flex items-center justify-center w-7 h-7 rounded-full border transition-colors ${
              recentFirst
                ? "bg-blue-50 border-blue-200 text-blue-500"
                : "bg-white border-slate-200 text-slate-500 hover:text-blue-500 hover:border-blue-200"
            }`}
          >
            <History size={13} />
          </button>

          {schema.orderSetConfig && (
            <>
              <button
                type="button"
                onClick={() => setOrderSetMode("all")}
                title="Order set"
                className="flex items-center justify-center w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-indigo-500 hover:border-indigo-200 transition-colors"
              >
                <Layers size={13} />
              </button>
              <button
                type="button"
                onClick={() => setOrderSetMode("favourites")}
                title="Favourite order set"
                className="flex items-center justify-center w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-indigo-500 hover:border-indigo-200 transition-colors"
              >
                <BookmarkCheck size={13} />
              </button>
            </>
          )}
        </div>
      </div>

      {favouritesEnabled && showFavorites && (
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto px-3 py-2 border-b border-slate-100 bg-amber-50/30">
          {doctorFavorites.length === 0 ? (
            <span className="text-[12px] text-slate-400">No favourites saved yet</span>
          ) : (
            doctorFavorites.map((entry, idx) => {
              const label = columns
                .map(col => entry[col.key])
                .find(v => v !== undefined && v !== null && String(v).trim() !== "");
              return (
                <span
                  key={idx}
                  className="flex items-center gap-1.5 shrink-0 whitespace-nowrap bg-blue-50 border border-blue-200 text-blue-700 text-[12px] font-medium rounded-full pl-1 pr-1.5 py-1"
                >
                  <button
                    type="button"
                    onClick={() => handleAddFromFavorite(entry)}
                    title="Add as new row"
                    className="flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full hover:bg-blue-100"
                  >
                    <Plus size={11} />
                    {String(label ?? `Favourite ${idx + 1}`)}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveDoctorFavorite(entry)}
                    title="Remove from favourites"
                    className="flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:text-blue-700 hover:bg-blue-100"
                  >
                    <X size={11} />
                  </button>
                </span>
              );
            })
          )}
        </div>
      )}

      <div className="table-scroll-wrapper shadow-none border-0 rounded-none [&_.table-head]:!bg-white [&_.table-head]:!border-slate-200 [&_.table-row]:hover:!bg-transparent">
        <table className="base-table table-size">
          <thead className="table-head">
            <tr>
              {columns.map(col => (
                <th key={col.key} className="table-th">
                  {col.label}
                </th>
              ))}
              <th className="table-th w-16 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map(({ row, originalIndex }) => {
              const isEditable =
                originalIndex === hoveredRowIndex ||
                originalIndex === focusedRowIndex ||
                originalIndex === forceEditableRowIndex;

              return (
                <tr
                  key={originalIndex}
                  data-row-index={originalIndex}
                  className={`table-row ${isEditable ? "bg-blue-50/40" : ""}`}
                  onMouseEnter={() => setHoveredRowIndex(originalIndex)}
                  onMouseLeave={() =>
                    setHoveredRowIndex(prev => (prev === originalIndex ? null : prev))
                  }
                  onFocus={() => setFocusedRowIndex(originalIndex)}
                  onBlur={e => {
                    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                    setFocusedRowIndex(prev => (prev === originalIndex ? null : prev));
                  }}
                >
                  {columns.map(col =>
                    isEditable ? (
                      <td key={col.key} className="table-td">
                        <TableFieldInput
                          column={col}
                          value={row[col.key]}
                          onChange={v => handleCellChange(originalIndex, col.key, v)}
                          onKeyDown={handleCellKeyDown(originalIndex)}
                        />
                      </td>
                    ) : (
                      <td key={col.key} className="table-td text-gray-700">
                        {String(row[col.key] ?? "").trim() || "—"}
                      </td>
                    )
                  )}
                  <td className="table-td table-action">
                    <div className="flex items-center justify-center gap-2">
                      {favouritesEnabled && (
                        <button type="button" onClick={() => handleToggleFavorite(originalIndex)}>
                          <Star
                            size={14}
                            className={
                              row.__favorite
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-300 hover:text-amber-400"
                            }
                          />
                        </button>
                      )}
                      <button type="button" onClick={() => handleRemoveRow(originalIndex)}>
                        <Trash2 size={14} className="text-gray-400 hover:text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {displayRows.length === 0 && (
              <tr>
                <td className="table-empty" colSpan={columns.length + 1}>
                  {rows.length === 0 ? "No rows added" : "No matching rows"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {schema.masterEntryConfig && (
        <AddMasterEntryDrawer
          isOpen={isAddDrawerOpen}
          onClose={() => {
            setIsAddDrawerOpen(false);
            if (headerId)
              queryClient.invalidateQueries({ queryKey: ["emrHeaderTableColumns", headerId] });
          }}
          title={`Add ${schema.label ?? "Entry"}`}
          nameLabel={columns[0]?.label ?? "Name"}
          nameKey={columns[0]?.key ?? "name"}
          extraColumns={[]}
          masterEntryConfig={schema.masterEntryConfig}
          onSave={handleSaveFromDrawer}
        />
      )}

      {schema.orderSetConfig && (
        <OrderSetDrawer
          isOpen={orderSetMode !== null}
          onClose={() => setOrderSetMode(null)}
          title={`${schema.label ?? "Entry"} Order Sets`}
          nameKey={columns[0]?.key ?? "name"}
          doctorId={schema.doctorId}
          initialFavouritesOnly={orderSetMode === "favourites"}
          config={schema.orderSetConfig}
          onApply={handleApplyOrderSet}
        />
      )}
    </div>
  );
};

const RichTextControl = ({ schema, value, onChange }: ControlRenderProps) => (
  <div>
    {schema.textFavouritesEnabled && (
      <FavouriteTextBar schema={schema} value={value} onChange={onChange} isHtml />
    )}
    <TextEditor value={(value as string) ?? ""} onChange={onChange} />
  </div>
);
//Control TypeId -- 20 case start-------------------------------------------------------------------
const ImageUploadControl = ({ schema, value, onChange }: ControlRenderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const headerId = Number(schema.key.replace(/^header_/, "")) || undefined;
  const { patientId, visitId } = schema;

  const setHeaderReports = useVisitReportsStore(state => state.setHeaderReports);
  // select the raw (referentially stable) array and filter it in the render body — filtering
  // inside the selector itself would hand useSyncExternalStore a new array on every call and
  // trip React's "getSnapshot should be cached" infinite-loop guard
  const allReports = useVisitReportsStore(state => state.reports);
  const reports = useMemo(
    () =>
      allReports.filter(
        r => r.patientId === patientId && r.visitId === visitId && r.headerId === headerId
      ),
    [allReports, patientId, visitId, headerId]
  );

  // one-time: seed the live editing store from this header's saved value (the last-saved-to-
  // backend state) instead of only ever re-seeding fresh copies of the header's shared template
  // images — `justSeededRef` tells the sync effect below to skip its very next run, since this
  // seed's Zustand update hasn't propagated back into `reports` yet on this same render pass
  const hasInitializedRef = useRef(false);
  const justSeededRef = useRef(false);
  const lastSyncedRef = useRef("");
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    if (patientId == null || visitId == null || !headerId) return;
    const hydrated = Array.isArray(value) ? (value as VisitReportDocument[]) : [];
    if (hydrated.length === 0) return;
    // this control remounts fresh (hasInitializedRef resets) every time it's unmounted and shown
    // again — e.g. switching the EMR Sections panel to a Template and back. Without this check,
    // every such remount re-persists the same base64 image data to localStorage again, which is
    // how a full day of tab-switching can run into that store's quota. Skip the write entirely
    // when this header's current store contents already match what we're about to seed.
    if (JSON.stringify(reports) === JSON.stringify(hydrated)) return;
    justSeededRef.current = true;
    lastSyncedRef.current = JSON.stringify(hydrated);
    setHeaderReports(patientId, visitId, headerId, hydrated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, patientId, visitId, headerId, setHeaderReports]);

  // ongoing: whenever the live editing store's reports for this header change (upload, delete,
  // draw + save), push them into the dynamic form's own data so this header's images ride along
  // in the normal save payload (consultationHeadersData) exactly like every other control's
  // value — no separate endpoint for this control type
  useEffect(() => {
    if (justSeededRef.current) {
      justSeededRef.current = false;
      return;
    }
    const serialized = JSON.stringify(reports);
    if (serialized === lastSyncedRef.current) return;
    lastSyncedRef.current = serialized;
    onChange(reports);
  }, [reports, onChange]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={mergeClass(
          "save-btn !w-auto !px-4 !py-2 !text-xs flex items-center gap-1.5",
          schema
        )}
      >
        <Eye size={14} />
        View
      </button>

      <ReportAnnotatorModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        patientId={patientId}
        visitId={visitId}
        headerId={headerId}
        controlTypeId={schema.controlTypeId}
      />
    </>
  );
};
//Control Id --20 cse end-----------------------------------------------------------

const DynamicContentControl = ({ schema }: ControlRenderProps) => (
  <div
    className={mergeClass("text-sm text-gray-700", schema)}
    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(schema.value ?? "") }}
  />
);

const parseSectionIdFromGroupPath = (dataPath: string) =>
  Number(dataPath.match(/^section_(\d+)\./)?.[1]) || 0;

const CardGroupControl = ({ schema, value, onChange }: ControlRenderProps) => {
  const columns = schema.columns ?? [];
  const entries: Record<string, unknown>[] = Array.isArray(value) ? (value as any) : [];
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showFavorites, setShowFavorites] = useState(true);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [orderSetMode, setOrderSetMode] = useState<"all" | "favourites" | null>(null);

  // usually the first column, but a section's meaningful/master-searchable field isn't always
  // sequenced first (e.g. Family History's "Condition" behind "Relationship") — EmrSectionRenderer
  // sets nameColumnKey explicitly in that case
  const nameColumnKey = schema.nameColumnKey ?? columns[0]?.key;
  const nameColumn = columns.find(c => c.key === nameColumnKey) ?? columns[0];
  const favouritesEnabled = schema.favouritesEnabled !== false;
  // no single headerId represents "the whole card-group" — the section itself (parsed from its
  // own dataPath, `section_<id>.group`) is the stable bucket every entry in this group shares
  const sectionEntityId = parseSectionIdFromGroupPath(schema.dataPath);
  const { favorites: doctorFavorites, setFavorite: setDoctorFavorite } = useDoctorFavourites(
    favouritesEnabled ? schema.doctorId : undefined,
    sectionEntityId
  );

  const resetForm = () => {
    setFormValues({});
    setEditingIndex(null);
  };

  const handleFieldChange = (columnKey: string, fieldValue: unknown) => {
    const matchedOption = columns
      .find(col => col.key === columnKey)
      ?.options?.find(opt => opt.value === fieldValue);
    const idKey = `__${columnKey}Id`;

    setFormValues(prev => {
      const updated = { ...prev, [columnKey]: fieldValue };
      if (matchedOption?.key) updated[idKey] = matchedOption.key;
      else delete updated[idKey];
      return updated;
    });
  };

  // same-name check against the doctor's existing favourites (not just current entries), same
  // reasoning as TableControl's isDuplicateFavorite
  const isDuplicateFavoriteEntry = (entryValue: unknown) => {
    if (!nameColumnKey) return false;
    const candidate = String(entryValue ?? "")
      .trim()
      .toLowerCase();
    if (!candidate) return false;
    return doctorFavorites.some(
      f =>
        String(f[nameColumnKey] ?? "")
          .trim()
          .toLowerCase() === candidate
    );
  };

  // the record id (e.g. diagnosisId) can live either directly under masterEntryConfig.idField
  // (entries added via the "Add entry" drawer) or under `__<nameColumnKey>Id` (entries where the
  // name field's dropdown was picked inline — see handleFieldChange above)
  const resolveRecordId = (entry: Record<string, unknown>) => {
    if (!schema.masterEntryConfig) return undefined;
    const direct = entry[schema.masterEntryConfig.idField];
    if (direct !== undefined) return direct;
    return nameColumnKey ? entry[`__${nameColumnKey}Id`] : undefined;
  };

  const handleSave = () => {
    if (nameColumnKey && !String(formValues[nameColumnKey] ?? "").trim()) {
      showWarning(`${nameColumn?.label ?? "This field"} is required`);
      return;
    }
    if (editingIndex === null) {
      // unlike a table/investigation row, the same Diagnosis Type (etc.) legitimately repeats
      // across entries with different Status/Remarks — no duplicate-name guard here
      onChange([...entries, formValues]);
    } else {
      onChange(entries.map((entry, idx) => (idx === editingIndex ? formValues : entry)));
    }
    resetForm();
  };

  const handleEdit = (idx: number) => {
    setFormValues(entries[idx]);
    setEditingIndex(idx);
  };

  const handleDelete = (idx: number) => {
    onChange(entries.filter((_, i) => i !== idx));
    if (editingIndex === idx) resetForm();
  };

  const handleToggleFavorite = (idx: number) => {
    const entry = entries[idx];
    const isFavoriting = !entry.__favorite;

    if (isFavoriting && isDuplicateFavoriteEntry(entry[nameColumnKey ?? ""])) {
      showWarning(`${nameColumn?.label ?? "This entry"} is already in favourites`);
      return;
    }

    onChange(entries.map((e, i) => (i === idx ? { ...e, __favorite: isFavoriting } : e)));

    const favouriteEntry: Record<string, unknown> = {};
    Object.keys(entry).forEach(key => {
      if (key !== "__favorite") favouriteEntry[key] = entry[key];
    });
    setDoctorFavorite(favouriteEntry, isFavoriting, resolveRecordId(entry));
  };

  const handleAddFromFavorite = (favoriteEntry: Record<string, unknown>) => {
    // __recordId is favourites-list bookkeeping (see useDoctorFavourites) — strip it so it
    // doesn't leak into the entry and get re-saved if this entry is favourited again later
    const entry: Record<string, unknown> = {};
    Object.keys(favoriteEntry).forEach(key => {
      if (key !== "__recordId") entry[key] = favoriteEntry[key];
    });
    onChange([...entries, entry]);
  };

  const handleRemoveDoctorFavorite = (entry: Record<string, unknown>) =>
    setDoctorFavorite(entry, false, entry.__recordId);

  const handleSaveFromDrawer = (entry: Record<string, unknown>) => {
    onChange([...entries, entry]);
  };

  const handleApplyOrderSet = (newEntries: Record<string, unknown>[]) => {
    // still guard against the same item appearing twice within one order-set application —
    // that's a malformed set, not a legitimate repeat like two Diagnosis Type entries
    const seen = new Set<string>();
    const toAdd = newEntries.filter(entry => {
      const value = String(entry[nameColumnKey ?? ""] ?? "")
        .trim()
        .toLowerCase();
      if (!value || seen.has(value)) return false;
      seen.add(value);
      return true;
    });

    if (toAdd.length > 0) onChange([...entries, ...toAdd]);
  };

  if (columns.length === 0) {
    return <p className="text-sm text-gray-400">No columns configured</p>;
  }

  return (
    <div
      className={mergeClass(
        "rounded-xl border border-slate-200 bg-white/55 overflow-hidden",
        schema
      )}
    >
      {/* shared entry form — fills one record at a time */}
      <div className="p-4 bg-white/40 border-b border-slate-100">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            {schema.masterEntryConfig && (
              <button
                type="button"
                onClick={() => setIsAddDrawerOpen(true)}
                title="Add entry (search SNOMED)"
                className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-600 text-white shadow-sm hover:bg-slate-700 active:scale-95 transition-all shrink-0"
              >
                <Plus size={15} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {favouritesEnabled && (
              <button
                type="button"
                onClick={() => setShowFavorites(v => !v)}
                title={showFavorites ? "Hide favourites" : "Show favourites"}
                className={`flex items-center justify-center w-7 h-7 rounded-full border transition-colors ${
                  showFavorites
                    ? "bg-amber-50 border-amber-200 text-amber-500"
                    : "bg-white border-slate-200 text-slate-500 hover:text-amber-500 hover:border-amber-200"
                }`}
              >
                <Star size={13} className={showFavorites ? "fill-amber-400" : ""} />
              </button>
            )}
            {schema.orderSetConfig && (
              <>
                <button
                  type="button"
                  onClick={() => setOrderSetMode("all")}
                  title="Order set"
                  className="flex items-center justify-center w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-indigo-500 hover:border-indigo-200 transition-colors"
                >
                  <Layers size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setOrderSetMode("favourites")}
                  title="Favourite order set"
                  className="flex items-center justify-center w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-indigo-500 hover:border-indigo-200 transition-colors"
                >
                  <BookmarkCheck size={13} />
                </button>
              </>
            )}
          </div>
        </div>

        {favouritesEnabled && showFavorites && (
          <div className="flex flex-nowrap items-center gap-2 overflow-x-auto px-3 py-2 mb-3 rounded-lg border border-slate-100 bg-amber-50/30">
            {doctorFavorites.length === 0 ? (
              <span className="text-[12px] text-slate-400">No favourites saved yet</span>
            ) : (
              doctorFavorites.map((entry, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-1.5 shrink-0 whitespace-nowrap bg-blue-50 border border-blue-200 text-blue-700 text-[12px] font-medium rounded-full pl-1 pr-1.5 py-1"
                >
                  <button
                    type="button"
                    onClick={() => handleAddFromFavorite(entry)}
                    title="Add as new entry"
                    className="flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full hover:bg-blue-100"
                  >
                    <Plus size={11} />
                    {String(entry[nameColumnKey ?? ""] ?? `Favourite ${idx + 1}`)}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveDoctorFavorite(entry)}
                    title="Remove from favourites"
                    className="flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:text-blue-700 hover:bg-blue-100"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map(col => (
            <div key={col.key}>
              <label className="input-label">{col.label}</label>
              <TableFieldInput
                column={col}
                value={formValues[col.key]}
                onChange={v => handleFieldChange(col.key, v)}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3">
          <button
            type="button"
            onClick={handleSave}
            className="save-btn !w-auto !px-4 !py-2 !text-xs"
          >
            {editingIndex === null ? "Add+" : "Update Entry"}
          </button>
          {editingIndex !== null && (
            <button
              type="button"
              onClick={resetForm}
              className="cancel-button !w-auto !px-4 !py-2 !text-xs"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* saved entries — one card per record */}
      {entries.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No entries added yet</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
          {entries.map((entry, idx) => (
            // deliberately not the shared ".card" class — EmrSectionRenderer strips ".card"
            // styling (bg/border/shadow/padding) for the outer per-section wrapper, and that
            // override would otherwise reach these nested entry cards too.
            // `layout` gives the other cards a smooth slide when one is added/removed; the
            // initial/animate pair only plays for a genuinely new DOM node (a freshly appended
            // entry at the new last index) since edits reuse the same index — array index as key
            // is intentional here, not a stand-in for a missing id (see handleSave: entries have
            // no stable id, and duplicate field values are explicitly allowed)
            <motion.div
              key={idx}
              layout
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
              className={`relative w-full bg-white border rounded-xl shadow-sm hover:shadow-md overflow-hidden transition-all ${
                editingIndex === idx
                  ? "border-indigo-300 ring-2 ring-indigo-100"
                  : "border-slate-200"
              }`}
            >
              <div className="h-1 bg-gradient-to-r from-indigo-500 to-blue-400" />
              <div className="p-3.5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-[13px] font-bold text-slate-800 truncate">
                    {String(entry[nameColumnKey ?? ""] ?? `Entry ${idx + 1}`)}
                  </h4>
                  <div className="flex items-center gap-1 shrink-0">
                    {favouritesEnabled && (
                      <button
                        type="button"
                        onClick={() => handleToggleFavorite(idx)}
                        title={entry.__favorite ? "Remove from favourites" : "Save as favourite"}
                        className="flex items-center justify-center w-6 h-6 rounded-full text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors"
                      >
                        <Star
                          size={12}
                          className={entry.__favorite ? "fill-amber-400 text-amber-400" : ""}
                        />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleEdit(idx)}
                      title="Edit entry"
                      className="flex items-center justify-center w-6 h-6 rounded-full text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(idx)}
                      title="Delete entry"
                      className="flex items-center justify-center w-6 h-6 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <dl className="flex flex-col gap-1">
                  {columns.slice(1).map(col => {
                    const v = entry[col.key];
                    if (v === undefined || v === null || String(v).trim() === "") return null;
                    return (
                      <div
                        key={col.key}
                        className="flex items-baseline gap-1.5 text-[12px] leading-snug"
                      >
                        <dt className="text-slate-400 font-medium shrink-0">{col.label}:</dt>
                        <dd className="text-slate-700 truncate">{String(v)}</dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {schema.masterEntryConfig && (
        <AddMasterEntryDrawer
          isOpen={isAddDrawerOpen}
          onClose={() => setIsAddDrawerOpen(false)}
          title={`Add ${schema.label ?? nameColumn?.label ?? "Entry"}`}
          nameLabel={nameColumn?.label ?? "Name"}
          nameKey={nameColumnKey ?? "name"}
          extraColumns={[]}
          masterEntryConfig={schema.masterEntryConfig}
          onSave={handleSaveFromDrawer}
        />
      )}

      {schema.orderSetConfig && (
        <OrderSetDrawer
          isOpen={orderSetMode !== null}
          onClose={() => setOrderSetMode(null)}
          title={`${schema.label ?? nameColumn?.label ?? "Entry"} Order Sets`}
          nameKey={nameColumnKey ?? "name"}
          doctorId={schema.doctorId}
          initialFavouritesOnly={orderSetMode === "favourites"}
          config={schema.orderSetConfig}
          onApply={handleApplyOrderSet}
        />
      )}
    </div>
  );
};

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
  emojiScore: EmojiScoreControl,
  dentalTreatmentType: DentalTreatmentTypeControl,
  "checkbox-list": CheckboxListControl,
  richtext: RichTextControl,
  dynamicContent: DynamicContentControl,
  "multiselect-search": MultiSelectSearchControl,
  table: TableControl,
  "card-group": CardGroupControl,
  medicineList: MedicineListControl,
  imageUpload: ImageUploadControl,
  dentalChart: DentalChartControl,
  multiLevelInputGrid: MultiLevelInputGridControl,
  comparisonGrid: ComparisonGridControl,
  radioScoreGroup: RadioScoreGroupControl,
  gonioscopy: GonioscopyControl,
  opticNerveExam: OpticNerveExaminationControl,
  intraOcularPressure: IntraOcularPressureControl,
  compactFormGroup: CompactFormGroupControl,
  vision: VisionControl,
  frameDetails: FrameDetailsControl,
  eyeRefraction: EyeRefractionControl,
  treatmentObjectives: TreatmentObjectivesControl,
};

export const DEFAULT_CONTROL = TextControl;
