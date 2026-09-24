import { Truck } from "lucide-react";

export default function VendorPurchaseTable() {
  const vendorData = [
    {
      id: 1,
      vendor: "Alkem Labs",
      purchase: "8,62,400",
      paid: "6,48,200",
      payable: "2,14,200",
    },
    {
      id: 2,
      vendor: "Sun Pharma",
      purchase: "7,84,600",
      paid: "5,96,400",
      payable: "1,88,200",
    },
    {
      id: 3,
      vendor: "Cipla Ltd",
      purchase: "6,42,300",
      paid: "4,82,600",
      payable: "1,59,700",
    },
    {
      id: 4,
      vendor: "Zydus Cadila",
      purchase: "5,86,200",
      paid: "4,20,300",
      payable: "1,65,900",
    },
    {
      id: 5,
      vendor: "Intas Pharma",
      purchase: "4,92,600",
      paid: "3,84,200",
      payable: "1,08,400",
    },
    {
      id: 6,
      vendor: "Dr. Reddy's",
      purchase: "4,21,800",
      paid: "3,12,600",
      payable: "1,09,200",
    },
    {
      id: 7,
      vendor: "Mankind Pharma",
      purchase: "3,84,300",
      paid: "2,64,800",
      payable: "1,19,500",
    },
    {
      id: 8,
      vendor: "Abbott India",
      purchase: "3,22,400",
      paid: "2,24,600",
      payable: "97,800",
    },
    {
      id: 9,
      vendor: "Torrent Pharma",
      purchase: "2,98,600",
      paid: "1,98,400",
      payable: "1,00,200",
    },
    {
      id: 10,
      vendor: "Others",
      purchase: "4,14,200",
      paid: "2,86,400",
      payable: "1,27,800",
    },
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800 flex items-center">
          <Truck size={17} className="text-blue-600 mr-2" />
          Vendor-wise Purchase / Payment Summary (MTD)
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px] table-fixed border-collapse text-left text-[10px] sm:text-[11px]">
          <thead>
            <tr className="bg-blue-50 text-gray-500 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider">
              <th className="w-[7%] border border-gray-300 py-1.2 px-1 break-words text-center">
                #
              </th>
              <th className="w-[20%] border border-gray-300 py-[1%] px-2 break-words">
                Vendor Name
              </th>
              <th className="w-[18%] border border-gray-300 py-[1%] px-1 break-words text-center">
                Purchase (₹)
              </th>
              <th className="w-[18%] border border-gray-300 py-[1%] px-1 break-words text-center">
                Paid (₹)
              </th>
              <th className="w-[18%] border border-gray-300 py-[1%] px-1 break-words text-center">
                Payable (₹)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
            {vendorData.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                <td className="border border-gray-300 py-[1%] px-1 font-bold text-gray-900 break-words text-center">
                  {row.id}
                </td>
                <td className="border border-gray-300 py-[1%] px-2 text-gray-900 font-bold break-words">
                  {row.vendor}
                </td>
                <td className="border border-gray-300 py-[1%] px-1 text-gray-700 break-words text-center">
                  {row.purchase}
                </td>
                <td className="border border-gray-300 py-[1%] px-1 text-emerald-600 break-words text-center">
                  {row.paid}
                </td>
                <td className="border border-gray-300 py-[1%] px-1 text-rose-600 font-bold break-words text-center">
                  {row.payable}
                </td>
              </tr>
            ))}
            {/* Total Row */}
            <tr className="bg-slate-100 font-black text-gray-900">
              <td className="border border-gray-300 py-1.5 px-1 break-words text-center">
                -
              </td>
              <td className="border border-gray-300 py-1.5 px-2 break-words text-center">
                Total
              </td>
              <td className="border border-gray-300 py-1.5 px-1 break-words text-center">
                48,90,400
              </td>
              <td className="border border-gray-300 py-1.5 px-1 break-words  text-emerald-700 text-center">
                36,78,100
              </td>
              <td className="border border-gray-300 py-1.5 px-1 break-words  text-rose-700 text-center">
                12,12,300
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
