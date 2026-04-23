import { getCorporateMaster } from "@/api/globalApiCall";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { Status } from "@/constants/constants";
import { sampleManagementButtons, SampleManagementTableHeader } from "@/constants/tableHeaders";
import { AuthContext } from "@/context/AuthContext";
import { RoleContext } from "@/context/RoleContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showInfo, showWarning } from "@/utils/alert";
import {
  SampleManagementFormData,
  sampleManagementSchema,
} from "@/validation/sampleManagementSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { BriefcaseMedical } from "lucide-react";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
import PatientInvestigationDetails from "./components/PatientInvestigationDetails";
import RejectSamplePopup from "./components/RejectSamplePopup";
import RemarkPopup from "./components/RemarkPopup";
import { ButtonValue, CorporateList, SampleManagementTableData, SampleTypeItem } from "./types";

const SampleManagement = () => {
  const currentDate = new Date().toISOString().split("T")[0];

  const { loading, error, fetchApi } = useGlobalApi();

  const authContext = useContext(AuthContext);
  const branchId = Number(authContext?.user?.branchId ?? 0);

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
  const [filteredData, setFilteredData] = useState<SampleManagementTableData[]>([]);
  const [showTable, setShowTable] = useState<boolean>(false);

  const [tableData, setTableData] = useState(filteredData || []);
  const [sampleTypeList, setSampleTypeList] = useState<SampleTypeItem[]>([]);

  const sampleTypeMap = useMemo(() => {
    return new Map(sampleTypeList.map(item => [item.sampleTypeId, item]));
  }, [sampleTypeList]);

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
  const { register, handleSubmit } = useForm({
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
  const filterByButton = (buttonName: string, source: SampleManagementTableData[]) => {
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
  };

  // button count
  const getButtonCount = (buttonName: string) =>
    filterByButton(buttonName, sampleManagementTableData).length;

  useEffect(() => {
    const getDataOnMount = async () => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.SEARCH_PATIENT_INVESTIGATION_FOR_SAMPLE_MANAGEMENT,
        {},
        { params: { branchId, roleId, fromDate: currentDate, toDate: currentDate } },
        { component: "SampleManagement" }
      );

      if (!resp?.data) {
        showInfo("No data found");
        return;
      }

      const data = (resp?.data ?? []) as SampleManagementTableData[];
      const enrichedData = sampleTypeList.length ? enrichRowsWithSampleType(data) : data;

      setSampleManagementTableData(enrichedData);

      setFilteredData(filterByButton(sampleManagementButtons[0]?.buttonName, enrichedData));
      setActiveIndex(0);
      setShowTable(true);
    };

    if (branchId && roleId) {
      getDataOnMount();
    }
  }, [branchId, roleId]);

  // search handler
  const onsubmit = async (formData: SampleManagementFormData) => {
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
          uhid: formData?.uhid,
          barCode: formData?.barCode,
          patientName: formData?.patientName,
          labNo: formData?.labNo,
          fromDate: formData?.fromDate,
          toDate: formData?.toDate,
          corporateId: Number(formData?.corporateId ?? 0),
          statusId: Number(formData?.statusId ?? 0),
        },
      },
      { component: "SampleManagement" }
    );

    if (!resp?.result) {
      showWarning(resp?.message ?? "No data found");

      setShowTable(false);
      return;
    }

    const tableData = (resp?.data ?? []) as SampleManagementTableData[];
    const enrichedData = sampleTypeList.length ? enrichRowsWithSampleType(tableData) : tableData;
    setSampleManagementTableData(enrichedData);
    setShowTable(true);

    setActiveIndex(0);
    setFilteredData(filterByButton(sampleManagementButtons[0]?.buttonName, enrichedData));
  };

  // button click handler
  const buttonClickHandler = (value: string) => {
    const filtered = filterByButton(value, sampleManagementTableData);
    setFilteredData(filtered);
    setTableData(filtered);
  };

  // search using enter
  const searchByBarcode = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(onsubmit)();
    }
  };

  // handle barcode change
  const handleBarcodeChange = (index: number, value: string) => {
    const updated = [...tableData];
    updated[index].Barcode = value;
    setTableData(updated);
  };

  // handler checkbox change
  const handleCheckboxChange = (index: number) => {
    const updated = [...tableData];
    updated[index].IsSampleCollected = updated[index].IsSampleCollected === 1 ? 0 : 1;

    setTableData(updated);
  };

  // dept receiving checkbox change
  const handleDeptRecvChange = (index: number) => {
    const updated = [...tableData];
    updated[index].IsDepartmentReceivingRequired =
      updated[index]?.IsDepartmentReceivingRequired === 1 ? 0 : 1;

    setTableData(updated);
  };
  useEffect(() => {
    setTableData(filteredData);
  }, [filteredData]);

  // header checkbox handler
  const checkboxHandler = (h: string, checked: boolean) => {
    setTableData(prev => {
      switch (h) {
        case "Sample Collection":
          return prev.map(t => ({
            ...t,
            IsSampleCollected: checked ? 1 : 0,
          }));

        case "Dept. Rec.":
          return prev.map(t => ({
            ...t,
            IsDepartmentReceivingRequired: checked ? 1 : 0,
          }));

        default:
          return prev;
      }
    });
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
    if (!rowSampleTypeName) return 0;

    const matched = sampleTypeList.find(
      sampleType => normalizeSampleTypeName(sampleType.sampleType) === rowSampleTypeName
    );
    return matched?.sampleTypeId ?? 0;
  };

  const enrichRowsWithSampleType = (rows: SampleManagementTableData[]) => {
    return rows.map(item => {
      const sampleTypeId = resolveSampleTypeId(item);
      const sampleTypeName =
        sampleTypeMap.get(sampleTypeId)?.sampleType ?? item.SampleTypeName ?? "";
      return {
        ...item,
        DefaultSampleTypeId: sampleTypeId || item.DefaultSampleTypeId || 0,
        selectedSampleType: sampleTypeName,
      };
    });
  };

  // sample type list
  const getSampleTypeList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_ALL_SAMPLE_TYPE_MASTER,
      {},
      { params: { isActive: Status?.ACTIVE } },
      { component: "SampleManagement" }
    );
    setSampleTypeList(resp?.data ?? []);
  };

  useEffect(() => {
    getSampleTypeList();
  }, []);

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
    setPatientInvestigation(item);
    setRenderPatientDrawer(true);
    setOpenPatientDrawer(true);
  };

  useEffect(() => {
    if (!sampleTypeList.length || !sampleManagementTableData.length) return;
    const enriched = enrichRowsWithSampleType(sampleManagementTableData);
    setSampleManagementTableData(enriched);
    const activeButtonName = sampleManagementButtons[activeIndex]?.buttonName ?? "all";
    const filtered = filterByButton(activeButtonName, enriched);
    setFilteredData(filtered);
    setTableData(filtered);
  }, [sampleTypeList]);

  /* -------------------- SELECT HANDLER -------------------- */
  const selectSampleTypeHandler = (index: number, value: number) => {
    const selectedType = sampleTypeMap.get(value);
    const selectedTypeName = selectedType?.sampleType ?? "";
    const row = tableData[index];
    if (!row) return;

    const updateRow = (item: SampleManagementTableData) =>
      item.PatientInvestigationId === row.PatientInvestigationId
        ? {
            ...item,
            DefaultSampleTypeId: value,
            selectedSampleType: selectedTypeName,
            SampleTypeName: selectedTypeName || item.SampleTypeName,
          }
        : item;

    setTableData(prev => prev.map(updateRow));
    setFilteredData(prev => prev.map(updateRow));
    setSampleManagementTableData(prev => prev.map(updateRow));
  };

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
            <InputField label="UHID">
              <input
                type="text"
                className="input-field"
                placeholder="Enter UHID "
                {...register("uhid")}
              />
            </InputField>

            <InputField label="Bar Code">
              <input
                type="text"
                className="input-field"
                placeholder="Enter Barcode No  & press Enter to search"
                {...register("barCode")}
                onKeyDown={searchByBarcode}
              />
            </InputField>

            <InputField label="Patient Name">
              <input
                type="text"
                className="input-field"
                placeholder="Enter patient name "
                {...register("patientName")}
              />
            </InputField>

            <InputField label="Lab No">
              <input
                type="text"
                className="input-field"
                placeholder="Enter lab number "
                {...register("labNo")}
              />
            </InputField>

            <InputField label="From Date">
              <input
                type="date"
                className="input-field"
                max={currentDate}
                {...register("fromDate")}
              />
            </InputField>

            <InputField label="To Date">
              <input
                type="date"
                className="input-field"
                max={currentDate}
                {...register("toDate")}
              />
            </InputField>

            <InputField label="Corporate">
              <select className="input-field" {...register("corporateId")}>
                <option value={"0"}>All</option>
                {corporateList?.map(c => (
                  <option key={c?.corporateId} value={c?.corporateId}>
                    {c?.corporateName}
                  </option>
                ))}
              </select>
            </InputField>

            <InputField label="Status">
              <select className="input-field" {...register("statusId")}>
                <option value={"0"}>All</option>
              </select>
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
            <div className="table-size lg:min-h-68 lg:max-h-68 ">
              <table className="base-table ">
                <thead className="table-head">
                  <tr>
                    {SampleManagementTableHeader.map((h, index) => {
                      const isSampleHeader = h === "Sample Collection";
                      const isDeptHeader = h === "Dept. Rec.";

                      const isAllSampleChecked = tableData.every(t => t.IsSampleCollected === 1);

                      const isAllDeptChecked = tableData.every(
                        t => t.IsDepartmentReceivingRequired === 1
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
                  {tableData?.length === 0 && (
                    <tr>
                      <td colSpan={SampleManagementTableHeader.length} className="table-empty">
                        No records found
                      </td>
                    </tr>
                  )}

                  {tableData.map((item, idx) => (
                    <tr key={idx} className="table-row">
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
                      <td className="table-td">
                        <input
                          type="text"
                          className="input-field max-w-20"
                          value={item?.Barcode ?? ""}
                          onChange={e => handleBarcodeChange(idx, e.target.value)}
                        />
                      </td>
                      <td className="table-td">
                        <select
                          className="input-field"
                          value={item?.DefaultSampleTypeId ?? 0}
                          onChange={e => selectSampleTypeHandler(idx, Number(e.target.value))}
                        >
                          <option value={0}>Select</option>
                          {sampleTypeList?.map(s => (
                            <option key={s?.sampleTypeId} value={s?.sampleTypeId}>
                              {s?.sampleType}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="table-td">
                        {/* Deterministic color from sample type master */}
                        {(() => {
                          const sampleTypeId = item?.DefaultSampleTypeId ?? 0;
                          const sampleType = sampleTypeMap.get(sampleTypeId);
                          const colorCode = sampleType?.colorCode || "#d1d5db";
                          return (
                            <span
                              className="px-1 py-3 rounded-md border inline-block  min-w-6"
                              style={{
                                backgroundColor: colorCode,
                                borderColor: colorCode,
                                color: colorCode,
                              }}
                            ></span>
                          );
                        })()}
                      </td>
                      <td className="table-td">
                        <input
                          type="checkbox"
                          className="input-checkbox"
                          onChange={() => handleCheckboxChange(idx)}
                        />
                      </td>

                      <td className="table-td">
                        <input
                          type="checkbox"
                          className="input-checkbox"
                          onChange={() => handleDeptRecvChange(idx)}
                        />
                      </td>

                      <td className="table-td" onClick={() => rejectSampleHandler(item)}>
                        <i className="fa-solid fa-check icon-color-delete"></i>
                      </td>
                      <td className="table-td" onClick={() => rejectRemarkHandler(item)}>
                        <i className="fa-solid fa-plus icon-color-button"></i>
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
            <button type="submit" className="save-btn">
              Save Sample Collection
            </button>
            <button type="submit" className="save-btn">
              Save Dept Receive
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

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default SampleManagement;
