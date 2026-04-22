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
import { useCallback, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
import { ButtonValue, CorporateList, SampleManagementTableData } from "./types";

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

  const [corporateList, setCorporateList] = useState<CorporateList[]>([]);
  const [sampleManagementTableData, setSampleManagementTableData] = useState<
    SampleManagementTableData[]
  >([]);
  const [filteredData, setFilteredData] = useState<SampleManagementTableData[]>([]);
  const [showTable, setShowTable] = useState<boolean>(false);

  const [tableData, setTableData] = useState(filteredData || []);

  const closeDrawer = useCallback(() => {
    setOpenPatientDrawer(false);
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
    console.log("buttonName", buttonName);

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

      const data = resp?.data ?? [];

      setSampleManagementTableData(data);

      setFilteredData(filterByButton(sampleManagementButtons[0]?.buttonName, data));
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
    setSampleManagementTableData(tableData);
    setShowTable(true);

    setActiveIndex(0);
    setFilteredData(filterByButton(sampleManagementButtons[0]?.buttonName, tableData));
  };

  // button click handler
  const buttonClickHandler = (value: string) => {
    setFilteredData(filterByButton(value, sampleManagementTableData));
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

  console.log("tableData", tableData);

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
                      <td className="table-td">
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
                      <td className="table-td">{item?.SampleTypeName || "-"}</td>
                      <td className="table-td">
                        <input
                          type="checkbox"
                          className="input-checkbox"
                          checked={item?.IsSampleCollected === 1}
                          onChange={() => handleCheckboxChange(idx)}
                        />
                      </td>

                      <td className="table-td">
                        <input
                          type="checkbox"
                          className="input-checkbox"
                          checked={item?.IsDepartmentReceivingRequired === 1}
                          onChange={() => handleDeptRecvChange(idx)}
                        />
                      </td>

                      <td className="table-td">
                        <i className="fa-solid fa-check icon-color-delete"></i>
                      </td>
                      <td className="table-td">
                        <i className="fa-solid fa-plus icon-color-button"></i>
                      </td>

                      <td className="table-td">
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
      {/* {!!renderPatientDrawer && (
        <PatientInvestigationDetails
          isOpen={openPatientDrawer}
          onClose={closeDrawer}
          data={selectedPatient}
        />
      )} */}

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default SampleManagement;
