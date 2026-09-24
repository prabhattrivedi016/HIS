import {
  UserPlus,
  FlaskConical,
  FileCheck,
  Printer,
  Sliders,
  ListCheck,
  PackageCheck,
  ShieldCheck,
  FileText,
} from "lucide-react";

export default function QuickLinks() {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-2xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800 flex items-center">
          <FileText size={17} className="text-blue-600 mr-2" />
          Quick Links
        </h3>
      </div>
      <div className="grid grid-cols-4 gap-3 text-center my-auto">
        {[
          {
            label: "Patient Entry",
            icon: UserPlus,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Sample Collection",
            icon: FlaskConical,
            color: "text-teal-600 bg-teal-50",
          },
          {
            label: "Result Entry",
            icon: FileCheck,
            color: "text-indigo-600 bg-indigo-50",
          },
          {
            label: "Print Report",
            icon: Printer,
            color: "text-blue-500 bg-blue-50",
          },
          {
            label: "Test Master",
            icon: Sliders,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Rate List",
            icon: ListCheck,
            color: "text-emerald-600 bg-emerald-50",
          },
          {
            label: "Stock Management",
            icon: PackageCheck,
            color: "text-teal-600 bg-teal-50",
          },
          {
            label: "QC Entry",
            icon: ShieldCheck,
            color: "text-purple-600 bg-purple-50",
          },
        ].map((link) => {
          const IconComponent = link.icon;
          return (
            <div
              key={link.label}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 ${link.color}`}
              >
                <IconComponent size={20} />
              </div>
              <span className="text-[10px] font-semibold text-gray-600 mt-1.5 leading-tight">
                {link.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
