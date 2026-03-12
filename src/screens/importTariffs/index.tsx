import { useState } from "react";
import { NavLink } from "react-router-dom";
import { ImportTariffsTabName } from "../../constants/constants";
import ImportTariffsDownload from "./components/ImportTariffsDownload";
import ImportTariffsUpload from "./components/ImportTariffsUpload";

const ImportTariffs = () => {
  const [activeTab, setActiveTab] = useState<string>(ImportTariffsTabName?.IMPORT_TARIFFS_DOWNLOAD);

  /*-------------------------render tabs------------------------- */
  const renderTabs = (tabName: string) => {
    if (ImportTariffsTabName?.IMPORT_TARIFFS_DOWNLOAD === tabName) {
      return <ImportTariffsDownload />;
    }
    if (ImportTariffsTabName?.IMPORT_TARIFFS_UPLOAD === tabName) {
      return <ImportTariffsUpload />;
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-heading">Import Tariffs Master</h1>
      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Import Tariffs Master</span>
      </nav>

      <div className="tab-container rounded-lg">
        <button
          type="button"
          onClick={() => setActiveTab(ImportTariffsTabName?.IMPORT_TARIFFS_DOWNLOAD)}
          className={` tab-btn transition
                        ${
                          activeTab === ImportTariffsTabName?.IMPORT_TARIFFS_DOWNLOAD
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {ImportTariffsTabName?.IMPORT_TARIFFS_DOWNLOAD}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(ImportTariffsTabName?.IMPORT_TARIFFS_UPLOAD)}
          className={`px-4 py-2 text-md font-semibold transition
                        ${
                          activeTab === ImportTariffsTabName?.IMPORT_TARIFFS_UPLOAD
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {ImportTariffsTabName?.IMPORT_TARIFFS_UPLOAD}
        </button>
      </div>

      {renderTabs(activeTab)}
    </div>
  );
};

export default ImportTariffs;
