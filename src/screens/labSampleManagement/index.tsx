import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { labSampleManagementButtonClicked } from "@/constants/constants";
import { BranchContext } from "@/context/BranchContext";
import { RoleContext } from "@/context/RoleContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showWarning } from "@/utils/alert";
import { Barcode, Building2, ChevronDown, Download, Plus, Upload } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FilterBar from "./components/FilterBar";
import SearchBar from "./components/SearchBar";
import TableData from "./components/TableData";
import {
  FilterTypeItem,
  GroupedDataSampleManagement,
  SampleManagementItem,
  SampleTypeItem,
  ViewMode,
} from "./types";

const LabSampleManagement = () => {
  const { loading, fetchApi } = useGlobalApi();
  const navigate = useNavigate();
  const currentDate = new Date().toISOString().split("T")[0];
  const roleId = useContext(RoleContext)?.roleId!;
  const branchId = useContext(BranchContext)?.branchId;

  const [sampleManagementList, setSampleManagementList] = useState<SampleManagementItem[]>([]);
  const [updatedSampleManagementList, setUpdatedSampleManagementList] = useState<
    SampleManagementItem[]
  >([]);

  const [uhidGroupedSampleManagementList, setUhidGroupedSampleManagementList] = useState<
    GroupedDataSampleManagement[]
  >([]);

  const [sampleWiseGroupedSampleManagementList, setSampleWiseGroupedSampleManagementList] =
    useState<GroupedDataSampleManagement[]>([]);

  const [sampleType, setSampleType] = useState<SampleTypeItem[]>([]);

  const [viewMode, setViewMode] = useState<ViewMode>("test");

  const [filters, setFilters] = useState<FilterTypeItem>({
    barCode: "",
    patientName: "",
    uhid: "",
    sampleType: "",
    status: "",
    fromDate: currentDate,
    toDate: currentDate,
    priority: "",
    corporateId: "0",
    typeId: 0,
    roleId,
    branchId,
    subSubCategoryId: 0,
  });

  // all sample  of patient investigation
  const getSampleManagement = async (customFilters?: FilterTypeItem) => {
    const activeFilters = customFilters || filters;
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.SEARCH_PATIENT_INVESTIGATION_FOR_SAMPLE_MANAGEMENT,
      {},
      { params: activeFilters },
      { component: "LabSampleManagement" }
    );
    if (!resp?.result) {
      setUhidGroupedSampleManagementList([]);
      setSampleWiseGroupedSampleManagementList([]);
      setUpdatedSampleManagementList([]);
      setSampleManagementList([]);
      showWarning(resp?.message ?? "No data found!");
      return;
    }
    setSampleManagementList(resp?.data ?? []);
    setUpdatedSampleManagementList(resp?.data ?? []);
  };

  useEffect(() => {
    getSampleManagement();
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
    getSampleManagement(customFilters);
  };

  // stats
  const statsValue = useMemo(() => {
    let all = 0;
    let pending = 0;
    let collected = 0;
    let received = 0;
    let rejected = 0;
    let totalSampleonCurrentDate = 0;
    let totalSampleOnLastWeek = 0;

    const lastWeekDate = new Date();
    lastWeekDate.setDate(lastWeekDate.getDate() - 7);
    const lastWeekDateStr = lastWeekDate.toISOString().split("T")[0];

    sampleManagementList.forEach(item => {
      if (Number(item?.IsSampleCollected) === 0 && Number(item?.isSampleRejected) === 0) pending++;
      if (Number(item?.IsSampleCollected) === 1 && Number(item?.isSampleRejected) === 0)
        collected++;
      if (Number(item?.IsSampleReceivedByDepartment) === 1) received++;
      if (Number(item?.isSampleRejected) === 1) rejected++;
      // const formattedBillDate = formatToYYYYMMDD(item?.BillDate) || item?.BillDate || "";
      // if (formattedBillDate === currentDate || item?.BillDate?.includes(currentDate)) {
      //   totalSampleonCurrentDate++;
      // }
      // if (formattedBillDate === lastWeekDateStr || item?.BillDate?.includes(lastWeekDateStr)) {
      //   totalSampleOnLastWeek++;
      // }
    });

    return {
      all: sampleManagementList?.length,
      pending,
      collected,
      received,
      rejected,
      // totalSampleonCurrentDate,
      // totalSampleOnLastWeek,
    };
  }, [sampleManagementList, currentDate]);

  // const totalSample = statsValue?.totalSampleonCurrentDate || 0;

  // const percentageIncreaseOrDecrease = useMemo(() => {
  //   const current = Number(statsValue?.totalSampleonCurrentDate || 0);
  //   const lastWeek = Number(statsValue?.totalSampleOnLastWeek || 0);
  //   const difference = current - lastWeek;

  //   if (!lastWeek || lastWeek === 0) {
  //     return { percentage: "0", type: difference >= 0 ? "increase" : "decrease" };
  //   }

  //   const percentage = (difference / lastWeek) * 100;

  //   if (isNaN(percentage) || !isFinite(percentage)) {
  //     return { percentage: "0", type: "increase" };
  //   }

  //   if (difference < 0) {
  //     return { percentage: Math.abs(percentage).toFixed(2), type: "decrease" };
  //   }
  //   return { percentage: Math.abs(percentage).toFixed(2), type: "increase" };
  // }, [statsValue]);

  const handleActionClick = actionName => {
    alert(`${actionName} clicked`);
  };

  // button click handler
  const buttonClickHandler = (buttonType: string) => {
    switch (buttonType) {
      case labSampleManagementButtonClicked.ALL_CLICKED:
        setUpdatedSampleManagementList(sampleManagementList);
        break;

      case labSampleManagementButtonClicked?.COLLECTION_PENDING_CLICKED:
        const samplepending = sampleManagementList.filter(
          item => Number(item?.IsSampleCollected) === 0 && Number(item?.isSampleRejected) === 0
        );
        setUpdatedSampleManagementList(samplepending);
        break;

      case labSampleManagementButtonClicked?.SAMPLE_COLLECTED_CLICKED:
        const sampleCollected = sampleManagementList.filter(
          item => Number(item?.IsSampleCollected) === 1 && Number(item?.isSampleRejected) === 0
        );
        setUpdatedSampleManagementList(sampleCollected);
        break;

      case labSampleManagementButtonClicked.SAMPLE_REJECTED_CLICKED:
        const sampleRejected = sampleManagementList.filter(
          item => Number(item?.isSampleRejected) === 1
        );
        setUpdatedSampleManagementList(sampleRejected);
        break;

      case labSampleManagementButtonClicked.DEPARTMENT_RECEIVING_PENDING_CLICKED:
        const departmentReceivingPending = sampleManagementList.filter(
          item => Number(item?.IsSampleReceivedByDepartment) === 0
        );
        setUpdatedSampleManagementList(departmentReceivingPending);
        break;

      case labSampleManagementButtonClicked.DEPARTMENT_RECEIVE_CLICKED:
        const filteredDepartmentReceive = sampleManagementList.filter(
          item =>
            Number(item?.IsSampleReceivedByDepartment) === 1 &&
            Number(item?.IsSampleCollected === 1)
        );
        setUpdatedSampleManagementList(filteredDepartmentReceive);
        break;

      case labSampleManagementButtonClicked.RESULT_PENDING_CLICKED:
        const filteredSampleTested = sampleManagementList.filter(
          item => Number(item?.IsResultDone) === 0
        );
        setUpdatedSampleManagementList(filteredSampleTested);
        break;

      case labSampleManagementButtonClicked.REPORT_APPROVAL_PENDING_CLICKED:
        const filteredSampleReportApprovalPending = sampleManagementList.filter(
          item => Number(item?.IsReportApproved) === 0
        );
        setUpdatedSampleManagementList(filteredSampleReportApprovalPending);
        break;

      case labSampleManagementButtonClicked.HOLD_CLICKED:
        const filteredSampleHold = sampleManagementList.filter(
          item => Number(item?.IsReportHold) === 1
        );
        setUpdatedSampleManagementList(filteredSampleHold);
        break;

      case labSampleManagementButtonClicked.APPROVED_CLICKED:
        const filteredSampleApproved = sampleManagementList.filter(
          item => Number(item?.IsReportApproved) === 1
        );
        setUpdatedSampleManagementList(filteredSampleApproved);
        break;

      case labSampleManagementButtonClicked.DISPATCHED_CLICKED:
        const filteredSampleDispatched = sampleManagementList.filter(
          item => Number(item?.IsDispatched) === 1
        );
        setUpdatedSampleManagementList(filteredSampleDispatched);
        break;

      case labSampleManagementButtonClicked.PRINTED_CLICKED:
        const filteredSamplePrinted = sampleManagementList.filter(
          item => Number(item?.IsReportPrinted) === 1
        );
        setUpdatedSampleManagementList(filteredSamplePrinted);
        break;

      case labSampleManagementButtonClicked.URGENT_CLICKED:
        const filteredSampleUrgent = sampleManagementList.filter(
          item => Number(item?.isUrgent) === 1
        );
        setUpdatedSampleManagementList(filteredSampleUrgent);
        break;

      case labSampleManagementButtonClicked.ABNORMAL_CLICKED:
        const filteredSampleAbnormal = sampleManagementList.filter(
          item => Number(item?.IsAbnormal) === 1
        );
        setUpdatedSampleManagementList(filteredSampleAbnormal);
        break;

      default:
        setUpdatedSampleManagementList(sampleManagementList);
        break;
    }
  };

  return (
    <div className="page-container">
      <div className="flex w-full items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="page-heading">Lab Sample Management</h1>

          <nav className="helper-text">
            Home
            <span>››</span>
            <span>Lab Sample Management</span>
          </nav>
        </div>

        {/* action button */}
        <div className="flex shrink-0 items-center justify-end">
          <div className="flex flex-nowrap items-center gap-2 whitespace-nowrap">
            {/* Choose Center */}
            <button
              type="button"
              onClick={() => handleActionClick("Select Center")}
              className="save-btn flex shrink-0 items-center gap-1"
            >
              <Building2 size={15} strokeWidth={2.5} />

              <span>Center</span>
            </button>

            {/* New Sample */}
            <button
              type="button"
              onClick={() => handleActionClick("New Sample")}
              className="save-btn flex shrink-0 items-center gap-1"
            >
              <Plus size={15} strokeWidth={2.5} />

              <span>New Sample</span>
            </button>

            {/* Scan Barcode */}
            <button
              type="button"
              onClick={() => handleActionClick("Scan Barcode")}
              className="save-btn flex shrink-0 items-center gap-1"
            >
              <Barcode size={16} strokeWidth={2} />

              <span>Scan Barcode</span>
            </button>

            {/* Bulk Receive */}
            <button
              type="button"
              onClick={() => navigate("/bulk-receive")}
              className="save-btn flex shrink-0 items-center gap-1"
            >
              <Upload size={15} strokeWidth={2} />

              <span>Bulk Receive</span>
            </button>

            {/* Export */}
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
        </div>
      </div>

      {/* data */}

      <FilterBar
        totalSample={sampleManagementList?.length}
        // percentageIncreaseOrDecrease={percentageIncreaseOrDecrease}
        statsValue={statsValue}
      />

      <SearchBar
        filters={filters}
        setFilters={setFilters}
        onClick={searchHandler}
        onFilterButtonClick={buttonClickHandler}
        setViewMode={setViewMode}
        sampleManagementList={sampleManagementList}
        updatedSampleManagementList={updatedSampleManagementList}
      />

      <TableData
        updatedSampleManagementList={updatedSampleManagementList}
        setUpdatedSampleManagementList={setUpdatedSampleManagementList}
        sampleType={sampleType}
        refetchSampleManagement={getSampleManagement}
        uhidGroupedSampleManagementList={uhidGroupedSampleManagementList}
        sampleWiseGroupedSampleManagementList={sampleWiseGroupedSampleManagementList}
        setUhidGroupedSampleManagementList={setUhidGroupedSampleManagementList}
        setSampleWiseGroupedSampleManagementList={setSampleWiseGroupedSampleManagementList}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default LabSampleManagement;
