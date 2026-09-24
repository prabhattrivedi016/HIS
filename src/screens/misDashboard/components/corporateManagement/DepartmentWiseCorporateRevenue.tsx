import { FileText, ChevronDown } from "lucide-react";

export default function DeptWiseCorporateRevenueTable() {
  const deptData = [
    {
      id: 1,
      department: "Medicine",
      patients: "228",
      billed: "24,36,500",
      approved: "21,42,300",
    },
    {
      id: 2,
      department: "Surgery",
      patients: "186",
      billed: "18,76,800",
      approved: "16,52,400",
    },
    {
      id: 3,
      department: "Orthopedics",
      patients: "142",
      billed: "14,84,600",
      approved: "12,96,300",
    },
    {
      id: 4,
      department: "Gynecology",
      patients: "128",
      billed: "12,76,300",
      approved: "11,28,400",
    },
    {
      id: 5,
      department: "Pediatrics",
      patients: "96",
      billed: "9,86,200",
      approved: "8,42,600",
    },
    {
      id: 6,
      department: "Cardiology",
      patients: "88",
      billed: "8,64,700",
      approved: "7,52,300",
    },
    {
      id: 7,
      department: "Radiology",
      patients: "64",
      billed: "6,42,500",
      approved: "5,86,400",
    },
    {
      id: 8,
      department: "Laboratory",
      patients: "62",
      billed: "5,98,300",
      approved: "5,24,600",
    },
    {
      id: 9,
      department: "Emergency",
      patients: "48",
      billed: "4,86,200",
      approved: "4,21,800",
    },
    {
      id: 10,
      department: "Others",
      patients: "204",
      billed: "21,44,500",
      approved: "18,13,100",
    },
  ];

  return (
    <div className="w-full md:max-w-full bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-2xs flex flex-col justify-between overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800 flex items-center">
          <FileText size={17} className="text-blue-600 mr-2" />
          Department Wise Corporate Revenue (MTD)
        </h3>

        {/* Monthly Select Dropdown */}
        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-gray-600 shrink-0 cursor-pointer hover:bg-gray-100 transition-colors">
          <span>This Month</span>
          <ChevronDown size={13} className="ml-1 text-gray-400" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] table-fixed border-collapse text-left text-[10px] sm:text-[11px]">
          <thead>
            <tr className="bg-blue-50 text-gray-500 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider">
              <th className="w-[8%] border border-gray-300 py-[1.2%] px-1 text-center">
                #
              </th>
              <th className="w-[28%] border border-gray-300 py-[1.2%] px-2">
                Department
              </th>
              <th className="w-[18%] border border-gray-300 py-[1.2%] px-1 text-center">
                Patients
              </th>
              <th className="w-[23%] border border-gray-300 py-[1.2%] px-2 text-center">
                Billed Amount (₹)
              </th>
              <th className="w-[21%] border border-gray-300 py-[1.2%] px-2 text-center">
                Approved (₹)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
            {deptData.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                <td className="border border-gray-300 py-[1%] px-1 font-bold text-gray-900 text-center">
                  {row.id}
                </td>
                <td className="border border-gray-300 py-[1.2%] px-2 text-gray-900 font-bold">
                  {row.department}
                </td>
                <td className="border border-gray-300 py-[1%] px-1 text-gray-600 text-center">
                  {row.patients}
                </td>
                <td className="border border-gray-300 py-[1%] px-2 text-gray-800 text-center">
                  {row.billed}
                </td>
                <td className="border border-gray-300 py-[1%] px-2 text-blue-600 text-center">
                  {row.approved}
                </td>
              </tr>
            ))}
            {/* Total Row */}
            <tr className="bg-slate-100 font-black text-gray-900">
              <td className="border border-gray-300 py-1.5 px-1 text-center">
                -
              </td>
              <td className="border border-gray-300 py-1.5 px-2">Total</td>
              <td className="border border-gray-300 py-1.5 px-1 text-center">
                1,246
              </td>
              <td className="border border-gray-300 py-1.5 px-2 text-center">
                1,28,75,600
              </td>
              <td className="border border-gray-300 py-1.5 px-2 text-center text-blue-700">
                1,12,40,300
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
