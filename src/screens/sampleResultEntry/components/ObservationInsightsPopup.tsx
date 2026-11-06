import CentralPopup from "@/components/centralPopup";
import { ObservationInsightsTabName } from "@/constants/constants";
import { useState } from "react";
import { SubInvetigationItem } from "../types";
import ObservationGraphInsights from "./ObservationGraphInsights";
import ObservationHistoryInsights from "./ObservationHistoryInsights";

const ObservationInsightsPopup = ({
  isOpen,
  onClose,
  subInvestigationlists,
}: {
  isOpen: boolean;
  onClose: () => void;
  subInvestigationlists: SubInvetigationItem[];
}) => {
  const [activeTab, setActiveTab] = useState<string>(
    ObservationInsightsTabName?.OBSERVATION_HISTORY
  );

  const renderTabs = (tabName: string) => {
    if (ObservationInsightsTabName?.OBSERVATION_HISTORY === tabName) {
      return <ObservationHistoryInsights subInvestigationlists={subInvestigationlists} />;
    }
    if (ObservationInsightsTabName?.OBSERVATION_GRAPH === tabName) {
      return <ObservationGraphInsights subInvestigationlists={subInvestigationlists} />;
    }
  };

  return (
    <CentralPopup
      isOpen={isOpen}
      onClose={onClose}
      title="OBSERVATION INSIGHTS"
      className="lg:min-w-[calc(100%-20px)] min-h-[70%]"
    >
      <div className=" rounded-lg">
        <button
          type="button"
          onClick={() => setActiveTab(ObservationInsightsTabName?.OBSERVATION_HISTORY)}
          className={` tab-btn transition
                              ${
                                activeTab === ObservationInsightsTabName?.OBSERVATION_HISTORY
                                  ? "tab-btn-active"
                                  : "tab-btn-inactive"
                              }
                            `}
        >
          {ObservationInsightsTabName?.OBSERVATION_HISTORY}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(ObservationInsightsTabName?.OBSERVATION_GRAPH)}
          className={`px-4 py-2 text-md  font-semibold transition
                              ${
                                activeTab === ObservationInsightsTabName?.OBSERVATION_GRAPH
                                  ? "tab-btn-active"
                                  : "tab-btn-inactive"
                              }
                            `}
        >
          {ObservationInsightsTabName?.OBSERVATION_GRAPH}
        </button>

        {renderTabs(activeTab)}
      </div>
    </CentralPopup>
  );
};

export default ObservationInsightsPopup;
