import { misDashbaordTabNames } from "@/constants/constants";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import FilterBar from "./components/overView/FilterBar";
import DetailedReport from "./components/tabs/DetailedReport";
import DoctorWise from "./components/tabs/DoctorWise";
import LaboratoryAnalytics from "./components/tabs/LaboratoryAnalytics";
import OverViewTab from "./components/tabs/OverViewTab";
import PatientWise from "./components/tabs/PatientWise";
import PharmacyAnalytics from "./components/tabs/PharmacyAnalytics";
import QualityControl from "./components/tabs/QualityControl";
import RadiologyAnalytics from "./components/tabs/RadiologyAnalytics";
import RevenueAnalysis from "./components/tabs/RevenueAnalysis";
import Tatanalysis from "./components/tabs/Tatanalysis";
import TpaManagement from "./components/tabs/TpaManagement";

const MisDashboard = () => {
  const [activeTab, setActiveTab] = useState<string>(misDashbaordTabNames?.OVERVIEW);

  // render component
  const renderComponent = (selectedPage: string) => {
    switch (selectedPage) {
      case misDashbaordTabNames?.OVERVIEW: {
        return <OverViewTab />;
      }

      case misDashbaordTabNames?.LABORATORY: {
        return <LaboratoryAnalytics />;
      }

      case misDashbaordTabNames?.PHARMACY: {
        return <PharmacyAnalytics />;
      }

      case misDashbaordTabNames?.RADIOLOGY: {
        return <RadiologyAnalytics />;
      }

      case misDashbaordTabNames?.TPA_MANAGEMENT: {
        return <TpaManagement />;
      }

      case misDashbaordTabNames?.QUALITY_CONTROL: {
        return <QualityControl />;
      }

      case misDashbaordTabNames?.REVENUE: {
        return <RevenueAnalysis />;
      }

      case misDashbaordTabNames?.TAT_ANALYSIS: {
        return <Tatanalysis />;
      }

      case misDashbaordTabNames?.DOCTOR_WISE: {
        return <DoctorWise />;
      }

      case misDashbaordTabNames?.PATIENT_WISE: {
        return <PatientWise />;
      }

      case misDashbaordTabNames?.DETAILED_REPORTS: {
        return <DetailedReport />;
      }

      default: {
        return <></>;
      }
    }
  };
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
      {/* Main Content Area on the Right */}
      <div className="flex-1 flex flex-col min-w-0 pb-1">
        {/* FIX: FilterBar ko activeTab aur setActiveTab props pass kiye */}
        <FilterBar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Content Area: Switches components based on active tab */}
        <main className="flex-1 sm:p-4">{renderComponent(activeTab)}</main>
      </div>
    </div>
  );
};

export default MisDashboard;
