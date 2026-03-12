import InputField from "@/components/customInputField";
import { LabWorkSheetButtons, LabWorkSheetTableHeader } from "@/constants/tableHeaders";
import { BriefcaseMedical } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

const LabWorkSheetSampleData = [
  {
    BillDate: "03-Mar-2026",
    Type: "OPD",
    UHID: "GWT/25-26/00000046",
    ContactNumber: "",
    Email: null,
    IPDNo: 0,
    LabNo: 104,
    WardName: "",
    PatientName: "MR. SUBHAM",
    CurrentAge: "23Y 0M 8D",
    CorporateName: "01 CASH",
    ClientName: "01 : GRAVITY WEB TECHNOLOGIES",
    Gender: "MALE",
    VisitId: 4082,
    isUrgent: 0,
    Barcode: "854565",
    IsSampleRequired: 1,
    IsOutSource: 0,
    IsSampleSegregationRequired: 0,
    IsDepartmentReceivingRequired: 0,
    PatientInvestigationId: 5157,
    ReportTypeId: 4,
    IsReportHold: 0,
    CreatedOn: "Mar  3 2026 10:40AM",
    VIPPatient: 0,
    IsAbnormalResult: 0,
    IsSampleSegregated: 0,
    SampleSegregationOn: "",
    IsSampleCollected: 1,
    SampleCollectedOn: "Mar  3 2026 10:44AM",
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
    Name: "BIOPSY - KIDNEY",
  },
  {
    BillDate: "03-Mar-2026",
    Type: "OPD",
    UHID: "GWT/25-26/00000046",
    ContactNumber: "",
    Email: null,
    IPDNo: 0,
    LabNo: 105,
    WardName: "",
    PatientName: "MR. SUBHAM",
    CurrentAge: "23Y 0M 8D",
    CorporateName: "01 CASH",
    ClientName: "01 : GRAVITY WEB TECHNOLOGIES",
    Gender: "MALE",
    VisitId: 4083,
    isUrgent: 0,
    Barcode: "562536",
    IsSampleRequired: 0,
    IsOutSource: 0,
    IsSampleSegregationRequired: 0,
    IsDepartmentReceivingRequired: 0,
    PatientInvestigationId: 5158,
    ReportTypeId: 5,
    IsReportHold: 0,
    CreatedOn: "Mar  3 2026 10:43AM",
    VIPPatient: 0,
    IsAbnormalResult: 0,
    IsSampleSegregated: 0,
    SampleSegregationOn: "",
    IsSampleCollected: 1,
    SampleCollectedOn: "Mar  3 2026 10:44AM",
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
    Name: "PUS C/S",
  },
];

const LabWorkSheet = () => {
  const currentDate = new Date().toISOString().split("T")[0];
  const [activeIndex, setActiveIndex] = useState(0);

  const [renderReport, setRenderReport] = useState<boolean>(false);
  const [openReport, setOpenReport] = useState<boolean>(false);

  const reportHandler = () => {
    setRenderReport(true);
    requestAnimationFrame(() => {
      setOpenReport(true);
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

  const closeHandler = useCallback(() => {
    setOpenReport(false);
  }, []);

  return (
    <div className="page-container">
      <h1 className="page-heading">Lab Work Sheet</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Lab Work Sheet</span>
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

          <InputField label="Department" required>
            <input type="text" className="input-field" placeholder="Enter department name " />
          </InputField>

          <InputField label="Sub Department" required>
            <input type="text" className="input-field" placeholder="Enter client name " />
          </InputField>

          <InputField label="Client/Panel" required>
            <input type="text" className="input-field" placeholder="Enter department name " />
          </InputField>

          <InputField label="Investigation Name" required>
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
        {/* -------------------------action buttons ---------------------------*/}
        <div className="form-actions-responsive mt-5">
          <button type="submit" className="save-btn">
            Bulk Print
          </button>
          <button type="button" className="save-btn ">
            Search
          </button>
        </div>
      </div>

      {/* -----------------------report buttons--------------------------- */}
      <div className="flex lg:flex-row sm:flex-col gap-2 m-2 overflow-x-auto">
        {LabWorkSheetButtons.map((b, idx) => {
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
              <span>{b} </span>
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
                  {LabWorkSheetTableHeader.map((h, index) => (
                    <th key={index} className="table-th ">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {LabWorkSheetSampleData.length === 0 ? (
                  <tr>
                    <td colSpan={17} className="text-center py-6 text-gray-500">
                      No data found
                    </td>
                  </tr>
                ) : (
                  LabWorkSheetSampleData.map((item, idx) => (
                    <tr key={idx} className="table-row">
                      <td className="table-td">{idx + 1}</td>
                      <td className="table-td">{item?.BillDate || "-"}</td>
                      <td className="table-td">{item?.LabNo || "-"}</td>
                      <td className="table-td">{item?.UHID || "-"}</td>
                      <td className="table-td">{item?.PatientName || "-"}</td>
                      <td className="table-td">
                        {item?.CurrentAge || "-"} / {item?.Gender}
                      </td>
                      <td className="table-td">{item?.ClientName || "-"}</td>
                      <td className="table-td">{item?.Name || "-"}</td>
                      <td className="table-td">{item?.Barcode || "-"}</td>

                      <td className="table-td cursor-pointer" onClick={reportHandler}>
                        <i className="fa-solid fa-file icon-color-button"></i>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabWorkSheet;
