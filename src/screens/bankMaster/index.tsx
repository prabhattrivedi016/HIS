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
    <div className="bg-gray-50 min-h-screen px-3 py-4 -mt-5">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Bank Master</h1>
        <nav className="text-sm text-gray-500 flex  gap-2 mt-1">
          <NavLink to="/dashboard" className="hover:underline">
            Home
          </NavLink>
          <span>››</span>
          <span>Bank Master</span>
        </nav>
      </div>
      <div className="flex gap-2 border-b border-gray-200 mb-4 shadow-lg m-2 ">
        <button
          type="button"
          onClick={() => setActiveTab(BankMasterTabName?.BANK_MASTER)}
          className={`px-4 py-2 text-md font-semibold transition
              ${
                activeTab === BankMasterTabName?.BANK_MASTER
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-blue-600"
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
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-blue-600"
              }
            `}
        >
          {BankMasterTabName?.BANK_DETAILS}
        </button>
      </div>
      {/* render tabs */}
      {renderTabs(activeTab)}
    </div>
  );
};

export default BankMaster;
