import Animation from "@/components/animation";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import { SubSubCategoryItem } from "@/types";
import {
  AlertCircle,
  Ban,
  CheckCheck,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Hourglass,
  Inbox,
  Layers,
  PauseCircle,
  Printer,
  Search,
  Send,
  Star,
  TestTube,
  Zap,
} from "lucide-react";
import {
  Activity,
  Dispatch,
  MouseEvent,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CorporateItem,
  FilterTypeItem,
  RoomTypeItem,
  SampleManagementItem,
  SampleTypeItem,
  ViewMode,
} from "../types";

export interface FilterButtonConfig {
  key: string;
  label: string;
  icon: typeof Layers;
  iconColor: string;
  countKey:
    | "all"
    | "collectionPending"
    | "sampleCollected"
    | "sampleRejected"
    | "departmentReceivingPending"
    | "departmentReceived"
    | "resultPending"
    | "reportApprovalPending"
    | "hold"
    | "approved"
    | "dispatched"
    | "printed"
    | "urgent"
    | "abnormal";
}

export const FILTER_BUTTONS: FilterButtonConfig[] = [
  {
    key: "allClicked",
    label: "All",
    icon: Layers,
    iconColor: "text-purple-600",
    countKey: "all",
  },
  {
    key: "collectionPendingClicked",
    label: "CollectionPending",
    icon: Hourglass,
    iconColor: "text-purple-600",
    countKey: "collectionPending",
  },
  {
    key: "sampleCollectedClicked",
    label: "Sample Collected",
    icon: TestTube,
    iconColor: "text-amber-600",
    countKey: "sampleCollected",
  },
  {
    key: "sampleRejectedClicked",
    label: "Sample Rejected",
    icon: Ban,
    iconColor: "text-red-600",
    countKey: "sampleRejected",
  },
  {
    key: "departmentReceivingPendingClicked",
    label: "Dept. Receiving Pending",
    icon: Inbox,
    iconColor: "text-blue-500",
    countKey: "departmentReceivingPending",
  },
  {
    key: "departmentReceiveClicked",
    label: "Department Received",
    icon: CheckCheck,
    iconColor: "text-blue-500",
    countKey: "departmentReceived",
  },
  {
    key: "resultPendingClicked",
    label: "Result Pending",
    icon: Activity,
    iconColor: "text-pink-600",
    countKey: "resultPending",
  },
  {
    key: "reportApprovalPendingClicked",
    label: "Report Approval Pending",
    icon: FileText,
    iconColor: "text-blue-500",
    countKey: "reportApprovalPending",
  },
  {
    key: "holdClicked",
    label: "Hold",
    icon: PauseCircle,
    iconColor: "text-amber-500",
    countKey: "hold",
  },
  {
    key: "approvedClicked",
    label: "Approved",
    icon: CheckCircle,
    iconColor: "text-emerald-600",
    countKey: "approved",
  },
  {
    key: "dispatchedClicked",
    label: "Dispatched",
    icon: Send,
    iconColor: "text-emerald-700",
    countKey: "dispatched",
  },
  {
    key: "printedClicked",
    label: "Printed",
    icon: Printer,
    iconColor: "text-blue-600",
    countKey: "printed",
  },
  {
    key: "urgentClicked",
    label: "Urgent",
    icon: Zap,
    iconColor: "text-blue-600",
    countKey: "urgent",
  },
  {
    key: "abnormalClicked",
    label: "Abnormal",
    icon: AlertCircle,
    iconColor: "text-blue-600",
    countKey: "abnormal",
  },
];

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(date)
    .replace(/ /g, "-");

const formatToYYYYMMDD = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const parseDateString = (dateStr?: string) => {
  if (!dateStr) return new Date();
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      const [y, m, d] = parts.map(Number);
      return new Date(y, m - 1, d);
    } else {
      const [d, m, y] = parts.map(Number);
      return new Date(y, m - 1, d);
    }
  }
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};

export default function SearchBar({
  filters,
  setFilters,
  onClick,
  onFilterButtonClick,
  setViewMode,
  sampleManagementList,
  updatedSampleManagementList,
}: {
  filters: FilterTypeItem;
  setFilters: Dispatch<SetStateAction<FilterTypeItem>>;
  onClick?: (customFilters?: FilterTypeItem) => void;
  onFilterButtonClick: (buttonType: string) => void;
  setViewMode: Dispatch<SetStateAction<ViewMode>>;
  sampleManagementList?: SampleManagementItem[];
  updatedSampleManagementList?: SampleManagementItem[];
  storageKey?: string;
}) {
  const { loading, fetchApi } = useGlobalApi();
  const [subSubCategoryList, setSubSubCategoryList] = useState<SubSubCategoryItem[]>([]);
  const [corporateMasterList, setCorporateMasterList] = useState<CorporateItem[]>([]);
  const [showSearchInputs, setShowSearchInputs] = useState(false);

  const [activeButton, setActiveButton] = useState("allClicked");

  const calendarContainerRef = useRef<HTMLDivElement>(null);

  const [appliedRange, setAppliedRange] = useState(() => ({
    startDate: parseDateString(filters?.fromDate),
    endDate: parseDateString(filters?.toDate),
    key: "selection",
  }));

  const [tempRange, setTempRange] = useState(appliedRange);

  const [selectedDate, setSelectedDate] = useState<Date>(() => parseDateString(filters?.fromDate));

  const [showFullCalendar, setShowFullCalendar] = useState(false);

  const [sampleTypeList, setSampleTypeList] = useState<SampleTypeItem[]>([]);

  const [roomTypeLists, setRoomTypeLists] = useState([]);

  useEffect(() => {
    if (filters?.fromDate && filters?.toDate) {
      const start = parseDateString(filters.fromDate);
      const end = parseDateString(filters.toDate);
      const currentStartFormatted = formatToYYYYMMDD(appliedRange.startDate);
      const currentEndFormatted = formatToYYYYMMDD(appliedRange.endDate);

      if (filters.fromDate !== currentStartFormatted || filters.toDate !== currentEndFormatted) {
        const range = { startDate: start, endDate: end, key: "selection" };
        setAppliedRange(range);
        setTempRange(range);
        setSelectedDate(start);
      }
    }
  }, [filters?.fromDate, filters?.toDate]);

  useEffect(() => {
    if (!showFullCalendar) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarContainerRef.current &&
        !calendarContainerRef.current.contains(event.target as Node)
      ) {
        setTempRange(appliedRange);
        setShowFullCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFullCalendar, appliedRange]);

  // room type lists
  const getRoomTypeLists = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SERVICE_ITEM_LIST,
      {},
      { params: { categoryTypeId: 10, isActive: 1 } },
      { component: "SearchBar" }
    );
    setRoomTypeLists(resp?.data ?? []);

    console.log("room type lists", resp?.data);
  };

  // sample type list
  const getSampleTypeList = async () => {
    try {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_ALL_SAMPLE_TYPE_MASTER,
        {},
        {},
        { component: "SearchBar" }
      );
      setSampleTypeList(resp?.data ?? []);
    } catch (error) {
      console.log(error);
    }
  };

  // sub sub category list
  const getSubSubCategory = async (subCategoryIds: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SUB_SUB_CATEGORY_LIST,
      {},
      { params: { subCategoryIds } },
      { component: "SearchBar" }
    );
    setSubSubCategoryList(resp?.data ?? []);
  };

  // corporate master list
  const getCorporateMasterList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CORPORATE_MASTER_LIST,
      {},
      { params: { isActive: 1 } },
      { component: "SearchBar" }
    );
    setCorporateMasterList(resp?.data ?? []);
  };

  useEffect(() => {
    getSubSubCategory(1);
    getCorporateMasterList();
    getSampleTypeList();
    getRoomTypeLists();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev: FilterTypeItem) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onClick?.(filters);
  };

  const changeDay = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    if (direction === "prev") newDate.setDate(selectedDate.getDate() - 1);
    else newDate.setDate(selectedDate.getDate() + 1);

    setSelectedDate(newDate);
    const range = { startDate: newDate, endDate: newDate, key: "selection" };
    setAppliedRange(range);
    setTempRange(range);

    const formatted = formatToYYYYMMDD(newDate);
    const updatedFilters = {
      ...filters,
      fromDate: formatted,
      toDate: formatted,
    };
    setFilters(updatedFilters);
    onClick?.(updatedFilters);
  };

  const handleSelect = (ranges: any) => {
    setTempRange(ranges.selection);
  };

  const applyHandler = () => {
    setAppliedRange(tempRange);
    setSelectedDate(tempRange.startDate);
    setShowFullCalendar(false);

    const fromDate = formatToYYYYMMDD(tempRange.startDate);
    const toDate = formatToYYYYMMDD(tempRange.endDate);

    const updatedFilters = {
      ...filters,
      fromDate,
      toDate,
    };
    setFilters(updatedFilters);
    onClick?.(updatedFilters);
  };

  const cancelHandler = () => {
    setTempRange(appliedRange);
    setShowFullCalendar(false);
  };

  const displayText =
    appliedRange.startDate.toDateString() === appliedRange.endDate.toDateString()
      ? formatDate(appliedRange.startDate)
      : `${formatDate(appliedRange.startDate)} - ${formatDate(appliedRange.endDate)}`;

  const getButtonClass = buttonName => {
    const isActive = activeButton === buttonName;
    return `flex items-center gap-2 transition-transform cursor-pointer active:scale-95 border rounded-sm px-2 py-1 ${
      isActive
        ? "bg-[#0B5394] border-blue-900 text-white"
        : "border-gray-300 text-gray-700 hover:bg-gray-50"
    }`;
  };

  const getIconClass = (buttonName, defaultColorClass) => {
    return activeButton === buttonName ? "text-white" : defaultColorClass;
  };

  // default storage key for favorite buttons
  const defaultStorageKey = "labSampleManagementFavoriteButtons";

  // lab sample management favorite buttons (persisted in localStorage, maximum 5 allowed)
  const [favoriteButtons, setFavoriteButtons] = useState<string[]>(() => {
    try {
      const stored =
        localStorage.getItem(storageKey || defaultStorageKey) ||
        localStorage.getItem("labSampleManagementFavoriteButtons");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.slice(0, 5);
        }
      }
    } catch {
      // fallback to empty list
    }
    return [];
  });

  // favorite button click handler (toggle favorite; if 5 already exist, remove the last and add new)
  const favButtonClickHandler = (e: MouseEvent, key: string) => {
    e.stopPropagation();

    setFavoriteButtons(prev => {
      let updated: string[];
      if (prev.includes(key)) {
        updated = prev.filter(k => k !== key);
      } else {
        if (prev.length >= 5) {
          // Remove the last favorite (5th item) and insert the new button
          updated = [...prev.slice(0, 4), key];
        } else {
          updated = [...prev, key];
        }
      }

      localStorage.setItem(storageKey || defaultStorageKey, JSON.stringify(updated));
      return updated;
    });
  };

  // button click handler
  const handleButtonClick = (buttonKey: string) => {
    setViewMode("test");
    setActiveButton(buttonKey);
    onFilterButtonClick?.(buttonKey);
  };

  // ordered buttons: favorite buttons appear first, followed by remaining buttons
  const orderedButtons = useMemo(() => {
    const favSet = new Set(favoriteButtons);
    const favButtons = favoriteButtons
      .map(key =>
        FILTER_BUTTONS.find(
          btn =>
            btn.key === key ||
            (key === "departmentReceivedClicked" && btn.key === "departmentReceiveClicked")
        )
      )
      .filter((btn): btn is FilterButtonConfig => Boolean(btn));

    const regularButtons = FILTER_BUTTONS.filter(btn => {
      if (favSet.has(btn.key)) return false;
      if (btn.key === "departmentReceiveClicked" && favSet.has("departmentReceivedClicked")) return false;
      return true;
    });

    return [...favButtons, ...regularButtons];
  }, [favoriteButtons]);

  // count values
  const getCountValues = useMemo(() => {
    let collectionPending = 0;
    let sampleCollected = 0;
    let sampleRejected = 0;
    let departmentReceivingPending = 0;
    let departmentReceived = 0;
    let resultPending = 0;
    let reportApprovalPending = 0;
    let hold = 0;
    let dispatched = 0;
    let printed = 0;
    let urgent = 0;
    let abnormal = 0;
    let approved = 0;

    const list = sampleManagementList?.length
      ? sampleManagementList
      : updatedSampleManagementList || [];

    list.forEach(item => {
      const isCollected = Number(item?.IsSampleCollected) === 1;
      const isRejected = Number(item?.isSampleRejected) === 1;

      if (!isCollected && !isRejected) collectionPending++;
      if (isCollected && !isRejected) sampleCollected++;
      if (isRejected) sampleRejected++;
      if (Number(item?.IsSampleReceivedByDepartment) === 0) departmentReceivingPending++;
      if (Number(item?.IsSampleReceivedByDepartment) === 1) departmentReceived++;
      if (Number(item?.IsResultDone) === 0) resultPending++;
      if (Number(item?.IsReportApproved) === 0) reportApprovalPending++;
      if (Number(item?.IsReportHold) === 1) hold++;
      if (Number(item?.IsReportApproved) === 1) approved++;
      if (Number(item?.IsDispatched) === 1) dispatched++;
      if (Number(item?.isReportPrinted) === 1) printed++;
      if (Number(item?.isUrgent) === 1) urgent++;
      if (Number(item?.IsAbnormalResult) === 1) abnormal++;
    });

    return {
      all: list.length,
      collectionPending,
      sampleCollected,
      sampleRejected,
      departmentReceivingPending,
      departmentReceived,
      resultPending,
      reportApprovalPending,
      hold,
      dispatched,
      printed,
      urgent,
      abnormal,
      approved,
    };
  }, [sampleManagementList, updatedSampleManagementList]);

  return (
    <div className={`card mt-1`}>
      {/* Search button to open/close fields */}
      <div className="flex flex-wrap items-center justify-between gap-2 -mt-2">
        <button
          type="button"
          onClick={() => setShowSearchInputs(!showSearchInputs)}
          className="flex gap-1.5 items-center save-btn lg:max-h-8"
        >
          <Search size={14} />
          <span>{showSearchInputs ? "Hide Search Filters" : "Open Search Filters"}</span>
        </button>

        <form className="flex items-center gap-2" onSubmit={handleSearch}>
          <InputField>
            <div className="relative">
              <Search
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />

              <input
                type="text"
                name="barCode"
                value={filters.barCode}
                onChange={handleChange}
                placeholder="Search using barcode.. "
                className="input-field max-h-9 pl-4 pr-9"
                autoFocus
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    handleSearch?.();
                  }
                }}
              />
            </div>
          </InputField>

          {/* Compact date navigator */}
          <div
            ref={calendarContainerRef}
            className="relative flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-1 py-1"
          >
            <button
              type="button"
              onClick={() => changeDay("prev")}
              className="p-1.5 rounded-md hover:bg-gray-200 active:scale-95 transition-all text-gray-600 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <div
              className="min-w-[140px] text-center text-xs font-semibold text-gray-700 cursor-pointer hover:text-blue-600 py-1 px-2 rounded-md hover:bg-blue-50 transition-all select-none"
              onClick={() => setShowFullCalendar(prev => !prev)}
            >
              {displayText}
            </div>
            <button
              type="button"
              onClick={() => changeDay("next")}
              className="p-1.5 rounded-md hover:bg-gray-200 active:scale-95 transition-all text-gray-600 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>

            {showFullCalendar && (
              <div className="absolute right-0 top-full mt-1 z-50 bg-white shadow-xl rounded-xl p-3 border border-gray-100">
                <DateRangePicker
                  ranges={[tempRange]}
                  onChange={handleSelect}
                  months={2}
                  direction="horizontal"
                  showMonthAndYearPickers={true}
                  staticRanges={[]}
                  inputRanges={[]}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button type="button" onClick={cancelHandler} className="cancel-button">
                    Cancel
                  </button>
                  <button type="button" onClick={applyHandler} className="save-btn">
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Collapsible search fields */}
      {showSearchInputs && (
        <Animation>
          <div className="transition-all duration-300 ease-in-out space-y-3 mb-4 pt-2 border-t border-blue-200">
            <div className="form-grid-5">
              <InputField label="Patient Type">
                <select
                  className="input-field"
                  value={filters?.typeId}
                  onChange={handleChange}
                  name="typeId"
                >
                  <option value={0}>All</option>
                  <option value={1}>OPD</option>
                  <option value={2}>IPD</option>
                </select>
              </InputField>

              <InputField label="Patient Name">
                <input
                  type="text"
                  name="patientName"
                  value={filters.patientName}
                  onChange={handleChange}
                  placeholder="Enter name"
                  className="input-field"
                />
              </InputField>

              <InputField label="UHID">
                <input
                  type="text"
                  name="uhid"
                  value={filters.uhid}
                  onChange={handleChange}
                  placeholder="Enter UHID"
                  className="input-field"
                />
              </InputField>

              <InputField label="IPD Number">
                <input
                  type="text"
                  name="ipdNo"
                  value={filters.ipdNo}
                  onChange={handleChange}
                  placeholder="Enter IPD Number"
                  className="input-field"
                />
              </InputField>

              <InputField label="Sample Type">
                <select
                  name="sampleType"
                  value={filters?.sampleTypeId}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value={0}>All</option>
                  {sampleTypeList?.map(s => (
                    <option key={s?.sampleTypeId} value={s?.sampleTypeId}>
                      {s?.sampleType}
                    </option>
                  ))}
                </select>
              </InputField>

              <InputField label="Priority">
                <select
                  name="isUrgent"
                  value={filters?.isUrgent}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">All</option>
                  <option value="0">Normal</option>
                  <option value="1">Urgent</option>
                </select>
              </InputField>

              {/* ================= ROW 2 ================= */}

              {/* <InputField label="Priority">
                         <select
                           name="priority"
                           value={filters.priority}
                           onChange={handleChange}
                           className="input-field"
                         >
                           <option value="">All</option>
                           <option value="0">Normal</option>
                           <option value="1">Urgent</option>
                         </select>
                       </InputField> */}

              <InputField label=" Department">
                <select
                  className="input-field"
                  name="subSubCategoryId"
                  value={filters?.subSubCategoryId}
                  onChange={handleChange}
                >
                  <option value={0}>All</option>

                  {subSubCategoryList.map(subSubCategory => (
                    <option
                      key={subSubCategory.subSubCategoryId}
                      value={subSubCategory.subSubCategoryId}
                    >
                      {subSubCategory.subSubCategoryName}
                    </option>
                  ))}
                </select>
              </InputField>

              <InputField label="Corporate">
                <select
                  name="corporateId"
                  value={filters.corporateId}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value={0}>All</option>
                  {corporateMasterList.map((c: CorporateItem) => (
                    <option key={c.corporateId} value={c.corporateId}>
                      {c.corporateName}
                    </option>
                  ))}
                </select>
              </InputField>

              <InputField label="Room Type">
                <select
                  name="roomTypeId"
                  value={filters.roomTypeId}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value={0}>All</option>
                  {roomTypeLists.map((r: RoomTypeItem) => (
                    <option key={r.serviceItemId} value={r.roomTypeId}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </InputField>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 w-full lg:col-start-5 mt-3">
                <button type="submit" onClick={handleSearch} className="save-btn !py-2">
                  <span>Search</span>
                </button>
              </div>
            </div>
          </div>
        </Animation>
      )}

      {/* ================= ALWAYS VISIBLE STATUS PILL BADGES ================= */}
      <div
        className="card -mt-3 "
        style={{
          backgroundColor: "transparent",
          border: "none",
          boxShadow: "none",
          paddingBottom: 0,
        }}
      >
        {/* 1 */}
        <div className="flex items-center gap-3 text-xs font-semibold overflow-x-auto whitespace-nowrap py-2 [&::-webkit-scrollbar]:h-1.5">
          {orderedButtons.map(btn => {
            const isFav =
              favoriteButtons.includes(btn.key) ||
              (btn.key === "departmentReceiveClicked" &&
                favoriteButtons.includes("departmentReceivedClicked"));
            const IconComponent = btn.icon;
            const count = getCountValues?.[btn.countKey] ?? 0;
            const isActive = activeButton === btn.key;

            return (
              <div
                key={btn.key}
                className={`inline-flex items-center gap-2 shrink-0 cursor-pointer ${getButtonClass(btn.key)}`}
                onClick={() => handleButtonClick(btn.key)}
              >
                <IconComponent
                  size={14}
                  className={getIconClass(btn.key, btn.iconColor)}
                />
                <span className="flex items-center gap-1.5">
                  <span>{btn.label}:</span>
                  <span>{count}</span>
                  <span
                    className="cursor-pointer p-0.5 transition-transform hover:scale-110 active:scale-95 inline-flex items-center ml-0.5"
                    onClick={e => favButtonClickHandler(e, btn.key)}
                    title={isFav ? "Remove from favorites" : "Mark as favorite"}
                  >
                    <Star
                      size={14}
                      className={
                        isFav
                          ? isActive
                            ? "text-yellow-300 fill-yellow-300"
                            : "text-yellow-400 fill-yellow-400"
                          : isActive
                            ? "text-blue-200 hover:text-yellow-300"
                            : "text-gray-400 hover:text-yellow-400"
                      }
                      fill={isFav ? "currentColor" : "none"}
                    />
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
}
