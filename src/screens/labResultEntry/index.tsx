import CustomDateInput from "@/components/customDateInput";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { CATEGORY_ID, Status } from "@/constants/constants";
import { LabResultEntryButtons, LabResultEntryTableHeader } from "@/constants/tableHeaders";
import { AuthContext } from "@/context/AuthContext";
import { RoleContext } from "@/context/RoleContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showInfo } from "@/utils/alert";
import { labResultEntrySchema } from "@/validation/labResultEntrySchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { BriefcaseMedical } from "lucide-react";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
import { ButtonValue } from "../sampleManagement/types";
import LRPatientInvestigation from "./components/LRPatientInvestigation";
import LRRemarkPopup from "./components/LRRemarkPopup";
import {
  InvestigationName,
  LabResultEntryTableData,
  SelectItem,
  SubSubCategoryItem,
} from "./types";

export const LabSampleData = [
  {
    BillDate: "28-Feb-2026 12:49 PM",
    Type: "OPD",
    UHID: "GWT/25-26/00000057",
    IPDNo: 0,
    LabNo: 101,
    WardName: "",
    PatientName: "MR. RADHA",
    CurrentAge: "100Y 0M 0D",
    TotalBalanceAmount: 0.0,
    CorporateName: "01 CASH",
    ClientName: "01 : GRAVITY WEB TECHNOLOGIES",
    referDoctorName: "",
    Gender: "MALE",
    VisitId: 4079,
    isUrgent: 1,
    Barcode: "101",
    IsSampleRequired: 0,
    IsSampleSegregationRequired: 0,
    IsDepartmentReceivingRequired: 1,
    PatientInvestigationId: 5152,
    ReportTypeId: 1,
    IsReportHold: 0,
    CreatedOn: "Feb 28 2026 12:49PM",
    VIPPatient: 0,
    IsSampleSegregated: 0,
    SampleSegregationOn: "",
    IsSampleCollected: 1,
    SampleCollectedOn: "Feb 28 2026 12:49PM",
    IsSampleReceivedByDepartment: 1,
    SampleReceivedByDepartmentOn: "Feb 28 2026 12:49PM",
    IsResultDone: 0,
    ResultDoneOn: "",
    IsReportApproved: 0,
    ReportApprovedOn: "",
    IsDispatched: 0,
    DispatchedOn: "",
    isSampleRejected: 0,
    isReportPrinted: 0,
    DeliveryDate: "Feb 28 2026  8:49PM",
    RemainingTime: "16:48",
    isExpired: "0",
    IsAllergyTest: 0,
    IsUnderPackage: 0,
    Name: "CBC -(COMPLETE BLOOD COUNT)",
    isMachineResult: 0,
  },
  {
    BillDate: "28-Feb-2026 12:49 PM",
    Type: "OPD",
    UHID: "GWT/25-26/00000057",
    IPDNo: 0,
    LabNo: 101,
    WardName: "",
    PatientName: "MR. RADHA",
    CurrentAge: "100Y 0M 0D",
    TotalBalanceAmount: 0.0,
    CorporateName: "01 CASH",
    ClientName: "01 : GRAVITY WEB TECHNOLOGIES",
    referDoctorName: "",
    Gender: "MALE",
    VisitId: 4079,
    isUrgent: 1,
    Barcode: "101",
    IsSampleRequired: 0,
    IsSampleSegregationRequired: 0,
    IsDepartmentReceivingRequired: 0,
    PatientInvestigationId: 5153,
    ReportTypeId: 1,
    IsReportHold: 0,
    CreatedOn: "Feb 28 2026 12:49PM",
    VIPPatient: 0,
    IsSampleSegregated: 0,
    SampleSegregationOn: "",
    IsSampleCollected: 1,
    SampleCollectedOn: "Feb 28 2026 12:49PM",
    IsSampleReceivedByDepartment: 0,
    SampleReceivedByDepartmentOn: "",
    IsResultDone: 0,
    ResultDoneOn: "",
    IsReportApproved: 0,
    ReportApprovedOn: "",
    IsDispatched: 0,
    DispatchedOn: "",
    isSampleRejected: 0,
    isReportPrinted: 0,
    DeliveryDate: "Feb 28 2026  1:49PM",
    RemainingTime: "0",
    isExpired: "1",
    IsAllergyTest: 0,
    IsUnderPackage: 0,
    Name: "LIVER FUNCTION TEST (LFT)",
    isMachineResult: 0,
  },
  {
    BillDate: "28-Feb-2026 12:49 PM",
    Type: "OPD",
    UHID: "GWT/25-26/00000057",
    IPDNo: 0,
    LabNo: 101,
    WardName: "",
    PatientName: "MR. RADHA",
    CurrentAge: "100Y 0M 0D",
    TotalBalanceAmount: 0.0,
    CorporateName: "01 CASH",
    ClientName: "01 : GRAVITY WEB TECHNOLOGIES",
    referDoctorName: "",
    Gender: "MALE",
    VisitId: 4079,
    isUrgent: 1,
    Barcode: "101",
    IsSampleRequired: 0,
    IsSampleSegregationRequired: 0,
    IsDepartmentReceivingRequired: 0,
    PatientInvestigationId: 5154,
    ReportTypeId: 1,
    IsReportHold: 0,
    CreatedOn: "Feb 28 2026 12:49PM",
    VIPPatient: 0,
    IsSampleSegregated: 0,
    SampleSegregationOn: "",
    IsSampleCollected: 1,
    SampleCollectedOn: "Feb 28 2026 12:49PM",
    IsSampleReceivedByDepartment: 0,
    SampleReceivedByDepartmentOn: "",
    IsResultDone: 0,
    ResultDoneOn: "",
    IsReportApproved: 0,
    ReportApprovedOn: "",
    IsDispatched: 0,
    DispatchedOn: "",
    isSampleRejected: 0,
    isReportPrinted: 0,
    DeliveryDate: "",
    RemainingTime: "0",
    isExpired: "0",
    IsAllergyTest: 0,
    IsUnderPackage: 0,
    Name: "KIDNEY FUNCTION TEST (KFT)",
    isMachineResult: 0,
  },
];

const LabResultEntry = () => {
  const { loading, error, fetchApi } = useGlobalApi();

  const currentDate = new Date().toISOString().split("T")[0];
  const [activeIndex, setActiveIndex] = useState(0);

  const [selectedPatient, setSelectedPatient] = useState<LabResultEntryTableData | null>(null);
  const [selectedRemarkPatient, setSelectedRemarkPatient] =
    useState<LabResultEntryTableData | null>(null);

  const [openPatientDrawer, setOpenPatientDrawer] = useState<boolean>(false);
  const [renderPatientDrawer, setRenderPatientDrawer] = useState<boolean>(false);
  const [openRemarkPopup, setOpenRemarkPopup] = useState<boolean>(false);
  const [renderRemarkPopup, setRenderRemarkPopup] = useState<boolean>(false);

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

  const [showTable, setShowTable] = useState<boolean>(false);

  const hasFetched = useRef(false);

  // role
  const roleContext = useContext(RoleContext);
  const roleId = roleContext?.roleId;

  // branch
  const authData = useContext(AuthContext);
  const branchId = authData?.user?.branchId;

  const openPatientInvestigation = (item: LabResultEntryTableData) => {
    setSelectedPatient(item);
    setRenderPatientDrawer(true);
    setOpenPatientDrawer(true);
  };

  const remarkHandler = (item: LabResultEntryTableData) => {
    setSelectedRemarkPatient(item);
    setRenderRemarkPopup(true);
    requestAnimationFrame(() => {
      setOpenRemarkPopup(true);
    });
  };

  const closePatientDrawer = useCallback(() => {
    setOpenPatientDrawer(false);
  }, []);

  const closeHandler = useCallback(() => {
    setOpenRemarkPopup(false);
  }, []);

  // lab result form data
  const {
    register,
    handleSubmit,
    control,
    setValue,
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
      subCategoryId: 0,
      subSubCategoryId: 0,
      investigationId: 0,
    },
  });

  // sub sub category list
  const getSubSubCategory = async (subCategoryIds: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SUB_SUB_CATEGORY_LIST,
      {},
      { params: { subCategoryIds } },
      { component: "LabResultEntry" }
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
      { component: "LabResultEntry" }
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
      fromDate: currentDate,
      toDate: currentDate,
      statusId: 0,
      barcode: "",
      patientName: "",
      subCategoryId: 0,
      subSubCategoryId: 0,
      investigationId: 0,
      ...(formData || {}),
      branchId,
      roleId,
    };

    const resp = await fetchApi(
      "GET",
      ENDPOINTS.SEARCH_PATIENT_INVESTIGATION_FOR_SAMPLE_PROCESSING_PATHOLOGY,
      {},
      { params: payload },
      { component: "LabResultEntry" }
    );

    if (!resp?.result) {
      setLabResultEntryTableData([]);
      setTotalPatientCount(0);
      setTotalTestCount(0);
      setApprovedTestCount(0);
      setPendingTestCount(0);
      showInfo(resp?.data?.message || "No data found");
      setShowTable(false);
      return;
    }

    setLabResultEntryTableData(resp?.data ?? []);

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

    fetchLabData();
  }, [branchId, roleId]);

  // search button handler
  const onsubmit = async (data: Record<string, unknown>) => {
    await fetchLabData(data);
  };

  // button count
  const getButtonCount = (buttonName: string) => {
    const data = labResultEntryTableData;

    switch (buttonName) {
      case "resultPending":
        return data.filter(i => i.IsResultDone === 0).length;

      case "hold":
        return data.filter(i => i.IsReportHold === 1).length;

      case "reportApprovedPending":
        return data.filter(i => i.IsResultDone === 1 && i.IsReportApproved === 0).length;

      case "approved":
        return data.filter(i => i.IsReportApproved === 1).length;

      case "printed":
        return data.filter(i => i.isReportPrinted === 1).length;

      case "dispatched":
        return data.filter(i => i.IsDispatched === 1).length;

      case "reRun":
        return data.filter((i: LabResultEntryTableData) => i.isMachineResult === 1).length;

      default:
        return 0;
    }
  };

  // filter data on button click
  const filteredData = useMemo(() => {
    const data = labResultEntryTableData;
    const activeButton = LabResultEntryButtons[activeIndex]?.buttonName;

    switch (activeButton) {
      case "resultPending":
        return data.filter(i => i.IsResultDone === 0);

      case "hold":
        return data.filter(i => i.IsReportHold === 1);

      case "reportApprovedPending":
        return data.filter(i => i.IsResultDone === 1 && i.IsReportApproved === 0);

      case "approved":
        return data.filter(i => i.IsReportApproved === 1);

      case "printed":
        return data.filter(i => i.isReportPrinted === 1);

      case "dispatched":
        return data.filter(i => i.IsDispatched === 1);

      case "reRun":
        return data.filter(i => i.isMachineResult === 1);

      default:
        return data;
    }
  }, [activeIndex, labResultEntryTableData]);

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
    const isPrinted = Number(
      (item as LabResultEntryTableData & { isReportPrinted?: number })?.isReportPrinted
    );
    const isMachineResult = Number(
      (item as LabResultEntryTableData & { isMachineResult?: number })?.isMachineResult
    );

    if (item.IsReportHold === 1) return getColorFromButton("hold");
    if (item.IsDispatched === 1) return getColorFromButton("dispatched");
    if (isPrinted === 1) return getColorFromButton("printed");
    if (item.IsReportApproved === 1) return getColorFromButton("approved");
    if (item.IsResultDone === 1 && item.IsReportApproved === 0)
      return getColorFromButton("reportApprovedPending");
    if (isMachineResult === 1) return getColorFromButton("reRun");

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
            {/* <InputField label="UHID">
              <input
                type="text"
                className="input-field"
                placeholder="Enter UHID"
                {...register("uhid")}
              />
            </InputField> */}

            {/* <InputField label="Barcode">
              <input
                type="text"
                className="input-field"
                placeholder="Enter lab number "
                {...register("barcode")}
              />
            </InputField> */}

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

            {/* <InputField label="Lab Number">
              <input
                type="text"
                className="input-field"
                placeholder="Enter lab number "
                {...register("labNo")}
              />
            </InputField> */}

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
              <input type="text" className="input-field" placeholder="Enter for quick search " />
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

            {/* <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full lg:w-auto">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="headerType"
                    value="proc"
                    className="w-4 h-4 accent-blue-500"
                  />
                  <span className="font-bold">Proc Lab Header</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="headerType"
                    value="login"
                    className="w-4 h-4 accent-blue-500"
                  />
                  <span className="font-bold">Login Header</span>
                </label>
              </div>
              */}

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button type="button" className="save-btn w-full sm:w-auto">
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
            <div className="table-size lg:min-h-85 lg:max-h-85">
              <table className="base-table ">
                <thead className="table-head">
                  <tr>
                    {LabResultEntryTableHeader.map((h, index) => (
                      <th key={index} className="table-th ">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={17} className="text-center py-6 text-gray-500">
                        No data found
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item, idx) => (
                      <tr key={idx} className="table-row">
                        <td className="table-td">{idx + 1}</td>
                        <td className="table-td">{item?.LabNo || "-"}</td>
                        <td className="table-td">{item?.BillDate || "-"}</td>
                        <td className="table-td">{item?.Type || "-"}</td>
                        <td className="table-td">{item?.UHID || "-"}</td>
                        <td className="table-td">{item?.IPDNo || "-"}</td>
                        <td className="table-td">{item?.xyz || "-"}</td>

                        <td className="table-td">{item?.PatientName || "-"}</td>
                        <td className="table-td">
                          {item?.CurrentAge || "-"} / {item?.Gender}
                        </td>

                        <td className="table-td max-w-70">
                          <span style={getBadgeStyle(item)}>{item?.Name || "-"}</span>
                        </td>

                        <td className="table-td">{item?.Barcode || "-"}</td>
                        <td className="table-td">{item?.xv || "-"}</td>
                        <td className="table-td">{item?.sv || "-"}</td>
                        <td className="table-td">{item?.ts || "-"}</td>

                        <td className="table-td cursor-pointer" onClick={() => remarkHandler(item)}>
                          <i className="fa-solid fa-plus text-xl items-center active:scale-80 cursor:pointer"></i>
                        </td>
                        <td
                          className="table-td cursor-pointer"
                          onClick={() => openPatientInvestigation(item)}
                        >
                          <i className="fa-solid fa-info text-xl  text-blue-500 active:scale-80"></i>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
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
      {!!renderPatientDrawer && (
        <LRPatientInvestigation
          isOpen={openPatientDrawer}
          onClose={closePatientDrawer}
          data={selectedPatient}
        />
      )}

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default LabResultEntry;
