import {
  ArrowDownWideNarrow,
  Download,
  FilterIcon,
  Grid,
  List,
  Plus,
  RefreshCcw,
  Search,
  UserPlus,
} from "lucide-react";
import { ChangeEvent, useState } from "react";
import { NavLink } from "react-router-dom";
import { VIEWTYPE } from "../../constants/constants";
import InputField from "../customInputField";
import { PageHeaderProps } from "./types";

const PageHeader = ({
  title,
  onCardView,
  buttonTitle,
  onRefresh,
  onSearch,
  searchValue = "",
  onAddNew,
  onDownload,
  onFilter,
  view,
  hideShowBtnRef,
  onToggleColumnModal,
  downloadBtnRef,
  unitButton,
  onAddUnit,
  showAddButton = true,
  onFilterDiscountApproval,
}: PageHeaderProps) => {
  const [selectDropDown, setSelectDropDown] = useState<string>("");

  const selectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectDropDown(value);
    onSearch?.(searchValue, value);
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    onSearch?.(text, selectDropDown);
  };

  return (
    <header className="px-4 py-6 bg-gray-50 mx-2 -mt-8">
      <div
        className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-4
        "
      >
        {/* Title Section */}
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">{title}</h1>
          <nav className="text-sm text-gray-500">
            <NavLink to="/dashboard" className="hover:underline">
              Home
            </NavLink>
            <span className="mx-2">»</span>
            <span>{title}</span>
          </nav>
        </div>

        <div className=" flex flex-wrap items-center  justify-start gap-2 w-full  md:w-auto">
          {/* filter Icon*/}

          {onFilterDiscountApproval && (
            <button
              type="button"
              className="p-2.5 mt-1 ph-button-theme"
              title="Filter Data"
              onClick={onFilterDiscountApproval}
            >
              <FilterIcon size={18} />
            </button>
          )}

          {view === VIEWTYPE.LIST && onFilter && onFilter.length > 0 && (
            <span className="p-1.5  text-gray-700 " title="Filter by column">
              <InputField>
                <select
                  className=" py-2 pl-9 border border-gray-300 bg-white text-gray-600  placeholder:opacity-40"
                  value={selectDropDown}
                  onChange={selectHandler}
                >
                  <option value="">All Columns</option>
                  {onFilter.map((col, index) => (
                    <option key={index} value={col.label}>
                      {col.label}
                    </option>
                  ))}
                </select>
              </InputField>
            </span>
          )}

          {view === VIEWTYPE.LIST && onSearch && (
            <div className="relative w-full sm:w-64">
              <InputField className="ph-search-theme">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchValue}
                  className="w-full py-2 pl-9 border border-gray-300 bg-white text-gray-600 rounded focus:outline-none focus:border-gray-400  placeholder:opacity-40"
                  onChange={handleSearch}
                />
              </InputField>
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500">
                <Search size={16} />
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              className="p-2.5  ph-button-theme"
              title="Grid View"
              onClick={() => onCardView(VIEWTYPE?.GRID)}
            >
              <Grid size={18} />
            </button>

            <button
              className="p-2.5 rounded  ph-button-theme"
              title="List View"
              onClick={() => onCardView(VIEWTYPE?.LIST)}
            >
              <List size={18} />
            </button>

            <button className="p-2.5  ph-button-theme" title="Refresh" onClick={onRefresh}>
              <RefreshCcw size={16} />
            </button>

            <button
              className="p-2.5 ph-button-theme"
              title="Download"
              onClick={onDownload}
              ref={downloadBtnRef}
            >
              <Download size={16} />
            </button>

            {/* hiding dropdown */}

            {view === VIEWTYPE.LIST && (
              <button
                className="p-2  ph-button-theme"
                title="Hide/Show Columns"
                ref={hideShowBtnRef}
                onClick={onToggleColumnModal}
              >
                <ArrowDownWideNarrow size={20} />
              </button>
            )}

            {showAddButton && (
              <button
                className="addNew-btn "
                type="submit"
                onClick={() => {
                  onAddNew(null);
                }}
              >
                <UserPlus size={16} /> {buttonTitle}
              </button>
            )}

            {unitButton ? (
              <button
                className="addNew-btn "
                type="submit"
                onClick={() => {
                  onAddUnit?.();
                }}
              >
                <Plus size={16} /> {unitButton}
              </button>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
