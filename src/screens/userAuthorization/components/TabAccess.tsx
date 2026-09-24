import { useAuthorizedPages } from "@/store/useAuthorizedPages";
import { showSuccess, showWarning } from "@/utils/alert";
import React, { ChangeEvent, useEffect, useState } from "react";
import CustomLoader from "../../../components/customLoader";
import ToggleButton from "../../../components/toggleButton";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { chunkArray } from "../../../utils/chunkApiData";
import { PageAccessProps, TabAccessItem } from "../types";

const TabAccess = ({ branchId, typeId, userId, roleId }: PageAccessProps) => {
  const { loading, error, fetchApi } = useGlobalApi();
  const { refetchAuthorizedPages } = useAuthorizedPages();

  const [filteredData, setFilteredData] = useState<TabAccessItem[]>([]);
  const [tabAccessData, setAccessData] = useState<TabAccessItem[]>([]);
  const [activeButton, setActiveButton] = useState<string>("");

  /* ---------------- fetch page access ---------------- */

  const pageAccessTableData = async (rid: number) => {
    if (!branchId || !typeId || !userId || !rid) return;
    setActiveButton("all");

    const response = await fetchApi(
      "GET",
      ENDPOINTS.GET_USER_GRANTED_REMAINING_TAB_MASTER,
      {},
      {
        params: {
          branchId,
          typeId,
          userId,
          roleId: rid,
        },
      }
    );
    setAccessData(response?.data ?? []);
    setFilteredData(response?.data ?? []);
  };

  useEffect(() => {
    if (!roleId) return;
    pageAccessTableData(roleId);
  }, [roleId]);

  /* ---------------- SEARCH FILTER ---------------- */

  //search handler
  const onSearchHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const filteredRole = tabAccessData?.filter((u: TabAccessItem) =>
      u?.TabName?.toLowerCase()?.includes(value?.toLowerCase())
    );
    setFilteredData(filteredRole);
  };

  //toggle single handler
  const toggleSingleHandler = (id: number) => {
    setAccessData(prev =>
      prev.map(item =>
        item?.TabId === id ? { ...item, isGranted: item.isGranted === 1 ? 0 : 1 } : item
      )
    );

    setFilteredData(prev =>
      prev.map(item =>
        item?.TabId === id ? { ...item, isGranted: item.isGranted === 1 ? 0 : 1 } : item
      )
    );
  };

  //toggle all handler
  const toggleAllHandler = () => {
    const allGranted =
      tabAccessData?.length > 0 && tabAccessData?.every(item => item.isGranted === 1);

    const updated = tabAccessData?.map(item => ({
      ...item,
      isGranted: allGranted ? 0 : 1,
    }));

    setAccessData(updated);
    setFilteredData(updated);
  };

  //All handler
  const filterAllHandler = () => {
    setActiveButton("all");

    setFilteredData(tabAccessData ?? []);
  };

  // remaining handler
  const remainingHandler = () => {
    setActiveButton("remaining");

    const remaining = tabAccessData?.filter((r: TabAccessItem) => r?.isGranted === 0) ?? [];
    setFilteredData(remaining);
  };

  // granted
  const grantedHandler = () => {
    setActiveButton("granted");

    const granted = tabAccessData.filter(item => item.isGranted === 1) ?? [];
    setFilteredData(granted);
  };

  //submit handler
  const saveTabAccessHandler = async () => {
    if (!tabAccessData || tabAccessData.length === 0) return;

    const grantedMenus = tabAccessData.filter((u: TabAccessItem) => u.isGranted === 1);

    const userMenus = grantedMenus.map((u: TabAccessItem) => ({
      typeId,
      userId,
      branchId,
      roleId,
      TabId: u.TabId,
    }));

    const chunks = userMenus.length > 0 ? chunkArray(userMenus, 50) : [[]];

    for (let i = 0; i < chunks.length; i++) {
      const payload = {
        typeId,
        userId,
        branchId,
        roleId,
        tabMappings: userMenus.map(item => ({
          tabId: item.TabId,
        })),
      };

      const resp = await fetchApi("POST", ENDPOINTS.SAVE_UPDATE_USER_IPD_TAB_MAPPING, payload);
      if (!resp?.result) {
        showWarning(resp?.message ?? "Failed to update tab access");
        return;
      }
      showSuccess(resp?.message ?? "Tab access updated successfully");
      refetchAuthorizedPages(roleId!, branchId!, fetchApi);
    }
  };

  return (
    <div className="card">
      {/* HEADER BUTTONS */}
      <div className="flex justify-between flex-wrap gap-3 -mt-3">
        <div className="flex ">
          <button
            className={`table-header-button ${activeButton === "all" ? "save-btn " : "cursor-pointer"}`}
            onClick={filterAllHandler}
          >
            All
          </button>

          <button
            className={`table-header-button ${activeButton === "remaining" ? "save-btn" : "cursor-pointer"}`}
            onClick={remainingHandler}
          >
            Remaining
          </button>

          <button
            className={`table-header-button ${activeButton === "granted" ? "save-btn" : "cursor-pointer"}`}
            onClick={grantedHandler}
          >
            Granted
          </button>
        </div>

        <button className="table-header-button save-btn" onClick={saveTabAccessHandler}>
          Save
        </button>
      </div>

      {/* table */}
      <div className="table-wrapper">
        <table className="data-table">
          {/* HEADER */}
          <thead className="table-header">
            <tr>
              <th className="table-index-header">#</th>

              <th className="table-name-header">Tab Type</th>

              <th className="table-name-header">Tab Name</th>

              {/* SEARCH */}
              <th className="table-search-header">
                <input
                  onChange={onSearchHandler}
                  placeholder="Search tab name"
                  className="table-search-input input-field mt-2"
                />
              </th>

              {/* TOGGLE ALL */}
              <th className="table-action-header">
                <ToggleButton
                  disabled={filteredData?.length === 0}
                  checked={
                    filteredData?.length > 0 && filteredData?.every(item => item?.isGranted === 1)
                  }
                  onClick={toggleAllHandler}
                />
              </th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {!!filteredData && filteredData.length > 0 ? (
              filteredData.map((item, idx) => (
                <tr
                  key={item.TabId}
                  className="table-row"
                  onClick={() => toggleSingleHandler(item?.TabId)}
                >
                  <td className="table-cell">{idx + 1}</td>

                  <td className="table-cell table-text-truncate">{item?.TabType}</td>

                  <td className="table-cell">
                    <span
                      className={`status-badge ${
                        item?.isGranted === 1 ? "status-success" : "status-inactive"
                      }`}
                    >
                      {item?.TabName}
                    </span>
                  </td>

                  {/* Empty search column */}
                  <td className="table-cell" />

                  <td className="table-action-cell">
                    <div onClick={e => e.stopPropagation()}>
                      <ToggleButton
                        checked={item.isGranted === 1}
                        onClick={() => toggleSingleHandler(item?.TabId)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="table-empty">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!!loading ? <CustomLoader isLoading={loading} /> : <></>}
    </div>
  );
};

export default React.memo(TabAccess);
