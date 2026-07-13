import InputField from "@/components/customInputField";
import { HistoResultEntryTableHeader, LabResultEntryButtons } from "@/constants/tableHeaders";
import { BriefcaseMedical } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

export const HistoResultSampleData = [
  {
    BillDate: "27-Feb-2026 01:16 PM",
    Type: "OPD",
    UHID: "GWT/25-26/00000046",
    IPDNo: 0,
    LabNo: 98,
    WardName: "",
    PatientName: "MR. SUBHAM",
    CurrentAge: "23Y 0M 7D",
    TotalBalanceAmount: 0.0,
    CorporateName: "01 CASH",
    ClientName: "01 : GRAVITY WEB TECHNOLOGIES",
    referDoctorName: "",
    Gender: "MALE",
    VisitId: 4075,
    isUrgent: 0,
    Barcode: "90",
    IsSampleRequired: 0,
    IsSampleSegregationRequired: 0,
    IsDepartmentReceivingRequired: 0,
    PatientInvestigationId: 5147,
    ReportTypeId: 4,
    IsReportHold: 0,
    CreatedOn: "Feb 27 2026  1:16PM",
    VIPPatient: 0,
    IsSampleSegregated: 0,
    SampleSegregationOn: "",
    IsSampleCollected: 1,
    SampleCollectedOn: "Feb 27 2026  1:17PM",
    IsSampleReceivedByDepartment: 0,
    SampleReceivedByDepartmentOn: "",
    IsResultDone: 1,
    ResultDoneOn: "Feb 27 2026  1:21PM",
    IsReportApproved: 1,
    ReportApprovedOn: "Feb 27 2026  1:21PM",
    IsDispatched: 0,
    DispatchedOn: "",
    isSampleRejected: 0,
    isReportPrinted: 0,
    DeliveryDate: "",
    RemainingTime: "0",
    isExpired: "0",
    IsAllergyTest: 0,
    IsUnderPackage: 0,
    Name: "BIOPSY - BONE",
    isMachineResult: 0,
  },
  {
    BillDate: "27-Feb-2026 01:54 PM",
    Type: "OPD",
    UHID: "GWT/25-26/00000046",
    IPDNo: 0,
    LabNo: 99,
    WardName: "",
    PatientName: "MR. SUBHAM",
    CurrentAge: "23Y 0M 7D",
    TotalBalanceAmount: 0.0,
    CorporateName: "01 CASH",
    ClientName: "01 : GRAVITY WEB TECHNOLOGIES",
    referDoctorName: "",
    Gender: "MALE",
    VisitId: 4076,
    isUrgent: 0,
    Barcode: "9876543",
    IsSampleRequired: 0,
    IsSampleSegregationRequired: 0,
    IsDepartmentReceivingRequired: 0,
    PatientInvestigationId: 5148,
    ReportTypeId: 4,
    IsReportHold: 0,
    CreatedOn: "Feb 27 2026  1:54PM",
    VIPPatient: 0,
    IsSampleSegregated: 0,
    SampleSegregationOn: "",
    IsSampleCollected: 1,
    SampleCollectedOn: "Feb 27 2026  1:54PM",
    IsSampleReceivedByDepartment: 0,
    SampleReceivedByDepartmentOn: "",
    IsResultDone: 1,
    ResultDoneOn: "Feb 27 2026  1:54PM",
    IsReportApproved: 1,
    ReportApprovedOn: "Feb 27 2026  1:54PM",
    IsDispatched: 0,
    DispatchedOn: "",
    isSampleRejected: 0,
    isReportPrinted: 0,
    DeliveryDate: "",
    RemainingTime: "0",
    isExpired: "0",
    IsAllergyTest: 0,
    IsUnderPackage: 0,
    Name: "BIOPSY - BONE",
    isMachineResult: 0,
  },
];

const HistoResultEntry = () => {
  const currentDate = new Date().toISOString().split("T")[0];
  const [activeIndex, setActiveIndex] = useState(0);

  const [selectedPatient, setSelectedPatient] = useState([]);
  const [selectedRemarkPatient, setSelectedRemarkPatient] = useState([]);

  const [openPatientDrawer, setOpenPatientDrawer] = useState<boolean>(false);
  const [renderPatientDrawer, setRenderPatientDrawer] = useState<boolean>(false);
  const [openRemarkPopup, setOpenRemarkPopup] = useState<boolean>(false);
  const [renderRemarkPopup, setRenderRemarkPopup] = useState<boolean>(false);

  const openPatientInvestigation = item => {
    setSelectedPatient(item);
    setRenderPatientDrawer(true);
    requestAnimationFrame(() => {
      setOpenPatientDrawer(true);
    });
  };

  const remarkHandler = item => {
    setSelectedRemarkPatient(item);
    setRenderRemarkPopup(true);
    requestAnimationFrame(() => {
      setOpenRemarkPopup(true);
    });
  };

  useEffect(() => {
    if (openPatientDrawer) return;

    const closeTimer = setTimeout(() => {
      setRenderPatientDrawer(false);
    }, 300);

    return () => clearTimeout(closeTimer);
  }, [openPatientDrawer]);

  const closeHandler = useCallback(() => {
    setOpenRemarkPopup(false);
  }, []);

  useEffect(() => {
    if (openRemarkPopup) return;

    const closeTimer = setTimeout(() => {
      setRenderRemarkPopup(false);
    }, 300);

    return () => clearTimeout(closeTimer);
  }, [openRemarkPopup]);

  return (
    <div className="page-container">
      <h1 className="page-heading">Histo Result Entry</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Histo Result Entry</span>
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
              name="fromDate"
              // value={fromDate}
              max={currentDate}
              // onChange={e => setFromDate(e.target.value)}
              readOnly
            />
          </InputField>

          <InputField label="To Date">
            <input
              type="date"
              className="input-field"
              name="toDate"
              max={currentDate}
              // value={toDate}
              // onChange={e => setToDate(e.target.value)}
              readOnly
            />
          </InputField>

          <InputField label="Investigation" required>
            <input type="text" className="input-field" placeholder="Enter investigation name " />
          </InputField>
        </div>
        <div className="mt-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* left stats */}
          <div className="flex flex-wrap items-center gap-4">
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

          {/* RIGHT — RADIO OPTIONS + BUTTONS */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full lg:w-auto">
            {/* RADIO GROUP */}
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

            {/* ACTION BUTTONS */}
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
      <div className="flex lg:flex-row sm:flex-col gap-2 m-2 overflow-x-auto">
        {LabResultEntryButtons.map((b, idx) => {
          const isActive = idx === activeIndex;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`
          flex items-center gap-2
          px-4 py-2
          rounded-lg
          border
          whitespace-nowrap
          text-sm font-medium
        
          ${
            isActive
              ? "bg-[#0B5394] text-white shadow-sm"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
          }
        `}
            >
              <BriefcaseMedical size={20} />
              <span>{b.level} : 10</span>
            </button>
          );
        })}
      </div>

      {/* table */}
      <div className="table-container ">
        <div className="table-scroll-wrapper ">
          <div className="table-size lg:min-h-60 lg:max-h-60">
            <table className="base-table ">
              <thead className="table-head">
                <tr>
                  {HistoResultEntryTableHeader.map((h, index) => (
                    <th key={index} className="table-th ">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {HistoResultSampleData.length === 0 ? (
                  <tr>
                    <td colSpan={17} className="text-center py-6 text-gray-500">
                      No data found
                    </td>
                  </tr>
                ) : (
                  HistoResultSampleData.map((item, idx) => (
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
                      <td className="table-td">{item?.TotalBalanceAmount || "-"}</td>
                      <td className="table-td">{item?.xv || "-"}</td>
                      <td className="table-td">{item?.sv || "-"}</td>
                      <td className="table-td">{item?.ts || "-"}</td>

                      <td className="table-td">{item?.Name || "-"}</td>
                      <td className="table-td">{item?.Barcode || "-"}</td>
                      <td className="table-td">{item?.DeliveryDate || "-"}</td>
                      <td className="table-td">{item?.ts || "-"}</td>

                      <td className="table-td">{item?.rema || "-"}</td>
                      <td className="table-td">{item?.lastModifiedOn || "-"}</td>
                      <td className="table-td cursor-pointer">
                        <i className="fa-solid fa-plus icon-color-button"></i>
                      </td>
                      <td className="table-td cursor-pointer">
                        <i className="fa-solid fa-file icon-color-button"></i>
                      </td>

                      <td className="table-td cursor-pointer">
                        <i className="fa-solid fa-info icon-color-button"></i>
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

export default HistoResultEntry;
