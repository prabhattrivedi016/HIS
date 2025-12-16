import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuthorizedPages } from "../../../store/useAuthorizedPages";
import Header from "../../header";

const Sidebar = () => {
  const { authorizedPages } = useAuthorizedPages();
  const location = useLocation();

  const tabs = authorizedPages ?? [];

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openTabs, setOpenTabs] = useState({});

  useEffect(() => {
    const resize = () => setSidebarOpen(window.innerWidth >= 768);
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const toggleTab = tabId => {
    setOpenTabs(prev => ({
      ...prev,
      [tabId]: !prev[tabId],
    }));
  };

  return (
    <div className="flex min-h-screen">
      <div
        className={`
          absolute md:fixed inset-y-0 left-0 w-60 bg-white
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="h-16 bg-[#0b5394] w-full" />

        <div className="bg-white h-[calc(100%-4rem)] p-4 overflow-y-auto relative">
          {tabs.map(tab => {
            const tabId = tab?.tabName?.tabId;
            const isOpen = openTabs[tabId] ?? true;

            return (
              <div key={tabId} className="mb-3">
                <button
                  onClick={() => toggleTab(tabId)}
                  className="w-full flex justify-between items-center px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
                >
                  <div className="flex items-center gap-2">
                    {tab?.tabName?.iconClass && <i className={tab?.tabName?.iconClass} />}
                    <span className="font-medium">{tab?.tabName?.tabName}</span>
                  </div>
                  <span className="text-lg">{isOpen ? "▲" : "▼"}</span>
                </button>

                {isOpen && (
                  <div className="mt-2 flex flex-col space-y-1 pl-3">
                    {tab?.pages?.map(page => {
                      const path = `/${page.url}`;

                      // Internal route
                      return (
                        <NavLink
                          key={page.subMenuId}
                          to={path}
                          className={({ isActive }) =>
                            `px-3 py-2 rounded text-sm ${
                              isActive || location.pathname.startsWith(path)
                                ? "bg-blue-100 text-blue-600"
                                : "hover:bg-gray-200"
                            }`
                          }
                        >
                          {page.subMenuName}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Mobile close button */}
          <button
            onClick={toggleSidebar}
            className="absolute top-4 right-4 p-1 rounded hover:bg-gray-200 md:hidden"
          >
            ✕
          </button>
        </div>
      </div>

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
};

export default Sidebar;
