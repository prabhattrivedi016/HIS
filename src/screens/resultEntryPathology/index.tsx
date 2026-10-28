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
  GroupedDataResultEntryPathology,
  ResultEntryPathologyItem,
  SampleTypeItem,
  ViewMode,
} from "./types";

const filtersRef: { current: FilterTypeItem | null } = { current: null };
const cachedDataRef: { current: ResultEntryPathologyItem[] | null } = { current: null };

const ResultEntryPathology = () => {
  const { loading, fetchApi } = useGlobalApi();
  const navigate = useNavigate();
  const currentDate = new Date().toISOString().split("T")[0];
  const roleId = useContext(RoleContext)?.roleId ?? 0;
  const branchId = useContext(BranchContext)?.branchId;

  const [resultEntryPathologyList, setResultEntryPathologyList] = useState<
    ResultEntryPathologyItem[]
  >(() => cachedDataRef.current || []);
  const [updatedResultEntryPathologyList, setUpdatedResultEntryPathologyList] = useState<
    ResultEntryPathologyItem[]
  >(() => cachedDataRef.current || []);

  const [uhidGroupedResultEntryPathologyList, setUhidGroupedResultEntryPathologyList] = useState<
    GroupedDataResultEntryPathology[]
  >([]);

  const [sampleWiseGroupedResultEntryPathologyList, setSampleWiseGroupedResultEntryPathologyList] =
    useState<GroupedDataResultEntryPathology[]>([]);

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
        canSampleCollect: 0,
      }
  );

  // all sample  of patient investigation
  const getResultEntryPathologyList = async (customFilters?: FilterTypeItem) => {
    const activeFilters = customFilters || filtersRef.current || filters;
    filtersRef.current = activeFilters;
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.SEARCH_PATIENT_INVESTIGATION_FOR_SAMPLE_PROCESSING_PATHOLOGY,
      {},
      { params: activeFilters },
      { component: "ResultEntryPathology" }
    );
    if (!resp?.result) {
      setUhidGroupedResultEntryPathologyList([]);
      setSampleWiseGroupedResultEntryPathologyList([]);
      setUpdatedResultEntryPathologyList([]);
      setResultEntryPathologyList([]);
      cachedDataRef.current = [];
      showWarning(resp?.message ?? "No data found!");
      return;
    }
    const data = resp?.data ?? [];
    cachedDataRef.current = data;
    setResultEntryPathologyList(data);
    setUpdatedResultEntryPathologyList(data);
  };

  useEffect(() => {
    getResultEntryPathologyList(filtersRef.current || undefined);
  }, []);

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
    getResultEntryPathologyList(customFilters);
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

    resultEntryPathologyList.forEach(item => {
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
      all: resultEntryPathologyList.length,
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
  }, [resultEntryPathologyList]);

  const handleActionClick = (actionName: string) => {
    alert(`${actionName} clicked`);
  };

  // button click handler
  const buttonClickHandler = (buttonType: string) => {
    switch (buttonType) {
      case labSampleManagementButtonClicked.ALL_CLICKED: {
        setUpdatedResultEntryPathologyList(resultEntryPathologyList);
        break;
      }
      case labSampleManagementButtonClicked?.COLLECTION_PENDING_CLICKED: {
        const samplepending = resultEntryPathologyList.filter(
          item => Number(item?.IsSampleCollected) === 0 && Number(item?.isSampleRejected) === 0
        );
        setUpdatedResultEntryPathologyList(samplepending);
        break;
      }
      case labSampleManagementButtonClicked?.SAMPLE_COLLECTED_CLICKED: {
        const sampleCollected = resultEntryPathologyList.filter(
          item => Number(item?.IsSampleCollected) === 1 && Number(item?.isSampleRejected) === 0
        );
        setUpdatedResultEntryPathologyList(sampleCollected);
        break;
      }
      case labSampleManagementButtonClicked.SAMPLE_REJECTED_CLICKED: {
        const sampleRejected = resultEntryPathologyList.filter(
          item => Number(item?.isSampleRejected) === 1
        );
        setUpdatedResultEntryPathologyList(sampleRejected);
        break;
      }
      case labSampleManagementButtonClicked.DEPARTMENT_RECEIVING_PENDING_CLICKED: {
        const departmentReceivingPending = resultEntryPathologyList.filter(
          item => Number(item?.IsSampleReceivedByDepartment) === 0
        );
        setUpdatedResultEntryPathologyList(departmentReceivingPending);
        break;
      }
      case labSampleManagementButtonClicked.DEPARTMENT_RECEIVE_CLICKED: {
        const filteredDepartmentReceive = resultEntryPathologyList.filter(
          item =>
            Number(item?.IsSampleReceivedByDepartment) === 1 &&
            Number(item?.IsSampleCollected) === 1
        );
        setUpdatedResultEntryPathologyList(filteredDepartmentReceive);
        break;
      }
      case labSampleManagementButtonClicked.RESULT_PENDING_CLICKED: {
        const filteredSampleTested = resultEntryPathologyList.filter(
          item => Number(item?.IsResultDone) === 0
        );
        setUpdatedResultEntryPathologyList(filteredSampleTested);
        break;
      }
      case labSampleManagementButtonClicked.REPORT_APPROVAL_PENDING_CLICKED: {
        const filteredSampleReportApprovalPending = resultEntryPathologyList.filter(
          item => Number(item?.IsReportApproved) === 0
        );
        setUpdatedResultEntryPathologyList(filteredSampleReportApprovalPending);
        break;
      }
      case labSampleManagementButtonClicked.HOLD_CLICKED: {
        const filteredSampleHold = resultEntryPathologyList.filter(
          item => Number(item?.IsReportHold) === 1
        );
        setUpdatedResultEntryPathologyList(filteredSampleHold);
        break;
      }
      case labSampleManagementButtonClicked.APPROVED_CLICKED: {
        const filteredSampleApproved = resultEntryPathologyList.filter(
          item => Number(item?.IsReportApproved) === 1
        );
        setUpdatedResultEntryPathologyList(filteredSampleApproved);
        break;
      }
      case labSampleManagementButtonClicked.DISPATCHED_CLICKED: {
        const filteredSampleDispatched = resultEntryPathologyList.filter(
          item => Number(item?.IsDispatched) === 1
        );
        setUpdatedResultEntryPathologyList(filteredSampleDispatched);
        break;
      }
      case labSampleManagementButtonClicked.PRINTED_CLICKED: {
        const filteredSamplePrinted = resultEntryPathologyList.filter(
          item => Number(item?.isReportPrinted) === 1
        );
        setUpdatedResultEntryPathologyList(filteredSamplePrinted);
        break;
      }
      case labSampleManagementButtonClicked.URGENT_CLICKED: {
        const filteredSampleUrgent = resultEntryPathologyList.filter(
          item => Number(item?.isUrgent) === 1
        );
        setUpdatedResultEntryPathologyList(filteredSampleUrgent);
        break;
      }
      case labSampleManagementButtonClicked.ABNORMAL_CLICKED: {
        const filteredSampleAbnormal = resultEntryPathologyList.filter(
          item => Number(item?.IsAbnormalResult) === 1
        );
        setUpdatedResultEntryPathologyList(filteredSampleAbnormal);
        break;
      }
      default:
        setUpdatedResultEntryPathologyList(resultEntryPathologyList);
        break;
    }
  };

  return (
    <div className="page-container">
      <div className="flex w-full items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="page-heading">Result Entry Pathology</h1>

          <nav className="helper-text">
            Home
            <span>››</span>
            <span>Result Entry Pathology</span>
          </nav>
        </div>
      </div>

      {/* data */}

      <FilterBar statsValue={statsValue} onCardClick={buttonClickHandler} />

      <SearchBar
        filters={filters}
        setFilters={setFilters}
        onClick={searchHandler}
        onFilterButtonClick={buttonClickHandler}
        setViewMode={setViewMode}
        resultEntryPathologyList={resultEntryPathologyList}
        updatedResultEntryPathologyList={updatedResultEntryPathologyList}
      />

      <TableData
        updatedResultEntryPathologyList={updatedResultEntryPathologyList}
        setUpdatedResultEntryPathologyList={setUpdatedResultEntryPathologyList}
        sampleType={sampleType}
        refetchSampleManagement={getResultEntryPathologyList}
        uhidGroupedResultEntryPathologyList={uhidGroupedResultEntryPathologyList}
        sampleWiseGroupedResultEntryPathologyList={sampleWiseGroupedResultEntryPathologyList}
        setUhidGroupedResultEntryPathologyList={setUhidGroupedResultEntryPathologyList}
        setSampleWiseGroupedResultEntryPathologyList={setSampleWiseGroupedResultEntryPathologyList}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default ResultEntryPathology;
