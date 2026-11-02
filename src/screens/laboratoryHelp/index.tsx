import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { labSampleManagementButtonClicked } from "@/constants/constants";
import { BranchContext } from "@/context/BranchContext";
import { RoleContext } from "@/context/RoleContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showWarning } from "@/utils/alert";
import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FilterBar from "./components/FilterBar";
import SearchBar from "./components/SearchBar";
import TableData from "./components/TableData";
import {
  FilterTypeItem,
  GroupedDataLaboratoryHelpDesk,
  LaboratoryHelpDeskItem,
  SampleTypeItem,
  ViewMode,
} from "./types";

const filtersRef: { current: FilterTypeItem | null } = { current: null };
const cachedDataRef: { current: LaboratoryHelpDeskItem[] | null } = { current: null };

const LaboratoryHelp = () => {
  const { loading, fetchApi } = useGlobalApi();
  const navigate = useNavigate();
  const currentDate = new Date().toISOString().split("T")[0];
  const roleId = useContext(RoleContext)?.roleId ?? 0;
  const branchId = useContext(BranchContext)?.branchId;

  const [laboratoryHelpDeskList, setLaboratoryHelpDeskList] = useState<LaboratoryHelpDeskItem[]>(
    () => cachedDataRef.current || []
  );
  const [updatedLaboratoryHelpDeskList, setUpdatedLaboratoryHelpDeskList] = useState<
    LaboratoryHelpDeskItem[]
  >(() => cachedDataRef.current || []);

  const [uhidGroupedLaboratoryHelpDeskList, setUhidGroupedLaboratoryHelpDeskList] = useState<
    GroupedDataLaboratoryHelpDesk[]
  >([]);

  const [sampleWiseGroupedLaboratoryHelpDeskList, setSampleWiseGroupedLaboratoryHelpDeskList] =
    useState<GroupedDataLaboratoryHelpDesk[]>([]);

  const [sampleType, setSampleType] = useState<SampleTypeItem[]>([]);

  const [viewMode, setViewMode] = useState<ViewMode>("test");

  const [filters, setFilters] = useState<FilterTypeItem>(
    () =>
      filtersRef.current || {
        branchId,
        typeId: 0,
        uhid: "",
        ipdNo: "",
        labNo: "",
        fromDate: currentDate,
        toDate: currentDate,
        barCode: "",
        subCategoryId: 0,
        subSubCategoryId: 0,
        investigationId: 0,
        patientName: "",
        roleId,
        corporateId: 0,
        statusId: 0,
      }
  );

  // all sample  of patient investigation
  const getLaboratoryHelpData = async (customFilters?: FilterTypeItem) => {
    const activeFilters = customFilters || filtersRef.current || filters;
    filtersRef.current = activeFilters;
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.SEARCH_PATIENT_INVESTIGATION_FOR_LABORATORY_HELP_DESK,
      {},
      { params: activeFilters },
      { component: "LaboratoryHelp" }
    );
    if (!resp?.result) {
      setUhidGroupedLaboratoryHelpDeskList([]);
      setSampleWiseGroupedLaboratoryHelpDeskList([]);
      setUpdatedLaboratoryHelpDeskList([]);
      setLaboratoryHelpDeskList([]);
      cachedDataRef.current = [];
      showWarning(resp?.message ?? "No data found!");
      return;
    }
    const data = resp?.data ?? [];
    cachedDataRef.current = data;
    setLaboratoryHelpDeskList(data);
    setUpdatedLaboratoryHelpDeskList(data);
  };

  useEffect(() => {
    getLaboratoryHelpData(filtersRef.current || undefined);
  }, [filters]);

  // sample type
  const getAllSampleType = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_ALL_SAMPLE_TYPE_MASTER,
      {},
      {},
      { component: "SampleType", silent: true }
    );

    setSampleType(resp?.data ?? []);
  };

  useEffect(() => {
    getAllSampleType();
  }, []);

  // search handler
  const searchHandler = (customFilters?: FilterTypeItem) => {
    if (customFilters) {
      filtersRef.current = customFilters;
      setFilters(customFilters);
    }
    getLaboratoryHelpData(customFilters);
  };

  // stats
  const statsValue = useMemo(() => {
    let collectionPending = 0;
    let sampleCollected = 0;
    let sampleRejected = 0;
    let departmentReceivingPending = 0;
    let departmentReceived = 0;
    let resultPending = 0;
    let reportApprovalPending = 0;
    let hold = 0;
    let approved = 0;
    let dispatched = 0;
    let printed = 0;
    let urgent = 0;
    let abnormal = 0;

    laboratoryHelpDeskList.forEach(item => {
      const isCollected = Number(item?.IsSampleCollected) === 1;
      const isRejected = Number(item?.isSampleRejected) === 1;

      if (!isCollected && !isRejected) collectionPending++;
      if (isCollected && !isRejected) sampleCollected++;
      if (isRejected) sampleRejected++;
      if (Number(item?.IsSampleReceivedByDepartment) === 0) departmentReceivingPending++;
      if (Number(item?.IsSampleReceivedByDepartment) === 1) departmentReceived++;
      if (Number(item?.IsResultDone) === 0) resultPending++;
      if (Number(item?.IsReportApproved) === 0) reportApprovalPending++;
      if (Number(item?.IsReportHold) === 1) hold++;
      if (Number(item?.IsReportApproved) === 1) approved++;
      if (Number(item?.IsDispatched) === 1) dispatched++;
      if (Number(item?.isReportPrinted) === 1) printed++;
      if (Number(item?.isUrgent) === 1) urgent++;
      if (Number(item?.IsAbnormalResult) === 1) abnormal++;
    });

    return {
      all: laboratoryHelpDeskList.length,
      collectionPending,
      sampleCollected,
      sampleRejected,
      departmentReceivingPending,
      departmentReceived,
      resultPending,
      reportApprovalPending,
      hold,
      approved,
      dispatched,
      printed,
      urgent,
      abnormal,
      // backwards compatibility aliases
      pending: collectionPending,
      collected: sampleCollected,
      received: departmentReceived,
      rejected: sampleRejected,
    };
  }, [laboratoryHelpDeskList]);

  const handleActionClick = actionName => {
    alert(`${actionName} clicked`);
  };

  // button click handler
  const buttonClickHandler = (buttonType: string) => {
    switch (buttonType) {
      case labSampleManagementButtonClicked.ALL_CLICKED: {
        setUpdatedLaboratoryHelpDeskList(laboratoryHelpDeskList);
        break;
      }
      case labSampleManagementButtonClicked?.COLLECTION_PENDING_CLICKED: {
        const samplepending = laboratoryHelpDeskList.filter(
          item => Number(item?.IsSampleCollected) === 0 && Number(item?.isSampleRejected) === 0
        );
        setUpdatedLaboratoryHelpDeskList(samplepending);
        break;
      }
      case labSampleManagementButtonClicked?.SAMPLE_COLLECTED_CLICKED: {
        const sampleCollected = laboratoryHelpDeskList.filter(
          item => Number(item?.IsSampleCollected) === 1 && Number(item?.isSampleRejected) === 0
        );
        setUpdatedLaboratoryHelpDeskList(sampleCollected);
        break;
      }
      case labSampleManagementButtonClicked.SAMPLE_REJECTED_CLICKED: {
        const sampleRejected = laboratoryHelpDeskList.filter(
          item => Number(item?.isSampleRejected) === 1
        );
        setUpdatedLaboratoryHelpDeskList(sampleRejected);
        break;
      }
      case labSampleManagementButtonClicked.DEPARTMENT_RECEIVING_PENDING_CLICKED: {
        const departmentReceivingPending = laboratoryHelpDeskList.filter(
          item => Number(item?.IsSampleReceivedByDepartment) === 0
        );
        setUpdatedLaboratoryHelpDeskList(departmentReceivingPending);
        break;
      }
      case labSampleManagementButtonClicked.DEPARTMENT_RECEIVE_CLICKED: {
        const filteredDepartmentReceive = laboratoryHelpDeskList.filter(
          item =>
            Number(item?.IsSampleReceivedByDepartment) === 1 &&
            Number(item?.IsSampleCollected) === 1
        );
        setUpdatedLaboratoryHelpDeskList(filteredDepartmentReceive);
        break;
      }
      case labSampleManagementButtonClicked.RESULT_PENDING_CLICKED: {
        const filteredSampleTested = laboratoryHelpDeskList.filter(
          item => Number(item?.IsResultDone) === 0
        );
        setUpdatedLaboratoryHelpDeskList(filteredSampleTested);
        break;
      }
      case labSampleManagementButtonClicked.REPORT_APPROVAL_PENDING_CLICKED: {
        const filteredSampleReportApprovalPending = laboratoryHelpDeskList.filter(
          item => Number(item?.IsReportApproved) === 0
        );
        setUpdatedLaboratoryHelpDeskList(filteredSampleReportApprovalPending);
        break;
      }
      case labSampleManagementButtonClicked.HOLD_CLICKED: {
        const filteredSampleHold = laboratoryHelpDeskList.filter(
          item => Number(item?.IsReportHold) === 1
        );
        setUpdatedLaboratoryHelpDeskList(filteredSampleHold);
        break;
      }
      case labSampleManagementButtonClicked.APPROVED_CLICKED: {
        const filteredSampleApproved = laboratoryHelpDeskList.filter(
          item => Number(item?.IsReportApproved) === 1
        );
        setUpdatedLaboratoryHelpDeskList(filteredSampleApproved);
        break;
      }
      case labSampleManagementButtonClicked.DISPATCHED_CLICKED: {
        const filteredSampleDispatched = laboratoryHelpDeskList.filter(
          item => Number(item?.IsDispatched) === 1
        );
        setUpdatedLaboratoryHelpDeskList(filteredSampleDispatched);
        break;
      }
      case labSampleManagementButtonClicked.PRINTED_CLICKED: {
        const filteredSamplePrinted = laboratoryHelpDeskList.filter(
          item => Number(item?.isReportPrinted) === 1
        );
        setUpdatedLaboratoryHelpDeskList(filteredSamplePrinted);
        break;
      }
      case labSampleManagementButtonClicked.URGENT_CLICKED: {
        const filteredSampleUrgent = laboratoryHelpDeskList.filter(
          item => Number(item?.isUrgent) === 1
        );
        setUpdatedLaboratoryHelpDeskList(filteredSampleUrgent);
        break;
      }
      case labSampleManagementButtonClicked.ABNORMAL_CLICKED: {
        const filteredSampleAbnormal = laboratoryHelpDeskList.filter(
          item => Number(item?.IsAbnormalResult) === 1
        );
        setUpdatedLaboratoryHelpDeskList(filteredSampleAbnormal);
        break;
      }
      default:
        setUpdatedLaboratoryHelpDeskList(laboratoryHelpDeskList);
        break;
    }
  };

  return (
    <div className="page-container">
      <div className="flex w-full items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="page-heading">Laboratory Help</h1>

          <nav className="helper-text">
            Home
            <span>››</span>
            <span>Laboratory Help</span>
          </nav>
        </div>

        {/* action button */}
        {/* <div className="flex shrink-0 items-center justify-end">
          <div className="flex flex-nowrap items-center gap-2 whitespace-nowrap">
            <button
              type="button"
              onClick={() => handleActionClick("Select Center")}
              className="save-btn flex shrink-0 items-center gap-1"
            >
              <Building2 size={15} strokeWidth={2.5} />

              <span>Center</span>
            </button>

            <button
              type="button"
              onClick={() => handleActionClick("New Sample")}
              className="save-btn flex shrink-0 items-center gap-1"
            >
              <Plus size={15} strokeWidth={2.5} />

              <span>New Sample</span>
            </button>

            <button
              type="button"
              onClick={() => handleActionClick("Scan Barcode")}
              className="save-btn flex shrink-0 items-center gap-1"
            >
              <Barcode size={16} strokeWidth={2} />

              <span>Scan Barcode</span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/bulk-receive")}
              className="save-btn flex shrink-0 items-center gap-1"
            >
              <Upload size={15} strokeWidth={2} />

              <span>Bulk Receive</span>
            </button>

            <button
              type="button"
              onClick={() => handleActionClick("Export")}
              className="save-btn flex shrink-0 items-center gap-1"
            >
              <Download size={15} strokeWidth={2} />

              <span>Export</span>

              <ChevronDown size={13} />
            </button>
          </div>
        </div> */}
      </div>

      {/* data */}

      <FilterBar statsValue={statsValue} onCardClick={buttonClickHandler} />

      <SearchBar
        filters={filters}
        setFilters={setFilters}
        onClick={searchHandler}
        onFilterButtonClick={buttonClickHandler}
        setViewMode={setViewMode}
        laboratoryHelpDeskList={laboratoryHelpDeskList}
        updatedLaboratoryHelpDeskList={updatedLaboratoryHelpDeskList}
      />

      <TableData
        updatedLaboratoryHelpDeskList={updatedLaboratoryHelpDeskList}
        setUpdatedLaboratoryHelpDeskList={setUpdatedLaboratoryHelpDeskList}
        sampleType={sampleType}
        refetchSampleManagement={getLaboratoryHelpData}
        uhidGroupedLaboratoryHelpDeskList={uhidGroupedLaboratoryHelpDeskList}
        sampleWiseGroupedLaboratoryHelpDeskList={sampleWiseGroupedLaboratoryHelpDeskList}
        setUhidGroupedLaboratoryHelpDeskList={setUhidGroupedLaboratoryHelpDeskList}
        setSampleWiseGroupedLaboratoryHelpDeskList={setSampleWiseGroupedLaboratoryHelpDeskList}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default LaboratoryHelp;
