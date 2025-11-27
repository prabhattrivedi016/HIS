import {
  ArrowDownWideNarrow,
  Download,
  Grid,
  List,
  RefreshCcw,
  Search,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { VIEWTYPE } from "../../constants/constants";
import Button from "../customButton";
import InputField from "../customInputField";

const PageHeader = ({
  title,
  onCardView,
  buttonTitle,
  onRefresh,
  onSearch,
  onAddNew,
  onDownload,
  onFilter,
  hideShowColumn,
  view,
}) => {
  const [selectDropDown, setSelectDropDown] = useState("");

  // dropdown select handler
  const selectHandler = e => {
    setSelectDropDown(e.target.value);
  };

  // handle search
  const handleSearch = e => {
    const text = e.target.value;
    onSearch(text, selectDropDown);
  };

  return (
    <header
      className="px-4 py-6 bg-gray-50 mx-2
"
    >
      <div
        className="
          flex
          flex-col
          md:flex-row
          items-start
          md:items-center
          justify-between
          w-full
          gap-4
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

        <div
          className="
            flex
            flex-wrap
            items-center
            justify-start
            gap-2
            w-full
            md:w-auto
          "
        >
          {/* filter Icon*/}

          {view === VIEWTYPE.LIST && (
            <span
              className="p-1.5 rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-200 "
              title="filter"
            >
              <InputField>
                <select onChange={selectHandler}>
                  <option value="">Select</option>
                  {onFilter?.map((col, index) => (
                    <option key={index} value={col.label}>
                      {col.label}
                    </option>
                  ))}
                </select>
              </InputField>
            </span>
          )}

          {/* Search Input */}
          <div className="relative w-full sm:w-64 ">
            <InputField className="ph-search-theme">
              <input
                type="text"
                placeholder="Search"
                className="w-full py-2 pl-9 border border-gray-300 bg-white text-gray-600 rounded focus:outline-none focus:border-gray-400 active:scale-95 "
                onChange={handleSearch}
              />
            </InputField>
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500">
              <Search size={16} />
            </span>
          </div>

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

            <button className="p-2.5 ph-button-theme" title="Download" onClick={onDownload}>
              <Download size={16} />
            </button>

            {/* hiding dropdown */}

            {view === VIEWTYPE.LIST && (
              <button
                className="p-2  ph-button-theme"
                title="Hide/Show Columns"
                onClick={hideShowColumn}
              >
                <ArrowDownWideNarrow size={20} />
              </button>
            )}

            <Button
              variant="addButtons"
              type="submit"
              onClick={() => {
                onAddNew?.();
              }}
            >
              <UserPlus size={16} /> {buttonTitle}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
