import { FileText } from "lucide-react";

export default function DeptFinancialTable() {
  const financialData = [
    {
      id: 1,
      department: "IPD",
      sales: "18,45,600",
      purchase: "12,82,300",
      return: "72,400",
      netSales: "17,73,200",
      margin: "31%",
    },
    {
      id: 2,
      department: "OPD",
      sales: "14,72,300",
      purchase: "10,24,600",
      return: "52,300",
      netSales: "14,20,000",
      margin: "30%",
    },
    {
      id: 3,
      department: "ICU",
      sales: "8,92,400",
      purchase: "6,48,200",
      return: "28,600",
      netSales: "8,63,800",
      margin: "28%",
    },
    {
      id: 4,
      department: "Emergency",
      sales: "6,48,200",
      purchase: "4,80,300",
      return: "21,400",
      netSales: "6,26,800",
      margin: "27%",
    },
    {
      id: 5,
      department: "OT",
      sales: "6,12,800",
      purchase: "4,32,600",
      return: "18,200",
      netSales: "5,94,600",
      margin: "29%",
    },
    {
      id: 6,
      department: "Pediatrics",
      sales: "5,84,600",
      purchase: "4,21,300",
      return: "16,800",
      netSales: "5,67,800",
      margin: "26%",
    },
    {
      id: 7,
      department: "Gynecology",
      sales: "5,21,300",
      purchase: "3,82,400",
      return: "14,600",
      netSales: "5,06,700",
      margin: "26%",
    },
    {
      id: 8,
      department: "Surgery",
      sales: "4,86,400",
      purchase: "3,40,200",
      return: "12,800",
      netSales: "4,73,600",
      margin: "28%",
    },
  ];

  return (
    <div className="w-full md:max-w-full bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-2xs flex flex-col justify-between overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800 flex items-center">
          <FileText size={17} className="text-blue-600 mr-2" />
          Department-wise Pharmacy Financial Summary (MTD)
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] table-fixed border-collapse text-left text-[10px] sm:text-[11px]">
          <thead>
            <tr className="bg-blue-50 text-gray-500 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider">
              <th className="w-[16%] border border-gray-300 py-[1.2%] px-1.5 break-words">
                Department
              </th>
              <th className="w-[14%] border border-gray-300 py-[1.2%] px-1.5 break-words text-center">
                Sales (₹)
              </th>
              <th className="w-[18%] border border-gray-300 py-[1.2%] px-1.5 break-words text-center">
                Purchase/Cost (₹)
              </th>
              <th className="w-[16%] border border-gray-300 py-[1.2%] px-1.5 break-words text-center">
                Return (₹)
              </th>
              <th className="w-[18%] border border-gray-300 py-[1.2%] px-1.5 break-words text-center">
                Net Sales (₹)
              </th>
              <th className="w-[16%] border border-gray-300 py-[1.2%] px-1.5 break-words text-center">
                Margin %
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
            {financialData.map(row => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                <td className="border border-gray-300 py-[1.2%] px-1.5 font-bold text-gray-900 break-words">
                  {row.department}
                </td>
                <td className="border border-gray-300 py-[1.2%] px-1.5 text-gray-600 break-words text-center">
                  {row.sales}
                </td>
                <td className="border border-gray-300 py-[1.2%] px-1.5 text-gray-600 break-words text-center">
                  {row.purchase}
                </td>
                <td className="border border-gray-300 py-[1.2%] px-1.5 text-gray-600 break-words text-center">
                  {row.return}
                </td>
                <td className="border border-gray-300 py-[1.2%] px-1.5 text-gray-600 break-words text-center">
                  {row.netSales}
                </td>
                <td className="border border-gray-300 py-[1.2%] px-1.5 font-bold text-emerald-600 break-words text-center">
                  {row.margin}
                </td>
              </tr>
            ))}
            {/* Total Row */}
            <tr className="bg-slate-100 font-black text-gray-900">
              <td className="border border-gray-300 py-[1.2%] px-1.5 break-words ">Total</td>
              <td className="border border-gray-300 py-[1.2%] px-1.5 break-words text-center">
                72,30,800
              </td>
              <td className="border border-gray-300 py-[1.2%] px-1.5 break-words text-center">
                48,90,400
              </td>
              <td className="border border-gray-300 py-[1.2%] px-1.5 break-words text-center">
                3,18,450
              </td>
              <td className="border border-gray-300 py-[1.2%] px-1.5 break-words text-center">
                69,12,350
              </td>
              <td className="border border-gray-300 py-[1.2%] px-1.5 break-words text-center text-emerald-700">
                28%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
