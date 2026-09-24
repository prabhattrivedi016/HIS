import { FileText } from "lucide-react";
export default function CriticalReportsTable() {
  const criticalReports = [
    {
      id: 1,
      uhid: "P0001184",
      patient: "Mohd. Arif",
      test: "Potassium",
      result: "6.8",
      alert: "High",
      alertColor: "text-rose-600 ",
    },
    {
      id: 2,
      uhid: "P0001185",
      patient: "Geeta Yadav",
      test: "Hemoglobin",
      result: "6.2",
      alert: "Low",
      alertColor: "text-rose-600 ",
    },
    {
      id: 3,
      uhid: "P0001186",
      patient: "Suresh Tiwari",
      test: "Troponin I",
      result: "Positive",
      alert: "Critical",
      alertColor: "text-red-600 font-bold ",
    },
    {
      id: 4,
      uhid: "P0001187",
      patient: "Kiran Singh",
      test: "Malaria (PF)",
      result: "Positive",
      alert: "Critical",
      alertColor: "text-red-600 ",
    },
    {
      id: 5,
      uhid: "P0001188",
      patient: "Anita Sharma",
      test: "D-Dimer",
      result: "1200",
      alert: "High",
      alertColor: "text-rose-600",
    },
  ];

  return (
    <div className="w-full md:max-w-full bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-2xs flex flex-col justify-between overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800 flex items-center">
          <FileText size={17} className="text-blue-600 mr-2" />
          Critical Reports (Today)
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[550px] table-fixed border-collapse text-left text-[10px] sm:text-[11px]">
          <thead>
            <tr className="bg-blue-50 text-gray-500 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider">
              <th className="w-[8%] border border-gray-300 py-1.2 px-1 break-words text-center">
                #
              </th>
              <th className="w-[18%] border border-gray-300 py-[1%] px-1 break-words text-center">
                UHID
              </th>
              <th className="w-[24%] border border-gray-300 py-[1%] px-1 break-words text-center">
                Patient Name
              </th>
              <th className="w-[22%] border border-gray-300 py-[1%] px-1 break-words text-center">
                Test Name
              </th>
              <th className="w-[14%] border border-gray-300 py-[1%] px-1 break-words text-center">
                Result
              </th>
              <th className="w-[14%] border border-gray-300 py-[1%] px-1 break-words text-center">
                Alert
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
            {criticalReports.map(row => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                <td className="border border-gray-300 py-[1%] px-1 font-bold text-gray-900 break-words text-center">
                  {row.id}
                </td>
                <td className="border border-gray-300 py-[1%] px-1 text-blue-600 font-bold break-words text-center">
                  {row.uhid}
                </td>
                <td className="border border-gray-300 py-[1%] px-1 text-gray-900 font-bold break-words text-center">
                  {row.patient}
                </td>
                <td className="border border-gray-300 py-[1%] px-1 text-gray-700 break-words text-center">
                  {row.test}
                </td>
                <td className="border border-gray-300 py-[1%] px-1 text-rose-600 font-bold break-words text-center">
                  {row.result}
                </td>
                <td className="border border-gray-300 py-[1%] px-1 text-center">
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[11px] inline-block ${row.alertColor}`}
                  >
                    {row.alert}
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
