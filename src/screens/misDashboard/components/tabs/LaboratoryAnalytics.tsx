import CriticalReportsTable from "../laboratoryAnalytics/CriticalReport";
import DepartmentWiseLabRevenue from "../laboratoryAnalytics/DepartmentWiseLabRevenue";
import MetricsOverviewRow from "../laboratoryAnalytics/MetricsOverviewRow";
import MonthlyLabRevenus from "../laboratoryAnalytics/MonthlyLabRevenus";
import OPDVsIPDTest from "../laboratoryAnalytics/OPDVsIPDTest";
import PendingDelayedReport from "../laboratoryAnalytics/PendingDelayedReport";
import QuickLinks from "../laboratoryAnalytics/QuickLinks";
import SampleCollectionSource from "../laboratoryAnalytics/SampleCollectionSource";
import SampleTypeDistribution from "../laboratoryAnalytics/SampleTypeDistribution";
import TAT from "../laboratoryAnalytics/TAT";
import TestByVolume from "../laboratoryAnalytics/TestByVolume";
import TestStatus from "../laboratoryAnalytics/TestStatus";

export default function LaboratoryAnalytics() {
  return (
    <div className="w-full min-w-0 bg-gray-50 flex min-h-screen font-sans overflow-x-hidden">
      <div className="flex-1 flex flex-col min-w-0 pt-1">
        {/* Main Content Area on the Right */}

        <MetricsOverviewRow />

        <div className="px-1 grid grid-cols-1 lg:grid-cols-4 gap-2">
          <MonthlyLabRevenus />
          <OPDVsIPDTest />
          <SampleTypeDistribution />
          <TestStatus />
        </div>

        <div className="px-1 mt-2 grid grid-cols-1 lg:grid-cols-4 gap-2">
          <DepartmentWiseLabRevenue />
          <TestByVolume />
          <TAT />
          <SampleCollectionSource />
        </div>

        <div className="px-1 mt-2 grid grid-cols-1 lg:grid-cols-3 gap-2">
          <PendingDelayedReport />
          <CriticalReportsTable />
          <QuickLinks />
        </div>
      </div>
    </div>
  );
}
