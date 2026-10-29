import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { labSampleManagementButtonClicked } from "@/constants/constants";
import { BranchContext } from "@/context/BranchContext";
import { RoleContext } from "@/context/RoleContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showWarning } from "@/utils/alert";
import { useContext, useEffect, useMemo, useState } from "react";
import FilterBar from "./components/FilterBar";
import SearchBar from "./components/SearchBar";
import TableData from "./components/TableData";
import {
  FilterTypeItem,
  GroupedDataResultEntryRadiology,
  ResultEntryRadiologyItem,
  SampleTypeItem,
  ViewMode,
} from "./types";

const filtersRef: { current: FilterTypeItem | null } = { current: null };
const cachedDataRef: { current: ResultEntryRadiologyItem[] | null } = { current: null };

const ResultEntryRadiology = () => {
  const { loading, fetchApi } = useGlobalApi();
  const currentDate = new Date().toISOString().split("T")[0];
  const roleId = useContext(RoleContext)?.roleId ?? 0;
  const branchId = useContext(BranchContext)?.branchId;

  const [resultEntryRadiologyList, setResultEntryRadiologyList] = useState<
    ResultEntryRadiologyItem[]
  >(() => cachedDataRef.current || []);
  const [updatedResultEntryRadiologyList, setUpdatedResultEntryRadiologyList] = useState<
    ResultEntryRadiologyItem[]
  >(() => cachedDataRef.current || []);

  const [uhidGroupedResultEntryRadiologyList, setUhidGroupedResultEntryRadiologyList] = useState<
    GroupedDataResultEntryRadiology[]
  >([]);

  const [sampleWiseGroupedResultEntryRadiologyList, setSampleWiseGroupedResultEntryRadiologyList] =
    useState<GroupedDataResultEntryRadiology[]>([]);

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
  const getResultEntryRadiologyList = async (customFilters?: FilterTypeItem) => {
    const activeFilters = customFilters || filtersRef.current || filters;
    filtersRef.current = activeFilters;
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.SEARCH_PATIENT_INVESTIGATION_FOR_SAMPLE_PROCESSING_RADIOLOGY,
      {},
      { params: activeFilters },
      { component: "ResultEntryRadiology" }
    );
    if (!resp?.result) {
      setUhidGroupedResultEntryRadiologyList([]);
      setSampleWiseGroupedResultEntryRadiologyList([]);
      setUpdatedResultEntryRadiologyList([]);
      setResultEntryRadiologyList([]);
      cachedDataRef.current = [];
      showWarning(resp?.message ?? "No data found!");
      return;
    }
    const data = resp?.data ?? [];
    cachedDataRef.current = data;
    setResultEntryRadiologyList(data);
    setUpdatedResultEntryRadiologyList(data);
  };

  useEffect(() => {
    getResultEntryRadiologyList(filtersRef.current || undefined);
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
    getResultEntryRadiologyList(customFilters);
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

    resultEntryRadiologyList.forEach(item => {
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
      all: resultEntryRadiologyList.length,
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
  }, [resultEntryRadiologyList]);

  // button click handler
  const buttonClickHandler = (buttonType: string) => {
    switch (buttonType) {
      case labSampleManagementButtonClicked.ALL_CLICKED: {
        setUpdatedResultEntryRadiologyList(resultEntryRadiologyList);
        break;
      }
      case labSampleManagementButtonClicked?.COLLECTION_PENDING_CLICKED: {
        const samplepending = resultEntryRadiologyList.filter(
          item => Number(item?.IsSampleCollected) === 0 && Number(item?.isSampleRejected) === 0
        );
        setUpdatedResultEntryRadiologyList(samplepending);
        break;
      }
      case labSampleManagementButtonClicked?.SAMPLE_COLLECTED_CLICKED: {
        const sampleCollected = resultEntryRadiologyList.filter(
          item => Number(item?.IsSampleCollected) === 1 && Number(item?.isSampleRejected) === 0
        );
        setUpdatedResultEntryRadiologyList(sampleCollected);
        break;
      }
      case labSampleManagementButtonClicked.SAMPLE_REJECTED_CLICKED: {
        const sampleRejected = resultEntryRadiologyList.filter(
          item => Number(item?.isSampleRejected) === 1
        );
        setUpdatedResultEntryRadiologyList(sampleRejected);
        break;
      }
      case labSampleManagementButtonClicked.DEPARTMENT_RECEIVING_PENDING_CLICKED: {
        const departmentReceivingPending = resultEntryRadiologyList.filter(
          item => Number(item?.IsSampleReceivedByDepartment) === 0
        );
        setUpdatedResultEntryRadiologyList(departmentReceivingPending);
        break;
      }
      case labSampleManagementButtonClicked.DEPARTMENT_RECEIVE_CLICKED: {
        const filteredDepartmentReceive = resultEntryRadiologyList.filter(
          item =>
            Number(item?.IsSampleReceivedByDepartment) === 1 &&
            Number(item?.IsSampleCollected) === 1
        );
        setUpdatedResultEntryRadiologyList(filteredDepartmentReceive);
        break;
      }
      case labSampleManagementButtonClicked.RESULT_PENDING_CLICKED: {
        const filteredSampleTested = resultEntryRadiologyList.filter(
          item => Number(item?.IsResultDone) === 0
        );
        setUpdatedResultEntryRadiologyList(filteredSampleTested);
        break;
      }
      case labSampleManagementButtonClicked.REPORT_APPROVAL_PENDING_CLICKED: {
        const filteredSampleReportApprovalPending = resultEntryRadiologyList.filter(
          item => Number(item?.IsReportApproved) === 0
        );
        setUpdatedResultEntryRadiologyList(filteredSampleReportApprovalPending);
        break;
      }
      case labSampleManagementButtonClicked.HOLD_CLICKED: {
        const filteredSampleHold = resultEntryRadiologyList.filter(
          item => Number(item?.IsReportHold) === 1
        );
        setUpdatedResultEntryRadiologyList(filteredSampleHold);
        break;
      }
      case labSampleManagementButtonClicked.APPROVED_CLICKED: {
        const filteredSampleApproved = resultEntryRadiologyList.filter(
          item => Number(item?.IsReportApproved) === 1
        );
        setUpdatedResultEntryRadiologyList(filteredSampleApproved);
        break;
      }
      case labSampleManagementButtonClicked.DISPATCHED_CLICKED: {
        const filteredSampleDispatched = resultEntryRadiologyList.filter(
          item => Number(item?.IsDispatched) === 1
        );
        setUpdatedResultEntryRadiologyList(filteredSampleDispatched);
        break;
      }
      case labSampleManagementButtonClicked.PRINTED_CLICKED: {
        const filteredSamplePrinted = resultEntryRadiologyList.filter(
          item => Number(item?.isReportPrinted) === 1
        );
        setUpdatedResultEntryRadiologyList(filteredSamplePrinted);
        break;
      }
      case labSampleManagementButtonClicked.URGENT_CLICKED: {
        const filteredSampleUrgent = resultEntryRadiologyList.filter(
          item => Number(item?.isUrgent) === 1
        );
        setUpdatedResultEntryRadiologyList(filteredSampleUrgent);
        break;
      }
      case labSampleManagementButtonClicked.ABNORMAL_CLICKED: {
        const filteredSampleAbnormal = resultEntryRadiologyList.filter(
          item => Number(item?.IsAbnormalResult) === 1
        );
        setUpdatedResultEntryRadiologyList(filteredSampleAbnormal);
        break;
      }
      default:
        setUpdatedResultEntryRadiologyList(resultEntryRadiologyList);
        break;
    }
  };

  return (
    <div className="page-container">
      <div className="flex w-full items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="page-heading">Result Entry Radiology</h1>

          <nav className="helper-text">
            Home
            <span>››</span>
            <span>Result Entry Radiology</span>
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
        resultEntryRadiologyList={resultEntryRadiologyList}
        updatedResultEntryRadiologyList={updatedResultEntryRadiologyList}
      />

      <TableData
        updatedResultEntryRadiologyList={updatedResultEntryRadiologyList}
        setUpdatedResultEntryRadiologyList={setUpdatedResultEntryRadiologyList}
        sampleType={sampleType}
        refetchSampleManagement={getResultEntryRadiologyList}
        uhidGroupedResultEntryRadiologyList={uhidGroupedResultEntryRadiologyList}
        sampleWiseGroupedResultEntryRadiologyList={sampleWiseGroupedResultEntryRadiologyList}
        setUhidGroupedResultEntryRadiologyList={setUhidGroupedResultEntryRadiologyList}
        setSampleWiseGroupedResultEntryRadiologyList={setSampleWiseGroupedResultEntryRadiologyList}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default ResultEntryRadiology;
