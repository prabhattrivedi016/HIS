import { BranchSettingsTabName } from "@/constants/constants";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import BranchCorporateRateListMapping from "./components/BranchCorporateRateListMapping";
import BranchDefaultSetting from "./components/BranchDefaultSetting";
import BranchRightMapping from "./components/BranchRightMapping";
import BranchWiseServiceExclude from "./components/BranchWiseServiceExclude";
const BranchSettings = () => {
  const [activeTab, setActiveTab] = useState<string>(
    BranchSettingsTabName?.BRANCH_CORPORATE_RATE_LIST_MAPPING
  );

  const renderTabs = (tabName: string) => {
    switch (tabName) {
      case BranchSettingsTabName?.BRANCH_CORPORATE_RATE_LIST_MAPPING: {
        return <BranchCorporateRateListMapping />;
      }
      case BranchSettingsTabName?.BRANCH_WISE_SERVICE_EXCLUDE: {
        return <BranchWiseServiceExclude />;
      }
      case BranchSettingsTabName?.BRANCH_RIGHT_MAPPING: {
        return <BranchRightMapping />;
      }
      case BranchSettingsTabName?.BRANCH_DEFAULT_SETTING: {
        return <BranchDefaultSetting />;
      }
      default: {
        return <></>;
      }
    }
  };
  return (
    <div className="page-container">
      <h1 className="page-heading">Branch Setting</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Branch Settings</span>
      </nav>

      <div className="tab-card rounded-lg">
        <button
          type="button"
          onClick={() => setActiveTab(BranchSettingsTabName?.BRANCH_CORPORATE_RATE_LIST_MAPPING)}
          className={` tab-btn transition
                        ${
                          activeTab === BranchSettingsTabName?.BRANCH_CORPORATE_RATE_LIST_MAPPING
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {BranchSettingsTabName?.BRANCH_CORPORATE_RATE_LIST_MAPPING}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(BranchSettingsTabName?.BRANCH_WISE_SERVICE_EXCLUDE)}
          className={`px-4 py-2 text-md font-semibold transition
                        ${
                          activeTab === BranchSettingsTabName?.BRANCH_WISE_SERVICE_EXCLUDE
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {BranchSettingsTabName?.BRANCH_WISE_SERVICE_EXCLUDE}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(BranchSettingsTabName?.BRANCH_RIGHT_MAPPING)}
          className={`px-4 py-2 text-md font-semibold transition
                        ${
                          activeTab === BranchSettingsTabName?.BRANCH_RIGHT_MAPPING
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {BranchSettingsTabName?.BRANCH_RIGHT_MAPPING}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(BranchSettingsTabName?.BRANCH_DEFAULT_SETTING)}
          className={`px-4 py-2 text-md font-semibold transition
                        ${
                          activeTab === BranchSettingsTabName?.BRANCH_DEFAULT_SETTING
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {BranchSettingsTabName?.BRANCH_DEFAULT_SETTING}
        </button>
      </div>

      {renderTabs(activeTab)}
    </div>
  );
};

export default BranchSettings;
