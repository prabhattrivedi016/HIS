import ApprovalStatus from "../corporateManagement/ApprovalStatus";
import ApprovalTAT from "../corporateManagement/ApprovalTAT";
import CaseStatus from "../corporateManagement/CaseStatus";
import CorporatePatientTrend from "../corporateManagement/CorporatePatientTrend";
import CorporateWiseBilling from "../corporateManagement/CorporateWiseBilling";
import DepartmentWiseCorporateRevenue from "../corporateManagement/DepartmentWiseCorporateRevenue";
import MetricsOverviewRow from "../corporateManagement/MetricsOverviewRow";
import MonthlyBillingVsCollectionTrend from "../corporateManagement/MonthlyBillingVsCollectionTrend";
import RecentApproval from "../corporateManagement/RecentApproval";
import SettlementStatus from "../corporateManagement/SettlementStatus";
import TopPendingReport from "../corporateManagement/TopPendingReport";

const TpaManagement = () => {
  return (
    <div className="w-full min-w-0 bg-gray-50 flex min-h-screen font-sans overflow-x-hidden">
      <div className="flex-1 flex flex-col min-w-0 ">
        <MetricsOverviewRow />

        <div className="px-1 grid grid-cols-1 lg:grid-cols-3 gap-2 pb-1">
          <MonthlyBillingVsCollectionTrend />
          <CorporatePatientTrend />
          <ApprovalStatus />
        </div>

        <div className="px-1 mt-2 grid grid-cols-1 lg:grid-cols-3 gap-2 pb-1">
          <CorporateWiseBilling />
          <DepartmentWiseCorporateRevenue />
          <div className="px-1 grid grid-row-1 lg:grid-row-2 gap-2 pb-1">
            <SettlementStatus />
            <ApprovalTAT />
          </div>
        </div>

        <div className="px-1 mt-2 grid grid-cols-1 lg:grid-cols-3 gap-2 pb-1">
          <CaseStatus />
          <TopPendingReport />
          <RecentApproval />
        </div>
      </div>
    </div>
  );
};

export default TpaManagement;
