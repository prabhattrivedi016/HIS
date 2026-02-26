import InputField from "@/components/customInputField";
import { BedDouble, LogOut, PieChart, Search, UserPlus } from "lucide-react";
import { NavLink } from "react-router-dom";

const BedDetails = () => {
  const roomOptions = [
    "--All Room--",
    "CCU WARDs",
    "DAYCARE",
    "DIALYSIS",
    "EMERGENCY",
    "GENERAL",
    "ICU",
    "NICU",
    "PEDIA SEMI PV",
    "PICU",
    "Private General",
    "PRIVATE WARD",
    "SUPER DELUXE",
    "SURGERIE",
  ];

  const floorOptions = ["--All Floor--", "GROUND FLOOR", "1st FLOOR", "2nd FLOOR", "3rd FLOOR"];

  const stats = [
    {
      value: 181,
      label: "Total Beds",
      gradient: "bg-gradient-to-r from-cyan-500 to-cyan-600",
      Icon: BedDouble,
    },
    {
      value: 33,
      label: "Available Beds",
      gradient: "bg-gradient-to-r from-green-500 to-green-600",
      Icon: BedDouble,
    },
    {
      value: 157,
      label: "Occupied Beds",
      gradient: "bg-gradient-to-r from-purple-600 to-purple-700",
      Icon: BedDouble,
    },
    {
      value: 0,
      label: "Today Admission",
      gradient: "bg-gradient-to-r from-teal-500 to-teal-600",
      Icon: UserPlus,
    },
    {
      value: 0,
      label: "Today Discharge",
      gradient: "bg-gradient-to-r from-pink-500 to-pink-600",
      Icon: LogOut,
    },
    {
      value: "86.74%",
      label: "Beds Occupancy",
      gradient: "bg-gradient-to-r from-violet-600 to-violet-700",
      Icon: PieChart,
    },
  ];
  return (
    <div className="page-container">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4  mt-2">
        <div className="lg:-mt-8 ">
          <h1 className="page-heading">Bed Details</h1>

          <nav className="helper-text">
            <NavLink to="/dashboard" className="hover:underline">
              Home
            </NavLink>
            <span>››</span>
            <span>Bed Details</span>
          </nav>
        </div>
        <h2 className="card-title  "></h2>
        <div className="form-grid-3 ">
          <InputField>
            <select className="input-field">
              {roomOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </InputField>

          <InputField>
            <select className="input-field">
              {floorOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </InputField>

          <button className="save-btn mt-1.5">Bed Occupancy Report</button>
        </div>
      </div>

      {/* cards */}
      <div className="flex -mt-10 w-full">
        {/* Content */}
        <div className="flex-1 min-w-0 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mt-4 m-2 w-full">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`relative overflow-hidden rounded-2xl text-white p-6 min-w-[190px] shadow-sm ${stat.gradient}`}
              >
                {/* Content */}
                <div className="relative z-10">
                  <div className="text-4xl font-bold">{stat.value}</div>
                  <div className="mt-1 text-sm opacity-90">{stat.label}</div>
                </div>

                {/* Background Icon */}
                <stat.Icon size={90} className="absolute right-4 bottom-2 opacity-20" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className=" lg:w-1/2 card sm:w-full">
        <div className="w-full overflow-auto flex flex-col lg:flex-row gap-2 mb-4">
          <button className="save-btn whitespace-nowrap">All Beds</button>
          <button className="save-btn whitespace-nowrap">Doctor Wise</button>
          <button className="save-btn whitespace-nowrap">Corporate Wise</button>
          <button className="save-btn whitespace-nowrap"> Bed Occupancy</button>
          <button className="save-btn whitespace-nowrap">Today Status</button>
          <button className="save-btn whitespace-nowrap">Summary Status</button>
          <button className="save-btn whitespace-nowrap">Summery Details</button>
        </div>

        <div className="overflow-auto max-h-95 border rounded-md ">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 sticky top-0  ">
              <tr className="border-b border-gray-300">
                <th className="px-4 py-2 text-left">#</th>

                <th className="px-4 py-2 text-left whitespace-nowrap">Room Type</th>
                <th className="px-4 py-2 text-left whitespace-nowrap">Total Bed (181)</th>
                <th className="px-4 py-2 text-left whitespace-nowrap">Available Bed (33)</th>
                <th className="px-4 py-2 text-left whitespace-nowrap">Occupied Bed (157)</th>
                <th className="px-4 py-2 text-left whitespace-nowrap">View</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                <tr key={i} className="border-b border-gray-300">
                  <td className="px-4 py-2 text-gray-700">{i}</td>

                  <td className="px-4 py-2 text-gray-700">{`B00${i}`}</td>
                  <td className="px-4 py-2 text-gray-700">{`R10${i}`}</td>
                  <td className="px-4 py-2 text-gray-700">1st Floor</td>
                  <td className="px-4 py-2 text-gray-700">ICU</td>
                  <td className="px-4 py-2 text-gray-700">
                    <Search size={20} className="text-blue-500" />
                  </td>
                </tr>
              ))}

              <tr className="border-b border-gray-300">
                <td className="px-4 py-2 text-gray-700">B001</td>
                <td className="px-4 py-2 text-gray-700">R101</td>
                <td className="px-4 py-2 text-gray-700">1st Floor</td>
                <td className="px-4 py-2 text-gray-700">ICU</td>
                <td className="px-4 py-2 text-gray-700">Occupied</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="px-4 py-2 text-gray-700">B002</td>

                <td className="px-4 py-2 text-gray-700">R102</td>
                <td className="px-4 py-2 text-gray-700">1st Floor</td>
                <td className="px-4 py-2 text-gray-700">General</td>
                <td className="px-4 py-2 text-gray-700">Available</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="px-4 py-2 text-gray-700">B003</td>
                <td className="px-4 py-2 text-gray-700">R103</td>
                <td className="px-4 py-2 text-gray-700">1st Floor</td>
                <td className="px-4 py-2 text-gray-700">ICU</td>
                <td className="px-4 py-2 text-gray-700">Occupied</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="px-4 py-2 text-gray-700">B004</td>
                <td className="px-4 py-2 text-gray-700">R104</td>
                <td className="px-4 py-2 text-gray-700">1st Floor</td>
                <td className="px-4 py-2 text-gray-700">General</td>
                <td className="px-4 py-2 text-gray-700">Available</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BedDetails;
