import InputField from "@/components/customInputField";
import { LabResultEntryButtons, LabResultEntryTableHeader } from "@/constants/tableHeaders";
import { BriefcaseMedical } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import LRRemarkPopup from "./components/LRRemarkPopup";

export const LabSampleData = [
  {
    BillDate: "28-Feb-2026 12:49 PM",
    Type: "OPD",
    UHID: "GWT/25-26/00000057",
    IPDNo: 0,
    LabNo: 101,
    WardName: "",
    PatientName: "MR. RADHA",
    CurrentAge: "100Y 0M 0D",
    TotalBalanceAmount: 0.0,
    CorporateName: "01 CASH",
    ClientName: "01 : GRAVITY WEB TECHNOLOGIES",
    referDoctorName: "",
    Gender: "MALE",
    VisitId: 4079,
    isUrgent: 1,
    Barcode: "101",
    IsSampleRequired: 0,
    IsSampleSegregationRequired: 0,
    IsDepartmentReceivingRequired: 1,
    PatientInvestigationId: 5152,
    ReportTypeId: 1,
    IsReportHold: 0,
    CreatedOn: "Feb 28 2026 12:49PM",
    VIPPatient: 0,
    IsSampleSegregated: 0,
    SampleSegregationOn: "",
    IsSampleCollected: 1,
    SampleCollectedOn: "Feb 28 2026 12:49PM",
    IsSampleReceivedByDepartment: 1,
    SampleReceivedByDepartmentOn: "Feb 28 2026 12:49PM",
    IsResultDone: 0,
    ResultDoneOn: "",
    IsReportApproved: 0,
    ReportApprovedOn: "",
    IsDispatched: 0,
    DispatchedOn: "",
    isSampleRejected: 0,
    isReportPrinted: 0,
    DeliveryDate: "Feb 28 2026  8:49PM",
    RemainingTime: "16:48",
    isExpired: "0",
    IsAllergyTest: 0,
    IsUnderPackage: 0,
    Name: "CBC -(COMPLETE BLOOD COUNT)",
    isMachineResult: 0,
  },
  {
    BillDate: "28-Feb-2026 12:49 PM",
    Type: "OPD",
    UHID: "GWT/25-26/00000057",
    IPDNo: 0,
    LabNo: 101,
    WardName: "",
    PatientName: "MR. RADHA",
    CurrentAge: "100Y 0M 0D",
    TotalBalanceAmount: 0.0,
    CorporateName: "01 CASH",
    ClientName: "01 : GRAVITY WEB TECHNOLOGIES",
    referDoctorName: "",
    Gender: "MALE",
    VisitId: 4079,
    isUrgent: 1,
    Barcode: "101",
    IsSampleRequired: 0,
    IsSampleSegregationRequired: 0,
    IsDepartmentReceivingRequired: 0,
    PatientInvestigationId: 5153,
    ReportTypeId: 1,
    IsReportHold: 0,
    CreatedOn: "Feb 28 2026 12:49PM",
    VIPPatient: 0,
    IsSampleSegregated: 0,
    SampleSegregationOn: "",
    IsSampleCollected: 1,
    SampleCollectedOn: "Feb 28 2026 12:49PM",
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
    DeliveryDate: "Feb 28 2026  1:49PM",
    RemainingTime: "0",
    isExpired: "1",
    IsAllergyTest: 0,
    IsUnderPackage: 0,
    Name: "LIVER FUNCTION TEST (LFT)",
    isMachineResult: 0,
  },
  {
    BillDate: "28-Feb-2026 12:49 PM",
    Type: "OPD",
    UHID: "GWT/25-26/00000057",
    IPDNo: 0,
    LabNo: 101,
    WardName: "",
    PatientName: "MR. RADHA",
    CurrentAge: "100Y 0M 0D",
    TotalBalanceAmount: 0.0,
    CorporateName: "01 CASH",
    ClientName: "01 : GRAVITY WEB TECHNOLOGIES",
    referDoctorName: "",
    Gender: "MALE",
    VisitId: 4079,
    isUrgent: 1,
    Barcode: "101",
    IsSampleRequired: 0,
    IsSampleSegregationRequired: 0,
    IsDepartmentReceivingRequired: 0,
    PatientInvestigationId: 5154,
    ReportTypeId: 1,
    IsReportHold: 0,
    CreatedOn: "Feb 28 2026 12:49PM",
    VIPPatient: 0,
    IsSampleSegregated: 0,
    SampleSegregationOn: "",
    IsSampleCollected: 1,
    SampleCollectedOn: "Feb 28 2026 12:49PM",
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
    RemainingTime: "0",
    isExpired: "0",
    IsAllergyTest: 0,
    IsUnderPackage: 0,
    Name: "KIDNEY FUNCTION TEST (KFT)",
    isMachineResult: 0,
  },
];

const LabResultEntry = () => {
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
      <h1 className="page-heading">Lab Result Entry</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Lab Result Entry</span>
      </nav>
      <div className="card">
        <h2 className="card-title ">Lab Result Entry </h2>

        <form>
          <div className="form-grid-4">
            <InputField label="UHID" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter UHID "
                // {...register("hospitalName")}
              />
              {/* {errors.hospitalName && (
                <p className="input-field-error">{errors.hospitalName.message}</p>
              )} */}
            </InputField>

            <InputField label="Bar Code" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter Barcode No  & press Enter to search"
                // {...register("hospitalCode")}
              />
              {/* {errors.hospitalCode && (
                <p className="input-field-error">{errors.hospitalCode.message}</p>
              )} */}
            </InputField>

            <InputField label="Patient Name" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter patient name "
                // {...register("website")}
              />
              {/* {errors.website && <p className="input-field-error">{errors.website.message}</p>} */}
            </InputField>

            <InputField label="Lab No" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter lab number "
                // {...register("email")}
              />
              {/* {errors.email && <p className="input-field-error">{errors.email.message}</p>} */}
            </InputField>

            <InputField label="Client/Panel" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter client name "
                // {...register("address")}
              />
              {/* {errors.address && <p className="input-field-error">{errors.address.message}</p>} */}
            </InputField>

            <InputField label="Department" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter department name "
                // {...register("address")}
              />
              {/* {errors.address && <p className="input-field-error">{errors.address.message}</p>} */}
            </InputField>

            <InputField label="From Date" required>
              <input
                type="date"
                className="input-field"
                placeholder="Enter contact number "
                value={currentDate}
                max={currentDate}
                // {...register("contact1")}
              />
              {/* {errors.contact1 && <p className="input-field-error">{errors.contact1.message}</p>} */}
            </InputField>

            <InputField label="To Date">
              <input
                type="date"
                className="input-field"
                placeholder="Enter contact number "
                max={currentDate}
                value={currentDate}
                // {...register("contact2")}
              />
              {/* {errors.contact2 && <p className="input-field-error">{errors.contact2.message}</p>} */}
            </InputField>

            <InputField label="Investigation" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter investigation name "
                // {...register("address")}
              />
              {/* {errors.address && <p className="input-field-error">{errors.address.message}</p>} */}
            </InputField>
          </div>
          <div className="mt-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* LEFT — STATS */}
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
        </form>
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
              <span>{b} : 10</span>
            </button>
          );
        })}
      </div>
      <div className="table-container ">
        <div className="table-scroll-wrapper ">
          <div className="table-size lg:min-h-60 lg:max-h-60">
            <table className="base-table ">
              <thead className="table-head">
                <tr>
                  {LabResultEntryTableHeader.map((h, index) => (
                    <th key={index} className="table-th ">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {LabSampleData.length === 0 ? (
                  <tr>
                    <td colSpan={17} className="text-center py-6 text-gray-500">
                      No data found
                    </td>
                  </tr>
                ) : (
                  LabSampleData.map((item, idx) => (
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
                      <td className="table-td cursor-pointer" onClick={() => remarkHandler(item)}>
                        <i className="fa-solid fa-plus text-xl items-center active:scale-80 cursor:pointer"></i>
                      </td>
                      <td
                        className="table-td cursor-pointer"
                        onClick={() => openPatientInvestigation(item)}
                      >
                        <i className="fa-solid fa-info text-xl  text-blue-500 active:scale-80"></i>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {!!renderRemarkPopup && (
        <LRRemarkPopup
          isOpen={openRemarkPopup}
          onClose={closeHandler}
          data={selectedRemarkPatient}
        />
      )}
    </div>
  );
};

export default LabResultEntry;
