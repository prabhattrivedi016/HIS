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

    await fetchApi("POST", ENDPOINTS.SAVE_UPDATE_USER_RIGHT_MAPPING, payload);
  };

  return (
    <div className="card ">
      {/* Header buttons */}
      <div className="flex justify-between flex-wrap -mt-3 ">
        <div className="flex ">
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
          onClick={saveUserRightsHandler}
        >
          Save
        </button>
      </div>

      {/* Table */}
      <div className="border border-gray-300 overflow-y-auto rounded-lg min-h-[300px] max-h-[400px] ">
        <table className="min-w-full table-fixed border-collapse">
          {/* TABLE HEADER */}
          <thead className="bg-blue-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 w-16">#</th>

              {/* Role Name + small search */}
              <th className="px-5 py-2 font-semibold text-gray-700">
                <div className="flex items-center gap-3">
                  <span className="block whitespace-nowrap overflow-hidden text-ellipsis ">
                    User Rights
                  </span>
                  <input
                    className="input-field h-10 max-w-[250px] text-sm ml-20 "
                    placeholder="search user rights"
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
              filteredData?.map((item: UserRightsItem, idx) => (
                <tr
                  key={item?.userRightId}
                  className={`border-t border-gray-200 hover:bg-gray-50 cursor-pointer `}
                  onClick={() => toggleSingleHandler(item?.userRightId)}
                >
                  <td className="px-4 py-3 text-gray-600">{idx + 1}</td>

                  <td className="px-4 py-3 text-gray-800 flex items-center gap-2">
                    <span className="truncate">{item?.userRightName}</span>

                    <i
                      className="fa-solid fa-info text-sm text-gray-500"
                      title={item?.description}
                      onClick={e => e.stopPropagation()}
                    />
                  </td>

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

export default React.memo(UserRightData);
