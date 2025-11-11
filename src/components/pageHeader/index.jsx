import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Download,
  RefreshCcw,
  Search,
  UserPlus,
  Grid,
  List,
} from "lucide-react";

const PageHeader = ({
  onClick,
  title,
  buttonTitle,
  onGridView,
  onListView,
  onSearch,
}) => {
  const [searchValue, setSearchValue] = useState("");

  // handle search button
  const handleChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch?.(value);
  };
  return (
    <header className=" px-4 py-6 bg-gray-50 mx-2">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-4">
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

        {/* Action Section */}
        <div className="flex items-center gap-2 mx-2">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search"
              value={searchValue}
              onChange={handleChange}
              className="w-full p-2 pl-9 border border-gray-300 bg-white text-gray-600 rounded focus:outline-none focus:border-gray-400"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500">
              <Search size={16} />
            </span>
          </div>

          <button
            className="p-2.5 rounded transition-colors border border-gray-200  bg-white text-black-300 hover:bg-gray-200"
            title="Grid View"
            onClick={onGridView}
          >
            <Grid size={15} />
          </button>

          <button
            className="p-2.5 rounded transition-colors border border-gray-200  bg-white text-black-300 hover:bg-gray-200"
            title="List View"
            onClick={onListView}
          >
            <List size={15} />
          </button>

          <button className="p-2.5 border border-gray-300 bg-white text-gray-600 rounded hover:bg-gray-100 transition-colors">
            <RefreshCcw size={16} />
          </button>

          <button className="p-2.5 border border-gray-300 bg-white text-gray-600 rounded hover:bg-gray-100 transition-colors">
            <Download size={16} />
          </button>

          <button
            className="flex items-center gap-2 px-4 py-2 bg-[#1e6da1] text-white rounded hover:bg-blue-600 transition-colors font-medium"
            onClick={onClick}
          >
            <UserPlus size={16} /> {buttonTitle}
          </button>
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
