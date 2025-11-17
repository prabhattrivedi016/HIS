import { Download, Grid, List, RefreshCcw, Search, UserPlus } from "lucide-react";
import { NavLink } from "react-router-dom";
import { VIEWTYPE } from "../../constants/constants";

const PageHeader = ({ title, onCardView, buttonTitle }) => {
  return (
    <header className="px-4 py-6 bg-gray-50 mx-2">
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
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search"
              className="w-full p-2 pl-9 border border-gray-300 bg-white text-gray-600 rounded focus:outline-none focus:border-gray-400"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500">
              <Search size={16} />
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              className="p-2.5 rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-200"
              title="Grid View"
              onClick={() => onCardView(VIEWTYPE?.GRID)}
            >
              <Grid size={15} />
            </button>

            <button
              className="p-2.5 rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-200"
              title="List View"
              onClick={() => onCardView(VIEWTYPE?.LIST)}
            >
              <List size={15} />
            </button>

            <button
              className="p-2.5 rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-100"
              title="Refresh"
            >
              <RefreshCcw size={16} />
            </button>

            <button
              className="p-2.5 rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-100"
              title="Download"
            >
              <Download size={16} />
            </button>

            <button
              className="
                flex
                items-center
                gap-2
                px-4
                py-2
                bg-[#1e6da1]
                text-white
                rounded
                hover:bg-blue-600
                font-medium
                transition-colors
                whitespace-nowrap
              "
            >
              <UserPlus size={16} /> {buttonTitle}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
