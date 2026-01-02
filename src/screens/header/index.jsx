import { Bell, BriefcaseBusiness, Building2, HousePlus, Menu, User } from "lucide-react";
import { useEffect, useState } from "react";
import useGetBranchList from "../../hooks/useGetBranchList";
import "../../styles/layout.css";
import "../../styles/theme.css";
import RoleBindPage from "./components/RoleBindPage";

export default function Header({ toggleSidebar, isSidebarOpen }) {
  const [openRoleBind, setOpenRoleBind] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedRole, setSelectedRole] = useState(() => {
    return localStorage.getItem("selectedRole");
  });

  const { branchList } = useGetBranchList();

  // Set default branch once data is available
  useEffect(() => {
    if (branchList?.data?.length && !selectedBranch) {
      setSelectedBranch(branchList?.data[0]);
    }
  }, [branchList, selectedBranch]);

  // Sidebar toggle
  const toggleSidebarHandler = () => {
    toggleSidebar();
  };

  // Role bind modal handler
  const roleBindHandler = () => {
    setOpenRoleBind(true);
  };

  // Branch change handler (FIXED)
  const branchChangeHandler = e => {
    const branchId = e.target.value;
    const branch = branchList?.data?.find(b => String(b.branchId) === branchId);
    setSelectedBranch(branch);
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
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Branch Selector */}
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
            <div className="branch-box w-full gap-2 sm:gap-5 font-bold flex items-center ">
              <Building2 />

              <span className=" truncate">{selectedBranch?.branchName}</span>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-2 sm:gap-2 md:gap-4 shrink-0">
        <div
          className="
    inline-flex
    items-center
    justify-center
    gap-2
    px-2 py-1
    sm:px-4 sm:py-1.5
    rounded-full
    max-w-[120px]
    sm:max-w-[200px]
    md:max-w-[300px]
    overflow-hidden
    shadow-sm
    branch-box
  "
        >
          <BriefcaseBusiness
            className="
      shrink-0
      w-3.5 h-3.5
      sm:w-5 sm:h-5
      md:w-6 md:h-6
    "
          />

          <span
            className="
      min-w-0
      truncate
      text-[10px]
      sm:text-sm
      md:text-base
    "
            title={selectedRole}
          >
            {selectedRole}
          </span>
        </div>

        {/* Role Bind Button */}
        <button
          onClick={roleBindHandler}
          className="relative flex items-center justify-center shrink-0
            w-8 h-8 sm:w-10 sm:h-10
            rounded-full
            bg-linear-to-br from-blue-300 to-purple-400
            text-white
            transition active:scale-95 hover:scale-105 shadow-md"
          aria-label="Role Bind"
        >
          <HousePlus className="w-4 h-4 sm:w-6 sm:h-6" />
        </button>

        {/* Notifications */}
        <button
          className="relative p-1.5 sm:p-2
            w-8 h-8 sm:w-10 sm:h-10
            rounded-full
            bg-linear-to-br from-blue-300 to-purple-600
            text-white
            shrink-0
            transition active:scale-90 hover:scale-105 shadow-md"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Profile */}
        <div
          className="
            w-9 h-9 sm:w-11 sm:h-11
            bg-linear-to-br from-blue-500 to-purple-600
            rounded-full
            flex items-center justify-center
            shrink-0
            mr-2 sm:mr-10
            transition active:scale-90 hover:scale-105 shadow-md"
        >
          <User className="text-white w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>

      {/* Role Bind Modal */}
      {openRoleBind && (
        <RoleBindPage
          isOpen={openRoleBind}
          onClose={() => setOpenRoleBind(false)}
          roleChange={setSelectedRole}
        />
      )}
    </header>
  );
}
