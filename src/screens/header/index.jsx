import { Bell, Menu, Search, User } from "lucide-react";

export default function Header({ toggleSidebar, isSidebarOpen }) {
  const toggleSidebarHandler = () => {
    toggleSidebar();
    console.log("toggle sidebar handler is called");
  };

  return (
    <header
      className={`
        fixed top-0 z-30 h-16 bg-[#0b5394] shadow-sm 
        flex items-center justify-between px-2 sm:px-4 md:px-6 
        transition-all duration-300
        ${isSidebarOpen ? "md:left-60 left-0" : "left-0"}
        right-0
      `}
    >
      {/* LEFT SECTION */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <button
          onClick={toggleSidebarHandler}
          className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 flex-shrink-0"
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

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-8 sm:gap-6 md:gap-8 flex-shrink-0">
        <div className="hidden md:block text-white px-5 py-1 rounded-md overflow-hidden whitespace-nowrap max-w-[200px]">
          <span className="animate-marquee text-xs sm:text-sm">
            🚀 Coming Soon • Updates Ahead! GRAVITY WEB SOLUTIONS
          </span>
        </div>
        {/* Notification Bell */}
        <button className="relative p-1.5 sm:p-2 bg-white hover:bg-gray-50 rounded-lg flex-shrink-0">
          <Bell className="text-white-600 w-5 h-5 sm:w-6 sm:h-6" />
          <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        {/* Profile */}
        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="text-white w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
    </header>
  );
}
