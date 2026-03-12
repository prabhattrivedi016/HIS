import InputField from "@/components/customInputField";
import { LaboratoryHelpDeskButtons, LaboratoryHelpDeskTableHeader } from "@/constants/tableHeaders";
import { BriefcaseMedical } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import AddOutSourceReport from "./components/AddOutSourceReport";

export const LabHelpDeskSampleData = [
  {
    BillDate: "07-Mar-2026",
    Type: "OPD",
    UHID: "GWT/25-26/00000060",
    ContactNumber: "",
    Email: null,
    IPDNo: 0,
    LabNo: 111,
    WardName: "",
    PatientName: "MR. RAJAN",
    CurrentAge: "28Y 0M 0D",
    CorporateName: "01 CASH",
    ClientName: "01 : GRAVITY WEB TECHNOLOGIES",
    Gender: "MALE",
    VisitId: 4089,
    isUrgent: 0,
    Barcode: "2345676543",
    IsSampleRequired: 0,
    IsOutSource: 1,
    IsSampleSegregationRequired: 0,
    IsDepartmentReceivingRequired: 1,
    PatientInvestigationId: 5173,
    ReportTypeId: 1,
    IsReportHold: 0,
    CreatedOn: "Mar  7 2026 11:18AM",
    VIPPatient: 0,
    IsAbnormalResult: 0,
    IsSampleSegregated: 0,
    SampleSegregationOn: "",
    IsSampleCollected: 1,
    SampleCollectedOn: "Mar  7 2026 11:19AM",
    IsSampleReceivedByDepartment: 1,
    SampleReceivedByDepartmentOn: "Mar  7 2026 11:19AM",
    IsResultDone: 0,
    ResultDoneOn: "",
    IsReportApproved: 0,
    ReportApprovedOn: "",
    IsDispatched: 0,
    DispatchedOn: "",
    isSampleRejected: 0,
    IsUnderPackage: 0,
    Name: "CBC -(COMPLETE BLOOD COUNT)",
  },
  {
    BillDate: "07-Mar-2026",
    Type: "OPD",
    UHID: "GWT/25-26/00000060",
    ContactNumber: "",
    Email: null,
    IPDNo: 0,
    LabNo: 111,
    WardName: "",
    PatientName: "MR. RAJAN",
    CurrentAge: "28Y 0M 0D",
    CorporateName: "01 CASH",
    ClientName: "01 : GRAVITY WEB TECHNOLOGIES",
    Gender: "MALE",
    VisitId: 4089,
    isUrgent: 0,
    Barcode: "2345676543",
    IsSampleRequired: 0,
    IsOutSource: 0,
    IsSampleSegregationRequired: 0,
    IsDepartmentReceivingRequired: 0,
    PatientInvestigationId: 5174,
    ReportTypeId: 1,
    IsReportHold: 0,
    CreatedOn: "Mar  7 2026 11:18AM",
    VIPPatient: 0,
    IsAbnormalResult: 0,
    IsSampleSegregated: 0,
    SampleSegregationOn: "",
    IsSampleCollected: 1,
    SampleCollectedOn: "Mar  7 2026 11:19AM",
    IsSampleReceivedByDepartment: 0,
    SampleReceivedByDepartmentOn: "",
    IsResultDone: 0,
    ResultDoneOn: "",
    IsReportApproved: 0,
    ReportApprovedOn: "",
    IsDispatched: 0,
    DispatchedOn: "",
    isSampleRejected: 0,
    IsUnderPackage: 0,
    Name: "LIVER FUNCTION TEST (LFT)",
  },
  {
    BillDate: "07-Mar-2026",
    Type: "OPD",
    UHID: "GWT/25-26/00000061",
    ContactNumber: "",
    Email: null,
    IPDNo: 0,
    LabNo: 112,
    WardName: "",
    PatientName: "MR. RAJAN",
    CurrentAge: "27Y 0M 0D",
    CorporateName: "01 CASH",
    ClientName: "01 : GRAVITY WEB TECHNOLOGIES",
    Gender: "MALE",
    VisitId: 4090,
    isUrgent: 0,
    Barcode: "1234567",
    IsSampleRequired: 0,
    IsOutSource: 1,
    IsSampleSegregationRequired: 0,
    IsDepartmentReceivingRequired: 1,
    PatientInvestigationId: 5175,
    ReportTypeId: 1,
    IsReportHold: 0,
    CreatedOn: "Mar  7 2026 11:33AM",
    VIPPatient: 0,
    IsAbnormalResult: 0,
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
    IsUnderPackage: 0,
    Name: "CBC -(COMPLETE BLOOD COUNT)",
  },
];

const LaboratoryHelpDesk = () => {
  const currentDate = new Date().toISOString().split("T")[0];
  const [activeIndex, setActiveIndex] = useState(0);

  const [renderReport, setRenderReport] = useState<boolean>(false);
  const [openReport, setOpenReport] = useState<boolean>(false);

  const [renderOutSource, setRenderOutSource] = useState<boolean>(false);
  const [openOutSource, setOpenOutSource] = useState<boolean>(false);

  const reportHandler = () => {
    setRenderReport(true);
    requestAnimationFrame(() => {
      setOpenReport(true);
    });
  };

  const outSourceHandler = () => {
    setRenderOutSource(true);
    requestAnimationFrame(() => {
      setOpenOutSource(true);
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

    return () => {
      closeTimers.forEach(timer => clearTimeout(timer));
    };
  }, [renderReport, openReport]);

  useEffect(() => {
    const closeTimers: Array<ReturnType<typeof setTimeout>> = [];

    if (renderOutSource && !openOutSource) {
      closeTimers.push(
        setTimeout(() => {
          setRenderOutSource(false);
        }, 300)
      );
    }

    return () => {
      closeTimers.forEach(timer => clearTimeout(timer));
    };
  }, [renderOutSource, openOutSource]);

  const closeHandler = useCallback(() => {
    setOpenReport(false);
    setOpenOutSource(false);
  }, []);

  return (
    <div className="page-container">
      <h1 className="page-heading">Laboratory Help Desk</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Laboratory Help Desk</span>
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
            <input type="text" className="input-field" placeholder="Enter client name " />
          </InputField>

          <InputField label="Department" required>
            <input type="text" className="input-field" placeholder="Enter department name " />
          </InputField>

          <InputField label="Client/Panel" required>
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

          <InputField label="Investigation Name" required>
            <input type="text" className="input-field" placeholder="Enter investigation name " />
          </InputField>
        </div>
        {/* -------------------------action buttons ---------------------------*/}
        <div className="mt-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* LEFT SIDE */}
          <div className="flex flex-wrap items-center gap-4">
            <input type="checkbox" className="input-checkbox" />
            <input type="checkbox" className="input-checkbox" />
            <input type="checkbox" className="input-checkbox" />

            <select className="border border-gray-400 rounded-sm w-32">
              <option>All</option>
            </select>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex flex-col sm:flex-row  w-full lg:w-auto">
            <button type="button" className="save-btn w-full m-2  sm:w-auto">
              Print
            </button>

            <button type="button" className="save-btn w-full m-2 sm:w-auto">
              Search
            </button>

            <button type="button" className="cancel-btn w-full sm:w-auto">
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* -----------------------report buttons--------------------------- */}
      <div className="flex lg:flex-row sm:flex-col gap-2 m-2 overflow-x-auto">
        {LaboratoryHelpDeskButtons.map((b, idx) => {
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
              <span>{b}</span>
            </button>
          );
        })}
      </div>
      {/* ------------------------table------------------------ */}
      <div className="table-container ">
        <div className="table-scroll-wrapper ">
          <div className="table-size lg:min-h-60 lg:max-h-60">
            <table className="base-table ">
              <thead className="table-head">
                <tr>
                  {LaboratoryHelpDeskTableHeader.map((h, index) => (
                    <th key={index} className="table-th ">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {LabHelpDeskSampleData.length === 0 ? (
                  <tr>
                    <td colSpan={17} className="text-center py-6 text-gray-500">
                      No data found
                    </td>
                  </tr>
                ) : (
                  LabHelpDeskSampleData.map((item, idx) => (
                    <tr key={idx} className="table-row">
                      <td className="table-td">{item.Barcode}</td>
                      <td className="table-td">{item?.LabNo || "-"}</td>
                      <td className="table-td">{item?.BillDate || "-"}</td>
                      <td className="table-td">{item?.UHID || "-"}</td>
                      <td className="table-td">{item?.PatientName || "-"}</td>
                      <td className="table-td">
                        {item?.CurrentAge || "-"} / {item?.Gender}
                      </td>
                      <td className="table-td">{item?.ContactNumber || "-"}</td>
                      <td className="table-td">{item?.ClientName || "-"}</td>

                      <td className="table-td">{item?.Name || "-"}</td>

                      {!!item?.IsOutSource ? (
                        <td className="table-td">
                          <i
                            className={`fa-solid fa-upload icon-color-button text-md ${
                              item.IsOutSource ? "cursor-pointer" : "opacity-50"
                            }`}
                            onClick={() => {
                              if (item.IsOutSource) outSourceHandler();
                            }}
                          ></i>
                        </td>
                      ) : (
                        <td className="table-td"></td>
                      )}

                      <td className="table-td"></td>

                      <td className="table-td">
                        <i className="fa-solid fa-search icon-color-button text-md"></i>
                      </td>

                      <td className="table-td cursor-pointer" onClick={reportHandler}>
                        <i className="fa-solid fa-file icon-color-button"></i>
                      </td>

                      <td className="table-td cursor-pointer" onClick={reportHandler}>
                        <i className="fa-solid fa-bell icon-color-button"></i>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* outsource */}
      {!!renderOutSource && <AddOutSourceReport isOpen={openOutSource} onClose={closeHandler} />}
    </div>
  );
};

export default LaboratoryHelpDesk;
