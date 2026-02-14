import { useState } from "react";
import { NavLink } from "react-router-dom";
import { BankMasterTabName } from "../../constants/constants";
import BankDetails from "./components/BankDetails";
import BankMasterPage from "./components/BankMasterPage";

const BankMaster = () => {
  const [activeTab, setActiveTab] = useState<string>(BankMasterTabName?.BANK_MASTER);

  /*-------------------------render tabs------------------------- */
  const renderTabs = (tabName: string) => {
    if (BankMasterTabName?.BANK_MASTER === tabName) {
      return <BankMasterPage />;
    }
    if (BankMasterTabName?.BANK_DETAILS === tabName) {
      return <BankDetails />;
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-heading">Bank Master</h1>
      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Bank Master</span>
      </nav>

      <div className="tab-container rounded-lg">
        <button
          type="button"
          onClick={() => setActiveTab(BankMasterTabName?.BANK_MASTER)}
          className={` tab-btn transition
                        ${
                          activeTab === BankMasterTabName?.BANK_MASTER
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {BankMasterTabName?.BANK_MASTER}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(BankMasterTabName?.BANK_DETAILS)}
          className={`px-4 py-2 text-md font-semibold transition
                        ${
                          activeTab === BankMasterTabName?.BANK_DETAILS
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {BankMasterTabName?.BANK_DETAILS}
        </button>
      </div>

      {renderTabs(activeTab)}
    </div>
  );
};

export default BankMaster;
