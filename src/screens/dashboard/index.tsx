import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { BranchContext } from "@/context/BranchContext";
import { RoleContext } from "@/context/RoleContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError } from "@/utils/alert";
import { BarChart3, LogOut, UserPlus, UserPlus2, Users, Wallet } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import DashboardCard from "./components/DashboardCard";
import { DashboardValuesItem } from "./types";

const Dashboard = () => {
  const { loading, fetchApi } = useGlobalApi();
  const branchId = useContext(BranchContext)?.branchId ?? 1;
  const roleContext = useContext(RoleContext);

  const [dashboardValues, SetDashboardValues] = useState<DashboardValuesItem | null>(null);

  // dashboard states
  const getDashboardStates = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DASHBOARD_STATES,
      {},
      { params: { branchId, roleId: roleContext?.roleId } },
      { component: "Dashboard" }
    );
    if (!resp?.result) {
      showError(resp?.message ?? "Error while fetching dashboard data");
      return;
    }
    SetDashboardValues(resp?.data?.[0]);
  };

  useEffect(() => {
    getDashboardStates();
  }, [branchId, roleContext?.roleId]);

  return (
    <div className="page-container">
      {/* <div className="card"> */}
      <div className="form-grid-4 gap-6">
        <DashboardCard
          title="Total Visited Patients"
          value={dashboardValues?.totalVisitedCount ?? 0}
          gradient="bg-gradient-to-br from-sky-100 to-sky-300"
          icon={<Users size={50} />}
        />
        <DashboardCard
          title="Total Your Collection"
          value={dashboardValues?.totalCollection ?? 0}
          gradient="bg-gradient-to-br from-violet-100 to-violet-300"
          icon={<BarChart3 size={50} />}
        />
        <DashboardCard
          title="Total Admission"
          value={dashboardValues?.totalAdmission ?? 0}
          gradient="bg-gradient-to-br from-rose-100 to-rose-300"
          icon={<UserPlus size={50} />}
        />
        <DashboardCard
          title="Total Discharge"
          value={dashboardValues?.totalDischarge ?? 0}
          gradient="bg-gradient-to-br from-amber-100 to-amber-300"
          icon={<UserPlus size={50} />}
        />
        <DashboardCard
          title="Total Collection"
          value={dashboardValues?.grandTotalCollection ?? 0}
          gradient="bg-gradient-to-br from-emerald-100 to-emerald-300"
          icon={<UserPlus size={50} />}
        />
        <DashboardCard
          title="Total Hospital Collection"
          value={dashboardValues?.totalHospitalCollection ?? 0}
          gradient="bg-gradient-to-br from-cyan-100 to-cyan-300"
          icon={<UserPlus2 size={50} />}
        />
        <DashboardCard
          title="Total Store Collection"
          value={dashboardValues?.totalStoreCollection ?? 0}
          gradient="bg-gradient-to-br from-fuchsia-100 to-fuchsia-300"
          icon={<LogOut size={50} />}
        />
        <DashboardCard
          title="Total Pending Sample"
          value={dashboardValues?.totalSamplePending ?? 0}
          gradient="bg-gradient-to-br from-lime-100 to-lime-300"
          icon={<Wallet size={50} />}
        />
        <DashboardCard
          title="Total Sample Collected"
          value={dashboardValues?.totalSampleCollected ?? 0}
          gradient="bg-gradient-to-br from-pink-100 to-pink-300"
          icon={<BarChart3 size={50} />}
        />
        <DashboardCard
          title="Total Pending Results"
          value={dashboardValues?.totalResultsPending ?? 0}
          gradient="bg-gradient-to-br from-teal-100 to-teal-300"
          icon={<BarChart3 size={50} />}
        />
        <DashboardCard
          title="Total Result Done"
          value={dashboardValues?.totalResultsDone ?? 0}
          gradient="bg-gradient-to-br from-orange-100 to-orange-300"
          icon={<BarChart3 size={50} />}
        />
      </div>
      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default Dashboard;
