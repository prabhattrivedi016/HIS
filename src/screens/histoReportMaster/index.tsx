import { useState } from "react";
import { NavLink } from "react-router-dom";
import { HistoMasterReportTabName } from "../../constants/constants";
import HistoImmunoAntibioticMaster from "./components/HistoImmunoAntibioticMaster";
import HistoPendingReasonMaster from "./components/HistoPendingReasonMaster";
import HistoTemplateMaster from "./components/HistoTemplateMaster";
import SpecimenMaster from "./components/SpecimenMaster";
import SpecimenTemplateMapping from "./components/SpecimenTemplateMapping";

const HistoReportMaster = () => {
  const [activeTab, setActiveTab] = useState<string>(
    HistoMasterReportTabName?.HISTO_TEMPLATE_MASTER
  );

  /*-------------------------render tabs------------------------- */
  const renderTabs = (tabName: string) => {
    switch (tabName) {
      case HistoMasterReportTabName?.HISTO_TEMPLATE_MASTER: {
        return <HistoTemplateMaster />;
      }
      case HistoMasterReportTabName?.SPECIMEN_MASTER: {
        return <SpecimenMaster />;
      }
      case HistoMasterReportTabName?.SPECIMEN_TEMPLATE_MAPPING: {
        return <SpecimenTemplateMapping />;
      }
      case HistoMasterReportTabName?.HISTO_PENDING_REASON_MASTER: {
        return <HistoPendingReasonMaster />;
      }
      case HistoMasterReportTabName?.HISTO_IMMUNO_ANTIBIOTIC_MASTER: {
        return <HistoImmunoAntibioticMaster />;
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
          onClick={() => setActiveTab(HistoMasterReportTabName?.HISTO_TEMPLATE_MASTER)}
          className={` tab-btn transition
                        ${
                          activeTab === HistoMasterReportTabName?.HISTO_TEMPLATE_MASTER
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {HistoMasterReportTabName?.HISTO_TEMPLATE_MASTER}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(HistoMasterReportTabName?.SPECIMEN_MASTER)}
          className={`px-4 py-2 text-md font-semibold transition
                        ${
                          activeTab === HistoMasterReportTabName?.SPECIMEN_MASTER
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {HistoMasterReportTabName?.SPECIMEN_MASTER}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(HistoMasterReportTabName?.SPECIMEN_TEMPLATE_MAPPING)}
          className={`px-4 py-2 text-md font-semibold transition
                        ${
                          activeTab === HistoMasterReportTabName?.SPECIMEN_TEMPLATE_MAPPING
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {HistoMasterReportTabName?.SPECIMEN_TEMPLATE_MAPPING}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(HistoMasterReportTabName?.HISTO_PENDING_REASON_MASTER)}
          className={`px-4 py-2 text-md font-semibold transition
                        ${
                          activeTab === HistoMasterReportTabName?.HISTO_PENDING_REASON_MASTER
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {HistoMasterReportTabName?.HISTO_PENDING_REASON_MASTER}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(HistoMasterReportTabName?.HISTO_IMMUNO_ANTIBIOTIC_MASTER)}
          className={`px-4 py-2 text-md font-semibold transition
                        ${
                          activeTab === HistoMasterReportTabName?.HISTO_IMMUNO_ANTIBIOTIC_MASTER
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {HistoMasterReportTabName?.HISTO_IMMUNO_ANTIBIOTIC_MASTER}
        </button>
      </div>

      {renderTabs(activeTab)}
    </div>
  );
};

export default HistoReportMaster;
