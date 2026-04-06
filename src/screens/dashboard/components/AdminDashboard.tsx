import Chart from "@/components/charts";
import LineChart from "@/components/charts/LineChart";
import PieChart from "@/components/charts/PieChart";
import { useAppSelector } from "@/store/hooks";
import { BarChart3, LogOut, UserPlus, UserPlus2, Users, Wallet } from "lucide-react";
import DashboardCard from "./DashboardCard";

const AdminDashboard = () => {
  const { accessRights: response, loading, error } = useAppSelector(state => state.accessRights);

  return (
    <div className="page-container">
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
          title="Total Collection"
          value={1}
          gradient="bg-gradient-to-br from-emerald-100 to-emerald-300"
          icon={<UserPlus size={50} />}
        />
        <DashboardCard
          title="Total Hospital Collection"
          value={1}
          gradient="bg-gradient-to-br from-cyan-100 to-cyan-300"
          icon={<UserPlus2 size={50} />}
        />
        <DashboardCard
          title="Total Store Collection"
          value={0}
          gradient="bg-gradient-to-br from-fuchsia-100 to-fuchsia-300"
          icon={<LogOut size={50} />}
        />
        <DashboardCard
          title="Total Expenses"
          value={0}
          gradient="bg-gradient-to-br from-lime-100 to-lime-300"
          icon={<Wallet size={50} />}
        />
      </div>
      <div className="flex flex-col lg:flex-row gap-4 w-full">
        <div className="flex-1 h-[350px]">
          <Chart paddingRight={20} />
        </div>

        <div className="flex-1 h-[350px] mt-10">
          <PieChart />
        </div>

        <div className="flex-1 h-[350px] mt-10">
          <LineChart />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
