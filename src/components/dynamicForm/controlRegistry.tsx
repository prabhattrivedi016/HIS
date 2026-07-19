import TextEditor from "@/components/ckEditor";
import { SelectStyles } from "@/components/customSelect";
import { useDoctorFavourites } from "@/hooks/useDoctorFavourites";
import { showWarning } from "@/utils/alert";
import { useQueryClient } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import {
  BookmarkCheck,
  Check,
  History,
  Layers,
  Plus,
  Search as SearchIcon,
  Settings,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";
import AddMasterEntryDrawer from "./AddMasterEntryDrawer";
import OrderSetDrawer from "./OrderSetDrawer";
import { TableFieldInput } from "./TableFieldInput";
import { ControlSchema, OptionSchema } from "./types";

export interface ControlRenderProps {
  schema: ControlSchema;
  value: unknown;
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

const TextareaControl = ({ schema, value, onChange, onBlur, rows }: ControlRenderProps) => (
  <textarea
    className={mergeClass("input-field resize-y min-h-[38px]", schema)}
    rows={rows ?? 1}
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
  const { favorites: doctorFavorites, setFavorite: setDoctorFavorite } = useDoctorFavourites(
    schema.doctorId,
    headerId
  );

  useEffect(() => {
    if (focusRowIndexRef.current === null) return;
    const rowIndex = focusRowIndexRef.current;
    focusRowIndexRef.current = null;
    containerRef.current
      ?.querySelector<HTMLElement>(`tr[data-row-index="${rowIndex}"] input, tr[data-row-index="${rowIndex}"] select`)
      ?.focus();
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
    return rows.some(row => String(row[nameColumnKey] ?? "").trim().toLowerCase() === candidate);
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
      f => String(f[nameColumnKey] ?? "").trim().toLowerCase() === candidate
    );
  };

  const handleAddRow = () => {
    focusRowIndexRef.current = rows.length;
    onChange([...rows, {}]);
  };
  const handleRemoveRow = (rowIndex: number) =>
    onChange(rows.filter((_, idx) => idx !== rowIndex));
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

  const handleCellKeyDown =
    (rowIndex: number) => (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key !== "Enter" || e.currentTarget.tagName === "TEXTAREA") return;
      e.preventDefault();
      if (rowIndex === rows.length - 1) handleAddRow();
    };

  const indexedRows = rows.map((row, originalIndex) => ({ row, originalIndex }));
  const query = searchText.trim().toLowerCase();
  const displayRows = indexedRows.filter(
    ({ row }) =>
      !query || columns.some(col => String(row[col.key] ?? "").toLowerCase().includes(query))
  );
  if (recentFirst) displayRows.reverse();

  if (columns.length === 0) {
    return <p className="text-sm text-gray-400">No columns configured</p>;
  }

  return (
    <div
      ref={containerRef}
      className={mergeClass("rounded-xl border border-slate-200 bg-white overflow-hidden", schema)}
    >
      {/* toolbar */}
      <div className="flex items-center justify-between gap-3 px-3 py-2.5 bg-gradient-to-r from-slate-100 via-slate-50 to-white border-b border-slate-200">
        <button
          type="button"
          onClick={() => (schema.masterEntryConfig ? setIsAddDrawerOpen(true) : handleAddRow())}
          title={schema.masterEntryConfig ? "Add entry (search SNOMED)" : "Add row"}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-600 text-white shadow-sm hover:bg-slate-700 active:scale-95 transition-all shrink-0"
        >
          <Plus size={15} />
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
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

      {showFavorites && (
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
            {displayRows.map(({ row, originalIndex }) => (
              <tr key={originalIndex} data-row-index={originalIndex} className="table-row">
                {columns.map(col => (
                  <td key={col.key} className="table-td">
                    <TableFieldInput
                      column={col}
                      value={row[col.key]}
                      onChange={v => handleCellChange(originalIndex, col.key, v)}
                      onKeyDown={handleCellKeyDown(originalIndex)}
                    />
                  </td>
                ))}
                <td className="table-td table-action">
                  <div className="flex items-center justify-center gap-2">
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
                    <button type="button" onClick={() => handleRemoveRow(originalIndex)}>
                      <Trash2 size={14} className="text-gray-400 hover:text-gray-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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
            if (headerId) queryClient.invalidateQueries({ queryKey: ["emrHeaderTableColumns", headerId] });
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
  table: TableControl,
};

export const DEFAULT_CONTROL = TextControl;
