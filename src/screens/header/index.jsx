import axios from "axios";
import { Bell, BriefcaseBusiness, Building2, HousePlus, Menu, User, User2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGetBranchList from "../../hooks/useGetBranchList";
import "../../styles/layout.css";
import "../../styles/theme.css";
import { getAuthStorage } from "../../utils/authStorage";
import RoleBindPage from "./components/RoleBindPage";

export default function Header({ toggleSidebar, isSidebarOpen }) {
  const storage = getAuthStorage();
  const [openRoleBind, setOpenRoleBind] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [userProfile, setUserProfile] = useState(false);
  const [selectedRole, setSelectedRole] = useState(() => storage.getItem("selectedRole"));
  const [userProfileDetails, setUserProfileDetails] = useState(null);
  const navigate = useNavigate();

  const { branchList } = useGetBranchList();

  const profileBtnRef = useRef(null);
  const profileCardRef = useRef(null);

  const [profilePosition, setProfilePosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!branchList?.data?.length) return;

    const storedBranchId = Number(storage.getItem("branchId"));

    const defaultBranch =
      branchList.data.find(b => b.branchId === storedBranchId) ||
      branchList.data.find(b => b.branchId === 1);

    setSelectedBranch(defaultBranch);
  }, [branchList, storage]);

  const calculateProfilePosition = useCallback(() => {
    if (!profileBtnRef.current) return;

    // MOBILE VIEW
    if (window.innerWidth < 768) {
      setProfilePosition({
        top: 65,
        left: (window.innerWidth - 10) / 2,
      });
      return;
    }

    // DESKTOP VIEW
    const rect = profileBtnRef.current.getBoundingClientRect();

    setProfilePosition({
      top: rect.bottom + window.scrollY + 10,
      left: rect.right + window.scrollX - 275,
    });
  }, []);

  const profileHandler = () => {
    const userDetails = storage.getItem("userDetails");
    setUserProfileDetails(userDetails ? JSON.parse(userDetails) : null);

    calculateProfilePosition();
    setUserProfile(prev => !prev);
  };

  useEffect(() => {
    const handler = e => {
      if (
        profileCardRef.current &&
        profileBtnRef.current &&
        !profileCardRef.current.contains(e.target) &&
        !profileBtnRef.current.contains(e.target)
      ) {
        setUserProfile(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!userProfile) return;
    window.addEventListener("resize", calculateProfilePosition);
    return () => window.removeEventListener("resize", calculateProfilePosition);
  }, [userProfile, calculateProfilePosition]);

  const toggleSidebarHandler = () => toggleSidebar();

  const roleBindHandler = () => setOpenRoleBind(true);

  const branchChangeHandler = e => {
    const branchId = e.target.value;
    const branch = branchList?.data?.find(b => String(b.branchId) === branchId);
    setSelectedBranch(branch);
  };

  // logout handler
  const logoutHandler = () => {
    const storage = getAuthStorage();
    storage.removeItem("accessToken");
    storage.removeItem("branchId");
    storage.removeItem("selectedRole");
    storage.removeItem("userDetails");
    storage.removeItem("userId");
    storage.removeItem("roleId");
    storage.removeItem("roleName");

    localStorage.removeItem("authorized-pages");
    localStorage.removeItem("favorite-roles");

    delete axios.defaults.headers.common["Authorization"];
    navigate("/");
  };
  // profile handler
  const userProfileHandler = () => {
    console.log("profile button is clicked!");
  };
  return (
    <header
      className={`
        fixed top-0 z-30 h-16 header-bg shadow-sm
        flex items-center justify-between
        px-2 sm:px-4 md:px-2
        transition-all duration-300
        ${isSidebarOpen ? "md:left-60 left-0" : "md:left-16 left-0"}
        right-0
      `}
    >
      {/* LEFT SECTION */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <button
          onClick={toggleSidebarHandler}
          className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 shrink-0"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div className="w-full max-w-[100px] sm:max-w-[140px] md:max-w-xs">
          {branchList?.data?.length > 1 ? (
            <select
              value={selectedBranch?.branchId || ""}
              onChange={branchChangeHandler}
              className="branch-box font-bold"
            >
              {branchList?.data?.map(branch => (
                <option key={branch?.branchId} value={branch?.branchId}>
                  {branch?.branchName}
                </option>
              ))}
            </select>
          ) : (
            <div className="branch-box w-full gap-2 sm:gap-5 font-bold flex items-center">
              <Building2 />
              <span className="truncate">{selectedBranch?.branchName}</span>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-2 sm:gap-2 md:gap-4 shrink-0">
        <div
          className="
            inline-flex items-center justify-center gap-2 px-2 py-1 sm:px-4 sm:py-1.5 rounded-full max-w-[120px] sm:max-w-[200px] md:max-w-[300px] overflow-hidden shadow-sm branch-box "
        >
          <BriefcaseBusiness className="shrink-0 w-3.5 h-3.5 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          <span
            className="min-w-0 truncate text-[10px] sm:text-sm md:text-base"
            title={selectedRole}
          >
            {selectedRole}
          </span>
        </div>

        <button
          onClick={roleBindHandler}
          className="relative flex items-center justify-center shrink-0
            w-8 h-8 sm:w-10 sm:h-10
            rounded-full bg-linear-to-br from-blue-300 to-purple-400
            text-white transition active:scale-95 hover:scale-105 shadow-md"
        >
          <HousePlus className="w-4 h-4 sm:w-6 sm:h-6" />
        </button>

        <button
          className="relative p-1.5 sm:p-2 w-8 h-8 sm:w-10 sm:h-10
            rounded-full bg-linear-to-br from-blue-300 to-purple-600
            text-white shrink-0 transition active:scale-90 hover:scale-105 shadow-md"
        >
          <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <button
          ref={profileBtnRef}
          onClick={profileHandler}
          className=" w-9 h-9 sm:w-11 sm:h-11 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shrink-0 mr-2 sm:mr-10 transition active:scale-90 hover:scale-105 shadow-md "
        >
          <User className="text-white w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* ROLE BIND MODAL */}
      {openRoleBind && (
        <RoleBindPage
          isOpen={openRoleBind}
          onClose={() => setOpenRoleBind(false)}
          roleChange={setSelectedRole}
        />
      )}

      {/* PROFILE CARD */}
      {userProfile && (
        <div
          ref={profileCardRef}
          style={{ top: profilePosition.top, left: profilePosition.left }}
          className="fixed w-48 h-80 sm:w-64 md:w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-50 overflow-visible"
        >
          {/* header */}
          <div className="bg-linear-to-br from-blue-500 to-purple-600 h-24 rounded-t-lg flex flex-col items-center justify-center gap-1">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center ">
              <User2 size={30} className="text-white w-7 h-7 sm:w-9 sm:h-9" />
            </div>

            {/* username*/}
            <span className="text-white text-2xl font-bold  sm:text-base truncate max-w-[90%] ">
              {userProfileDetails?.userName || "User Name"}
            </span>
          </div>

          {/* body */}
          <div className="p-4"></div>

          {/* footer buttons */}
          <div className="flex justify-between">
            <button className="w-full m-2 grid-active-btn" onClick={userProfileHandler}>
              Profile
            </button>
            <button className="w-full m-2 logout-btn" onClick={logoutHandler}>
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
