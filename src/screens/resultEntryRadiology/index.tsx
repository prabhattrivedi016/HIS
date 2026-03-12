import InputField from "@/components/customInputField";
import {
  ResultEntryRadiologyButtons,
  ResultEntryRadiologyTableHeader,
} from "@/constants/tableHeaders";
import { BriefcaseMedical } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import PatientInvestigationDetails from "./components/PatientInvestigationDetails";
import RadiologyRemark from "./components/RadiologyRemark";
import RadiologyReport from "./components/RadiologyReport";

const ResultEntrySampleData = [
  {
    BillDate: "24-Feb-2026",
    Type: "OPD",
    UHID: "GWT/25-26/00000050",
    IPDNo: 0,
    LabNo: 86,
    WardName: "",
    PatientName: "MR. ROHAN",
    CurrentAge: "25Y",
    CorporateName: "01 CASH",
    ClientName: "02 : GRAVITY- VARANASI",
    referDoctorName: "",
    Gender: "MALE",
    TotalBalanceAmount: 0.0,
    VisitId: 3070,
    isUrgent: 0,
    Barcode: "",
    IsSampleRequired: 0,
    IsSampleSegregationRequired: 0,
    IsDepartmentReceivingRequired: 0,
    PatientInvestigationId: 4138,
    ReportTypeId: 2,
    IsReportHold: 0,
    CreatedOn: "Feb 24 2026 11:14AM",
    VIPPatient: 0,
    IsSampleSegregated: 0,
    SampleSegregationOn: "",
    IsSampleCollected: 0,
    SampleCollectedOn: "",
    IsSampleReceivedByDepartment: 0,
    SampleReceivedByDepartmentOn: "",
    IsResultDone: 0,
    ResultDoneOn: "",
    IsReportApproved: 0,
    ReportApprovedOn: "",
    IsDispatched: 0,
    DispatchedOn: "",
    isSampleRejected: 0,
    isReportPrinted: 0,
    DeliveryDate: "",
    IsAllergyTest: 0,
    IsUnderPackage: 0,
    Name: "USG WRIST JOINT",
  },
];

const ResultEntryRadiology = () => {
  const currentDate = new Date().toISOString().split("T")[0];
  const [testActiveBtn, setTestActiveBtn] = useState<string>("");
  const [activeIndex, setActiveIndex] = useState(0);

  const [renderReport, setRenderReport] = useState<boolean>(false);
  const [openReport, setOpenReport] = useState<boolean>(false);

  const [renderInfo, setRenderInfo] = useState<boolean>(false);
  const [openInfo, setOpenInfo] = useState<boolean>(false);
  const [selectedInfoData, setSelectedInfoData] = useState<any>(null);

  const [renderRemark, setRenderRemark] = useState<boolean>(false);
  const [openRemark, setOpenRemark] = useState<boolean>(false);
  const [selectedRemarkData, setSelectedRemarkData] = useState<any>(null);

  const AllTestHandler = () => {
    setTestActiveBtn("all");
  };
  const xRayTestHandler = () => {
    setTestActiveBtn("xray");
  };
  const ctTestHandler = () => {
    setTestActiveBtn("ct");
  };
  const usTestHandler = () => {
    setTestActiveBtn("us");
  };
  const mriTestHandler = () => {
    setTestActiveBtn("mri");
  };

  const reportHandler = () => {
    setRenderReport(true);
    requestAnimationFrame(() => {
      setOpenReport(true);
    });
  };

  const infoHandler = (item: any) => {
    setSelectedInfoData(item);
    setRenderInfo(true);
    requestAnimationFrame(() => {
      setOpenInfo(true);
    });
  };

  const remarkHandler = (item: any) => {
    setSelectedRemarkData(item);
    setRenderRemark(true);
    requestAnimationFrame(() => {
      setOpenRemark(true);
    });
  };

  useEffect(() => {
    const closeTimers: Array<ReturnType<typeof setTimeout>> = [];

    if (renderReport && !openReport) {
      closeTimers.push(
        setTimeout(() => {
          setRenderReport(false);
        }, 300)
      );
    }

    if (renderInfo && !openInfo) {
      closeTimers.push(
        setTimeout(() => {
          setRenderInfo(false);
        }, 300)
      );
    }

    if (renderRemark && !openRemark) {
      closeTimers.push(
        setTimeout(() => {
          setRenderRemark(false);
        }, 300)
      );
    }

    return () => {
      closeTimers.forEach(timer => clearTimeout(timer));
    };
  }, [renderReport, openReport, renderInfo, openInfo, renderRemark, openRemark]);

  const closeHandler = useCallback(() => {
    setOpenReport(false);
  }, []);

  const closeInfoHandler = useCallback(() => {
    setOpenInfo(false);
  }, []);

  const closeRemarkHandler = useCallback(() => {
    setOpenRemark(false);
  }, []);

  return (
    <div className="page-container">
      <h1 className="page-heading">Result Entry Radiology</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Result Entry Radiology</span>
      </nav>
      <div className="card">
        <div className="form-grid-4">
          <InputField label="UHID" required>
            <input type="text" className="input-field" placeholder="Enter UHID " />
          </InputField>

          <InputField label="Bar Code" required>
            <input
              type="text"
              className="input-field"
              placeholder="Enter Barcode No  & press Enter to search"
            />
          </InputField>

          <InputField label="Patient Name" required>
            <input type="text" className="input-field" placeholder="Enter patient name " />
          </InputField>

          <InputField label="Lab No" required>
            <input type="text" className="input-field" placeholder="Enter lab number " />
          </InputField>

          <InputField label="Client/Panel" required>
            <input type="text" className="input-field" placeholder="Enter client name " />
          </InputField>

          <InputField label="Department" required>
            <input type="text" className="input-field" placeholder="Enter department name " />
          </InputField>

          <InputField label="From Date" required>
            <input
              type="date"
              className="input-field"
              placeholder="Enter contact number "
              value={currentDate}
              max={currentDate}
            />
          </InputField>

          <InputField label="To Date">
            <input
              type="date"
              className="input-field"
              placeholder="Enter contact number "
              max={currentDate}
              value={currentDate}
            />
          </InputField>
        </div>
        <div className="header-summary ">
          {/* --------------------------left stats----------------------------- */}
          <div className="header-summary-left-stats">
            <div className="flex items-center">
              <span className="name-header">Total Patient:</span>
              <span className="ml-2">20</span>
            </div>

            <div className="flex items-center">
              <span className="name-header">Total Test:</span>
              <span className="ml-2">20</span>
            </div>

            <div className="flex items-center">
              <span className="name-header">Approved Test:</span>
              <span className="ml-2">20</span>
            </div>

            <div className="flex items-center">
              <span className="name-header">Pending Test:</span>
              <span className="ml-2">20</span>
            </div>
          </div>

          {/*-------------------- report filter buttons--------------------------- */}
          <div className="header-summary-test-buttons">
            <button
              className={`lab-page-header-buttons ${
                testActiveBtn === "all" ? "lab-pages-active-btn" : "lab-pages-inactive-btn"
              }`}
              onClick={AllTestHandler}
            >
              All
            </button>

            <button
              className={`lab-page-header-buttons ${
                testActiveBtn === "xray" ? "lab-pages-active-btn" : "lab-pages-inactive-btn"
              }`}
              onClick={xRayTestHandler}
            >
              X-Ray
            </button>

            <button
              className={`lab-page-header-buttons ${
                testActiveBtn === "ct" ? "lab-pages-active-btn" : "lab-pages-inactive-btn"
              }`}
              onClick={ctTestHandler}
            >
              CT
            </button>

            <button
              className={`lab-page-header-buttons ${
                testActiveBtn === "us" ? "lab-pages-active-btn" : "lab-pages-inactive-btn"
              }`}
              onClick={usTestHandler}
            >
              US
            </button>

            <button
              className={`lab-page-header-buttons ${
                testActiveBtn === "mri" ? "lab-pages-active-btn" : "lab-pages-inactive-btn"
              }`}
              onClick={mriTestHandler}
            >
              MRI
            </button>
          </div>

          {/*----------------------- radio buttons + action buttons----------------------*/}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full lg:w-auto">
            {/*--------------------- radio buttons ----------------------------*/}
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="headerType"
                  value="proc"
                  className="w-4 h-4 accent-blue-500"
                />
                <span className="font-bold">Proc Lab Header</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="headerType"
                  value="login"
                  className="w-4 h-4 accent-blue-500"
                />
                <span className="font-bold">Login Header</span>
              </label>
            </div>

            {/* -------------------------action buttons ---------------------------*/}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button type="button" className="save-btn w-full sm:w-auto">
                Print
              </button>

              <button type="button" className="save-btn w-full sm:w-auto">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* -----------------------report buttons--------------------------- */}
      <div className="flex lg:flex-row sm:flex-col gap-2 m-2 overflow-x-auto">
        {ResultEntryRadiologyButtons.map((b, idx) => {
          const isActive = idx === activeIndex;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`report-button ${
                isActive ? "report-button-active" : "report-button-inactive"
              }`}
            >
              <BriefcaseMedical size={20} />
              <span>{b} : 10</span>
            </button>
          );
        })}
      </div>
      {/* ------------------------table------------------------ */}
      <div className="table-container ">
        <div className="table-scroll-wrapper ">
          <div className="table-size lg:min-h-82 lg:max-h-82">
            <table className="base-table ">
              <thead className="table-head">
                <tr>
                  {ResultEntryRadiologyTableHeader.map((h, index) => (
                    <th key={index} className="table-th ">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {ResultEntrySampleData.length === 0 ? (
                  <tr>
                    <td colSpan={17} className="text-center py-6 text-gray-500">
                      No data found
                    </td>
                  </tr>
                ) : (
                  ResultEntrySampleData.map((item, idx) => (
                    <tr key={idx} className="table-row">
                      <td className="table-td">{idx + 1}</td>
                      <td className="table-td">{item?.LabNo || "-"}</td>
                      <td className="table-td">{item?.BillDate || "-"}</td>
                      <td className="table-td">{item?.UHID || "-"}</td>
                      <td className="table-td">{item?.PatientName || "-"}</td>
                      <td className="table-td">
                        {item?.CurrentAge || "-"} / {item?.Gender}
                      </td>
                      <td className="table-td">{item?.ClientName || "-"}</td>
                      <td className="table-td">{item?.TotalBalanceAmount || 0}</td>
                      <td className="table-td">{item?.referDoctorName || "-"}</td>
                      <td className="table-td">{item?.ts || "-"}</td>

                      <td className="table-td">{item?.Name || "-"}</td>

                      <td className="table-td">{item?.IsReportApproved || "-"}</td>
                      <td className="table-td">{item?.ReportApprovedOn || "-"}</td>

                      <td className="table-td cursor-pointer" onClick={() => remarkHandler(item)}>
                        <i className="fa-solid fa-plus icon-color-button"></i>
                      </td>
                      <td className="table-td cursor-pointer" onClick={reportHandler}>
                        <i className="fa-solid fa-file icon-color-button"></i>
                      </td>

                      <td className="table-td cursor-pointer">
                        <i
                          className="fa-solid fa-info icon-color-button"
                          onClick={() => infoHandler(item)}
                        ></i>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/*------------------------ report------------------------------ */}
      {!!renderReport && <RadiologyReport isOpen={openReport} onClose={closeHandler} />}
      {/* ------------------------info------------------------- */}
      {!!renderInfo && (
        <PatientInvestigationDetails
          isOpen={openInfo}
          onClose={closeInfoHandler}
          data={selectedInfoData}
        />
      )}

      {/* --------------------remark----------------------------- */}
      {!!renderRemark && (
        <RadiologyRemark
          isOpen={openRemark}
          onClose={closeRemarkHandler}
          data={selectedRemarkData}
        />
      )}
    </div>
  );
};

export default ResultEntryRadiology;
