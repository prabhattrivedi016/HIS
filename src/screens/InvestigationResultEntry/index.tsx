import TextEditor from "@/components/ckEditor";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { LabTypeIdValues, LabTypeName } from "@/constants/constants";
import { InvestigationResultEntryTableHeader } from "@/constants/tableHeaders";
import { AuthContext } from "@/context/AuthContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { allowOnlyNumbers } from "@/utils/inputValidationHandler";
import { useCallback, useContext, useEffect, useState } from "react";
import { NavLink, useLocation, useParams } from "react-router-dom";
import Buttons from "./components/Buttons";
import ObservationCommentPopup from "./components/ObservationCommentPopup";
import { InvestigationItem, TabularTableDataItem } from "./types";

const InvestigationResultEntry = () => {
  const paramsValue = useParams();
  const location = useLocation();

  const item = location.state;
  const { loading, fetchApi } = useGlobalApi();

  console.log("item", item);

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

  const [allInvestigationOfSinglePatient, setAllInvestigationOfSinglePatient] = useState<
    InvestigationItem[]
  >([]);

  const [renderInvestigationComment, setRenderInvestigationComment] = useState<boolean>(false);
  const [openInvestigationComment, setOpenInvestigationComment] = useState<boolean>(false);
  const [selectedCommentInvestigation, setSelectedInvestigationComment] =
    useState<TabularTableDataItem | null>(null);

  const [textEditorValue, setTextEditorValue] = useState<string>("");

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

  if (!paramsValue) return;

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

    console.log("resp of all investigation of one patient", resp?.data);

    const tabs = resp?.data?.map((i: InvestigationItem) => i?.Name) ?? [];

    setTabNames(tabs);
    setAllInvestigationOfSinglePatient(resp?.data ?? []);
  };

  useEffect(() => {
    const labTypeId =
      paramsValue?.department === LabTypeName?.PATHOLOGY
        ? LabTypeIdValues?.PATHOLOGY
        : LabTypeIdValues?.RADIOLOGY;

    console.log("labTypeId", labTypeId);

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
  }, [paramsValue, item]);

  // tabular result entry value

  const getTabularResultEntryValue = async (patientInvestigationId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PATIENT_TABULAR_REPORT_FOR_RESULT_ENTRY,
      {},
      { params: { patientInvestigationId } },
      { component: "InvestigationResultEntry" }
    );

    setTabularInvestigationTableData(resp?.data ?? []);
  };

  // free text entry value
  const getFreeTextResultEntryValue = async (patientInvestigationId: number) => {
    console.log("free text is called");

    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PATIENT_FREE_TEXT_REPORT_FOR_RESULT_ENTRY,
      {},
      { params: { patientInvestigationId } },
      { component: "InvestigationResultEntry" }
    );

    setFreeTextInvestigationTableData(resp?.data ?? []);
  };

  useEffect(() => {
    if (item && paramsValue && activeTab) {
      const selectedInvestigation = allInvestigationOfSinglePatient?.find(
        i => i?.Name === activeTab
      );

      if (selectedInvestigation?.PatientInvestigationId) {
        const reportTypeId = Number(selectedInvestigation?.ReportTypeId);
        setActiveReportTypeId(Number.isFinite(reportTypeId) ? reportTypeId : null);

        // Prevent showing stale data when switching tabs
        setTabularInvestigationTableData([]);
        setFreeTextInvestigationTableData([]);

        if (reportTypeId === LabTypeIdValues?.PATHOLOGY) {
          getTabularResultEntryValue(Number(selectedInvestigation?.PatientInvestigationId));
        } else {
          getFreeTextResultEntryValue(Number(selectedInvestigation?.PatientInvestigationId));
        }
      }
    }
  }, [item, paramsValue, activeTab, allInvestigationOfSinglePatient]);

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
      prev.map(i => (i?.ObservationId === row?.ObservationId ? { ...i, ...patch } : i))
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

  const onFreeTextFieldChange =
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
      >
    ) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateTableRowByObservationId(setFreeTextInvestigationTableData, row, {
        [field]: e.target.value,
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
    setRenderInvestigationComment(false);
    setOpenInvestigationComment(false);
    setSelectedInvestigationComment(null);
  }, []);

  // text editor change handler
  const textEditorChangeHandler = (data: string) => {
    setTextEditorValue(data);
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

                    {tabularInvestigationTableData.map((item, idx) => (
                      <tr key={idx} className="table-row">
                        <td className="table-td max-w-30">{item?.ObservationName || "-"}</td>
                        <td className="table-td">
                          {
                            <input
                              type="checkbox"
                              className="input-checkbox"
                              value={item?.IsBold}
                              onChange={onTabularFieldChange(item, "IsBold")}
                            />
                          }
                        </td>
                        <td className="table-td">
                          {
                            <input
                              type="text"
                              className="input-field max-w-25"
                              value={item?.ResultValue ?? ""}
                              onChange={onTabularFieldChange(item, "ResultValue")}
                              onInput={allowOnlyNumbers}
                            />
                          }
                        </td>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-4">
            <InputField label="Comments">
              <textarea rows={1} className="input-field min-w-200" />
            </InputField>

            <InputField label="Abnormal Report">
              <select className="input-field min-w-70">
                <option value={0}>No</option>
                <option value={1}>yes</option>
              </select>
            </InputField>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 card mt-1">
          <h1 className="font-bold">{activeTab} </h1>
          <div className="table-container mt-1 ">
            <div className="table-scroll-wrapper ">
              <div className="table-size lg:min-h-80 lg:max-h-60">
                {/* <table className="base-table ">
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
                    {freeTextInvestigationTableData?.length === 0 && (
                      <tr>
                        <td
                          colSpan={InvestigationResultEntryTableHeader.length}
                          className="table-empty"
                        >
                          No records found
                        </td>
                      </tr>
                    )}

                    {freeTextInvestigationTableData.map((item, idx) => (
                      <tr key={idx} className="table-row">
                        <td className="table-td">{item?.ObservationName || "-"}</td>
                        <td className="table-td">
                          <input
                            type="text"
                            className="input-field max-w-25"
                            value={item?.ResultValue ?? ""}
                            onChange={onFreeTextFieldChange(item, "ResultValue")}
                          />
                        </td>

                        <td className={`table-td ${flagClassName(getResultFlag(item))}`}>
                          {getResultFlag(item)}
                        </td>
                        <td className="table-td">
                          <input
                            type="text"
                            className="input-field max-w-20"
                            value={item?.MinValue ?? ""}
                            onChange={onFreeTextFieldChange(item, "MinValue")}
                          />
                        </td>
                        <td className="table-td">
                          <input
                            type="text"
                            className="input-field max-w-20"
                            value={item?.MaxValue ?? ""}
                            onChange={onFreeTextFieldChange(item, "MaxValue")}
                          />
                        </td>
                        <td className="table-td">
                          <input
                            type="text"
                            className="input-field max-w-20"
                            value={item?.DisplayRange ?? ""}
                            onChange={onFreeTextFieldChange(item, "DisplayRange")}
                          />
                        </td>
                        <td className="table-td">
                          <input
                            type="text"
                            className="input-field max-w-20"
                            value={item?.Unit ?? ""}
                            onChange={onFreeTextFieldChange(item, "Unit")}
                          />
                        </td>
                        <td className="table-td">{item?.MethodName || "-"}</td>
                        <td className="table-td">
                          <input
                            type="text"
                            className="input-field max-w-20"
                            value={item?.MachineResult ?? ""}
                            onChange={onFreeTextFieldChange(item, "MachineResult")}
                          />
                        </td>
                        <td className="table-td">{"-"}</td>
                        <td className="table-td">
                          <input
                            type="text"
                            className="input-field max-w-20"
                            value={item?.MachineUnit ?? ""}
                            onChange={onFreeTextFieldChange(item, "MachineUnit")}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table> */}

                {/* template */}
                <div className="m-2 flex flex-col gap-3 lg:flex-row lg:items-start">
                  <div className="w-full lg:w-70">
                    <InputField label="Select Template">
                      <input type="text" className="input-field" />
                    </InputField>
                  </div>

                  <div className="w-full lg:w-70">
                    <InputField label="Template Name">
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Enter template name"
                      />
                    </InputField>
                  </div>

                  {/* Buttons */}
                  <div className="flex w-full justify-end gap-3 lg:mt-6 lg:w-auto">
                    <button type="submit" className="save-btn h-10">
                      Save New
                    </button>

                    <button type="button" className="save-btn h-10">
                      Update
                    </button>
                  </div>
                </div>
                {/* editor */}
                <TextEditor onChange={textEditorChangeHandler} value={textEditorValue} />
              </div>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-4">
            <InputField label="Comments">
              <textarea rows={1} className="input-field min-w-200" />
            </InputField>

            <InputField label="Abnormal Report">
              <select className="input-field min-w-70">
                <option value={0}>No</option>
                <option value={1}>yes</option>
              </select>
            </InputField>
          </div>
        </div>
      )}

      {/* buttons */}
      <Buttons />
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
