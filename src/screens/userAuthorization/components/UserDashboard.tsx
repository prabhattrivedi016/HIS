import { showError, showSuccess } from "@/utils/alert";
import React, { ChangeEvent, useEffect, useState } from "react";
import CustomLoader from "../../../components/customLoader";
import ToggleButton from "../../../components/toggleButton";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { PageAccessProps, UserDashboardItem } from "../types";

const UserDashboard = ({ branchId, typeId, userId, roleId }: PageAccessProps) => {
  const { loading, error, fetchApi } = useGlobalApi();
  const [filteredData, setFilteredData] = useState<UserDashboardItem[]>([]);
  const [userDashboard, setUserDashboard] = useState<UserDashboardItem[]>([]);
  const [activeButton, setActiveButton] = useState<string>("");

  //user dashboard table data
  const userDashboardTableData = async (id: number) => {
    setActiveButton("all");
    const response = await fetchApi(
      "GET",
      ENDPOINTS.GET_ASSIGN_DASHBOARD_USER_RIGHT,
      {},
      { params: { branchId, typeId, userId, roleId: id } }
    );
    setUserDashboard(response?.data ?? []);
    setFilteredData(response?.data ?? []);
  };

  useEffect(() => {
    userDashboardTableData((roleId = roleId || 0));
  }, [roleId]);

  //search handler
  const onSearchHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const filteredRole = userDashboard?.filter((u: UserDashboardItem) =>
      u?.userRightName?.toLowerCase()?.includes(value?.toLowerCase())
    );
    setFilteredData(filteredRole);
  };

  //toggle single handler
  const toggleSingleHandler = (id: number) => {
    setUserDashboard(prev =>
      prev.map(item =>
        item?.userRightId === id ? { ...item, isGranted: item.isGranted === 1 ? 0 : 1 } : item
      )
    );

    setFilteredData(prev =>
      prev.map(item =>
        item?.userRightId === id ? { ...item, isGranted: item.isGranted === 1 ? 0 : 1 } : item
      )
    );
  };

  //toggle all handler
  const toggleAllHandler = () => {
    const allGranted =
      userDashboard.length > 0 && userDashboard.every(item => item.isGranted === 1);

    const updated = userDashboard.map(item => ({
      ...item,
      isGranted: allGranted ? 0 : 1,
    }));

    setUserDashboard(updated);
    setFilteredData(updated);
  };

  //All handler
  const filterAllHandler = () => {
    setActiveButton("all");
    setFilteredData(userDashboard || []);
  };

  // remaining handler
  const remainingHandler = () => {
    setActiveButton("remaining");
    const remaining = userDashboard?.filter((r: UserDashboardItem) => r?.isGranted === 0) || [];
    setFilteredData(remaining);
  };

  // granted
  const grantedHandler = () => {
    setActiveButton("granted");
    const granted = userDashboard.filter(item => item.isGranted === 1) || [];
    setFilteredData(granted);
  };
  //submit handler
  const saveUserDashboardHandler = async () => {
    if (!userDashboard || userDashboard.length === 0) return;

    const grantedDashboards = userDashboard.filter((u: UserDashboardItem) => u.isGranted === 1);

    if (grantedDashboards.length === 0) return;

    const payload = {
      typeId,
      userId,
      branchId,
      roleId: roleId || 0,

      dashboardUserRights: grantedDashboards.map((u: UserDashboardItem) => ({
        typeId,
        userId,
        branchId,
        roleId: roleId || 0,
        userRightId: u.userRightId,
      })),
    };

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.SAVE_UPDATE_DASHBOARD_USER_RIGHT_MAPPING,
      payload
    );
    if (!resp?.result) {
      showError(error?.message);
      return;
    }
    showSuccess(resp?.message);
  };

  return (
    <div className="card ">
      {/* Header buttons */}
      <div className="flex justify-between flex-wrap gap-3 -mt-3">
        <div className="flex gap-1">
          <button
            className={`table-header-button ${activeButton === "all" ? "save-btn" : "cursor-pointer"}`}
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

        <button className="table-header-button save-btn" onClick={saveUserDashboardHandler}>
          Save
        </button>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="data-table">
          {/* TABLE HEADER */}
          <thead className="table-header">
            <tr>
              <th className="table-index-header">#</th>

              <th className="table-name-header">
                <div className="table-header-content">
                  <span className="table-title">User Dashboard</span>

                  <input
                    className="table-search-input input-field"
                    placeholder="search user dashboard"
                    onChange={onSearchHandler}
                  />
                </div>
              </th>

              {/* Toggle All */}
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

          {/* TABLE BODY */}
          <tbody>
            {!!filteredData && filteredData.length > 0 ? (
              filteredData.map((item: UserDashboardItem, idx) => (
                <tr
                  key={item?.userRightId}
                  className="table-row"
                  onClick={() => toggleSingleHandler(item?.userRightId)}
                >
                  <td className="table-cell">{idx + 1}</td>

                  <td className="table-cell">
                    <span
                      className={`status-badge ${
                        item?.isGranted === 1 ? "status-success" : "status-inactive"
                      }`}
                    >
                      {item?.userRightName}
                    </span>
                  </td>

                  <td className="table-action-cell">
                    <div onClick={e => e.stopPropagation()}>
                      <ToggleButton
                        checked={item.isGranted === 1}
                        onClick={() => toggleSingleHandler(item?.userRightId)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="table-empty">
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

export default React.memo(UserDashboard);
