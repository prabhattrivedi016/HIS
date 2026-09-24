import {
  Clock,
  FileCheck,
  FileText,
  Layers,
  Package,
  Pill,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Store,
  TrendingUp,
  Truck,
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
            label: "New Sails",
            icon: ShoppingCart,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "OPD Dispensing",
            icon: RotateCcw,
            color: "text-rose-600 bg-rose-50",
          },
          {
            label: "IPD Dispensing",
            icon: Truck,
            color: "text-emerald-600 bg-emerald-50",
          },
          {
            label: "Purchase Entry",
            icon: Package,
            color: "text-amber-600 bg-amber-50",
          },
          {
            label: "Stock Transfer",
            icon: Clock,
            color: "text-purple-600 bg-purple-50",
          },
          {
            label: "Return Entry",
            icon: Pill,
            color: "text-teal-600 bg-teal-50",
          },
          {
            label: "Vendor Payment",
            icon: Store,
            color: "text-indigo-600 bg-indigo-50",
          },
          {
            label: "Stock Assignment",
            icon: Layers,
            color: "text-blue-500 bg-blue-50",
          },
          {
            label: "Expiry Reports",
            icon: FileText,
            color: "text-sky-600 bg-sky-50",
          },
          {
            label: "Inventory Ladger",
            icon: ShieldCheck,
            color: "text-emerald-500 bg-emerald-50",
          },
          {
            label: "Collelled Bill",
            icon: TrendingUp,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Prescription Report",
            icon: FileCheck,
            color: "text-rose-500 bg-rose-50",
          },
        ].map(link => {
          const IconComponent = link.icon;
          return (
            <div key={link.label} className="flex flex-col items-center group cursor-pointer">
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
