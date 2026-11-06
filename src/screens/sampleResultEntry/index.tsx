import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { BranchContext } from "@/context/BranchContext";
import { RoleContext } from "@/context/RoleContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { ArrowLeft } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ApproveUnapproveInvestigationResult from "../InvestigationResultEntry/components/ApproveUnapproveInvestigationResuilt";
import RejectSamplePopup from "../labSampleManagement/components/RejectSamplePopup";
import CommentBox from "./components/CommentBox";
import FooterButton from "./components/FooterButton";
import FreeTextTableData from "./components/FreeTextTableData";
import HoldInvestigationResult from "./components/HoldInvestigationResult";
import LabInfoFilterBar from "./components/LabInfoFilterBar";
import LabInfoRightChart from "./components/LabInfoRightChart";
import LabInfoSmallTable from "./components/LabInfoSmallTable";
import LabInfoTableData from "./components/LabInfoTableData";
import {
  FreetextInvestigationValue,
  PatientDetailsInvestigationItem,
  SubInvetigationItem,
} from "./types";

const SampleResultEntry = () => {
  const { loading, fetchApi } = useGlobalApi();

  const roleId = useContext(RoleContext)?.roleId;
  const branchId = useContext(BranchContext)?.branchId;
  const currentDate = new Date().toISOString().split("T")[0];

  const navigate = useNavigate();

  const { department, uhid, visitId, labNo, pId } = useParams();
  const [investigationLists, setInvestigationsLists] = useState<PatientDetailsInvestigationItem[]>(
    []
  );
  const [selectedInvestigation, setSelectedInvestigation] =
    useState<PatientDetailsInvestigationItem | null>(null);
  const [approvedDoctorId, setApprovedDoctorId] = useState(0);
  const [isHoldOpen, setIsHoldOpen] = useState(false);
  const [isUnapproveOpen, setIsUnapproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const isFreeTextResult =
    department === "radiology" ||
    (department === "pathology" && Number(selectedInvestigation?.ReportTypeId) === 2);

  //auto selected investigation
  useEffect(() => {
    if (investigationLists.length > 0 && pId) {
      const selected = investigationLists.find(
        inv => Number(inv.PatientInvestigationId) === Number(pId)
      );
      if (selected) {
        setSelectedInvestigation(selected);
      }
    }
  }, [investigationLists, pId]);

  useEffect(() => {
    setApprovedDoctorId(
      Number(selectedInvestigation?.referDoctorId ?? selectedInvestigation?.ReferDoctorId ?? 0)
    );
  }, [selectedInvestigation]);

  const [allInvestigationListsOfPatient, setAllInvestigationListsOfPatient] = useState<
    PatientDetailsInvestigationItem[]
  >([]);

  const [subInvestigationlists, setSubInvestigationLists] = useState<SubInvetigationItem[]>([]);
  const [freeTextInvestigationResultvalue, setFreeTextInvestigResultValue] = useState<
    FreetextInvestigationValue[]
  >([]);
  const [freeTextFormData, setFreeTextFormData] = useState({
    resultValue: "",
    templateId: 0,
    investigationComments: "",
    isAbnormalResult: 0,
  });

  const [patientGeneralInfo, setPatientGeneralInfo] = useState({
    uhid: "",
    patientName: "",
    age: "",
    gender: "",
    mobileNo: "",
    visitNo: "",
    department: "",
    doctor: "",
    ward: "",
    bed: "",
    admittedOn: "",
    admissionTime: "",
  });

  const [investigationGeneralInfo, setInvestigationGeneralInfo] = useState({
    labNo: "",
    barcode: "",
    sampleType: "",
    priority: "",
    collectionDate: "",
    receivedDate: "",
    ReportedDate: "",
    tat: "",
    clinicalNotes: "",
    machineName: "",
    connection: "",
    qcStatus: "",
    lastSync: "",
  });

  const [isExpanded, setIsExpanded] = useState(true);

  // get all investigation details
  const getAllInvestigationDetailsOfPatient = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_ALL_INVESTIGATION_NAME_OF_PATIENT,
      {},
      { params: { labTypeId: department === "pathology" ? 1 : 2, branchId, visitId, uhid, labNo } },
      { component: "SampleResultEntry" }
    );
    if (!resp?.result) {
      showError(resp?.messsage ?? "No investigation found!");
      return;
    }

    const investigations: PatientDetailsInvestigationItem[] = resp?.data ?? [];
    setInvestigationsLists(investigations);
    setSelectedInvestigation(current => {
      const selectedId = current?.PatientInvestigationId ?? Number(pId);
      return (
        investigations.find(item => Number(item.PatientInvestigationId) === Number(selectedId)) ??
        current
      );
    });
  };

  // patient general info
  useEffect(() => {
    if (selectedInvestigation) {
      setPatientGeneralInfo({
        uhid: selectedInvestigation?.UHID ?? "",
        patientName: selectedInvestigation?.PatientName ?? "",
        age: selectedInvestigation?.CurrentAge ?? "",
        gender: selectedInvestigation?.Gender ?? "",
        mobileNo: selectedInvestigation?.ContactNumber ?? "",
        visitNo: selectedInvestigation?.VisitNo ?? "",
        department: selectedInvestigation?.DoctorDepartment ?? "",
        doctor: selectedInvestigation?.DoctorName ?? "",
        ward: selectedInvestigation?.WardName ?? "",
        bed: selectedInvestigation?.BedNo ?? "",
        admittedOn: selectedInvestigation?.AdmissionDate ?? "",
        admissionTime: selectedInvestigation?.AdmissionTime ?? "",
      });

      setInvestigationGeneralInfo({
        labNo: String(selectedInvestigation?.LabNo ?? ""),
        barcode: selectedInvestigation?.BarCode ?? "",
        sampleType: selectedInvestigation?.SampleType ?? "",
        priority: selectedInvestigation?.isUrgent === 1 ? `Urgent` : "Normal",
        collectionDate: selectedInvestigation?.SampleCollectedOn ?? "",
        receivedDate: selectedInvestigation?.SampleReceivedByDepartmentOn ?? "",
        ReportedDate: selectedInvestigation?.ReportedDate ?? "",
        tat:
          selectedInvestigation?.ActualTATInMin != null
            ? `${selectedInvestigation.ActualTATInMin} min`
            : "",
        clinicalNotes: selectedInvestigation?.ClinicalNotes ?? "",
        machineName: selectedInvestigation?.MachineName ?? "",
        connection: selectedInvestigation?.Connection ?? "",
        qcStatus: selectedInvestigation?.QcStatus ?? "",
        lastSync: selectedInvestigation?.LastSync ?? "",
      });
    }
  }, [selectedInvestigation]);

  useEffect(() => {
    getAllInvestigationDetailsOfPatient();
  }, [branchId, uhid, visitId, labNo]);

  // patient tabular report
  const getPatientTabularReport = async () => {
    setSubInvestigationLists([]);
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PATIENT_TABULAR_REPORT_FOR_RESULT_ENTRY,
      {},
      { params: { patientInvestigationId: selectedInvestigation?.PatientInvestigationId } },
      { component: "SampleResultEntry" }
    );
    setSubInvestigationLists(resp?.data ?? []);
  };

  // patient free text report
  // free text entry value
  const getFreeTextResultEntryValue = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PATIENT_FREE_TEXT_REPORT_FOR_RESULT_ENTRY,
      {},
      { params: { patientInvestigationId: selectedInvestigation?.PatientInvestigationId } },
      { component: "InvestigationResultEntry" }
    );
    const data = resp?.data ?? [];
    setFreeTextInvestigResultValue(data);
    setFreeTextFormData({
      resultValue: data[0]?.ResultValue ?? "",
      templateId: data[0]?.TemplateId ?? 0,
      investigationComments: data[0]?.InvestigationComment ?? "",
      isAbnormalResult: data[0]?.IsAbnormalResult ?? 0,
    });
  };

  useEffect(() => {
    setSubInvestigationLists([]);
    if (selectedInvestigation && isFreeTextResult) {
      getFreeTextResultEntryValue();
    } else if (selectedInvestigation && department === "pathology") {
      getPatientTabularReport();
    }
  }, [selectedInvestigation, department, isFreeTextResult]);

  const approveButtonClickHandler = async () => {
    if (!selectedInvestigation) {
      showWarning("Select an investigation before approving");
      return;
    }

    if (Number(selectedInvestigation.IsReportApproved) === 1) {
      setIsUnapproveOpen(true);
      return;
    }

    if (!branchId || !approvedDoctorId) {
      showWarning("Select approved by before approving");
      return;
    }

    try {
      const resp = await fetchApi(
        "PATCH",
        ENDPOINTS.UPDATE_REPORT_APPROVAL,
        {
          patientInvestigationIds: [selectedInvestigation.PatientInvestigationId],
          branchId,
          approvedByDoctorId: approvedDoctorId,
        },
        {},
        { component: "SampleResultEntry" }
      );

      if (!resp?.result) {
        showWarning(resp?.message ?? "Unable to approve report");
        return;
      }

      showSuccess(resp?.message ?? "Approved successfully");
      await getAllInvestigationDetailsOfPatient();
    } catch {
      showWarning("Unable to approve report");
    }
  };

  // save button click handler
  const saveButtonClickHandler = async () => {
    if (isFreeTextResult) {
      if (!selectedInvestigation) {
        showWarning("Select an investigation before saving");
        return;
      }
      if (!freeTextFormData.resultValue.trim()) {
        showWarning("Result value is required");
        return;
      }

      const payload = {
        patientInvestigationId: selectedInvestigation.PatientInvestigationId,
        investigationId:
          selectedInvestigation.InvestigationId ??
          freeTextInvestigationResultvalue[0]?.InvestigationId ??
          0,
        ...freeTextFormData,
      };
      const resp = await fetchApi(
        "POST",
        ENDPOINTS.SAVE_PATIENT_FREE_TEXT_REPORT,
        payload,
        {},
        { component: "SampleResultEntry" }
      );
      if (!resp?.result) {
        showError(resp?.message ?? "Unable to save result");
        return;
      }

      showSuccess(resp?.message ?? "Data saved successfully");
      await getFreeTextResultEntryValue();
      await getAllInvestigationDetailsOfPatient();
      return;
    }

    if (department !== "pathology" || Number(selectedInvestigation?.ReportTypeId) !== 1) return;
    if (!selectedInvestigation || !subInvestigationlists.length) {
      showWarning("Select an investigation before saving");
      return;
    }

    const payload = {
      patientInvestigationId: selectedInvestigation.PatientInvestigationId,
      investigationId:
        selectedInvestigation.InvestigationId ?? subInvestigationlists[0]?.InvestigationId ?? 0,
      investigationComments: subInvestigationlists[0]?.InvestigationComment ?? "",
      isAbnormalResult:
        selectedInvestigation.IsAbnormalResult ?? subInvestigationlists[0]?.IsAbnormalResult ?? 0,
      tabularReport: subInvestigationlists.map(item => ({
        observationId: item.ObservationId ?? 0,
        resultValue: item.ResultValue ?? "",
        minValue: item.MinValue ?? "",
        maxValue: item.MaxValue ?? "",
        displayRange: item.DisplayRange ?? "",
        unit: item.Unit ?? "",
        machineResult: item.MachineResult ?? "",
        machineDisplayRange: item.MachineDisplayRange ?? "",
        machineUnit: item.MachineUnit ?? "",
        sampleRemark: item.SampleRemark ?? "",
        isHeader: item.IsHeader ? 1 : 0,
        isResultBold: item.IsResultBold ? 1 : 0,
      })),
    };

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.SAVE_PATIENT_TABULAR_REPORT,
      payload,
      {},
      { component: "SampleResultEntry" }
    );
    if (!resp?.result) {
      showError(resp?.message ?? "Unable to save result");
      return;
    }

    showSuccess(resp?.message ?? "Data saved successfully");
    await getPatientTabularReport();
    await getAllInvestigationDetailsOfPatient();
  };

  // all invetigation lists of a patient
  const getAllInvestigationListsOfPatient = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.SEARCH_PATIENT_INVESTIGATION_FOR_SAMPLE_PROCESSING_PATHOLOGY,
      {},
      { params: { branchId, roleId, uhid, fromDate: currentDate, toDate: currentDate } },
      { component: "SampleResultEntry" }
    );

    // if (!resp?.result) {
    //   showError(resp?.messsage ?? "No investigation found!");
    //   return;
    // }
    setAllInvestigationListsOfPatient(resp?.data ?? []);
  };

  // all radiology investigation lists of a patient
  const getAllRadiologyInvestigationListsOfPatient = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.SEARCH_PATIENT_INVESTIGATION_FOR_SAMPLE_PROCESSING_RADIOLOGY,
      {},
      { params: { branchId, roleId, uhid, fromDate: currentDate, toDate: currentDate } },
      { component: "SampleResultEntry" }
    );
    setAllInvestigationListsOfPatient(resp?.data ?? []);
  };

  useEffect(() => {
    if (department === "pathology") getAllInvestigationListsOfPatient();
    else if (department === "radiology") getAllRadiologyInvestigationListsOfPatient();
  }, [branchId, roleId, uhid, currentDate]);

  return (
    <>
      <div className="page-container">
        <div className="flex items-center justify-between w-full flex-col xl:flex-row">
          <div className="flex-1">
            <h1 className="page-heading">Sample Result Entry</h1>
            <nav className="helper-text">
              Home
              <span>››</span>
              <span>Sample Result Entry</span>
            </nav>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex justify-end flex-1">
            <div className="flex justify-between flex-wrap items-center gap-2">
              <button
                type="button"
                className="save-btn flex items-center gap-2"
                onClick={() =>
                  navigate(
                    department === "pathology"
                      ? "/result-entry-pathology"
                      : "/result-entry-radiology"
                  )
                }
              >
                <ArrowLeft size={16} />
                Back
              </button>
            </div>
          </div>
        </div>

        {/* Filter and Table Data */}
        <LabInfoFilterBar
          subInvestigationlists={subInvestigationlists}
          patientGeneralInfo={patientGeneralInfo}
          investigationGeneralInfo={investigationGeneralInfo}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-1 items-start mt-1">
          {/* Left Column: Test List Sidebar */}
          <div className="lg:col-span-3 min-w-0">
            <LabInfoSmallTable
              investigationLists={investigationLists}
              setSelectedInvestigation={setSelectedInvestigation}
              allInvestigationListsOfPatient={allInvestigationListsOfPatient}
              selectedInvestigation={selectedInvestigation}
            />
          </div>

          <div
            className={`${isExpanded ? "lg:col-span-9" : "lg:col-span-7"} min-w-0 transition-all duration-300`}
          >
            {/* render tables */}
            {!isFreeTextResult ? (
              <>
                <LabInfoTableData
                  isExpanded={isExpanded}
                  onToggleExpand={() => setIsExpanded(!isExpanded)}
                  subInvestigationlists={subInvestigationlists}
                  setSubInvestigationLists={setSubInvestigationLists}
                />
                <CommentBox selectedInvestigation={selectedInvestigation} />
              </>
            ) : (
              <FreeTextTableData
                freeTextInvestigationResultvalue={freeTextInvestigationResultvalue}
                freeTextFormData={freeTextFormData}
                setFreeTextFormData={setFreeTextFormData}
                selectedInvestigation={selectedInvestigation}
              />
            )}
          </div>

          {/* Right Column: Graphical Trend, Reference Details & Alerts (Hidden when isExpanded is true) */}
          {!isExpanded && department === "pathology" && (
            <div className="lg:col-span-2 min-w-0 space-y-3">
              <LabInfoRightChart
                subInvestigationlists={subInvestigationlists}
                selectedInvestigationId={selectedInvestigation?.PatientInvestigationId}
              />
            </div>
          )}
        </div>
        <FooterButton
          onSaveButtonClick={saveButtonClickHandler}
          onApproveButtonClick={approveButtonClickHandler}
          onHoldButtonClick={() => setIsHoldOpen(true)}
          onRejectButtonClick={() => {
            if (!selectedInvestigation) {
              showWarning("Select an investigation before rejecting");
              return;
            }
            setIsRejectOpen(true);
          }}
          isApproved={Number(selectedInvestigation?.IsReportApproved) === 1}
          isResultDone={Number(selectedInvestigation?.IsResultDone) === 1}
          approvedDoctorId={approvedDoctorId}
          onApprovedDoctorChange={setApprovedDoctorId}
        />

        <HoldInvestigationResult
          isOpen={isHoldOpen}
          onClose={() => setIsHoldOpen(false)}
          pId={Number(selectedInvestigation?.PatientInvestigationId ?? 0)}
          onSuccess={getAllInvestigationDetailsOfPatient}
        />
        <ApproveUnapproveInvestigationResult
          isOpen={isUnapproveOpen}
          onClose={() => setIsUnapproveOpen(false)}
          pId={Number(selectedInvestigation?.PatientInvestigationId ?? 0)}
          onSuccess={getAllInvestigationDetailsOfPatient}
        />
        <RejectSamplePopup
          isOpen={isRejectOpen}
          onClose={() => setIsRejectOpen(false)}
          data={selectedInvestigation}
          refreshSampleReject={getAllInvestigationDetailsOfPatient}
        />

        {loading && <CustomLoader isLoading={loading} />}
      </div>
    </>
  );
};

export default SampleResultEntry;
