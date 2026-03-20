import { useState } from "react";
import { NavLink } from "react-router-dom";
import { TariffManagerTabName } from "../../constants/constants";
import AllServices from "./components/AllServices";
import DoctorVisits from "./components/DoctorVisits";

const TariffManager = () => {
  const [activeTab, setActiveTab] = useState<string>(TariffManagerTabName?.ALL_SERVICES);

  /*-------------------------render tabs------------------------- */
  const renderTabs = (tabName: string) => {
    if (TariffManagerTabName?.ALL_SERVICES === tabName) {
      return <AllServices />;
    }
    if (TariffManagerTabName?.DOCTOR_VISITS === tabName) {
      return <DoctorVisits />;
    }

    if (TariffManagerTabName?.COPY_TARIFF === tabName) {
      return <></>;
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-heading">Tariff Manager</h1>
      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>tariff Manager</span>
      </nav>

      <div className="tab-container rounded-lg">
        <button
          type="button"
          onClick={() => setActiveTab(TariffManagerTabName?.ALL_SERVICES)}
          className={` tab-btn transition
                        ${
                          activeTab === TariffManagerTabName?.ALL_SERVICES
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {TariffManagerTabName?.ALL_SERVICES}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(TariffManagerTabName?.DOCTOR_VISITS)}
          className={`px-4 py-2 text-md font-semibold transition
                        ${
                          activeTab === TariffManagerTabName?.DOCTOR_VISITS
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {TariffManagerTabName?.DOCTOR_VISITS}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(TariffManagerTabName?.COPY_TARIFF)}
          className={`px-4 py-2 text-md font-semibold transition
                        ${
                          activeTab === TariffManagerTabName?.COPY_TARIFF
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {TariffManagerTabName?.COPY_TARIFF}
        </button>
      </div>

      {renderTabs(activeTab)}
    </div>
  );
};

export default TariffManager;
