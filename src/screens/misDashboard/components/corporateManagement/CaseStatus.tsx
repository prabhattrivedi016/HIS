import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
} from "lucide-react";

export default function CaseStatus() {
  const caseStatuses = [
    {
      label: "Total Cases",
      val: "612",
      icon: FileText,
      color: "text-blue-600 bg-blue-50",
      textColor: "text-gray-900",
    },
    {
      label: "Approved",
      val: "416",
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      label: "Pending",
      val: "122",
      icon: Clock,
      color: "text-amber-600 bg-amber-50",
      textColor: "text-amber-600",
    },
    {
      label: "Rejected",
      val: "49",
      icon: XCircle,
      color: "text-rose-600 bg-rose-50",
      textColor: "text-rose-600",
    },
    {
      label: "Query Raised",
      val: "25",
      icon: HelpCircle,
      color: "text-purple-600 bg-purple-50",
      textColor: "text-purple-600",
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-2xs flex flex-col justify-between w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800 flex items-center">
          <FileText size={17} className="text-blue-600 mr-2" />
          Case Status (This Month)
        </h3>
      </div>

      {/* Case Status Grid Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-center my-auto">
        {caseStatuses.map((item) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.label}
              className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col items-center justify-between shadow-2xs hover:shadow-md transition-shadow"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${item.color}`}
              >
                <IconComponent size={20} />
              </div>
              <div className="flex flex-col items-center">
                <span
                  className={`text-lg sm:text-xl font-black ${item.textColor}`}
                >
                  {item.val}
                </span>
                <span className="text-[11px] font-bold text-gray-500 mt-0.5">
                  {item.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
