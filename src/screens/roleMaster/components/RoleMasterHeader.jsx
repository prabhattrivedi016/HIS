import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Download, RefreshCcw, Search, UserPlus } from "lucide-react";
import RoleMasterDrawer from "./RoleMasterDrawer";

const RoleMasterHeader = ({ viewMode, setViewMode }) => {
  const [openDrawer, setOpenDrawer] = useState(false);

  return (
    <header className=" px-4 py-6 bg-gray-100 mx-2">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-4">
        {/* Title Section */}
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">Role Master</h1>
          <nav className="text-sm text-gray-500">
            <NavLink to="/dashboard" className="hover:underline">
              Home
            </NavLink>
            <span className="mx-2">»</span>
            <span>Role Master</span>
          </nav>
        </div>

        {/* Action Section */}
        <div className="flex items-center gap-2 mx-2">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search"
              className="w-full p-2 pl-9 border border-gray-300 bg-white text-gray-600 rounded focus:outline-none focus:border-gray-400"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500">
              <Search size={16} />
            </span>
          </div>

          <button className="p-2.5 border border-gray-300 bg-white text-gray-600 rounded hover:bg-gray-100 transition-colors">
            <RefreshCcw size={16} />
          </button>

          <button className="p-2.5 border border-gray-300 bg-white text-gray-600 rounded hover:bg-gray-100 transition-colors">
            <Download size={16} />
          </button>

          <button
            className="flex items-center gap-2 px-4 py-2 bg-[#1e6da1] text-white rounded hover:bg-blue-600 transition-colors font-medium"
            onClick={() => setOpenDrawer(true)}
          >
            <UserPlus size={16} /> Add New Role
          </button>
        </div>
      </div>

      {/* Drawer Component */}
      <RoleMasterDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
      />
    </header>
  );
};

export default RoleMasterHeader;
