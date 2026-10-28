import { Bed, Users, CheckCircle2, Calendar, Sparkles, Lock, PieChart } from "lucide-react";

export default function BedStatsCards() {
    const statsCards = [
        { title: "Total Beds", value: "300", percentage: "+2.5%", trend: "up", icon: <Bed size={28} className="text-blue-600" /> },
        { title: "Occupied", value: "238", percentage: "79.3% ↑ +4.1%", trend: "up", icon: <Users size={28} className="text-rose-500" /> },
        { title: "Available", value: "45", percentage: "15.0% ↓ -2.8%", trend: "down", icon: <CheckCircle2 size={28} className="text-emerald-600" /> },
        { title: "Reserved", value: "8", percentage: "2.7% ↑ +0.5%", trend: "up", icon: <Calendar size={28} className="text-amber-500" /> },
        { title: "Cleaning", value: "6", percentage: "2.0% ↓ -1.0%", trend: "down", icon: <Sparkles size={28} className="text-cyan-500" /> },
        { title: "Blocked", value: "3", percentage: "1.0%", trend: "neutral", icon: <Lock size={28} className="text-purple-600" /> },
        {
            title: "Occupancy Rate",
            value: "79.3%",
            isCircular: true,
            breakdown: [
                { label: "Occupied", percent: "79.3%", value: 79.3, color: "#f43f5e" }, // rose-500
                { label: "Available", percent: "15.0%", value: 15.0, color: "#10b981" }, // emerald-500
                { label: "Reserved", percent: "2.7%", value: 2.7, color: "#f59e0b" }, // amber-500
                { label: "Cleaning", percent: "2.0%", value: 2.0, color: "#06b6d4" }, // cyan-500
                { label: "Blocked", percent: "1.0%", value: 1.0, color: "#9333ea" }  // purple-600
            ],
            icon: <PieChart size={28} className="text-blue-600" />
        },
    ];

    // SVG Donut Chart Calculation helper
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    let accumulatedPercent = 0;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-8 gap-3 w-full overflow-x-auto flex-nowrap pb-2 [&::-webkit-scrollbar]:h-2">
            {statsCards.map((card, index) => {
                const isOccupancyCard = card.isCircular;
                return (
                    <div
                        key={index}
                        className={`bg-white border border-gray-200 rounded-xl p-3 shadow-2xs flex shrink-0 min-w-[150px] ${isOccupancyCard
                            ? "col-span-2 sm:col-span-4 lg:col-span-2 flex-col not-odd:sm:flex-row sm:flex-row items-center justify-between gap-3 min-w-[260px]"
                            : "items-center gap-3"
                            }`}
                    >
                        {/* Standard Card Layout */}
                        {!isOccupancyCard ? (
                            <>
                                <div className="shrink-0">
                                    {card.icon}
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                    <span className="text-[12px] font-bold text-gray-500 truncate">{card.title}</span>
                                    <div className="text-base sm:text-lg font-extrabold text-gray-900 leading-tight my-0.5">{card.value}</div>
                                    <span className={`text-[10px] font-bold truncate ${card.trend === 'up' ? 'text-emerald-600' : card.trend === 'down' ? 'text-rose-500' : 'text-gray-500'}`}>
                                        {card.percentage}
                                    </span>
                                </div>
                            </>
                        ) : (
                            /* Occupancy Rate Card Layout with Proper SVG Donut & 5 Labels */
                            <>
                                <div className="flex items-center gap-2.5 w-full sm:w-auto ">
                                    <div className="relative w-12 h-12 flex items-center justify-center shrink-0 ">
                                        <svg className="w-full h-full transform -rotate-90 " viewBox="0 0 36 36">
                                            {card.breakdown.map((item, i) => {
                                                const strokeDasharray = `${(item.value / 100) * circumference} ${circumference}`;
                                                const strokeDashoffset = -1 * (accumulatedPercent / 100) * circumference;
                                                accumulatedPercent += item.value;

                                                return (
                                                    <circle
                                                        key={i}
                                                        cx="18"
                                                        cy="18"
                                                        r={radius}
                                                        fill="transparent"
                                                        stroke={item.color}
                                                        strokeWidth="4"
                                                        strokeDasharray={strokeDasharray}
                                                        strokeDashoffset={strokeDashoffset}
                                                    />
                                                );
                                            })}
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-[10px] font-extrabold text-gray-900 leading-none">{card.value}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{card.title}</span>
                                        <span className="text-xs font-extrabold text-gray-800">Breakdown</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1 w-full sm:w-auto text-[10px] font-medium text-gray-600 border-t sm:border-t-0 sm:border-l border-gray-100 pt-2 sm:pt-0 sm:pl-3">
                                    {card.breakdown.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-1.5">
                                                <span
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: item.color }}
                                                ></span>
                                                <span className="text-gray-600 font-semibold">{item.label}</span>
                                            </div>
                                            <span className="font-bold text-gray-900">{item.percent}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
}