import { FileText, ChevronDown } from "lucide-react";

export default function TopInvestigationsTable() {
  const topInvestigations = [
    {
      id: 1,
      name: "X-Ray Chest",
      qty: "682",
      amount: "1,36,400",
      share: "13%",
    },
    {
      id: 2,
      name: "USG Whole Abdomen",
      qty: "428",
      amount: "1,28,400",
      share: "11%",
    },
    {
      id: 3,
      name: "X-Ray PNS",
      qty: "312",
      amount: "62,400",
      share: "8%",
    },
    {
      id: 4,
      name: "X-Ray Spine",
      qty: "286",
      amount: "71,500",
      share: "7%",
    },
    {
      id: 5,
      name: "USG Obstetric",
      qty: "274",
      amount: "82,200",
      share: "7%",
    },
    {
      id: 6,
      name: "CT Brain (Plain)",
      qty: "198",
      amount: "1,18,800",
      share: "6%",
    },
    {
      id: 7,
      name: "USG Pelvis",
      qty: "186",
      amount: "55,800",
      share: "6%",
    },
    {
      id: 8,
      name: "MRI Brain",
      qty: "142",
      amount: "1,36,200",
      share: "5%",
    },
    {
      id: 9,
      name: "CT Abdomen",
      qty: "126",
      amount: "94,500",
      share: "4%",
    },
    {
      id: 10,
      name: "Mammography",
      qty: "118",
      amount: "70,800",
      share: "4%",
    },
  ];

  return (
    <div className="w-full md:max-w-full bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-2xs flex flex-col justify-between overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800 flex items-center">
          <FileText size={17} className="text-blue-600 mr-2" />
          Top 10 Investigations by Volume
        </h3>

        {/* Monthly Select Dropdown */}
        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-gray-600 shrink-0 cursor-pointer hover:bg-gray-100 transition-colors">
          <span>This Month</span>
          <ChevronDown size={13} className="ml-1 text-gray-400" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[550px] table-fixed border-collapse text-left text-[10px] sm:text-[11px]">
          <thead>
            <tr className="bg-blue-50 text-gray-500 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider">
              <th className="w-[10%] border border-gray-300 py-[1.2%] px-1 break-words text-center">
                #
              </th>
              <th className="w-[35%] border border-gray-300 py-[1.2%] px-2 break-words">
                Investigation Name
              </th>
              <th className="w-[16%] border border-gray-300 py-[1.2%] px-1 break-words text-center">
                Count
              </th>
              <th className="w-[22%] border border-gray-300 py-[1.2%] px-1 break-words text-center">
                Revenue (₹)
              </th>
              <th className="w-[15%] border border-gray-300 py-[1.2%] px-1 break-words text-center">
                % Share
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
            {topInvestigations.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                <td className="border border-gray-300 py-[1%] px-1 font-bold text-gray-900 break-words text-center">
                  {row.id}
                </td>
                <td className="border border-gray-300 py-[1.2%] px-2 text-gray-900 font-bold break-words">
                  {row.name}
                </td>
                <td className="border border-gray-300 py-[1%] px-1 text-gray-600 break-words text-center">
                  {row.qty}
                </td>
                <td className="border border-gray-300 py-[1%] px-1 text-gray-700 break-words text-center">
                  {row.amount}
                </td>
                <td className="border border-gray-300 py-[1%] px-1 font-bold text-emerald-600 break-words text-center">
                  {row.share}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
