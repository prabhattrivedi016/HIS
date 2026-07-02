import { useState } from "react";
import { NavLink } from "react-router-dom";
import { VitalMasterTabName } from "@/constants/constants";
import VitalMasterForm from "./components/VitalMasterForm";
import VitalMapping from "./components/VitalMapping";

const VitalMaster = () => {
  const [activeTab, setActiveTab] = useState<string>(VitalMasterTabName.VITAL_MASTER);

  const renderTabs = (tabName: string) => {
    if (VitalMasterTabName.VITAL_MASTER === tabName) return <VitalMasterForm />;
    if (VitalMasterTabName.VITAL_MAPPING === tabName) return <VitalMapping />;
  };

  return (
    <div className="page-container">
      <h1 className="page-heading">Vital Master</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Vital Master</span>
      </nav>

      <div className="tab-card rounded-lg">
        <button
          type="button"
          onClick={() => setActiveTab(VitalMasterTabName.VITAL_MASTER)}
          className={`tab-btn transition ${
            activeTab === VitalMasterTabName.VITAL_MASTER
              ? "tab-btn-active"
              : "tab-btn-inactive"
          }`}
        >
          {VitalMasterTabName.VITAL_MASTER}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(VitalMasterTabName.VITAL_MAPPING)}
          className={`tab-btn transition ${
            activeTab === VitalMasterTabName.VITAL_MAPPING
              ? "tab-btn-active"
              : "tab-btn-inactive"
          }`}
        >
          {VitalMasterTabName.VITAL_MAPPING}
        </button>
      </div>

      {renderTabs(activeTab)}
    </div>
  );
};

export default VitalMaster;
