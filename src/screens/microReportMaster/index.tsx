import { MicroReportMasterTabName } from "@/constants/constants";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import AntibioticMaster from "./components/AntibioticMaster";
import CultureTemplateMaster from "./components/CultureTemplateMaster";
import OrganismAntibioticMapping from "./components/OrganismAntibioticMapping";
import OrganismMaster from "./components/OrganismMaster";

const MicroReportMaster = () => {
  const [activeTab, setActiveTab] = useState<string>(MicroReportMasterTabName?.ORGANISM_MASTER);

  /*-------------------------render tabs------------------------- */
  const renderTabs = (tabName: string) => {
    switch (tabName) {
      case MicroReportMasterTabName?.ORGANISM_MASTER: {
        return <OrganismMaster />;
      }
      case MicroReportMasterTabName?.ANTIBIOTIC_MASTER: {
        return <AntibioticMaster />;
      }
      case MicroReportMasterTabName?.ORGANISM_ANTIBIOTIC_MAPPING: {
        return <OrganismAntibioticMapping />;
      }
      case MicroReportMasterTabName?.CULTURE_TEMPLATE_MASTER: {
        return <CultureTemplateMaster />;
      }
      default: {
        return <></>;
      }
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-heading">Histo Report Master</h1>
      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Histo Report Master</span>
      </nav>

      <div className="tab-card rounded-lg">
        <button
          type="button"
          onClick={() => setActiveTab(MicroReportMasterTabName?.ORGANISM_MASTER)}
          className={` tab-btn transition
                        ${
                          activeTab === MicroReportMasterTabName?.ORGANISM_MASTER
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {MicroReportMasterTabName?.ORGANISM_MASTER}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(MicroReportMasterTabName?.ANTIBIOTIC_MASTER)}
          className={`px-4 py-2 text-md font-semibold transition
                        ${
                          activeTab === MicroReportMasterTabName?.ANTIBIOTIC_MASTER
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {MicroReportMasterTabName?.ANTIBIOTIC_MASTER}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(MicroReportMasterTabName?.ORGANISM_ANTIBIOTIC_MAPPING)}
          className={`px-4 py-2 text-md font-semibold transition
                        ${
                          activeTab === MicroReportMasterTabName?.ORGANISM_ANTIBIOTIC_MAPPING
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {MicroReportMasterTabName?.ORGANISM_ANTIBIOTIC_MAPPING}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(MicroReportMasterTabName?.CULTURE_TEMPLATE_MASTER)}
          className={`px-4 py-2 text-md font-semibold transition
                        ${
                          activeTab === MicroReportMasterTabName?.CULTURE_TEMPLATE_MASTER
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {MicroReportMasterTabName?.CULTURE_TEMPLATE_MASTER}
        </button>
      </div>

      {renderTabs(activeTab)}
    </div>
  );
};

export default MicroReportMaster;
