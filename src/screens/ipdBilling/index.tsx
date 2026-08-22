import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { IpdBillingTableHeader } from "@/constants/tableHeaders";
import { AuthContext } from "@/context/AuthContext";
import { RoleContext } from "@/context/RoleContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { PickMasterItem } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, useContext, useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import RoutingUsingTabUrl from "./components/routingUsingTabUrl";
import { IpdPatientItem, TabNameItem } from "./types";

type SearchQueryItem = {
  branchId: number;
  searchBy: string;
  searchValue: string;
  statusId: number;
};

const IpdBilling = () => {
  const { loading, fetchApi } = useGlobalApi();
  const location = useLocation();

  const patientData = location?.state?.patient;

  const branchId = useContext(AuthContext)?.user?.branchId;
  const roleId = useContext(RoleContext)?.roleId ?? 0;

  const searchTypeList = usePickMaster("PatientSearchField")?.pickMasterValue ?? [];

  const billingStatusList = usePickMaster("BillingStatusType")?.pickMasterValue ?? [];

  const [selectedPatient, setSelectedPatient] = useState<IpdPatientItem | null>(null);

  const [isMoreActionsOpen, setIsMoreActionsOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState({
    branchId: branchId,
    searchBy: "",
    searchValue: "",
    statusId: 0,
  });

  // table list

  const getTableDataList = async (searchQuery: SearchQueryItem) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.SEARCH_IPD_PATIENT,
      {},
      {
        params: searchQuery,
      },
      {
        component: "IpdBilling",
      }
    );

    return resp?.data ?? [];
  };

  const { data: IpdPatientList = [] } = useQuery({
    queryKey: ["getTableDataList", searchQuery],
    queryFn: () => getTableDataList(searchQuery),
  });

  // pre fill auto data for card details
  useEffect(() => {
    if (patientData) {
      const foundPatient = IpdPatientList.find(
        (item: IpdPatientItem) => item.PatientId === patientData.PatientId
      );
      if (foundPatient) {
        setSelectedPatient(foundPatient);
      }
    }
  }, [patientData, IpdPatientList]);

  //  search handler

  const inputChangeHandler = (
    e: ChangeEvent<HTMLSelectElement> | ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setSearchQuery(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  //  patient select handler

  const patientSelectHandler = (item: IpdPatientItem) => {
    if (!item) return;

    setSelectedPatient(item);
  };

  const DetailRow = ({ label, value }: { label: string; value?: string | number | null }) => {
    return (
      <div className="flex items-center gap-1 min-w-0 w-full">
        <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">{label}:</span>

        <span
          className=" text-sm font-medium text-gray-800  truncate min-w-0 overflow-hidden text-ellipsis whitespace-nowrap"
          title={value ? String(value) : "-"}
        >
          {value || "-"}
        </span>
      </div>
    );
  };

  //  get  tabs
  const getTabsForIpdBilling = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_BILLING_TABS,
      {},
      { params: { branchId, roleId, tabTypeId: 1 } },
      { component: "IpdBilling" }
    );

    return resp?.data ?? [];
  };

  // ipd tabs

  const { data: ipdTabs } = useQuery({
    queryKey: ["getTabsForIpdBilling", branchId, roleId],
    queryFn: () => getTabsForIpdBilling(),
    enabled: !!branchId && !!roleId,
  });

  // ipd group tabs
  const groupedIpdTabs = useMemo(() => {
    const groups: Record<string, TabNameItem[]> = {};

    (ipdTabs ?? []).forEach((tab: TabNameItem) => {
      const groupName = tab?.GroupTypeName || "Other";

      if (!groups[groupName]) {
        groups[groupName] = [];
      }

      groups[groupName].push(tab);
    });

    Object.values(groups).forEach(tabs => {
      tabs.sort((a, b) => Number(a?.SequenceNo ?? 0) - Number(b?.SequenceNo ?? 0));
    });

    return Object.entries(groups).sort(
      ([, tabsA], [, tabsB]) =>
        Number(tabsA[0]?.GroupTypeId ?? 9999) - Number(tabsB[0]?.GroupTypeId ?? 9999)
    );
  }, [ipdTabs]);

  const [activeTab, setActiveTab] = useState<TabNameItem | null>(null);

  // auto select active tab on navigation
  useEffect(() => {
    if (ipdTabs && ipdTabs.length > 0 && location.state?.activeTabName) {
      const matchingTab = ipdTabs.find((t: TabNameItem) =>
        t.TabName.toLowerCase().includes(location.state.activeTabName.toLowerCase())
      );
      if (matchingTab) {
        setActiveTab(matchingTab);
      }
    }
  }, [ipdTabs, location.state]);

  // Favorite tabs state (loaded from local storage)
  const [favoriteTabIds, setFavoriteTabIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("ipd_favorite_tab_ids");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Helper to check if a tab is favorited
  const isTabFavorite = (tabId: number) => favoriteTabIds.includes(tabId);

  // Toggle favorite status
  const toggleFavoriteTab = (tabId: number) => {
    setFavoriteTabIds(prev => {
      const updated = prev.includes(tabId) ? prev.filter(id => id !== tabId) : [...prev, tabId];
      localStorage.setItem("ipd_favorite_tab_ids", JSON.stringify(updated));
      return updated;
    });
  };

  // Top visible tabs limit: favorited tabs (or first 6 tabs by default) + active tab
  const visibleTabs = useMemo(() => {
    const list: TabNameItem[] = [];
    if (favoriteTabIds.length > 0) {
      (ipdTabs ?? []).forEach(tab => {
        if (favoriteTabIds.includes(Number(tab.TabId))) {
          list.push(tab);
        }
      });
    } else {
      list.push(...(ipdTabs ?? []).slice(0, 6));
    }
    if (activeTab && !list.some(t => t.TabId === activeTab.TabId)) {
      list.push(activeTab);
    }
    return list;
  }, [ipdTabs, favoriteTabIds, activeTab]);

  const openMoreActionsButtonHandler = () => {
    setIsMoreActionsOpen(prev => !prev);
  };

  // back page handler
  const backPageHandler = () => {
    setSelectedPatient(null);
  };

  return (
    <div className="page-container w-full min-w-0">
      {!selectedPatient ? (
        <>
          <h1 className="page-heading">Patient IPD Journey</h1>

          <nav className="helper-text">
            <NavLink to="/dashboard" className="hover:underline">
              Home
            </NavLink>

            <span>››</span>

            <span>Patient IPD Journey</span>
          </nav>
        </>
      ) : (
        <div className="flex items-center justify-between w-full flex-col lg:flex-row gap-3">
          <div className="flex-1">
            <h1 className="page-heading">Patient IPD Journey</h1>

            <nav className="helper-text">
              <NavLink to="/dashboard" className="hover:underline">
                Home
              </NavLink>
              <span>››</span>
              <span>Patient IPD Journey</span>
            </nav>
          </div>

          <div className="flex justify-end flex-1">
            <button type="button" className="save-btn" onClick={backPageHandler}>
              Back Page
            </button>
          </div>
        </div>
      )}

      {/* patient search */}

      {!selectedPatient ? (
        <>
          <div className="card w-full min-w-0">
            <form>
              <div className="form-grid-4">
                {/* Search By */}

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

                {/* Search Value */}

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

                {/* Status */}

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

          {/* patient table list */}

          <div className="table-container mt-1">
            <div className="table-scroll-wrapper">
              <div
                className="
                  table-size
                  lg:min-h-120
                  lg:max-h-120
                "
              >
                <table className="base-table">
                  <thead className="table-head">
                    <tr>
                      {IpdBillingTableHeader.map((h, index) => (
                        <th key={index} className="table-th">
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
                      <tr
                        key={item?.PatientId}
                        className="table-row active:scale-97"
                        onDoubleClick={() => patientSelectHandler(item)}
                      >
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
        </>
      ) : (
        <div className="w-full min-w-0">
          <div className=" grid grid-cols-1 sm:grid-cols-2  xl:grid-cols-5 gap-2 w-full items-stretch ">
            {/* patient identity */}

            <div className="card  bg-white  border border-gray-200 rounded-lg  shadow-sm [120px] min-h-[120px]  max-h-[120px] overflow-hidden min-w-0">
              <div className="h-full flex items-center gap-3 p-3 min-w-0">
                {/* Patient Icon */}

                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center">
                    <i className="fa-solid fa-user text-xl text-gray-500"></i>
                  </div>
                </div>

                {/* Patient Info */}

                <div className="min-w-0 flex-1 flex flex-col justify-center gap-2">
                  <DetailRow label="UHID" value={selectedPatient?.UHID} />

                  <DetailRow label="Name" value={selectedPatient?.PatientName} />

                  <DetailRow
                    label="Age/Gender"
                    value={`${selectedPatient?.Age || "-"} / ${selectedPatient?.Gender || "-"}`}
                  />
                </div>
              </div>
            </div>

            {/* patient details */}

            <div className="card bg-white border border-gray-200 rounded-lg shadow-sm h-[120px] min-h-[120px] max-h-[120px] overflow-hidden min-w-0">
              <div className="h-full flex items-center p-3 min-w-0">
                <div className=" w-full min-w-0 flex flex-col justify-center gap-2">
                  <DetailRow label="IPD No." value={selectedPatient?.IPDNo} />

                  <DetailRow label="Doctor" value={selectedPatient?.PrimaryDoctor} />

                  <DetailRow label="Corporate" value={selectedPatient?.Corporate} />
                </div>
              </div>
            </div>

            {/* admission details */}
            <div className="card bg-white border border-gray-200 rounded-lg shadow-sm h-[120px] min-h-[120px] max-h-[120px] overflow-hidden min-w-0">
              <div className="h-full flex items-center p-3 min-w-0">
                <div className="w-full min-w-0 flex flex-col justify-center gap-2">
                  <DetailRow label="Bed" value={selectedPatient?.BedNo} />
                  <DetailRow label="Admit On." value={selectedPatient?.AdmissionDate} />

                  <DetailRow label="Discharge On." value={selectedPatient?.DischargeDate} />
                </div>
              </div>
            </div>

            {/* ward details */}
            <div className=" card bg-white  border  border-gray-200 rounded-lg shadow-sm h-[120px] min-h-[120px] max-h-[120px] overflow-hidden min-w-0">
              <div className="h-full flex items-center p-3 min-w-0">
                <div className=" w-full min-w-0 flex flex-col justify-center gap-2 ">
                  <DetailRow label="Bill Amount" value={selectedPatient?.TotalBillAmount} />

                  <DetailRow
                    label="Disc on Bill"
                    value={selectedPatient?.TotalDiscountAmountOnBill}
                  />

                  <DetailRow
                    label="Disc (%) on Bill"
                    value={selectedPatient?.TotalDiscountPerOnBill}
                  />
                </div>
              </div>
            </div>

            {/* other details */}
            <div className=" card bg-white border border-gray-200 rounded-lg shadow-sm h-[120px] min-h-[120px] max-h-[120px] overflow-hidden min-w-0">
              <div className="h-full flex items-center p-3 min-w-0">
                <div className="w-full min-w-0 flex flex-col justify-center gap-2">
                  <DetailRow
                    label="Net Payable Amount"
                    value={selectedPatient?.TotalPayableAmount}
                  />
                  <DetailRow label="Patient Advance" value={selectedPatient?.TotalBalanceAmount1} />

                  <DetailRow label="Bill No." value={selectedPatient?.BillNo || "-"} />
                </div>
              </div>
            </div>
          </div>
          {/* ipd tabs button */}

          <div className="w-full card mt-1 p-1">
            <div className="flex items-center w-full min-w-0">
              {/* grouped tab */}

              <div className="flex-1 min-w-0">
                <div className="w-full overflow-x-auto hide-scrollbar">
                  <div className="flex items-center gap-2 min-w-max">
                    {visibleTabs.map((i: TabNameItem) => {
                      const isActive = activeTab?.TabId === i?.TabId;
                      return (
                        <button
                          key={i?.TabId}
                          type="button"
                          className={` px-3 py-1.5 text-xs font-semibold whitespace-nowrap flex-shrink-0 rounded-md transition-all duration-200 ${
                            isActive
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                          }
                          `}
                          onClick={() => setActiveTab(i)}
                        >
                          {i?.TabName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* more actions*/}

              <div className="relative flex-shrink-0 ml-1 pl-1 border-l border-gray-200 bg-white">
                <button
                  type="button"
                  className=" save-btn whitespace-nowrap flex items-center gap-2"
                  onClick={openMoreActionsButtonHandler}
                >
                  <span>More Actions</span>

                  <i
                    className={` fa-solid fa-chevron-down text-xs transition-transform duration-200 ${isMoreActionsOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* More Actions Popup */}

                {isMoreActionsOpen && (
                  <div className="absolute right-0 top-full mt-1 z-50 w-120 max-w-[calc(100vw-20px)] bg-white border border-gray-200 rounded-lg shadow-lg p-2">
                    <div className=" max-h-100 overflow-y-auto hide-scrollbar ">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {groupedIpdTabs.map(([groupName, tabs]) => (
                          <div
                            key={groupName}
                            className="border border-gray-200 rounded-md overflow-hidden"
                          >
                            {/* Group Header */}

                            <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-md font-semibold text-gray-600">
                              {groupName}
                            </div>

                            {/* Group Tabs */}

                            <div className="p-1">
                              {tabs.map(tab => {
                                const isFavorite = isTabFavorite(Number(tab?.TabId));

                                return (
                                  <div
                                    key={tab?.TabId}
                                    className="
        group
        w-full
        flex
        items-center
        gap-1
        rounded
        hover:bg-gray-100
        transition
      "
                                  >
                                    {/* Tab */}

                                    <button
                                      type="button"
                                      className="
          flex
          items-center
          gap-2
          flex-1
          min-w-0
          px-2
          py-1.5
          text-left
          text-md
          text-gray-600
        "
                                      onClick={() => {
                                        console.log("Selected Tab:", tab);

                                        setActiveTab(tab);
                                        setIsMoreActionsOpen(false);
                                      }}
                                    >
                                      <i
                                        className="
            fa-solid
            fa-circle-dot
            text-[9px]
            text-gray-400
            group-hover:text-blue-500
            flex-shrink-0
          "
                                      />

                                      <span className="truncate">{tab?.TabName}</span>
                                    </button>

                                    {/* Favorite Star */}

                                    <button
                                      type="button"
                                      title={
                                        isFavorite ? "Remove from favorites" : "Add to favorites"
                                      }
                                      className="flex items-center justify-center w-8 h-8 flex-shrink-0 rounded hover:bg-white transition"
                                      onClick={() => toggleFavoriteTab(Number(tab?.TabId))}
                                    >
                                      <i
                                        className={`
            fa-star
            text-sm
            transition-all
            duration-200
            ${
              isFavorite
                ? "fa-solid text-yellow-500"
                : "fa-regular text-gray-400 hover:text-yellow-500"
            }
          `}
                                      />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* ipd sections */}
          <div className="w-full card mt-1 p-4 min-h-[300px] bg-white border border-gray-200 rounded-lg shadow-sm">
            {activeTab ? (
              <RoutingUsingTabUrl tabViewUrl={activeTab.TabViewURL} patient={selectedPatient} />
            ) : (
              <div className="py-12 text-center text-gray-500">No active tab selected</div>
            )}
          </div>
        </div>
      )}

      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default IpdBilling;
