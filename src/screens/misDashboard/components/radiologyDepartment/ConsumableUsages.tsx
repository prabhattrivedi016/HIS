import { FileText, ChevronDown } from "lucide-react";

export default function ConsumablesUsageTable() {
  const consumablesData = [
    {
      id: 1,
      item: "Contrast (CT)",
      used: "286",
      cost: "1,43,000",
      width: "60%",
    },
    {
      id: 2,
      item: "Contrast (MRI)",
      used: "198",
      cost: "2,37,600",
      width: "85%",
    },
    {
      id: 3,
      item: "Syringe",
      used: "512",
      cost: "25,600",
      width: "40%",
    },
    {
      id: 4,
      item: "IV Cannula",
      used: "498",
      cost: "19,920",
      width: "35%",
    },
    {
      id: 5,
      item: "Normal Saline",
      used: "612",
      cost: "18,360",
      width: "30%",
    },
    {
      id: 6,
      item: "Disposable Kit",
      used: "286",
      cost: "14,300",
      width: "25%",
    },
    {
      id: 7,
      item: "Others",
      used: "420",
      cost: "21,450",
      width: "38%",
    },
  ];

  return (
    <div className="w-full md:max-w-full bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-2xs flex flex-col justify-between overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800 flex items-center">
          <FileText size={17} className="text-blue-600 mr-2" />
          Contrast & Consumables Usage (MTD)
        </h3>

        {/* Monthly Select Dropdown */}
        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-gray-600 shrink-0 cursor-pointer hover:bg-gray-100 transition-colors">
          <span>This Month</span>
          <ChevronDown size={13} className="ml-1 text-gray-400" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[300px] table-fixed border-collapse text-left text-[10px] sm:text-[11px]">
          <thead>
            <tr className="bg-blue-50 text-gray-500 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider">
              <th className="w-[20%] border border-gray-300 py-[1.6%] px-2 break-words">
                Item
              </th>
              <th className="w-[15%] border border-gray-300 py-[1.2%] px-2 break-words text-center">
                Used
              </th>
              <th className="w-[16%] border border-gray-300 py-[1.2%] px-2 break-words text-center">
                Cost (₹)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
            {consumablesData.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                <td className="border border-gray-300 py-[1.6%] px-2 text-gray-900 font-bold break-words">
                  {row.item}
                </td>
                <td className="border border-gray-300 py-[1%] px-1 text-gray-600 break-words text-center">
                  {row.used}
                </td>
                <td className="border border-gray-300 py-[1%] px-2 text-gray-700 break-words">
                  <div className="flex items-center justify-between space-x-2">
                    <span className="font-extrabold text-gray-900 w-16 text-right">
                      {row.cost}
                    </span>
                    
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
