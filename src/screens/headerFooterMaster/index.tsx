import { useState } from "react";
import { NavLink } from "react-router-dom";

import { HeaderFooterTabName } from "../../constants/constants";
import DoctorSignature from "./components/DoctorSignature";
import HeaderFooter from "./components/HeaderFooter";
import LetterHead from "./components/LetterHead";
import NablLogo from "./components/NablLogo";
import OtherPrintSettings from "./components/OtherPrintSettings";
import QrCodeBarCode from "./components/QrCodeBarCode";
import ReportFooterRemark from "./components/ReportFooterRemark";
import SequenceMapping from "./components/SequenceMapping";

const HeaderFooterMaster = () => {
  const [activeTab, setActiveTab] = useState<HeaderFooterTabName>(HeaderFooterTabName?.HEADER);

  const renderComponent = (tabName: string) => {
    switch (tabName) {
      case HeaderFooterTabName?.HEADER: {
        return <HeaderFooter />;
      }
      case HeaderFooterTabName?.SEQUENCE: {
        return <SequenceMapping />;
      }
      case HeaderFooterTabName?.DOCTOR: {
        return <DoctorSignature />;
      }
      case HeaderFooterTabName?.LETTER: {
        return <LetterHead />;
      }
      case HeaderFooterTabName?.FOOTER_REMARK: {
        return <ReportFooterRemark />;
      }
      case HeaderFooterTabName?.NABL_LOGO: {
        return <NablLogo />;
      }
      case HeaderFooterTabName?.QR_CODE_BARCODE: {
        return <QrCodeBarCode />;
      }
      case HeaderFooterTabName?.OTHER_PRINT_SETTINGS: {
        return <OtherPrintSettings />;
      }
      default:
        return <></>;
    }
  };
  return (
    <div className="page-container">
      <h1 className="page-heading">Print Settings</h1>
      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Print Settings</span>
      </nav>

      <div className="tab-container rounded-lg overflow-auto">
        <button
          type="button"
          onClick={() => setActiveTab(HeaderFooterTabName?.HEADER)}
          className={` tab-btn transition
                        ${
                          activeTab === HeaderFooterTabName?.HEADER
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {HeaderFooterTabName?.HEADER}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(HeaderFooterTabName?.SEQUENCE)}
          className={`px-4 py-2 text-md font-semibold transition
                        ${
                          activeTab === HeaderFooterTabName?.SEQUENCE
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {HeaderFooterTabName?.SEQUENCE}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(HeaderFooterTabName?.DOCTOR)}
          className={`px-4 py-2 text-md font-semibold transition
                        ${
                          activeTab === HeaderFooterTabName?.DOCTOR
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {HeaderFooterTabName?.DOCTOR}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(HeaderFooterTabName?.LETTER)}
          className={`px-4 py-2 text-md font-semibold transition
                        ${
                          activeTab === HeaderFooterTabName?.LETTER
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {HeaderFooterTabName?.LETTER}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(HeaderFooterTabName?.FOOTER_REMARK)}
          className={`px-4 py-2 text-md font-semibold transition
                        ${
                          activeTab === HeaderFooterTabName?.FOOTER_REMARK
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {HeaderFooterTabName?.FOOTER_REMARK}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(HeaderFooterTabName?.NABL_LOGO)}
          className={`px-4 py-2 text-md font-semibold transition
                        ${
                          activeTab === HeaderFooterTabName?.NABL_LOGO
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {HeaderFooterTabName?.NABL_LOGO}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(HeaderFooterTabName?.QR_CODE_BARCODE)}
          className={`px-4 py-2 text-md font-semibold transition
                        ${
                          activeTab === HeaderFooterTabName?.QR_CODE_BARCODE
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {HeaderFooterTabName?.QR_CODE_BARCODE}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(HeaderFooterTabName?.OTHER_PRINT_SETTINGS)}
          className={`px-4 py-2 text-md font-semibold transition
                        ${
                          activeTab === HeaderFooterTabName?.OTHER_PRINT_SETTINGS
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {HeaderFooterTabName?.OTHER_PRINT_SETTINGS}
        </button>
      </div>

      {renderComponent(activeTab)}
    </div>
  );
};

export default HeaderFooterMaster;
