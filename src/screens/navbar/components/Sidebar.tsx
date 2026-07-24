import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import logo from "../../../../assets/logo.jpg";
import miniLogo from "../../../../assets/mini-logo.png";

import { useAppSelector } from "@/store/hooks";
import InputField from "../../../components/customInputField";
import CustomLoader from "../../../components/customLoader";
import FavRoleButtonToggle from "../../../components/FavouriteRoleToggleButton";
import { ENDPOINTS } from "../../../config/defaults";
import { AuthContext } from "../../../context/AuthContext";
import { RoleContext } from "../../../context/RoleContext";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { useAuthorizedPages } from "../../../store/useAuthorizedPages";
import { getAuthStorage } from "../../../utils/authStorage";
import { normalizeRouteKey } from "../../../utils/route";
import Header from "../../header";
import { PageItem, TabItem } from "../types";
import { hasAccess } from "./accessControl";

type HoverPopupState = {
  top: number;
  left: number;
  tab: TabItem;
};

const Sidebar = () => {
  const authContext = useContext(AuthContext);
  const roleContext = useContext(RoleContext);
  const { authorizedPages } = useAuthorizedPages();
  const { loading, fetchApi } = useGlobalApi();

  const { accessRights: response } = useAppSelector(state => state.accessRights);

  const { refetchAuthorizedPages } = useAuthorizedPages();

  const storage = getAuthStorage();
  const branchId = Number(authContext?.user?.branchId ?? 0);
  let storedRoleId = 0;
  try {
    storedRoleId = Number(JSON.parse(storage.getItem("role") || "{}")?.roleId ?? 0);
  } catch {
    storedRoleId = 0;
  }
  const roleId = Number(roleContext?.roleId ?? 0) || storedRoleId;
  const userId = Number(authContext?.user?.userId ?? 0);

  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openTabs, setOpenTabs] = useState<Record<number, boolean>>({});
  const [search, setSearch] = useState("");
  const [contextMenu, setContextMenu] = useState<{
    id: number;
    x: number;
    y: number;
  } | null>(null);

  const [hoverPopup, setHoverPopup] = useState<HoverPopupState | null>(null);

  /* ---------------- responsive sidebar ---------------- */

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarOpen(false);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--app-sidebar-width",
      window.innerWidth < 768 ? "0px" : sidebarOpen ? "15rem" : "4rem"
    );
  }, [sidebarOpen]);

  /* Close mobile drawer on route change */
  useEffect(() => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, [location.pathname]);

  /* ---------------- close on mobile on outside click---------------- */

  useEffect(() => {
    const handleOutsideClick = (e: globalThis.MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("[data-sidebar-toggle='true']")) {
        return;
      }

      if (
        window.innerWidth < 768 &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    const handleGlobalMouseDown = (e: globalThis.MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("[data-context-menu='true']")) return;
      setContextMenu(null);
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setContextMenu(null);
    };

    document.addEventListener("mousedown", handleGlobalMouseDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleGlobalMouseDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  /* ---------------- Filtering ---------------- */

  const filteredTabs: TabItem[] = useMemo(() => {
    if (!Array.isArray(authorizedPages)) return [];

    return authorizedPages
      .map(tab => {
        const pages = tab.pages?.filter(page =>
          page.subMenuName.toLowerCase().includes(search.toLowerCase())
        );

        if (!pages || pages.length === 0) return null;
        return { ...tab, pages };
      })
      .filter(Boolean) as TabItem[];
  }, [authorizedPages, search]);

  /* ---------------- AUTO EXPAND WHEN SEARCHING ---------------- */

  useEffect(() => {
    if (!search) {
      setOpenTabs({});
      return;
    }

    const expanded: Record<number, boolean> = {};
    filteredTabs.forEach(tab => {
      expanded[tab.tabName.tabId] = true;
    });

    setOpenTabs(expanded);
  }, [search, filteredTabs]);

  /* ---------------- save quick link ---------------- */

  const rightClickButtonHandler = useCallback(
    async (page: PageItem) => {
      await fetchApi("POST", ENDPOINTS.SAVE_ROLE_WISE_USER_FAVORITE_SUBMENU, {
        branchId,
        userId,
        roleId,
        subMenuId: page.subMenuId,
      });
      await refetchAuthorizedPages(roleId, branchId, fetchApi);
    },
    [branchId, userId, roleId, refetchAuthorizedPages]
  );

  /* ---------------- refetch when opening Quick Links tab ---------------- */

  const handleTabClick = useCallback(
    async (tabId: number, isOpen: boolean) => {
      if (sidebarOpen && tabId === 0 && !isOpen) {
        await refetchAuthorizedPages(roleId, branchId, fetchApi);
      }
      setOpenTabs(p => ({ [tabId]: !p[tabId] }));
    },
    [sidebarOpen, roleId, branchId, refetchAuthorizedPages]
  );

  return (
    <div className="flex h-screen min-h-0 overflow-hidden">
      <div
        className={`fixed inset-0 z-20 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      {/*------------------------------------sidebar-------------------------------------- */}
      <aside
        ref={sidebarRef}
        className={`
          fixed inset-y-0 left-0 z-30 bg-gray-100 w-60
          transition-[width,transform] duration-300 ease-in-out
          md:translate-x-0
          ${sidebarOpen ? "md:w-60" : "md:w-16"}
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header logo */}
        <div className="h-16 bg-[#0b5394] flex items-center justify-between px-3 overflow-hidden">
          {sidebarOpen ? (
            // Full Logo + Text (above code)
            <img src={logo} alt=" Logo" className="h-13 w-full m-auto  rounded-lg" />
          ) : (
            <Link to={"/dashboard"}>
              <img src={miniLogo} alt="Mini Logo" className="h-13 w-full rounded-lg m-auto " />
            </Link>
          )}
        </div>

        {/* Content */}
        <div className="sidebar-nav-scroll h-[calc(100%-4rem)] p-2 overflow-y-auto">
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
                  onClick={() => sidebarOpen && handleTabClick(tabId, isOpen)}
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
                    {sidebarOpen && (
                      <span className="font-bold whitespace-nowrap overflow-hidden text-ellipsis ">
                        {tab.tabName.tabName}
                      </span>
                    )}
                  </div>

                  {sidebarOpen && (
                    <span>{isOpen ? <ChevronRight size={18} /> : <ChevronDown size={18} />}</span>
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
                      className="m-2 bg-gray-50 pl-5 font-semibold flex flex-col max-h-64 overflow-y-auto overflow-x-hidden scrollbar-none"
                    >
                      {tab.pages
                        .filter(page => {
                          const pageKey = normalizeRouteKey(page.url);
                          return hasAccess(pageKey, response);
                        })
                        .map(page => {
                          const pageKey = normalizeRouteKey(page.url);
                          const path = `/${pageKey}`;

                          return (
                            <div key={page.subMenuId} className="relative flex">
                              <NavLink
                                to={path}
                                onContextMenu={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setContextMenu({
                                    id: page.subMenuId,
                                    x: Math.min(e.clientX, window.innerWidth - 180),
                                    y: Math.min(e.clientY, window.innerHeight - 80),
                                  });
                                }}
                                className={({ isActive }) =>
                                  `block w-full px-3 py-2 rounded hover:bg-gray-300 whitespace-nowrap overflow-hidden text-ellipsis transition-colors linear-bg-blue-500 to linear-yellow-500 ${
                                    isActive || location.pathname.startsWith(path)
                                      ? "bg-gray-200"
                                      : ""
                                  }`
                                }
                              >
                                {page.subMenuName}
                              </NavLink>

                              <AnimatePresence>
                                {contextMenu?.id === page.subMenuId && (
                                  <motion.div
                                    data-context-menu="true"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    style={{
                                      position: "fixed",
                                      top: contextMenu.y,
                                      left: contextMenu.x,
                                    }}
                                    className="w-40 bg-linear-to-br from-indigo-700 to-blue-700 shadow-lg rounded-md z-999"
                                  >
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        await rightClickButtonHandler(page);
                                        setContextMenu(null);
                                      }}
                                      className="w-full px-1 py-2 text-white active:scale-90"
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
      <div
        className={`flex-1 min-w-0 min-h-0 flex flex-col transition-[margin] duration-300 ease-in-out ${
          sidebarOpen ? "md:ml-60" : "md:ml-16"
        }`}
      >
        <Header toggleSidebar={() => setSidebarOpen(p => !p)} isSidebarOpen={sidebarOpen} />
        <FavRoleButtonToggle />
        <main className="flex-1 min-w-0 min-h-0 overflow-auto bg-gray-50 p-4 pt-20 relative">
          <div className="w-full min-w-0 max-w-full pb-24">
            <Outlet />
          </div>
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

              <div
                className="flex flex-col gap-1 overflow-y-auto overflow-x-hidden scrollbar-none p-1"
                style={{ maxHeight: `${Math.min(hoverPopup.tab.pages.length, 5) * 44}px` }}
              >
                {hoverPopup.tab.pages.map(page => (
                  <NavLink
                    key={page.subMenuId}
                    to={`/${normalizeRouteKey(page.url)}`}
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
