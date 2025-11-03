import { Link, Outlet } from "react-router-dom";
import { useState } from "react";

export default function Sidebar() {
  const [open, setOpen] = useState(true); // dropdown state

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-60 h-screen bg-gray-100 border-r border-gray-300 p-4">
        <h2 className="text-xl font-semibold mb-6">Navigation</h2>

        {/* Dropdown Section */}
        <div>
          <button
            onClick={() => setOpen(!open)}
            className="w-full flex justify-between items-center px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
          >
            <span className="font-medium">Master</span>
            <span className="text-lg">{open ? "▲" : "▼"}</span>
          </button>

          {open && (
            <div className="mt-2 flex flex-col space-y-1 pl-3">
              <Link
                to="/dashboard"
                className="px-3 py-2 rounded hover:bg-gray-200 text-sm font-medium"
              >
                Dashboard
              </Link>

              <Link
                to="/role-master"
                className="px-3 py-2 rounded hover:bg-gray-200 text-sm font-medium"
              >
                Role Master
              </Link>
              <Link
                to="/user-master"
                className="px-3 py-2 rounded hover:bg-gray-200 text-sm font-medium"
              >
                User Master
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Right content area */}
      <div className="flex-1 p-4 bg-white">
        <Outlet />
      </div>
    </div>
  );
}
