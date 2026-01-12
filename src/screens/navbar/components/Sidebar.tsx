import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import InputField from "../../../components/customInputField";
import CustomLoader from "../../../components/customLoader";
import FavRoleButtonToggle from "../../../components/FavouriteRoleToggleButton";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { useAuthorizedPages } from "../../../store/useAuthorizedPages";
import { getAuthStorage } from "../../../utils/authStorage";
import Header from "../../header";
import { PageItem, TabItem } from "../types";

type HoverPopupState = {
  top: number;
  left: number;
  tab: TabItem;
};

const Sidebar = () => {
  const { authorizedPages } = useAuthorizedPages();
  const { loading, fetchApi } = useGlobalApi();

  const storage = getAuthStorage();
  const branchId = Number(storage.getItem("branchId") || 0);
  const roleId = Number(storage.getItem("roleId") || 0);
  const userId = Number(storage.getItem("userId") || 0);

  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openTabs, setOpenTabs] = useState<Record<number, boolean>>({});
  const [search, setSearch] = useState("");
  const [contextMenu, setContextMenu] = useState<{
    id: number;
    x: number;
    y: number;
  } | null>(null);

  const [hoverPopup, setHoverPopup] = useState<HoverPopupState | null>(null);

  /* ---------------- Responsive Sidebar ---------------- */

  useEffect(() => {
    const resize = () => setSidebarOpen(window.innerWidth >= 768);
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    if (!sidebarOpen) {
      setOpenTabs({});
      setHoverPopup(null);
    }
  }, [sidebarOpen]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        window.innerWidth < 768 &&
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        setSidebarOpen(false);
        setOpenTabs({});
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [sidebarOpen]);

  /* ---------------- Filtering ---------------- */

  const filteredTabs = useMemo(() => {
    if (!authorizedPages) return [];

    return authorizedPages
      .map(tab => {
        const filteredPages = tab.pages?.filter(page =>
          page.subMenuName.toLowerCase().includes(search.toLowerCase())
        );
        if (!filteredPages || filteredPages.length === 0) return null;
        return { ...tab, pages: filteredPages };
      })
      .filter(Boolean) as TabItem[];
  }, [authorizedPages, search]);

  useEffect(() => {
    if (!search) {
      setOpenTabs({});
      return;
    }

    const autoOpen: Record<number, boolean> = {};
    filteredTabs.forEach(tab => {
      autoOpen[tab.tabName.tabId] = true;
    });
    setOpenTabs(autoOpen);
  }, [search, filteredTabs]);

  /* ---------------- Context Menu ---------------- */

  useEffect(() => {
    const closeMenu = (e: MouseEvent) => {
      if (!(e.target instanceof HTMLElement)) return;
      if (e.target.closest("[data-context-menu]")) return;
      setContextMenu(null);
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  const rightClickButtonHandler = async (page: PageItem) => {
    await fetchApi("POST", ENDPOINTS.SAVE_ROLE_WISE_USER_FAVORITE_SUBMENU, {
      branchId,
      userId,
      roleId,
      subMenuId: page.subMenuId,
    });
  };

  return (
    <div className="flex min-h-screen">
      {/*------------------------------------sidebar-------------------------------------- */}
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

          {filteredTabs.map(tab => {
            const tabId = tab.tabName.tabId;
            const isOpen = openTabs[tabId];

            return (
              <div key={tabId} className="relative group mb-2">
                {/* tab menu */}
                <button
                  onClick={() => sidebarOpen && setOpenTabs(p => ({ [tabId]: !p[tabId] }))}
                  onMouseEnter={e => {
                    if (sidebarOpen) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoverPopup({
                      top: rect.top - 2,
                      left: rect.right - 5,
                      tab,
                    });
                  }}
                  onMouseLeave={() => setHoverPopup(null)}
                  className={`
                    w-full flex items-center py-2 rounded
                    ${sidebarOpen ? "justify-between px-3" : "justify-center"}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <i className={`text-xl ${tab.tabName.iconClass}`} />
                    {sidebarOpen && <span className="font-bold">{tab.tabName.tabName}</span>}
                  </div>

                  {sidebarOpen && (
                    <span>{isOpen ? <ChevronLeft size={18} /> : <ChevronDown size={18} />}</span>
                  )}
                </button>

                {/* ------------------------------pages------------------------ */}
                <AnimatePresence>
                  {sidebarOpen && isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0.5 }}
                      animate={{ height: "auto", opacity: 0.5 }}
                      exit={{ height: 0, opacity: 0.5 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      className="m-2 bg-gray-50 pl-5 font-semibold flex flex-col overflow-hidden"
                    >
                      {tab.pages.map(page => {
                        const path = `/${page.url}`;
                        return (
                          <div key={page.subMenuId} className="relative flex">
                            <NavLink
                              to={path}
                              onContextMenu={e => {
                                e.preventDefault();
                                setContextMenu({
                                  id: page.subMenuId,
                                  x: e.clientX,
                                  y: e.clientY,
                                });
                              }}
                              className={({ isActive }) =>
                                `block w-full px-3 py-2 rounded hover:bg-gray-300 ${
                                  isActive || location.pathname.startsWith(path)
                                    ? "bg-gray-200"
                                    : ""
                                }`
                              }
                            >
                              {page.subMenuName}
                            </NavLink>

                            {/* -----------------------context menu---------------------------*/}
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
                                  className="w-40 bg-linear-to-br from-indigo-700 to-blue-700 shadow-lg rounded-md z-999"
                                >
                                  <button
                                    className="w-full px-4 py-2 text-white"
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

      {/* -----------------------------------main---------------------------------- */}
      <div className={`flex-1 flex flex-col ${sidebarOpen ? "md:ml-60" : "md:ml-16"}`}>
        <Header toggleSidebar={() => setSidebarOpen(p => !p)} isSidebarOpen={sidebarOpen} />
        <FavRoleButtonToggle />
        <main className="flex-1 bg-gray-50 p-4 pt-20 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* -----------------------portal hover menu---------------------------------- */}
      {hoverPopup &&
        createPortal(
          <div
            className="fixed z-999"
            style={{
              top: hoverPopup.top,
              left: hoverPopup.left,
            }}
            onMouseEnter={() => setHoverPopup(hoverPopup)}
            onMouseLeave={() => setHoverPopup(null)}
          >
            <div className="relative bg-gray-800 text-white rounded-lg shadow-xl min-w-[220px]">
              {/* Arrow at top */}
              <span className="absolute -left-1 top-4 w-2 h-2 bg-gray-800 rotate-45" />

              <p className="font-semibold px-4 py-2 border-b border-white/10">
                {hoverPopup.tab.tabName.tabName}
              </p>

              <div className="flex flex-col gap-1 max-h-60 overflow-auto p-1">
                {hoverPopup.tab.pages.map(page => (
                  <NavLink
                    key={page.subMenuId}
                    to={`/${page.url}`}
                    className="px-4 py-1.5 rounded hover:bg-white/20"
                  >
                    {page.subMenuName}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}

      {loading && <CustomLoader isLoading />}
    </div>
  );
};

export default Sidebar;
