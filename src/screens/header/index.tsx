import axios from "axios";
import { Bell, BriefcaseBusiness, Building2, HousePlus, Menu, User, User2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClickOutside } from "../../hooks/useClickOutside";
import useGetBranchList from "../../hooks/useGetBranchList";
import { getAuthStorage } from "../../utils/authStorage";

import RoleBindPage from "./components/RoleBindPage";
import UserReset from "./components/UserReset";

import "../../styles/layout.css";
import "../../styles/theme.css";

export default function Header({ toggleSidebar, isSidebarOpen }) {
  const storage = getAuthStorage();
  const navigate = useNavigate();

  /* ---------------- STATE ---------------- */
  const [openRoleBind, setOpenRoleBind] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedRole, setSelectedRole] = useState(() => storage.getItem("selectedRole"));

  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [userProfileSetting, setUserProfileSetting] = useState(false);
  const [userProfileDetails, setUserProfileDetails] = useState(null);

  const { branchList } = useGetBranchList();

  /* ---------------- PROFILE DROPDOWN REF ---------------- */
  const profileRef = useRef(null);
  useClickOutside(profileRef, () => setUserProfileOpen(false));

  /* ---------------- INIT BRANCH ---------------- */
  useEffect(() => {
    if (!branchList?.data?.length) return;

    const storedBranchId = Number(storage.getItem("branchId"));

    const defaultBranch =
      branchList.data.find(b => b.branchId === storedBranchId) ||
      branchList.data.find(b => b.branchId === 1);

    setSelectedBranch(defaultBranch);
  }, [branchList, storage]);

  /* ---------------- HANDLERS ---------------- */

  const profileHandler = () => {
    const userDetails = storage.getItem("userDetails");
    setUserProfileDetails(userDetails ? JSON.parse(userDetails) : null);
    setUserProfileOpen(prev => !prev);
  };

  const roleBindHandler = () => setOpenRoleBind(true);

  const branchChangeHandler = e => {
    const branchId = e.target.value;
    const branch = branchList?.data?.find(b => String(b.branchId) === branchId);
    setSelectedBranch(branch);
  };

  const logoutHandler = () => {
    storage.removeItem("accessToken");
    storage.removeItem("branchId");
    storage.removeItem("selectedRole");
    storage.removeItem("userDetails");
    storage.removeItem("userId");
    storage.removeItem("roleId");
    storage.removeItem("auth");

    localStorage.removeItem("authorized-pages");
    localStorage.removeItem("favorite-roles");

    delete axios.defaults.headers.common["Authorization"];
    navigate("/");
  };

  const userProfileHandler = () => setUserProfileSetting(true);

  /* ---------------- JSX ---------------- */
  return (
    <>
      <header
        className={`
        fixed top-0 z-30 h-16 header-bg shadow-sm
        flex items-center justify-between px-2 sm:px-4 md:px-2
        transition-all duration-300
        ${isSidebarOpen ? "md:left-60 left-0" : "md:left-16 left-0"}
        right-0
      `}
      >
        {/* LEFT SECTION */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <div className="w-full max-w-[140px] md:max-w-xs">
            {branchList?.data?.length > 1 ? (
              <select
                value={selectedBranch?.branchId || ""}
                onChange={branchChangeHandler}
                className="branch-box font-bold"
              >
                {branchList?.data?.map(branch => (
                  <option key={branch.branchId} value={branch.branchId}>
                    {branch.branchName}
                  </option>
                ))}
              </select>
            ) : (
              <div className="branch-box flex items-center gap-2 font-bold">
                <Building2 />
                <span className="truncate">{selectedBranch?.branchName}</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* ROLE BADGE */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full shadow-sm branch-box">
            <BriefcaseBusiness className="w-5 h-5" />
            <span className="truncate text-sm">{selectedRole}</span>
          </div>

          {/* ROLE BIND */}
          <button
            onClick={roleBindHandler}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-300 to-purple-400 text-white flex items-center justify-center shadow-md hover:scale-105"
          >
            <HousePlus className="w-5 h-5" />
          </button>

          {/* NOTIFICATION */}
          <button className="relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-300 to-purple-600 text-white flex items-center justify-center shadow-md">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* PROFILE */}
          <div ref={profileRef} className="relative">
            <button
              onClick={profileHandler}
              className="w-11 h-11 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-5 shadow-md hover:scale-105"
            >
              <User className="text-white w-5 h-5" />
            </button>

            {userProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-500 rounded-xl shadow-xl overflow-hidden z-50">
                {/* HEADER */}
                <div className="bg-linear-to-br from-blue-500 to-purple-600 py-4 flex flex-col items-center gap-1">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                    <User2 size={28} className="text-white" />
                  </div>
                  <span className="text-white font-semibold truncate max-w-[90%]">
                    {userProfileDetails?.userName || "User Name"}
                  </span>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2 p-3">
                  <button className="flex-1 grid-active-btn" onClick={userProfileHandler}>
                    Profile
                  </button>
                  <button className="flex-1 logout-btn" onClick={logoutHandler}>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MODALS */}
        {openRoleBind && (
          <RoleBindPage
            isOpen={openRoleBind}
            onClose={() => setOpenRoleBind(false)}
            roleChange={setSelectedRole}
          />
        )}
      </header>

      {userProfileSetting && (
        <UserReset isOpenTab={userProfileSetting} onCloseTab={() => setUserProfileSetting(false)} />
      )}
    </>
  );
}
