import { ResultEntryRadiologyPatientInvestigationTableHeader } from "@/constants/tableHeaders";
import { createPortal } from "react-dom";

export const PatientReportData = [
  {
    UHID: "GWT/25-26/00000046",
    VisitNo: 72,
    LabNo: 79,
    PatientName: "MR. SUBHAM",
    CurrentAge: "23Y 0M 4D",
    Gender: "MALE",
    LabNo1: 79,
    BarCode: "79",
    Name: "CBC -(COMPLETE BLOOD COUNT)",
    BillDate: "23-Feb-2026 12:46 PM",
    BillingBy: "TEAM GWS  (gws)",
    SampleCollectedOn: "23-Feb-2026 01:27 PM",
    SampleCollectedBy: "TEAM GWS  (gws)",
    SampleReceivedByDepartmentOn: "",
    SampleReceivedBy: "",
    SampleCollectionRejectedOn: "",
    SampleCollectionRejectedBy: "",
    SampleCollectionRejectionReason: "",
    ResultDoneOn: "23-Feb-2026 01:40 PM",
    ResultDoneBy: "TEAM GWS  (gws)",
    ApprovedDate: "",
    ReportApprovedBy: "",
    PatientInvestigationId: 4124,
    InvestigationId: 346,
    ReportTypeId: 1,
    IsSampleSegregated: 0,
    IsSampleRequired: 0,
    IsSampleSegregationRequired: 0,
    IsDepartmentReceivingRequired: 1,
    IsSampleCollected: 1,
    IsSampleReceivedByDepartment: 0,
    IsResultDone: 1,
    IsReportApproved: 0,
    IsDispatched: 0,
    isUrgent: 0,
    TestRemark: "",
    NotificationRemark: "abc",
  },
  {
    UHID: "GWT/25-26/00000046",
    VisitNo: 72,
    LabNo: 79,
    PatientName: "MR. SUBHAM",
    CurrentAge: "23Y 0M 4D",
    Gender: "MALE",
    LabNo1: 79,
    BarCode: "79",
    Name: "UREA - SERUM",
    BillDate: "23-Feb-2026 12:46 PM",
    BillingBy: "TEAM GWS  (gws)",
    SampleCollectedOn: "23-Feb-2026 01:27 PM",
    SampleCollectedBy: "TEAM GWS  (gws)",
    SampleReceivedByDepartmentOn: "",
    SampleReceivedBy: "",
    SampleCollectionRejectedOn: "",
    SampleCollectionRejectedBy: "",
    SampleCollectionRejectionReason: "",
    ResultDoneOn: "23-Feb-2026 01:40 PM",
    ResultDoneBy: "TEAM GWS  (gws)",
    ApprovedDate: "",
    ReportApprovedBy: "",
    PatientInvestigationId: 4125,
    InvestigationId: 661,
    ReportTypeId: 1,
    IsSampleSegregated: 0,
    IsSampleRequired: 1,
    IsSampleSegregationRequired: 0,
    IsDepartmentReceivingRequired: 0,
    IsSampleCollected: 1,
    IsSampleReceivedByDepartment: 0,
    IsResultDone: 1,
    IsReportApproved: 0,
    IsDispatched: 0,
    isUrgent: 0,
    TestRemark: "",
    NotificationRemark: "0",
  },
  {
    UHID: "GWT/25-26/00000046",
    VisitNo: 72,
    LabNo: 79,
    PatientName: "MR. SUBHAM",
    CurrentAge: "23Y 0M 4D",
    Gender: "MALE",
    LabNo1: 79,
    BarCode: "79",
    Name: "BLOOD UREA NITROGEN -BUN",
    BillDate: "23-Feb-2026 12:46 PM",
    BillingBy: "TEAM GWS  (gws)",
    SampleCollectedOn: "23-Feb-2026 01:30 PM",
    SampleCollectedBy: "TEAM GWS  (gws)",
    SampleReceivedByDepartmentOn: "",
    SampleReceivedBy: "",
    SampleCollectionRejectedOn: "",
    SampleCollectionRejectedBy: "",
    SampleCollectionRejectionReason: "",
    ResultDoneOn: "23-Feb-2026 03:18 PM",
    ResultDoneBy: "TEAM GWS  (gws)",
    ApprovedDate: "23-Feb-2026 03:18 PM",
    ReportApprovedBy: "TEAM GWS  (gws)",
    PatientInvestigationId: 4126,
    InvestigationId: 45,
    ReportTypeId: 1,
    IsSampleSegregated: 0,
    IsSampleRequired: 1,
    IsSampleSegregationRequired: 0,
    IsDepartmentReceivingRequired: 0,
    IsSampleCollected: 1,
    IsSampleReceivedByDepartment: 0,
    IsResultDone: 1,
    IsReportApproved: 1,
    IsDispatched: 1,
    isUrgent: 0,
    TestRemark: "",
    NotificationRemark: "0",
  },
];

const PatientInvestigationDetails = ({ isOpen, onClose, data }) => {
  return createPortal(
    <div className={`fixed inset-0 z-999 ${isOpen ? "" : "pointer-events-none"}`}>
      <div className="absolute inset-0">
        <div
          className={`drawer-bg-fade ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={onClose}
        />

        <div className={`drawer-layout drawer-bg ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="drawer-title-border">
            <h2 className="drawer-title">Patient Investigation Details</h2>
            <button onClick={onClose} className="drawer-close-btn">
              ×
            </button>
          </div>
          <div className="card m-1 form-grid-2">
            <div className="flex flex-row">
              <h1 className="name-header">UHID : </h1>
              <span className="ml-2">{data?.UHID}</span>
            </div>

            <div className="flex flex-row">
              <h1 className="name-header">Name : </h1>
              <span className="ml-2">{data?.PatientName}</span>
            </div>

            <div className="flex flex-row">
              <h1 className="name-header">Age / Sex : </h1>
              <span className="ml-2">
                {data?.CurrentAge} / {data?.Gender}
              </span>
            </div>

            <div className="flex flex-row">
              <h1 className="name-header">Lab No: </h1>
              <span className="ml-2">{data?.LabNo}</span>
            </div>

            <div className="flex flex-row">
              <h1 className="name-header">Bar Code: </h1>
              <span className="ml-2">{data?.Barcode}</span>
            </div>

            <div className="flex flex-row">
              <h1 className="name-header">Bill Date: </h1>
              <span className="ml-2">{data?.BillDate}</span>
            </div>
          </div>
          <div className=" -mt-3 m-1 lg:min-h-[400px] ">
            <div className="table-container  ">
              <div className="table-scroll-wrapper ">
                <div className="table-size lg:min-h-[400px]">
                  <table className="base-table ">
                    <thead className="table-head">
                      <tr>
                        {ResultEntryRadiologyPatientInvestigationTableHeader.map((h, index) => (
                          <th key={index} className="table-th ">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {PatientReportData.map((item, idx) => (
                        <tr key={idx} className="table-row">
                          <td className="table-td">{item?.Name || "-"}</td>
                          <td className="table-td">{item?.BillDate || "-"}</td>
                          <td className="table-td">{item?.BillingBy || "-"}</td>
                          <td className="table-td">{item?.SampleCollectedOn || "-"}</td>

                          <td className="table-td">{item?.SampleCollectedBy || "-"}</td>
                          <td className="table-td">{item?.SampleReceivedByDepartmentOn || "-"}</td>
                          <td className="table-td">{item?.Name || "-"}</td>
                          <td className="table-td items-center">{item?.SampleTypeList || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PatientInvestigationDetails;
