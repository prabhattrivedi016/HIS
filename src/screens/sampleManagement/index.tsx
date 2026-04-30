import { getCorporateMaster } from "@/api/globalApiCall";
import CustomDateInput from "@/components/customDateInput";
import CustomDateTimeInput from "@/components/customDateTimeInput";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import LabPatientInfo from "@/components/SingledrawerAndPopup";
import { ENDPOINTS } from "@/config/defaults";
import { Status } from "@/constants/constants";
import { sampleManagementButtons, SampleManagementTableHeader } from "@/constants/tableHeaders";
import { AuthContext } from "@/context/AuthContext";
import { RoleContext } from "@/context/RoleContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showInfo, showSuccess, showWarning } from "@/utils/alert";
import {
  SampleManagementFormData,
  sampleManagementSchema,
} from "@/validation/sampleManagementSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { BriefcaseMedical } from "lucide-react";
import { ChangeEvent, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
import PatientInvestigationDetails from "./components/PatientInvestigationDetails";
import RejectSamplePopup from "./components/RejectSamplePopup";
import RemarkPopup from "./components/RemarkPopup";
import { ButtonValue, CorporateList, SampleManagementTableData } from "./types";

const SampleManagement = () => {
  const getLocalDateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  };
  const currentDate = new Date().toISOString().split("T")[0];
  const currentDateTime = getLocalDateTime();

  const { loading, error, fetchApi } = useGlobalApi();

  const authContext = useContext(AuthContext);
  const branchId = Number(authContext?.user?.branchId ?? 1);

  const roleContext = useContext(RoleContext);
  const roleId = Number(roleContext?.roleId ?? 3);

  const [activeIndex, setActiveIndex] = useState(0);

  const [openPatientDrawer, setOpenPatientDrawer] = useState<boolean>(false);
  const [renderPatientDrawer, setRenderPatientDrawer] = useState<boolean>(false);
  const [patientInvestigation, setPatientInvestigation] =
    useState<SampleManagementTableData | null>(null);

  const [openRejectPopup, setOpenRejectPopup] = useState<boolean>(false);
  const [renderRejectPopup, setRenderRejectPopup] = useState<boolean>(false);
  const [rejectItem, setRejectItem] = useState<SampleManagementTableData | null>(null);

  const [openRemarkPopup, setOpenRemarkPopup] = useState<boolean>(false);
  const [renderRemarkPopup, setRenderRemarkPopup] = useState<boolean>(false);
  const [remarkItem, setRemarkItem] = useState<SampleManagementTableData | null>(null);

  const [corporateList, setCorporateList] = useState<CorporateList[]>([]);
  const [sampleManagementTableData, setSampleManagementTableData] = useState<
    SampleManagementTableData[]
  >([]);

  const [updatedSampleCollectionTable, setUpdatedSampleCollectionTable] = useState<
    SampleManagementTableData[]
  >([]);

  const [updatedDepartmentReceiving, setUpdatedDepartmentReceiving] = useState<
    SampleManagementTableData[]
  >([]);

  const [activeFilter, setActiveFilter] = useState<string>(sampleManagementButtons[0]?.buttonName);
  const [showTable, setShowTable] = useState<boolean>(false);

  const [openPatientInfo, setOpenPatientInfo] = useState<boolean>(false);
  const [renderPatientInfo, setRenderPatientInfo] = useState<boolean>(false);
  const [selectedPatient, setSelectedPatient] = useState<SampleManagementTableData | null>(null);

  const [searchValue, setSearchValue] = useState<string>("");

  const hasFetched = useRef(false);

  // filter visible data
  const visibleTableData = useMemo(() => {
    const normalizedSearch = searchValue.toLowerCase().trim();
    const isSearching = normalizedSearch.length > 0;

    const baseData = isSearching
      ? sampleManagementTableData.filter(row =>
          [
            row?.Barcode,
            row?.LabNo,
            row?.BillDate,
            row?.UHID,
            row?.PatientName,
            row?.CurrentAge,
            row?.CorporateName,
            row?.Name,
            row?.SampleTypeName,
            row?.selectedSampleType,
          ].some(field => field?.toString().toLowerCase().includes(normalizedSearch))
        )
      : sampleManagementTableData;

    return filterByButton(activeFilter, baseData);
  }, [activeFilter, sampleManagementTableData, searchValue]);
  // close patient drawer
  const closeDrawer = useCallback(() => {
    setOpenPatientDrawer(false);
  }, []);

  // close reject popup
  const closeRejectPopup = useCallback(() => {
    setOpenRejectPopup(false);
  }, []);

  // close remark popup
  const closeRemarkPopup = useCallback(() => {
    setOpenRemarkPopup(false);
  }, []);

  // form data
  const { register, handleSubmit, control, getValues } = useForm({
    resolver: yupResolver(sampleManagementSchema),
    defaultValues: {
      branchId: 1,
      uhid: "",
      barCode: "",
      patientName: "",
      labNo: "",
      fromDate: currentDate,
      toDate: currentDate,
      corporateId: 0,
      statusId: 0,
    },
  });

  // corporate master data
  const fetchCorporateData = async () => {
    const resp = await getCorporateMaster(fetchApi, "SampleManagement");
    setCorporateList(resp);
  };

  useEffect(() => {
    fetchCorporateData();
  }, []);

  // sample management color coding
  const getColorFromButton = (buttonName: string) => {
    return sampleManagementButtons.find(b => b.buttonName === buttonName)?.color;
  };

  const getInvestigationColor = (item: SampleManagementTableData) => {
    if (item.isSampleRejected === 1) return getColorFromButton("rejected");
    if (item.isUrgent === 1) return getColorFromButton("urgentSample");
    if (item.IsSampleCollected === 1) return getColorFromButton("sampleCollected");
    if (item.IsDepartmentReceivingRequired === 1 && item.IsSampleReceivedByDepartment === 0)
      return getColorFromButton("deptRecPending");

    if (item.IsSampleReceivedByDepartment === 1) return getColorFromButton("deptReceived");

    return getColorFromButton("collectionPending");
  };

  // filter by buttons
  function filterByButton(buttonName: string, source: SampleManagementTableData[]) {
    switch (buttonName) {
      case "all":
        return source;

      case "collectionPending":
        return source.filter(item => Number(item.IsSampleCollected) === Status?.INACTIVE);

      case "sampleCollected":
        return source.filter(item => Number(item.IsSampleCollected) === Status?.ACTIVE);

      case "deptRecPending":
        return source.filter(
          item => Number(item.IsSampleReceivedByDepartment) === Status?.INACTIVE
        );

      case "deptReceived":
        return source.filter(item => Number(item.IsSampleReceivedByDepartment) === Status?.ACTIVE);

      case "urgentSample":
        return source.filter(item => Number(item.isUrgent) === Status?.ACTIVE);

      case "rejected":
        return source.filter(item => Number(item.isSampleRejected) === Status?.ACTIVE);

      default:
        return source;
    }
  }

  // button count
  const getButtonCount = (buttonName: string) =>
    filterByButton(buttonName, sampleManagementTableData).length;

  // based on filter
  // const getButtonCount = (buttonName: string) => {
  //   const baseData = filteredSampleManagementData.length
  //     ? filteredSampleManagementData
  //     : sampleManagementTableData;

  //   return filterByButton(buttonName, baseData).length;
  // };

  // reusable fetch data function
  const fetchSampleData = async (formData?: SampleManagementFormData) => {
    if (!branchId || !roleId) {
      showError(error?.message ?? "Something went wrong!");
      return;
    }

    const resp = await fetchApi(
      "GET",
      ENDPOINTS.SEARCH_PATIENT_INVESTIGATION_FOR_SAMPLE_MANAGEMENT,
      {},
      {
        params: {
          branchId,
          roleId,
          uhid: formData?.uhid || "",
          barCode: formData?.barCode || "",
          patientName: formData?.patientName || "",
          labNo: formData?.labNo || "",
          fromDate: formData?.fromDate || currentDate,
          toDate: formData?.toDate || currentDate,
          corporateId: Number(formData?.corporateId ?? 0),
          statusId: Number(formData?.statusId ?? 0),
        },
      },
      { component: "SampleManagement" }
    );

    //  No data
    if (!resp?.result) {
      showWarning(resp?.message ?? "No data found");
      setShowTable(false);
      setSampleManagementTableData([]);
      return;
    }

    //  Process data
    const tableData = resp.data as SampleManagementTableData[];

    //  Barcode fallback (ONLY ON LOAD)
    const finalData = tableData.map(item => {
      const existing = sampleManagementTableData.find(
        prev => prev.PatientInvestigationId === item.PatientInvestigationId
      );

      return {
        ...item,
        Barcode:
          existing?.Barcode ||
          (item?.Barcode && item.Barcode !== "0" ? item.Barcode : item?.LabNo?.toString() || ""),
      };
    });

    //  Set state
    setSampleManagementTableData(finalData);
    setShowTable(true);

    //  Reset selection (important)
    setUpdatedSampleCollectionTable([]);

    //  Reset filter UI
    setActiveIndex(0);
    setActiveFilter(sampleManagementButtons[0]?.buttonName);
  };

  useEffect(() => {
    if (branchId && roleId && !hasFetched.current) {
      hasFetched.current = true;
      fetchSampleData();
    }
  }, [branchId, roleId]);

  // search handler
  const onsubmit = async (formData: SampleManagementFormData) => {
    await fetchSampleData(formData);
  };

  // button click handler
  const buttonClickHandler = (value: string) => {
    setActiveFilter(value);
  };

  // handle barcode change
  const handleBarcodeChange = (
    item: SampleManagementTableData,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    const id = item.PatientInvestigationId;

    setSampleManagementTableData(prev =>
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

    setUpdatedDepartmentReceiving(prev =>
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
  const handleCheckboxChange = (item: SampleManagementTableData) => {
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
      (S: SampleManagementTableData) => S?.PatientInvestigationId === id
    );

    if (!collectedSample) {
      setUpdatedSampleCollectionTable(prev => [...prev, { ...item }]);
    } else {
      setUpdatedSampleCollectionTable(prev => prev.filter(s => s.PatientInvestigationId !== id));
    }
  };

  // department receiving change
  const handleDeptRecvChange = (item: SampleManagementTableData) => {
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

  // header checkbox handler

  const checkboxHandler = (h: string, checked: boolean) => {
    const visibleIds = new Set(visibleTableData.map(item => item.PatientInvestigationId));

    // sample collection
    if (h === "Sample Collection") {
      if (checked) {
        const validRows = visibleTableData.filter(item => {
          const barcode = item?.Barcode?.toString().trim() || item?.LabNo?.toString().trim() || "";

          return barcode && barcode !== "0" && item?.IsSampleCollected !== 1;
        });

        setUpdatedSampleCollectionTable(prev => {
          const existingIds = new Set(prev.map(p => p.PatientInvestigationId));
          const newItems = validRows.filter(item => !existingIds.has(item.PatientInvestigationId));
          return [...prev, ...newItems];
        });
      } else {
        setUpdatedSampleCollectionTable(prev =>
          prev.filter(item => !visibleIds.has(item.PatientInvestigationId))
        );
      }
    }

    // department receiving
    if (h === "Dept. Rec.") {
      const eligibleRows = visibleTableData.filter(
        item =>
          item.IsDepartmentReceivingRequired === 1 &&
          item.IsSampleCollected === 1 &&
          item.IsSampleReceivedByDepartment === 0 &&
          item.Barcode !== "SNR"
      );

      const eligibleIds = new Set(eligibleRows.map(item => item.PatientInvestigationId));

      if (checked) {
        setUpdatedDepartmentReceiving(prev => {
          const existingIds = new Set(prev.map(p => p.PatientInvestigationId));
          const newItems = eligibleRows.filter(
            item => !existingIds.has(item.PatientInvestigationId)
          );
          return [...prev, ...newItems];
        });
      } else {
        setUpdatedDepartmentReceiving(prev =>
          prev.filter(item => !eligibleIds.has(item.PatientInvestigationId))
        );
      }
    }
  };

  // render button

  const renderButton = (buttons: ButtonValue[]) => {
    return buttons.map((b, idx) => {
      const isActive = idx === activeIndex;

      return (
        <button
          key={idx}
          type="button"
          onClick={() => {
            setActiveIndex(idx);
            buttonClickHandler(b.buttonName);
          }}
          style={{
            backgroundColor: isActive ? b.color : "#fff",
            color: isActive ? "#000" : "#333",
            border: `1px solid ${b.color}`,
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition`}
        >
          <BriefcaseMedical
            size={18}
            style={{
              backgroundColor: b.color,
              borderRadius: "4px",
              padding: "2px",
            }}
          />

          <span>
            {b.level} : {getButtonCount(b.buttonName)}
          </span>
        </button>
      );
    });
  };

  // sample name
  const getBadgeStyle = (item: SampleManagementTableData) => {
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

  const normalizeSampleTypeName = (value: string) => (value || "").toLowerCase().trim();

  const resolveSampleTypeId = (item: SampleManagementTableData) => {
    if (item.DefaultSampleTypeId) return Number(item.DefaultSampleTypeId);

    const rowSampleTypeName = normalizeSampleTypeName(
      item.SampleTypeName || item.selectedSampleType || ""
    );
  };

  const enrichRowsWithSampleType = (rows: SampleManagementTableData[]) => {
    return rows.map(item => {
      const sampleTypeId = resolveSampleTypeId(item);
      const sampleTypeName = item.SampleTypeName ?? "";
      return {
        ...item,
        DefaultSampleTypeId: sampleTypeId || item.DefaultSampleTypeId || 0,
        selectedSampleType: sampleTypeName,
      };
    });
  };

  // sample reject handler
  const rejectSampleHandler = (item: SampleManagementTableData) => {
    setRejectItem(item);
    setRenderRejectPopup(true);
    setOpenRejectPopup(true);
  };

  // sample reject handler
  const rejectRemarkHandler = (item: SampleManagementTableData) => {
    setRemarkItem(item);
    setRenderRemarkPopup(true);
    setOpenRemarkPopup(true);
  };

  // patient investigation handler
  const patientInvestigationHandler = (item: SampleManagementTableData) => {
    setRenderPatientInfo(true);
    setOpenPatientInfo(true);
    setSelectedPatient(item);
  };

  // select sample type handler
  const selectSampleTypeHandler = (index: number, value: number) => {
    const row = visibleTableData[index];
    if (!row) return;
    const parsedSampleTypes = sampleArrayFormation(row.SampleTypeList || "");
    const selectedType = parsedSampleTypes.find(sampleType => sampleType.id === value);
    const selectedTypeName = selectedType?.name ?? "";

    const updateRow = (item: SampleManagementTableData) =>
      item.PatientInvestigationId === row.PatientInvestigationId
        ? {
            ...item,
            DefaultSampleTypeId: value,
            selectedSampleType: selectedTypeName,
            SampleTypeName: selectedTypeName || item.SampleTypeName,
          }
        : item;

    setSampleManagementTableData(prev => prev.map(updateRow));
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

    await fetchSampleData(getValues());
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

    await fetchSampleData(getValues());
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

  // quick search handler
  const searchHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  // sample collection date time handler
  const sampleCollectionDateTime = (item: SampleManagementTableData, value: string) => {
    const id = item.PatientInvestigationId;

    setSampleManagementTableData(prev =>
      prev.map(row => (row.PatientInvestigationId === id ? { ...row, sampleDateTime: value } : row))
    );

    setUpdatedSampleCollectionTable(prev =>
      prev.map(row => (row.PatientInvestigationId === id ? { ...row, sampleDateTime: value } : row))
    );
  };

  // department receive date time handler
  const departmentReceiveDateTime = (item: SampleManagementTableData, value: string) => {
    const id = item.PatientInvestigationId;

    setSampleManagementTableData(prev =>
      prev.map(row => (row.PatientInvestigationId === id ? { ...row, sampleDateTime: value } : row))
    );

    setUpdatedDepartmentReceiving(prev =>
      prev.map(row => (row.PatientInvestigationId === id ? { ...row, sampleDateTime: value } : row))
    );
  };

  // close patient info
  const closePatientInfo = useCallback(() => {
    setOpenPatientInfo(false);
  }, []);

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
        <form onSubmit={handleSubmit(onsubmit)}>
          <div className="form-grid-4">
            {/* <InputField label="UHID">
              <input
                type="text"
                className="input-field"
                placeholder="Enter UHID "
                {...register("uhid")}
              />
            </InputField> */}
            {/* 
            <InputField label="Bar Code">
              <input
                type="text"
                className="input-field"
                placeholder="Enter Barcode No  & press Enter to search"
                {...register("barCode")}
                onKeyDown={searchByBarcode}
              />
            </InputField> */}

            {/* <InputField label="Patient Name">
              <input
                type="text"
                className="input-field"
                placeholder="Enter patient name "
                {...register("patientName")}
              />
            </InputField> */}

            {/* <InputField label="Lab No">
              <input
                type="text"
                className="input-field"
                placeholder="Enter lab number "
                {...register("labNo")}
              />
            </InputField> */}

            <InputField label="From Date">
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

            {/* <InputField label="Corporate">
              <select className="input-field" {...register("corporateId")}>
                <option value={"0"}>All</option>
                {corporateList?.map(c => (
                  <option key={c?.corporateId} value={c?.corporateId}>
                    {c?.corporateName}
                  </option>
                ))}
              </select>
            </InputField> */}

            {/* <InputField label="Status">
              <select className="input-field" {...register("statusId")}>
                <option value={"0"}>All</option>
              </select>
            </InputField> */}

            {/* <InputField label="Search By">
              <select className="input-field">
                <option>Select</option>
                <option value={"uhid"}>UHID</option>
                <option>Bar Code</option>
                <option>Patient Name</option>
                <option>Lab No</option>
                <option>Corporate</option>
              </select>
            </InputField> */}

            <InputField label="Quick Search">
              <input className="input-field" onChange={searchHandler} />
            </InputField>
          </div>

          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn ">
              Search
            </button>
            <button type="button" className="cancel-button ">
              Cancel
            </button>
          </div>
        </form>
      </div>
      {/* render buttons */}
      <div className="flex lg:flex-row sm:flex-col gap-2 m-2 overflow-x-auto">
        {renderButton(sampleManagementButtons)}
      </div>
      {/* table data */}
      {!!showTable && (
        <div className="table-container  ">
          <div className="table-scroll-wrapper ">
            <div className="table-size lg:min-h-96 lg:max-h-68 ">
              <table className="base-table ">
                <thead className="table-head">
                  <tr>
                    {SampleManagementTableHeader.map((h, index) => {
                      const isSampleHeader = h === "Sample Collection";
                      const isDeptHeader = h === "Dept. Rec.";

                      const isAllSampleChecked =
                        visibleTableData.length > 0 &&
                        visibleTableData.every(item =>
                          updatedSampleCollectionTable.some(
                            s => s.PatientInvestigationId === item.PatientInvestigationId
                          )
                        );

                      const eligibleDeptItems = visibleTableData.filter(
                        item =>
                          item.IsDepartmentReceivingRequired === 1 &&
                          item.IsSampleCollected === 1 &&
                          item.IsSampleReceivedByDepartment === 0 &&
                          item.Barcode !== "SNR"
                      );

                      const isAllDeptChecked =
                        eligibleDeptItems.length > 0 &&
                        eligibleDeptItems.every(item =>
                          updatedDepartmentReceiving.some(
                            s => s.PatientInvestigationId === item.PatientInvestigationId
                          )
                        );

                      return (
                        <th key={index} className="table-th">
                          {isSampleHeader || isDeptHeader ? (
                            <span className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                className="input-checkbox"
                                checked={isSampleHeader ? isAllSampleChecked : isAllDeptChecked}
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
                      <td colSpan={SampleManagementTableHeader.length} className="table-empty">
                        No records found
                      </td>
                    </tr>
                  )}

                  {visibleTableData.map((item, idx) => (
                    <tr key={item?.PatientInvestigationId} className="table-row">
                      <td className="table-td">{idx + 1}</td>
                      <td className="table-td">{item?.LabNo || "-"}</td>

                      <td className="table-td">{item?.BillDate || "-"}</td>
                      <td className="table-td">{item?.UHID || "-"}</td>
                      <td className="table-td max-w-50">{item?.PatientName ?? "-"}</td>
                      <td className="table-td">
                        {item?.CurrentAge || "-"} / {item?.Gender}
                      </td>
                      <td className="table-td">{item?.CorporateName || "-"}</td>
                      <td className="table-td max-w-70">
                        <span style={getBadgeStyle(item)}>{item?.Name || "-"}</span>
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

                      {/* color coding */}
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
                            sampleTypeId === 0 ? "#ffffff" : selectedSampleType?.color || "#ffffff";

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
                      {/* sample collection checkbox */}
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

                      <td className="table-td" onClick={() => rejectSampleHandler(item)}>
                        <i className="fa-solid fa-check icon-color-delete"></i>
                      </td>
                      <td className="table-td" onClick={() => rejectRemarkHandler(item)}>
                        <i className="fa-solid fa-plus icon-color-button"></i>
                      </td>

                      <td className="table-td" onClick={() => rejectRemarkHandler(item)}>
                        <i className="fa-solid fa-print icon-color-button"></i>
                      </td>

                      <td className="table-td" onClick={() => patientInvestigationHandler(item)}>
                        <i className="fa-solid fa-info icon-color-button"></i>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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

            <button type="button" className="cancel-button ">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* patient investigation drawer */}
      {!!renderPatientDrawer && (
        <PatientInvestigationDetails
          isOpen={openPatientDrawer}
          onClose={closeDrawer}
          data={patientInvestigation}
        />
      )}

      {/* reject popup */}
      {!!renderRejectPopup && (
        <RejectSamplePopup isOpen={openRejectPopup} onClose={closeRejectPopup} data={rejectItem} />
      )}

      {/*remark popup  */}
      {!!renderRemarkPopup && (
        <RemarkPopup isOpen={openRemarkPopup} onClose={closeRemarkPopup} data={remarkItem} />
      )}

      {/* patient info */}

      {!!renderPatientInfo && (
        <LabPatientInfo
          isOpen={openPatientInfo}
          onClose={closePatientInfo}
          data={selectedPatient}
        />
      )}

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default SampleManagement;

/*
"StatusId must be 1 (Sample Collection), 3 (Dept Receiving), or 6 (Dispatch)",
  "errors": { */

/*
     _data.forEach(function (r) {

                
                var rowColor = '';
                
                if (r.IsSampleCollected == 0 && _isSampleCollectionRequired == 1 && r.isSampleRejected == 0) {
                    $tr = '<tr class="IsSampleCollected" style="" id="' + r.PatientInvestigationId + '"  data-toggle="collapse" data-parent="#accordion" data-target="#' + r.PatientInvestigationId + 'Collapse"  aria-expanded="false" class="collapse1">';
                    $tr += '<td style="display:none" id="tdStatusId" value="1">1</td>';
                    rowColor = '#ffb7ae'; // pending color
                } else if (r.isSampleRejected == 1) {
                    $tr = '<tr class="IsSampleSegregated" style="" id="' + r.PatientInvestigationId + '"  data-toggle="collapse" data-parent="#accordion" data-target="#' + r.PatientInvestigationId + 'Collapse"  aria-expanded="false" class="collapse1">';
                    $tr += '<td style="display:none" id="tdStatusId" value="0">0</td>';
                    rowColor = '#fc6464'; // rejected color

                } else if (r.IsSampleReceivedByDepartment == 0 && r.IsDepartmentReceivingRequired == 1) {
                    $tr = '<tr class="IsSampleReceivedByDepartment" style="" id="' + r.PatientInvestigationId + '"  data-toggle="collapse" data-parent="#accordion" data-target="#' + r.PatientInvestigationId + 'Collapse"  aria-expanded="false" class="collapse1">';
                    $tr += '<td style="display:none" id="tdStatusId" value="3">3</td>';
                    $lblDepartmentReceivingPending++;
                    rowColor = '#ffb7ae'; // pending color

                }  // else if (r.IsResultDone == 0) {
                //$tr = '<tr class="IsResultDone" style="" id="' + r.PatientInvestigationId + '"  data-toggle="collapse" data-parent="#accordion" data-target="#' + r.PatientInvestigationId + 'Collapse"  aria-expanded="false" class="collapse1">';
                //$tr += '<td style="display:none" id="tdStatusId" value="4">4</td>';
                //rowColor = '#ffb7ae'; // pending color
                //  }

                else if (r.IsSampleCollected == 1) {
                    // collected but not in any of the above “pending/department” states
                    $tr = '<tr  class="IsDispatched" style="" id="' + r.PatientInvestigationId + '"  data-toggle="collapse" data-parent="#accordion" data-target="#' + r.PatientInvestigationId + 'Collapse"  aria-expanded="false" class="collapse1">';
                    $tr += '<td style="display:none" id="tdStatusId" value="2">2</td>';
                    rowColor = '#90bbfc'; // collected color

                } else {
                    $tr = '<tr  class="IsDispatched" style="" id="' + r.PatientInvestigationId + '"  data-toggle="collapse" data-parent="#accordion" data-target="#' + r.PatientInvestigationId + 'Collapse"  aria-expanded="false" class="collapse1">';
                    $tr += '<td style="display:none" id="tdStatusId" value="6">6</td>';
                    rowColor = '#90bbfc'; // default collected/fallback
                }

               
                if (r.Barcode == 'SNR') {
                    rowColor = '#ed61fd';
                    $lblSNR++;
                }
                
               
                if (r.isUrgent == 1) {
                  //  rowColor = '#ff0000';
                    $lblUrgent++;
                }
                
                
                $tr = $tr.replace('style=""', 'style="background-color:' + rowColor + ';"');

                $tr += '<td>' + $('#tblSearchResults tr').length + '</td>';
                if (uhidR == r.UHID && labNoR == r.LabNo && visitIdR == r.VisitId) {
                    $tr += '<td></td>';
                    $tr += '<td></td>';
                    $tr += '<td></td>';
                    $tr += '<td></td>';
                    $tr += '<td></td>';
                    $tr += '<td></td>';
                //    $tr += '<td></td>';
                }
                else {
                    $tr += '<td >' + r.LabNo + '</td>';
                    $tr += '<td >' + r.BillDate + '</td>';
                    $tr += '<td>' + r.UHID + '</td>';
                    $tr += '<td>' + r.PatientName + '</td>';
                    $tr += '<td>' + r.CurrentAge + '/' + r.Gender + '</td>';
                    $tr += '<td>' + r.ClientName + '</td>';
                //    $tr += '<td>' + r.CorporateName + '</td>';
                }

            if (r.isUrgent == 1) {
                $tr += ' <td class="urgent-cell"><b>U</b></td>';
            }
                else {
                    $tr += ' <td></td>';
                }

            
            if (r.Barcode == 'SNR') {
                $tr += '<td id="tdInvestigationName" class="rounded-corner-cell"   >' + r.Name + '</td>';//SNR
                $lblSNR++;
               // $lblSampleCollectionPending++;
            }
            else if (r.IsSampleCollected == 0 && r.isSampleRejected == 0) {
                $tr += '<td id="tdInvestigationName" class="rounded-corner-cell"   >' + r.Name + '</td>';//pending
                $lblSampleCollectionPending++;

            } else if (r.IsSampleReceivedByDepartment == 1 && r.IsDepartmentReceivingRequired == 1 && r.IsSampleCollected == 1) {//dept. rec.
                $tr += '<td id="tdInvestigationName" class="rounded-corner-cell"   >' + r.Name + '</td>';
                $lblDepartmentReceived++;

            } else if (r.isSampleRejected == 1 && r.IsSampleCollected == 0) {
                $tr += '<td id="tdInvestigationName" class="rounded-corner-cell"   >' + r.Name + '</td>';//rejected
                $lblRejected++;

            }
            else {
                $tr += '<td id="tdInvestigationName" class="rounded-corner-cell"   >' + r.Name + '</td>';//collected
            }


            $tr += '<td><select id="ddlSampleType" style="width:100px;" onchange="bindColorCode(this)">';
            var DefaultSampleTypeId = r.DefaultSampleTypeId;

            r.SampleTypeList.split('#').forEach(function (item) {
                var parts = item.split('*');
                var sampleTypeId = parts[0];
                var sampleType = parts[1];
                var colorCode = parts[2];
                if (DefaultSampleTypeId == sampleTypeId) {
                    $tr += '<option value="' + sampleTypeId + '" data-color="' + colorCode + '" selected="selected">' + (sampleType || ' ' ) + '</option>';
                    $defaultColor = colorCode;
                }
                else {
                    $tr += '<option value="' + sampleTypeId + '" data-color="' + colorCode + '">' + ( sampleType  || ' ') + '</option>';
                }
            });
            $tr += '</select></td>';
            $tr += '<td class="color-box" style="background-color:' + $defaultColor +'"></td>';



            $tr += '<td><input type="text" oninput="this.value = this.value.toUpperCase();" id="txtBarcode" maxlength="20" style="width:80px;" labNo="' + $.trim(r.LabNo) + '" onblur="$fillBarcodes(this)" ';
            if (r.IsSampleCollected == 0 && _isSampleCollectionRequired == 1) {
                if (r.Barcode != '') {
                    $tr += ' value="' + r.Barcode + '" ';
                }
                else {
                    $tr += ' value="' + r.LabNo + '"  ';
                }
            } else {
                if (r.Barcode != '') {
                    $tr += ' value="' + r.Barcode + '" disabled="disabled" ';
                }
                else {
                    $tr += ' value="' + r.LabNo + '" disabled="disabled" ';
                }
            }
            $tr += ' /></td > ';



            if (r.IsSampleCollected == 0 && r.isSampleRejected == 0) {
                $tr += ' <td> <input type="checkbox" id="cbCheck" class="cbCheckInvestigations"></td>';
            }
            else if (r.IsSampleCollected == 1){
                $tr += ' <td> <input type="checkbox" Checked="Checked" disabled="disabled"></td>';
                $lblSampleCollected++;
            }
            else {
                $tr += ' <td></td>';
            }


            if (r.IsSampleReceivedByDepartment == 0 && r.IsDepartmentReceivingRequired == 1 && r.IsSampleCollected == 1 && r.Barcode != 'SNR') {
                $tr += ' <td> <input type="checkbox" id="cbCheckDepartment" class="cbCheckDepartment"><input type="datetime-local" value="2026-04-27T10:25" style="margin-left:10px;" id="txtDeptRecDate" /></td>';
            }
            else if (r.IsSampleReceivedByDepartment == 1 && r.IsSampleCollected == 1) {
                $tr += ' <td> <input type="checkbox" Checked="Checked" disabled="disabled"></td>';
            }
            else {
                $tr += ' <td></td>';
            }


          
            // ==============================
            // 🔹 Dynamic Button in Table
            // ==============================
            if (r.IsResultDone == 0 && userAccessRights.CanRejectSampleCollection == 1) {

                

                 if (r.isSampleRejected == 1) {
                    var btnText = 'Accept';
                    var btnColor = 'green';
                    $tr += '<td style="cursor:pointer;color:' + btnColor + ';font-weight:bold;" onclick="$toggleSampleStatus(' + r.PatientInvestigationId + ',1);">' + btnText + '</td>';
                }

                else if (r.IsSampleCollected == 0) {
                    $tr += '<td></td>';
                }

                else if (r.IsSampleCollected == 1 && r.isSampleRejected == 0) {
                    var btnText = 'Reject';
                    var btnColor = 'red';
                    $tr += '<td style="cursor:pointer;color:' + btnColor + ';font-weight:bold;" onclick="$toggleSampleStatus(' + r.PatientInvestigationId + ',0);">' + btnText + '</td>';
                }
               

                // 🟢 SHOW ACCEPT BUTTON: when sample already rejected
                //else if (r.isSampleRejected == 1) {
                //    var btnText = 'Accept';
                //    var btnColor = 'green';
                //    $tr += '<td style="cursor:pointer;color:' + btnColor + ';font-weight:bold;" onclick="$toggleSampleStatus(' + r.PatientInvestigationId + ',1);">' + btnText + '</td>';
                //}
            }

            
            else {
                $tr += ' <td></td>';
               
            }



            $tr += ' <td style="cursor: pointer;" onclick="$ShowModalRemark(this)"><i class="fa fa-plus"></i></td>';
            $tr += '<td><input type="checkbox" id="cbCheckSticker" class="cbCheckSticker"></td>';
            $tr += '<td><input type="text" id="txtPrintCount" value="0" style="width:40px;" onkeypress="return numbersOnly(this,event,2)"/></td>';
                $tr += ' <td style="cursor: pointer;background-color:#00c0ef;color:white;font-weight:bold" class="rounded-corner-cell" onclick="$ShowPatientDetail(' + r.LabNo + ',' + r.VisitId + ',\'' + r.UHID + '\')"><i class="fa fa-info"></i></td>';

                $tr += '<td id="tdPatientInvestigationId" style="display:none;">' + r.PatientInvestigationId + '</td>';
                $tr += '<td id="tdReportTypeId" style="display:none;">' + r.ReportTypeId + '</td>';
                $tr += '<td style="display:none" id="tdLabNo">' + r.LabNo + '</td>';
                $tr += '<td style="display:none" id="tdIsSampleReceivedByDepartment">' + r.IsSampleReceivedByDepartment + '</td>';
                $tr += '<td style="display:none" id="tdIsSampleSegregated">' + r.IsSampleSegregated + '</td>';
                $tr += '<td style="display:none" id="tdIsResultDone">' + r.IsResultDone + '</td>';

                $tr += '<td style="display:none" id="tddVisitId">' + r.VisitId + '</td>';
                $tr += '<td style="display:none" id="tddLabNo">' + r.LabNo + '</td>';
                $tr += '<td style="display:none" id="tddUHID">' + r.UHID + '</td>';
                $tr += '<td style="display:none" id="tdPName">' + r.PatientName + '</td>';
                $tr += '<td style="display:none" id="tdAgeGender">' + r.CurrentAge + '/' + r.Gender + '</td>';

                $tr += "</tr>";

                $('#tblSearchResults').append($tr);


                labNoR = r.LabNo;
                uhidR = r.UHID;
                visitIdR = r.VisitId;
            $defaultColor = '';
            $('#lblSNR').text($lblSNR);
            $('#lblSampleCollectionPending').text($lblSampleCollectionPending);
            $('#lblDepartmentReceivingPending').text($lblDepartmentReceivingPending);
            $('#lblDepartmentReceived').text($lblDepartmentReceived);
            $('#lblSampleCollected').text($lblSampleCollected);
            $('#lblRejected').text($lblRejected);
            $('#lblUrgent').text($lblUrgent);
            $('#lblAllTest').text($('#tblSearchResults tr:not(#tHead)').length);

        });
    }
 */

/*
    /api/Lab/updateSampleStatus */

/*
     {
            "BillDate": "27-Apr-2026",
            "Type": "OPD",
            "UHID": "GWS/00000022",
            "IPDNo": 0,
            "LabNo": 117,
            "WardName": "",
            "PatientName": "MR. ROMANIYA",
            "CurrentAge": "33Y 0M 0D",
            "CorporateName": " CASH",
            "Gender": "MALE",
            "TotalBalanceAmount": 0.000000,
            "VisitId": 188,
            "isUrgent": 0,
            "Barcode": "51",
            "IsSampleRequired": 1,
            "IsDepartmentReceivingRequired": 1,
            "PatientInvestigationId": 199,
            "ReportTypeId": 1,
            "IsReportHold": 0,
            "CreatedOn": "Apr 27 2026 11:49AM",
            "VIPPatient": 0,
            "IsSampleCollected": 1,
            "SampleCollectedOn": "Apr 27 2026  3:06PM",
            "IsSampleReceivedByDepartment": 0,
            "SampleReceivedByDepartmentOn": "",
            "IsResultDone": 0,
            "ResultDoneOn": "",
            "IsReportApproved": 0,
            "ReportApprovedOn": "",
            "IsDispatched": 0,
            "DispatchedOn": "",
            "isSampleRejected": 0,
            "DefaultSampleTypeId": 2,
            "SampleTypeList": "1*Blood*Red$2*Serum*#7afa8b$3*Any Fluid*$4*Biuret*Orange",
            "DeliveryDate": "",
            "IsUnderPackage": 0,
            "Name": "CBC (COMPLETE BLOOD COUNT)"
        }, */

/* if (r.IsSampleReceivedByDepartment == 0 && r.IsDepartmentReceivingRequired == 1 && r.IsSampleCollected == 1 && r.Barcode != 'SNR') {
                $tr += ' <td> <input type="checkbox" id="cbCheckDepartment" class="cbCheckDepartment"><input type="datetime-local" value="2026-04-27T13:25" style="margin-left:10px;" id="txtDeptRecDate" /></td>';
            }
            else if (r.IsSampleReceivedByDepartment == 1 && r.IsSampleCollected == 1) {
                $tr += ' <td> <input type="checkbox" Checked="Checked" disabled="disabled"></td>';
            } */
