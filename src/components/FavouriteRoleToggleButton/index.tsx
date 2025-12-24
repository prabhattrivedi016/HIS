import { useEffect, useState } from "react";
import { ENDPOINTS } from "../../config/defaults";
import useGlobalApi from "../../hooks/useGlobalApi";
import { useAuthorizedPages } from "../../store/useAuthorizedPages";
import { RoleValue, SubMenuValue, TabValue } from "./types";

const FavRoleButtonToggle = () => {
  const branchId = localStorage.getItem("branchId");

  const { fetchApi } = useGlobalApi();
  const { setAuthorizedPages } = useAuthorizedPages();

  const [favRole, setFavRole] = useState<RoleValue[]>([]);
  const [tabs, setTabs] = useState<TabValue[]>([]);
  const [subMenu, setSubMenu] = useState<SubMenuValue[]>([]);
  const [favoriteSubMenu, setFavoriteSubMenu] = useState<SubMenuValue[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleValue | null>(null);

  const getRoles = async () => {
    const response = await fetchApi("GET", ENDPOINTS.GET_USER_ROLES, {}, { params: { branchId } });

    if (!response) return;

    const favoriteRoles =
      response.data?.filter((role: RoleValue) => role.isFavoriteRole === 1) ?? [];

    setFavRole(favoriteRoles);
  };

  useEffect(() => {
    if (!branchId) return;
    getRoles();
  }, [branchId]);

  const favRoleHandler = async (role: RoleValue) => {
    setSelectedRole(role);

    const response = await fetchApi(
      "GET",
      ENDPOINTS.GET_USER_TAB_SUB_MENU_MAPPING,
      {},
      { params: { branchId, roleId: role.roleId } }
    );

    if (!response) return;

    setTabs(response.data?.tabs ?? []);
    setSubMenu(response.data?.subMenus ?? []);
    setFavoriteSubMenu(response.data?.favoriteSubMenus ?? []);
  };

  useEffect(() => {
    if (!selectedRole || !tabs.length) return;

    const quickLinksTab = {
      tabName: {
        tabId: 0,
        tabName: "Quick Links",
        iconClass: "fa-solid fa-star",
      },
      pages: favoriteSubMenu.map(item => ({
        ...item,
        tabId: 0,
      })),
      selectedRole,
    };

    const normalTabs = tabs.map(tab => ({
      tabName: {
        tabId: tab.tabId,
        tabName: tab.tabName.trim(),
        iconClass: tab.iconClass,
      },
      pages: subMenu.filter(page => page.tabId === tab.tabId),
      selectedRole,
    }));

    setAuthorizedPages([quickLinksTab, ...normalTabs]);
  }, [tabs, subMenu, favoriteSubMenu, selectedRole]);

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-[999] flex flex-col items-center gap-3">
      {favRole.map(role => (
        <div key={role.roleId} className="relative group">
          <button
            className="w-10 h-10 p-2 rounded-2xl bg-linear-to-br from-indigo-400/70 to-purple-400/70
                       text-white flex items-center justify-center transition
                       active:scale-95 hover:scale-110"
            onClick={() => favRoleHandler(role)}
          >
            <i className={`${role.iconClass} fa-lg`} />
          </button>

          {/* Hover Card */}
          <div
            className="absolute right-full mr-3 top-1/2 -translate-y-1/2
                       w-32 bg-linear-to-br from-green-400 to-blue-300
                       rounded-xl shadow-xl p-2 opacity-0 scale-95
                       group-hover:opacity-100 group-hover:scale-100
                       transition-all duration-200 z-50 pointer-events-none"
          >
            <div className="flex justify-center mb-2">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <i className={`${role?.iconClass} text-green-700 text-2xl`} />
              </div>
            </div>

            <p className="text-center text-green-700 font-semibold text-sm truncate">
              {role?.roleName}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FavRoleButtonToggle;
