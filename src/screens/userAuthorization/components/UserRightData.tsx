import { showError, showSuccess } from "@/utils/alert";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import CustomLoader from "../../../components/customLoader";
import ToggleButton from "../../../components/toggleButton";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { PageAccessProps, UserRightsItem } from "../types";

const UserRightData = ({ branchId, typeId, userId, roleId }: PageAccessProps) => {
  const { loading, error, fetchApi } = useGlobalApi();
  const [filteredData, setFilteredData] = useState<UserRightsItem[]>([]);
  const [userRightsData, setUserRightsData] = useState<UserRightsItem[]>([]);
  const [activeButton, setActiveButton] = useState<string>("");

  const fetchUserRightData = useCallback(
    async (selectedRoleId: number) => {
      setActiveButton("all");

      const response = await fetchApi(
        "GET",
        ENDPOINTS.GET_ASSIGN_USER_RIGHT_MAPPING,
        {},
        { params: { branchId, typeId, userId, roleId: selectedRoleId } }
      );
      setUserRightsData(response?.data ?? []);
      setFilteredData(response?.data ?? []);
    },
    [branchId, typeId, userId, roleId]
  );

  useEffect(() => {
    fetchUserRightData((roleId = roleId || 0));
  }, [roleId]);

  //search handler
  const onSearchHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const filteredRole = userRightsData?.filter((u: UserRightsItem) =>
      u?.userRightName?.toLowerCase()?.includes(value?.toLowerCase())
    );
    setFilteredData(filteredRole);
  };

  //toggle single handler
  const toggleSingleHandler = (id: number) => {
    setUserRightsData(prev =>
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
      userRightsData.length > 0 && userRightsData.every(item => item.isGranted === 1);

    const updated = userRightsData.map(item => ({
      ...item,
      isGranted: allGranted ? 0 : 1,
    }));

    setUserRightsData(updated);
    setFilteredData(updated);
  };

  //All handler
  const filterAllHandler = () => {
    setActiveButton("all");
    setFilteredData(userRightsData || []);
  };

  // remaining handler
  const remainingHandler = () => {
    setActiveButton("remaining");
    const remaining = userRightsData?.filter((r: UserRightsItem) => r?.isGranted === 0) || [];
    setFilteredData(remaining);
  };

  // granted
  const grantedHandler = () => {
    setActiveButton("granted");
    const granted = userRightsData.filter(item => item.isGranted === 1) || [];
    setFilteredData(granted);
  };

  //submit handler
  const saveUserRightsHandler = async () => {
    if (!userRightsData || userRightsData?.length === 0) return;

    const grantedRights = userRightsData?.filter((u: UserRightsItem) => u.isGranted === 1);

    if (grantedRights.length === 0) return;

    const payload = {
      typeId,
      userId,
      branchId,
      roleId: roleId ?? 0,

      userRights: grantedRights.map((u: UserRightsItem) => ({
        typeId,
        userId,
        branchId,
        roleId: roleId ?? 0,
        userRightId: u.userRightId,
      })),
    };

    const resp = await fetchApi("POST", ENDPOINTS.SAVE_UPDATE_USER_RIGHT_MAPPING, payload);
    if (!resp?.result) {
      showError(error?.message);
      return;
    }
    showSuccess(resp?.message);
  };

  return (
    <div className="card ">
      {/* Header buttons */}
      <div className="flex justify-between flex-wrap -mt-3 ">
        <div className="flex ">
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

        <button className="table-header-button save-btn" onClick={saveUserRightsHandler}>
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
                  <span className="table-title">User Rights</span>

                  <input
                    className="table-search-input input-field"
                    placeholder="search user rights"
                    onChange={onSearchHandler}
                  />
                </div>
              </th>

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
              filteredData.map((item: UserRightsItem, idx) => (
                <tr
                  key={item?.userRightId}
                  className="table-row"
                  onClick={() => toggleSingleHandler(item?.userRightId)}
                >
                  <td className="table-cell">{idx + 1}</td>

                  <td className="table-cell">
                    <div className="table-name-content">
                      <span
                        className={`status-badge ${
                          item?.isGranted === 1 ? "status-success" : "status-inactive"
                        }`}
                      >
                        <span className="table-text-truncate">{item?.userRightName}</span>
                      </span>

                      <i
                        className="fa-solid fa-info table-info-icon"
                        title={item?.description}
                        onClick={e => e.stopPropagation()}
                      />
                    </div>
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

export default React.memo(UserRightData);
