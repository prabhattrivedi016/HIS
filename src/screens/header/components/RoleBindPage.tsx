import { motion } from "framer-motion";
import { ChangeEvent, useEffect, useState } from "react";

import { Star } from "lucide-react";
import InputField from "../../../components/customInputField";
import CustomLoader from "../../../components/customLoader";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { useAuthorizedPages } from "../../../store/useAuthorizedPages";

import { RoleBindPageProps, RoleMapItem, subMenuItem, TabItem } from "../types";

const SELECTED_ROLE_KEY = "selectedRoleId";

const RoleBindPage = ({ isOpen, onClose }: RoleBindPageProps) => {
  const { loading, error, fetchApi } = useGlobalApi();
  const { setAuthorizedPages } = useAuthorizedPages();

  const [rolesMap, setRolesMap] = useState<RoleMapItem[]>([]);
  const [filteredRole, setFilteredRole] = useState<RoleMapItem[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleMapItem | null>(null);
  const [tabs, setTabs] = useState<TabItem[]>([]);
  const [subMenu, setSubMenu] = useState<subMenuItem[]>([]);
  const [favoriteSubMenu, setFavoriteSubMenu] = useState();
  const [favoriteRole, setFavoriteRole] = useState<number[]>([]);

  const branchId = localStorage.getItem("branchId");
  const userId = localStorage.getItem("userId");

  // / role → pages mapping
  const fetchRoleMapping = async (role: RoleMapItem, shouldClose: boolean) => {
    setSelectedRole(role);

    localStorage.setItem(SELECTED_ROLE_KEY, String(role.roleId));

    const response = await fetchApi(
      "GET",
      ENDPOINTS.GET_USER_TAB_SUB_MENU_MAPPING,
      {},
      { params: { branchId, roleId: role.roleId } }
    );

    if (!response) return;

    setTabs(response.data?.tabs ?? []);
    setSubMenu(response.data?.subMenus ?? []);
    setFavoriteSubMenu(response?.data?.favoriteSubMenus ?? []);

    if (shouldClose) {
      setTimeout(() => {
        onClose();
      }, 200);
    }
  };

  // fetch roles
  const getUserRoles = async () => {
    const response = await fetchApi("GET", ENDPOINTS.GET_USER_ROLES, {}, { params: { branchId } });

    if (!response) return;

    const roles: RoleMapItem[] = response?.data ?? [];

    setRolesMap(roles);
    setFilteredRole(roles);

    const favRoleIds = roles.filter(role => role?.isFavoriteRole === 1).map(role => role?.roleId);

    setFavoriteRole(favRoleIds);

    //  restore selected role
    const cachedRoleId = localStorage.getItem(SELECTED_ROLE_KEY);
    const restoredRole = roles.find(r => String(r.roleId) === cachedRoleId);

    const finalRole = restoredRole ?? roles[0];

    if (finalRole) {
      fetchRoleMapping(finalRole, false);
    }
  };

  /* effects */
  useEffect(() => {
    if (!branchId || !isOpen) return;
    getUserRoles();
  }, [branchId, isOpen]);

  useEffect(() => {
    if (!selectedRole || !tabs.length) return;

    const quickLinksTab = {
      tabName: {
        tabId: 0,
        tabName: "Quick Links",
        iconClass: "fa-solid fa-star",
      },
      pages: favoriteSubMenu?.map(item => ({
        ...item,
        tabId: 0,
      })),
      selectedRole,
    };

    const normalTabs = tabs?.map(tab => ({
      tabName: {
        tabId: tab.tabId,
        tabName: tab.tabName.trim(),
        iconClass: tab.iconClass,
      },
      pages: subMenu.filter(page => page.tabId === tab.tabId),
      selectedRole,
    }));

    const authorizedNavigation = [quickLinksTab, ...normalTabs];

    setAuthorizedPages(authorizedNavigation);
  }, [tabs, subMenu, favoriteSubMenu, selectedRole]);

  // search handler
  const searchHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();

    if (!value) {
      setFilteredRole(rolesMap);
      return;
    }

    setFilteredRole(rolesMap.filter(role => role.roleName?.toLowerCase().includes(value)));
  };

  const favoriteHandler = (e: React.MouseEvent, roleId: number) => {
    e.stopPropagation();

    setFavoriteRole(prev =>
      prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
    );
  };

  // debounced api call for favorite role
  useEffect(() => {
    if (!favoriteRole?.length) return;

    const timer = setTimeout(async () => {
      await fetchApi("POST", ENDPOINTS.SAVE_USER_FAVORITE_ROLES, {
        branchId,
        userId,
        roleIds: favoriteRole,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [favoriteRole]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-999 flex items-center justify-center ">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative bg-white rounded-xl shadow-xl w-[90%] lg:w-[70%] max-h-[90vh] p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div className="flex justify-center w-full">
              <InputField className="w-full sm:w-64">
                <input
                  placeholder="Search Modules..."
                  className="input-field w-full"
                  onChange={searchHandler}
                />
              </InputField>
            </div>

            <button
              onClick={onClose}
              className="self-end sm:self-auto flex items-center justify-center w-8 h-8 rounded-full text-gray-500 hover:text-black hover:bg-gray-100 transition text-4xl"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="overflow-y-auto max-h-[72vh] md:min-h-[72vh] px-3 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredRole.map(role => {
                const isActive = selectedRole?.roleId === role?.roleId;

                return (
                  <div
                    key={role?.roleId}
                    onClick={() => fetchRoleMapping(role, true)}
                    className={`group cursor-pointer relative rounded-xl border p-8 transition-all duration-200 shadow-lg hover:shadow-2xl flex flex-col items-center justify-center ${
                      isActive
                        ? "border-green-600 bg-linear-to-br from-green-50 to-blue-50 scale-[1.02]"
                        : "border-gray-200 bg-white hover:bg-linear-to-br from-blue-100 to-green-100"
                    }`}
                  >
                    <button
                      className={`absolute top-3 right-3 cursor-pointer z-10 ${
                        favoriteRole?.length === 3 && !favoriteRole?.includes(role?.roleId)
                          ? "opacity-40 cursor-not-allowed"
                          : ""
                      }`}
                      onClick={e => favoriteHandler(e, role?.roleId)}
                      disabled={favoriteRole?.length === 3 && !favoriteRole?.includes(role?.roleId)}
                    >
                      {favoriteRole?.includes(role?.roleId) ? (
                        <Star size={28} className="text-yellow-400 fill-yellow-400" />
                      ) : (
                        <Star size={28} className="text-gray-300 hover:text-yellow-400" />
                      )}
                    </button>

                    <div
                      className={`flex items-center justify-center w-16 h-16 rounded-full mb-3 transition ${
                        isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-600 group-hover:bg-blue-200"
                      }`}
                    >
                      <i className={`${role.iconClass ?? "fa-solid fa-user"} text-3xl`} />
                    </div>

                    <div
                      className={`font-semibold text-xl text-center truncate w-full ${
                        isActive ? "text-green-700" : "text-gray-700"
                      }`}
                      title={role?.roleName}
                    >
                      {role?.roleName}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {loading && <CustomLoader isLoading />}
      </div>
    </>
  );
};

export default RoleBindPage;
