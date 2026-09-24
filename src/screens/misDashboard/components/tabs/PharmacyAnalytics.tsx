import DepartmentWisePharmacyFinancialSummary from "../pharmacyAnalytics/DepartmentWisePharmacyFinancialSummary";
import ExpiryAging from "../pharmacyAnalytics/ExpiryAging";
import MetricsOverviewRow from "../pharmacyAnalytics/MetricsOverviewRow";
import MonthlyPharmacySalesTrend from "../pharmacyAnalytics/MonthlyPharmacySalesTrend";
import OPDVsIPDSalesTrend from "../pharmacyAnalytics/OPDVsIPDSalesTrend";
import {
  default as DepartmentWisePhamacyConsumption,
  default as PaymentMode,
} from "../pharmacyAnalytics/PaymentMode";
import PharmacyReturnAnalysis from "../pharmacyAnalytics/PharmacyReturnAnalysis";
import PurchaseVsSalesVsGross from "../pharmacyAnalytics/PurchaseVsSalesVsGross";
import QuickLinks from "../pharmacyAnalytics/QuickLinks";
import StockStatus from "../pharmacyAnalytics/StockStatus";
import TopMedicineSales from "../pharmacyAnalytics/TopMedicineSales";
import VendorWisePurchase from "../pharmacyAnalytics/VendorWisePurchase";

export default function pharmacyAnalytics() {
  return (
    <div className="w-full min-w-0 bg-gray-50 flex min-h-screen font-sans overflow-x-hidden">
      <div className="flex-1 flex flex-col min-w-0 pb-1">
        <MetricsOverviewRow />

        <div className="px-1 grid grid-cols-1 lg:grid-cols-4 gap-2">
          <MonthlyPharmacySalesTrend />
          <OPDVsIPDSalesTrend />
          <DepartmentWisePhamacyConsumption />
          <PaymentMode />
        </div>

        <div className="px-1 mt-2 grid grid-cols-1 lg:grid-cols-4 gap-2">
          <PurchaseVsSalesVsGross />
          <PharmacyReturnAnalysis />
          <StockStatus />
          <ExpiryAging />
        </div>

        <div className="px-1 mt-2 grid grid-cols-1 lg:grid-cols-4 gap-2">
          <DepartmentWisePharmacyFinancialSummary />
          <TopMedicineSales />
          <VendorWisePurchase />
          <QuickLinks />
        </div>
      </div>
    </div>
  );
}
