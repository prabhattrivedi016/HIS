import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { AuthContext } from "@/context/AuthContext";
import { RoleContext } from "@/context/RoleContext";
import { useClickOutside } from "@/hooks/useClickOutside";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { PickMasterItem } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { ChangeEvent, useContext, useEffect, useMemo, useRef, useState } from "react";
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
  const [leftPanelVisible, setLeftPanelVisible] = useState(true);

  const [isMoreActionsOpen, setIsMoreActionsOpen] = useState(false);
  const moreActionsRef = useRef<HTMLDivElement>(null);

  useClickOutside(moreActionsRef, () => {
    setIsMoreActionsOpen(false);
  });

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

  // Keep selectedPatient details synchronized with latest patient list data (e.g. after transfers)
  useEffect(() => {
    if (selectedPatient) {
      const updatedPatient = IpdPatientList.find(
        (item: IpdPatientItem) => item.PatientId === selectedPatient.PatientId
      );
      if (updatedPatient) {
        setSelectedPatient(updatedPatient);
      }
    }
  }, [IpdPatientList]);

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

  const visitFields = [
    { label: "UHID", value: selectedPatient?.UHID, highlight: true },
    // { label: "VisitId", value: selectedPatient?.VisitId, highlight: true },
    { label: "IPD No", value: selectedPatient?.IPDNo, highlight: true },
    { label: "Doctor", value: selectedPatient?.PrimaryDoctor, highlight: true },
    { label: "Corporate", value: selectedPatient?.Corporate, highlight: true },
    { label: "Bed", value: selectedPatient?.BedNo, highlight: true },
    {
      label: "Admission Date & Time",
      value: selectedPatient?.AdmissionDate
        ? `${selectedPatient.AdmissionDate} & ${selectedPatient.AdmissionTime ?? "--"}`
        : null,
      highlight: true,
    },
    {
      label: "Discharge Date & Time",
      value: selectedPatient?.DischargeDate
        ? `${selectedPatient.DischargeDate} & ${selectedPatient.DischargeTime ?? "--"}`
        : null,
      highlight: true,
    },
    { label: "MLC", value: selectedPatient?.MLC, highlight: true },
    { label: "PI", value: selectedPatient?.PiNumber, highlight: true },
    { label: "Address", value: selectedPatient?.FullAddress, highlight: true },
    { label: "PRO Name", value: selectedPatient?.ProName, highlight: true },
    { label: "Billing Type", value: selectedPatient?.BillingType, highlight: true },
    { label: "Bill Amount", value: selectedPatient?.TotalBillAmount, highlight: true },
    { label: "Disc (%) On Bill", value: selectedPatient?.TotalDiscountPerOnBill, highlight: true },
    {
      label: "Disc Amt on Bill",
      value: selectedPatient?.TotalDiscountAmountOnBill,
      highlight: true,
    },
    { label: "Round Off", value: selectedPatient?.RoundOff, highlight: true },
    { label: "Net Payable Amt", value: selectedPatient?.TotalPayableAmount, highlight: true },
    { label: "Patient Advance", value: selectedPatient?.PatientAdvanceAmt, highlight: true },
    { label: "Bill No", value: selectedPatient?.BillNo, highlight: true },
    // { label: "Bill Date", value: selectedPatient?.BillDate, highlight: false },
  ];

  return (
    <div className="page-container w-full min-w-0">
      <div className="flex items-center justify-between w-full mb-3 flex-wrap gap-2">
        <div>
          <h1 className="page-heading">Patient IPD Journey</h1>
          <nav className="helper-text">
            <NavLink to="/dashboard" className="hover:underline">
              Home
            </NavLink>
            <span>››</span>
            <span>Patient IPD Journey</span>
          </nav>
        </div>
        {selectedPatient && (
          <div className="flex justify-end">
            <button
              type="button"
              className="save-btn"
              onClick={() => {
                setSelectedPatient(null);
                setLeftPanelVisible(true);
              }}
            >
              Back Page
            </button>
          </div>
        )}
      </div>

      <div className="relative flex flex-col lg:flex-row w-full items-stretch gap-0">
        {/* LEFT PANEL */}
        <div
          className={`transition-all duration-300 flex-shrink-0 mr-1 ${
            leftPanelVisible ? "lg:w-80 w-full opacity-100" : "hidden lg:block lg:w-0 lg:opacity-0"
          }`}
        >
          <div className="card lg:mr-3 h-full flex flex-col p-0 max-h-[calc(100vh-150px)] overflow-hidden">
            <div className="p-3 flex flex-col gap-1 overflow-y-auto hide-scrollbar flex-1">
              <form onSubmit={e => e.preventDefault()} className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <InputField label="Search By">
                    <select
                      className="input-field text-xs"
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
                  <InputField label="Status">
                    <select
                      className="input-field text-xs"
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

                <InputField label="Search Value">
                  <input
                    type="text"
                    className="input-field text-xs py-1.5"
                    placeholder="Enter search value"
                    name="searchValue"
                    value={searchQuery?.searchValue}
                    onChange={inputChangeHandler}
                  />
                </InputField>
              </form>

              <div className="h-[1px] bg-slate-100 my-1" />

              <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
                {IpdPatientList.length === 0 ? (
                  <div className="text-center text-slate-400 py-10 text-xs font-medium">
                    No records found
                  </div>
                ) : (
                  IpdPatientList.map((item: IpdPatientItem) => {
                    const isSelected =
                      selectedPatient !== null && selectedPatient.PatientId === item.PatientId;
                    return (
                      <div
                        key={item?.PatientId}
                        onClick={() => {
                          setSelectedPatient(item);
                          setLeftPanelVisible(false);
                        }}
                        className={`w-full rounded-xl border shadow-sm p-3 cursor-pointer active:scale-[0.98] transition-all duration-150 ${
                          isSelected
                            ? "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-500 ring-2 ring-blue-100 shadow-md"
                            : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-md hover:bg-blue-50/30"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <div className="w-6 h-6 rounded-full bg-[#0B5394] flex items-center justify-center shrink-0">
                            <User size={11} className="text-white" />
                          </div>
                          <span className="text-xs font-bold text-slate-800 flex-1 truncate">
                            {item?.PatientName}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
                            IPD
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] text-slate-600 mb-1.5">
                          <span className="text-slate-400 text-[10px]">🪪</span>
                          <span className="font-semibold text-slate-700">{item?.UHID}</span>
                          <span className="text-slate-300">|</span>
                          <span className="truncate">
                            {item?.Age} / {item?.Gender}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-1 mb-1">
                          <div className="flex items-center gap-1 min-w-0">
                            <i className="fa-solid fa-user-md text-slate-400 text-[10px] shrink-0" />
                            <span className="text-[11px] text-slate-500 truncate">
                              {item?.PrimaryDoctor || "-"}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                            Bed: {item?.BedNo || "-"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100/80 pt-1.5 mt-1.5">
                          <span>IPD No.</span>
                          <span className="font-bold text-[#0B5394]">{item?.IPDNo || "-"}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setLeftPanelVisible(prev => !prev)}
          title={leftPanelVisible ? "Hide panel" : "Show panel"}
          className={`hidden lg:flex absolute top-1/2 -translate-y-1/2 z-30 w-7 h-7 items-center justify-center rounded-full bg-white border border-slate-300 text-slate-500 shadow-sm hover:bg-blue-50 hover:border-blue-400 hover:text-[#0B5394] transition-all duration-300 ${
            leftPanelVisible ? "left-80 -translate-x-3.5" : "left-0 translate-x-1"
          }`}
        >
          {leftPanelVisible ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* RIGHT CARD / PANEL */}
        <div className="flex-1 min-w-0">
          {selectedPatient === null ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-slate-400 gap-3 py-20 bg-white border border-slate-200/70 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200/60 flex items-center justify-center">
                <i className="fa-solid fa-user-injured text-2xl text-slate-300" />
              </div>
              <p className="text-base font-bold text-slate-500">No patient selected</p>
              <p className="text-xs text-slate-400 max-w-[280px] text-center leading-relaxed">
                Select a patient from the list on the left side to view their IPD billing details
                and perform billing operations.
              </p>
            </div>
          ) : (
            <div className="max-h-[calc(100vh-150px)] flex flex-col pr-0.5">
              <div className="bg-white border border-slate-200/70 rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.04)] mb-3 overflow-hidden flex-shrink-0">
                <div className="h-1 w-full bg-[#0B5394]" />
                {/* ── Section 1: Name / badges / actions ── */}
                <div className="flex flex-wrap items-start justify-between gap-3 px-3 sm:px-4 py-3">
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Avatar */}
                    <div className="relative w-12 h-12 rounded-xl bg-[#0B5394] flex items-center justify-center shrink-0 shadow-md ring-2 ring-white">
                      <User size={24} className="text-white" />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-white" />
                    </div>
                    <div className="flex flex-col gap-1">
                      {/* Name + age + allergy */}
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-base font-bold text-gray-900">
                          {selectedPatient.PatientName}
                        </span>
                        <span className="text-sm text-gray-500">
                          {selectedPatient.Age} · {selectedPatient.Gender}
                        </span>
                      </div>
                      {/* Phone */}
                      <div className="flex items-center gap-3 flex-wrap">
                        {selectedPatient.ContactNumber && (
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded bg-blue-500 flex items-center justify-center shrink-0">
                              <svg
                                className="w-2.5 h-2.5 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                            <span className="text-sm text-blue-600 font-medium">
                              {selectedPatient.ContactNumber}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Section 2: Visit info strip ── */}
                <div className="hidden sm:flex bg-slate-50/70 border-t border-b border-slate-100 px-3 sm:px-4 py-2.5 flex-wrap gap-x-6 gap-y-2">
                  {visitFields
                    .filter(f => f?.value !== "" && f?.value !== null && f?.value !== 0)
                    .map(f => (
                      <div
                        key={f.label}
                        className={`flex flex-col px-2.5 py-1 rounded-lg ${f.highlight ? "bg-teal-50 ring-1 ring-teal-100" : ""}`}
                      >
                        {f?.value && (
                          <>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">
                              {f.label}
                            </span>
                            <span
                              className={`text-sm font-semibold ${f.highlight ? "text-teal-600" : "text-gray-800"}`}
                            >
                              {f.value}
                            </span>
                          </>
                        )}
                      </div>
                    ))}
                </div>
              </div>
              {/* ipd tabs button */}
              <div className="w-full bg-white border border-slate-200/70 rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.04)] -mt-2 p-1.5 flex items-center justify-between gap-3 flex-shrink-0">
                {/* Tabs List */}
                <div className="flex-1 min-w-0 overflow-x-auto hide-scrollbar">
                  <div className="flex items-center gap-2 min-w-max p-0.5">
                    {visibleTabs.map((i: TabNameItem) => {
                      const isActive = activeTab?.TabId === i?.TabId;
                      return (
                        <button
                          key={i?.TabId}
                          type="button"
                          className={`px-4 py-2 text-sm font-semibold whitespace-nowrap flex-shrink-0 rounded-xl transition-all duration-200 flex items-center gap-2 ${
                            isActive
                              ? "bg-[#0B5394] text-white shadow-sm shadow-[#0B5394]/20"
                              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                          onClick={() => setActiveTab(i)}
                        >
                          {i?.IconClass && <i className={i.IconClass} />}
                          <span>{i?.TabName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* More Actions Dropdown */}
                <div
                  className="relative flex-shrink-0 pr-1 pl-3 border-l border-slate-200"
                  ref={moreActionsRef}
                >
                  <button
                    type="button"
                    className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl flex items-center gap-2 hover:bg-slate-800 transition duration-250 shadow-sm"
                    onClick={openMoreActionsButtonHandler}
                  >
                    <span>More Actions</span>
                    <i
                      className={`fa-solid fa-chevron-down text-xs transition-transform duration-250 ${isMoreActionsOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* More Actions Popup */}
                  {isMoreActionsOpen && (
                    <div className="absolute right-0 top-full mt-2 z-50 lg:w-[900px] md:w-[600px] w-[320px] max-w-[calc(100vw-20px)] bg-white border border-slate-200/80 rounded-2xl shadow-[0_10px_30px_-5px_rgba(15,23,42,0.15)] p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="max-h-96 overflow-y-auto hide-scrollbar">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {groupedIpdTabs.map(([groupName, tabs]) => (
                            <div
                              key={groupName}
                              className="border border-slate-100 rounded-xl overflow-hidden"
                            >
                              {/* Group Header */}
                              <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                                {groupName}
                              </div>

                              {/* Group Tabs */}
                              <div className="p-1 space-y-0.5">
                                {tabs.map(tab => {
                                  const isFavorite = isTabFavorite(Number(tab?.TabId));

                                  return (
                                    <div
                                      key={tab?.TabId}
                                      className="group w-full flex items-center justify-between rounded-lg hover:bg-slate-50 transition"
                                    >
                                      {/* Tab Action */}
                                      <button
                                        type="button"
                                        className="flex items-center gap-2.5 flex-1 min-w-0 px-2.5 py-2 text-left text-sm text-slate-700 font-medium"
                                        onClick={() => {
                                          setActiveTab(tab);
                                          setIsMoreActionsOpen(false);
                                        }}
                                      >
                                        {tab?.IconClass ? (
                                          <i
                                            className={`${tab.IconClass} text-[11px] text-[#0B5394]/70 group-hover:text-[#0B5394] flex-shrink-0 w-3 text-center`}
                                          />
                                        ) : (
                                          <i className="fa-solid fa-circle-dot text-[8px] text-[#0B5394]/40 group-hover:text-[#0B5394] flex-shrink-0" />
                                        )}
                                        <span className="truncate">{tab?.TabName}</span>
                                      </button>

                                      {/* Favorite Star */}
                                      <button
                                        type="button"
                                        title={
                                          isFavorite ? "Remove from favorites" : "Add to favorites"
                                        }
                                        className="flex items-center justify-center w-8 h-8 mr-1 rounded-md hover:bg-white transition"
                                        onClick={() => toggleFavoriteTab(Number(tab?.TabId))}
                                      >
                                        <i
                                          className={`fa-star text-sm transition-all duration-200 ${
                                            isFavorite
                                              ? "fa-solid text-amber-500 scale-110"
                                              : "fa-regular text-slate-300 hover:text-amber-500 hover:scale-110"
                                          }`}
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

              {/* active tab sections */}
              <div className="flex-1 overflow-y-auto mt-2 pr-0.5 hide-scrollbar">
                <div className="w-full bg-white border border-slate-200/70 rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-4 min-h-100 ">
                  {activeTab ? (
                    <RoutingUsingTabUrl
                      tabViewUrl={activeTab.TabViewURL}
                      patient={selectedPatient}
                    />
                  ) : (
                    <div className="py-16 text-center text-slate-400 font-medium">
                      No active tab selected
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default IpdBilling;
