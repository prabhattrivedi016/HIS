import CustomDateInput from "@/components/customDateInput";
import CustomDateTimeInput from "@/components/customDateTimeInput";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import SampleManagementPatientDocument from "@/components/SingledrawerAndPopup/components/SampleManagementPatientDocument";
import SampleRemarks from "@/components/SingledrawerAndPopup/components/SampleRemarks";
import { ENDPOINTS } from "@/config/defaults";
import { CATEGORY_ID, Status } from "@/constants/constants";
import {
  LabResultEntryButtons,
  LabResultEntryTableHeaderForSampleCollect,
  LabResultEntryTableHeaderNotCollect,
} from "@/constants/tableHeaders";
import { AuthContext } from "@/context/AuthContext";
import { RoleContext } from "@/context/RoleContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchUserRightAccess } from "@/store/slices/accessRightSlices";
import { showError, showInfo, showSuccess, showWarning } from "@/utils/alert";
import { labResultEntrySchema } from "@/validation/labResultEntrySchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { BriefcaseMedical } from "lucide-react";
import { ChangeEvent, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router-dom";
import LabPatientInfo from "../../components/SingledrawerAndPopup/index";
import { ButtonValue } from "../sampleManagement/types";
import LRRemarkPopup from "./components/LRRemarkPopup";
import {
  InvestigationName,
  LabResultEntryTableData,
  SelectItem,
  SubSubCategoryItem,
} from "./types";

const PATHOLOGY_RESULT_ENTRY_FILTERS_KEY = "pathologyResultEntryFilters";

const PathologyResultEntry = () => {
  const { loading, error, fetchApi } = useGlobalApi();

  const navigate = useNavigate();

  // Simple access rights from Redux store
  const accessRights = useAppSelector(state => state.accessRights.accessRights);

  const canCollectSample = Number(accessRights?.canCollectSampleFromPathologyResultEntry);

  const dispatch = useAppDispatch();

  const getLocalDateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  };

  const currentDate = new Date().toISOString().split("T")[0];
  const currentDateTime = getLocalDateTime();
  const [activeIndex, setActiveIndex] = useState(0);

  const [selectedPatient, setSelectedPatient] = useState<LabResultEntryTableData | null>(null);
  const [selectedRemarkPatient, setSelectedRemarkPatient] =
    useState<LabResultEntryTableData | null>(null);

  const [openPatientInfoPopup, setOpenPatientInfoPopup] = useState<boolean>(false);
  const [renderPatientInfoPopup, setRenderPatientInfoPopup] = useState<boolean>(false);

  const [labResultEntryTableData, setLabResultEntryTableData] = useState<LabResultEntryTableData[]>(
    []
  );

  const [pendingTestCount, setPendingTestCount] = useState<number>(0);
  const [totalTestCount, setTotalTestCount] = useState<number>(0);
  const [approvedTestCount, setApprovedTestCount] = useState<number>(0);
  const [totalPatientCount, setTotalPatientCount] = useState<number>(0);

  const [subSubCategoryList, setSubSubCategoryList] = useState<SubSubCategoryItem[]>([]);

  const [investigationNameList, setInvestigationNameList] = useState<InvestigationName[]>([]);

  const [selectedInvestigationName, setSelectedInvestigationName] = useState<SelectItem | null>(
    null
  );

  const [updatedSampleCollectionTable, setUpdatedSampleCollectionTable] = useState<
    LabResultEntryTableData[]
  >([]);

  const [updatedDepartmentReceiving, setUpdatedDepartmentReceiving] = useState<
    LabResultEntryTableData[]
  >([]);

  const [showTable, setShowTable] = useState<boolean>(false);
  const [selectedReportPatientInvestigationIds, setSelectedReportPatientInvestigationIds] =
    useState<number[]>([]);
  const [patientInvestigationIds, setPatientInvestigationIds] = useState<string>("");

  const [searchValue, setSearchValue] = useState<string>("");

  const hasFetched = useRef(false);
  const [openPatientDocuments, setOpenPatientDocuments] = useState<boolean>(false);
  const [renderPatientDocument, setRenderPatientDocument] = useState<boolean>(false);
  const [selectedPatientDocument, setSelectedPatientDocument] =
    useState<LabResultEntryTableData | null>(null);

  const [openRemarkPopup, setOpenRemarkPopup] = useState<boolean>(false);
  const [renderRemarkPopup, setRenderRemarkPopup] = useState<boolean>(false);
  const [remarkItem, setRemarkItem] = useState<LabResultEntryTableData | null>(null);

  const [isHeaderPng, setIsHeaderPng] = useState<number>(0);

  // role
  const roleContext = useContext(RoleContext);
  const roleId = roleContext?.roleId;

  // branch
  const authData = useContext(AuthContext);
  const branchId = authData?.user?.branchId;

  const closeHandler = useCallback(() => {
    setOpenRemarkPopup(false);
  }, []);

  // lab result form data
  const {
    register,
    handleSubmit,
    control,
    setValue,

    reset,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(labResultEntrySchema),
    defaultValues: {
      typeId: 0,
      uhid: "",
      ipdNo: "",
      labNo: "",
      fromDate: currentDate,
      toDate: currentDate,
      statusId: 0,
      barcode: "",
      patientName: "",
      subCategoryId: 1,
      subSubCategoryId: 0,
      investigationId: 0,
      canSampleCollect: canCollectSample,
    },
  });

  useEffect(() => {
    setValue("canSampleCollect", canCollectSample);
  }, [canCollectSample, setValue]);

  // sub sub category list
  const getSubSubCategory = async (subCategoryIds: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SUB_SUB_CATEGORY_LIST,
      {},
      { params: { subCategoryIds } },
      { component: "PathologyResultEntry" }
    );
    setSubSubCategoryList(resp?.data ?? []);
  };

  // investigation name search
  const getInvestigationName = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_INVESTIGATION_SERVICE_ITEM_LIST,
      {},
      {
        params: {
          categoryId: CATEGORY_ID?.categoryId,
          labTypeId: Status?.ACTIVE,
          isActive: Status?.ACTIVE,
        },
      },
      { component: "PathologyResultEntry" }
    );
    setInvestigationNameList(resp?.data ?? []);
  };

  const investigationNameSelectOptions = useMemo(() => {
    return (
      investigationNameList?.map(i => ({
        label: i.name,
        value: i.serviceItemId,
      })) || []
    );
  }, [investigationNameList]);

  const investigationSelectHandler = (option: SelectItem | null) => {
    setSelectedInvestigationName(option);
    setValue("investigationId", option?.value ?? 0);
  };

  useEffect(() => {
    getSubSubCategory(1);
    getInvestigationName();
  }, []);

  // api call for search patient investigation for sample processing pathology on mount
  const fetchLabData = async (formData?: Record<string, unknown>) => {
    if (!branchId || !roleId) return;

    const payload = {
      typeId: 0,
      uhid: "",
      ipdNo: "",
      labNo: "",
      fromDate: formData?.fromDate || getValues("fromDate"),
      toDate: formData?.toDate || getValues("toDate"),
      statusId: 0,
      barcode: "",
      patientName: "",
      subCategoryId: 0,
      subSubCategoryId: 0,
      investigationId: 0,
      canSampleCollect: getValues("canSampleCollect"),
      ...(formData || {}),
      branchId,
      roleId,
    };

    const resp = await fetchApi(
      "GET",
      ENDPOINTS.SEARCH_PATIENT_INVESTIGATION_FOR_SAMPLE_PROCESSING_PATHOLOGY,
      {},
      { params: payload },
      { component: "PathologyResultEntry" }
    );
    setActiveIndex(0);
    sessionStorage.setItem(PATHOLOGY_RESULT_ENTRY_FILTERS_KEY, JSON.stringify(payload));

    if (!resp?.result) {
      setLabResultEntryTableData([]);
      setUpdatedSampleCollectionTable([]);
      setTotalPatientCount(0);
      setTotalTestCount(0);
      setApprovedTestCount(0);
      setPendingTestCount(0);
      showWarning(resp?.message ?? "No data found");
      setShowTable(false);
      return;
    }

    const tableData = (resp?.data ?? []).map((item: LabResultEntryTableData) => {
      const barcode = item?.Barcode?.toString().trim();

      return {
        ...item,
        Barcode: barcode && barcode !== "0" ? barcode : item?.LabNo?.toString() || "",
      };
    });

    setLabResultEntryTableData(tableData);
    setUpdatedSampleCollectionTable([]);
    setSelectedReportPatientInvestigationIds([]);
    setPatientInvestigationIds("");

    setTotalPatientCount(new Set(resp?.data.map((i: LabResultEntryTableData) => i.UHID)).size);
    setTotalTestCount(resp?.data.length);
    setApprovedTestCount(
      resp?.data.filter((i: LabResultEntryTableData) => i.IsReportApproved === 1).length
    );
    setPendingTestCount(
      resp?.data.filter((i: LabResultEntryTableData) => i.IsResultDone === 0).length
    );
    setShowTable(true);
  };

  useEffect(() => {
    if (!branchId || !roleId) return;

    //  prevents double call
    if (hasFetched.current) return;

    hasFetched.current = true;

    // Fetch access rights
    dispatch(fetchUserRightAccess({ branchId, roleId }));

    const savedFiltersRaw = sessionStorage.getItem(PATHOLOGY_RESULT_ENTRY_FILTERS_KEY);
    let savedFilters: Record<string, unknown> | null = null;
    try {
      savedFilters = savedFiltersRaw ? JSON.parse(savedFiltersRaw) : null;
    } catch {
      savedFilters = null;
    }

    if (savedFilters && typeof savedFilters === "object") {
      const restoredFilters = {
        ...savedFilters,
        branchId,
        roleId,
      };
      reset({
        typeId: Number(restoredFilters?.typeId) || 0,
        uhid: String(restoredFilters?.uhid ?? ""),
        ipdNo: String(restoredFilters?.ipdNo ?? ""),
        labNo: String(restoredFilters?.labNo ?? ""),
        fromDate: String(restoredFilters?.fromDate ?? currentDate),
        toDate: String(restoredFilters?.toDate ?? currentDate),
        statusId: Number(restoredFilters?.statusId) || 0,
        barcode: String(restoredFilters?.barcode ?? ""),
        patientName: String(restoredFilters?.patientName ?? ""),
        subCategoryId: Number(restoredFilters?.subCategoryId) || 1,
        subSubCategoryId: Number(restoredFilters?.subSubCategoryId) || 0,
        investigationId: Number(restoredFilters?.investigationId) || 0,
        canSampleCollect: Number(restoredFilters?.canSampleCollect) || canCollectSample || 0,
      });
      fetchLabData(restoredFilters);
      return;
    }

    // Fetch default lab data
    fetchLabData();
  }, [branchId, roleId, dispatch]);

  // search button handler
  const onsubmit = async (data: Record<string, unknown>) => {
    await fetchLabData(data);
  };

  // button count
  const getButtonCount = (buttonName: string) => {
    const data = labResultEntryTableData;

    switch (buttonName) {
      case "all":
        return data.length;
      case "sampleCollectionPending":
        return data.filter(i => i?.IsSampleCollected === 0 && i?.IsSampleRequired === 1).length;
      case "resultPending":
        return data.filter(i => i.IsResultDone === 0).length;

      case "hold":
        return data.filter(i => i.IsReportHold === 1).length;

      case "reportApprovedPending":
        return data.filter(i => i.IsReportApproved === 0).length;

      case "approved":
        return data.filter(i => i.IsReportApproved === 1).length;

      case "printed":
        return data.filter(i => i.isReportPrinted === 1).length;

      case "dispatched":
        return data.filter(i => i.IsDispatched === 1).length;

      case "rejected":
        return data.filter(i => i.isSampleRejected === 1).length;

      default:
        return 0;
    }
  };

  const renderButton = (buttons: ButtonValue[]) => {
    return buttons.map((b, idx) => {
      const isActive = idx === activeIndex;

      return (
        <button
          key={idx}
          type="button"
          onClick={() => setActiveIndex(idx)}
          className={`
          flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap 
          text-sm font-medium border transition-all duration-200
          ${isActive ? "shadow-md scale-95" : ""}
        `}
          style={{
            backgroundColor: isActive ? b.color : "#fff",
            borderColor: b.color,
            color: isActive ? "#000" : "#333",
          }}
        >
          {/* icon */}
          <div style={{ backgroundColor: b.color }} className="p-1 rounded-md">
            <BriefcaseMedical size={14} className="text-black" />
          </div>

          {/* label + count */}
          <span>
            {b.level} : {getButtonCount(b.buttonName)}
          </span>
        </button>
      );
    });
  };

  const getColorFromButton = (buttonName: string) => {
    return (
      LabResultEntryButtons.find(button => button.buttonName === buttonName)?.color || "#8C8787"
    );
  };

  const getInvestigationColor = (item: LabResultEntryTableData) => {
    // Check conditions in priority order

    // 1. Check if rejected
    if (item.isSampleRejected === 1) return getColorFromButton("rejected");

    // 2. Check if sample collection pending
    if (item.IsSampleCollected === 0 && item.IsSampleRequired === 1)
      return getColorFromButton("sampleCollectionPending");

    // 3. Check if on hold
    if (item.IsReportHold === 1) return getColorFromButton("hold");

    // 4. Check if dispatched
    if (item.IsDispatched === 1) return getColorFromButton("dispatched");

    // 5. Check if approved
    if (item.IsReportApproved === 1) return getColorFromButton("approved");

    // 6. Check if report approved pending
    if (item.IsResultDone === 1 && item.IsReportApproved === 0)
      return getColorFromButton("reportApprovedPending");

    // 7. Default to result pending
    return getColorFromButton("resultPending");
  };

  // badge name

  const getBadgeStyle = (item: LabResultEntryTableData) => {
    const color = getInvestigationColor(item);

    return {
      backgroundColor: `${color}25`,
      color: "#111",
      padding: "4px 8px",
      borderRadius: "6px",
      fontWeight: 500,
      display: "inline-block",
      border: `1px solid ${color}`,
      minWidth: "80px",
      textAlign: "center" as const,
    };
  };

  // array formation of sample type
  const sampleArrayFormation = (item: string) => {
    return item
      ?.split("$")
      ?.filter(Boolean)
      ?.map(i => {
        const [id, name, color] = i.split("*");

        return {
          id: Number(id),
          name: name?.trim() || "",
          color: color?.trim() || "",
        };
      });
  };

  // select sample type handler
  const selectSampleTypeHandler = (index: number, value: number) => {
    const row = visibleTableData[index];
    if (!row) return;
    const parsedSampleTypes = sampleArrayFormation(row.SampleTypeList || "");
    const selectedType = parsedSampleTypes.find(sampleType => sampleType.id === value);
    const selectedTypeName = selectedType?.name ?? "";

    const updateRow = (item: LabResultEntryTableData) =>
      item.PatientInvestigationId === row.PatientInvestigationId
        ? {
            ...item,
            DefaultSampleTypeId: value,
            selectedSampleType: selectedTypeName,
            SampleTypeName: selectedTypeName || item?.SampleTypeList,
          }
        : item;

    setLabResultEntryTableData(prev => prev.map(updateRow));
  };

  // handle barcode change
  const handleBarcodeChange = (
    item: LabResultEntryTableData,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    const id = item.PatientInvestigationId;

    setLabResultEntryTableData(prev =>
      prev.map(prevItem =>
        prevItem.PatientInvestigationId === id
          ? {
              ...prevItem,
              Barcode: value,
            }
          : prevItem
      )
    );

    // Keep selected payload rows in sync with the latest typed barcode
    setUpdatedSampleCollectionTable(prev =>
      prev.map(prevItem =>
        prevItem.PatientInvestigationId === id
          ? {
              ...prevItem,
              Barcode: value,
            }
          : prevItem
      )
    );
  };

  // handler checkbox change
  const handleCheckboxChange = (item: LabResultEntryTableData) => {
    const barcode = item?.Barcode?.toString().trim() || item?.LabNo?.toString().trim() || "";

    if (!barcode || barcode === "0") {
      showWarning("Please enter valid barcode number");
      return;
    }

    if (item?.IsSampleCollected === 1) {
      showWarning("'this sample is already collected");
      return;
    }

    const id = item.PatientInvestigationId;

    const collectedSample = updatedSampleCollectionTable?.find(
      S => S?.PatientInvestigationId === id
    );

    if (!collectedSample) {
      setUpdatedSampleCollectionTable(prev => [...prev, { ...item }]);
    } else {
      setUpdatedSampleCollectionTable(prev => prev.filter(s => s.PatientInvestigationId !== id));
    }
  };

  // department receive date time handler
  const departmentReceiveDateTime = (item: LabResultEntryTableData, value: string) => {
    const id = item.PatientInvestigationId;

    setLabResultEntryTableData(prev =>
      prev.map(row => (row.PatientInvestigationId === id ? { ...row, sampleDateTime: value } : row))
    );

    setUpdatedDepartmentReceiving(prev =>
      prev.map(row => (row.PatientInvestigationId === id ? { ...row, sampleDateTime: value } : row))
    );
  };

  // department receiving change
  const handleDeptRecvChange = (item: LabResultEntryTableData) => {
    const id = item.PatientInvestigationId;

    setUpdatedDepartmentReceiving(prev => {
      const exists = prev.some(p => p.PatientInvestigationId === id);

      if (exists) {
        // remove
        return prev.filter(p => p.PatientInvestigationId !== id);
      } else {
        // add
        return [...prev, item];
      }
    });
  };

  // filter visible data
  const visibleTableData = useMemo(() => {
    const normalizedSearch = searchValue.toLowerCase().trim();
    const isSearching = normalizedSearch.length > 0;

    const baseData = isSearching
      ? labResultEntryTableData.filter(row => {
          // Search in regular fields with simple includes
          const regularFields = [
            row?.Barcode,
            row?.LabNo,
            row?.BillDate,
            row?.UHID,
            row?.PatientName,
            row?.CurrentAge,
            row?.CorporateName,
            row?.Name,
          ].some(field => field?.toString().toLowerCase().includes(normalizedSearch));

          if (regularFields) return true;

          // Smart search for sample types (word-boundary matching)
          const sampleTypesStr = (
            row?.SampleTypeName ||
            row?.selectedSampleType ||
            ""
          ).toLowerCase();

          // Parse sample types if available
          const parsedSampleTypes = sampleArrayFormation(row?.SampleTypeList || "");
          const sampleTypeNames = parsedSampleTypes.map(s => s.name.toLowerCase());

          // Check for word-boundary match in sample type names
          const searchWords = normalizedSearch.split(/\s+/).filter(Boolean);
          const hasSampleTypeMatch = searchWords.some(word =>
            sampleTypeNames.some(name =>
              name.split(/\s+/).some(nameWord => nameWord.startsWith(word))
            )
          );

          return hasSampleTypeMatch || sampleTypesStr.includes(normalizedSearch);
        })
      : labResultEntryTableData;

    // Apply button filter based on activeIndex
    const activeButton = LabResultEntryButtons[activeIndex]?.buttonName;

    switch (activeButton) {
      case "sampleCollectionPending":
        return baseData?.filter(i => i?.IsSampleCollected === 0 && i?.IsSampleRequired === 1);
      case "resultPending":
        return baseData.filter(i => i.IsResultDone === 0);

      case "hold":
        return baseData.filter(i => i.IsReportHold === 1);

      case "reportApprovedPending":
        return baseData.filter(i => i.IsReportApproved === 0);

      case "approved":
        return baseData.filter(i => i.IsReportApproved === 1);

      case "printed":
        return baseData.filter(i => i.isReportPrinted === 1);

      case "dispatched":
        return baseData.filter(i => i.IsDispatched === 1);

      case "rejected":
        return baseData.filter(i => i.isSampleRejected === 1);

      default:
        return baseData;
    }
  }, [activeIndex, labResultEntryTableData, searchValue]);
  // header checkbox handler
  const checkboxHandler = (h: string, checked: boolean) => {
    // Sample Collection header checkbox
    if (h === "Sample Collection") {
      if (checked) {
        // Check all eligible sample collection rows
        const eligibleSampleItems = visibleTableData.filter(
          item => item.IsSampleCollected === 0 && item.isSampleRejected === 0
        );
        setUpdatedSampleCollectionTable(prev => {
          const newItems = eligibleSampleItems.filter(
            item => !prev.some(p => p.PatientInvestigationId === item.PatientInvestigationId)
          );
          return [...prev, ...newItems];
        });
      } else {
        // Uncheck all visible sample collection rows
        const visibleIds = new Set(visibleTableData.map(item => item.PatientInvestigationId));
        setUpdatedSampleCollectionTable(prev =>
          prev.filter(item => !visibleIds.has(item.PatientInvestigationId))
        );
      }
    }

    // Department Receiving header checkbox
    if (h === "Dept. Rec.") {
      if (checked) {
        // Check all eligible department receiving rows
        const eligibleDeptItems = visibleTableData.filter(
          item =>
            item.IsDepartmentReceivingRequired === 1 &&
            item.IsSampleCollected === 1 &&
            item.IsSampleReceivedByDepartment === 0 &&
            item.Barcode !== "SNR"
        );
        setUpdatedDepartmentReceiving(prev => {
          const newItems = eligibleDeptItems.filter(
            item => !prev.some(p => p.PatientInvestigationId === item.PatientInvestigationId)
          );
          return [...prev, ...newItems];
        });
      } else {
        // Uncheck all visible department receiving rows
        const visibleIds = new Set(visibleTableData.map(item => item.PatientInvestigationId));
        setUpdatedDepartmentReceiving(prev =>
          prev.filter(item => !visibleIds.has(item.PatientInvestigationId))
        );
      }
    }

    // Report/Print header checkbox
    if (h === "Print") {
      const eligibleReportIds = visibleTableData
        .filter(item => Number(item?.IsReportApproved) === 1)
        .map(item => Number(item?.PatientInvestigationId))
        .filter(id => Number.isFinite(id) && id > 0);

      if (checked) {
        setSelectedReportPatientInvestigationIds(prev => {
          const merged = Array.from(new Set([...prev, ...eligibleReportIds]));
          setPatientInvestigationIds(merged.join(","));
          return merged;
        });
      } else {
        const visibleEligibleSet = new Set(eligibleReportIds);
        setSelectedReportPatientInvestigationIds(prev => {
          const next = prev.filter(id => !visibleEligibleSet.has(id));
          setPatientInvestigationIds(next.join(","));
          return next;
        });
      }
    }
  };

  const reportCheckboxRowHandler = (item: LabResultEntryTableData, checked: boolean) => {
    const id = Number(item?.PatientInvestigationId);
    if (!Number.isFinite(id) || id <= 0) return;

    setSelectedReportPatientInvestigationIds(prev => {
      const next = checked ? Array.from(new Set([...prev, id])) : prev.filter(v => v !== id);
      setPatientInvestigationIds(next.join(","));
      return next;
    });
  };

  // sample collection date time handler
  const sampleCollectionDateTime = (item: LabResultEntryTableData, value: string) => {
    const id = item.PatientInvestigationId;

    setLabResultEntryTableData(prev =>
      prev.map(row => (row.PatientInvestigationId === id ? { ...row, sampleDateTime: value } : row))
    );

    setUpdatedSampleCollectionTable(prev =>
      prev.map(row => (row.PatientInvestigationId === id ? { ...row, sampleDateTime: value } : row))
    );
  };

  // save sample collection
  const handleSaveSampleCollection = async () => {
    if (updatedSampleCollectionTable.length === 0) {
      showInfo("Please select ateast one sample collection");
      return;
    }
    const payload = updatedSampleCollectionTable?.map(u => {
      return {
        patientInvestigationId: u?.PatientInvestigationId,
        barCode: u?.Barcode,
        statusId: 1,
        defaultSampleTypeId: u?.DefaultSampleTypeId,
        labNo: u?.LabNo,
        sampleDateTime: u.sampleDateTime || getLocalDateTime(),
      };
    });

    const finalPayload = {
      samples: payload,
    };

    const resp = await fetchApi(
      "PATCH",
      ENDPOINTS.UPDATE_SAMPLE_STATUS,
      finalPayload,
      {},
      { component: "SampleManagement" }
    );
    if (!resp?.result) {
      showError(resp?.message ?? error?.message ?? "something went wrong");
      return;
    }
    showSuccess(resp?.message ?? "Data saved successfully");

    setUpdatedSampleCollectionTable([]);
    setUpdatedDepartmentReceiving([]);

    await fetchLabData(getValues());
  };

  // save dept receive
  const handleDepartmentReceive = async () => {
    if (updatedDepartmentReceiving.length === 0) {
      showInfo("Please select ateast one department receiving");
      return;
    }
    const payload = updatedDepartmentReceiving?.map(u => {
      return {
        patientInvestigationId: u?.PatientInvestigationId,
        barCode: u?.Barcode,
        statusId: 3,
        defaultSampleTypeId: u?.DefaultSampleTypeId,
        labNo: u?.LabNo,
        sampleDateTime: u?.sampleDateTime || getLocalDateTime(),
      };
    });

    const finalPayload = {
      samples: payload,
    };

    const resp = await fetchApi(
      "PATCH",
      ENDPOINTS.UPDATE_SAMPLE_STATUS,
      finalPayload,
      {},
      { component: "SampleManagement" }
    );
    if (!resp?.result) {
      showError(resp?.message ?? error?.message ?? "something went wrong");
      return;
    }
    showSuccess(resp?.message ?? "Data saved successfully");

    setUpdatedSampleCollectionTable([]);
    setUpdatedDepartmentReceiving([]);

    await fetchLabData(getValues());
  };

  // cancel handler
  const cancelHandler = () => {
    reset({
      typeId: 0,
      uhid: "",
      ipdNo: "",
      labNo: "",
      fromDate: currentDate,
      toDate: currentDate,
      statusId: 0,
      barcode: "",
      patientName: "",
      subCategoryId: 1,
      subSubCategoryId: 0,
      investigationId: 0,
      canSampleCollect: canCollectSample,
    });
  };

  // patient investigation info

  const patientInvestigationInfoHandler = (item: LabResultEntryTableData) => {
    setSelectedPatient(item);
    setRenderPatientInfoPopup(true);
    setOpenPatientInfoPopup(true);
  };
  const closePatientInvestigationInfo = useCallback(() => {
    setOpenPatientInfoPopup(false);
  }, []);

  // patient document handler
  const patientDocumentHandler = (item: LabResultEntryTableData) => {
    if (!item) return;
    setOpenPatientDocuments(true);
    setRenderPatientDocument(true);
    setSelectedPatientDocument(item);
  };

  // close document handler
  const closeDocumentHandler = useCallback(() => {
    setOpenPatientDocuments(false);
    setSelectedPatientDocument(null);
  }, []);

  // sample remark handler
  const sampleRemarkHandler = (item: LabResultEntryTableData) => {
    setRemarkItem(item);
    setRenderRemarkPopup(true);
    setOpenRemarkPopup(true);
  };

  // close remark popup
  const closeRemarkPopup = useCallback(() => {
    setOpenRemarkPopup(false);
    setRemarkItem(null);
  }, []);

  // lab result entry for investigation
  const serviceNameHandler = (item: LabResultEntryTableData) => {
    navigate(`/investigation-result-entry/pathology/${item?.PatientInvestigationId}`, {
      state: item,
    });
  };

  // allReportPrintHandler
  const allReportPrintHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const checkedValue = e.target.checked ? 1 : 0;
    setIsHeaderPng(checkedValue);
  };

  // print  bulk report handler
  const printBulkReportHandler = async () => {
    if (!branchId) {
      showWarning("Branch not found");
      return;
    }

    if (!patientInvestigationIds.trim()) {
      showWarning("Please select at least one approved report");
      return;
    }

    try {
      const resp = await fetchApi<Blob>(
        "GET",
        ENDPOINTS.PRINT_PATIENT_INVESTIGATION_REPORT,
        {},
        {
          params: {
            BranchId: branchId,
            IsHeaderPng: isHeaderPng,
            PatientInvestigationIds: patientInvestigationIds,
            Download: true,
          },
          responseType: "blob",
        }
      );

      if (!resp) {
        showWarning("Unable to generate report");
        return;
      }

      // create blob url
      const pdfBlob = new Blob([resp], {
        type: "application/pdf",
      });

      const pdfUrl = window.URL.createObjectURL(pdfBlob);

      // open in new tab
      const newTab = window.open(pdfUrl, "_blank", "noopener,noreferrer");

      // Reset print selections after successful open
      setSelectedReportPatientInvestigationIds([]);
      setPatientInvestigationIds("");
      setIsHeaderPng(0);

      // cleanup memory
      setTimeout(() => {
        window.URL.revokeObjectURL(pdfUrl);
      }, 60_000);
    } catch {
      showError("Unable to open report");
    }
  };
  return (
    <div className="page-container">
      <h1 className="page-heading">Pathology Result Entry</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Pathology Result Entry</span>
      </nav>
      <div className="card mb-2">
        <form onSubmit={handleSubmit(onsubmit)}>
          <div className="form-grid-4">
            <InputField label="from Date">
              <Controller
                name="fromDate"
                control={control}
                render={({ field }) => <CustomDateInput max={currentDate} {...field} />}
              />
            </InputField>

            <InputField label="To Date">
              <Controller
                name="toDate"
                control={control}
                render={({ field }) => <CustomDateInput max={currentDate} {...field} />}
              />
            </InputField>

            {/* <InputField label="Patient Name">
              <input
                type="text"
                className="input-field"
                placeholder="Enter patient name"
                {...register("patientName")}
              />
            </InputField> */}

            <InputField label="Type">
              <select className="input-field" {...register("typeId")}>
                <option value={0}>All</option>
                <option value={1}>OPD</option>
                <option value={2}>IPD</option>
              </select>
            </InputField>

            {/* <InputField label="IPD Number">
              <input
                type="text"
                className="input-field"
                placeholder="Enter ipd number "
                {...register("ipdNo")}
              />
            </InputField> */}

            <InputField label="Lab Number">
              <input
                type="text"
                className="input-field"
                placeholder="Enter lab number "
                {...register("labNo")}
              />
            </InputField>

            <InputField label="UHID">
              <input
                type="text"
                className="input-field"
                placeholder="Enter UHID"
                {...register("uhid")}
              />
            </InputField>

            <InputField label="Barcode">
              <input
                type="text"
                className="input-field"
                placeholder="Enter barcode"
                {...register("barcode")}
              />
            </InputField>

            <InputField label=" Department">
              <select className="input-field" {...register("subSubCategoryId")}>
                <option value={0}>All</option>

                {subSubCategoryList.map(subSubCategory => (
                  <option
                    key={subSubCategory.subSubCategoryId}
                    value={subSubCategory.subSubCategoryId}
                  >
                    {subSubCategory.subSubCategoryName}
                  </option>
                ))}
              </select>
            </InputField>

            {/* <InputField label="Investigation Name">
              <Select<SelectItem, false>
                value={selectedInvestigationName}
                options={investigationNameSelectOptions}
                placeholder="Select investigation name"
                isSearchable
                isClearable
                onChange={option => investigationSelectHandler(option)}
                styles={SelectStyles as StylesConfig<SelectItem, false>}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </InputField> */}

            <InputField label="Quick Search">
              <input
                type="text"
                className="input-field"
                placeholder="Enter for quick search "
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
              />
            </InputField>
          </div>
          <div className="mt-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center">
                <span className="name-header">Total Patient:</span>
                <span className="ml-2">{totalPatientCount}</span>
              </div>

              <div className="flex items-center">
                <span className="name-header">Total Test:</span>
                <span className="ml-2">{totalTestCount}</span>
              </div>

              <div className="flex items-center">
                <span className="name-header">Approved Test:</span>
                <span className="ml-2">{approvedTestCount}</span>
              </div>

              <div className="flex items-center">
                <span className="name-header">Pending Test:</span>
                <span className="ml-2">{pendingTestCount}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div>
                <input
                  type="checkbox"
                  className="input-checkbox mt-3"
                  checked={isHeaderPng === 1}
                  onChange={allReportPrintHandler}
                />
                <span className="m-2 font-bold">IsHeader</span>
              </div>
              <button
                type="button"
                className="save-btn w-full sm:w-auto"
                onClick={printBulkReportHandler}
              >
                Print
              </button>

              <button type="submit" className="save-btn w-full sm:w-auto">
                Search
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* render buttons */}
      <div className="flex lg:flex-row sm:flex-col gap-2 m-2 overflow-x-auto">
        {renderButton(LabResultEntryButtons)}
      </div>
      {/* table */}
      {!!showTable && (
        <div className="table-container  ">
          <div className="table-scroll-wrapper ">
            <div className="table-size lg:min-h-73 lg:max-h-73 ">
              <table className="base-table ">
                <thead className="table-head">
                  <tr>
                    {(canCollectSample > 0
                      ? LabResultEntryTableHeaderForSampleCollect
                      : LabResultEntryTableHeaderNotCollect
                    )?.map((h, index) => {
                      const isSampleHeader = h === "Sample Collection";
                      const isDeptHeader = h === "Dept. Rec.";
                      const isReportPrint = h === "Print";

                      const showCheckbox =
                        (canCollectSample > 0 && (isSampleHeader || isDeptHeader)) || isReportPrint;

                      // Calculate eligible sample items
                      const eligibleSampleItems = visibleTableData.filter(
                        item => item.IsSampleCollected === 0 && item.isSampleRejected === 0
                      );

                      // Check if all eligible sample items are in the updated list
                      const isAllSampleChecked =
                        eligibleSampleItems.length > 0 &&
                        eligibleSampleItems.every(item =>
                          updatedSampleCollectionTable.some(
                            s => s.PatientInvestigationId === item.PatientInvestigationId
                          )
                        );

                      // Calculate eligible department receiving items
                      const eligibleDeptItems = visibleTableData.filter(
                        item =>
                          item.IsDepartmentReceivingRequired === 1 &&
                          item.IsSampleCollected === 1 &&
                          item.IsSampleReceivedByDepartment === 0 &&
                          item.Barcode !== "SNR"
                      );

                      // Check if all eligible department items are in the updated list
                      const isAllDeptChecked =
                        eligibleDeptItems.length > 0 &&
                        eligibleDeptItems.every(item =>
                          updatedDepartmentReceiving.some(
                            s => s.PatientInvestigationId === item.PatientInvestigationId
                          )
                        );

                      const eligibleReportItems = visibleTableData.filter(
                        item => Number(item?.IsReportApproved) === 1
                      );
                      const isAllReportChecked =
                        eligibleReportItems.length > 0 &&
                        eligibleReportItems.every(item =>
                          selectedReportPatientInvestigationIds.includes(
                            Number(item?.PatientInvestigationId)
                          )
                        );

                      return (
                        <th key={index} className="table-th">
                          {showCheckbox ? (
                            <span className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                className="input-checkbox"
                                checked={
                                  isSampleHeader
                                    ? isAllSampleChecked
                                    : isDeptHeader
                                      ? isAllDeptChecked
                                      : isReportPrint
                                        ? isAllReportChecked
                                        : false
                                }
                                onChange={e => checkboxHandler(h, e.target.checked)}
                              />
                              {h}
                            </span>
                          ) : (
                            h
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody>
                  {visibleTableData?.length === 0 && (
                    <tr>
                      <td
                        colSpan={LabResultEntryTableHeaderForSampleCollect.length}
                        className="table-empty"
                      >
                        No records found
                      </td>
                    </tr>
                  )}

                  {visibleTableData.map((item, idx) => (
                    <tr key={item?.PatientInvestigationId} className="table-row">
                      <td className="table-td">{idx + 1}</td>
                      <td className="table-td">{item?.LabNo || "-"}</td>

                      <td className="table-td">{item?.BillDate || "-"}</td>
                      <td className="table-td">{item?.Type || "-"}</td>

                      <td className="table-td">{item?.UHID || "-"}</td>
                      <td className="table-td">{item?.IPDNo || 0}</td>

                      <td className="table-td max-w-50">{item?.PatientName ?? "-"}</td>
                      <td className="table-td">
                        {item?.CurrentAge || "-"} / {item?.Gender}
                      </td>
                      <td
                        className={`table-td max-w-70 ${
                          !item?.IsSampleCollected || !item?.IsSampleReceivedByDepartment
                            ? "cursor-not-allowed opacity-80"
                            : "cursor-pointer"
                        }`}
                        onClick={() => {
                          if (item?.IsSampleCollected && item?.IsSampleReceivedByDepartment) {
                            serviceNameHandler(item);
                          }
                        }}
                      >
                        <span className="service-btn" style={getBadgeStyle(item)}>
                          {item?.Name || "-"}
                        </span>
                      </td>

                      {/* sample type */}
                      <td className="table-td">
                        {(() => {
                          const parsedSampleTypes = sampleArrayFormation(
                            item?.SampleTypeList || ""
                          );
                          const currentSampleTypeId = item?.DefaultSampleTypeId ?? 0;
                          const hasCurrentOption = parsedSampleTypes.some(
                            sampleType => sampleType.id === currentSampleTypeId
                          );
                          const selectedSampleTypeId = hasCurrentOption ? currentSampleTypeId : 0;

                          return (
                            <select
                              className={`${item?.IsSampleCollected === 1 ? "disabled-input-field cursor-not-allowed" : "input-field"}`}
                              disabled={item?.IsSampleCollected === 1}
                              value={selectedSampleTypeId}
                              onChange={e => selectSampleTypeHandler(idx, Number(e.target.value))}
                            >
                              <option value={0}></option>
                              {parsedSampleTypes?.map(sampleType => (
                                <option key={sampleType.id} value={sampleType.id}>
                                  {sampleType.name}
                                </option>
                              ))}
                            </select>
                          );
                        })()}
                      </td>

                      {/* barcode */}
                      <td className="table-td">
                        <input
                          type="text"
                          className={`${Number(item.IsSampleCollected) === 1 ? "disabled-input-field max-w-20" : "input-field max-w-20"}`}
                          value={item?.Barcode ?? ""}
                          onChange={e => handleBarcodeChange(item, e)}
                          disabled={Number(item.IsSampleCollected) === 1}
                        />
                      </td>

                      {canCollectSample > 0 ? (
                        <>
                          {/* color code */}
                          <td className="table-td">
                            {(() => {
                              const parsedSampleTypes = sampleArrayFormation(
                                item?.SampleTypeList || ""
                              );
                              const currentSampleTypeId = item?.DefaultSampleTypeId ?? 0;
                              const hasCurrentOption = parsedSampleTypes.some(
                                sampleType => sampleType.id === currentSampleTypeId
                              );
                              const sampleTypeId = hasCurrentOption ? currentSampleTypeId : 0;

                              const selectedSampleType = parsedSampleTypes.find(
                                sampleType => sampleType.id === sampleTypeId
                              );
                              const colorCode =
                                sampleTypeId === 0
                                  ? "#ffffff"
                                  : selectedSampleType?.color || "#ffffff";

                              return (
                                <div className="flex items-center gap-2">
                                  <span
                                    className="px-1 py-3 rounded-md border inline-block min-w-6"
                                    style={{
                                      backgroundColor: colorCode,
                                      borderColor: colorCode,
                                      color: colorCode,
                                    }}
                                  ></span>
                                  {/* <span className="text-xs font-medium">{hexCode}</span> */}
                                </div>
                              );
                            })()}
                          </td>
                          {/* sample collection */}
                          <td className="table-td">
                            {item?.IsSampleCollected === 0 && item?.isSampleRejected === 0 ? (
                              <div className="flex flex-col m-1">
                                <input
                                  type="checkbox"
                                  className="input-checkbox mb-1"
                                  checked={updatedSampleCollectionTable.some(
                                    s => s.PatientInvestigationId === item.PatientInvestigationId
                                  )}
                                  onChange={() => handleCheckboxChange(item)}
                                />
                                <CustomDateTimeInput
                                  value={item.sampleDateTime || currentDateTime}
                                  onChange={val => sampleCollectionDateTime(item, val)}
                                />
                              </div>
                            ) : (
                              <div className="flex flex-col m-1">
                                <input
                                  type="checkbox"
                                  className="input-checkbox"
                                  checked={Number(item.IsSampleCollected) === 1}
                                  disabled={Number(item.IsSampleCollected) === 1}
                                />
                                <span className="font-semibold">{item?.SampleCollectedOn}</span>
                              </div>
                            )}
                          </td>
                          {/* department receiving required checkbox */}
                          <td className="table-td">
                            {item?.IsSampleReceivedByDepartment === 0 &&
                            item?.IsDepartmentReceivingRequired === 1 &&
                            item?.IsSampleCollected === 1 ? (
                              <div className="flex flex-col">
                                <input
                                  type="checkbox"
                                  className="input-checkbox mb-1"
                                  checked={updatedDepartmentReceiving.some(
                                    s => s.PatientInvestigationId === item.PatientInvestigationId
                                  )}
                                  onChange={() => handleDeptRecvChange(item)}
                                />
                                <CustomDateTimeInput
                                  value={item.sampleDateTime || currentDateTime}
                                  onChange={val => departmentReceiveDateTime(item, val)}
                                />
                              </div>
                            ) : item?.IsDepartmentReceivingRequired === 1 &&
                              item?.IsSampleReceivedByDepartment === 1 ? (
                              <div className="flex flex-col">
                                <input
                                  type="checkbox"
                                  className="input-checkbox"
                                  checked={true}
                                  disabled={true}
                                />
                                <span className="font-semibold">
                                  {item?.SampleReceivedByDepartmentOn}
                                </span>
                              </div>
                            ) : (
                              <></>
                            )}
                          </td>
                        </>
                      ) : (
                        <></>
                      )}

                      <td className="table-td max-w-50">
                        {item?.IsReportApproved === 0 ? "No" : "yes"}
                      </td>

                      <td className="table-td max-w-50">{item?.ReportApprovedOn ?? "-"}</td>

                      <td className="table-td" onClick={() => sampleRemarkHandler(item)}>
                        <i className="fa-solid fa-plus icon-color-button"></i>
                      </td>

                      <td className="table-td max-w-50">
                        {item?.IsReportApproved ? (
                          <input
                            type="checkbox"
                            className="input-checkbox"
                            checked={selectedReportPatientInvestigationIds.includes(
                              Number(item?.PatientInvestigationId)
                            )}
                            onChange={e => reportCheckboxRowHandler(item, e.target.checked)}
                          />
                        ) : (
                          <></>
                        )}
                      </td>

                      <td className="table-td">
                        {item?.IsReportApproved ? (
                          <i className="fa-solid fa-print icon-color-button"></i>
                        ) : (
                          <></>
                        )}
                      </td>

                      <td className="table-td" onClick={() => patientDocumentHandler(item)}>
                        <i className="fa-solid fa-file icon-color-button ml-5"></i>
                      </td>

                      <td
                        className="table-td"
                        onClick={() => patientInvestigationInfoHandler(item)}
                      >
                        <i className="fa-solid fa-info icon-color-button"></i>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {!!canCollectSample && canCollectSample > 0 ? (
            <div className="form-actions-responsive mt-3">
              <button type="submit" className="save-btn" onClick={handleSaveSampleCollection}>
                Save Sample Collection
              </button>
              <button type="submit" className="save-btn" onClick={handleDepartmentReceive}>
                Save Dept Receive
              </button>

              <button type="button" className="save-btn">
                Reprint Barcode Sticker
              </button>

              <button type="button" className="cancel-button " onClick={cancelHandler}>
                Cancel
              </button>
            </div>
          ) : (
            <></>
          )}
        </div>
      )}
      {/* remark popup */}
      {!!renderRemarkPopup && (
        <LRRemarkPopup
          isOpen={openRemarkPopup}
          onClose={closeHandler}
          data={selectedRemarkPatient}
        />
      )}

      {/* patient investigation details */}
      {!!renderPatientInfoPopup && (
        <LabPatientInfo
          isOpen={openPatientInfoPopup}
          onClose={closePatientInvestigationInfo}
          data={selectedPatient}
        />
      )}

      {/*remark popup  */}
      {!!renderRemarkPopup && (
        <SampleRemarks isOpen={openRemarkPopup} onClose={closeRemarkPopup} data={remarkItem} />
      )}

      {/* patient documents */}
      {!!renderPatientDocument && (
        <SampleManagementPatientDocument
          isOpen={openPatientDocuments}
          onClose={closeDocumentHandler}
          data={selectedPatientDocument}
        />
      )}

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default PathologyResultEntry;
