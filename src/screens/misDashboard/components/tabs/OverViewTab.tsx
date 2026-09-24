import CashFlowTrend from "../overView/CashFlowTrend";
import DeptFinancialTable from "../overView/DeptFinancialTable";
import DeptRevenueChart from "../overView/DeptRevenueChart";
import ExpenseCategory from "../overView/ExpenseCategory";
import MetricsOverviewRow from "../overView/MetricsOverviewRow";
import PaymentModeCollection from "../overView/PaymentModeCollection";
import QuickLinks from "../overView/QuickLinks";
import ReceivablesAging from "../overView/ReceivablesAging";
import RevenueTrendChart from "../overView/RevenueTrendChart";
import RevenueVsExpenseChart from "../overView/RevenueVsExpenseChart";

const OverView = () => {
  return (
    <div className="w-full min-w-0 bg-gray-50 flex min-h-screen font-sans overflow-x-hidden">
      <div className="flex-1 flex flex-col min-w-0 pb-1">
        <MetricsOverviewRow />

        <div className="px-1 grid grid-cols-1 lg:grid-cols-3 gap-2">
          <RevenueTrendChart />
          <RevenueVsExpenseChart />
          <DeptRevenueChart />
        </div>

        <div className="px-1 mt-2 grid grid-cols-1 lg:grid-cols-3 gap-2">
          <PaymentModeCollection />
          <ExpenseCategory />
          <ReceivablesAging />
        </div>

        <div className="px-1 mt-2 grid grid-cols-1 lg:grid-cols-3 gap-2">
          <DeptFinancialTable />
          <CashFlowTrend />
          <QuickLinks />
        </div>
      </div>
    </div>
  );
};

export default OverView;
