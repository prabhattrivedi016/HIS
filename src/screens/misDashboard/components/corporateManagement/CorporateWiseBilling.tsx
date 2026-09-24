import { FileText } from "lucide-react";

export default function CorporateWiseBillingTable() {
  const corporateData = [
    {
      id: 1,
      corporate: "CGHS",
      patients: "286",
      billed: "28,46,300",
      approved: "25,12,800",
      received: "21,60,450",
      pending: "3,52,350",
    },
    {
      id: 2,
      corporate: "ECHS",
      patients: "198",
      billed: "21,38,600",
      approved: "18,76,400",
      received: "15,42,300",
      pending: "3,34,100",
    },
    {
      id: 3,
      corporate: "Star Health",
      patients: "164",
      billed: "18,76,200",
      approved: "16,24,500",
      received: "13,18,600",
      pending: "3,05,900",
    },
    {
      id: 4,
      corporate: "Niva Bupa",
      patients: "142",
      billed: "15,42,800",
      approved: "13,86,400",
      received: "11,24,300",
      pending: "2,62,100",
    },
    {
      id: 5,
      corporate: "HDFC Ergo",
      patients: "126",
      billed: "11,84,600",
      approved: "10,48,200",
      received: "8,42,600",
      pending: "2,05,600",
    },
    {
      id: 6,
      corporate: "ICICI Lombard",
      patients: "98",
      billed: "9,76,300",
      approved: "8,42,600",
      received: "6,84,200",
      pending: "1,58,400",
    },
    {
      id: 7,
      corporate: "Aditya Birla",
      patients: "86",
      billed: "8,42,100",
      approved: "7,36,800",
      received: "5,92,400",
      pending: "1,44,400",
    },
    {
      id: 8,
      corporate: "Reliance General",
      patients: "74",
      billed: "6,58,300",
      approved: "5,62,400",
      received: "4,38,200",
      pending: "1,24,200",
    },
    {
      id: 9,
      corporate: "Tata AIG",
      patients: "62",
      billed: "5,84,600",
      approved: "5,02,300",
      received: "3,96,600",
      pending: "1,05,700",
    },
    {
      id: 10,
      corporate: "Others",
      patients: "186",
      billed: "12,46,800",
      approved: "9,98,900",
      received: "7,98,380",
      pending: "2,00,520",
    },
  ];

  return (
    <div className="w-full md:max-w-full bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-2xs flex flex-col justify-between overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800 flex items-center">
          <FileText size={17} className="text-blue-600 mr-2" />
          Corporate Wise Billing (MTD)
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[580px] table-fixed border-collapse text-left text-[10px] sm:text-[11px]">
          <thead>
            <tr className="bg-blue-50 text-gray-500 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider">
              <th className="w-[6%] border border-gray-300 py-[1.2%] px-1 text-center">#</th>
              <th className="w-[22%] border border-gray-300 py-[1.2%] px-2">Corporate / TPA</th>
              <th className="w-[12%] border border-gray-300 py-[1.2%] px-1 text-center">
                Patients
              </th>
              <th className="w-[15%] border border-gray-300 py-[1.2%] px-2 text-center">
                Billed (₹)
              </th>
              <th className="w-[17%] border border-gray-300 py-[1.2%] px-2 text-center">
                Approved (₹)
              </th>
              <th className="w-[17%] border border-gray-300 py-[1.2%] px-2 text-center">
                Received (₹)
              </th>
              <th className="w-[17%] border border-gray-300 py-[1.2%] px-2 text-center">
                Pending (₹)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
            {corporateData.map(row => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                <td className="border border-gray-300 py-[1%] px-1 font-bold text-gray-900 text-center">
                  {row.id}
                </td>
                <td className="border border-gray-300 py-[1.2%] px-2 text-gray-900 font-bold">
                  {row.corporate}
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
                <td className="border border-gray-300 py-[1%] px-2 text-emerald-600 text-center">
                  {row.received}
                </td>
                <td className="border border-gray-300 py-[1%] px-2 text-amber-600 text-center">
                  {row.pending}
                </td>
              </tr>
            ))}
            {/* Total Row */}
            <tr className="bg-slate-100 font-black text-gray-900">
              <td className="border border-gray-300 py-1.5 px-1 text-center">-</td>
              <td className="border border-gray-300 py-1.5 px-2">Total</td>
              <td className="border border-gray-300 py-1.5 px-1 text-center">1,246</td>
              <td className="border border-gray-300 py-1.5 px-2 text-right">1,28,75,600</td>
              <td className="border border-gray-300 py-1.5 px-2 text-right text-blue-700">
                1,12,40,300
              </td>
              <td className="border border-gray-300 py-1.5 px-2 text-right text-emerald-700">
                94,18,450
              </td>
              <td className="border border-gray-300 py-1.5 px-2 text-right text-amber-700">
                34,56,150
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
