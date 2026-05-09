import { InvestigationInterpretationTemplateTabName } from "@/constants/constants";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import InvestigationInterpretation from "./components/InvestigationInterpretation";
import InvestigationTemplate from "./components/InvestigationTemplate";
import ObservationLovs from "./components/ObservationLovs";

const InvestigationInterpretationTemplate = () => {
  const [activeTab, setActiveTab] = useState<string>(
    InvestigationInterpretationTemplateTabName?.INVESTIGATION_TEMPLATE_MASTER
  );

  /*-------------------------render tabs------------------------- */
  const renderTabs = (tabName: string) => {
    if (InvestigationInterpretationTemplateTabName?.INVESTIGATION_TEMPLATE_MASTER === tabName) {
      return <InvestigationTemplate />;
    }
    if (
      InvestigationInterpretationTemplateTabName?.INVESTIGATION_INTERPRETATION_MAPPING === tabName
    ) {
      return <InvestigationInterpretation />;
    }
    if (InvestigationInterpretationTemplateTabName?.OBSERVATION_COMMENT_LOVS === tabName) {
      return <ObservationLovs />;
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-heading">Investigation Interpretation Template</h1>
      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Investigation Interpretation Template</span>
      </nav>

      <div className="tab-card rounded-lg">
        <button
          type="button"
          onClick={() =>
            setActiveTab(InvestigationInterpretationTemplateTabName?.INVESTIGATION_TEMPLATE_MASTER)
          }
          className={` tab-btn transition
                        ${
                          activeTab ===
                          InvestigationInterpretationTemplateTabName?.INVESTIGATION_TEMPLATE_MASTER
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {InvestigationInterpretationTemplateTabName?.INVESTIGATION_TEMPLATE_MASTER}
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveTab(
              InvestigationInterpretationTemplateTabName?.INVESTIGATION_INTERPRETATION_MAPPING
            )
          }
          className={`tab-btn transition
                        ${
                          activeTab ===
                          InvestigationInterpretationTemplateTabName?.INVESTIGATION_INTERPRETATION_MAPPING
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {InvestigationInterpretationTemplateTabName?.INVESTIGATION_INTERPRETATION_MAPPING}
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveTab(InvestigationInterpretationTemplateTabName?.OBSERVATION_COMMENT_LOVS)
          }
          className={`tab-btn transition
                        ${
                          activeTab ===
                          InvestigationInterpretationTemplateTabName?.OBSERVATION_COMMENT_LOVS
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {InvestigationInterpretationTemplateTabName?.OBSERVATION_COMMENT_LOVS}
        </button>
      </div>

      {renderTabs(activeTab)}
    </div>
  );
};

export default InvestigationInterpretationTemplate;
