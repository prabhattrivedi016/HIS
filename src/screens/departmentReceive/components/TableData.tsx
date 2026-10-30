import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { encryptRouteId } from "@/utils/routeEncryption";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Eye, File, MoreVertical, Plus, Printer, RotateCw, Search, Settings } from "lucide-react";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  ColumnItem,
  GroupedDataSampleManagement,
  SampleManagementItem,
  SampleTypeItem,
  ViewMode,
} from "../types";
import AddRemarkPopup from "./AddRemarkPopup";
import RejectSamplePopup from "./RejectSamplePopup";
import SampleCollection from "./SampleCollection";
import UploadDocument from "./UploadDocument";

interface SortableColumnItemProps {
  col: ColumnItem;
  updateColumnVisibility: (e: ChangeEvent<HTMLInputElement>, col: ColumnItem) => void;
}

const SortableColumnItem = ({ col, updateColumnVisibility }: SortableColumnItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: col.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex cursor-grab items-center gap-3 rounded-md px-1 py-1 text-sm text-gray-700 transition-colors hover:bg-blue-50 active:cursor-grabbing select-none"
    >
      <input
        type="checkbox"
        id={`column-${col.id}`}
        checked={col.isChecked}
        onPointerDown={e => e.stopPropagation()}
        onChange={e => updateColumnVisibility(e, col)}
        className="input-checkbox cursor-pointer"
      />

      <span className="min-w-0 flex-1 break-words cursor-pointer">{col.tableHeaderName}</span>
    </div>
  );
};

const columnVisibilityTableValue = [
  { isChecked: true, tableHeaderName: "Time Line", id: 1 },
  { isChecked: true, tableHeaderName: "Lab No", id: 2 },
  { isChecked: true, tableHeaderName: "Bill Date", id: 3 },
  { isChecked: true, tableHeaderName: "UHID", id: 4 },
  { isChecked: true, tableHeaderName: "Patient Name", id: 5 },
  { isChecked: true, tableHeaderName: "Age / Gender", id: 6 },
  { isChecked: true, tableHeaderName: "Corporate", id: 7 },
  { isChecked: true, tableHeaderName: "Test(s)", id: 8 },
  { isChecked: true, tableHeaderName: "Sample Type", id: 9 },
  { isChecked: true, tableHeaderName: "Barcode", id: 10 },
  { isChecked: true, tableHeaderName: "Collection Time", id: 11 },
  { isChecked: true, tableHeaderName: "Segregation Time", id: 12 },
  { isChecked: true, tableHeaderName: "Received Time", id: 13 },
  { isChecked: true, tableHeaderName: "Priority", id: 14 },
  { isChecked: true, tableHeaderName: "Status", id: 15 },
  { isChecked: true, tableHeaderName: "IPD No/Beds", id: 16 },
];

// value match search helper
const valueMatchesSearch = (value: unknown, query: string): boolean => {
  if (value === null || value === undefined) return false;

  if (Array.isArray(value)) {
    return value.some(item => valueMatchesSearch(item, query));
  }

  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).some(item =>
      valueMatchesSearch(item, query)
    );
  }

  return String(value).toLowerCase().includes(query);
};

// parse TAT minutes from number or string like "60", "120 min", "2 hrs"
const parseMinutes = (val: unknown): number => {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  const str = String(val).trim();
  if (!str || str === "-") return 0;
  if (/hr|hour/i.test(str)) {
    const num = parseFloat(str);
    return isNaN(num) ? 0 : Math.round(num * 60);
  }
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
};

// Evaluate timeline status (Delay vs On Time) based on ActualTAT and ExpectedTAT / TargetTAT given in API
const getTimelineInfo = (
  row: SampleManagementItem
): { label: string; className: string; title: string } => {
  // 1. Explicit timeline string from backend/row if provided
  if (row?.timeLine && row.timeLine !== "-") {
    const lower = row.timeLine.toLowerCase();
    if (lower.includes("delay")) {
      return {
        label: "Delay",
        className: "bg-red-50 text-red-600 border border-red-200",
        title: row.timeLine,
      };
    }
    if (lower.includes("on time") || lower.includes("ontime")) {
      return {
        label: "On Time",
        className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        title: row.timeLine,
      };
    }
    return {
      label: row.timeLine,
      className:
        row.timeLineColor ||
        row.tmeLineColor ||
        "bg-emerald-50 text-emerald-700 border border-emerald-200",
      title: row.timeLine,
    };
  }

  const actualRaw =
    row?.ActualTat ?? row?.ActualTAT ?? row?.actualTat ?? row?.actual_tat ?? row?.ActualTATInMin;

  const expectedRaw =
    row?.ExpectedTat ??
    row?.ExpectedTAT ??
    row?.expectedTat ??
    row?.ExpectedTATInMin ??
    row?.TargetTat ??
    row?.targetTat ??
    row?.TargetTAT ??
    row?.expected_tat ??
    row?.TargetTATInMin;

  // Check if string contains direct status keywords
  if (typeof actualRaw === "string") {
    const lower = actualRaw.trim().toLowerCase();
    if (lower === "delay" || lower.includes("delay")) {
      return {
        label: "Delay",
        className: "bg-red-50 text-red-600 border border-red-200",
        title: actualRaw,
      };
    }
    if (lower === "on time" || lower === "ontime" || lower.includes("on time")) {
      return {
        label: "On Time",
        className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        title: actualRaw,
      };
    }
  }

  if (typeof expectedRaw === "string") {
    const lower = expectedRaw.trim().toLowerCase();
    if (lower === "delay" || lower.includes("delay")) {
      return {
        label: "Delay",
        className: "bg-red-50 text-red-600 border border-red-200",
        title: expectedRaw,
      };
    }
    if (lower === "on time" || lower === "ontime" || lower.includes("on time")) {
      return {
        label: "On Time",
        className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        title: expectedRaw,
      };
    }
  }

  const expectedTat = parseMinutes(expectedRaw);
  const actualTat = parseMinutes(actualRaw);

  // Case A: Both Expected and Actual TAT numbers are available from API
  if (expectedTat > 0 && actualTat > 0) {
    if (actualTat > expectedTat) {
      const diff = actualTat - expectedTat;
      return {
        label: "Delay",
        className: "bg-red-50 text-red-600 border border-red-200",
        title: `Expected: ${expectedTat}m | Actual: ${actualTat}m (Delayed by ${diff}m)`,
      };
    }
    return {
      label: "On Time",
      className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      title: `Expected: ${expectedTat}m | Actual: ${actualTat}m`,
    };
  }

  // Case B: Expected TAT is available in API, but Actual TAT is pending (not yet in API)
  if (expectedTat > 0 && actualTat === 0) {
    return {
      label: "On Time",
      className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      title: `Expected: ${expectedTat}m`,
    };
  }

  // Case C: Actual TAT is recorded in API without expected TAT
  if (actualTat > 0 && expectedTat === 0) {
    return {
      label: "On Time",
      className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      title: `Actual: ${actualTat}m`,
    };
  }

  // Case D: No TAT data configured or available in API
  return {
    label: "-",
    className: "text-gray-400 font-normal",
    title: "",
  };
};

// matches search
const matchesSearch = <T extends object>(row: T, searchValue: string): boolean => {
  const query = searchValue.trim().toLowerCase();

  if (!query) return true;

  // Include computed timeline status in search query match
  const timeline = getTimelineInfo(row as unknown as SampleManagementItem);
  if (timeline.label && timeline.label !== "-" && timeline.label.toLowerCase().includes(query)) {
    return true;
  }

  return Object.values(row).some(value => valueMatchesSearch(value, query));
};

export default function TableData({
  updatedSampleManagementList,
  setUpdatedSampleManagementList,
  sampleType,
  refetchSampleManagement,
  uhidGroupedSampleManagementList,
  sampleWiseGroupedSampleManagementList,
  setUhidGroupedSampleManagementList,
  setSampleWiseGroupedSampleManagementList,
  viewMode,
  setViewMode,
}: {
  updatedSampleManagementList: SampleManagementItem[];
  setUpdatedSampleManagementList: (data: SampleManagementItem[]) => void;
  sampleType: SampleTypeItem[];
  refetchSampleManagement?: () => Promise<void>;
  uhidGroupedSampleManagementList: GroupedDataSampleManagement[];
  sampleWiseGroupedSampleManagementList: GroupedDataSampleManagement[];
  setUhidGroupedSampleManagementList: (data: GroupedDataSampleManagement[]) => void;
  setSampleWiseGroupedSampleManagementList: (data: GroupedDataSampleManagement[]) => void;
  viewMode: ViewMode;
  setViewMode: Dispatch<SetStateAction<ViewMode>>;
}) {
  const { loading, fetchApi } = useGlobalApi();
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState<string>("");

  const [checkedSample, setCheckedSample] = useState<SampleManagementItem[]>([]);

  const [selectedSampleData, setSelelectedSampleData] = useState<SampleManagementItem | null>(null);

  const [renderAddRemarks, setRenderAddRemarks] = useState<boolean>(false);
  const [openAddRemarks, setOpenAddRemarks] = useState<boolean>(false);

  const [renderRejectSample, setRenderRejectSample] = useState<boolean>(false);
  const [openRejectSample, setOpenRejectSample] = useState<boolean>(false);

  const [renderUploadDocument, setRenderUploadDocument] = useState<boolean>(false);
  const [openUploadDocument, setOpenUploadDocument] = useState<boolean>(false);

  const [showColumnVisbility, setShowColumnVisbility] = useState<boolean>(false);
  const [columnVisibilityTable, setColumnVisibilityTable] = useState<ColumnItem[]>(
    columnVisibilityTableValue
  );

  const settingsContainerRef = useRef<HTMLDivElement>(null);
  const [selectedRowForSampleCollect, setSelectedRowForSampleCollect] =
    useState<GroupedDataSampleManagement | null>(null);

  const [openSampleCollect, setOpenSampleCollect] = useState<boolean>(false);
  const [renderSampleCollect, setRenderSampleCollect] = useState<boolean>(false);

  // patient view details
  const handlePatientViewDetails = (row: SampleManagementItem) => {
    if (!row) return;
    const encryptedId = encryptRouteId(row.PatientInvestigationId);
    navigate(`/sample-journey/${encryptedId}`);
  };

  // reject sample
  const handleRejectSample = (row: SampleManagementItem) => {
    if (!row) {
      setSelelectedSampleData(null);
      setOpenRejectSample(false);
      setRenderRejectSample(false);
      return;
    }
    if (Number(row?.isSampleRejected) === 1) {
      showWarning("This sample is already rejected");
      return;
    }
    setOpenRejectSample(true);
    setRenderRejectSample(true);
    setSelelectedSampleData(row);
  };

  // clsoe reject sample
  const closeRejectSample = useCallback(() => {
    setOpenRejectSample(false);
    setRenderRejectSample(false);
    setSelelectedSampleData(null);
  }, []);

  const handlePrintClick = sampleId => {
    alert(`Print clicked for sample: ${sampleId}`);
  };

  // handle upload document
  const handleUploadDocument = (row: SampleManagementItem) => {
    if (!row) {
      setSelelectedSampleData(null);
      setOpenUploadDocument(false);
      setRenderUploadDocument(false);
      return;
    }
    setOpenUploadDocument(true);
    setRenderUploadDocument(true);
    setSelelectedSampleData(row);
  };

  // clsoe upload document
  const closeUploadDocument = useCallback(() => {
    setOpenUploadDocument(false);
    setRenderUploadDocument(false);
    setSelelectedSampleData(null);
  }, []);

  const closeSampleCollection = useCallback(() => {
    setOpenSampleCollect(false);
    setRenderSampleCollect(false);
    setSelelectedSampleData(null);
  }, []);

  // add remark
  const handleAddRemarkClick = (row: SampleManagementItem) => {
    if (!row) {
      setSelelectedSampleData(null);
      setOpenAddRemarks(false);
      setRenderAddRemarks(false);
      return;
    }
    setOpenAddRemarks(true);
    setRenderAddRemarks(true);
    setSelelectedSampleData(row);
  };

  // clsoe add remark
  const closeAddRemarks = useCallback(() => {
    setOpenAddRemarks(false);
    setRenderAddRemarks(false);
    setSelelectedSampleData(null);
  }, []);

  // sample type change handler
  // sample type change handler
  const sampleChangeHandlerRowWise = useCallback(
    (e: ChangeEvent<HTMLSelectElement>, row: SampleManagementItem) => {
      const selectedValue = e.target.value;

      const selectedTypeObj = sampleType.find(
        x => Number(x.sampleTypeId) === Number(selectedValue)
      );

      const selectedTypeName = selectedTypeObj?.sampleType ?? "";

      const updatedList = updatedSampleManagementList.map(item =>
        Number(item.PatientInvestigationId) === Number(row.PatientInvestigationId)
          ? {
              ...item,
              DefaultSampleTypeId: selectedValue === "0" ? null : selectedValue,
              SampleTypeName: selectedTypeName,
            }
          : item
      );

      setCheckedSample(prevList =>
        prevList.map(item =>
          Number(item.PatientInvestigationId) === Number(row.PatientInvestigationId)
            ? {
                ...item,
                DefaultSampleTypeId: selectedValue === "0" ? null : selectedValue,
                SampleTypeName: selectedTypeName,
              }
            : item
        )
      );

      setUpdatedSampleManagementList(updatedList);
    },
    [updatedSampleManagementList, sampleType, setUpdatedSampleManagementList]
  );

  // rowWiseBarcodeChangeHandler;

  const rowWiseBarcodeChangeHandler = useCallback(
    (e: ChangeEvent<HTMLInputElement>, row: SampleManagementItem) => {
      const barcodeValue = e.target.value;

      const updatedList = updatedSampleManagementList.map(item =>
        Number(item.PatientInvestigationId) === Number(row.PatientInvestigationId)
          ? {
              ...item,
              Barcode: barcodeValue,
            }
          : item
      );

      setCheckedSample(prevList =>
        prevList.map(item =>
          Number(item.PatientInvestigationId) === Number(row.PatientInvestigationId)
            ? {
                ...item,
                Barcode: barcodeValue,
              }
            : item
        )
      );

      setUpdatedSampleManagementList(updatedList);
    },
    [updatedSampleManagementList, setUpdatedSampleManagementList]
  );
  // check items for sample collection

  const rowWiseCheckHandler = (e: ChangeEvent<HTMLInputElement>, row: SampleManagementItem) => {
    const isChecked = e.target.checked;

    const updatedList = updatedSampleManagementList.map(item =>
      Number(item.PatientInvestigationId) === Number(row.PatientInvestigationId)
        ? {
            ...item,
            isSampleSelected: isChecked,
          }
        : item
    );
    setUpdatedSampleManagementList(updatedList);

    if (isChecked) {
      const selectedItem = updatedList.find(
        item => Number(item.PatientInvestigationId) === Number(row.PatientInvestigationId)
      ) || { ...row, isSampleSelected: true };
      setCheckedSample(prev => [
        ...prev.filter(
          x => Number(x.PatientInvestigationId) !== Number(row.PatientInvestigationId)
        ),
        selectedItem,
      ]);
    } else {
      setCheckedSample(prev =>
        prev.filter(x => Number(x.PatientInvestigationId) !== Number(row.PatientInvestigationId))
      );
    }
  };

  // handle select all
  const handleSelectAll = (e: ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    const updatedList = updatedSampleManagementList.map(item =>
      Number(item?.IsSampleReceivedByDepartment) === 1
        ? item
        : { ...item, isSampleSelected: isChecked }
    );
    setUpdatedSampleManagementList(updatedList);
    setCheckedSample(
      isChecked ? updatedList.filter(item => Number(item?.IsSampleReceivedByDepartment) !== 1) : []
    );
  };

  // Payload
  const generatePayload = () => {
    return {
      samples: checkedSample.map((c: SampleManagementItem) => ({
        patientInvestigationId: c.PatientInvestigationId,
        barCode: c.Barcode,
        sampleDateTime: new Date().toISOString(),
        statusId: 3,
        defaultSampleTypeId: c.DefaultSampleTypeId,
        labNo: c?.LabNo,
      })),
    };
  };
  // handle sample collected
  const handleReceiveDepartment = async () => {
    if (checkedSample.length === 0) {
      showWarning("Please select at least one sample");
      return;
    }
    if (checkedSample.some(s => s?.DefaultSampleTypeId === null)) {
      showWarning("Please select sample type for all samples");
      return;
    }
    const paylaod = generatePayload();

    const resp = await fetchApi(
      "PATCH",
      ENDPOINTS.UPDATE_SAMPLE_STATUS,
      paylaod,
      {},
      { component: "LabSampleManagement" }
    );
    if (!resp?.result) {
      showError(resp?.message ?? "Error while collecting sample ");
      return;
    }
    showSuccess(resp?.message ?? "Data saved successfully");
    refetchSampleManagement?.();
  };

  const options: { label: string; value: string }[] = [
    { label: "Patient Wise", value: "patient" },
    { label: "Sample Wise", value: "sample" },
    { label: "Test Wise", value: "test" },
  ];

  // set view mode handler
  const setViewModeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    localStorage.setItem("labSampleManagementSelectedViewMode", JSON.stringify(e.target.value));
    setViewMode(e.target.value as ViewMode);
  };

  useEffect(() => {
    const savedViewMode = localStorage.getItem("labSampleManagementSelectedViewMode");
    if (savedViewMode) {
      setViewMode(JSON.parse(savedViewMode));
    }
  }, []);

  // patient wise filter data
  const getFilteredDataByUhid = useMemo(() => {
    let newFilteredData = new Set(updatedSampleManagementList?.map(u => u?.LabNo).filter(Boolean));
    return Array.from(newFilteredData);
  }, [updatedSampleManagementList]);

  useEffect(() => {
    let newData: GroupedDataSampleManagement[] = [];
    getFilteredDataByUhid.forEach(labNo => {
      const patientData = updatedSampleManagementList?.filter(
        x => Number(x.LabNo) === Number(labNo)
      );

      if (patientData && patientData.length > 0) {
        const serumTypes = Array.from(
          new Set(
            patientData
              .map(
                item =>
                  item?.SampleTypeName ||
                  sampleType?.find(
                    s => Number(s.sampleTypeId) === Number(item?.DefaultSampleTypeId)
                  )?.sampleType ||
                  item?.SampleTypeList ||
                  ""
              )
              .filter(Boolean) as string[]
          )
        );

        const serviceNames = Array.from(
          new Set(patientData.map(item => item?.Name).filter(Boolean) as string[])
        );

        newData.push({
          BillDate: patientData[0]?.BillDate,
          Type: patientData[0]?.Type,
          UHID: patientData[0]?.UHID,
          IPDNo: patientData[0]?.IPDNo,
          LabNo: patientData[0]?.LabNo,
          WardName: patientData[0]?.WardName,
          PatientName: patientData[0]?.PatientName,
          CurrentAge: patientData[0]?.CurrentAge,
          CorporateName: patientData[0]?.CorporateName,
          Gender: patientData[0]?.Gender,
          TotalBalanceAmount: patientData[0]?.TotalBalanceAmount,
          VisitId: patientData[0]?.VisitId,
          isUrgent: patientData[0]?.isUrgent,
          Barcode: patientData[0]?.Barcode,
          IsSampleRequired: patientData[0]?.IsSampleRequired,
          IsDepartmentReceivingRequired: patientData[0]?.IsDepartmentReceivingRequired,
          PatientInvestigationId: patientData[0]?.PatientInvestigationId,
          ReportTypeId: patientData[0]?.ReportTypeId,
          IsReportHold: patientData[0]?.IsReportHold,
          CreatedOn: patientData[0]?.CreatedOn,
          VIPPatient: patientData[0]?.VIPPatient,
          IsSampleCollected: patientData[0]?.IsSampleCollected,
          SampleCollectedOn: patientData[0]?.SampleCollectedOn,
          IsSampleReceivedByDepartment: patientData[0]?.IsSampleReceivedByDepartment,
          SampleReceivedByDepartmentOn: patientData[0]?.SampleReceivedByDepartmentOn,
          IsResultDone: patientData[0]?.IsResultDone,
          ResultDoneOn: patientData[0]?.ResultDoneOn,
          IsReportApproved: patientData[0]?.IsReportApproved,
          ReportApprovedOn: patientData[0]?.ReportApprovedOn,
          IsDispatched: patientData[0]?.IsDispatched,
          DispatchedOn: patientData[0]?.DispatchedOn,
          isSampleRejected: patientData[0]?.isSampleRejected,
          DefaultSampleTypeId: patientData[0]?.DefaultSampleTypeId,
          SampleTypeList: patientData[0]?.SampleTypeList,
          DeliveryDate: patientData[0]?.DeliveryDate,
          IsUnderPackage: patientData[0]?.IsUnderPackage,
          Name: patientData[0]?.Name,
          SampleTypeName: patientData[0]?.SampleTypeName,
          isSampleSelected: patientData[0]?.isSampleSelected,
          serumTypes,
          serumCount: serumTypes.length,
          serviceNames,
          serviceCount: serviceNames.length,
        });
      }
    });

    setUhidGroupedSampleManagementList(newData);
  }, [
    updatedSampleManagementList,
    getFilteredDataByUhid,
    sampleType,
    setUhidGroupedSampleManagementList,
  ]);

  // sample wise filter data
  const getFilteredDataBySampleType = useMemo(() => {
    const seen = new Set<string>();
    const groups: { labNo: number; defaultSampleTypeId: string | null }[] = [];

    updatedSampleManagementList?.forEach(u => {
      if (!u?.LabNo) return;
      const key = `${u.LabNo}_${u.DefaultSampleTypeId ?? ""}`;
      if (!seen.has(key)) {
        seen.add(key);
        groups.push({
          labNo: u.LabNo,
          defaultSampleTypeId: u.DefaultSampleTypeId ?? null,
        });
      }
    });

    return groups;
  }, [updatedSampleManagementList]);

  useEffect(() => {
    let newData: GroupedDataSampleManagement[] = [];
    getFilteredDataBySampleType.forEach(({ labNo, defaultSampleTypeId }) => {
      const patientData = updatedSampleManagementList?.filter(
        x =>
          Number(x.LabNo) === Number(labNo) &&
          String(x.DefaultSampleTypeId ?? "") === String(defaultSampleTypeId ?? "")
      );

      if (patientData && patientData.length > 0) {
        const serumTypes = Array.from(
          new Set(
            patientData
              .map(
                item =>
                  item?.SampleTypeName ||
                  sampleType?.find(
                    s => Number(s.sampleTypeId) === Number(item?.DefaultSampleTypeId)
                  )?.sampleType ||
                  item?.SampleTypeList ||
                  ""
              )
              .filter(Boolean) as string[]
          )
        );

        const serviceNames = Array.from(
          new Set(patientData.map(item => item?.Name).filter(Boolean) as string[])
        );

        newData.push({
          BillDate: patientData[0]?.BillDate,
          Type: patientData[0]?.Type,
          UHID: patientData[0]?.UHID,
          IPDNo: patientData[0]?.IPDNo,
          LabNo: patientData[0]?.LabNo,
          WardName: patientData[0]?.WardName,
          PatientName: patientData[0]?.PatientName,
          CurrentAge: patientData[0]?.CurrentAge,
          CorporateName: patientData[0]?.CorporateName,
          Gender: patientData[0]?.Gender,
          TotalBalanceAmount: patientData[0]?.TotalBalanceAmount,
          VisitId: patientData[0]?.VisitId,
          isUrgent: patientData[0]?.isUrgent,
          Barcode: patientData[0]?.Barcode,
          IsSampleRequired: patientData[0]?.IsSampleRequired,
          IsDepartmentReceivingRequired: patientData[0]?.IsDepartmentReceivingRequired,
          PatientInvestigationId: patientData[0]?.PatientInvestigationId,
          ReportTypeId: patientData[0]?.ReportTypeId,
          IsReportHold: patientData[0]?.IsReportHold,
          CreatedOn: patientData[0]?.CreatedOn,
          VIPPatient: patientData[0]?.VIPPatient,
          IsSampleCollected: patientData[0]?.IsSampleCollected,
          SampleCollectedOn: patientData[0]?.SampleCollectedOn,
          IsSampleReceivedByDepartment: patientData[0]?.IsSampleReceivedByDepartment,
          SampleReceivedByDepartmentOn: patientData[0]?.SampleReceivedByDepartmentOn,
          IsResultDone: patientData[0]?.IsResultDone,
          ResultDoneOn: patientData[0]?.ResultDoneOn,
          IsReportApproved: patientData[0]?.IsReportApproved,
          ReportApprovedOn: patientData[0]?.ReportApprovedOn,
          IsDispatched: patientData[0]?.IsDispatched,
          DispatchedOn: patientData[0]?.DispatchedOn,
          isSampleRejected: patientData[0]?.isSampleRejected,
          DefaultSampleTypeId: patientData[0]?.DefaultSampleTypeId,
          SampleTypeList: patientData[0]?.SampleTypeList,
          DeliveryDate: patientData[0]?.DeliveryDate,
          IsUnderPackage: patientData[0]?.IsUnderPackage,
          Name: patientData[0]?.Name,
          SampleTypeName: patientData[0]?.SampleTypeName,
          isSampleSelected: patientData[0]?.isSampleSelected,
          serumTypes,
          serumCount: serumTypes.length,
          serviceNames,
          serviceCount: serviceNames.length,
        });
      }
    });

    setSampleWiseGroupedSampleManagementList(newData);
  }, [
    updatedSampleManagementList,
    getFilteredDataBySampleType,
    sampleType,
    setSampleWiseGroupedSampleManagementList,
  ]);

  const settingCoulmnVisibility = () => {
    setShowColumnVisbility(prev => !prev);
  };

  useEffect(() => {
    if (!showColumnVisbility) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsContainerRef.current &&
        !settingsContainerRef.current.contains(event.target as Node)
      ) {
        setShowColumnVisbility(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColumnVisbility]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("labSampleManagementColumnsVisiblity");

      if (stored) {
        const parsed = JSON.parse(stored) as ColumnItem[];

        // Preserve saved sequence while merging with default configuration
        const savedMap = new Map(parsed.map(item => [item.id, item]));
        const orderedSaved = parsed
          .filter(p => columnVisibilityTableValue.some(c => c.id === p.id))
          .map(p => {
            const original = columnVisibilityTableValue.find(c => c.id === p.id)!;
            return { ...original, isChecked: p.isChecked };
          });
        const missing = columnVisibilityTableValue.filter(c => !savedMap.has(c.id));

        setColumnVisibilityTable([...orderedSaved, ...missing]);
      }
    } catch {
      localStorage.removeItem("labSampleManagementColumnsVisiblity");
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setColumnVisibilityTable(prev => {
      const oldIndex = prev.findIndex(item => item.id === active.id);
      const newIndex = prev.findIndex(item => item.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;

      const reordered = arrayMove(prev, oldIndex, newIndex);
      localStorage.setItem("labSampleManagementColumnsVisiblity", JSON.stringify(reordered));
      return reordered;
    });
  };

  const visibleColumns = useMemo(
    () => columnVisibilityTable.filter(col => col.isChecked),
    [columnVisibilityTable]
  );

  // update column visibility
  const updateColumnVisibility = (e: ChangeEvent<HTMLInputElement>, col: ColumnItem) => {
    const checked = e.target.checked;

    setColumnVisibilityTable(prev => {
      const updated = prev.map(item =>
        item.id === col.id ? { ...item, isChecked: checked } : item
      );

      localStorage.setItem("labSampleManagementColumnsVisiblity", JSON.stringify(updated));

      return updated;
    });
  };

  const renderHeaderCell = (col: ColumnItem) => {
    switch (col.tableHeaderName) {
      case "Time Line":
        return (
          <th
            key={col.id}
            className="whitespace-nowrap border border-gray-300 px-1 py-2 text-center"
          >
            Time Line
          </th>
        );
      case "Lab No":
        return (
          <th
            key={col.id}
            className="whitespace-nowrap border border-gray-300 px-1 py-2 text-center"
          >
            Lab No
          </th>
        );
      case "Bill Date":
        return (
          <th
            key={col.id}
            className="whitespace-nowrap border border-gray-300 px-1 py-2 text-center"
          >
            Bill Date
          </th>
        );
      case "UHID":
        return (
          <th
            key={col.id}
            className="whitespace-nowrap border border-gray-300 px-1 py-2 text-center"
          >
            UHID
          </th>
        );
      case "Patient Name":
        return (
          <th
            key={col.id}
            className="whitespace-nowrap border border-gray-300 px-1 py-2 text-center"
          >
            Patient Name
          </th>
        );
      case "Age / Gender":
        return (
          <th
            key={col.id}
            className="whitespace-nowrap border border-gray-300 px-1 py-2 text-center"
          >
            Age / Gender
          </th>
        );
      case "Corporate":
        return (
          <th
            key={col.id}
            className="whitespace-nowrap border border-gray-300 px-1 py-2 text-center"
          >
            Corporate
          </th>
        );
      case "Test(s)":
        return (
          <th
            key={col.id}
            className="whitespace-nowrap border border-gray-300 px-1 py-2 text-center"
          >
            Test(s)
          </th>
        );
      case "Sample Type":
        return (
          <th
            key={col.id}
            className="whitespace-nowrap border border-gray-300 px-1 py-2 text-center"
          >
            Sample Type
          </th>
        );
      case "Barcode":
        return (
          <th
            key={col.id}
            className="whitespace-nowrap border border-gray-300 px-1 py-2 text-center"
          >
            Barcode
          </th>
        );
      case "Collection Time":
        return (
          <th
            key={col.id}
            className="whitespace-nowrap border border-gray-300 px-1 py-2 text-center"
          >
            Collection Time
          </th>
        );
      case "Segregation Time":
        return (
          <th
            key={col.id}
            className="whitespace-nowrap border border-gray-300 px-1 py-2 text-center"
          >
            Segregation Time
          </th>
        );
      case "Received Time":
        return (
          <th
            key={col.id}
            className="whitespace-nowrap border border-gray-300 px-1 py-2 text-center"
          >
            Received Time
          </th>
        );
      case "Priority":
        return (
          <th
            key={col.id}
            className="whitespace-nowrap border border-gray-300 px-1 py-2 text-center"
          >
            Priority
          </th>
        );
      case "Status":
        return (
          <th
            key={col.id}
            className="whitespace-nowrap border border-gray-300 px-1 py-2 text-center"
          >
            Status
          </th>
        );
      case "IPD No/Beds":
        return (
          <th
            key={col.id}
            className="whitespace-nowrap border border-gray-300 px-1 py-2 text-center"
          >
            IPD No/Beds
          </th>
        );
      default:
        return null;
    }
  };

  const renderDataCell = (col: ColumnItem, row: SampleManagementItem) => {
    switch (col.tableHeaderName) {
      case "Time Line": {
        const timeline = getTimelineInfo(row);
        return (
          <td
            key={col.id}
            className="border border-gray-300 px-1 py-1 text-center"
            title={timeline.title || undefined}
          >
            <span
              className={`inline-block rounded px-2 py-0.5 text-[9px] font-bold ${timeline.className}`}
            >
              {timeline.label}
            </span>
          </td>
        );
      }
      case "Lab No":
        return (
          <td
            key={col.id}
            className="border border-gray-300 px-1 py-1 text-center font-bold text-blue-600"
          >
            {row?.LabNo ?? "-"}
          </td>
        );
      case "Bill Date":
        return (
          <td key={col.id} className="border border-gray-300 px-1 py-1 text-center ">
            {row?.BillDate ?? "-"}
          </td>
        );
      case "UHID":
        return (
          <td key={col.id} className="border border-gray-300 px-1 py-1 text-center">
            {row?.UHID || "-"}
          </td>
        );
      case "Patient Name":
        return (
          <td key={col.id} className="border border-gray-300 px-1 py-1 text-center font-bold">
            {row?.PatientName || "-"}
          </td>
        );
      case "Age / Gender":
        return (
          <td key={col.id} className="border border-gray-300 px-1 py-1 text-center font-bold">
            {row?.CurrentAge + "/" + row?.Gender || "-"}
          </td>
        );
      case "Corporate":
        return (
          <td key={col.id} className="border border-gray-300 px-1 py-1 text-center">
            {row?.CorporateName || "-"}
          </td>
        );
      case "Test(s)":
        return (
          <td key={col.id} className="border border-gray-300 px-2 py-2 font-medium">
            <span
              className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                Number(row?.isSampleRejected) === 1
                  ? "bg-red-100 text-red-600"
                  : Number(row?.IsReportHold) === 1
                    ? "bg-orange-100 text-orange-700"
                    : Number(row?.IsReportApproved) === 1
                      ? "bg-emerald-100 text-emerald-700"
                      : Number(row?.IsDispatched) === 1
                        ? "bg-purple-100 text-purple-700"
                        : Number(row?.IsResultDone) === 1
                          ? "bg-pink-100 text-pink-700"
                          : Number(row?.IsSampleReceivedByDepartment) === 1
                            ? "bg-cyan-100 text-blue-500"
                            : Number(row?.IsSampleCollected) === 1
                              ? "bg-amber-100 text-amber-600"
                              : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {row?.Name || "-"}
            </span>
          </td>
        );
      case "Sample Type":
        return (
          <td key={col.id} className="border border-gray-300 px-1 py-1 text-center">
            <select
              value={Number(row?.DefaultSampleTypeId || 0)}
              className="input-field lg:h-8.5"
              onChange={e => sampleChangeHandlerRowWise(e, row)}
              disabled={!!row?.isSampleRejected || !!row?.IsSampleCollected}
            >
              <option value={0}>Select</option>
              {sampleType.map((item: SampleTypeItem) => (
                <option key={item.sampleTypeId} value={item.sampleTypeId}>
                  {item.sampleType}
                </option>
              ))}
            </select>
          </td>
        );
      case "Barcode":
        return (
          <td key={col.id} className="border border-gray-300 px-1 py-1 text-center">
            <input
              className="input-field lg:h-8"
              value={row?.Barcode}
              disabled={Number(row?.isSampleRejected) === 1 || Number(row?.IsSampleCollected) === 1}
              onChange={e => rowWiseBarcodeChangeHandler(e, row)}
              maxLength={7}
            />
          </td>
        );
      case "Collection Time":
        return (
          <td key={col.id} className="border border-gray-300 px-2 py-2 text-center text-gray-600">
            {row?.SampleCollectedOn || "-"}
          </td>
        );

      case "Segregation Time":
        return (
          <td key={col.id} className="border border-gray-300 px-2 py-2 text-center text-gray-600">
            {row?.SampleSegregationOn || "-"}
          </td>
        );
      case "Received Time":
        return (
          <td key={col.id} className="border border-gray-300 px-2 py-2 text-center text-gray-600">
            {row?.SampleReceivedByDepartmentOn || "-"}
          </td>
        );
      case "Priority":
        return (
          <td key={col.id} className="border border-gray-300 px-2 py-2 text-center">
            <span
              className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                Number(row?.isUrgent) === 1
                  ? "bg-rose-100 text-rose-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {Number(row?.isUrgent) === 1 ? "Urgent" : "Normal"}
            </span>
          </td>
        );
      case "Status":
        return (
          <td key={col.id} className="border border-gray-300 px-2 py-2 text-center">
            {(() => {
              const status =
                Number(row?.isSampleRejected) === 1
                  ? { label: "Rejected", color: "bg-red-100 text-red-600" }
                  : Number(row?.IsReportHold) === 1
                    ? { label: "On Hold", color: "bg-orange-100 text-orange-700" }
                    : Number(row?.IsReportApproved) === 1
                      ? {
                          label: "Approved",
                          color: "bg-emerald-100 text-emerald-700",
                        }
                      : Number(row?.IsDispatched) === 1
                        ? {
                            label: "Dispatched",
                            color: "bg-purple-100 text-purple-700",
                          }
                        : Number(row?.IsResultDone) === 1
                          ? {
                              label: "Report Generated",
                              color: "bg-pink-100 text-pink-700",
                            }
                          : Number(row?.IsSampleReceivedByDepartment) === 1
                            ? {
                                label: "Received",
                                color: "bg-cyan-100 text-blue-500",
                              }
                            : Number(row?.IsSampleCollected) === 1
                              ? {
                                  label: "Collected",
                                  color: "bg-amber-100 text-amber-700",
                                }
                              : {
                                  label: "Pending",
                                  color: "bg-yellow-100 text-yellow-800",
                                };

              return (
                <span
                  className={`inline-block rounded px-2.5 py-0.5 text-[10px] font-bold ${status.color}`}
                >
                  {status.label}
                </span>
              );
            })()}
          </td>
        );
      case "IPD No/Beds":
        return (
          <td key={col.id} className="border border-gray-300 px-2 py-2 text-center">
            {row?.IPDNo || "-"} / {row?.BedNo || "-"}
          </td>
        );
      default:
        return null;
    }
  };

  // select row handler
  const selecteRowHandler = (row: GroupedDataSampleManagement) => {
    if (!row) {
      setSelectedRowForSampleCollect(null);
      setOpenSampleCollect(false);
      setRenderSampleCollect(false);
      return;
    }
    setOpenSampleCollect(true);
    setRenderSampleCollect(true);
    setSelectedRowForSampleCollect(row);
  };

  const searchHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  // filtered data
  const filteredTestData = useMemo(
    () => updatedSampleManagementList.filter(row => matchesSearch(row, searchValue)),
    [updatedSampleManagementList, searchValue]
  );

  const filteredPatientData = useMemo(
    () => uhidGroupedSampleManagementList.filter(row => matchesSearch(row, searchValue)),
    [uhidGroupedSampleManagementList, searchValue]
  );

  const filteredSampleData = useMemo(
    () => sampleWiseGroupedSampleManagementList.filter(row => matchesSearch(row, searchValue)),
    [sampleWiseGroupedSampleManagementList, searchValue]
  );

  // render table
  const renderTable = (viewMode: string) => {
    switch (viewMode) {
      case "sample":
        return (
          <>
            <div className="overflow-x-auto lg:max-h-186">
              <table className="w-full border-collapse text-left text-[11px] ">
                <thead>
                  <tr className="bg-blue-50 text-gray-500 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider">
                    <th className="whitespace-nowrap border border-gray-300 py-2 px-1 text-center">
                      #
                    </th>

                    <th className="whitespace-nowrap border border-gray-300 py-2 text-center px-2">
                      Bill Date
                    </th>

                    <th className="whitespace-nowrap border border-gray-300 py-2 text-center px-2">
                      Lab No
                    </th>
                    <th className="whitespace-nowrap border border-gray-300 py-2 text-center px-2">
                      UHID
                    </th>
                    <th className="whitespace-nowrap border border-gray-300 py-2  text-center px-2">
                      Patient Name
                    </th>
                    <th className="whitespace-nowrap border border-gray-300 py-2 text-center px-2">
                      Sample Type
                    </th>
                    <th className="whitespace-nowrap border border-gray-300 py-2 text-center px-2">
                      Test(s)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                  {filteredSampleData?.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="border border-gray-300 py-2 px-1 text-center text-gray-700"
                      >
                        No records found
                      </td>
                    </tr>
                  )}
                  {filteredSampleData.map((row: GroupedDataSampleManagement, idx: number) => (
                    <tr
                      key={`${row?.LabNo}_${idx}`}
                      className="hover:bg-slate-50 transition-transform cursor-pointer"
                      onDoubleClick={() => selecteRowHandler(row)}
                    >
                      <td className="border border-gray-300 py-2 px-1 font-bold text-gray-900 text-center">
                        {idx + 1}
                      </td>
                      <td className="border border-gray-300 py-2 px-2 text-center">
                        {row?.BillDate}
                      </td>
                      <td className="border border-gray-300 py-2 px-2 text-center text-blue-600 font-bold">
                        {row?.LabNo}
                      </td>
                      <td className="border border-gray-300 py-2 px-2 text-center text-gray-800">
                        {row?.UHID || "-"}
                      </td>
                      <td className="border border-gray-300 text-center py-2 px-2 text-gray-900 font-bold">
                        {row?.PatientName || "-"}
                      </td>
                      <td className="border border-gray-300 text-center py-2 cursor-pointer">
                        {row?.serumTypes?.[0] || "-"}
                        <div className="text-blue-600 font-bold">
                          {(row?.serumCount ?? 0) > 1 && ` + ${(row?.serumCount ?? 1) - 1}`}
                        </div>
                      </td>
                      <td className="border border-gray-300 text-center py-2 cursor-pointer">
                        {row?.serviceNames?.[0] || "-"}
                        <div className="text-blue-600 font-bold">
                          {(row?.serviceCount ?? 0) > 1 && ` + ${(row?.serviceCount ?? 1) - 1}`}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        );
      case "test": {
        return (
          <>
            <div className="overflow-x-auto lg:max-h-186">
              <table className="w-full border-collapse text-left text-[11px] ">
                <thead>
                  <tr className="bg-blue-50 text-gray-500 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider">
                    {/* Always-visible selection checkbox */}
                    <th className="whitespace-nowrap border border-gray-300 px-1 py-2 text-center">
                      <input
                        type="checkbox"
                        className="input-checkbox"
                        checked={
                          updatedSampleManagementList.some(
                            item => Number(item?.IsSampleReceivedByDepartment) !== 1
                          ) &&
                          updatedSampleManagementList
                            .filter(item => Number(item.IsSampleReceivedByDepartment) !== 1)
                            .every(item => Boolean(item.isSampleSelected))
                        }
                        onChange={handleSelectAll}
                      />
                    </th>

                    <th className="whitespace-nowrap border border-gray-300 py-1 px-2 text-center">
                      #
                    </th>
                    {visibleColumns.map(col => renderHeaderCell(col))}
                    <th className="whitespace-nowrap border border-gray-300 py-2 px-1 text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                  {filteredTestData?.length === 0 && (
                    <tr>
                      <td
                        colSpan={visibleColumns.length + 3}
                        className="border border-gray-300 py-2 px-1 text-center text-gray-700"
                      >
                        No records found
                      </td>
                    </tr>
                  )}
                  {filteredTestData.map((row: SampleManagementItem, idx: number) => (
                    <tr
                      key={`${row?.LabNo}_${idx}`}
                      className="transition-colors hover:bg-slate-50"
                    >
                      {/* Always visible: selection checkbox */}
                      <td className="border border-gray-300 px-1 py-2 text-center">
                        <input
                          type="checkbox"
                          className="input-checkbox"
                          checked={Boolean(row?.isSampleSelected)}
                          onChange={e => rowWiseCheckHandler(e, row)}
                          disabled={Number(row?.IsSampleReceivedByDepartment) === 1}
                        />
                      </td>

                      {/* Always visible: row number */}
                      <td className="border border-gray-300 px-1 py-1 text-center font-bold">
                        {idx + 1}
                      </td>

                      {visibleColumns.map(col => renderDataCell(col, row))}

                      <td className="border border-gray-300 px-1 py-2 text-center">
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handlePatientViewDetails(row)}
                            className="cursor-pointer p-1 text-gray-500 hover:text-blue-600"
                            title="View Details"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRejectSample(row)}
                            className="cursor-pointer p-1 text-gray-500 hover:text-gray-800"
                            title="Reject Sample"
                          >
                            <MoreVertical size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handlePrintClick(row.sampleId)}
                            className="cursor-pointer p-1 text-gray-500 hover:text-emerald-600"
                            title="Print Sample"
                          >
                            <Printer size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAddRemarkClick(row)}
                            className="cursor-pointer p-1 text-green-700 hover:text-emerald-600"
                            title="Add Remarks"
                          >
                            <Plus size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUploadDocument(row)}
                            className="cursor-pointer p-1 text-gray-500 hover:text-emerald-600"
                            title="Upload Document"
                          >
                            <File size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Footer Button */}
            <div className="flex flex-col sm:flex-row items-center justify-end pt-4 mt-2 border-t border-gray-200 text-xs text-gray-500 gap-3">
              <div className="flex items-center  gap-3">
                {/* Barcode Radio Button */}
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="barcodeOption"
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Barcode</span>
                </label>

                {/* Print Button */}
                <button
                  onClick={() => alert("Print clicked")}
                  className="border border-blue-600 text-blue-600  text-xs font-semibold px-4 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  Print
                </button>

                {/* Save Button */}
                <button
                  onClick={handleReceiveDepartment}
                  className="save-btn text-white !text-xs font-semibold !px-3 !py-1.5 ounded-lg shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  Receive Department
                </button>
              </div>
            </div>
          </>
        );
      }
      case "patient": {
        return (
          <>
            <div className="overflow-x-auto lg:max-h-186">
              <table className="w-full   border-collapse text-left text-[11px] ">
                <thead>
                  <tr className="bg-blue-50 text-gray-500 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider">
                    <th className="whitespace-nowrap border border-gray-300 py-2 px-1 text-center">
                      #
                    </th>

                    <th className="whitespace-nowrap border border-gray-300 py-2 text-center px-2">
                      Bill Date
                    </th>

                    <th className="whitespace-nowrap border border-gray-300 py-2 text-center px-2">
                      Lab No
                    </th>
                    <th className="whitespace-nowrap border border-gray-300 py-2 text-center px-2">
                      UHID
                    </th>
                    <th className="whitespace-nowrap border border-gray-300 py-2  text-center px-2">
                      Patient Name
                    </th>
                    <th className="whitespace-nowrap border border-gray-300 py-2 text-center px-2">
                      Sample Type
                    </th>
                    <th className="whitespace-nowrap border border-gray-300 py-2 text-center px-2">
                      Test(s)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                  {filteredPatientData?.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="border border-gray-300 py-2 px-1 text-center text-gray-700"
                      >
                        No records found
                      </td>
                    </tr>
                  )}
                  {filteredPatientData.map((row: GroupedDataSampleManagement, idx: number) => (
                    <tr
                      key={`${row?.LabNo}_${idx}`}
                      className="hover:bg-slate-50 transition-transform cursor-pointer"
                      onDoubleClick={() => selecteRowHandler(row)}
                    >
                      <td className="border border-gray-300 py-2 px-1 font-bold text-gray-900 text-center">
                        {idx + 1}
                      </td>
                      <td className="border border-gray-300 py-2 px-2 text-center">
                        {row?.BillDate}
                      </td>
                      <td className="border border-gray-300 py-2 px-2 text-center text-blue-600 font-bold">
                        {row?.LabNo}
                      </td>
                      <td className="border border-gray-300 py-2 px-2 text-center text-gray-800">
                        {row?.UHID || "-"}
                      </td>
                      <td className="border border-gray-300 text-center py-2 px-2 text-gray-900 font-bold">
                        {row?.PatientName || "-"}
                      </td>
                      <td className="border border-gray-300 text-center py-2 cursor-pointer">
                        {row?.serumTypes?.[0] || "-"}
                        <div className="text-blue-600 font-bold">
                          {(row?.serumCount ?? 0) > 1 && ` + ${(row?.serumCount ?? 1) - 1}`}
                        </div>
                      </td>
                      <td className="border border-gray-300 text-center py-2 cursor-pointer">
                        {row?.serviceNames?.[0] || "-"}
                        <div className="text-blue-600 font-bold">
                          {(row?.serviceCount ?? 0) > 1 && ` + ${(row?.serviceCount ?? 1) - 1}`}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        );
      }
      default:
        return <></>;
    }
  };

  // refresh button handler
  const refreshButtonHandler = () => {
    refetchSampleManagement?.();
  };

  return (
    <div className="card mt-1">
      {/* group by  and settings */}
      <div className="w-full -mt-2 px-2">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Group By */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {options.map(option => (
              <label
                key={option.value}
                className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 whitespace-nowrap"
              >
                <input
                  type="radio"
                  name="sampleViewMode"
                  value={option.value}
                  checked={viewMode === option.value}
                  onChange={setViewModeHandler}
                  className="h-4 w-4 accent-blue-600 cursor-pointer"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>

          {/* Search and Actions */}
          <div className="flex items-center gap-2 w-full lg:w-auto mb-1">
            {/* Search */}
            <div className="relative min-w-0 flex-1 lg:flex-none">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchValue}
                onChange={searchHandler}
                placeholder="Search in list..."
                className="h-7 w-full rounded-lg border border-gray-200 bg-white pl-8 pr-3 text-xs text-gray-800 placeholder-gray-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 lg:w-[220px]"
              />
            </div>

            {/* Reload */}
            <button
              type="button"
              onClick={refreshButtonHandler}
              className="flex h-7 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
              title="Reload"
              aria-label="Reload"
            >
              <RotateCw size={15} />
            </button>

            {/* Settings */}
            {viewMode === "test" && (
              <div className="relative" ref={settingsContainerRef}>
                <button
                  type="button"
                  onClick={settingCoulmnVisibility}
                  className="flex h-7 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                  title="Settings"
                  aria-label="Settings"
                >
                  <Settings size={15} />
                </button>

                {showColumnVisbility && (
                  <div className="absolute right-0 top-full mt-1 z-50 w-64 rounded-lg border border-gray-200 bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
                      <h3 className="text-sm font-semibold text-gray-700">Column Visibility</h3>

                      <button
                        type="button"
                        onClick={() => setShowColumnVisbility(false)}
                        aria-label="Close"
                        className="text-gray-500 hover:text-gray-800"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="max-h-64 overflow-y-auto p-2">
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={columnVisibilityTable.map(c => c.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {columnVisibilityTable.map(col => (
                            <SortableColumnItem
                              key={col.id}
                              col={col}
                              updateColumnVisibility={updateColumnVisibility}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* render table */}

      {renderTable(viewMode)}

      {/* add remark */}
      {renderAddRemarks && (
        <AddRemarkPopup
          isOpen={openAddRemarks}
          onClose={closeAddRemarks}
          data={selectedSampleData}
        />
      )}

      {/* reject sample */}
      {renderRejectSample && (
        <RejectSamplePopup
          isOpen={openRejectSample}
          onClose={closeRejectSample}
          data={selectedSampleData}
          refreshSampleReject={refetchSampleManagement}
        />
      )}

      {/* upload document */}
      {renderUploadDocument && (
        <UploadDocument
          isOpen={openUploadDocument}
          onClose={closeUploadDocument}
          data={selectedSampleData}
        />
      )}

      {/* sample collection */}
      {renderSampleCollect && (
        <SampleCollection
          isOpen={openSampleCollect}
          onClose={closeSampleCollection}
          data={selectedRowForSampleCollect}
          updatedSampleManagementList={updatedSampleManagementList}
          viewMode={viewMode}
          sampleType={sampleType}
          refetchSampleManagement={refetchSampleManagement}
          handlePatientViewDetails={handlePatientViewDetails}
          handleRejectSample={handleRejectSample}
          handlePrintClick={handlePrintClick}
          handleAddRemarkClick={handleAddRemarkClick}
          handleUploadDocument={handleUploadDocument}
        />
      )}

      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
}
