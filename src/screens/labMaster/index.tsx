import { LabMasterTabName } from "@/constants/constants";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import SampleRejection from "./components/SampleRejection";
import SampleRemarks from "./components/SampleRemarks";
import SampleType from "./components/SampleType";
import TestMethod from "./components/TestMethod";

const LabMaster = () => {
  const [activeTab, setActiveTab] = useState<string>(LabMasterTabName?.SAMPLE_TYPE);

  const renderTabs = (tabName: string) => {
    switch (tabName) {
      case LabMasterTabName?.SAMPLE_TYPE: {
        return <SampleType />;
      }
      case LabMasterTabName?.TEST_METHOD: {
        return <TestMethod />;
      }
      case LabMasterTabName?.SAMPLE_REJECTION: {
        return <SampleRejection />;
      }
      case LabMasterTabName?.SAMPLE_REMARKS: {
        return <SampleRemarks />;
      }
      default:
        return <></>;
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-heading">Lab Master</h1>
      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Lab Master</span>
      </nav>

      <div className="tab-container rounded-lg">
        <button
          type="button"
          onClick={() => setActiveTab(LabMasterTabName?.SAMPLE_TYPE)}
          className={` tab-btn transition
                    ${
                      activeTab === LabMasterTabName?.SAMPLE_TYPE
                        ? "tab-btn-active"
                        : "tab-btn-inactive"
                    }
                  `}
        >
          {LabMasterTabName?.SAMPLE_TYPE}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(LabMasterTabName?.TEST_METHOD)}
          className={`px-4 py-2 text-md font-semibold transition
                    ${
                      activeTab === LabMasterTabName?.TEST_METHOD
                        ? "tab-btn-active"
                        : "tab-btn-inactive"
                    }
                  `}
        >
          {LabMasterTabName?.TEST_METHOD}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(LabMasterTabName?.SAMPLE_REJECTION)}
          className={`px-4 py-2 text-md font-semibold transition
                    ${
                      activeTab === LabMasterTabName?.SAMPLE_REJECTION
                        ? "tab-btn-active"
                        : "tab-btn-inactive"
                    }
                  `}
        >
          {LabMasterTabName?.SAMPLE_REJECTION}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(LabMasterTabName?.SAMPLE_REMARKS)}
          className={`px-4 py-2 text-md font-semibold transition
                    ${
                      activeTab === LabMasterTabName?.SAMPLE_REMARKS
                        ? "tab-btn-active"
                        : "tab-btn-inactive"
                    }
                  `}
        >
          {LabMasterTabName?.SAMPLE_REMARKS}
        </button>
      </div>

      {renderTabs(activeTab)}
    </div>
  );
};

export default LabMaster;
