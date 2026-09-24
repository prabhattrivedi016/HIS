import {FileText} from 'lucide-react'

export default function TopMedicinesTable() {
  const topMedicines = [
    {
      id: 1,
      name: "Paracetamol 500mg",
      qty: "12,580",
      amount: "2,51,600",
      margin: "28%",
    },
    {
      id: 2,
      name: "Pantoprazole 40mg",
      qty: "8,420",
      amount: "2,18,920",
      margin: "32%",
    },
    {
      id: 3,
      name: "Ceftriaxone 1gm",
      qty: "4,260",
      amount: "1,84,400",
      margin: "26%",
    },
    {
      id: 4,
      name: "Azithromycin 500mg",
      qty: "3,980",
      amount: "1,62,180",
      margin: "30%",
    },
    {
      id: 5,
      name: "Ondansetron 4mg",
      qty: "5,420",
      amount: "1,48,600",
      margin: "34%",
    },
    {
      id: 6,
      name: "Amlodipine 5mg",
      qty: "6,800",
      amount: "1,36,000",
      margin: "28%",
    },
    {
      id: 7,
      name: "Metformin 500mg",
      qty: "7,240",
      amount: "1,28,160",
      margin: "26%",
    },
    {
      id: 8,
      name: "Insulin (Humalog)",
      qty: "1,120",
      amount: "1,21,600",
      margin: "28%",
    },
    {
      id: 9,
      name: "Multivitamin Tab",
      qty: "6,960",
      amount: "1,14,200",
      margin: "32%",
    },
    {
      id: 10,
      name: "Salbutamol Inhaler",
      qty: "2,420",
      amount: "1,02,600",
      margin: "24%",
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
        <table className="w-full min-w-[550px] table-fixed border-collapse text-left text-[10px] sm:text-[11px]">
          <thead>
            <tr className="bg-blue-50 text-gray-500 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider">
              <th className="w-[10%] border border-gray-300 py-[1.2%] px-1 break-words text-center">
                #
              </th>
              <th className="w-[35%] border border-gray-300 py-[1.2%] px-2 break-words">
                Medicine Name
              </th>
              <th className="w-[16%] border border-gray-300 py-[1.2%] px-1 break-words text-center">
                Qty Sold
              </th>
              <th className="w-[22%] border border-gray-300 py-[1.2%] px-1 break-words text-center">
                Sales Amount (₹)
              </th>
              <th className="w-[15%] border border-gray-300 py-[1.2%] px-1 break-words text-center">
                Margin %
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
            {topMedicines.map((row) => (
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
                  {row.margin}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
