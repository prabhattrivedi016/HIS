import { Bell, HousePlus, Menu, Search, User } from "lucide-react";
import { useState } from "react";
import "../../styles/layout.css";
import "../../styles/theme.css";
import RoleBindPage from "./components/RoleBindPage";

export default function Header({ toggleSidebar, isSidebarOpen }) {
  const [openRoleBind, setOpenRoleBind] = useState(false);

  const toggleSidebarHandler = () => {
    toggleSidebar();
  };

  const roleBindHandler = () => {
    setOpenRoleBind(true);
  };

  return (
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
          onClick={toggleSidebarHandler}
          className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 shrink-0"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Search*/}
        <div className="relative flex-1 max-w-[120px] sm:max-w-[180px] md:max-w-xs">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-7 sm:pl-8 pr-2 sm:pr-3 py-1.5 sm:py-2 bg-gray-50 border rounded-lg focus:ring-2 ring-indigo-500 text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* marquee*/}
      <div className="flex items-center gap-2 sm:gap-2 md:gap-4 shrink-0">
        {/* <div className="hidden md:block text-white px-5 py-1 rounded-md overflow-hidden whitespace-nowrap max-w-[200px]">
          <span className="animate-marquee text-xs sm:text-sm">
            Updates Ahead! GRAVITY WEB SOLUTIONS
          </span>
        </div> */}

        {/* role bind handler */}

        <button
          onClick={roleBindHandler}
          className="relative flex items-center justify-center shrink-0 w-8 h-8 sm:w-10 sm:h-10  rounded-full bg-linear-to-br from-blue-300 to-purple-400 text-white transition active:scale-95 hover:scale-105 shadow-md"
        >
          <HousePlus size={30} className="w-4 h-4 sm:w-6 sm:h-6" />
        </button>
        {/* notification button */}
        <button className="relative p-1.5 sm:p-2  w-8 h-8 sm:w-10 sm:h-10 text-white bg-linear-to-br from-blue-300 to-purple-600  hover:bg-gray-50 rounded-full shrink-0 active:scale-90  hover:scale-105 shadow-md">
          <Bell className="text-white-600 w-5 h-5 sm:w-6 sm:h-6" />
          <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        {/* Profile  */}
        <div
          className="w-9 h-9 sm:w-11 sm:h-11 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shrink-0 mr-2 sm:mr-10 active:scale-90  hover:scale-105
    shadow-md"
        >
          <User className="text-white w-4 h-4 sm:w-5 sm:h-5 " size={40} />
        </div>
      </div>
      {/* role bind dropdown */}
      {openRoleBind ? (
        <RoleBindPage isOpen={openRoleBind} onClose={() => setOpenRoleBind(false)} />
      ) : (
        <></>
      )}
    </header>
  );
}
