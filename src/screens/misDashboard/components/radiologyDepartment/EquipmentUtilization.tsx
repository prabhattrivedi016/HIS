import { Activity } from "lucide-react";

export default function EquipmentUtilizationTable() {
  const equipmentData = [
    {
      id: 1,
      modality: "X-Ray",
      totalSlots: "48",
      used: "42",
      utilization: "88%",
      width: "88%",
    },
    {
      id: 2,
      modality: "Ultrasound",
      totalSlots: "40",
      used: "32",
      utilization: "80%",
      width: "80%",
    },
    {
      id: 3,
      modality: "CT Scan",
      totalSlots: "32",
      used: "26",
      utilization: "81%",
      width: "81%",
    },
    {
      id: 4,
      modality: "MRI",
      totalSlots: "24",
      used: "18",
      utilization: "75%",
      width: "75%",
    },
    {
      id: 5,
      modality: "Mammography",
      totalSlots: "16",
      used: "12",
      utilization: "75%",
      width: "75%",
    },
    {
      id: 6,
      modality: "Fluoroscopy",
      totalSlots: "12",
      used: "8",
      utilization: "67%",
      width: "67%",
    },
    {
      id: 7,
      modality: "DEXA",
      totalSlots: "8",
      used: "6",
      utilization: "75%",
      width: "75%",
    },
    {
      id: 8,
      modality: "Others",
      totalSlots: "10",
      used: "7",
      utilization: "70%",
      width: "70%",
    },
  ];

  return (
    <div className="w-full md:max-w-full bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-2xs flex flex-col justify-between overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800 flex items-center">
          <Activity size={17} className="text-blue-600 mr-2" />
          Equipment Utilization (Today)
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px] table-fixed border-collapse text-left text-[10px] sm:text-[11px]">
          <thead>
            <tr className="bg-blue-50 text-gray-500 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider">
              <th className="w-[26%] border border-gray-300 py-[1.2%] px-2 break-words">
                Modality
              </th>
              <th className="w-[20%] border border-gray-300 py-[1.2%] px-1 break-words text-center">
                Total Slots
              </th>
              <th className="w-[18%] border border-gray-300 py-[1.2%] px-1 break-words text-center">
                Used
              </th>
              <th className="w-[32%] border border-gray-300 py-[1.2%] px-2 break-words text-center">
                Utilization
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
            {equipmentData.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                <td className="border border-gray-300 py-[1.2%] px-2 text-gray-900 font-bold break-words">
                  {row.modality}
                </td>
                <td className="border border-gray-300 py-[1%] px-1 text-gray-600 break-words text-center">
                  {row.totalSlots}
                </td>
                <td className="border border-gray-300 py-[1%] px-1 text-gray-600 break-words text-center">
                  {row.used}
                </td>
                <td className="border border-gray-300 py-[1%] px-2 text-gray-700 break-words">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex-1  h-3.5 flex  overflow-hidden">
                      <div
                        style={{ width: row.width }}
                        className="h-full bg-emerald-500 rounded-sm"
                      />
                    </div>
                    <span className="font-extrabold text-gray-900 w-10 text-right">
                      {row.utilization}
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
