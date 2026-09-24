import ConsumableUsages from "../radiologyDepartment/ConsumableUsages";
import EquipmentUtilization from "../radiologyDepartment/EquipmentUtilization";
import MetricsOverviewRow from "../radiologyDepartment/MetricsOverviewRow";
import MonthlyInvestigationTrend from "../radiologyDepartment/MonthlyInvestigationTrend";
import MonthlywiseDistribution from "../radiologyDepartment/MonthlywiseDistribution";
import OPDVsIPDInvestigation from "../radiologyDepartment/OPDVsIPDInvestigation";
import PatientFlow from "../radiologyDepartment/PatientFlow";
import ReferalSource from "../radiologyDepartment/ReferalSource";
import RevenueTrend from "../radiologyDepartment/RevenueTrend";
import TopInvestigationByVolume from "../radiologyDepartment/TopInvestigationByVolume";
import TurnAroundTime from "../radiologyDepartment/TurnAroundTime";

export default function RadiologyAnalytics() {
  return (
    <div className="w-full min-w-0 bg-gray-50 flex min-h-screen font-sans overflow-x-hidden">
      <div className="flex-1 flex flex-col min-w-0 ">
        <MetricsOverviewRow />

        <div className="px-1 grid grid-cols-1 lg:grid-cols-3 gap-2 pb-1">
          <MonthlyInvestigationTrend />
          <OPDVsIPDInvestigation />
          <RevenueTrend />
        </div>

        <div className="px-1 mt-2 grid grid-cols-1 lg:grid-cols-3 gap-2 pb-1">
          <MonthlywiseDistribution />
          <TopInvestigationByVolume />
          <TurnAroundTime />
        </div>

        <div className="px-1 mt-2 grid grid-cols-1 lg:grid-cols-4 gap-2 pb-1">
          <PatientFlow />
          <ReferalSource />
          <ConsumableUsages />
          <EquipmentUtilization />
        </div>
      </div>
    </div>
  );
}
