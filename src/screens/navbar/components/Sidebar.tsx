import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import InputField from "../../../components/customInputField";
import CustomLoader from "../../../components/customLoader";
import FavRoleButtonToggle from "../../../components/FavouriteRoleToggleButton";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { useAuthorizedPages } from "../../../store/useAuthorizedPages";
import Header from "../../header";
import { PageItem, TabItem } from "../types";

const Sidebar = () => {
  const { authorizedPages } = useAuthorizedPages();
  const { loading, fetchApi } = useGlobalApi();
  const branchId = localStorage?.getItem("branchId");
  const roleId = localStorage?.getItem("selectedRoleId");
  const userId = localStorage?.getItem("userId");

  const location = useLocation();
  const sidebarRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openTabs, setOpenTabs] = useState({});
  const [search, setSearch] = useState("");
  const [contextMenu, setContextMenu] = useState(null);
  const [marked, setMarked] = useState(false);

  useEffect(() => {
    const resize = () => setSidebarOpen(window.innerWidth >= 768);
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    if (!sidebarOpen) setOpenTabs({});
  }, [sidebarOpen]);

  useEffect(() => {
    const handleOutsideClick = e => {
      if (
        window.innerWidth < 768 &&
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        setSidebarOpen(false);
        setOpenTabs({});
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [sidebarOpen]);

  const toggleTab = tabId => {
    setOpenTabs(prev => (prev[tabId] ? {} : { [tabId]: true }));
  };

  const closeOnMobile = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
      setOpenTabs({});
    }
  };

  const filteredTabs = useMemo(() => {
    if (!authorizedPages) return [];

    return authorizedPages
      .map(tab => {
        const filteredPages = tab.pages?.filter(page =>
          page.subMenuName.toLowerCase().includes(search.toLowerCase())
        );

        if (!filteredPages || filteredPages.length === 0) return null;

        return {
          ...tab,
          pages: filteredPages,
        };
      })
      .filter(Boolean);
  }, [authorizedPages, search]);

  useEffect(() => {
    if (!search) {
      setOpenTabs({});
      return;
    }

    const autoOpenTabs = {};
    filteredTabs?.forEach(tab => {
      autoOpenTabs[tab?.tabName?.tabId] = true;
    });

    setOpenTabs(autoOpenTabs);
  }, [search, filteredTabs]);

  useEffect(() => {
    const closeMenu = (e: MouseEvent) => {
      if (!(e.target instanceof HTMLElement)) return;

      if (e.target?.closest("[data-context-menu]")) return;
      setContextMenu(null);
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  });

  // right click button handler
  const rightClickButtonHandler = async (page: PageItem) => {
    const response = await fetchApi("POST", ENDPOINTS.SAVE_ROLE_WISE_USER_FAVORITE_SUBMENU, {
      branchId,
      userId,
      roleId,
      subMenuId: page?.subMenuId,
    });
    if (!response) return;
    setMarked(true);
  };

  return (
    <div className="flex min-h-screen">
      {/* side bar */}
      <aside
        ref={sidebarRef}
        className={`
          fixed inset-y-0 left-0 z-30 bg-gray-100
          transition-all duration-300 ease-in-out
          md:translate-x-0
          ${sidebarOpen ? "md:w-60" : "md:w-16"}
          w-60
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Right border */}
        <div className="absolute right-0 top-[10vh] h-[90vh]  bg-gray-300" />

        {/* Header */}
        <div className="h-16 bg-[#0b5394] flex items-center justify-between px-3">
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white text-xl">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-4rem)] p-2 overflow-y-auto">
          {sidebarOpen && (
            <InputField>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="input-field mb-2"
              />
            </InputField>
          )}

          {filteredTabs.map((tab: TabItem) => {
            const tabId = tab?.tabName?.tabId;
            const isOpen = openTabs[tabId];

            return (
              <div key={tabId} className="relative group mb-2">
                {/*tab button */}
                <button
                  onClick={() => sidebarOpen && toggleTab(tabId)}
                  className={`
                    w-full flex items-center py-2 rounded duration-1000
                    ${sidebarOpen ? "justify-between px-3" : "justify-center"}
                  `}
                >
                  <div className="flex items-center gap-2">
                    {tab?.tabName?.iconClass && (
                      <i className={`text-xl ${tab?.tabName?.iconClass}`} />
                    )}
                    {sidebarOpen && (
                      <span className="text-md font-bold">{tab?.tabName?.tabName}</span>
                    )}
                  </div>

                  {sidebarOpen && (
                    <span>{isOpen ? <ChevronLeft size={18} /> : <ChevronDown size={18} />}</span>
                  )}
                </button>
                {/* hover popup*/}
                {!sidebarOpen && (
                  <div
                    className=" left-7 ml-1 
                        pointer-events-none
                        group-hover:pointer-events-auto
                        group-hover:opacity-100
                        opacity-0
                        transition-opacity duration-200
                        fixed z-20
                      "
                  >
                    {/* popup on hovering on icons */}

                    <div className="relative bg-gray-800 text-white rounded-lg shadow-xl min-w-[220px]">
                      {/* small connector dot */}
                      <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45" />

                      {/* Title */}
                      <p className="font-semibold px-4 py-2 border-b border-white/10">
                        {tab?.tabName?.tabName}
                      </p>

                      {/* Pages */}
                      <div className="flex flex-col gap-1 max-h-60 overflow-auto p-1">
                        {tab?.pages?.map(page => (
                          <NavLink
                            key={page?.subMenuId}
                            to={`/${page?.url}`}
                            onClick={closeOnMobile}
                            className={() =>
                              "text-sm  py-1.5 px-4 rounded transition-colors duration-150 hover:bg-white/20"
                            }
                          >
                            {page?.subMenuName}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {/* authorized pages */}

                <AnimatePresence>
                  {sidebarOpen && isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0.5 }}
                      animate={{ height: "auto", opacity: 0.5 }}
                      exit={{ height: 0, opacity: 0.5 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      className="m-2 bg-gray-50 pl-5 text-black-600 font-semibold text-md flex flex-col overflow-hidden"
                    >
                      {tab?.pages?.map(page => {
                        const path = `/${page?.url}`;

                        return (
                          <div key={page?.subMenuId} className="relative flex">
                            <NavLink
                              to={path}
                              onClick={closeOnMobile}
                              onContextMenu={e => {
                                e.preventDefault();
                                // e.stopPropagation();
                                setContextMenu({
                                  id: page.subMenuId,
                                  x: e.clientX,
                                  y: e.clientY,
                                });
                              }}
                              className={({ isActive }) =>
                                `block w-full px-3 py-2 rounded transition hover:bg-gray-300 ${
                                  isActive || location.pathname.startsWith(path)
                                    ? "bg-gray-200"
                                    : ""
                                }`
                              }
                            >
                              {page.subMenuName}
                            </NavLink>

                            {/* RIGHT CLICK MENU */}
                            <AnimatePresence>
                              {contextMenu?.id === page.subMenuId && (
                                <motion.div
                                  data-context-menu
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  transition={{ duration: 0.12 }}
                                  style={{
                                    position: "fixed",
                                    top: contextMenu.y,
                                    left: contextMenu.x,
                                  }}
                                  className="w-40 bg-gray bg-linear-to-br from-indigo-700 to-blue-700 shadow-lg rounded-md z-9999"
                                >
                                  <button
                                    className="w-full px-4 py-2 text-center text-white active:scale-95 hover:scale-105"
                                    onClick={() => {
                                      rightClickButtonHandler(page);
                                      setContextMenu(null);
                                    }}
                                  >
                                    Mark Quick Link
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </aside>

      <div
        className={`
          flex-1 flex flex-col transition-all duration-300
          ${sidebarOpen ? "md:ml-60" : "md:ml-16"}
        `}
      >
        <Header toggleSidebar={() => setSidebarOpen(p => !p)} isSidebarOpen={sidebarOpen} />

        {/* fav role toggle button  */}
        <FavRoleButtonToggle />
        {/* page content */}
        <main className="flex-1 bg-gray-50 p-4 pt-20 overflow-auto">
          <Outlet />
        </main>
      </div>
      {loading ? <CustomLoader isLoading={loading} /> : <></>}
    </div>
  );
};

export default Sidebar;
