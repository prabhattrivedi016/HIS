import { Layers } from "lucide-react";

export default function DepartmentWisePharmacyConsumption() {
  const departments = [
    {
      name: "IPD",
      amt: "₹ 18,45,600",
      width: "90%",
      color: "bg-blue-600",
    },
    {
      name: "OPD",
      amt: "₹ 14,72,300",
      width: "75%",
      color: "bg-emerald-500",
    },
    {
      name: "ICU",
      amt: "₹ 8,92,400",
      width: "55%",
      color: "bg-amber-400",
    },
    {
      name: "Emergency",
      amt: "₹ 6,48,200",
      width: "42%",
      color: "bg-purple-600",
    },
    {
      name: "OT",
      amt: "₹ 6,12,800",
      width: "38%",
      color: "bg-pink-500",
    },
    {
      name: "Pediatrics",
      amt: "₹ 5,84,600",
      width: "35%",
      color: "bg-sky-400",
    },
    {
      name: "Gynecology",
      amt: "₹ 5,21,300",
      width: "30%",
      color: "bg-teal-500",
    },
    {
      name: "Surgery",
      amt: "₹ 4,86,400",
      width: "25%",
      color: "bg-indigo-500",
    },
  ];

  return (
    <div className="w-full md:max-w-full bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-2xs flex flex-col justify-between ">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800 flex items-center">
            <Layers size={17} className="text-blue-600 mr-2 " /> Department-wise Pharmacy
            Consumption (MTD)
          </h3>
        </div>

        <div className="space-y-4 pt-1">
          {departments.map(dept => (
            <div key={dept.name} className="flex items-center text-xs">
              <span className="w-28 font-bold text-gray-600 truncate">{dept.name}</span>
              <div className="flex-1 mx-2 flex items-center">
                <div style={{ width: dept.width }} className={`h-4 ${dept.color}`} />
                <span className="font-bold text-gray-800 whitespace-nowrap ml-2 text-[11px]">
                  {dept.amt}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
