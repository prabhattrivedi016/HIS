import { useState } from "react";
import { NavLink } from "react-router-dom";
import { ConsultationHeaderMasterTabName } from "../../constants/constants";
import HeaderMaster from "./components/HeaderMaster";

const ConsultationHeaderMaster = () => {
  const [activeTab, setActiveTab] = useState<string>(
    ConsultationHeaderMasterTabName?.HEADER_MASTER
  );

  //   render tabs

  const renderTabs = (tabName: string) => {
    if (ConsultationHeaderMasterTabName?.HEADER_MASTER === tabName) {
      return <HeaderMaster />;
    }
    // if (ConsultationHeaderMasterTabName?.DOCTOR_DEPARTMENT_HEADER_MAPPING === tabName) {
    //   return <DoctorDepartmentHeaderMapping />;
    // }
  };

  return (
    <div className="page-container">
      <h1 className="page-heading">EMR Controls</h1>
      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>EMR Controls</span>
      </nav>

      <div className="tab-card rounded-lg">
        <button
          type="button"
          onClick={() => setActiveTab(ConsultationHeaderMasterTabName?.HEADER_MASTER)}
          className={` tab-btn transition
                        ${
                          activeTab === ConsultationHeaderMasterTabName?.HEADER_MASTER
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {ConsultationHeaderMasterTabName?.HEADER_MASTER}
        </button>

        {/* <button
          type="button"
          onClick={() =>
            setActiveTab(ConsultationHeaderMasterTabName?.DOCTOR_DEPARTMENT_HEADER_MAPPING)
          }
          className={`px-4 py-2 text-md font-semibold transition
                        ${
                          activeTab ===
                          ConsultationHeaderMasterTabName?.DOCTOR_DEPARTMENT_HEADER_MAPPING
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {ConsultationHeaderMasterTabName?.DOCTOR_DEPARTMENT_HEADER_MAPPING}
        </button> */}
      </div>

      {renderTabs(activeTab)}
    </div>
  );
};

export default ConsultationHeaderMaster;
