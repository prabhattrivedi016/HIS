import { Layers } from "lucide-react";

export default function DeptRevenueChart() {
  const collectionSources = [
    {
      name: "OPD",
      pct: "42%",
      count: "524",
      width: "85%",
      color: "bg-blue-600",
    },
    {
      name: "IPD",
      pct: "38%",
      count: "474",
      width: "75%",
      color: "bg-emerald-500",
    },
    {
      name: "Emergency",
      pct: "8%",
      count: "100",
      width: "25%",
      color: "bg-amber-400",
    },
    {
      name: "Health Checkup",
      pct: "6%",
      count: "75",
      width: "20%",
      color: "bg-purple-600",
    },
    {
      name: "Corporate",
      pct: "4%",
      count: "50",
      width: "15%",
      color: "bg-pink-500",
    },
    { name: "Camp", pct: "2%", count: "25", width: "10%", color: "bg-sky-400" },
    {
      name: "Home Collection",
      pct: "2%",
      count: "20",
      width: "10%",
      color: "bg-teal-500",
    },
    {
      name: "Others",
      pct: "6%",
      count: "75",
      width: "20%",
      color: "bg-gray-500",
    },
  ];

  return (
    <div className="w-full md:max-w-full bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-2xs flex flex-col justify-between overflow-hidden">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800 flex items-center">
            <Layers size={17} className="text-blue-600 mr-2" /> Sample
            Collection Source (MTD)
          </h3>
        </div>

        <div className="space-y-3 pt-1">
          {collectionSources.map((source) => (
            <div key={source.name} className="flex items-center text-xs">
              <span className="w-32 font-bold text-gray-600 truncate">
                {source.name}
              </span>
              <div className="flex-1 mx-2 flex items-center justify-between">
                <div className="flex-1 flex items-center">
                  <div
                    style={{ width: source.width }}
                    className={`h-7  ${source.color}`}
                  />
                </div>
                <div className="flex items-center space-x-3 ml-2 shrink-0">
                  <span className="font-medium text-gray-400 text-[11px] w-8 text-right">
                    {source.pct}
                  </span>
                  <span className="font-extrabold text-gray-800 text-[11px] w-8 text-right">
                    {source.count}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
