import { NavLink } from "react-router-dom";
import {
  default as CashFlowTrend,
  default as RevenueVsExpenseChart,
} from "./components/CashFlowTrend";
import DeptFinancialTable from "./components/DeptFinancialTable";
import DeptRevenueChart from "./components/DeptRevenueChart";
import ExpenseCategory from "./components/ExpenseCategory";
import FilterBar from "./components/FilterBar";
import MetricsOverviewRow from "./components/MetricsOverviewRow";
import PaymentModeCollection from "./components/PaymentModeCollection";
import QuickLinks from "./components/QuickLinks";
import ReceivablesAging from "./components/ReceivablesAging";
import RevenueTrendChart from "./components/RevenueTrendChart";

const MisDashboard = () => {
  return (
    <div className="page-container">
      <h1 className="page-heading">MIS Dashboard</h1>
      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>MIS Dashboard</span>
      </nav>

      {/* main component
       */}
      <div className="flex-1 flex flex-col w-full">
        <FilterBar />
        <MetricsOverviewRow />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
          <RevenueTrendChart />
          <RevenueVsExpenseChart />
          <DeptRevenueChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mt-1">
          <PaymentModeCollection />
          <ExpenseCategory />
          <ReceivablesAging />
        </div>

        <div className=" grid grid-cols-1 lg:grid-cols-3 gap-2 mt-1">
          <DeptFinancialTable />
          <CashFlowTrend />
          <QuickLinks />
        </div>
      </div>
    </div>
  );
};

export default MisDashboard;
