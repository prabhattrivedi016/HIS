import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import Header from "../../header/index";

export default function Layout() {
  const [openMenu, setOpenMenu] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true); // Sidebar always open on desktop
      } else {
        setSidebarOpen(false); // Sidebar hidden on mobile
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen">
      {/* SIDEBAR */}
      <div
        className={`
          absolute md:fixed inset-y-0 left-0 z-50 w-60 
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* TOP BAR (Header color, height 16) */}
        <div className="h-16 bg-[#0b5394] w-full"></div>

        {/* SIDEBAR CONTENT (White background) */}
        <div className="bg-white h-[calc(100%-4rem)] p-4 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Navigation</h2>

          {/* Menu toggle */}
          <button
            onClick={() => setOpenMenu(open => !open)}
            className="w-full flex justify-between items-center px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
          >
            <span className="font-medium">Master</span>
            <span className="text-lg">{openMenu ? "▲" : "▼"}</span>
          </button>

          {/* Dropdown items */}
          {openMenu && (
            <div className="mt-2 flex flex-col space-y-1 pl-3">
              <Link to="/dashboard" className="px-3 py-2 rounded hover:bg-gray-200 text-sm">
                Dashboard
              </Link>
              <Link to="/role-master" className="px-3 py-2 rounded hover:bg-gray-200 text-sm">
                Role Master
              </Link>
              <Link to="/user-master" className="px-3 py-2 rounded hover:bg-gray-200 text-sm">
                User Master
              </Link>
            </div>
          )}

          {/* Close button (mobile only) */}
          <button
            onClick={toggleSidebar}
            className="absolute top-4 right-4 p-1 rounded hover:bg-gray-200 md:hidden"
          >
            ✕
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div
        className={`
          flex-1 flex flex-col transition-all duration-300
          ${sidebarOpen ? "md:ml-60" : "md:ml-0"}
        `}
      >
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />

        <main className="flex-1 bg-gray-50 p-4 pt-20 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
