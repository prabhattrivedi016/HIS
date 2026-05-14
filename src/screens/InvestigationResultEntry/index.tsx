import TextEditor from "@/components/ckEditor";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { LabTypeIdValues, LabTypeName, Status } from "@/constants/constants";
import { InvestigationResultEntryTableHeader } from "@/constants/tableHeaders";
import { AuthContext } from "@/context/AuthContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showSuccess, showWarning } from "@/utils/alert";
import {
  freeTextReportFormData,
  freeTextReportSchema,
} from "@/validation/investigationResultEntrySchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { ChangeEvent, useCallback, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { NavLink, useLocation, useParams } from "react-router-dom";
import Buttons from "./components/Buttons";
import ObservationCommentPopup from "./components/ObservationCommentPopup";
import { InvestigationItem, TabularTableDataItem, TemplateItem } from "./types";

const InvestigationResultEntry = () => {
  const paramsValue = useParams();
  const location = useLocation();
  const pathname = String(location?.pathname || "").toLowerCase();
  const isRadiology = pathname.includes("radiology");
  const isPathology = pathname.includes("pathology");

  const item = location.state as InvestigationItem | null | TabularTableDataItem;

  const { loading, fetchApi } = useGlobalApi();

  const branchId = useContext(AuthContext)?.user?.branchId;

  const [tabularInvestigationTableData, setTabularInvestigationTableData] = useState<
    TabularTableDataItem[]
  >([]);

  const [freeTextInvestigationTableData, setFreeTextInvestigationTableData] = useState<
    TabularTableDataItem[]
  >([]);

  const [activeTab, setActiveTab] = useState<string>("");
  const [tabNames, setTabNames] = useState<string[]>([]);
  const [activeReportTypeId, setActiveReportTypeId] = useState<number | null>(null);
  const [editorInstanceKey, setEditorInstanceKey] = useState<string>("initial");

  const [allInvestigationOfSinglePatient, setAllInvestigationOfSinglePatient] = useState<
    InvestigationItem[]
  >([]);

  const [renderInvestigationComment, setRenderInvestigationComment] = useState<boolean>(false);
  const [openInvestigationComment, setOpenInvestigationComment] = useState<boolean>(false);
  const [selectedCommentInvestigation, setSelectedInvestigationComment] =
    useState<TabularTableDataItem | null>(null);

  const [templateItemList, setTemplateItemList] = useState<TemplateItem[]>([]);

  const [textEditorValue, setTextEditorValue] = useState<string>("");

  const [getTabularComment, setGetTabularComment] = useState<string>("");
  const [getIsAbnormal, setGetIsAbnormal] = useState<number>(0);

  // patient details
  const [patientDetails, setPatientDetails] = useState({
    BarCode: 0,
    BillDate: "",
    CurrentAge: "",
    Gender: "",
    LabNo: 0,
    PatientName: "",
    UHID: "",
    referDoctorName: "",
  });

  // create update template form data
  const [createUpdateTemplateFormData, setCreateUpdateTemplateFormData] = useState({
    id: 0,
    typeId: 1,
    type: "Template",
    name: "",
    contentValue: "",
    isActive: 1,
  });

  useEffect(() => {
    setCreateUpdateTemplateFormData(prev => ({
      ...prev,
      contentValue: textEditorValue,
    }));
  }, [textEditorValue]);

  // free text form data
  const {
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(freeTextReportSchema),
    defaultValues: {
      patientInvestigationId: item?.PatientInvestigationId,
      investigationId: item?.InvestigationId,
      resultValue: "",
      templateId: 0,
      investigationComments: "",
      isAbnormalResult: 0,
    },
  });

  // button change handler
  const buttonChangeHandler = (b: string) => {
    setActiveTab(b);
  };

  // all investigation of patient
  const getAllInvestigationOfPatient = async (
    branchId: number,
    uhid: string,
    labNo: number,
    labTypeId: number,
    visitId: number
  ) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_ALL_INVESTIGATION_NAME_OF_PATIENT,
      {},
      { params: { branchId, uhid, labNo, labTypeId, visitId } },
      { component: "InvestigationResultEntry" }
    );

    const tabs = resp?.data?.map((i: InvestigationItem) => i?.Name) ?? [];

    setTabNames(tabs);
    setAllInvestigationOfSinglePatient(resp?.data ?? []);
  };

  useEffect(() => {
    const labTypeId =
      paramsValue?.department === LabTypeName?.PATHOLOGY
        ? LabTypeIdValues?.PATHOLOGY
        : LabTypeIdValues?.RADIOLOGY;

    if (item && branchId) {
      setPatientDetails({
        BarCode: item?.Barcode,
        BillDate: item?.BillDate,
        CurrentAge: item?.CurrentAge,
        Gender: item?.Gender,
        LabNo: item?.LabNo,
        PatientName: item?.PatientName,
        UHID: item?.UHID,
        referDoctorName: item?.referDoctorName,
      });
      setActiveTab(item?.Name);
      getAllInvestigationOfPatient(branchId, item?.UHID, item?.LabNo, labTypeId, item?.VisitId);
    }
  }, [paramsValue, item, branchId]);

  // tabular result entry value

  const getTabularResultEntryValue = async (patientInvestigationId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PATIENT_TABULAR_REPORT_FOR_RESULT_ENTRY,
      {},
      { params: { patientInvestigationId } },
      { component: "InvestigationResultEntry" }
    );

    const rows = resp?.data ?? [];
    setTabularInvestigationTableData(rows);
    setGetTabularComment(rows?.[0]?.InvestigationComment ?? "");
    setGetIsAbnormal(Number(rows?.[0]?.IsAbnormalResult) || 0);
  };

  // free text entry value
  const getFreeTextResultEntryValue = async (patientInvestigationId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PATIENT_FREE_TEXT_REPORT_FOR_RESULT_ENTRY,
      {},
      { params: { patientInvestigationId } },
      { component: "InvestigationResultEntry" }
    );

    const fetched = resp?.data?.[0];
    setFreeTextInvestigationTableData(resp?.data ?? []);
    setTextEditorValue(fetched?.ResultValue ?? "");
    reset({
      patientInvestigationId: patientInvestigationId,
      investigationId: fetched?.InvestigationId ?? 0,
      resultValue: fetched?.ResultValue ?? "",
      templateId: fetched?.TemplateId ?? 0,
      investigationComments: fetched?.InvestigationComment ?? "",
      isAbnormalResult: fetched?.IsAbnormalResult ?? 0,
    });
  };

  // template lists
  const getTemplateName = async (investigationId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_INVESTIGATION_TEMPLATE_INTERPRETATION_MAPPINGS,
      {},
      {
        params: { investigationId },
      },
      {
        component: "InvestigationResultEntry",
      }
    );

    setTemplateItemList(resp?.data ?? []);
  };

  //  getInvestigationTemplateInterpretationMappings
  useEffect(() => {
    if (item && paramsValue && activeTab) {
      const selectedInvestigation = allInvestigationOfSinglePatient?.find(
        i => i?.Name === activeTab
      );

      if (selectedInvestigation?.PatientInvestigationId) {
        // Keep free-text payload identifiers synced with active investigation tab.
        setValue(
          "patientInvestigationId",
          Number(selectedInvestigation?.PatientInvestigationId) || 0
        );
        setValue("investigationId", Number(selectedInvestigation?.InvestigationId) || 0);

        const reportTypeId = Number(selectedInvestigation?.ReportTypeId);
        setActiveReportTypeId(Number.isFinite(reportTypeId) ? reportTypeId : null);

        // Prevent showing stale data when switching tabs
        setTabularInvestigationTableData([]);
        setFreeTextInvestigationTableData([]);
        setTextEditorValue("");
        setGetTabularComment("");
        setGetIsAbnormal(0);
        setEditorInstanceKey(`investigation-${selectedInvestigation?.PatientInvestigationId}`);

        if (reportTypeId === LabTypeIdValues?.PATHOLOGY) {
          getTabularResultEntryValue(Number(selectedInvestigation?.PatientInvestigationId));
        } else {
          getFreeTextResultEntryValue(Number(selectedInvestigation?.PatientInvestigationId));
          getTemplateName(Number(selectedInvestigation?.InvestigationId));
        }
      }
    }
  }, [item, paramsValue, activeTab, allInvestigationOfSinglePatient, setValue]);

  const parseNumeric = (v: unknown): number | null => {
    if (v === null || v === undefined) return null;
    const s = String(v).trim();
    if (!s) return null;
    const n = Number(s.replace(/,/g, ""));
    return Number.isFinite(n) ? n : null;
  };

  const getResultFlag = (row: TabularTableDataItem): "H" | "L" | "N" | "" => {
    const result = parseNumeric(row?.ResultValue);
    if (result === null) return "";

    const min = parseNumeric(row?.MinValue);
    const max = parseNumeric(row?.MaxValue);

    if (min !== null && max !== null) {
      if (result > max) return "H";
      if (result < min) return "L";
      return "N";
    }

    // Partial ranges: treat as normal if within available bound
    if (max !== null) return result > max ? "H" : "N";
    if (min !== null) return result < min ? "L" : "N";

    return "";
  };

  const flagClassName = (flag: "H" | "L" | "N" | "") => {
    switch (flag) {
      case "H":
        return "font-bold text-red-600";
      case "L":
        return "font-bold text-blue-600";
      case "N":
        return "font-bold text-green-600";
      default:
        return "text-gray-500";
    }
  };

  // result change handler

  const updateTableRowByObservationId = (
    setter: React.Dispatch<React.SetStateAction<TabularTableDataItem[]>>,
    row: TabularTableDataItem,
    patch: Partial<TabularTableDataItem>
  ) => {
    setter(prev =>
      prev.map(i =>
        Number(i?.ObservationId) === Number(row?.ObservationId) ? { ...i, ...patch } : i
      )
    );
  };

  const onTabularFieldChange =
    (
      row: TabularTableDataItem,
      field: keyof Pick<
        TabularTableDataItem,
        | "ResultValue"
        | "MinValue"
        | "MaxValue"
        | "DisplayRange"
        | "Unit"
        | "MachineResult"
        | "MachineUnit"
        | "IsBold"
      >
    ) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;

      updateTableRowByObservationId(setTabularInvestigationTableData, row, {
        [field]: value,
      });
    };

  const onResultBoldChange =
    (row: TabularTableDataItem) => (e: React.ChangeEvent<HTMLInputElement>) => {
      updateTableRowByObservationId(setTabularInvestigationTableData, row, {
        IsResultBold: e.currentTarget.checked ? 1 : 0,
      });
    };

  const isTabularReport = Number(activeReportTypeId) === LabTypeIdValues?.PATHOLOGY;

  // comment handler
  const commentHandler = (item: TabularTableDataItem) => {
    if (!item) return;
    setOpenInvestigationComment(true);
    setRenderInvestigationComment(true);
    setSelectedInvestigationComment(item);
  };

  // close comment handler
  const closeCommentHandler = useCallback(() => {
    setOpenInvestigationComment(false);
    setSelectedInvestigationComment(null);
  }, []);

  // text editor change handler
  const textEditorChangeHandler = (data: string) => {
    setTextEditorValue(data);
    setValue("resultValue", data ?? "");
  };

  // free text submit handler
  const freeTextSubmitHandler = async (data: freeTextReportFormData) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.SAVE_PATIENT_FREE_TEXT_REPORT,
      data,
      {},
      { component: "InvestigationResultEntry" }
    );
    if (!resp?.result) {
      showWarning(resp?.message ?? "Something went wrong");
      return;
    }
    showSuccess(resp?.message ?? "Data saved successfully");
    reset({
      patientInvestigationId: item?.PatientInvestigationId,
      investigationId: item?.InvestigationId,
      resultValue: "",
      templateId: 0,
      investigationComments: "",
      isAbnormalResult: 0,
    });
    setTextEditorValue("");
  };

  // tabular report submit handler
  const tabularReportSubmitHandler = async () => {
    if (!tabularInvestigationTableData?.length) {
      showWarning("No tabular result data found ");
      return;
    }

    const hasMandatoryEmpty = tabularInvestigationTableData.some(
      i =>
        Number(i?.IsMandatory) === 1 &&
        Number(i?.IsHeader) === 0 &&
        !String(i?.ResultValue ?? "").trim()
    );

    if (hasMandatoryEmpty) {
      showWarning("Result value is required ");
      return;
    }

    const selectedInvestigation = allInvestigationOfSinglePatient?.find(i => i?.Name === activeTab);

    const payload = {
      patientInvestigationId:
        selectedInvestigation?.PatientInvestigationId ?? item?.PatientInvestigationId ?? 0,
      investigationId: selectedInvestigation?.InvestigationId ?? item?.InvestigationId ?? 0,
      investigationComments: getTabularComment,
      isAbnormalResult: getIsAbnormal,
      tabularReport: tabularInvestigationTableData?.map(t => ({
        observationId: t?.ObservationId ?? 0,
        resultValue: t?.ResultValue ?? "",
        minValue: t?.MinValue ?? "",
        maxValue: t?.MaxValue ?? "",
        displayRange: t?.DisplayRange ?? "",
        unit: t?.Unit ?? "",
        machineResult: t?.MachineResult ?? "",
        machineDisplayRange: t?.MachineDisplayRange ?? "",
        machineUnit: t?.MachineUnit ?? "",
        sampleRemark: t?.SampleRemark ?? "",
        isHeader: t?.IsHeader === true ? 1 : 0,
        isResultBold:
          Number(t?.IsResultBold) === 1 || t?.IsResultBold === true || t?.IsResultBold === "1"
            ? 1
            : 0,
      })),
    };

    if (!payload) return;

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.SAVE_PATIENT_TABULAR_REPORT,
      payload,
      {},
      { component: "InvestigationResultEntry" }
    );

    if (!resp?.result) {
      showWarning(resp?.message ?? "Something went wrong");
      return;
    }

    showSuccess(resp?.message ?? "Data saved successfully");
    setGetIsAbnormal(0);
    setGetTabularComment("");
  };

  // submit handler
  const onSubmit = async (data: freeTextReportFormData) => {
    if (isRadiology) {
      await freeTextSubmitHandler(data);
      return;
    }

    if (isPathology) {
      await tabularReportSubmitHandler();
      return;
    }
  };

  // button click handler
  const buttonClickHandler = (buttonName: string) => {
    switch (buttonName) {
      case "save":
        if (isPathology) {
          tabularReportSubmitHandler();
        } else {
          handleSubmit(onSubmit)();
        }

        break;

      case "approve":
        break;

      case "hold":
        break;

      case "next":
        break;

      case "previous":
        break;

      case "bulkPrint":
        break;

      case "deltaCheck":
        break;

      case "patientDetails":
        break;

      case "addReport":
        break;

      case "printReport":
        break;

      case "reRun":
        break;

      case "close":
        break;

      default:
        break;
    }
  };

  // input change handler
  const inputChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!name) return;

    setCreateUpdateTemplateFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // template change handler
  const templateChangeHandler = async (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    setValue("templateId", value || 0);
    if (!value) {
      setCreateUpdateTemplateFormData(prev => ({
        ...prev,
        id: 0,
        name: "",
        contentValue: "",
      }));
      setTextEditorValue("");
      setValue("resultValue", "");
      setEditorInstanceKey("template-new");
      return;
    }

    getTemplateValue(value);
  };

  // fetch template value
  const getTemplateValue = async (value: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_INVESTIGATION_TEMPLATE_COMMENT_MASTER,
      {},
      { params: { id: value, typeId: Status?.ACTIVE } },
      { component: "InvestigationResultEntry" }
    );
    const fetchedTemplate = resp?.data?.[0] ?? {};
    setCreateUpdateTemplateFormData({
      id: fetchedTemplate?.Id ?? 0,
      typeId: fetchedTemplate?.Typeid ?? 1,
      type: fetchedTemplate?.Type ?? "Template",
      name: fetchedTemplate?.Name ?? "",
      contentValue: fetchedTemplate?.ContentValue ?? "",
      isActive: fetchedTemplate?.IsActive ?? 1,
    });
    setTextEditorValue(fetchedTemplate?.ContentValue ?? "");
    setValue("resultValue", fetchedTemplate?.ContentValue ?? "");
    setEditorInstanceKey(`template-${fetchedTemplate?.Id ?? value}`);
  };

  // template save handler
  const templateSaveHandler = async () => {
    if (!createUpdateTemplateFormData?.name?.trim()) {
      showWarning("Please enter template name");
      return;
    }
    if (!createUpdateTemplateFormData?.contentValue?.trim()) {
      showWarning("Please enter template content");
      return;
    }

    const payload = [createUpdateTemplateFormData];
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_INVESTIGATION_TEMPLATE_COMMENT_MASTER,
      payload,
      {},
      { component: "InvestigationResultEntry" }
    );
    if (!resp?.result) {
      showWarning(resp?.message ?? "Something went wrong");
      return;
    }
    showSuccess(resp?.message ?? "Data saved successfully");
    setCreateUpdateTemplateFormData({
      id: 0,
      typeId: 1,
      type: "Template",
      name: "",
      contentValue: "",
      isActive: 1,
    });
    setTextEditorValue("");
    setValue("resultValue", "");
    setValue("templateId", 0);
    setEditorInstanceKey("template-new");
    setTemplateItemList([]);
    const currentInvestigationId = Number(
      allInvestigationOfSinglePatient?.find(i => i?.Name === activeTab)?.InvestigationId
    );
    if (currentInvestigationId) {
      getTemplateName(currentInvestigationId);
    }
  };

  // observation lovs dropsdown
  const getResultValueDropdown = (value?: string) =>
    String(value ?? "")
      .split("#")
      .map(v => v.trim())
      .filter(Boolean);

  const onLovResultClick = (row: TabularTableDataItem, value: string) => {
    updateTableRowByObservationId(setTabularInvestigationTableData, row, {
      ResultValue: value,
    });
  };

  return (
    <div className="page-container">
      <h1 className="page-heading">Investigation Result Entry</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Investigation Result Entry</span>
      </nav>

      {/* patient details */}
      <div className="card form-grid-4">
        <div className="flex flex-row">
          <h1 className="name-header">UHID : </h1>
          <span className="ml-2">{patientDetails?.UHID}</span>
        </div>

        <div className="flex flex-row">
          <h1 className="name-header">Age/Sex: </h1>
          <span className="ml-2">
            {patientDetails?.CurrentAge} / {patientDetails?.Gender}
          </span>
        </div>

        <div className="flex flex-row">
          <h1 className="name-header">Bill. Date: </h1>
          <span className="ml-2">{patientDetails?.BillDate}</span>
        </div>

        <div className="flex flex-row">
          <h1 className="name-header">Lab No.: </h1>
          <span className="ml-2">{patientDetails?.LabNo}</span>
        </div>
        <div className="flex flex-row">
          <h1 className="name-header">Name: </h1>
          <span className="ml-2">{patientDetails?.PatientName}</span>
        </div>
        <div className="flex flex-row">
          <h1 className="name-header">Barcode: </h1>
          <span className="ml-2">{patientDetails?.BarCode}</span>
        </div>
        <div className="flex flex-row">
          <h1 className="name-header">Refer By: </h1>
          <span className="ml-2">{patientDetails?.referDoctorName}</span>
        </div>

        <div className="flex flex-row">
          <h1 className="name-header">Medical History: </h1>
          <span className="ml-2">{"-"}</span>
        </div>
      </div>

      {/* tabs */}
      <div className="tab-card -mt-3">
        {tabNames?.map(b => (
          <button
            type="button"
            onClick={() => buttonChangeHandler(b)}
            className={` tab-btn transition
                        ${activeTab === b ? "tab-btn-active" : "tab-btn-inactive"}
                      `}
          >
            {b}
          </button>
        ))}
      </div>

      {isTabularReport ? (
        <div className="flex flex-col gap-2 card mt-1">
          <h1 className="font-bold">{activeTab} </h1>
          <div className="table-container mt-1 ">
            <div className="table-scroll-wrapper ">
              <div className="table-size lg:min-h-80 lg:max-h-80">
                <table className="base-table ">
                  <thead className="table-head">
                    <tr>
                      {InvestigationResultEntryTableHeader.map((h, index) => (
                        <th key={index} className="table-th ">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {tabularInvestigationTableData?.length === 0 && (
                      <tr>
                        <td
                          colSpan={InvestigationResultEntryTableHeader.length}
                          className="table-empty"
                        >
                          No records found
                        </td>
                      </tr>
                    )}

                    {tabularInvestigationTableData.map((item: TabularTableDataItem, idx) => (
                      <tr key={idx} className="table-row">
                        {item?.IsHeader ? (
                          <td className="table-td max-w-30">
                            {item?.IsBold && item.IsUnderLine ? (
                              <span className="font-bold underline">{item?.ObservationName}</span>
                            ) : item?.IsBold ? (
                              <span className="font-bold ">{item?.ObservationName}</span>
                            ) : item?.IsUnderLine ? (
                              <span className="underline">{item?.ObservationName}</span>
                            ) : (
                              <span className="font-bold">{item?.ObservationName} </span>
                            )}
                          </td>
                        ) : (
                          <>
                            <td className="table-td max-w-30">
                              {item?.IsBold && item.IsUnderLine ? (
                                <span className="font-bold underline">{item?.ObservationName}</span>
                              ) : item?.IsBold ? (
                                <span className="font-bold ">{item?.ObservationName}</span>
                              ) : item?.IsUnderLine ? (
                                <span className="underline">{item?.ObservationName}</span>
                              ) : (
                                item?.ObservationName || "-"
                              )}
                            </td>
                            <td className="table-td">
                              {
                                <input
                                  type="checkbox"
                                  className="input-checkbox"
                                  onChange={onResultBoldChange(item)}
                                  checked={Number(item?.IsResultBold) === 1}
                                />
                              }
                            </td>
                            <td className="table-td">
                              {(() => {
                                const lovs = getResultValueDropdown(item?.ObservationLOVs);

                                return (
                                  <div className="relative group flex items-start gap-1">
                                    <input
                                      type="text"
                                      className={`input-field max-w-25 ${
                                        Number(item?.IsMandatory) === 1
                                          ? "border! border-red-500! focus:border-red-500!"
                                          : ""
                                      }`}
                                      value={item?.ResultValue ?? ""}
                                      onChange={onTabularFieldChange(item, "ResultValue")}
                                    />

                                    {lovs.length > 0 && (
                                      <>
                                        <span className="mt-2 " title="Show options">
                                          <i className="fa-solid fa-chevron-down text-xs"></i>
                                        </span>

                                        <div className="result-entry-chervondown-popup">
                                          {lovs.map((lov, index) => (
                                            <button
                                              key={`${item?.ObservationId}-${index}`}
                                              type="button"
                                              className="chervon-down-button"
                                              onClick={() => onLovResultClick(item, lov)}
                                            >
                                              {lov}
                                            </button>
                                          ))}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                );
                              })()}
                            </td>

                            {/*  */}

                            <td className={`table-td ${flagClassName(getResultFlag(item))}`}>
                              {getResultFlag(item)}
                            </td>

                            <td className="table-td" onClick={() => commentHandler(item)}>
                              {<i className="fa-solid fa-comments icon-color-button "></i>}
                            </td>
                            <td className="table-td">
                              {
                                <input
                                  type="text"
                                  className="input-field max-w-20"
                                  value={item?.MinValue ?? ""}
                                  onChange={onTabularFieldChange(item, "MinValue")}
                                />
                              }
                            </td>
                            <td className="table-td">
                              {
                                <input
                                  type="text"
                                  className="input-field max-w-20"
                                  value={item?.MaxValue ?? ""}
                                  onChange={onTabularFieldChange(item, "MaxValue")}
                                />
                              }
                            </td>
                            <td className="table-td">
                              {
                                <input
                                  type="text"
                                  className="input-field max-w-20"
                                  value={item?.DisplayRange ?? ""}
                                  onChange={onTabularFieldChange(item, "DisplayRange")}
                                />
                              }
                            </td>
                            <td className="table-td">
                              {
                                <input
                                  type="text"
                                  className="input-field max-w-20"
                                  value={item?.Unit ?? ""}
                                  onChange={onTabularFieldChange(item, "Unit")}
                                />
                              }
                            </td>
                            <td className="table-td">{item?.MethodName || "-"}</td>
                            <td className="table-td">
                              {
                                <input
                                  type="text"
                                  className="input-field max-w-20"
                                  value={item?.MachineResult ?? ""}
                                  onChange={onTabularFieldChange(item, "MachineResult")}
                                />
                              }
                            </td>
                            <td className="table-td">{"-"}</td>
                            <td className="table-td">
                              {
                                <input
                                  type="text"
                                  className="input-field max-w-20"
                                  value={item?.MachineUnit ?? ""}
                                  onChange={onTabularFieldChange(item, "MachineUnit")}
                                />
                              }
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-4">
            <InputField label="Comments">
              <textarea
                rows={1}
                className="input-field min-w-200"
                onChange={e => setGetTabularComment(e.target.value)}
                value={getTabularComment}
              />
            </InputField>

            <InputField label="Abnormal Report">
              <select
                className="input-field min-w-70"
                onChange={e => setGetIsAbnormal(Number(e.target.value))}
                value={getIsAbnormal}
              >
                <option value={0}>No</option>
                <option value={1}>yes</option>
              </select>
            </InputField>
          </div>
        </div>
      ) : (
        // free text
        <div className="flex flex-col gap-2 card mt-1">
          <h1 className="font-bold">{activeTab} </h1>
          <div className="table-container mt-1 ">
            <div className="table-scroll-wrapper ">
              <div className="table-size lg:min-h-80 lg:max-h-60">
                {/* template */}
                <div className="m-2 flex flex-col gap-3 lg:flex-row lg:items-start">
                  <div className="w-full lg:w-70">
                    <InputField label="Select Template">
                      <select
                        className="input-field"
                        {...register("templateId", { valueAsNumber: true })}
                        onChange={templateChangeHandler}
                      >
                        <option value={0}>Select</option>
                        {templateItemList?.map(t => (
                          <option key={t?.ItemId} value={t?.ItemId}>
                            {t?.Name}
                          </option>
                        ))}
                      </select>
                    </InputField>
                  </div>

                  <div className="w-full lg:w-70">
                    <InputField label="Template Name">
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Enter template name"
                        name="name"
                        value={createUpdateTemplateFormData?.name}
                        onChange={inputChangeHandler}
                      />
                    </InputField>
                  </div>

                  {/* Buttons */}
                  <div className="flex w-full justify-end gap-3 lg:mt-6 lg:w-auto">
                    {Number(createUpdateTemplateFormData?.id) > 0 ? (
                      <button type="button" className="save-btn h-10" onClick={templateSaveHandler}>
                        Update
                      </button>
                    ) : (
                      <button type="button" className="save-btn h-10" onClick={templateSaveHandler}>
                        Save New
                      </button>
                    )}
                  </div>
                </div>
                {/* editor */}

                <TextEditor
                  key={editorInstanceKey}
                  onChange={textEditorChangeHandler}
                  value={textEditorValue}
                />
              </div>
            </div>
            {errors?.resultValue?.message && (
              <p className="input-field-error">{String(errors.resultValue.message)}</p>
            )}
          </div>
          <div className="flex flex-col lg:flex-row gap-4">
            <InputField label="Comments">
              <textarea
                rows={1}
                className="input-field min-w-200"
                {...register("investigationComments")}
              />
            </InputField>

            <InputField label="Abnormal Report">
              <select
                className="input-field min-w-70"
                {...register("isAbnormalResult", { valueAsNumber: true })}
              >
                <option value={0}>No</option>
                <option value={1}>yes</option>
              </select>
            </InputField>
          </div>
        </div>
      )}

      {/* buttons */}
      <Buttons onButtonClick={buttonClickHandler} />
      {/* comment */}
      {!!renderInvestigationComment && (
        <ObservationCommentPopup
          isOpen={openInvestigationComment}
          onClose={closeCommentHandler}
          data={selectedCommentInvestigation}
        />
      )}
      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default InvestigationResultEntry;
