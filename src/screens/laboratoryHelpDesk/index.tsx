import CustomDateInput from "@/components/customDateInput";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { SelectStyles } from "@/components/customSelect";
import { ENDPOINTS } from "@/config/defaults";
import { CATEGORY_ID, Status } from "@/constants/constants";
import { LaboratoryHelpDeskButtons, LaboratoryHelpDeskTableHeader } from "@/constants/tableHeaders";
import { AuthContext } from "@/context/AuthContext";
import { RoleContext } from "@/context/RoleContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { InvestigationName, SelectItem, SubSubCategoryItem } from "@/types";
import { showWarning } from "@/utils/alert";
import {
  LaboratoryHelpDeskFormData,
  laboratoryHelpDeskSchema,
} from "@/validation/laboratoryHelpDeskSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { BriefcaseMedical } from "lucide-react";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
import Select, { SingleValue, StylesConfig } from "react-select";
import LabPatientInfo from "../../components/SingledrawerAndPopup/index";
import AddOutSourceReport from "./components/AddOutSourceReport";
import AddReport from "./components/AddReport";
import Notification from "./components/Notification";
import { LaboratoryHelpDeskItem } from "./types";

const LaboratoryHelpDesk = () => {
  const { fetchApi, loading } = useGlobalApi();
  const currentDate = new Date().toISOString().split("T")[0];

  const branchId = useContext(AuthContext)?.user?.branchId ?? 1;
  const roleId = useContext(RoleContext)?.roleId ?? 2;
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState<string>(
    LaboratoryHelpDeskButtons[0]?.buttonName ?? "all"
  );

  const [subSubCategoryList, setSubSubCategoryList] = useState<SubSubCategoryItem[]>([]);

  const [investigationNameList, setInvestigationNameList] = useState<InvestigationName[]>([]);
  const [selectedInvestigationName, setSelectedInvestigationName] = useState<SelectItem | null>(
    null
  );

  const [laboratoryHelpDeskTableData, setLaboratoryHelpDeskTableData] = useState<
    LaboratoryHelpDeskItem[]
  >([]);

  const hasFetched = useRef(false);

  const [openOutSourcePopup, setOpenOutSourcePopup] = useState<boolean>(false);
  const [renderOutSourcePopup, setRenderOutSourcePopup] = useState<boolean>(false);

  const [openDispatchPopup, setOpenDispatchPopup] = useState<boolean>(false);
  const [renderDispatchPopup, setRenderDispatchPopup] = useState<boolean>(false);

  const [openAddReportPopup, setOpenAddReportPopup] = useState<boolean>(false);
  const [renderAddReportPopup, setRenderAddReportPopup] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<LaboratoryHelpDeskItem | null>(null);

  const [openInfoPatientPopup, setOpenInfoPatientPopup] = useState<boolean>(false);
  const [renderInfoPatientPopup, setRenderInfoPatientPopup] = useState<boolean>(false);
  const [selectedPatientInfo, setSelectedPatientInfo] = useState<LaboratoryHelpDeskItem | null>(
    null
  );

  const [openNotificationPopup, setOpenNotificationPopup] = useState<boolean>(false);
  const [renderNotificationPopup, setRenderNotificationPopup] = useState<boolean>(false);
  const [selectedNotificationInfo, setSelectedNotificationInfo] =
    useState<LaboratoryHelpDeskItem | null>(null);

  // params form data
  const { register, setValue, watch, getValues, handleSubmit, reset } = useForm({
    resolver: yupResolver(laboratoryHelpDeskSchema),
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
      subCategoryId: 0,
      subSubCategoryId: 0,
      investigationId: 0,
      roleId: roleId,
      corporateId: 0,
    },
  });

  const fromDate = watch("fromDate");
  const toDate = watch("toDate");

  // sub sub category list
  const getSubSubCategory = async (subCategoryIds: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SUB_SUB_CATEGORY_LIST,
      {},
      { params: { subCategoryIds } },
      { component: "LaboratoryHelpDesk" }
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
      { component: "LaboratoryHelpDesk" }
    );
    setInvestigationNameList(resp?.data ?? []);
  };

  useEffect(() => {
    getSubSubCategory(1);
    getInvestigationName();
  }, []);

  const investigationSelectOption = useMemo(() => {
    return (
      investigationNameList?.map(i => ({
        label: i?.name,
        value: i?.serviceItemId,
      })) ?? []
    );
  }, [investigationNameList]);

  // investigation select handler
  const investigationSelectHandler = (option: SingleValue<SelectItem> | null) => {
    setSelectedInvestigationName(option);
    setValue("investigationId", Number(option?.value) || 0, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // from date change handler
  const fromDateChangeHandler = (value: string) => {
    if (!value) return;
    setValue("fromDate", value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  // to date change handler
  const toDateChangeHandler = (value: string) => {
    if (!value) return;
    setValue("toDate", value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  useEffect(() => {
    if (hasFetched.current) return;

    hasFetched.current = true;
    const initialFormData = getValues();
    getLaboratoryHelpDeskData(initialFormData);
  }, []);

  // get lab results on submit
  const getLaboratoryHelpDeskData = async (params: LaboratoryHelpDeskFormData) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.SEARCH_PATIENT_INVESTIGATION_FOR_LABORATORY_HELP_DESK,
      {},
      { params },
      { component: "LaboratoryHelpDesk" }
    );
    if (!resp?.result) {
      showWarning(resp?.message);
      setLaboratoryHelpDeskTableData([]);
      return;
    }
    setLaboratoryHelpDeskTableData(resp?.data ?? []);
    setActiveIndex(0);
    setActiveFilter(LaboratoryHelpDeskButtons[0]?.buttonName ?? "all");
  };

  const getColorFromButton = (buttonName: string) =>
    LaboratoryHelpDeskButtons.find(button => button.buttonName === buttonName)?.color || "#8C8787";

  const getInvestigationColor = (item: LaboratoryHelpDeskItem) => {
    if (Number(item.isSampleRejected) === Status.ACTIVE) return getColorFromButton("rejected");
    if (Number(item.isUrgent) === Status.ACTIVE) return getColorFromButton("urgent");
    if (Number(item.IsReportHold) === Status.ACTIVE) return getColorFromButton("hold");
    if (Number(item.IsDispatched) === Status.ACTIVE) return getColorFromButton("dispatched");
    if (Number(item.IsReportApproved) === Status.ACTIVE) return getColorFromButton("approved");
    if (
      Number(item.IsResultDone) === Status.ACTIVE &&
      Number(item.IsReportApproved) === Status.INACTIVE
    ) {
      return getColorFromButton("reportApprovalPending");
    }
    if (Number(item.IsSampleReceivedByDepartment) === Status.ACTIVE) {
      return getColorFromButton("departmentReceived");
    }
    if (
      Number(item.IsSampleCollected) === Status.ACTIVE &&
      Number(item.IsResultDone) === Status.INACTIVE
    ) {
      return getColorFromButton("sampleCollected");
    }
    if (
      Number(item.IsSampleRequired) === Status.ACTIVE &&
      Number(item.IsSampleCollected) === Status.INACTIVE
    ) {
      return getColorFromButton("sampleCollectionPending");
    }
    return getColorFromButton("all");
  };

  // color coding
  const getBadgeStyle = (item: LaboratoryHelpDeskItem) => {
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

  // filter by button
  const filterByButton = (buttonName: string, source: LaboratoryHelpDeskItem[]) => {
    switch (buttonName) {
      case "all":
        return source;
      case "sampleCollectionPending":
        return source.filter(
          item =>
            Number(item.IsSampleRequired) === Status.ACTIVE &&
            Number(item.IsSampleCollected) === Status.INACTIVE
        );
      case "sampleCollected":
        return source.filter(
          item =>
            Number(item.IsSampleCollected) === Status.ACTIVE &&
            Number(item.IsResultDone) === Status.INACTIVE
        );
      case "departmentReceived":
        return source.filter(item => Number(item.IsSampleReceivedByDepartment) === Status.ACTIVE);
      case "abnormal":
        return source.filter(() => false);
      case "hold":
        return source.filter(item => Number(item.IsReportHold) === Status.ACTIVE);
      case "reportApprovalPending":
        return source.filter(
          item =>
            Number(item.IsResultDone) === Status.ACTIVE &&
            Number(item.IsReportApproved) === Status.INACTIVE
        );
      case "approved":
        return source.filter(item => Number(item.IsReportApproved) === Status.ACTIVE);
      case "dispatched":
        return source.filter(item => Number(item.IsDispatched) === Status.ACTIVE);
      case "urgent":
        return source.filter(item => Number(item.isUrgent) === Status.ACTIVE);
      default:
        return source;
    }
  };

  // button count
  const getButtonCount = (buttonName: string) =>
    filterByButton(buttonName, laboratoryHelpDeskTableData).length;

  const visibleTableData = useMemo(
    () => filterByButton(activeFilter, laboratoryHelpDeskTableData),
    [activeFilter, laboratoryHelpDeskTableData]
  );

  // cancel handler
  const cancelHandler = () => {
    reset({
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
      subCategoryId: 0,
      subSubCategoryId: 0,
      investigationId: 0,
      roleId: roleId,
      corporateId: 0,
    });
    setSelectedInvestigationName(null);
  };

  // close out source handler
  const closeOutSourceHandler = useCallback(() => {
    setOpenOutSourcePopup(false);
  }, []);

  // out source
  const outSourcePopupHandler = (item: LaboratoryHelpDeskItem) => {
    setOpenOutSourcePopup(true);
    setRenderOutSourcePopup(true);
  };

  // patient info handler
  const patientInfoHandler = (item: LaboratoryHelpDeskItem) => {
    if (!item) return;
    setSelectedPatientInfo(item);
    setOpenInfoPatientPopup(true);
    setRenderInfoPatientPopup(true);
  };

  // close patient info
  const closePatientInfoHandler = useCallback(() => {
    setOpenInfoPatientPopup(false);
  }, []);

  // patient notification handler
  const patientNotificationHandler = (item: LaboratoryHelpDeskItem) => {
    if (!item) return;
    setSelectedNotificationInfo(item);
    setOpenNotificationPopup(true);
    setRenderNotificationPopup(true);
  };

  // close notification info
  const closeNotificationInfoHandler = useCallback(() => {
    setOpenNotificationPopup(false);
  }, []);

  // add report handler
  const patientAddReportHandler = (item: LaboratoryHelpDeskItem) => {
    if (!item) return;
    setOpenAddReportPopup(true);
    setRenderAddReportPopup(true);
    setSelectedReport(item);
    l;
  };

  // close add report
  const closeAddReportHandler = useCallback(() => {
    setOpenAddReportPopup(false);
  }, []);

  return (
    <div className="page-container">
      <h1 className="page-heading">Laboratory Help Desk</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Laboratory Help Desk</span>
      </nav>
      <form className="card" onSubmit={handleSubmit(getLaboratoryHelpDeskData)}>
        <div className="form-grid-4">
          <InputField label="From Date" required>
            <CustomDateInput value={fromDate} onChange={fromDateChangeHandler} max={currentDate} />
          </InputField>

          <InputField label="To Date">
            <CustomDateInput value={toDate} onChange={toDateChangeHandler} max={currentDate} />
          </InputField>

          <InputField label="Patient Name">
            <input
              type="text"
              className="input-field"
              placeholder="Enter patient name"
              {...register("patientName")}
            />
          </InputField>

          <InputField label="Type">
            <select className="input-field" {...register("typeId")}>
              <option value={0}>All</option>
              <option value={1}>OPD</option>
              <option value={2}>IPD</option>
            </select>
          </InputField>

          <InputField label="IPD Number">
            <input
              type="text"
              className="input-field"
              placeholder="Enter ipd number "
              {...register("ipdNo")}
            />
          </InputField>

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
              {...register("uhid")}
              placeholder="Enter UHID "
            />
          </InputField>

          <InputField label="Bar Code">
            <input
              type="text"
              className="input-field"
              {...register("barcode")}
              placeholder="Enter Barcode No "
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

          <InputField label="Investigation Name">
            <Select<SelectItem, false>
              value={selectedInvestigationName}
              options={investigationSelectOption}
              placeholder="Select investigation name"
              isSearchable
              isClearable
              onChange={option => investigationSelectHandler(option)}
              styles={SelectStyles as StylesConfig<SelectItem, false>}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </InputField>

          {/* <InputField label="Quick Search">
            <input
              type="text"
              className="input-field"
              placeholder="Enter for quick search "
              // value={searchValue}
              // onChange={e => setSearchValue(e.target.value)}
            />
          </InputField> */}
        </div>

        {/* action buttons */}
        <div className="mt-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* left side */}
          <div className="flex flex-wrap items-center gap-4">
            <input type="checkbox" className="input-checkbox" />
            <input type="checkbox" className="input-checkbox" />
            <input type="checkbox" className="input-checkbox" />

            <select className="border border-gray-400 rounded-sm w-32">
              <option>All</option>
            </select>
          </div>

          {/* right side */}
          <div className="flex flex-col sm:flex-row  w-full lg:w-auto">
            <button type="button" className="save-btn w-full m-2  sm:w-auto">
              Print
            </button>

            <button type="submit" className="save-btn w-full m-2 sm:w-auto">
              Search
            </button>

            <button type="button" className="cancel-btn w-full sm:w-auto" onClick={cancelHandler}>
              Cancel
            </button>
          </div>
        </div>
      </form>

      {/* render buttons */}
      <div className="flex lg:flex-row sm:flex-col gap-2 m-2 overflow-x-auto">
        {LaboratoryHelpDeskButtons.map((b, idx) => {
          const isActive = idx === activeIndex;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setActiveIndex(idx);
                setActiveFilter(b.buttonName);
              }}
              className="flex items-center gap-2 px-2 py-2 rounded-xl whitespace-nowrap text-sm font-medium border transition-all duration-200"
              style={{
                backgroundColor: isActive ? b.color : "#fff",
                borderColor: b.color,
                color: isActive ? "#000" : "#333",
                transform: isActive ? "scale(0.95)" : "scale(1)",
                boxShadow: isActive ? "0 4px 8px rgba(0,0,0,0.08)" : "none",
              }}
            >
              <div style={{ backgroundColor: b.color }} className="p-1 rounded-md">
                <BriefcaseMedical size={14} className="text-black" />
              </div>
              <span>
                {b.level}: {getButtonCount(b.buttonName)}
              </span>
            </button>
          );
        })}
      </div>
      {/* table */}
      <div className="table-container ">
        <div className="table-scroll-wrapper ">
          <div className="table-size lg:min-h-60 lg:max-h-60">
            <table className="base-table ">
              <thead className="table-head">
                <tr>
                  {LaboratoryHelpDeskTableHeader.map((h, index) => (
                    <th key={index} className="table-th ">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {visibleTableData.length === 0 ? (
                  <tr>
                    <td colSpan={17} className="no-data-text">
                      No data found
                    </td>
                  </tr>
                ) : (
                  visibleTableData.map((item, idx) => (
                    <tr key={idx} className="table-row">
                      <td className="table-td">{item.Barcode}</td>
                      <td className="table-td">{item?.LabNo || "-"}</td>
                      <td className="table-td">{item?.BillDate || "-"}</td>
                      <td className="table-td">{item?.UHID || "-"}</td>
                      <td className="table-td">{item?.PatientName || "-"}</td>
                      <td className="table-td">
                        {item?.CurrentAge || "-"} / {item?.Gender}
                      </td>
                      <td className="table-td">{item?.ContactNumber || "-"}</td>
                      <td className="table-td">
                        <span style={getBadgeStyle(item)}>{item?.Name || "-"}</span>
                      </td>
                      <td className="table-td">
                        <input type="checkbox" className="input-checkbox" />
                      </td>
                      <td className="table-td" onClick={() => outSourcePopupHandler(item)}>
                        <i className="fa-solid fa-upload icon-color-button"></i>
                      </td>

                      <td className="table-td">
                        <i className="fa-solid fa-paper-plane icon-color-button"></i>
                      </td>
                      <td className="table-td" onClick={() => patientInfoHandler(item)}>
                        <i className="fa-solid fa-search icon-color-button"></i>
                      </td>
                      <td className="table-td" onClick={() => patientAddReportHandler(item)}>
                        <i className="fa-solid fa-file-lines icon-color-button"></i>
                      </td>

                      <td className="table-td" onClick={() => patientNotificationHandler(item)}>
                        <i className="fa-solid fa-bell icon-color-button"></i>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* outsource */}
      {!!renderOutSourcePopup && (
        <AddOutSourceReport isOpen={openOutSourcePopup} onClose={closeOutSourceHandler} />
      )}

      {/* patient info */}
      {!!renderInfoPatientPopup && selectedPatientInfo && (
        <LabPatientInfo
          isOpen={openInfoPatientPopup}
          onClose={closePatientInfoHandler}
          data={selectedPatientInfo}
        />
      )}

      {/* notification */}
      {!!renderNotificationPopup && selectedNotificationInfo && (
        <Notification
          isOpen={openNotificationPopup}
          onClose={closeNotificationInfoHandler}
          data={selectedNotificationInfo}
        />
      )}

      {/* add report */}
      {!!renderAddReportPopup && selectedReport && (
        <AddReport
          isOpen={openAddReportPopup}
          onClose={closeAddReportHandler}
          data={selectedReport}
        />
      )}

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default LaboratoryHelpDesk;
