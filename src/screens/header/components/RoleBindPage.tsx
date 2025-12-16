import { motion } from "framer-motion";
import { ChangeEvent, useEffect, useState } from "react";

import InputField from "../../../components/customInputField";
import CustomLoader from "../../../components/customLoader";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { useAuthorizedPages } from "../../../store/useAuthorizedPages";

import { RoleBindPageProps, RoleMapItem, subMenuItem, TabItem } from "../types";

// storage key
const SELECTED_ROLE_KEY = "selectedRole";

const RoleBindPage = ({ isOpen, onClose }: RoleBindPageProps) => {
  const { loading, fetchApi } = useGlobalApi();
  const { setAuthorizedPages } = useAuthorizedPages();

  const [rolesMap, setRolesMap] = useState<RoleMapItem[]>([]);
  const [filteredRole, setFilteredRole] = useState<RoleMapItem[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleMapItem | null>(null);
  const [tabs, setTabs] = useState<TabItem[]>([]);
  const [subMenu, setSubMenu] = useState<subMenuItem[]>([]);

  const branchId = localStorage.getItem("selectedBranchId");

  // helper function for caching
  const persistSelectedRole = (role: RoleMapItem) => {
    localStorage.setItem(SELECTED_ROLE_KEY, JSON.stringify(role));
  };

  const getCachedRole = (): RoleMapItem | null => {
    const cached = localStorage.getItem(SELECTED_ROLE_KEY);
    return cached ? JSON.parse(cached) : null;
  };

  // / role → pages mapping
  const fetchRoleMapping = async (role: RoleMapItem, shouldClose: boolean) => {
    setSelectedRole(role);
    persistSelectedRole(role);

    const response = await fetchApi(
      "GET",
      ENDPOINTS.GET_USER_TAB_SUB_MENU_MAPPING,
      {},
      { params: { branchId, roleId: role.roleId } }
    );

    if (!response) return;

    setTabs(response.data?.tabs ?? []);
    setSubMenu(response.data?.subMenus ?? []);

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

    // restore cached role
    const cachedRole = getCachedRole();
    const restoredRole = cachedRole && roles?.find(r => r?.roleId === cachedRole?.roleId);

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

  // persist authorized pages
  useEffect(() => {
    if (!selectedRole || !tabs.length) return;

    const authorizedNavigation = tabs.map(tab => ({
      tabName: tab,
      pages: subMenu.filter(page => page.tabId === tab.tabId),
      selectedRole,
    }));

    setAuthorizedPages(authorizedNavigation);
  }, [tabs, subMenu, selectedRole]);

  // search handler
  const searchHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();

    if (!value) {
      setFilteredRole(rolesMap);
      return;
    }

    setFilteredRole(rolesMap.filter(role => role.roleName?.toLowerCase().includes(value)));
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-999 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative bg-white rounded-xl shadow-xl w-[90%] lg:w-[70%] max-h-[90vh] p-6"
        >
          {/* Header */}
          <div className="flex justify-between mb-4">
            <div className="flex gap-3 items-center">
              <h1 className="text-2xl font-semibold">Role Names</h1>

              <InputField className="w-64">
                <input
                  placeholder="Search..."
                  className="input-field w-full"
                  onChange={searchHandler}
                />
              </InputField>
            </div>

            <button onClick={onClose} className="text-3xl text-gray-500 hover:text-black">
              ×
            </button>
          </div>

          {/* Roles */}
          <div className="overflow-y-auto max-h-[65vh]">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredRole.map(role => {
                const isActive = selectedRole?.roleId === role.roleId;

                return (
                  <div
                    key={role.roleId}
                    onClick={() => fetchRoleMapping(role, true)}
                    className={`cursor-pointer p-4 rounded-lg border transition  
                      ${isActive ? "border-green-700 bg-blue-50" : "border-gray-300"}
                      hover:bg-blue-100`}
                  >
                    <i
                      className={`${
                        role.iconClass ?? "fa-solid fa-user"
                      } text-5xl mb-2 items-center text-center ml-20
                        ${isActive ? "text-green-700" : "text-blue-600"}`}
                    />
                    <div className="font-medium text-center truncate">{role.roleName}</div>
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
