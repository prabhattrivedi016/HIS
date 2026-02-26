import { AuthContext } from "@/context/AuthContext";
import { useContext } from "react";
import { ENDPOINTS } from "../../config/defaults";
import useGlobalApi from "../../hooks/useGlobalApi";
import { useAuthorizedPages } from "../../store/useAuthorizedPages";
import { useFavoriteRoles } from "../../store/useFavouriteRole";
import { RoleValue } from "./types";

const FavRoleButtonToggle = () => {
  const authContext = useContext(AuthContext);
  const branchId = Number(authContext?.user?.branchId ?? 1);

  const { fetchApi } = useGlobalApi();
  const { setAuthorizedPages } = useAuthorizedPages();

  //  single source of truth
  const favoriteRoles = useFavoriteRoles(state => state.favoriteRoles);

  //  nothing to render
  if (!favoriteRoles?.length || !branchId) return null;

  const favRoleHandler = async (role: RoleValue) => {
    const response = await fetchApi(
      "GET",
      ENDPOINTS.GET_USER_TAB_SUB_MENU_MAPPING,
      {},
      { params: { branchId, roleId: role.roleId } }
    );

    if (!response) return;

    const tabs = response.data?.tabs ?? [];
    const subMenus = response.data?.subMenus ?? [];
    const favoriteSubMenus = response.data?.favoriteSubMenus ?? [];

    //  quick links
    const quickLinksTab = {
      tabName: {
        tabId: 0,
        tabName: "Quick Links",
        iconClass: "fa-solid fa-star",
      },
      pages: favoriteSubMenus.map((item: any) => ({
        ...item,
        tabId: 0,
      })),
      selectedRole: role,
    };

    //  normal tabs
    const normalTabs = tabs.map((tab: any) => ({
      tabName: {
        tabId: tab.tabId,
        tabName: tab.tabName.trim(),
        iconClass: tab.iconClass,
      },
      pages: subMenus.filter((page: any) => page.tabId === tab.tabId),
      selectedRole: role,
    }));

    //  single state update
    setAuthorizedPages([quickLinksTab, ...normalTabs]);
  };

  return (
    <div className="fixed right-2 md:right-4 top-1/2 -translate-y-1/2 z-999 flex flex-col items-end gap-3">
      {favoriteRoles.map(role => (
        <div key={role.roleId} className="group">
          <button
            onClick={() => favRoleHandler(role)}
            className="flex items-center gap-3 h-12 w-12  md:group-hover:w-44 focus:w-44 active:w-44 pr-4 rounded-2xl bg-linear-to-br from-indigo-400/70 to-purple-400/70 text-white shadow-lg  overflow-hidden transition-all duration-300 ease-out  hover:shadow-2xl focus:outline-none active:scale-95  "
          >
            {/* ICON */}
            <span className="flex items-center justify-center w-12 h-12 shrink-0">
              <img
                src={role?.imagePath}
                alt={role?.roleName}
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
