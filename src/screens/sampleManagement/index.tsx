import InputField from "@/components/customInputField";
import { sampleManagementButtons, SampleManagementTableHeader } from "@/constants/tableHeaders";
import { BriefcaseMedical } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import PatientInvestigationDetails from "./components/PatientInvestigationDetails";

export const sampleData = [
  {
    BillDate: "26-Feb-2026",
    Type: "OPD",
    UHID: "GWS/25-26/00000002",
    IPDNo: 0,
    LabNo: 94,
    ClientName: "01 : GRAVITY WEB TECHNOLOGIES",
    WardName: "",
    PatientName: "MR. ARJUN",
    CurrentAge: "43Y 4M 1D",
    CorporateName: "01 CASH",
    Gender: "MALE",
    VisitId: 3079,
    isUrgent: 1,
    Barcode: "3423",
    IsSampleRequired: 0,
    IsSampleSegregationRequired: 0,
    IsDepartmentReceivingRequired: 1,
    PatientInvestigationId: 4175,
    ReportTypeId: 1,
    IsReportHold: 0,
    CreatedOn: "Feb 26 2026 12:13PM",
    VIPPatient: 0,
    IsSampleSegregated: 0,
    SampleSegregationOn: "",
    IsSampleCollected: 1,
    SampleCollectedOn: "Feb 26 2026 12:13PM",
    IsSampleReceivedByDepartment: 1,
    SampleReceivedByDepartmentOn: "Feb 26 2026 12:16PM",
    IsResultDone: 0,
    ResultDoneOn: "",
    IsReportApproved: 0,
    ReportApprovedOn: "",
    IsDispatched: 0,
    DispatchedOn: "",
    isSampleRejected: 0,
    DefaultSampleTypeId: 1,
    SampleTypeList: "",
    DeliveryDate: "Feb 26 2026  8:13PM",
    IsUnderPackage: 0,
    Name: "CBC -(COMPLETE BLOOD COUNT)",
  },
  {
    BillDate: "26-Feb-2026",
    Type: "OPD",
    UHID: "GWS/25-26/00000002",
    IPDNo: 0,
    LabNo: 94,
    ClientName: "01 : GRAVITY WEB TECHNOLOGIES",
    WardName: "",
    PatientName: "MR. ARJUN",
    CurrentAge: "43Y 4M 1D",
    CorporateName: "01 CASH",
    Gender: "MALE",
    VisitId: 3079,
    isUrgent: 1,
    Barcode: "3423",
    IsSampleRequired: 0,
    IsSampleSegregationRequired: 0,
    IsDepartmentReceivingRequired: 0,
    PatientInvestigationId: 4176,
    ReportTypeId: 1,
    IsReportHold: 0,
    CreatedOn: "Feb 26 2026 12:13PM",
    VIPPatient: 0,
    IsSampleSegregated: 0,
    SampleSegregationOn: "",
    IsSampleCollected: 1,
    SampleCollectedOn: "Feb 26 2026 12:16PM",
    IsSampleReceivedByDepartment: 0,
    SampleReceivedByDepartmentOn: "",
    IsResultDone: 1,
    ResultDoneOn: "Feb 26 2026 12:33PM",
    IsReportApproved: 1,
    ReportApprovedOn: "Feb 26 2026 12:33PM",
    IsDispatched: 0,
    DispatchedOn: "",
    isSampleRejected: 0,
    DefaultSampleTypeId: 0,
    SampleTypeList: "",
    DeliveryDate: "Feb 26 2026  1:16PM",
    IsUnderPackage: 0,
    Name: "LIVER FUNCTION TEST (LFT)",
  },
  {
    BillDate: "26-Feb-2026",
    Type: "OPD",
    UHID: "GWS/25-26/00000002",
    IPDNo: 0,
    LabNo: 94,
    ClientName: "01 : GRAVITY WEB TECHNOLOGIES",
    WardName: "",
    PatientName: "MR. ARJUN",
    CurrentAge: "43Y 4M 1D",
    CorporateName: "01 CASH",
    Gender: "MALE",
    VisitId: 3079,
    isUrgent: 0,
    Barcode: "3423",
    IsSampleRequired: 0,
    IsSampleSegregationRequired: 0,
    IsDepartmentReceivingRequired: 0,
    PatientInvestigationId: 4177,
    ReportTypeId: 2,
    IsReportHold: 0,
    CreatedOn: "Feb 26 2026 12:13PM",
    VIPPatient: 0,
    IsSampleSegregated: 0,
    SampleSegregationOn: "",
    IsSampleCollected: 1,
    SampleCollectedOn: "Feb 26 2026 12:20PM",
    IsSampleReceivedByDepartment: 0,
    SampleReceivedByDepartmentOn: "",
    IsResultDone: 0,
    ResultDoneOn: "",
    IsReportApproved: 0,
    ReportApprovedOn: "",
    IsDispatched: 0,
    DispatchedOn: "",
    isSampleRejected: 0,
    DefaultSampleTypeId: 2,
    SampleTypeList: "",
    DeliveryDate: "",
    IsUnderPackage: 0,
    Name: "KIDNEY FUNCTION TEST (KFT)",
  },
  {
    BillDate: "26-Feb-2026",
    Type: "OPD",
    UHID: "GWT/25-26/00000054",
    IPDNo: 0,
    LabNo: 95,
    ClientName: "01 : GRAVITY WEB TECHNOLOGIES",
    WardName: "",
    PatientName: "MR. SHYAM",
    CurrentAge: "40Y 0M 0D",
    CorporateName: "01 CASH",
    Gender: "MALE",
    VisitId: 3080,
    isUrgent: 0,
    Barcode: "256",
    IsSampleRequired: 0,
    IsSampleSegregationRequired: 0,
    IsDepartmentReceivingRequired: 0,
    PatientInvestigationId: 4178,
    ReportTypeId: 2,
    IsReportHold: 0,
    CreatedOn: "Feb 26 2026 12:19PM",
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
    DefaultSampleTypeId: 2,
    SampleTypeList: "",
    DeliveryDate: "",
    IsUnderPackage: 0,
    Name: "KIDNEY FUNCTION TEST (KFT)",
  },
  {
    BillDate: "26-Feb-2026",
    Type: "OPD",
    UHID: "GWT/25-26/00000054",
    IPDNo: 0,
    LabNo: 95,
    ClientName: "01 : GRAVITY WEB TECHNOLOGIES",
    WardName: "",
    PatientName: "MR. SHYAM",
    CurrentAge: "40Y 0M 0D",
    CorporateName: "01 CASH",
    Gender: "MALE",
    VisitId: 3080,
    isUrgent: 1,
    Barcode: "257",
    IsSampleRequired: 1,
    IsSampleSegregationRequired: 0,
    IsDepartmentReceivingRequired: 0,
    PatientInvestigationId: 4180,
    ReportTypeId: 1,
    IsReportHold: 0,
    CreatedOn: "Feb 26 2026 12:19PM",
    VIPPatient: 0,
    IsSampleSegregated: 0,
    SampleSegregationOn: "",
    IsSampleCollected: 1,
    SampleCollectedOn: "Feb 26 2026 12:20PM",
    IsSampleReceivedByDepartment: 0,
    SampleReceivedByDepartmentOn: "",
    IsResultDone: 0,
    ResultDoneOn: "",
    IsReportApproved: 0,
    ReportApprovedOn: "",
    IsDispatched: 0,
    DispatchedOn: "",
    isSampleRejected: 0,
    DefaultSampleTypeId: 2,
    SampleTypeList: "2*SERUM*Black",
    DeliveryDate: "",
    IsUnderPackage: 0,
    Name: "WIDAL -SLIDE AGGLUTINATION",
  },
  {
    BillDate: "26-Feb-2026",
    Type: "OPD",
    UHID: "GWT/25-26/00000005",
    IPDNo: 0,
    LabNo: 96,
    ClientName: "01 : GRAVITY WEB TECHNOLOGIES",
    WardName: "",
    PatientName: "MR. DWARIKA",
    CurrentAge: "29Y 3M 26D",
    CorporateName: "01 CASH",
    Gender: "MALE",
    VisitId: 3081,
    isUrgent: 0,
    Barcode: "255335",
    IsSampleRequired: 0,
    IsSampleSegregationRequired: 0,
    IsDepartmentReceivingRequired: 1,
    PatientInvestigationId: 4181,
    ReportTypeId: 1,
    IsReportHold: 0,
    CreatedOn: "Feb 26 2026  1:01PM",
    VIPPatient: 0,
    IsSampleSegregated: 0,
    SampleSegregationOn: "",
    IsSampleCollected: 1,
    SampleCollectedOn: "Feb 26 2026  1:04PM",
    IsSampleReceivedByDepartment: 1,
    SampleReceivedByDepartmentOn: "Feb 26 2026  1:04AM",
    IsResultDone: 1,
    ResultDoneOn: "Feb 26 2026  1:08PM",
    IsReportApproved: 1,
    ReportApprovedOn: "Feb 26 2026  1:08PM",
    IsDispatched: 0,
    DispatchedOn: "",
    isSampleRejected: 0,
    DefaultSampleTypeId: 1,
    SampleTypeList: "",
    DeliveryDate: "Feb 26 2026  9:04PM",
    IsUnderPackage: 0,
    Name: "CBC -(COMPLETE BLOOD COUNT)",
  },
  {
    BillDate: "27-Feb-2026",
    Type: "OPD",
    UHID: "GWT/25-26/00000055",
    IPDNo: 0,
    LabNo: 97,
    ClientName: "01 : GRAVITY WEB TECHNOLOGIES",
    WardName: "",
    PatientName: "MR. SHARMA",
    CurrentAge: "24Y 0M 0D",
    CorporateName: "01 CASH",
    Gender: "MALE",
    VisitId: 4074,
    isUrgent: 0,
    Barcode: "00",
    IsSampleRequired: 0,
    IsSampleSegregationRequired: 0,
    IsDepartmentReceivingRequired: 0,
    PatientInvestigationId: 5146,
    ReportTypeId: 5,
    IsReportHold: 0,
    CreatedOn: "Feb 27 2026  1:04PM",
    VIPPatient: 0,
    IsSampleSegregated: 0,
    SampleSegregationOn: "",
    IsSampleCollected: 1,
    SampleCollectedOn: "Feb 27 2026  1:04PM",
    IsSampleReceivedByDepartment: 0,
    SampleReceivedByDepartmentOn: "",
    IsResultDone: 1,
    ResultDoneOn: "Feb 27 2026  1:13PM",
    IsReportApproved: 0,
    ReportApprovedOn: "",
    IsDispatched: 0,
    DispatchedOn: "",
    isSampleRejected: 0,
    DefaultSampleTypeId: 0,
    SampleTypeList: "",
    DeliveryDate: "",
    IsUnderPackage: 0,
    Name: "Stool Culture andSensitivity",
  },
];

const SampleManagement = () => {
  const currentDate = new Date().toISOString().split("T")[0];

  const [activeIndex, setActiveIndex] = useState(0);
  const [showDetails, setShowDetails] = useState<boolean>(true);
  const [selectedPatient, setSelectedPatient] = useState([]);

  const [openPatientDrawer, setOpenPatientDrawer] = useState<boolean>(false);
  const [renderPatientDrawer, setRenderPatientDrawer] = useState<boolean>(false);

  const closeDrawer = useCallback(() => {
    setOpenPatientDrawer(false);
  }, []);

  const openPatientInvestigation = item => {
    setSelectedPatient(item);
    setRenderPatientDrawer(true);
    requestAnimationFrame(() => {
      setOpenPatientDrawer(true);
    });
  };

  useEffect(() => {
    if (openPatientDrawer) return;

    const closeTimer = setTimeout(() => {
      setRenderPatientDrawer(false);
    }, 300);

    return () => clearTimeout(closeTimer);
  }, [openPatientDrawer]);

  return (
    <div className="page-container">
      <h1 className="page-heading">Sample Management</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Sample Management</span>
      </nav>

      <div className="card">
        <h2 className="card-title ">Sample Management </h2>

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

            <InputField label="Client/Panel" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter contact number "
                // {...register("address")}
              />
              {/* {errors.address && <p className="input-field-error">{errors.address.message}</p>} */}
            </InputField>
          </div>

          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn ">
              {"Search"}
            </button>
            <button type="button" className="cancel-button ">
              Cancel
            </button>
          </div>
        </form>
      </div>
      <div className="flex lg:flex-row sm:flex-col gap-2 m-2 overflow-x-auto">
        {sampleManagementButtons.map((b, idx) => {
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
                  {SampleManagementTableHeader.map((h, index) => (
                    <th key={index} className="table-th ">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* {[]?.length === 0 && (
                      <tr>
                        <td colSpan={[].length} className=" ">
                          No records found
                        </td>
                      </tr>
                    )} */}

                {sampleData.map((item, idx) => (
                  <tr key={idx} className="table-row">
                    <td className="table-td">{idx + 1}</td>
                    <td className="table-td">{item?.LabNo || "-"}</td>
                    {/* <td
                          className={`table-td ${
                            Number(item?.isActive) === 1 ? "active-text" : "inactive-text"
                          }`}
                        >
                          {Number(item?.isActive) === 1 ? "Active" : "Inactive"}
                        </td> */}
                    <td className="table-td">{item?.BillDate || "-"}</td>
                    <td className="table-td">{item?.UHID || "-"}</td>
                    <td className="table-td">{item?.PatientName || "-"}</td>
                    <td className="table-td">
                      {item?.CurrentAge || "-"} / {item?.Gender}
                    </td>
                    <td className="table-td">{item?.ClientName || "-"}</td>
                    <td className="table-td">{item?.xu || "-"}</td>
                    <td className="table-td">{item?.Name || "-"}</td>
                    <td className="table-td">{item?.SampleTypeList || "-"}</td>
                    <td className="table-td">{item?.color || "-"}</td>
                    <td className="table-td">{item?.Barcode || "-"}</td>
                    <td className="table-td">
                      <input
                        type="checkbox"
                        className="w-5 h-5 accent-blue-600 cursor-pointer"
                        checked={item?.IsSampleCollected === 1}
                        readOnly
                      />
                    </td>
                    <td className="table-td">{item?.lastModifiedOn || "-"}</td>
                    <td className="table-td">
                      {item?.isSampleRejected === 1 ? (
                        <span className="inactive-text">Reject</span>
                      ) : (
                        "Not Rejected"
                      )}
                    </td>
                    <td className="table-td">{item?.rema || "-"}</td>
                    <td className="table-td">{item?.lastModifiedOn || "-"}</td>
                    <td className="table-td">{item?.lastModifiedOn || "-"}</td>
                    <td className="table-td" onClick={() => openPatientInvestigation(item)}>
                      <i className="fa-solid fa-info text-xl  text-blue-500 active:scale-90"></i>
                    </td>

                    {/* <td className="table-td" onClick={() => editHandler(item)}> */}
                    {/* <i className="fa-solid fa-edit text-xl text-blue-500 active:scale-90" /> */}
                    {/* </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="form-actions-responsive mt-3">
          <button type="submit" className="save-btn">
            Save Sample Collection
          </button>
          <button type="submit" className="save-btn">
            Save Dept Receive
          </button>
          <button type="submit" className="save-btn">
            Print Barcode Sticker
          </button>
          <button type="button" className="cancel-button ">
            Cancel
          </button>
        </div>
      </div>
      {!!renderPatientDrawer && (
        <PatientInvestigationDetails
          isOpen={openPatientDrawer}
          onClose={closeDrawer}
          data={selectedPatient}
        />
      )}
    </div>
  );
};

export default SampleManagement;
