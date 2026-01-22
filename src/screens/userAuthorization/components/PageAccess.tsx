import React, { ChangeEvent, useEffect, useState } from "react";
import CustomLoader from "../../../components/customLoader";
import ToggleButton from "../../../components/toggleButton";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { chunkArray } from "../../../utils/chunkApiData";
import { PageAccessItem, PageAccessProps } from "../types";

const PageAccess = ({ branchId, typeId, userId, roleId }: PageAccessProps) => {
  const { loading, error, fetchApi } = useGlobalApi();

  const [filteredData, setFilteredData] = useState<PageAccessItem[]>([]);
  const [pageAccessData, setPageAccessData] = useState<PageAccessItem[]>([]);

  /* ---------------- fetch page access ---------------- */

  const pageAccessTableData = async (rid: number) => {
    if (!branchId || !typeId || !userId || !rid) return;

    const response = await fetchApi(
      "GET",
      ENDPOINTS.GET_USER_WISE_MENU_MASTER,
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
    setPageAccessData(response?.data ?? []);
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
    const filteredRole = pageAccessData?.filter((u: PageAccessItem) =>
      u?.subMenuName?.toLowerCase()?.includes(value?.toLowerCase())
    );
    setFilteredData(filteredRole);
  };

  //toggle single handler
  const toggleSingleHandler = (id: number) => {
    setPageAccessData(prev =>
      prev.map(item =>
        item?.subMenuId === id ? { ...item, isGranted: item.isGranted === 1 ? 0 : 1 } : item
      )
    );

    setFilteredData(prev =>
      prev.map(item =>
        item?.subMenuId === id ? { ...item, isGranted: item.isGranted === 1 ? 0 : 1 } : item
      )
    );
  };

  //toggle all handler
  const toggleAllHandler = () => {
    const allGranted =
      pageAccessData?.length > 0 && pageAccessData?.every(item => item.isGranted === 1);

    const updated = pageAccessData?.map(item => ({
      ...item,
      isGranted: allGranted ? 0 : 1,
    }));

    setPageAccessData(updated);
    setFilteredData(updated);
  };

  //All handler
  const filterAllHandler = () => {
    setFilteredData(pageAccessData || []);
  };

  // remaining handler
  const remainingHandler = () => {
    const remaining = pageAccessData?.filter((r: PageAccessItem) => r?.isGranted === 0) || [];
    setFilteredData(remaining);
  };

  // granted
  const grantedHandler = () => {
    const granted = pageAccessData.filter(item => item.isGranted === 1) || [];
    setFilteredData(granted);
  };

  //submit handler
  const savePageAccessHandler = async () => {
    if (!pageAccessData || pageAccessData.length === 0) return;

    const grantedMenus = pageAccessData.filter((u: PageAccessItem) => u.isGranted === 1);

    const userMenus = grantedMenus.map((u: PageAccessItem) => ({
      typeId,
      userId,
      branchId,
      roleId,
      subMenuId: u.subMenuId,
    }));

    const chunks = userMenus.length > 0 ? chunkArray(userMenus, 50) : [[]];

    for (let i = 0; i < chunks.length; i++) {
      const payload = {
        typeId,
        userId,
        branchId,
        roleId,
        isFirst: i === 0 ? 1 : 0,
        userMenus: chunks[i],
      };

      await fetchApi("POST", ENDPOINTS.SAVE_UPDATE_USER_MENU_MASTER, payload);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md mt-2 p-2">
      {/* HEADER BUTTONS */}
      <div className="flex justify-between flex-wrap gap-3 mb-2">
        <div className="flex gap-1">
          <button className="table-header-button" onClick={filterAllHandler}>
            All
          </button>
          <button className="table-header-button" onClick={remainingHandler}>
            Remaining
          </button>
          <button className="table-header-button" onClick={grantedHandler}>
            Granted
          </button>
        </div>

        <button
          className="table-header-button text-white bg-[#0b5394]"
          onClick={savePageAccessHandler}
        >
          Save
        </button>
      </div>

      {/* TABLE */}
      <div className="border border-gray-300 overflow-y-auto rounded-lg min-h-[300px] max-h-[400px]">
        <table className="min-w-full table-fixed border-collapse">
          {/* HEADER */}
          <thead className="bg-blue-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 w-16 text-left font-semibold text-gray-700">#</th>

              <th className="px-4 py-3 text-left font-semibold text-gray-700">Page Name</th>

              <th className="px-4 py-3 text-left font-semibold text-gray-700">Navigation Name</th>

              {/* SEARCH */}
              <th className="px-10 py-3 w-80 text-right">
                <input
                  onChange={onSearchHandler}
                  placeholder="Search..."
                  className="input-field h-9 text-sm"
                />
              </th>

              {/* TOGGLE ALL */}
              <th className="px-4 py-3 w-32 text-center font-semibold text-gray-700">
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
                <tr key={item.subMenuId} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{idx + 1}</td>

                  <td className="px-4 py-3 text-gray-800 truncate" title={item?.subMenuName}>
                    {item?.subMenuName}
                  </td>

                  <td className="px-4 py-3 text-gray-800 truncate" title={item?.tabName}>
                    {item?.tabName}
                  </td>

                  <td className="px-4 py-3" />

                  <td className="px-4 py-3 text-center">
                    <ToggleButton
                      checked={item.isGranted === 1}
                      onClick={() => toggleSingleHandler(item?.subMenuId)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500 italic">
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

export default React.memo(PageAccess);
