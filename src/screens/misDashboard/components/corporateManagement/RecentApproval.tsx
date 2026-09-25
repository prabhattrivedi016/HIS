import { CheckCircle2 } from "lucide-react";

export default function RecentApproval() {
  const approvalsData = [
    {
      id: 1,
      date: "15-Sep-2026",
      corporate: "CGHS",
      type: "IPD",
      billNo: "IPD25612",
      amount: "1,24,500",
      status: "Settled",
    },
    {
      id: 2,
      date: "15-Sep-2026",
      corporate: "Star Health",
      type: "OPD",
      billNo: "OPD78921",
      amount: "8,420",
      status: "Approved",
    },
    {
      id: 3,
      date: "14-Sep-2026",
      corporate: "ECHS",
      type: "IPD",
      billNo: "IPD25598",
      amount: "2,36,800",
      status: "Settled",
    },
    {
      id: 4,
      date: "14-Sep-2026",
      corporate: "HDFC Ergo",
      type: "OPD",
      billNo: "OPD78865",
      amount: "5,720",
      status: "Approved",
    },
    {
      id: 5,
      date: "13-Sep-2026",
      corporate: "Niva Bupa",
      type: "IPD",
      billNo: "IPD25564",
      amount: "1,42,300",
      status: "Settled",
    },
  ];

  return (
    <div className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-2xs flex flex-col justify-between overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800 flex items-center">
          <CheckCircle2 size={17} className="text-blue-600 mr-2" />
          Recent Approvals / Settlements
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[550px] table-fixed border-collapse text-left text-[10px] sm:text-[11px]">
          <thead>
            <tr className="bg-blue-50 text-gray-500 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider">
              <th className="w-[18%] border border-gray-300 py-[1.2%] px-2">Date</th>
              <th className="w-[20%] border border-gray-300 py-[1.2%] px-2">Corporate</th>
              <th className="w-[12%] border border-gray-300 py-[1.2%] px-1 text-center">Type</th>
              <th className="w-[18%] border border-gray-300 py-[1.2%] px-2">Bill No.</th>
              <th className="w-[18%] border border-gray-300 py-[1.2%] px-2 text-center">
                Amount (₹)
              </th>
              <th className="w-[14%] border border-gray-300 py-[1.2%] px-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
            {approvalsData.map(row => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                <td className="border border-gray-300 py-[1%] px-2 text-gray-600">{row.date}</td>
                <td className="border border-gray-300 py-[1%] px-2 text-gray-900 font-bold">
                  {row.corporate}
                </td>
                <td className="border border-gray-300 py-[1%] px-1 text-gray-700 text-center">
                  {row.type}
                </td>
                <td className="border border-gray-300 py-[1%] px-2 text-blue-600 font-medium">
                  {row.billNo}
                </td>
                <td className="border border-gray-300 py-[1%] px-2 text-gray-900 text-center">
                  {row.amount}
                </td>
                <td className="border border-gray-300 py-[1%] px-2 text-center">
                  <span className="inline-flex items-center text-emerald-600 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
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
