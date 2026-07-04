import { useState } from "react";
import { NavLink } from "react-router-dom";
import { EmrControlsTabName } from "../../constants/constants";
import DoctorDepartmentHeaderMapping from "../consultationHeaderMaster/components/DoctorDepartmentHeaderMapping";
import EMRControls from "./components/EMRControls";

const EmrControlsPage = () => {
  const [activeTab, setActiveTab] = useState<string>(EmrControlsTabName.EMR_CONTROLS);

  const renderTabs = (tabName: string) => {
    if (tabName === EmrControlsTabName.EMR_CONTROLS) {
      return <EMRControls />;
    }
    if (tabName === EmrControlsTabName.DOCTOR_DEPARTMENT_EMR_CONTROLS) {
      return <DoctorDepartmentHeaderMapping />;
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-heading">EMR Controls</h1>
      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>EMR Controls</span>
      </nav>

      <div className="tab-card rounded-lg">
        <button
          type="button"
          onClick={() => setActiveTab(EmrControlsTabName.EMR_CONTROLS)}
          className={`tab-btn transition ${
            activeTab === EmrControlsTabName.EMR_CONTROLS ? "tab-btn-active" : "tab-btn-inactive"
          }`}
        >
          {EmrControlsTabName.EMR_CONTROLS}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(EmrControlsTabName.DOCTOR_DEPARTMENT_EMR_CONTROLS)}
          className={`tab-btn transition ${
            activeTab === EmrControlsTabName.DOCTOR_DEPARTMENT_EMR_CONTROLS
              ? "tab-btn-active"
              : "tab-btn-inactive"
          }`}
        >
          {EmrControlsTabName.DOCTOR_DEPARTMENT_EMR_CONTROLS}
        </button>
      </div>

      {renderTabs(activeTab)}
    </div>
  );
};

export default EmrControlsPage;
