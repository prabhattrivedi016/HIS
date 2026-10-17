import Animation from "@/components/animation";
import CustomDateInput from "@/components/customDateInput";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { SubSubCategoryItem } from "@/types";
import {
  Building2,
  Clock,
  Droplet,
  Folder,
  Microscope,
  Printer,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
  XCircle,
} from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { CorporateItem, FilterTypeItem } from "../types";

export default function SearchBar({
  filters,
  setFilters,
  onClick,
  onFilterButtonClick,
}: {
  filters: FilterTypeItem;
  setFilters: Dispatch<SetStateAction<FilterTypeItem>>;
  onClick: () => void;
  onFilterButtonClick: (buttonType: string) => void;
}) {
  const { loading, fetchApi } = useGlobalApi();
  const [subSubCategoryList, setSubSubCategoryList] = useState<SubSubCategoryItem[]>([]);
  const [corporateMasterList, setCorporateMasterList] = useState<CorporateItem[]>([]);
  const [showSearchInputs, setShowSearchInputs] = useState(false);

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

  const dateChangeHandler = (val: string, date: string) => {
    setFilters((prev: FilterTypeItem) => ({ ...prev, [date]: val }));
  };

  const handleSearch = () => {
    onClick?.();
  };

  return (
    <div className={`card mt-1`}>
      {/* Search button to open/close fields */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setShowSearchInputs(!showSearchInputs)}
          className="flex  gap-1.5 items-center save-btn lg:max-h-8"
        >
          <Search size={14} />
          <span>{showSearchInputs ? "Hide Search Filters" : "Open Search Filters"}</span>
        </button>
      </div>

      {/* Collapsible search fields */}
      {showSearchInputs && (
        <Animation>
          <div className="transition-all duration-300 ease-in-out space-y-3 mb-4 pt-2 border-t border-blue-200">
            {/* ================= ROW 1 ================= */}
            <div className="form-grid-5">
              <InputField label="Barcode">
                <input
                  type="text"
                  name="barCode"
                  value={filters.barCode}
                  onChange={handleChange}
                  placeholder="Search..."
                  className="input-field"
                />
              </InputField>

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
              <InputField label="From Date">
                <CustomDateInput
                  value={filters?.fromDate}
                  onChange={(val: string) => dateChangeHandler(val, "fromDate")}
                />
              </InputField>

              <InputField label="To Date">
                <CustomDateInput
                  value={filters?.toDate}
                  onChange={(val: string) => dateChangeHandler(val, "toDate")}
                />
              </InputField>

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
                <button onClick={handleSearch} className="save-btn !py-2">
                  <span>Search</span>
                </button>
              </div>
            </div>
          </div>
        </Animation>
      )}

      {/* ================= ALWAYS VISIBLE STATUS PILL BADGES ================= */}
      <div
        className="card mt-2"
        style={{
          backgroundColor: "transparent",
          border: "none",
          boxShadow: "none",
          paddingBottom: 0,
        }}
      >
        <div className="flex flex-wrap justify-between items-center gap-x-6 gap-y-3 text-xs font-semibold text-gray-700">
          <div
            className="flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            onClick={() => onFilterButtonClick("newClicked")}
          >
            <Sparkles size={14} className="text-purple-600" />
            <span>New</span>
          </div>

          <div
            className="flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            onClick={() => onFilterButtonClick("allClicked")}
          >
            <Folder size={14} className="text-purple-600" />
            <span>All</span>
          </div>

          <div
            className="flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            onClick={() => onFilterButtonClick("sampleCollectedClicked")}
          >
            <Droplet size={14} className="text-amber-600" />
            <span>Sample Collected</span>
          </div>

          <div
            className="flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            onClick={() => onFilterButtonClick("sampleRejectedClicked")}
          >
            <XCircle size={14} className="text-red-600" />
            <span>Sample Rejected</span>
          </div>

          <div
            className="flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            onClick={() => onFilterButtonClick("departmentReceiveClicked")}
          >
            <Building2 size={14} className="text-blue-500" />
            <span>Department Receive</span>
          </div>

          <div
            className="flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            onClick={() => onFilterButtonClick("testedClicked")}
          >
            <Microscope size={14} className="text-pink-600" />
            <span>Tested</span>
          </div>

          <div
            className="flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            onClick={() => onFilterButtonClick("approvedClicked")}
          >
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Approved</span>
          </div>

          <div
            className="flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            onClick={() => onFilterButtonClick("printedClicked")}
          >
            <Printer size={14} className="text-blue-600" />
            <span>Printed</span>
          </div>

          <div
            className="flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            onClick={() => onFilterButtonClick("holdClicked")}
          >
            <Clock size={14} className="text-amber-500" />
            <span>Hold</span>
          </div>

          <div
            className="flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            onClick={() => onFilterButtonClick("dispatchedClicked")}
          >
            <Truck size={14} className="text-emerald-700" />
            <span>Dispatched</span>
          </div>
        </div>
      </div>
      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
}
