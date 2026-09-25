import { Clock } from "lucide-react";

export default function TopPendingCasesTable() {
  const pendingData = [
    {
      id: 1,
      name: "Rahul Singh",
      corporate: "CGHS",
      billNo: "IPD25641",
      amount: "2,48,500",
      days: "12",
    },
    {
      id: 2,
      name: "Suman Verma",
      corporate: "ECHS",
      billNo: "IPD25698",
      amount: "1,86,300",
      days: "10",
    },
    {
      id: 3,
      name: "Amit Kumar",
      corporate: "Star Health",
      billNo: "IPD25721",
      amount: "1,42,600",
      days: "9",
    },
    {
      id: 4,
      name: "Neha Gupta",
      corporate: "HDFC Ergo",
      billNo: "IPD25744",
      amount: "1,28,400",
      days: "8",
    },
    {
      id: 5,
      name: "Vikram Joshi",
      corporate: "Niva Bupa",
      billNo: "IPD25789",
      amount: "96,300",
      days: "8",
    },
  ];

  return (
    <div className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-2xs flex flex-col justify-between overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800 flex items-center">
          <Clock size={17} className="text-blue-600 mr-2" />
          Top 5 Pending Cases (&gt; 7 Days)
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[450px] table-fixed border-collapse text-left text-[10px] sm:text-[11px]">
          <thead>
            <tr className="bg-blue-50 text-gray-500 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider">
              <th className="w-[8%] border border-gray-300 py-[1.2%] px-1 text-center">#</th>
              <th className="w-[24%] border border-gray-300 py-[1.2%] px-2">Patient Name</th>
              <th className="w-[18%] border border-gray-300 py-[1.2%] px-2">Corporate</th>
              <th className="w-[18%] border border-gray-300 py-[1.2%] px-2">Bill No.</th>
              <th className="w-[18%] border border-gray-300 py-[1.2%] px-2 text-center">
                Amount (₹)
              </th>
              <th className="w-[14%] border border-gray-300 py-[1.2%] px-1 text-center">Days</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
            {pendingData.map(row => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                <td className="border border-gray-300 py-[1%] px-1 font-bold text-gray-900 text-center">
                  {row.id}
                </td>
                <td className="border border-gray-300 py-[1.2%] px-2 text-gray-900 font-bold">
                  {row.name}
                </td>
                <td className="border border-gray-300 py-[1.2%] px-2 text-gray-700">
                  {row.corporate}
                </td>
                <td className="border border-gray-300 py-[1.2%] px-2 text-blue-600 font-medium">
                  {row.billNo}
                </td>
                <td className="border border-gray-300 py-[1%] px-2 text-gray-900 text-center">
                  {row.amount}
                </td>
                <td className="border border-gray-300 py-[1%] px-1 text-amber-600 font-bold text-center">
                  {row.days}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
