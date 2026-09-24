import { FileText } from "lucide-react";

export default function DeptFinancialTable() {
  const departments = [
    {
      name: "OPD",
      rev: "28,90,300",
      exp: "12,40,650",
      net: "16,49,650",
      rate: "92%",
    },
    {
      name: "IPD",
      rev: "1,25,40,600",
      exp: "86,22,300",
      net: "39,18,300",
      rate: "88%",
    },
    {
      name: "ICU",
      rev: "18,75,400",
      exp: "12,60,800",
      net: "6,14,600",
      rate: "85%",
    },
    {
      name: "OT",
      rev: "22,18,600",
      exp: "14,30,200",
      net: "7,88,400",
      rate: "90%",
    },
    {
      name: "Pharmacy",
      rev: "72,30,800",
      exp: "48,90,400",
      net: "23,40,400",
      rate: "95%",
    },
    {
      name: "Laboratory",
      rev: "48,12,450",
      exp: "29,40,100",
      net: "18,72,350",
      rate: "91%",
    },
    {
      name: "Radiology",
      rev: "37,64,900",
      exp: "22,10,500",
      net: "15,54,400",
      rate: "93%",
    },

    {
      name: "Emergency",
      rev: "12,40,200",
      exp: "9,10,400",
      net: "3,29,800",
      rate: "82%",
    },
  ];

  return (
    <div className="w-full md:max-w-full bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-2xs flex flex-col justify-between overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800 flex items-center">
          <FileText size={17} className="text-blue-600 mr-2" />
          Department-wise Financial Summary (MTD)
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px] table-fixed border-collapse text-left text-[10px] sm:text-[11px]">
          <thead>
            <tr className="bg-gray-50 text-gray-500 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider">
              <th className="w-[22%] border border-gray-300 py-1 px-2 break-words">Department</th>
              <th className="w-[20%] border border-gray-300 py-1 px-2 break-words">Revenue (₹)</th>
              <th className="w-[20%] border border-gray-300 py-1 px-2 break-words">Expense (₹)</th>
              <th className="w-[17%] border border-gray-300 py-1 px-2 break-words">Net (₹)</th>
              <th className="w-[21%] border border-gray-300 py-1 px-2 break-words">
                Collection Rate
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
            {departments.map(row => (
              <tr key={row.name} className="hover:bg-slate-50 transition-colors">
                <td className="border border-gray-300 py-1 px-2 font-bold text-gray-900 break-words">
                  {row.name}
                </td>
                <td className="border border-gray-300 py-1 px-2 break-words">{row.rev}</td>
                <td className="border border-gray-300 py-1 px-2 text-gray-600 break-words">
                  {row.exp}
                </td>
                <td className="border border-gray-300 py-1 px-2 font-bold text-blue-600 break-words">
                  {row.net}
                </td>
                <td className="border border-gray-300 py-1 px-2">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 font-bold rounded-full text-[10px] inline-block">
                    {row.rate}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50/75 font-extrabold text-gray-900">
              <td className="border border-gray-300 py-1 px-2 break-words">Total</td>
              <td className="border border-gray-300 py-1 px-2 break-words">3,65,73,350</td>
              <td className="border border-gray-300 py-1 px-2 break-words">2,35,64,650</td>
              <td className="border border-gray-300 py-1 px-2 text-blue-700 break-words">
                1,30,08,700
              </td>
              <td className="border border-gray-300 py-1 px-2">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 font-bold rounded-full text-[10px] inline-block">
                  91.5%
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
