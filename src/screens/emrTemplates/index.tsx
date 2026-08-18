import { useState } from "react";
import { NavLink } from "react-router-dom";
import { EmrTemplatesTabName } from "../../constants/constants";
import DoctorDepartmentEmrTemplateMapping from "./components/DoctorDepartmentEmrTemplateMapping";
import TemplateMaster from "./components/TemplateMaster";

const EMRTemplates = () => {
  const [activeTab, setActiveTab] = useState<string>(EmrTemplatesTabName.EMR_TEMPLATES);

  const renderTabs = (tabName: string) => {
    if (tabName === EmrTemplatesTabName.EMR_TEMPLATES) {
      return <TemplateMaster />;
    }
    if (tabName === EmrTemplatesTabName.DOCTOR_DEPARTMENT_EMR_TEMPLATES) {
      return <DoctorDepartmentEmrTemplateMapping />;
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-heading">EMR Templates</h1>
      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>EMR Templates</span>
      </nav>

      <div className="tab-card rounded-lg">
        <button
          type="button"
          onClick={() => setActiveTab(EmrTemplatesTabName.EMR_TEMPLATES)}
          className={`tab-btn transition ${
            activeTab === EmrTemplatesTabName.EMR_TEMPLATES ? "tab-btn-active" : "tab-btn-inactive"
          }`}
        >
          {EmrTemplatesTabName.EMR_TEMPLATES}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(EmrTemplatesTabName.DOCTOR_DEPARTMENT_EMR_TEMPLATES)}
          className={`tab-btn transition ${
            activeTab === EmrTemplatesTabName.DOCTOR_DEPARTMENT_EMR_TEMPLATES
              ? "tab-btn-active"
              : "tab-btn-inactive"
          }`}
        >
          {EmrTemplatesTabName.DOCTOR_DEPARTMENT_EMR_TEMPLATES}
        </button>
      </div>

      {renderTabs(activeTab)}
    </div>
  );
};

export default EMRTemplates;
