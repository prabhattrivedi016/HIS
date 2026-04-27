import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import {
  ResultEntryRadiologyButtons,
  ResultEntryRadiologyTableHeader,
} from "@/constants/tableHeaders";
import { AuthContext } from "@/context/AuthContext";
import { RoleContext } from "@/context/RoleContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showInfo } from "@/utils/alert";
import { resultEntryRadiologySchema } from "@/validation/resultEntryRadiology";
import { yupResolver } from "@hookform/resolvers/yup";
import { BriefcaseMedical } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
import { ButtonValue, RadiologyTableItem, SubSubCategoryItem } from "./types";

const ResultEntryRadiology = () => {
  const { loading, error, fetchApi } = useGlobalApi();
  const currentDate = new Date().toISOString().split("T")[0];

  // branch
  const branchId = useContext(AuthContext)?.user?.branchId ?? 1;

  // role
  const roleId = useContext(RoleContext)?.roleId ?? 2;

  const [subSubCategoryList, setSubSubCategoryList] = useState<SubSubCategoryItem[]>([]);

  const [radiologyTableData, setRadiologyTableData] = useState<RadiologyTableItem[]>([]);
  const [radiologyFilteredTableData, setRadiologyFilteredTableData] = useState<
    RadiologyTableItem[]
  >([]);

  const hasFetched = useRef(false);

  const [testActiveBtn, setTestActiveBtn] = useState<string>("");
  const [activeIndex, setActiveIndex] = useState(0);

  const [totalPatientCount, setTotalPatientCount] = useState(0);
  const [totalTestCount, setTotalTestCount] = useState(0);
  const [approvedTestCount, setApprovedTestCount] = useState(0);
  const [pendingTestCount, setPendingTestCount] = useState(0);

  const [renderReport, setRenderReport] = useState<boolean>(false);
  const [openReport, setOpenReport] = useState<boolean>(false);

  const [renderInfo, setRenderInfo] = useState<boolean>(false);
  const [openInfo, setOpenInfo] = useState<boolean>(false);
  const [selectedInfoData, setSelectedInfoData] = useState<any>(null);

  const [renderRemark, setRenderRemark] = useState<boolean>(false);
  const [openRemark, setOpenRemark] = useState<boolean>(false);
  const [selectedRemarkData, setSelectedRemarkData] = useState<any>(null);

  // form Data
  const { register, setValue, handleSubmit, reset } = useForm({
    resolver: yupResolver(resultEntryRadiologySchema),
    defaultValues: {
      branchId: branchId,
      typeId: 0,
      uhid: "",
      ipdNo: "",
      labNo: "",
      fromDate: currentDate,
      toDate: currentDate,
      statusId: 0,
      barcode: "",
      patientName: "",
      subCategoryId: 2,
      subSubCategoryId: 0,
      investigationId: 0,
      roleId: roleId,
      corporateId: 0,
      canSampleCollect: 0,
    },
  });

  const AllTestHandler = () => {
    setRadiologyFilteredTableData(radiologyTableData ?? []);
    setTestActiveBtn("all");
  };
  const xRayTestHandler = () => {
    const filterXray = radiologyTableData.filter(d => d.Name.toLowerCase().includes("x-ray"));
    setRadiologyFilteredTableData(filterXray);
    setTestActiveBtn("xray");
  };
  const ctTestHandler = () => {
    const filterCT = radiologyTableData.filter(d => d.Name.toLowerCase().includes("ct"));
    setRadiologyFilteredTableData(filterCT);
    setTestActiveBtn("ct");
  };
  const usTestHandler = () => {
    const filterUS = radiologyTableData.filter(d => d.Name.toLowerCase().includes("us"));
    setRadiologyFilteredTableData(filterUS);
    setTestActiveBtn("us");
  };
  const mriTestHandler = () => {
    const filterMRI = radiologyTableData.filter(d => d.Name.toLowerCase().includes("mri"));
    setRadiologyFilteredTableData(filterMRI);
    setTestActiveBtn("mri");
  };

  // sub sub category
  const getSubSubCategoryList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SUB_SUB_CATEGORY_LIST,
      {},
      { params: { subCategoryIds: 2 } },
      { component: "ResultEntryRadiology" }
    );
    setSubSubCategoryList(resp.data ?? []);
  };

  useEffect(() => {
    getSubSubCategoryList();
  }, []);

  // fetch on mount on this page
  const fetchRadiologyData = async (formData?: any) => {
    if (!branchId || !roleId) return;

    const payload = {
      branchId,
      roleId,
      typeId: 0,
      uhid: "",
      ipdNo: "",
      labNo: "",
      fromDate: currentDate,
      toDate: currentDate,
      statusId: 0,
      barcode: "",
      patientName: "",
      subCategoryId: 2,
      subSubCategoryId: 0,
      investigationId: 0,
      ...(formData || {}),
    };

    const resp = await fetchApi(
      "GET",
      ENDPOINTS.SEARCH_PATIENT_INVESTIGATION_FOR_SAMPLE_PROCESSING_RADIOLOGY,
      {},
      { params: payload },
      { component: "ResultEntryRadiology" }
    );
    setTestActiveBtn("all");

    if (!resp?.result) {
      showInfo("No data found!");
      return;
    }
    setRadiologyTableData(resp?.data ?? []);
    setRadiologyFilteredTableData(resp?.data ?? []);

    const totalPatient = new Set(resp?.data?.map((d: any) => d.UHID)).size;
    setTotalPatientCount(totalPatient);
    setTotalTestCount(resp?.data?.length ?? 0);
    setApprovedTestCount(resp?.data?.filter((d: any) => d.IsReportApproved === 1)?.length ?? 0);
    setPendingTestCount(resp?.data?.filter((d: any) => d.IsReportApproved === 0)?.length ?? 0);
  };

  useEffect(() => {
    if (!branchId || !roleId) return;

    if (hasFetched.current) return;

    hasFetched.current = true;

    fetchRadiologyData();
  }, [branchId, roleId]);

  const onSubmit = async (formData: any) => {
    await fetchRadiologyData(formData);
  };

  // button count
  const getButtonCount = (buttonName: string) => {
    const data = radiologyFilteredTableData ?? [];

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
        return data.filter(i => i.IsDispatched === 1).length; //done

      default:
        return 0;
    }
  };

  // render buttons
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

  const getColorFromButton = (buttonName: string) =>
    ResultEntryRadiologyButtons.find(btn => btn.buttonName === buttonName)?.color ?? "#8C8787";

  const getInvestigationColor = (item: RadiologyTableItem) => {
    if (item.IsReportHold === 1) return getColorFromButton("hold");
    if (item.IsDispatched === 1) return getColorFromButton("dispatched");
    if (item.IsReportApproved === 1) return getColorFromButton("approved");
    if (item.IsResultDone === 1 && item.IsReportApproved === 0)
      return getColorFromButton("reportApprovedPending");
    if (item.isSampleRejected === 1) return getColorFromButton("rejected");

    return getColorFromButton("resultPending");
  };

  // badge style

  const getBadgeStyle = (item: RadiologyTableItem) => {
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
      <h1 className="page-heading">Radiology Result Entry </h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span> Radiology Result Entry </span>
      </nav>
      <form className="card" onSubmit={handleSubmit(onSubmit)}>
        <div className="form-grid-4">
          <InputField label="UHID" required>
            <input
              type="text"
              className="input-field"
              {...register("uhid")}
              placeholder="Enter UHID "
            />
          </InputField>

          <InputField label="Bar Code" required>
            <input
              type="text"
              className="input-field"
              {...register("barcode")}
              placeholder="Enter Barcode"
            />
          </InputField>

          <InputField label="Patient Name" required>
            <input
              type="text"
              className="input-field"
              {...register("patientName")}
              placeholder="Enter patient name "
            />
          </InputField>

          <InputField label="Type">
            <select className="input-field" {...register("typeId")}>
              <option value={0}>All</option>
              <option value={1}>OPD</option>
              <option value={2}>IPD</option>
            </select>
          </InputField>

          <InputField label="IPD No" required>
            <input
              type="text"
              className="input-field"
              {...register("ipdNo")}
              placeholder="Enter IPD number "
            />
          </InputField>

          <InputField label="Lab No" required>
            <input
              type="text"
              className="input-field"
              {...register("labNo")}
              placeholder="Enter lab number "
            />
          </InputField>

          <InputField label="Department" required>
            <select className="input-field" {...register("subSubCategoryId")}>
              <option value={0}>All</option>
              {subSubCategoryList.map(s => (
                <option key={s.subSubCategoryId} value={s.subSubCategoryId}>
                  {s.subSubCategoryName}
                </option>
              ))}
            </select>
          </InputField>

          <InputField label="From Date" required>
            <input
              type="date"
              className="input-field"
              {...register("fromDate")}
              placeholder="Enter contact number "
              max={currentDate}
            />
          </InputField>

          <InputField label="To Date">
            <input
              type="date"
              className="input-field"
              {...register("toDate")}
              placeholder="Enter contact number "
              max={currentDate}
            />
          </InputField>
        </div>

        <div className="header-summary ">
          {/* --------------------------left stats----------------------------- */}
          <div className="header-summary-left-stats">
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

          {/*-------------------- report filter buttons--------------------------- */}
          <div className="header-summary-test-buttons">
            <button
              type="button"
              className={`lab-page-header-buttons ${
                testActiveBtn === "all" ? "lab-pages-active-btn" : "lab-pages-inactive-btn"
              }`}
              onClick={AllTestHandler}
            >
              All
            </button>

            <button
              type="button"
              className={`lab-page-header-buttons ${
                testActiveBtn === "xray" ? "lab-pages-active-btn" : "lab-pages-inactive-btn"
              }`}
              onClick={xRayTestHandler}
            >
              X-Ray
            </button>

            <button
              type="button"
              className={`lab-page-header-buttons ${
                testActiveBtn === "ct" ? "lab-pages-active-btn" : "lab-pages-inactive-btn"
              }`}
              onClick={ctTestHandler}
            >
              CT
            </button>

            <button
              type="button"
              className={`lab-page-header-buttons ${
                testActiveBtn === "us" ? "lab-pages-active-btn" : "lab-pages-inactive-btn"
              }`}
              onClick={usTestHandler}
            >
              US
            </button>

            <button
              type="button"
              className={`lab-page-header-buttons ${
                testActiveBtn === "mri" ? "lab-pages-active-btn" : "lab-pages-inactive-btn"
              }`}
              onClick={mriTestHandler}
            >
              MRI
            </button>
          </div>

          {/*filter buttons*/}
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

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button type="button" className="save-btn w-full sm:w-auto">
                Print
              </button>

              <button type="button" className="save-btn w-full sm:w-auto">
                Search
              </button>
            </div>
          </div> */}

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

      {/* render buttons */}
      <div className="flex lg:flex-row sm:flex-col gap-2 m-2 overflow-x-auto">
        {renderButton(ResultEntryRadiologyButtons)}
      </div>
      {/* table*/}

      {/* render table */}

      <div className="table-container ">
        <div className="table-scroll-wrapper ">
          <div className="table-size lg:min-h-82 lg:max-h-82">
            <table className="base-table ">
              <thead className="table-head">
                <tr>
                  {ResultEntryRadiologyTableHeader.map((h, index) => (
                    <th key={index} className="table-th ">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {radiologyFilteredTableData.length === 0 ? (
                  <tr>
                    <td colSpan={17} className="text-center py-6 text-gray-500">
                      No data found
                    </td>
                  </tr>
                ) : (
                  radiologyFilteredTableData.map((item, idx) => (
                    <tr key={idx} className="table-row">
                      <td className="table-td">{idx + 1}</td>
                      <td className="table-td">{item?.LabNo || "-"}</td>
                      <td className="table-td">{item?.BillDate || "-"}</td>
                      <td className="table-td">{item?.UHID || "-"}</td>
                      <td className="table-td">{item?.IPDNo ?? 0}</td>
                      <td className="table-td">{item?.PatientName || "-"}</td>
                      <td className="table-td">
                        {item?.CurrentAge || "-"} / {item?.Gender}
                      </td>

                      <td className="table-td max-w-70">
                        <span style={getBadgeStyle(item)}>{item?.Name || "-"}</span>
                      </td>
                      <td className="table-td">{item?.Barcode ?? 0}</td>

                      <td className="table-td">{item?.IsReportApproved || "-"}</td>
                      <td className="table-td">{item?.ReportApprovedOn || "-"}</td>
                      <td className="table-td cursor-pointer">
                        <i className="fa-solid fa-plus icon-color-button"></i>
                      </td>
                      <td className="table-td cursor-pointer">
                        <i className="fa-solid fa-file icon-color-button"></i>
                      </td>
                      <td className="table-td cursor-pointer">
                        <i className="fa-solid fa-info icon-color-button"></i>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/*------------------------ report------------------------------ */}
      {/* {!!renderReport && <RadiologyReport isOpen={openReport} onClose={closeHandler} />} */}
      {/* ------------------------info------------------------- */}
      {/* {!!renderInfo && (
        <PatientInvestigationDetails
          isOpen={openInfo}
          onClose={closeInfoHandler}
          data={selectedInfoData}
        />
      )} */}

      {/* --------------------remark----------------------------- */}
      {/* {!!renderRemark && (
        <RadiologyRemark
          isOpen={openRemark}
          onClose={closeRemarkHandler}
          data={selectedRemarkData}
        />
      )} */}

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default ResultEntryRadiology;

/** {
            "BillDate": "25-Apr-2026",
            "Type": "OPD",
            "UHID": "GWS/00000023",
            "IPDNo": 0,
            "LabNo": 114,
            "WardName": "",
            "PatientName": "MR. PRABHAT TRIVEDI",
            "CurrentAge": "0Y 0M 19D",
            "Gender": "MALE",
            "Name": "CHEST X-RAY",
            "VisitId": 185,
            "TotalBalanceAmount": 0.000000,
            "isUrgent": 0,
            "Barcode": "0",
            "IsSampleRequired": 0,
            "IsDepartmentReceivingRequired": 0,
            "PatientInvestigationId": 196,
            "ReportTypeId": 2,
            "IsReportHold": 0,
            "CreatedOn": "Apr 25 2026 11:18AM",
            "VIPPatient": 0,
            "IsSampleCollected": 0,
            "SampleCollectedOn": "",
            "IsSampleReceivedByDepartment": 0,
            "SampleReceivedByDepartmentOn": "",
            "IsResultDone": 0,
            "ResultDoneOn": "",
            "IsReportApproved": 0,
            "ReportApprovedOn": "",
            "IsDispatched": 0,
            "DispatchedOn": "",
            "isSampleRejected": 0
        }, */
