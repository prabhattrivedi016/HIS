import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { IpdBillingTableHeader } from "@/constants/tableHeaders";
import { AuthContext } from "@/context/AuthContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { PickMasterItem } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import { IpdPatientItem } from "./types";

type SearchQueryItem = {
  branchId: number;
  searchBy: string;
  searchValue: string;
  statusId: number;
};

const IpdBilling = () => {
  const { loading, fetchApi } = useGlobalApi();

  const branchId = useContext(AuthContext)?.user?.branchId;

  const searchTypeList = usePickMaster("PatientSearchField")?.pickMasterValue ?? [];

  const billingStatusList = usePickMaster("BillingStatusType")?.pickMasterValue ?? [];

  const [searchQuery, setSearchQuery] = useState({
    branchId: branchId,
    searchBy: "",
    searchValue: "",
    statusId: 0,
  });

  // const [activeTab, setActiveTab] = useState<string>(IPDBillingTabName?.TOTAL_ADMITTED);

  // const [filtereddata, setFilteredData] = useState([]);

  // const cashHandler = () => {
  //   setActiveTab(IPDBillingTabName?.CASH);
  //   const filter = sampleData?.filter(c => c?.Corporate.toLowerCase().includes("cash")) ?? [];
  //   setFilteredData(filter);
  // };

  // const admissionHandler = () => {
  //   setActiveTab(IPDBillingTabName?.ADMITTED);
  //   const filter = sampleData?.filter(c => c?.IsDischarged === Status?.INACTIVE) ?? [];
  //   setFilteredData(filter);
  // };

  // const dischargeHandler = () => {
  //   setActiveTab(IPDBillingTabName?.DISCHARGE);
  //   const filter = sampleData?.filter(c => c?.IsDischarged === Status?.ACTIVE) ?? [];
  //   setFilteredData(filter);
  // };

  // const corporateHandler = () => {
  //   setActiveTab(IPDBillingTabName?.CORPORATE);
  //   const filter = sampleData?.filter(c => !c?.Corporate.toLowerCase().includes("cash")) ?? [];
  //   setFilteredData(filter);
  // };

  const getTableDataList = async (searchQuery: SearchQueryItem) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.SEARCH_IPD_PATIENT,
      {},
      { params: searchQuery },
      { component: "IpdBilling" }
    );
    return resp.data ?? [];
  };

  const { data: IpdPatientList = [] } = useQuery({
    queryKey: [getTableDataList, searchQuery],
    queryFn: () => getTableDataList(searchQuery),
  });

  const inputChangeHandler = (
    e: ChangeEvent<HTMLSelectElement> | ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setSearchQuery(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="page-container">
      <h1 className="page-heading">Patient IPD Journey</h1>
      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Patient IPD Journey</span>
      </nav>

      {/* <div className="tab-container rounded-lg overflow-auto whitespace-nowrap">
        <button
          type="button"
          onClick={() => setActiveTab(IPDBillingTabName?.TOTAL_ADMITTED)}
          className={` tab-btn transition
                        ${
                          activeTab === IPDBillingTabName?.TOTAL_ADMITTED
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {IPDBillingTabName?.TOTAL_ADMITTED}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(IPDBillingTabName?.TOTAL_DISCHARGED)}
          className={`px-4 py-2 text-md font-semibold transition
                        ${
                          activeTab === IPDBillingTabName?.TOTAL_DISCHARGED
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {IPDBillingTabName?.TOTAL_DISCHARGED}
        </button>

        <button
          type="button"
          onClick={cashHandler}
          className={`px-4 py-2 text-md font-semibold transition
                        ${
                          activeTab === IPDBillingTabName?.CASH
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {IPDBillingTabName?.CASH}
        </button>

        <button
          type="button"
          onClick={corporateHandler}
          className={`px-4 py-2 text-md font-semibold transition
                        ${
                          activeTab === IPDBillingTabName?.CORPORATE
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {IPDBillingTabName?.CORPORATE}
        </button>

        <button
          type="button"
          onClick={admissionHandler}
          className={`px-4 py-2 text-md font-semibold transition
                        ${
                          activeTab === IPDBillingTabName?.ADMITTED
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {IPDBillingTabName?.ADMITTED}
        </button>

        <button
          type="button"
          onClick={dischargeHandler}
          className={`px-4 py-2 text-md font-semibold transition
                        ${
                          activeTab === IPDBillingTabName?.DISCHARGE
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {IPDBillingTabName?.DISCHARGE}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(IPDBillingTabName?.ZERO_ADVANCES)}
          className={`px-4 py-2 text-md font-semibold transition
                        ${
                          activeTab === IPDBillingTabName?.ZERO_ADVANCES
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {IPDBillingTabName?.ZERO_ADVANCES}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(IPDBillingTabName?.BILL_GENERATED_PENDING)}
          className={`px-4 py-2 text-md font-semibold transition
                        ${
                          activeTab === IPDBillingTabName?.BILL_GENERATED_PENDING
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {IPDBillingTabName?.BILL_GENERATED_PENDING}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(IPDBillingTabName?.FILE_CLOSED_PENDING)}
          className={`px-4 py-2 text-md font-semibold transition
                        ${
                          activeTab === IPDBillingTabName?.FILE_CLOSED_PENDING
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {IPDBillingTabName?.FILE_CLOSED_PENDING}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(IPDBillingTabName?.DISCHARGE_SUMMARY_READY)}
          className={`px-4 py-2 text-md font-semibold transition
                        ${
                          activeTab === IPDBillingTabName?.DISCHARGE_SUMMARY_READY
                            ? "tab-btn-active"
                            : "tab-btn-inactive"
                        }
                      `}
        >
          {IPDBillingTabName?.DISCHARGE_SUMMARY_READY}
        </button>
      </div> */}

      {/* {renderTabs(activeTab)} */}

      {/* search patients */}
      <div className="card">
        {/* <h2 className="card-title ">Search Patient</h2> */}

        <form>
          <div className="form-grid-4">
            {/* <InputField label="Patient Type">
              <select className="input-field">
                <option>Rural Patient</option>
                <option>Urban Patient</option>
              </select>
            </InputField> */}

            <InputField label="Search By">
              <select
                className="input-field"
                name="searchBy"
                value={searchQuery?.searchBy}
                onChange={inputChangeHandler}
              >
                <option value="">--Select--</option>
                {searchTypeList?.map((s: PickMasterItem) => (
                  <option key={s?.key} value={s?.key}>
                    {s?.value}
                  </option>
                ))}
              </select>
            </InputField>

            <InputField label="Search Value">
              <input
                type="text"
                className="input-field"
                placeholder="Enter search value"
                name="searchValue"
                value={searchQuery?.searchValue}
                onChange={inputChangeHandler}
              />
            </InputField>

            <InputField label="Status">
              <select
                className="input-field"
                name="statusId"
                value={searchQuery?.statusId}
                onChange={inputChangeHandler}
              >
                <option value={0}>All</option>
                {billingStatusList?.map((b: PickMasterItem) => (
                  <option key={b?.key} value={b?.key}>
                    {b?.value}
                  </option>
                ))}
              </select>
            </InputField>
          </div>
        </form>
      </div>
      {/* table */}
      <div className="table-container mt-1 ">
        <div className="table-scroll-wrapper ">
          <div className="table-size lg:min-h-120 lg:max-h-120">
            <table className="base-table ">
              <thead className="table-head">
                <tr>
                  {IpdBillingTableHeader.map((h, index) => (
                    <th key={index} className="table-th ">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {IpdPatientList.length === 0 && (
                  <tr>
                    <td colSpan={IpdBillingTableHeader.length} className="table-empty">
                      No records found
                    </td>
                  </tr>
                )}

                {IpdPatientList.map((item: IpdPatientItem, idx: number) => (
                  <tr key={idx} className="table-row">
                    <td className="table-td">{idx + 1}</td>
                    <td className="table-td"></td>
                    <td className="table-td">{item?.UHID || "-"}</td>
                    <td className="table-td">{item?.IPDNo || "-"}</td>
                    <td className="table-td">{item?.PatientName || "-"}</td>
                    <td className="table-td">{item?.Age || "-"}</td>
                    <td className="table-td">{item?.Gender || "-"}</td>
                    <td className="table-td">{item?.ContactNumber || "-"}</td>
                    <td className="table-td">{item?.State || "-"}</td>
                    <td className="table-td">{item?.District || "-"}</td>
                    <td className="table-td">{item?.City || "-"}</td>
                    <td className="table-td wrap-break-word">{item?.Address || "-"}</td>
                    <td className="table-td">{item?.BedNo || "-"}</td>
                    <td className="table-td">
                      {item?.AdmissionDate || "-"} / {item?.AdmissionTime || "-"}
                    </td>
                    <td className="table-td">
                      {item?.DischargeDate || "-"} / {item?.DischargeTime || "-"}
                    </td>
                    <td className="table-td">{item?.Corporate || "-"}</td>
                    <td className="table-td">{item?.UserNAme || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default IpdBilling;
