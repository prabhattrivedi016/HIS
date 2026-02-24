import { BarChart3, LogOut, UserPlus, UserPlus2, Users, Wallet } from "lucide-react";
import DashboardCard from "./DashboardCard";

const FrontOfficeDashboard = () => {
  return (
    <div className="page-container">
      {/* <div className="card"> */}
      <div className="form-grid-4 gap-6">
        <DashboardCard
          title="Total Visited Patients"
          value={0}
          gradient="bg-gradient-to-br from-sky-100 to-sky-300"
          icon={<Users size={50} />}
        />
        <DashboardCard
          title="Total Your Collection"
          value={0}
          gradient="bg-gradient-to-br from-violet-100 to-violet-300"
          icon={<BarChart3 size={50} />}
        />
        <DashboardCard
          title="Total Emergency Visit"
          value={1}
          gradient="bg-gradient-to-br from-rose-100 to-rose-300"
          icon={<UserPlus size={50} />}
        />
        <DashboardCard
          title="Total Followup"
          value={1}
          gradient="bg-gradient-to-br from-amber-100 to-amber-300"
          icon={<UserPlus size={50} />}
        />
        <DashboardCard
          title="Total First Visit"
          value={1}
          gradient="bg-gradient-to-br from-emerald-100 to-emerald-300"
          icon={<UserPlus size={50} />}
        />
        <DashboardCard
          title="Total Online Appointment"
          value={1}
          gradient="bg-gradient-to-br from-cyan-100 to-cyan-300"
          icon={<UserPlus2 size={50} />}
        />
        <DashboardCard
          title="Total Discharge"
          value={0}
          gradient="bg-gradient-to-br from-fuchsia-100 to-fuchsia-300"
          icon={<LogOut size={50} />}
        />
        <DashboardCard
          title="Total Collection"
          value={0}
          gradient="bg-gradient-to-br from-lime-100 to-lime-300"
          icon={<Wallet size={50} />}
        />
        <DashboardCard
          title="Total Hospital Collection"
          value={0}
          gradient="bg-gradient-to-br from-pink-100 to-pink-300"
          icon={<BarChart3 size={50} />}
        />
        <DashboardCard
          title="Total Store Collection"
          value={0}
          gradient="bg-gradient-to-br from-teal-100 to-teal-300"
          icon={<BarChart3 size={50} />}
        />
        <DashboardCard
          title="Total Expenses"
          value={0}
          gradient="bg-gradient-to-br from-orange-100 to-orange-300"
          icon={<BarChart3 size={50} />}
        />
      </div>
      {/* </div> */}
    </div>
  );
};

export default FrontOfficeDashboard;
