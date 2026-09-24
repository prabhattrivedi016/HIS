import {FileText} from 'lucide-react'

export default function DeptFinancialTable() {
  const topTests = [
    {
      id: 1,
      name: "Complete Blood Count (CBC)",
      count: "2,842",
      rev: "4,26,300",
    },
    { id: 2, name: "Blood Sugar (RBS/FBS)", count: "2,156", rev: "1,72,480" },
    {
      id: 3,
      name: "Liver Function Test (LFT)",
      count: "1,320",
      rev: "2,64,000",
    },
    {
      id: 4,
      name: "Kidney Function Test (KFT)",
      count: "1,284",
      rev: "2,18,280",
    },
    {
      id: 5,
      name: "Urine Routine & Microscopy",
      count: "1,120",
      rev: "84,000",
    },
    { id: 6, name: "Lipid Profile", count: "980", rev: "1,96,000" },
    {
      id: 7,
      name: "Thyroid Profile (T3 T4 TSH)",
      count: "842",
      rev: "1,68,400",
    },
    { id: 8, name: "CRP (C-Reactive Protein)", count: "720", rev: "86,400" },
    { id: 9, name: "Dengue NS1 / IgM / IgG", count: "680", rev: "1,36,000" },
    { id: 10, name: "HBA1C", count: "642", rev: "1,28,400" },
  ];

  return (
    <div className="w-full md:max-w-full bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-2xs flex flex-col justify-between overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800 flex items-center">
          <FileText size={17} className="text-blue-600 mr-2" />
          Top 10 Test By Volume (MTD)
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[450px] table-fixed border-collapse text-left text-[10px] sm:text-[11px]">
          <thead>
            <tr className="bg-blue-50 text-gray-500 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider">
              <th className="w-[12%] border border-gray-300 py-1.2 px-1 break-words text-center">
                #
              </th>
              <th className="w-[38%] border border-gray-300 py-[1%] px-1 break-words">
                Test Name
              </th>
              <th className="w-[20%] border border-gray-300 py-[1%] px-1 break-words text-center">
                No. of Tests
              </th>
              <th className="w-[22%] border border-gray-300 py-[1%] px-1 break-words text-center">
                Revenue (₹)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
            {topTests.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                <td className="border border-gray-300 py-[1%] px-1 font-bold text-gray-900 break-words text-center">
                  {row.id}
                </td>
                <td className="border border-gray-300 py-[1%] px-1 font-bold text-gray-900 break-words ">
                  {row.name}
                </td>
                <td className="border border-gray-300 py-[1%] px-1 text-gray-600 break-words text-center">
                  {row.count}
                </td>
                <td className="border border-gray-300 py-[1%] px-1 font-bold text-blue-600 break-words text-center">
                  {row.rev}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
