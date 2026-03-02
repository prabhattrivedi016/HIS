import { BarChart3, UserPlus } from "lucide-react";
import DashboardCard from "./DashboardCard";

const DayCareDashboard = () => {
  return (
    <div className="page-container">
      <div className="form-grid-4 gap-6">
        <DashboardCard
          title="Total Admission"
          value={1}
          gradient="bg-gradient-to-br from-rose-100 to-rose-300"
          icon={<UserPlus size={50} />}
        />
        <DashboardCard
          title="Total Discharge"
          value={1}
          gradient="bg-gradient-to-br from-amber-100 to-amber-300"
          icon={<UserPlus size={50} />}
        />

        <DashboardCard
          title="Total Your Collection"
          value={0}
          gradient="bg-gradient-to-br from-violet-100 to-violet-300"
          icon={<BarChart3 size={50} />}
        />
      </div>
    </div>
  );
};

export default DayCareDashboard;
