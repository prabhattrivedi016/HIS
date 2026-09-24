import { Layers } from "lucide-react";

export default function DeptRevenueChart() {
  const departments = [
    {
      name: "Biochemistry",
      amt: "₹ 14,12,300",
      width: "90%",
      color: "bg-blue-600",
    },
    {
      name: "Hematology",
      amt: "₹ 8,42,600",
      width: "65%",
      color: "bg-emerald-500",
    },
    {
      name: "Microbiology",
      amt: "₹ 6,28,400",
      width: "50%",
      color: "bg-amber-400",
    },
    {
      name: "Serology",
      amt: "₹ 5,21,300",
      width: "42%",
      color: "bg-purple-600",
    },
    {
      name: "Histopathology",
      amt: "₹ 4,82,600",
      width: "38%",
      color: "bg-pink-500",
    },
    { name: "Cytology", amt: "₹ 3,64,200", width: "30%", color: "bg-blue-500" },
    {
      name: "Molecular",
      amt: "₹ 2,18,400",
      width: "20%",
      color: "bg-teal-500",
    },
    { name: "Others", amt: "₹ 3,62,250", width: "30%", color: "bg-gray-500" },
  ];

  return (
    <div className="w-full md:max-w-full bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-2xs flex flex-col justify-between overflow-hidden">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800 flex items-center">
            <Layers size={17} className="text-blue-600 mr-2 " /> Department-wise
            Lab Revenue (MTD)
          </h3>
        </div>

        <div className="space-y-3 pt-1">
          {departments.map((dept) => (
            <div key={dept.name} className="flex items-center text-xs">
              <span className="w-28 font-bold text-gray-600 truncate">
                {dept.name}
              </span>
              <div className="flex-1 mx-2 flex items-center">
                <div
                  style={{ width: dept.width }}
                  className={`h-7  ${dept.color}`}
                />
                <span className="font-extrabold text-gray-800 whitespace-nowrap ml-2 text-[11px]">
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
