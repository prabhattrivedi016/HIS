import { Layers } from "lucide-react";

export default function DeptRevenueChart() {
  const departments = [
    { name: "IPD", amt: "₹ 1,25,40,600", width: "85%", color: "bg-blue-400" },
    {
      name: "Pharmacy",
      amt: "₹ 72,30,800",
      width: "30%",
      color: "bg-green-500",
    },
    {
      name: "Laboratory",
      amt: "₹ 48,12,450",
      width: "42%",
      color: "bg-yellow-500",
    },
    {
      name: "Radiology",
      amt: "₹ 37,64,900",
      width: "32%",
      color: "bg-purple-500",
    },
    { name: "OPD", amt: "₹ 28,90,300", width: "25%", color: "bg-blue-400" },
    { name: "OT", amt: "₹ 22,18,600", width: "20%", color: "bg-pink-400" },
    { name: "ICU", amt: "₹ 18,75,400", width: "16%", color: "bg-green-600" },
    {
      name: "Emergency",
      amt: "₹ 12,40,200",
      width: "11%",
      color: "bg-[#94a3b8]",
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs flex flex-col justify-between h-[340px]">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800 flex items-center">
            <Layers size={17} className="text-emerald-600 mr-2" />{" "}
            Department-wise Revenue (MTD)
          </h3>
        </div>

        <div className="space-y-2.5 pt-1">
          {departments.map((dept) => (
            <div key={dept.name} className="flex items-center text-xs">
              <span className="w-24 font-bold text-gray-600 truncate">
                {dept.name}
              </span>
              <div className="flex-1 mx-2 flex items-center">
                <div
                  style={{ width: dept.width }}
                  className={`h-5 ${dept.color}`}
                />
                <span className="font-extrabold text-gray-800 whitespace-nowrap ml-2 text-[11px]">
                  {dept.amt}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-[10px] text-transparent select-none pt-2">
        placeholder
      </div>
    </div>
  );
}
