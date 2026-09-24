import {
  FileText,
  DollarSign,
  Receipt,
  CreditCard,
  BookOpen,
  PieChart,
  BarChart2,
  TrendingUp,
} from "lucide-react";

export default function QuickLinks() {
  return (
    <div className="bg-white rounded-2xl p-3 border border-gray-200 shadow-2xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800 flex items-center">
          <FileText size={17} className="text-blue-600 mr-2" />
          Quick Links
        </h3>
      </div>
      <div className="grid grid-cols-4 gap-3 text-center my-auto">
        {[
          {
            label: "Create Voucher",
            icon: FileText,
            color: "text-emerald-600 bg-emerald-50",
          },
          {
            label: "Expense Entry",
            icon: DollarSign,
            color: "text-rose-600 bg-rose-50",
          },
          {
            label: "Receipts",
            icon: Receipt,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Payment Entry",
            icon: CreditCard,
            color: "text-purple-600 bg-purple-50",
          },
          {
            label: "Day Book",
            icon: BookOpen,
            color: "text-amber-600 bg-amber-50",
          },
          {
            label: "Ledger Report",
            icon: PieChart,
            color: "text-teal-600 bg-teal-50",
          },
          {
            label: "Trial Balance",
            icon: BarChart2,
            color: "text-indigo-600 bg-indigo-50",
          },
          {
            label: "P&L Report",
            icon: TrendingUp,
            color: "text-pink-600 bg-pink-50",
          },
        ].map((link) => {
          const IconComponent = link.icon;
          return (
            <div
              key={link.label}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 ${link.color}`}
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
