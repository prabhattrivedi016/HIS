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

    await fetchApi("POST", ENDPOINTS.SAVE_UPDATE_DASHBOARD_USER_RIGHT_MAPPING, payload);
  };

  return (
    <div className="card ">
      {/* Header buttons */}
      <div className="flex justify-between flex-wrap gap-3 -mt-3">
        <div className="flex gap-1">
          <button
            className={`table-header-button ${activeButton === "all" ? "bg-[#0b5394] text-white" : ""}`}
            onClick={filterAllHandler}
          >
            All
          </button>

          <button
            className={`table-header-button ${activeButton === "remaining" ? "bg-[#0b5394] text-white" : ""}`}
            onClick={remainingHandler}
          >
            Remaining
          </button>

          <button
            className={`table-header-button ${activeButton === "granted" ? "bg-[#0b5394] text-white" : ""}`}
            onClick={grantedHandler}
          >
            Granted
          </button>
        </div>

        <button
          className="table-header-button text-white bg-[#0b5394]"
          onClick={saveUserDashboardHandler}
        >
          Save
        </button>
      </div>

      {/* Table */}
      <div className="border border-gray-300 overflow-y-auto rounded-lg min-h-[300px] max-h-[400px]">
        <table className="min-w-full table-fixed border-collapse">
          {/* TABLE HEADER */}
          <thead className="bg-blue-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 w-16">#</th>

              {/* Role Name + small search */}
              <th className="px-5 py-2 font-semibold text-gray-700">
                <div className="flex items-center gap-3">
                  <span className="block whitespace-nowrap overflow-hidden text-ellipsis ">
                    User Dashboard
                  </span>
                  <input
                    className="input-field h-10 max-w-[250px] text-sm ml-20 "
                    placeholder="search user dashboard"
                    onChange={onSearchHandler}
                  />
                </div>
              </th>

              {/* Toggle All */}
              <th className="px-4 py-3 text-center font-semibold text-gray-700 w-32">
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
              filteredData?.map((item: UserDashboardItem, idx) => (
                <tr
                  key={item?.userRightId}
                  className={`border-t border-gray-200 hover:bg-gray-50 cursor-pointer 
                    
                  }`}
                  onClick={() => toggleSingleHandler(item?.userRightId)}
                >
                  <td className="px-4 py-3 text-gray-600">{idx + 1}</td>

                  <td className="px-4 py-3 text-gray-800">{item?.userRightName}</td>

                  <td className="px-4 py-3 text-center">
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
                <td colSpan={3} className="px-4 py-6 text-center text-gray-500 italic">
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
