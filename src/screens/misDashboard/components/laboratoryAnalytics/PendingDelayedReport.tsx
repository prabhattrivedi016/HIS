import {FileText} from "lucide-react"

export default function DeptFinancialTable() {
  const pendingReports = [
    {
      id: 1,
      uhid: "P0001256",
      patient: "Rakesh Kumar",
      test: "LFT",
      date: "15 Sep 10:15 AM",
      pending: "8 Hrs",
      status: "Pending",
      statusColor: " text-amber-600",
      backGround: "bg-amber-100",
    },
    {
      id: 2,
      uhid: "P0001257",
      patient: "Suman Devi",
      test: "Histopathology",
      date: "14 Sep 02:30 PM",
      pending: "28 Hrs",
      status: "In Process",
      statusColor: " text-blue-600",
      backGround: "bg-blue-100",
    },
    {
      id: 3,
      uhid: "P0001258",
      patient: "Amit Singh",
      test: "Culture & Sensitivity",
      date: "14 Sep 11:20 AM",
      pending: "31 Hrs",
      status: "In Process",
      statusColor: " text-blue-600",
      backGround: "bg-blue-100",
    },
    {
      id: 4,
      uhid: "P0001259",
      patient: "Neha Gupta",
      test: "Thyroid Profile",
      date: "15 Sep 09:40 AM",
      pending: "9 Hrs",
      status: "Pending",
      statusColor: " text-amber-600",
      backGround: "bg-amber-100",
    },
    {
      id: 5,
      uhid: "P0001260",
      patient: "Vikram Patel",
      test: "Dengue IgM",
      date: "15 Sep 11:10 AM",
      pending: "7 Hrs",
      status: "Pending",
      statusColor: " text-amber-600",
      backGround: "bg-amber-100",
    },
  ];

  return (
    <div className="w-full md:max-w-full bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-2xs flex flex-col justify-between overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800 flex items-center">
          <FileText size={17} className="text-blue-600 mr-2" />
          Pending And Delayed Reports
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] table-fixed border-collapse text-left text-[10px] sm:text-[11px]">
          <thead>
            <tr className="bg-blue-50 text-gray-500 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider">
              <th className="w-[8%] border border-gray-300 py-1.2 px-1 break-words text-center">
                #
              </th>
              <th className="w-[15%] border border-gray-300 py-[1%] px-1 break-words text-center">
                UHID
              </th>
              <th className="w-[20%] border border-gray-300 py-[1%] px-1 break-words text-center">
                Patient Name
              </th>
              <th className="w-[19%] border border-gray-300 py-[1%] px-1 break-words ">
                Test Name
              </th>
              <th className="w-[26%] border border-gray-300 py-[1%] px-1 break-words text-center">
                Sample Date/Time
              </th>
              <th className="w-[14%] border border-gray-300 py-[1%] px-1 break-words text-center">
                Pending Since
              </th>
              <th className="w-[15%] border border-gray-300 py-[1%] px-1 break-words text-center">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
            {pendingReports.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                <td className="border border-gray-300 py-[1%] px-1 font-bold text-gray-900 break-words text-center">
                  {row.id}
                </td>
                <td className="border border-gray-300 py-[1%] px-1 text-blue-600 font-bold break-words text-center">
                  {row.uhid}
                </td>
                <td className="border border-gray-300 py-[1%] px-1 text-gray-900 font-bold break-words text-center">
                  {row.patient}
                </td>
                <td className="border border-gray-300 py-[1%] px-1 text-gray-700 break-words ">
                  {row.test}
                </td>
                <td className="border border-gray-300 py-[1%] px-1 text-gray-500 break-words text-center">
                  {row.date}
                </td>
                <td className="border border-gray-300 py-[1%] px-1 text-rose-600 font-bold break-words text-center">
                  {row.pending}
                </td>
                <td
                  className={`border border-gray-300 py-[1%] px-1 text-center ${row.backGround}`}
                >
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${row.statusColor}`}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
