// import { useState } from "react";
// import { Link } from "react-router-dom";
// import Header from "../../../screens/header/index";

// export default function Sidebar() {
//   const [open, setOpen] = useState(true);
//   const [sidebarOpen, setSidebarOpen] = useState(true);

//   const toggleSidebar = () => {
//     setSidebarOpen(prev => !prev);
//   };

//   return (
//     <div className="flex h-screen overflow-hidden">
//       {/* Sidebar */}
//       <div
//         className={`fixed md:static inset-y-0 left-0 z-50 bg-gray-100 border-r border-gray-300 w-60 p-4 transition-transform duration-300 transform ${
//           sidebarOpen ? "translate-x-0" : "-translate-x-full"
//         } md:translate-x-0`}
//       >
//         <h2 className="text-xl font-semibold mb-6">Navigation</h2>

//         <div>
//           <button
//             onClick={() => setOpen(prev => !prev)}
//             className="w-full flex justify-between items-center px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
//           >
//             <span className="font-medium">Master</span>
//             <span className="text-lg">{open ? "▲" : "▼"}</span>
//           </button>

//           {open && (
//             <div className="mt-2 flex flex-col space-y-1 pl-3">
//               <Link to="/dashboard" className="px-3 py-2 rounded hover:bg-gray-200 text-sm">
//                 Dashboard
//               </Link>
//               <Link to="/role-master" className="px-3 py-2 rounded hover:bg-gray-200 text-sm">
//                 Role Master
//               </Link>
//               <Link to="/user-master" className="px-3 py-2 rounded hover:bg-gray-200 text-sm">
//                 User Master
//               </Link>
//             </div>
//           )}
//         </div>

//         <button
//           onClick={toggleSidebar}
//           className="absolute top-2 right-2 md:hidden p-1 rounded hover:bg-gray-200"
//         >
//           ✕
//         </button>
//       </div>

//       {/* Mobile Overlay */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 z-40 bg-black opacity-50 md:hidden"
//           onClick={toggleSidebar}
//         ></div>
//       )}

//       {/* Main Content + Header */}
//       <div
//         className={`flex-1 flex flex-col transition-all duration-300 ${
//           sidebarOpen ? "md:ml-60" : "md:ml-0"
//         }`}
//       >
//         <Header toggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
//         <main className="flex-1 bg-white p-4 mt-16 md:mt-0 overflow-auto">
//           <Navbar />
//         </main>
//       </div>
//     </div>
//   );
// }
