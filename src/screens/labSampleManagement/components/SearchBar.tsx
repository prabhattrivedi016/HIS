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
  TestTube,
  Zap,
} from "lucide-react";
import { Activity, Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import { CorporateItem, FilterTypeItem, SampleManagementItem, ViewMode } from "../types";

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

  // buttons click
  const allButtonClickHandler = () => {
    setViewMode("test");
    setActiveButton("allClicked");
    onFilterButtonClick?.("allClicked");
  };

  // buttons click
  const collectionPendingClickHandler = () => {
    setViewMode("test");

    setActiveButton("collectionPendingClicked");
    onFilterButtonClick?.("collectionPendingClicked");
  };

  // buttons click
  const sampleCollectedClickHandler = () => {
    setViewMode("test");

    setActiveButton("sampleCollectedClicked");
    onFilterButtonClick?.("sampleCollectedClicked");
  };

  // buttons click
  const sampleRejectedClickHandler = () => {
    setViewMode("test");

    setActiveButton("sampleRejectedClicked");
    onFilterButtonClick?.("sampleRejectedClicked");
  };

  // buttons click
  const departmentReceivingPendingClickHandler = () => {
    setViewMode("test");

    setActiveButton("departmentReceivingPendingClicked");
    onFilterButtonClick?.("departmentReceivingPendingClicked");
  };

  // buttons click
  const departmentReceivedClickHandler = () => {
    setViewMode("test");

    setActiveButton("departmentReceiveClicked");
    onFilterButtonClick?.("departmentReceiveClicked");
  };

  // buttons click
  const resultPendingClickHandler = () => {
    setViewMode("test");

    setActiveButton("resultPendingClicked");
    onFilterButtonClick?.("resultPendingClicked");
  };

  // buttons click
  const reportApprovalPendingClickHandler = () => {
    setViewMode("test");

    setActiveButton("reportApprovalPendingClicked");
    onFilterButtonClick?.("reportApprovalPendingClicked");
  };

  // buttons click
  const holdClickHandler = () => {
    setViewMode("test");

    setActiveButton("holdClicked");
    onFilterButtonClick?.("holdClicked");
  };

  // buttons click
  const dispatchedClickHandler = () => {
    setViewMode("test");

    setActiveButton("dispatchedClicked");
    onFilterButtonClick?.("dispatchedClicked");
  };

  const printedClickHandler = () => {
    setViewMode("test");

    setActiveButton("printedClicked");
    onFilterButtonClick?.("printedClicked");
  };
  const urgentClickHandler = () => {
    setViewMode("test");

    setActiveButton("urgentClicked");
    onFilterButtonClick?.("urgentClicked");
  };
  const abnormalClickHandler = () => {
    setViewMode("test");
    setActiveButton("abnormalClicked");
    onFilterButtonClick?.("abnormalClicked");
  };
  const approvedClickHandler = () => {
    setViewMode("test");
    setActiveButton("approvedClicked");
    onFilterButtonClick?.("approvedClicked");
  };

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
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
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
            {/* ================= ROW 1 ================= */}
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

              <InputField label="Sample Type">
                <select
                  name="sampleType"
                  value={filters.sampleType}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="All">All</option>
                  <option value="Blood (EDTA)">Blood (EDTA)</option>
                  <option value="Serum">Serum</option>
                  <option value="Urine">Urine</option>
                </select>
              </InputField>

              <InputField label="Status">
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="All">All</option>
                  <option value="Received">Received</option>
                  <option value="Processing">Processing</option>
                </select>
              </InputField>

              {/* ================= ROW 2 ================= */}

              <InputField label="Priority">
                <select
                  name="priority"
                  value={filters.priority}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="All">All</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                </select>
              </InputField>

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
        className="card mt-2 "
        style={{
          backgroundColor: "transparent",
          border: "none",
          boxShadow: "none",
          paddingBottom: 0,
        }}
      >
        {/* 1 */}
        <div className="flex items-center gap-3 text-xs font-semibold overflow-x-auto whitespace-nowrap py-2 [&::-webkit-scrollbar]:h-1.5">
          <div
            className={`inline-flex items-center gap-2 shrink-0 cursor-pointer ${getButtonClass("allClicked")}`}
            onClick={allButtonClickHandler}
          >
            <Layers size={14} className={getIconClass("allClicked", "text-purple-600")} />
            <span>
              All: <span>{getCountValues?.all}</span>
            </span>
          </div>

          {/* 2 */}
          <div
            className={`inline-flex items-center gap-2 shrink-0 cursor-pointer ${getButtonClass("collectionPendingClicked")}`}
            onClick={collectionPendingClickHandler}
          >
            <Hourglass
              size={14}
              className={getIconClass("collectionPendingClicked", "text-purple-600")}
            />
            <span>
              CollectionPending: <span>{getCountValues?.collectionPending}</span>
            </span>
          </div>

          {/* 3 */}
          <div
            className={`inline-flex items-center gap-2 shrink-0 cursor-pointer ${getButtonClass("sampleCollectedClicked")}`}
            onClick={sampleCollectedClickHandler}
          >
            <TestTube
              size={14}
              className={getIconClass("sampleCollectedClicked", "text-amber-600")}
            />
            <span>
              Sample Collected: <span>{getCountValues?.sampleCollected}</span>
            </span>
          </div>

          {/* 4 */}
          <div
            className={`inline-flex items-center gap-2 shrink-0 cursor-pointer ${getButtonClass("sampleRejectedClicked")}`}
            onClick={sampleRejectedClickHandler}
          >
            <Ban size={14} className={getIconClass("sampleRejectedClicked", "text-red-600")} />
            <span>
              Sample Rejected: <span>{getCountValues?.sampleRejected}</span>
            </span>
          </div>

          {/* 5 */}
          <div
            className={`inline-flex items-center gap-2 shrink-0 cursor-pointer ${getButtonClass("departmentReceivingPendingClicked")}`}
            onClick={departmentReceivingPendingClickHandler}
          >
            <Inbox
              size={14}
              className={getIconClass("departmentReceivingPendingClicked", "text-blue-500")}
            />
            <span>
              Dept. Receiving Pending: <span>{getCountValues?.departmentReceivingPending}</span>
            </span>
          </div>

          {/* 6 */}
          <div
            className={`inline-flex items-center gap-2 shrink-0 cursor-pointer ${getButtonClass("departmentReceivedClicked")}`}
            onClick={departmentReceivedClickHandler}
          >
            <CheckCheck
              size={14}
              className={getIconClass("departmentReceivedClicked", "text-blue-500")}
            />
            <span>
              Department Received: <span>{getCountValues?.departmentReceived}</span>
            </span>
          </div>

          {/* 7 */}
          <div
            className={`inline-flex items-center gap-2 shrink-0 cursor-pointer ${getButtonClass("resultPendingClicked")}`}
            onClick={resultPendingClickHandler}
          >
            <Activity size={14} className={getIconClass("resultPendingClicked", "text-pink-600")} />
            <span>
              Result Pending: <span>{getCountValues?.resultPending}</span>
            </span>
          </div>

          {/* 8 */}
          <div
            className={`inline-flex items-center gap-2 shrink-0 cursor-pointer ${getButtonClass("reportApprovalPendingClicked")}`}
            onClick={reportApprovalPendingClickHandler}
          >
            <FileText
              size={14}
              className={getIconClass("reportApprovalPendingClicked", "text-blue-500")}
            />
            <span>
              Report Approval Pending: <span>{getCountValues?.reportApprovalPending}</span>
            </span>
          </div>

          {/* 9 */}
          <div
            className={`inline-flex items-center gap-2 shrink-0 cursor-pointer ${getButtonClass("holdClicked")}`}
            onClick={holdClickHandler}
          >
            <PauseCircle size={14} className={getIconClass("holdClicked", "text-amber-500")} />
            <span>
              Hold: <span>{getCountValues?.hold}</span>
            </span>
          </div>

          {/* 10 */}
          <div
            className={`inline-flex items-center gap-2 shrink-0 cursor-pointer ${getButtonClass("approvedClicked")}`}
            onClick={approvedClickHandler}
          >
            <CheckCircle
              size={14}
              className={getIconClass("approvedClicked", "text-emerald-600")}
            />
            <span>
              Approved: <span>{getCountValues?.approved}</span>
            </span>
          </div>

          {/* 11 */}
          <div
            className={`inline-flex items-center gap-2 shrink-0 cursor-pointer ${getButtonClass("dispatchedClicked")}`}
            onClick={dispatchedClickHandler}
          >
            <Send size={14} className={getIconClass("dispatchedClicked", "text-emerald-700")} />
            <span>
              Dispatched: <span>{getCountValues?.dispatched}</span>
            </span>
          </div>

          {/* 12 */}
          <div
            className={`inline-flex items-center gap-2 shrink-0 cursor-pointer ${getButtonClass("printedClicked")}`}
            onClick={printedClickHandler}
          >
            <Printer size={14} className={getIconClass("printedClicked", "text-blue-600")} />
            <span>
              Printed: <span>{getCountValues?.printed}</span>
            </span>
          </div>

          {/* 13 */}
          <div
            className={`inline-flex items-center gap-2 shrink-0 cursor-pointer ${getButtonClass("urgentClicked")}`}
            onClick={urgentClickHandler}
          >
            <Zap size={14} className={getIconClass("urgentClicked", "text-blue-600")} />
            <span>
              Urgent: <span>{getCountValues?.urgent}</span>
            </span>
          </div>

          {/* 14 */}
          <div
            className={`inline-flex items-center gap-2 shrink-0 cursor-pointer ${getButtonClass("abnormalClicked")}`}
            onClick={abnormalClickHandler}
          >
            <AlertCircle size={14} className={getIconClass("abnormalClicked", "text-blue-600")} />
            <span>
              Abnormal: <span>{getCountValues?.abnormal}</span>
            </span>
          </div>
        </div>
      </div>
      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
}
