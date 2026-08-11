import { ENDPOINTS } from "@/config/defaults";
import { MEDICINE_DURATION_UNITS } from "@/config/medicineDoseOptions";
import MEDICINE_LIST_DUMMY from "@/data/medicineListDummy.json";
import { useDoctorFavourites } from "@/hooks/useDoctorFavourites";
import { useDoseMasterList } from "@/hooks/useDoseMasterList";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { useEmrSectionHistoryStore } from "@/store/useEmrSectionHistoryStore";
import { PickMasterItem } from "@/types";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { safeRandomUUID } from "@/utils/uuid";
import { BookmarkCheck, Layers, Package, Plus, Star, Trash2 } from "lucide-react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import DoseMasterModal from "./DoseMasterModal";
import OrderSetDrawer from "./OrderSetDrawer";
import TaperingStepModal from "./TaperingStepModal";
import { ControlSchema, OptionSchema, TableOrderSetConfig } from "./types";
import VariableDoseModal from "./VariableDoseModal";

const MEDICINE_ORDER_SET_CONFIG: TableOrderSetConfig = {
  listEndpoint: ENDPOINTS.GET_MEDICINE_ORDER_SET_LIST,
  saveEndpoint: ENDPOINTS.CREATE_UPDATE_MEDICINE_ORDER_SET,
  itemSearchEndpoint: ENDPOINTS.GET_SERVICE_ITEM_LIST,
  itemSearchParams: { categoryTypeId: 6, isActive: 1 },
  idField: "orderSetId",
  nameField: "orderSetName",
  itemsField: "items",
};

export interface MedicineDoseScheduleRow {
  id: string;
  doseQty: string;
  doseUnit: string;
  frequency: string;
  durationValue: string;
  durationUnit: string;
  route: string;
  instruction?: string;
}

export interface VariableDoseSlot {
  dose: string;
  time: string;
  when: string;
}

export interface VariableDoseDayEntry {
  id: string;
  fromDate: string;
  toDate: string;
  days: string;
  dose1: VariableDoseSlot;
  dose2: VariableDoseSlot;
}

export interface MedicineListEntry {
  id: string;
  medicineName: string;
  serviceItemId?: string | number;
  isTapering: boolean;
  isVariableDose: boolean;
  favourite: boolean;

  favouriteRecordId?: number;
  schedule: MedicineDoseScheduleRow[];
  variableSchedule?: VariableDoseDayEntry[];
}

interface MedicineListControlProps {
  schema: ControlSchema;
  value: unknown;
  onChange: (value: unknown) => void;
}

const emptyScheduleRow = (): MedicineDoseScheduleRow => ({
  id: safeRandomUUID(),
  doseQty: "",
  doseUnit: "",
  frequency: "",
  durationValue: "",
  durationUnit: "",
  route: "",
});

const parseSectionId = (dataPath: string) => Number(dataPath.match(/^section_(\d+)\./)?.[1]) || 0;

const asOptions = (items: PickMasterItem[]): OptionSchema[] =>
  items.map(item => ({
    key: String(item.key),
    label: String(item.value),
    value: String(item.value),
  }));

const searchDummyMedicines = (query: string): OptionSchema[] => {
  const q = query.trim().toLowerCase();
  return MEDICINE_LIST_DUMMY.medicines
    .filter(m => m.name.toLowerCase().includes(q))
    .map(m => ({ label: m.name, value: m.name, key: m.serviceItemId }));
};

type SearchScope = "all" | "generic" | "brand";

const StockDetailsModal = ({
  medicineName,
  onClose,
}: {
  medicineName: string;
  onClose: () => void;
}) =>
  createPortal(
    <div className="fixed inset-0 z-999">
      <div className="popup-bg-overlay" onClick={onClose} />
      <div className="central-popup w-[92vw] max-w-md opacity-full">
        <div className="popup-header">
          <h2 className="popup-helper-text">Stock Details — {medicineName}</h2>
          <button onClick={onClose} className="close-drawer-btn">
            ×
          </button>
        </div>
        <div className="table-scroll-wrapper">
          <div className="table-size">
            <table className="base-table">
              <thead className="table-head">
                <tr>
                  <th className="table-th">Brand Name</th>
                  <th className="table-th">Stock</th>
                  <th className="table-th">MRP</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={3} className="table-empty">
                    No Data Found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );

const CreateMedicineMasterModal = ({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (entry: { serviceItemId: string; name: string }) => void;
}) => {
  const { loading, fetchApi } = useGlobalApi();
  const [name, setName] = useState("");
  const [genericName, setGenericName] = useState("");

  const handleSave = async () => {
    if (!name.trim()) return;
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_SERVICE_ITEM_MASTER,
      {
        serviceItemId: 0,
        name: name.trim(),
        genericName: genericName.trim(),
        categoryTypeId: 6,
        isActive: 1,
      },
      {},
      { component: "CreateMedicineMasterModal" }
    );
    if (!resp?.result) {
      showError(resp?.message || "Failed to create medicine");
      return;
    }
    showSuccess(resp?.message ?? "Medicine created successfully");
    const newId = (resp?.data as Record<string, unknown> | undefined)?.serviceItemId ?? 0;
    onCreated({ serviceItemId: String(newId), name: name.trim() });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-999">
      <div className="popup-bg-overlay" onClick={onClose} />
      <div className="central-popup w-[92vw] max-w-md opacity-full">
        <div className="popup-header">
          <h2 className="popup-helper-text">Create New Medicine</h2>
          <button onClick={onClose} className="close-drawer-btn">
            ×
          </button>
        </div>
        <div className="flex flex-col gap-3 p-1">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">
              Medicine Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="input-field !mb-0"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. DOLO 650MG TABLET"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">
              Generic Name (optional)
            </label>
            <input
              type="text"
              className="input-field !mb-0"
              value={genericName}
              onChange={e => setGenericName(e.target.value)}
              placeholder="e.g. Paracetamol"
            />
          </div>
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              className={name.trim() && !loading ? "save-btn flex-1" : "disabled-btn flex-1"}
              disabled={!name.trim() || loading}
              onClick={handleSave}
            >
              {loading ? "Saving…" : "Save"}
            </button>
            <button type="button" className="cancel-button flex-1" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

const MedicineListControl = ({ schema, value, onChange }: MedicineListControlProps) => {
  const { fetchApi } = useGlobalApi();
  const headerId = Number(schema.key.replace(/^header_/, "")) || 0;
  const sectionId = parseSectionId(schema.dataPath);
  const entries: MedicineListEntry[] = Array.isArray(value) ? (value as MedicineListEntry[]) : [];

  const [searchScope, setSearchScope] = useState<SearchScope>("all");
  const [rowFilter, setRowFilter] = useState("");
  const [isTaperingMode, setIsTaperingMode] = useState(false);
  const [stockModalFor, setStockModalFor] = useState<string | null>(null);
  const [isCreateMasterOpen, setIsCreateMasterOpen] = useState(false);
  const [isDoseMasterOpen, setIsDoseMasterOpen] = useState(false);
  const [showFavouritesBar, setShowFavouritesBar] = useState(true);
  const [orderSetMode, setOrderSetMode] = useState<"all" | "favourites" | null>(null);
  const [taperingRowContext, setTaperingRowContext] = useState<{
    entryId: string;
    row: MedicineDoseScheduleRow;
  } | null>(null);
  const [variableDoseContext, setVariableDoseContext] = useState<{
    entryId: string;
    row: MedicineDoseScheduleRow;
  } | null>(null);

  const [nameQuery, setNameQuery] = useState("");
  const [searchResults, setSearchResults] = useState<OptionSchema[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Dose master (from the "Dose Master" popup, e.g. "1-1-1") — DB-backed only, deliberately no
  // local/dummy fallback like the option lists below, since a fake pattern here wouldn't map to
  // any real doseId once selected. Shares its query key with DoseMasterModal, so saving a new
  // pattern there automatically refreshes this dropdown too.
  const { doseMasterList } = useDoseMasterList();

  // dummy data (medicineListDummy.json) fills the dropdowns/search only while the real
  // picklist master fields / backend search have nothing — never used once real data exists
  const { pickMasterValue: doseUnitList } = usePickMaster("MedicineDoseUnit");
  const { pickMasterValue: frequencyList } = usePickMaster("MedicineFrequency");
  const { pickMasterValue: routeList } = usePickMaster("MedicineRoute");
  const asFallbackOptions = (values: string[]): OptionSchema[] =>
    values.map(v => ({ key: v, label: v, value: v }));
  const doseUnitOptions = useMemo(
    () =>
      doseUnitList.length > 0
        ? asOptions(doseUnitList)
        : asFallbackOptions(MEDICINE_LIST_DUMMY.doseUnits),
    [doseUnitList]
  );
  const frequencyOptions = useMemo(
    () =>
      frequencyList.length > 0
        ? asOptions(frequencyList)
        : asFallbackOptions(MEDICINE_LIST_DUMMY.frequencies),
    [frequencyList]
  );
  const routeOptions = useMemo(
    () =>
      routeList.length > 0 ? asOptions(routeList) : asFallbackOptions(MEDICINE_LIST_DUMMY.routes),
    [routeList]
  );
  const { pickMasterValue: instructionList } = usePickMaster("MedicineInstruction");
  const instructionOptions = useMemo(
    () =>
      instructionList.length > 0
        ? asOptions(instructionList)
        : asFallbackOptions(MEDICINE_LIST_DUMMY.instructions),
    [instructionList]
  );

  const { favorites: doctorFavorites, setFavorite: setDoctorFavorite } = useDoctorFavourites(
    schema.doctorId,
    headerId
  );

  // subscribe to the raw array (not the getVisitSnapshots function, which never changes identity
  // across store updates) so a Save-triggered addVisitSnapshot actually re-renders this strip
  const visitSnapshotsRaw = useEmrSectionHistoryStore(s => s.visitSnapshots);
  const recentSnapshots = useMemo(
    () =>
      schema.patientId
        ? useEmrSectionHistoryStore
            .getState()
            .getVisitSnapshots(schema.patientId, sectionId)
            .slice(0, 6)
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [schema.patientId, sectionId, visitSnapshotsRaw]
  );

  useEffect(() => {
    const q = nameQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const resp = await fetchApi(
          "GET",
          ENDPOINTS.GET_SERVICE_ITEM_LIST,
          {},
          { params: { categoryTypeId: 6, isActive: 1, serviceName: q, searchScope } },
          { component: "MedicineListControl", silent: true }
        );
        const raw: Record<string, unknown>[] = Array.isArray(resp?.data) ? resp.data : [];
        const mapped = raw.map(item => ({
          label: String(item.name ?? ""),
          value: String(item.name ?? ""),
          key: String(item.serviceItemId ?? ""),
        }));
        // no real "medicine" catalog rows yet for this query — fall back to dummy data so the
        // add/search flow stays testable, never used once the backend actually returns matches
        setSearchResults(mapped.length > 0 ? mapped : searchDummyMedicines(q));
      } catch {
        setSearchResults(searchDummyMedicines(q));
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [nameQuery, searchScope]);

  const isDuplicateName = (name: string) =>
    entries.some(e => e.medicineName.trim().toLowerCase() === name.trim().toLowerCase());

  const addMedicine = (option: OptionSchema) => {
    const name = String(option.label);
    if (isDuplicateName(name)) {
      showWarning(`${name} is already added`);
      return;
    }
    const newEntry: MedicineListEntry = {
      id: safeRandomUUID(),
      medicineName: name,
      serviceItemId: option.key,
      isTapering: isTaperingMode,
      isVariableDose: false,
      favourite: false,
      schedule: [emptyScheduleRow()],
    };
    onChange([...entries, newEntry]);
    setNameQuery("");
    setSearchResults([]);
  };

  const mergeMedicines = (toAdd: MedicineListEntry[]) => {
    const seen = new Set<string>();
    const filtered = toAdd.filter(e => {
      const key = e.medicineName.trim().toLowerCase();
      if (!key || isDuplicateName(key) || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if (filtered.length < toAdd.length) {
      showWarning("Some medicines were already in the list and were skipped");
    }
    if (filtered.length > 0) onChange([...entries, ...filtered]);
  };

  // OrderSetDrawer hands back generic `{ [nameKey]: itemName }` rows — build them into real
  // MedicineListEntry objects the same way a fresh search-pick would, then merge with the same
  // duplicate-guard as Copy Previous / the strip's Copy to Current
  const handleApplyOrderSet = (rows: Record<string, unknown>[]) => {
    mergeMedicines(
      rows.map(row => ({
        id: safeRandomUUID(),
        medicineName: String(row.medicineName ?? ""),
        isTapering: isTaperingMode,
        isVariableDose: false,
        favourite: false,
        schedule: [emptyScheduleRow()],
      }))
    );
  };

  const handleCopyPrevious = () => {
    const latest = recentSnapshots[0];
    const pastValue = latest?.values.find(v => v.headerId === headerId)?.value;
    const pastEntries = Array.isArray(pastValue) ? (pastValue as MedicineListEntry[]) : [];
    if (pastEntries.length === 0) {
      showWarning("No previous medicines found for this patient");
      return;
    }
    mergeMedicines(pastEntries.map(e => ({ ...e, id: safeRandomUUID() })));
  };

  const updateEntry = (entryId: string, patch: Partial<MedicineListEntry>) => {
    onChange(entries.map(e => (e.id === entryId ? { ...e, ...patch } : e)));
  };

  const updateScheduleRow = (
    entryId: string,
    rowId: string,
    patch: Partial<MedicineDoseScheduleRow>
  ) => {
    onChange(
      entries.map(e =>
        e.id === entryId
          ? { ...e, schedule: e.schedule.map(r => (r.id === rowId ? { ...r, ...patch } : r)) }
          : e
      )
    );
  };

  const removeScheduleRow = (entryId: string, rowId: string) => {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;
    if (entry.schedule.length <= 1) {
      onChange(entries.filter(e => e.id !== entryId));
      return;
    }
    onChange(
      entries.map(e =>
        e.id === entryId ? { ...e, schedule: e.schedule.filter(r => r.id !== rowId) } : e
      )
    );
  };

  const handleSaveTaperingStep = (values: Omit<MedicineDoseScheduleRow, "id">) => {
    if (!taperingRowContext) return;
    updateScheduleRow(taperingRowContext.entryId, taperingRowContext.row.id, values);
  };

  const openVariableDoseModal = (entryId: string, row: MedicineDoseScheduleRow) => {
    setVariableDoseContext({ entryId, row });
  };

  const handleSaveVariableSchedule = (schedule: VariableDoseDayEntry[]) => {
    if (!variableDoseContext) return;
    updateEntry(variableDoseContext.entryId, { variableSchedule: schedule });
  };

  const toggleFavourite = (entry: MedicineListEntry) => {
    const isFavoriting = !entry.favourite;
    const recordId = isFavoriting ? Date.now() : entry.favouriteRecordId;
    updateEntry(entry.id, {
      favourite: isFavoriting,
      favouriteRecordId: isFavoriting ? recordId : undefined,
    });
    setDoctorFavorite({ medicineName: entry.medicineName }, isFavoriting, recordId);
  };

  const handleSaveQueryAsFavourite = () => {
    const name = nameQuery.trim();
    if (!name) return;
    const isDuplicateFavorite = doctorFavorites.some(
      f =>
        String(f.medicineName ?? "")
          .trim()
          .toLowerCase() === name.toLowerCase()
    );
    if (isDuplicateFavorite) {
      showWarning(`${name} is already in favourites`);
      return;
    }
    setDoctorFavorite({ medicineName: name }, true, Date.now());
    showSuccess(`${name} added to favourites`);
  };

  const handleMedicineCreated = (created: { serviceItemId: string; name: string }) => {
    addMedicine({ label: created.name, value: created.name, key: created.serviceItemId });
  };

  const addFromFavourite = (fav: Record<string, unknown>) => {
    const name = String(fav.medicineName ?? "");
    if (!name || isDuplicateName(name)) {
      showWarning(name ? `${name} is already added` : "Invalid favourite entry");
      return;
    }
    onChange([
      ...entries,
      {
        id: safeRandomUUID(),
        medicineName: name,
        isTapering: isTaperingMode,
        isVariableDose: false,
        favourite: true,
        favouriteRecordId: Number(fav.__recordId) || undefined,
        schedule: [emptyScheduleRow()],
      },
    ]);
  };

  const filteredEntries = rowFilter.trim()
    ? entries.filter(e => e.medicineName.toLowerCase().includes(rowFilter.trim().toLowerCase()))
    : entries;

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 gap-y-2 px-3 py-2.5 bg-gradient-to-r from-slate-100 via-slate-50 to-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCreateMasterOpen(true)}
            title="Create a new medicine in the master list"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-600 text-white shadow-sm hover:bg-slate-700 active:scale-95 transition-all shrink-0"
          >
            <Plus size={15} />
          </button>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            Search by
          </span>
          <div className="flex rounded-full border border-slate-200 overflow-hidden">
            {(["all", "generic", "brand"] as SearchScope[]).map(scope => (
              <button
                key={scope}
                type="button"
                onClick={() => setSearchScope(scope)}
                className={`px-2.5 py-1 text-[11px] font-semibold capitalize transition-colors ${
                  searchScope === scope
                    ? "bg-slate-700 text-white"
                    : "bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                {scope}
              </button>
            ))}
          </div>
        </div>

        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <input
            type="text"
            value={rowFilter}
            onChange={e => setRowFilter(e.target.value)}
            placeholder="Search Favourite"
            className="w-full bg-white border border-slate-200 rounded-full px-3 py-1.5 text-[12px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              className="input-checkbox"
              checked={isTaperingMode}
              onChange={e => setIsTaperingMode(e.target.checked)}
            />
            Tapering
          </label>
          <button
            type="button"
            onClick={handleCopyPrevious}
            className="px-3 py-1.5 rounded-md text-xs font-semibold border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors"
          >
            Copy Previous
          </button>

          <button
            type="button"
            onClick={() => setShowFavouritesBar(v => !v)}
            title={showFavouritesBar ? "Hide favourites" : "Show favourites"}
            className={`flex items-center justify-center w-7 h-7 rounded-full border transition-colors ${
              showFavouritesBar
                ? "bg-amber-50 border-amber-200 text-amber-500"
                : "bg-white border-slate-200 text-slate-500 hover:text-amber-500 hover:border-amber-200"
            }`}
          >
            <Star size={13} className={showFavouritesBar ? "fill-amber-400" : ""} />
          </button>

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
        </div>
      </div>

      {/* favourites bar */}
      {showFavouritesBar && doctorFavorites.length > 0 && (
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto px-3 py-2 border-b border-slate-100 bg-amber-50/30">
          {doctorFavorites.map((entry, idx) => (
            <span
              key={idx}
              className="flex items-center gap-1.5 shrink-0 whitespace-nowrap bg-blue-50 border border-blue-200 text-blue-700 text-[12px] font-medium rounded-full pl-1 pr-1.5 py-1"
            >
              <button
                type="button"
                onClick={() => addFromFavourite(entry)}
                className="flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full hover:bg-blue-100"
              >
                <Plus size={11} />
                {String(entry.medicineName ?? "Favourite")}
              </button>
            </span>
          ))}
        </div>
      )}

      {/* add medicine */}
      <div className="relative px-3 py-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={nameQuery}
            onChange={e => setNameQuery(e.target.value)}
            placeholder="Search medicine to add…"
            className="input-field !mb-0 flex-1"
          />
          <button
            type="button"
            onClick={handleSaveQueryAsFavourite}
            disabled={!nameQuery.trim()}
            title="Save as favourite"
            className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 text-slate-500 hover:text-amber-500 hover:border-amber-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Plus size={15} />
          </button>
        </div>
        {(isSearching || searchResults.length > 0) && nameQuery.trim().length >= 2 && (
          <div className="absolute z-30 left-3 right-3 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
            {isSearching ? (
              <div className="px-3 py-2 text-sm text-gray-500">Searching…</div>
            ) : searchResults.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-400">No results found</div>
            ) : (
              searchResults.map((opt, i) => (
                <button
                  key={`${opt.key}-${i}`}
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => addMedicine(opt)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* grid */}
      <div className="table-scroll-wrapper shadow-none border-0 rounded-none">
        <table className="base-table table-size">
          <thead className="table-head">
            <tr>
              <th className="table-th">Medicine Name</th>
              <th className="table-th">
                <div className="flex items-center gap-1.5">
                  Dose Unit
                  <button
                    type="button"
                    onClick={() => setIsDoseMasterOpen(true)}
                    title="Manage Dose Master"
                    className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-600 text-white hover:bg-slate-700 shrink-0"
                  >
                    <Plus size={11} />
                  </button>
                </div>
              </th>
              <th className="table-th">Frequency</th>
              <th className="table-th">Duration</th>
              <th className="table-th">Route</th>
              <th className="table-th w-20 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={6} className="table-empty">
                  No medicines added
                </td>
              </tr>
            ) : (
              filteredEntries.map(entry => (
                <Fragment key={entry.id}>
                  {entry.schedule.map((row, rowIdx) => (
                    <tr key={row.id} className="table-row">
                      {rowIdx === 0 && (
                        <td className="table-td align-top" rowSpan={entry.schedule.length}>
                          <div className="flex items-start gap-1.5">
                            <button
                              type="button"
                              onClick={() => setStockModalFor(entry.medicineName)}
                              title="Stock details"
                              className="mt-0.5 text-teal-500 hover:text-teal-700 shrink-0"
                            >
                              <Package size={13} />
                            </button>
                            <div>
                              <div className="font-medium text-gray-800">{entry.medicineName}</div>
                              {(entry.isTapering || entry.isVariableDose) && (
                                <span className="inline-block mt-0.5 text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-full px-1.5 py-0.5">
                                  {entry.isTapering ? "Tapering" : "Variable Dose"}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="table-td">
                        <div className="flex items-center gap-1">
                          <select
                            className="input-field !mb-0 !py-1 text-xs w-16"
                            value={row.doseQty}
                            onChange={e =>
                              updateScheduleRow(entry.id, row.id, { doseQty: e.target.value })
                            }
                          >
                            <option value="">—</option>
                            {doseMasterList.map(d => (
                              <option key={d.DoseId} value={d.Dose}>
                                {d.Dose}
                              </option>
                            ))}
                          </select>
                          <select
                            className="input-field !mb-0 !py-1 text-xs"
                            value={row.doseUnit}
                            onChange={e =>
                              updateScheduleRow(entry.id, row.id, { doseUnit: e.target.value })
                            }
                          >
                            <option value="">Unselect</option>
                            {doseUnitOptions.map(opt => (
                              <option key={opt.key} value={opt.value as string}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="table-td">
                        <select
                          className="input-field !mb-0 !py-1 text-xs"
                          value={row.frequency}
                          onChange={e =>
                            updateScheduleRow(entry.id, row.id, { frequency: e.target.value })
                          }
                        >
                          <option value="">Unselect</option>
                          {frequencyOptions.map(opt => (
                            <option key={opt.key} value={opt.value as string}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="table-td">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            className="input-field !mb-0 !py-1 text-xs w-14"
                            value={row.durationValue}
                            onChange={e =>
                              updateScheduleRow(entry.id, row.id, { durationValue: e.target.value })
                            }
                          />
                          <select
                            className="input-field !mb-0 !py-1 text-xs"
                            value={row.durationUnit}
                            onChange={e =>
                              updateScheduleRow(entry.id, row.id, { durationUnit: e.target.value })
                            }
                          >
                            <option value="">Unselect</option>
                            {MEDICINE_DURATION_UNITS.map(u => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="table-td">
                        <select
                          className="input-field !mb-0 !py-1 text-xs"
                          value={row.route}
                          onChange={e =>
                            updateScheduleRow(entry.id, row.id, { route: e.target.value })
                          }
                        >
                          <option value="">Unselect</option>
                          {routeOptions.map(opt => (
                            <option key={opt.key} value={opt.value as string}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="table-td table-action">
                        <div className="flex items-center justify-center gap-1.5">
                          {rowIdx === 0 && (
                            <button type="button" onClick={() => toggleFavourite(entry)}>
                              <Star
                                size={14}
                                className={
                                  entry.favourite
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-gray-300 hover:text-amber-400"
                                }
                              />
                            </button>
                          )}
                          <button type="button" onClick={() => removeScheduleRow(entry.id, row.id)}>
                            <Trash2 size={14} className="text-gray-400 hover:text-gray-600" />
                          </button>
                          {(isTaperingMode || entry.isTapering) && (
                            <button
                              type="button"
                              onClick={() => setTaperingRowContext({ entryId: entry.id, row })}
                              title="Set tapering details"
                            >
                              <Plus size={14} className="text-gray-400 hover:text-blue-600" />
                            </button>
                          )}
                          {entry.isVariableDose && (
                            <button
                              type="button"
                              onClick={() => openVariableDoseModal(entry.id, row)}
                              title="Variable dose schedule"
                              className="flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold text-gray-400 hover:text-indigo-600 border border-current"
                            >
                              V
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {stockModalFor && (
        <StockDetailsModal medicineName={stockModalFor} onClose={() => setStockModalFor(null)} />
      )}

      {isCreateMasterOpen && (
        <CreateMedicineMasterModal
          onClose={() => setIsCreateMasterOpen(false)}
          onCreated={handleMedicineCreated}
        />
      )}

      {isDoseMasterOpen && <DoseMasterModal onClose={() => setIsDoseMasterOpen(false)} />}

      <OrderSetDrawer
        isOpen={orderSetMode !== null}
        onClose={() => setOrderSetMode(null)}
        title="Medicine Order Sets"
        nameKey="medicineName"
        doctorId={schema.doctorId}
        initialFavouritesOnly={orderSetMode === "favourites"}
        config={MEDICINE_ORDER_SET_CONFIG}
        onApply={handleApplyOrderSet}
      />

      {taperingRowContext &&
        (() => {
          const entry = entries.find(e => e.id === taperingRowContext.entryId);
          if (!entry) return null;
          const { id: _rowId, ...initialValues } = taperingRowContext.row;
          return (
            <TaperingStepModal
              medicineName={entry.medicineName}
              initialValues={initialValues}
              doseUnitOptions={doseUnitOptions}
              frequencyOptions={frequencyOptions}
              routeOptions={routeOptions}
              instructionOptions={instructionOptions}
              onSave={handleSaveTaperingStep}
              onClose={() => setTaperingRowContext(null)}
            />
          );
        })()}

      {variableDoseContext &&
        (() => {
          const entry = entries.find(e => e.id === variableDoseContext.entryId);
          if (!entry) return null;
          return (
            <VariableDoseModal
              medicineName={entry.medicineName}
              unit={variableDoseContext.row.doseUnit}
              durationValue={variableDoseContext.row.durationValue}
              durationUnit={variableDoseContext.row.durationUnit}
              initialSchedule={entry.variableSchedule}
              onSave={handleSaveVariableSchedule}
              onClose={() => setVariableDoseContext(null)}
            />
          );
        })()}
    </div>
  );
};

export default MedicineListControl;
