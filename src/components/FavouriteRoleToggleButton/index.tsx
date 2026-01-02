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
    <div className="fixed right-2 md:right-4 top-1/2 -translate-y-1/2 z-999 flex flex-col items-end gap-3">
      {favRole.map(role => (
        <div key={role.roleId} className="group">
          <button
            onClick={() => favRoleHandler(role)}
            className="flex items-center gap-3 h-12 w-12  md:group-hover:w-44 focus:w-44 active:w-44 pr-4 rounded-2xl bg-linear-to-br from-indigo-400/70 to-purple-400/70 text-white shadow-lg  overflow-hidden transition-all duration-300 ease-out  hover:shadow-2xl focus:outline-none active:scale-95  "
          >
            {/* ICON */}
            <span className="flex items-center justify-center w-12 h-12 shrink-0">
              <img
                src={role?.imagePath}
                alt="logo"
                className="w-7 h-7 md:w-8 md:h-8 object-contain"
              />
            </span>

            {/* ROLE NAME */}
            <span className=" whitespace-nowrap font-semibold  opacity-0 -translate-x-2 md:group-hover:opacity-100 md:group-hover:translate-x-0 text-xl focus:opacity-100 focus:translate-x-0 active:opacity-100 active:translate-x-0 transition-all duration-300 delay-100">
              {role?.roleName}
            </span>
          </button>
        </div>
      ))}
    </div>
  );
};

export default FavRoleButtonToggle;
