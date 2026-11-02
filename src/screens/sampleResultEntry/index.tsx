import { ENDPOINTS } from "@/config/defaults";
import { BranchContext } from "@/context/BranchContext";
import { RoleContext } from "@/context/RoleContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CommentBox from "./components/CommentBox";
import FooterButton from "./components/FooterButton";
import FreeTextTableData from "./components/FreeTextTableData";
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

  const { department, uhid, visitId, labNo } = useParams();
  const [investigationLists, setInvestigationsLists] = useState<PatientDetailsInvestigationItem[]>(
    []
  );
  const [selectedInvestigation, setSelectedInvestigation] = useState<number>(0);

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
    sampleNo: "",
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

  const [isExpanded, setIsExpanded] = useState(false);

  const handleActionClick = actionName => {
    alert(`${actionName} clicked`);
  };

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
    setPatientGeneralInfo({
      uhid: resp?.data[0]?.UHID,
      patientName: resp?.data[0]?.PatientName,
      age: resp?.data[0]?.CurrentAge,
      gender: resp?.data[0]?.Gender,
      mobileNo: resp?.data[0]?.ContactNumber,
      visitNo: resp?.data[0]?.VisitNo,
      department: resp?.data[0]?.DoctorDepartment,
      doctor: resp?.data[0]?.DoctorName,
      ward: resp?.data[0]?.WardName,
      bed: resp?.data[0]?.BedNo,
      admittedOn: resp?.data[0]?.AdmissionDate,
      admissionTime: resp?.data[0]?.AdmissionTime,
    });

    setInvestigationGeneralInfo({
      sampleNo: resp?.data[0]?.SampleNo,
      barcode: resp?.data[0]?.BarCode,
      sampleType: resp?.data[0]?.SampleType,
      priority: resp?.data[0]?.Priority,
      collectionDate: resp?.data[0]?.CollectionDate,
      receivedDate: resp?.data[0]?.ReceivedDate,
      ReportedDate: resp?.data[0]?.ReportedDate,
      tat: resp?.data[0]?.TAT,
      clinicalNotes: resp?.data[0]?.ClinicalNotes,
      machineName: resp?.data[0]?.MachineName,
      connection: resp?.data[0]?.Connection,
      qcStatus: resp?.data[0]?.QcStatus,
      lastSync: resp?.data[0]?.LastSync,
    });
    setInvestigationsLists(resp?.data ?? []);
  };

  useEffect(() => {
    getAllInvestigationDetailsOfPatient();
  }, [branchId, uhid, visitId, labNo]);

  // patient tabular report
  const getPatientTabularReport = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PATIENT_TABULAR_REPORT_FOR_RESULT_ENTRY,
      {},
      { params: { patientInvestigationId: selectedInvestigation } },
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
      { params: { patientInvestigationId: selectedInvestigation } },
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
    if (selectedInvestigation && department === "pathology") {
      getPatientTabularReport();
    } else if (selectedInvestigation && department === "radiology") {
      getFreeTextResultEntryValue();
    }
  }, [selectedInvestigation, department]);

  // save button click handler
  const saveButtonClickHandler = async () => {
    if (department === "radiology") {
      if (!selectedInvestigation) {
        showWarning("Select an investigation before saving");
        return;
      }
      if (!freeTextFormData.resultValue.trim()) {
        showWarning("Result value is required");
        return;
      }

      const selected = investigationLists.find(
        item => Number(item.PatientInvestigationId) === selectedInvestigation
      );
      const payload = {
        patientInvestigationId: selected?.PatientInvestigationId ?? selectedInvestigation,
        investigationId:
          selected?.InvestigationId ?? freeTextInvestigationResultvalue[0]?.InvestigationId ?? 0,
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
      return;
    }

    if (department !== "pathology") return;
    if (!selectedInvestigation || !subInvestigationlists.length) {
      showWarning("Select an investigation before saving");
      return;
    }

    const selected = investigationLists.find(
      item => Number(item.PatientInvestigationId) === selectedInvestigation
    );
    const payload = {
      patientInvestigationId: selected?.PatientInvestigationId ?? selectedInvestigation,
      investigationId: selected?.InvestigationId ?? subInvestigationlists[0]?.InvestigationId ?? 0,
      investigationComments: subInvestigationlists[0]?.InvestigationComment ?? "",
      isAbnormalResult:
        selected?.IsAbnormalResult ?? subInvestigationlists[0]?.IsAbnormalResult ?? 0,
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

    console.log("getAllInvestigationListsOfPatient", resp?.data);
    if (!resp?.result) {
      showError(resp?.messsage ?? "No investigation found!");
      return;
    }
    setAllInvestigationListsOfPatient(resp?.data ?? []);
  };

  useEffect(() => {
    getAllInvestigationListsOfPatient();
  }, [branchId, roleId, uhid, currentDate]);

  return (
    <>
      <div className="page-container">
        <div className="flex items-center justify-between w-full flex-col xl:flex-row">
          {/* Header Title & Breadcrumb */}
          <div className="flex-1">
            <h1 className="page-heading">Sample Result Entry</h1>
            <nav className="helper-text">
              Home
              <span>››</span>
              <span>Sample Result Entry</span>
            </nav>
          </div>

          {/* Search Bar between Header and Buttons (Matching Image) */}
          {/* <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1.5 shadow-2xs">
            <div className="relative flex items-center">
              <select className="bg-transparent text-xs text-gray-700 font-semibold focus:outline-none pr-2 border-r border-gray-200 cursor-pointer">
                <option value="sampleNo">Sample No</option>
                <option value="uhid">UHID</option>
                <option value="barcode">Barcode</option>
              </select>
            </div>
            <input
              type="text"
              placeholder="Scan Barcode / Enter Sample No / UHID"
              className="bg-transparent text-xs text-gray-800 placeholder-gray-400 focus:outline-none px-2 lg:w-[130px]  "
            />
            <button onClick={() => handleActionClick("Search Sample")}></button>
          </div> */}

          {/* Action Buttons Toolbar */}
          <div className="flex justify-end flex-1">
            <div className="flex justify-between flex-wrap items-center gap-2">
              {/* Previous Button */}
              {/* <button
                onClick={() => handleActionClick("Previous")}
                className="flex items-center gap-1 bg-white border border-gray-200 text-gray-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-2xs transition-all duration-200 active:scale-95 hover:bg-gray-50 cursor-pointer"
              >
                <MoveLeft size={14} strokeWidth={2.5} />
                <span>Previous</span>
              </button> */}

              {/* Next Button */}
              {/* <button
                onClick={() => handleActionClick("Next")}
                className="flex items-center gap-1 bg-white border border-gray-200 text-gray-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-2xs transition-all duration-200 active:scale-95 hover:bg-gray-50 cursor-pointer"
              >
                <span>Next</span>
                <MoveRight size={14} strokeWidth={2.5} />
              </button> */}

              {/* Result Entry Button */}
              {/* <button
                onClick={() => handleActionClick("Result Entry")}
                className="flex items-center gap-1.5 bg-blue-900 hover:bg-blue-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-2xs transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <FileText size={14} strokeWidth={2.5} />
                <span>Result Entry</span>
              </button> */}

              {/* Urgent Button */}
              {/* <button
                onClick={() => handleActionClick("Urgent")}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-2xs transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <AlertTriangle size={14} strokeWidth={2.5} />
                <span>Urgent</span>
              </button> */}

              {/* STAT Button */}
              {/* <button
                onClick={() => handleActionClick("STAT")}
                className="flex items-center gap-1.5 bg-white hover:bg-blue-50 text-blue-900 border border-blue-900 text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-2xs transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <User size={14} strokeWidth={2.5} />
                <span>STAT</span>
              </button> */}

              {/* Print Label Button */}
              {/* <button
                onClick={() => handleActionClick("Print Label")}
                className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-2xs transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <Printer size={14} strokeWidth={2} className="text-blue-900" />
                <span>Print Label</span>
              </button> */}
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
            />
          </div>

          {/* Center Column: CBC Parameters Table & Comments (Expands to col-span-9 when isExpanded is true) */}
          <div
            className={`${isExpanded ? "lg:col-span-9" : "lg:col-span-7"} min-w-0 transition-all duration-300`}
          >
            {/* render tables */}
            {department === "pathology" ? (
              <LabInfoTableData
                isExpanded={isExpanded}
                onToggleExpand={() => setIsExpanded(!isExpanded)}
                subInvestigationlists={subInvestigationlists}
                setSubInvestigationLists={setSubInvestigationLists}
              />
            ) : (
              <FreeTextTableData
                isExpanded={isExpanded}
                onToggleExpand={() => setIsExpanded(!isExpanded)}
                freeTextInvestigationResultvalue={freeTextInvestigationResultvalue}
                freeTextFormData={freeTextFormData}
                setFreeTextFormData={setFreeTextFormData}
              />
            )}

            <CommentBox />
          </div>

          {/* Right Column: Graphical Trend, Reference Details & Alerts (Hidden when isExpanded is true) */}
          {!isExpanded && (
            <div className="lg:col-span-2 min-w-0 space-y-3">
              <LabInfoRightChart subInvestigationlists={subInvestigationlists} />
            </div>
          )}
        </div>
        <FooterButton onSaveButtonClick={saveButtonClickHandler} />
      </div>
    </>
  );
};

export default SampleResultEntry;
