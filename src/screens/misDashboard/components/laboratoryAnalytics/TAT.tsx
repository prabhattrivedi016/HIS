import {FileText} from 'lucide-react'

export default function DeptFinancialTable() {
  const tatData = [
    {
      id: 1,
      category: "Routine",
      avgTat: "8.2 Hrs",
      targetTat: "12 Hrs",
      compliance: "92%",
    },
    {
      id: 2,
      category: "Biochemistry",
      avgTat: "6.1 Hrs",
      targetTat: "8 Hrs",
      compliance: "94%",
    },
    {
      id: 3,
      category: "Hematology",
      avgTat: "5.6 Hrs",
      targetTat: "6 Hrs",
      compliance: "96%",
    },
    {
      id: 4,
      category: "Microbiology",
      avgTat: "24.5 Hrs",
      targetTat: "48 Hrs",
      compliance: "89%",
    },
    {
      id: 5,
      category: "Serology",
      avgTat: "12.8 Hrs",
      targetTat: "24 Hrs",
      compliance: "91%",
    },
    {
      id: 6,
      category: "Histopathology",
      avgTat: "36.2 Hrs",
      targetTat: "72 Hrs",
      compliance: "87%",
    },
    {
      id: 7,
      category: "Cytology",
      avgTat: "28.4 Hrs",
      targetTat: "48 Hrs",
      compliance: "90%",
    },
    {
      id: 8,
      category: "Molecular",
      avgTat: "30.6 Hrs",
      targetTat: "48 Hrs",
      compliance: "88%",
    },
    {
      id: 9,
      category: "Others",
      avgTat: "18.5 Hrs",
      targetTat: "24 Hrs",
      compliance: "92%",
    },
  ];

  return (
    <div className="w-full md:max-w-full bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-2xs flex flex-col justify-between overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800 flex items-center">
          <FileText size={17} className="text-blue-600 mr-2" />
          TAT (Turn Around Time)
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[450px] table-fixed border-collapse text-left text-[10px] sm:text-[11px]">
          <thead>
            <tr className="bg-blue-50 text-gray-500 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider">
              <th className="w-[25%] border border-gray-300 py-1.5 px-1 break-words">
                Test Category
              </th>
              <th className="w-[22%] border border-gray-300 py-1.5 px-1 break-words text-center">
                Avg. TAT
              </th>
              <th className="w-[22%] border border-gray-300 py-1.5 px-1 break-words text-center">
                Target TAT
              </th>
              <th className="w-[22%] border border-gray-300 py-1.5 px-1 break-words text-center">
                Compliance
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
            {tatData.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                <td className="border border-gray-300 py-1 px-1 font-bold text-gray-900 break-words">
                  {row.category}
                </td>
                <td className="border border-gray-300 py-1.5 px-1 text-gray-600 break-words text-center">
                  {row.avgTat}
                </td>
                <td className="border border-gray-300 py-1.5 px-1 text-gray-600 break-words text-center">
                  {row.targetTat}
                </td>
                <td className="border border-gray-300 py-1.5 px-1 font-bold text-emerald-600 break-words text-center">
                  {row.compliance}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
