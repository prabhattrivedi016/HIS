interface DashboardCardProps {
  title: string;
  value: number | string;
  gradient: string;
  icon?: ReactNode;
}

import { ArrowRight } from "lucide-react";
import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  value: number | string;
  gradient: string;
  icon?: ReactNode;
}

export const DashboardCard = ({ title, value, gradient, icon }: DashboardCardProps) => {
  return (
    <div
      className={`
    relative
    group
    rounded-lg
    p-4 sm:p-6

    text-gray-900
    overflow-hidden
    transition-all
    duration-300
    ease-in-out
    transform
    hover:-translate-y-1
    hover:shadow-2xl
    cursor-pointer
    
    w-full
    min-h-40
    sm:min-h-[165px]
    lg:min-h-[175px]
    shadow-sm

    ${gradient}
  `}
    >
      {/* Top Content */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-bold">{value}</h2>
          <p className="mt-8 text-md font-medium">{title}</p>
        </div>

        {icon && <div className=" opacity-20 group-hover:opacity-30 transition">{icon}</div>}
      </div>

      {/* Hover Buttons */}
      <div
        className="
          absolute
          bottom-2
          left-2
          right-2
          flex
          gap-3
          opacity-0
          translate-y-4
          group-hover:opacity-100
          group-hover:translate-y-0
          transition-all
          duration-300
        "
      >
        <button className="flex-1 bg-white/40 backdrop-blur-md text-black rounded-lg px-1 py-2 flex items-center justify-center gap-2 hover:bg-white/60 transition whitespace-nowrap">
          Request Report <ArrowRight size={16} />
        </button>

        <button className="flex-1 bg-white/40 backdrop-blur-md text-black px-1 py-2 rounded-lg font-sm flex items-center justify-center gap-2 hover:bg-white/60 transition">
          View Details <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default DashboardCard;
