import { resolveMultiLevelInputGridConfig } from "@/config/multiLevelInputGrids";
import { useDoctorFavourites } from "@/hooks/useDoctorFavourites";
import { showWarning } from "@/utils/alert";
import { History, Plus, Search as SearchIcon, Settings, Star, Trash2, X } from "lucide-react";
import { useState } from "react";
import { ControlSchema } from "./types";

interface MultiLevelInputGridControlProps {
  schema: ControlSchema;
  value: unknown;
  onChange: (value: unknown) => void;
}

const MultiLevelInputGridControl = ({
  schema,
  value,
  onChange,
}: MultiLevelInputGridControlProps) => {
  const headerId = Number(schema.key.replace(/^header_/, "")) || undefined;
  const config = resolveMultiLevelInputGridConfig(schema.gridConfigName ?? schema.label ?? "");

  const rows: Record<string, unknown>[] = Array.isArray(value)
    ? (value as Record<string, unknown>[])
    : [];
  const [searchText, setSearchText] = useState("");
  const [showFavorites, setShowFavorites] = useState(true);
  const [recentFirst, setRecentFirst] = useState(false);

  const favouritesEnabled = schema.favouritesEnabled !== false;
  const { favorites: doctorFavorites, setFavorite: setDoctorFavorite } = useDoctorFavourites(
    favouritesEnabled ? schema.doctorId : undefined,
    headerId
  );

  if (!config) {
    return <p className="text-sm text-gray-400">No grid configuration found for this header</p>;
  }

  const flatColumns = [
    { ...config.leadingColumn, isGroupStart: false, width: config.leadingColumn.width ?? 72 },
    ...config.groups.flatMap(group =>
      group.columns.map((col, idx) => ({ ...col, isGroupStart: idx === 0, width: col.width ?? 72 }))
    ),
  ];
  const nameColumnKey = config.leadingColumn.key;

  const isDuplicateName = (val: unknown) => {
    const candidate = String(val ?? "")
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

  const isDuplicateFavorite = (val: unknown) => {
    const candidate = String(val ?? "")
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

  const handleAddRow = () => onChange([...rows, {}]);
  const handleRemoveRow = (rowIndex: number) => onChange(rows.filter((_, idx) => idx !== rowIndex));
  const handleCellChange = (rowIndex: number, key: string, fieldValue: string) =>
    onChange(rows.map((row, idx) => (idx === rowIndex ? { ...row, [key]: fieldValue } : row)));

  const handleToggleFavorite = (rowIndex: number) => {
    const row = rows[rowIndex];
    const isFavoriting = !row.__favorite;

    if (isFavoriting && isDuplicateFavorite(row[nameColumnKey])) {
      showWarning(`${config.leadingColumn.label} is already in favourites`);
      return;
    }

    onChange(rows.map((r, idx) => (idx === rowIndex ? { ...r, __favorite: isFavoriting } : r)));

    const entry: Record<string, unknown> = {};
    Object.keys(row).forEach(key => {
      if (key !== "__favorite") entry[key] = row[key];
    });
    setDoctorFavorite(entry, isFavoriting, row.__recordId);
  };

  const handleAddFromFavorite = (favoriteRow: Record<string, unknown>) => {
    if (isDuplicateName(favoriteRow[nameColumnKey])) {
      showWarning(`${config.leadingColumn.label} is already added`);
      return;
    }
    const row: Record<string, unknown> = {};
    Object.keys(favoriteRow).forEach(key => {
      if (key !== "__recordId") row[key] = favoriteRow[key];
    });
    onChange([...rows, row]);
  };

  const handleRemoveDoctorFavorite = (entry: Record<string, unknown>) =>
    setDoctorFavorite(entry, false, entry.__recordId);

  const indexedRows = rows.map((row, originalIndex) => ({ row, originalIndex }));
  const query = searchText.trim().toLowerCase();
  const displayRows = indexedRows.filter(
    ({ row }) =>
      !query ||
      flatColumns.some(col =>
        String(row[col.key] ?? "")
          .toLowerCase()
          .includes(query)
      )
  );
  if (recentFirst) displayRows.reverse();

  return (
    <div className="rounded-xl border border-slate-200 bg-white/55 overflow-hidden">
      <div className="px-3 py-1.5 bg-blue-50 border-b border-blue-100 text-center">
        <p className="text-sm font-bold text-slate-700">{config.title}</p>
      </div>

      {/* toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 gap-y-1.5 px-3 py-2 bg-gradient-to-r from-blue-50 via-sky-50/40 to-white border-b border-blue-100">
        <button
          type="button"
          onClick={handleAddRow}
          title="Add row"
          className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-600 text-white shadow-sm hover:bg-slate-700 active:scale-95 transition-all shrink-0"
        >
          <Plus size={13} />
        </button>

        <div className="flex flex-wrap items-center gap-1.5">
          <div className="relative">
            <SearchIcon
              size={12}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="Search Favourite"
              className="w-32 sm:w-44 bg-white border border-slate-200 rounded-full pl-7 pr-2.5 py-1 text-[11px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setSearchText("");
              setRecentFirst(false);
            }}
            title="Reset filters"
            className="flex items-center justify-center w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
          >
            <Settings size={12} />
          </button>

          {favouritesEnabled && (
            <button
              type="button"
              onClick={() => setShowFavorites(v => !v)}
              title={showFavorites ? "Hide favourites" : "Show favourites"}
              className={`flex items-center justify-center w-6 h-6 rounded-full border transition-colors ${
                showFavorites
                  ? "bg-amber-50 border-amber-200 text-amber-500"
                  : "bg-white border-slate-200 text-slate-500 hover:text-amber-500 hover:border-amber-200"
              }`}
            >
              <Star size={12} className={showFavorites ? "fill-amber-400" : ""} />
            </button>
          )}

          <button
            type="button"
            onClick={() => setRecentFirst(v => !v)}
            title={recentFirst ? "Show default order" : "Show most recent first"}
            className={`flex items-center justify-center w-6 h-6 rounded-full border transition-colors ${
              recentFirst
                ? "bg-blue-50 border-blue-200 text-blue-500"
                : "bg-white border-slate-200 text-slate-500 hover:text-blue-500 hover:border-blue-200"
            }`}
          >
            <History size={12} />
          </button>
        </div>
      </div>

      {favouritesEnabled && showFavorites && (
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto px-3 py-2 border-b border-slate-100 bg-amber-50/30">
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
                  title="Add as new row"
                  className="flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full hover:bg-blue-100"
                >
                  <Plus size={11} />
                  {String(entry[nameColumnKey] ?? `Favourite ${idx + 1}`)}
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

      <div className="table-scroll-wrapper shadow-none border-0 rounded-none">
        <table className="base-table table-size">
          <thead className="table-head">
            <tr>
              <th
                rowSpan={2}
                className="table-th !text-center align-bottom"
                style={{ width: config.leadingColumn.width ?? 72 }}
              >
                {config.leadingColumn.label}
              </th>
              {config.groups.map(group => (
                <th
                  key={group.label}
                  colSpan={group.columns.length}
                  className="table-th !text-center border-l-2 border-blue-300"
                >
                  {group.label}
                </th>
              ))}
              <th rowSpan={2} className="table-th w-16 !text-center align-bottom">
                Action
              </th>
            </tr>
            <tr>
              {config.groups.map(group =>
                group.columns.map((col, idx) => (
                  <th
                    key={`${group.label}-${col.key}`}
                    className={`table-th !text-center ${idx === 0 ? "border-l-2 border-blue-300" : "border-l border-blue-200"}`}
                    style={{ width: col.width ?? 72 }}
                  >
                    {col.label}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {displayRows.map(({ row, originalIndex }) => (
              <tr key={originalIndex} className="table-row">
                {flatColumns.map((col, colIdx) => (
                  <td
                    key={col.key}
                    className={`table-td !text-center ${
                      colIdx === 0
                        ? ""
                        : col.isGroupStart
                          ? "border-l-2 border-blue-200"
                          : "border-l border-blue-100"
                    }`}
                    style={{ width: col.width }}
                  >
                    <input
                      type="text"
                      className="input-field !mb-0 !py-1.5 !px-2 !text-center"
                      style={{ width: col.width }}
                      value={(row[col.key] as string) ?? ""}
                      onChange={e => handleCellChange(originalIndex, col.key, e.target.value)}
                    />
                  </td>
                ))}
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
            ))}
            {displayRows.length === 0 && (
              <tr>
                <td className="table-empty" colSpan={flatColumns.length + 1}>
                  {rows.length === 0 ? "No rows added" : "No matching rows"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MultiLevelInputGridControl;
