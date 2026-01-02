import React, { ChangeEvent, useState } from "react";
import InputField from "../../../components/customInputField";
import CustomLoader from "../../../components/customLoader";
import ToggleButton from "../../../components/toggleButton";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { chunkArray } from "../../../utils/chunkApiData";
import {
  BedMappingItem,
  CorporateMappingItem,
  PageAccessItem,
  RoleDataItem,
  TableData,
  TableProps,
  UserDashboardItem,
  UserRightsItem,
} from "../types";

const Table = ({
  tableData,
  filteredData,
  onChangeFilter,
  onChangeMessage,
  selectedButton,
}: TableProps) => {
  const { loading, error, fetchApi } = useGlobalApi();
  const [selectedBtn, setSelectedBtn] = useState<string>("");

  const tableName =
    tableData?.type === "roleName"
      ? "Role Name"
      : tableData?.type === "userRightName"
      ? "User Right Name"
      : tableData?.type === "userDashboard"
      ? "Dashboard Name"
      : tableData?.type === "pageAccess"
      ? "Page Name"
      : tableData?.type === "corporateMapping"
      ? "Corporate Name"
      : tableData?.type === "bedMapping"
      ? "Room Name"
      : "Table Name";

  //  filter handler
  const allFilterHandler = () => {
    if (!tableData?.data) return onChangeFilter([]);

    onChangeFilter(tableData.data);
  };

  const remainingFilterHandler = () => {
    if (!tableData?.data) return onChangeFilter([]);
    const remainingFiltered = tableData.data.filter(u => u.isGranted === 0);
    onChangeFilter(remainingFiltered as any);
  };

  const grantedFilterHandler = () => {
    if (!tableData?.data) return onChangeFilter([]);
    const grantedFiltered = tableData.data.filter(u => u.isGranted === 1);
    onChangeFilter(grantedFiltered as any);
  };

  // search handler
  const onSearchHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim().toLowerCase();

    if (!tableData?.data) return onChangeFilter([]);

    switch (tableData.type) {
      case "roleName":
        return onChangeFilter(
          tableData.data.filter((item: RoleDataItem) =>
            item.roleName?.toLowerCase()?.includes(value)
          )
        );

      case "userRightName": {
        return onChangeFilter(
          tableData?.data?.filter((item: UserRightsItem) =>
            item?.userRightName?.toLowerCase()?.includes(value)
          )
        );
      }
      case "userDashboard": {
        return onChangeFilter(
          tableData?.data?.filter((item: UserDashboardItem) =>
            item?.userRightName?.toLowerCase()?.includes(value)
          )
        );
      }
      case "pageAccess": {
        return onChangeFilter(
          tableData.data.filter((item: PageAccessItem) =>
            item.subMenuName?.toLowerCase()?.includes(value)
          )
        );
      }
      case "corporateMapping": {
        return onChangeFilter(
          tableData.data.filter((item: CorporateMappingItem) =>
            item.corporateName?.toLowerCase()?.includes(value)
          )
        );
      }
      case "bedMapping": {
        return onChangeFilter(
          tableData.data.filter((item: BedMappingItem) => item.name?.toLowerCase()?.includes(value))
        );
      }

      default:
        return onChangeFilter(tableData?.data);
    }
  };

  const toggleAllHandler = () => {
    if (!filteredData?.length) return;

    const shouldGrantAll = filteredData.some(item => item.isGranted === 0);

    const updatedFiltered = filteredData.map(item => ({
      ...item,
      isGranted: shouldGrantAll ? 1 : 0,
    }));

    // Update UI list
    onChangeFilter(updatedFiltered as any);

    // Update full table data consistently
    tableData.data = tableData?.data?.map(item => {
      const key = item?.roleId || item?.userRightId || item?.subMenuId || item?.serviceItemId;
      const match = updatedFiltered?.find(
        f => (f?.roleId || f.userRightId || f?.subMenuId || f?.serviceItemId) === key
      );
      return match || item;
    });
  };

  // single toggle button handler
  const toggleSingleHandler = index => {
    const updated = filteredData.map((item, idx) =>
      idx === index ? { ...item, isGranted: item.isGranted === 1 ? 0 : 1 } : item
    );

    // update filtered data
    onChangeFilter(updated as any);

    // update main tableData
    tableData.data = tableData.data.map((item, idx) =>
      idx === index ? { ...item, isGranted: updated[idx].isGranted } : item
    );
  };

  // on save handler
  const onSaveHandler = async (tableData: TableData) => {
    switch (tableData?.type) {
      case "roleName": {
        const payload = {
          branchId: tableData?.branchId,
          typeId: tableData?.typeId,
          userId: tableData?.userId,
          userRoleMappings: tableData?.data
            ?.filter((u: RoleDataItem) => u.isGranted === 1)
            ?.map((u: RoleDataItem) => ({
              branchId: tableData?.branchId,
              typeId: tableData?.typeId,
              userId: tableData?.userId,
              roleId: u.roleId,
            })),
        };
        setSelectedBtn("all");
        const response = await fetchApi("POST", ENDPOINTS.SAVE_UPDATE_ROLE_MAPPING, payload);
        if (!response) return;
        onChangeMessage(response?.message);
        return;
      }

      case "userRightName": {
        const payload = {
          branchId: tableData?.branchId,
          typeId: tableData?.typeId,
          userId: tableData?.userId,
          roleId: tableData?.roleId,
          userRights: tableData?.data
            ?.filter((u: UserRightsItem) => u.isGranted === 1)
            ?.map((u: UserRightsItem) => ({
              branchId: tableData?.branchId,
              typeId: tableData?.typeId,
              userId: tableData?.userId,
              roleId: tableData?.roleId,
              userRightId: u?.userRightId,
            })),
        };

        const response = await fetchApi("POST", ENDPOINTS.SAVE_UPDATE_USER_RIGHT_MAPPING, payload);
        if (!response) return;
        onChangeMessage(response?.message);
        return;
      }
      case "userDashboard": {
        const payload = {
          branchId: tableData?.branchId,
          typeId: tableData?.typeId,
          userId: tableData?.userId,
          roleId: tableData?.roleId,
          dashboardUserRights: tableData?.data
            ?.filter((u: UserDashboardItem) => u.isGranted === 1)
            ?.map((u: UserDashboardItem) => ({
              branchId: tableData?.branchId,
              typeId: tableData?.typeId,
              userId: tableData?.userId,
              roleId: tableData?.roleId,
              userRightId: u?.userRightId,
            })),
        };

        const response = await fetchApi(
          "POST",
          ENDPOINTS.SAVE_UPDATE_DASHBOARD_USER_RIGHT_MAPPING,
          payload
        );
        if (!response) return;
        onChangeMessage(response?.message);

        return;
      }

      case "pageAccess": {
        //  Filter granted menus
        const menus = tableData?.data
          ?.filter((u: PageAccessItem) => u.isGranted === 1)
          ?.map((u: PageAccessItem) => ({
            branchId: tableData?.branchId,
            typeId: tableData?.typeId,
            userId: tableData?.userId,
            roleId: tableData?.roleId,
            subMenuId: u?.subMenuId,
          }));

        const chunks = chunkArray(menus, 50);

        //  Send chunked payloads
        for (let i = 0; i < chunks.length; i++) {
          const payload = {
            branchId: tableData?.branchId,
            typeId: tableData?.typeId,
            userId: tableData?.userId,
            roleId: tableData?.roleId,
            isFirst: i === 0 ? 1 : 0,
            userMenus: chunks[i],
          };

          const response = await fetchApi("POST", ENDPOINTS.SAVE_UPDATE_USER_MENU_MASTER, payload);
          if (!response) return;
          onChangeMessage(response?.message);
        }
        return;
      }
      case "corporateMapping": {
        const corporate = tableData?.data
          ?.filter((u: CorporateMappingItem) => u.isGranted === 1)
          ?.map((u: CorporateMappingItem) => ({
            branchId: tableData?.branchId,
            typeId: Number(tableData?.typeId),
            userId: tableData?.userId,
            corporateId: u?.corporateId,
          }));

        const chunks = chunkArray(corporate, 50);
        //send chunk payload
        for (let i = 0; i < chunks.length; i++) {
          const payload = {
            branchId: tableData?.branchId,
            typeId: tableData?.typeId,
            userId: tableData?.userId,
            isFirst: i === 0 ? 1 : 0,
            userCorporates: chunks[i],
          };

          const response = await fetchApi(
            "POST",
            ENDPOINTS.SAVE_UPDATE_USER_CORPORATE_MAPPING,
            payload
          );
          if (!response) return;
          onChangeMessage(response?.message);
        }

        return;
      }
      case "bedMapping": {
        const beds = tableData?.data
          ?.filter((u: BedMappingItem) => u.isGranted === 1)
          ?.map((u: BedMappingItem) => ({
            branchId: tableData?.branchId,
            typeId: tableData?.typeId,
            userId: tableData?.userId,
            serviceItemId: u?.serviceItemId,
          }));

        const chunks = chunkArray(beds, 50);
        // send chunk payload
        for (let i = 0; i < chunks.length; i++) {
          const payload = {
            branchId: tableData?.branchId,
            typeId: tableData?.typeId,
            userId: tableData?.userId,
            isFirst: i === 0 ? 1 : 0,
            userBeds: chunks[i],
          };
          const response = await fetchApi("POST", ENDPOINTS.SAVE_UPDATE_USER_BED_MAPPING, payload);
          if (!response) return;
          onChangeMessage(response?.message);
        }
        return;
      }

      default:
        return;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md mt-2 p-2">
      <div className="flex justify-between flex-wrap gap-3 mb-2">
        <div className="flex gap-1">
          <button className="table-header-button" onClick={allFilterHandler}>
            All
          </button>
          <button className="table-header-button" onClick={remainingFilterHandler}>
            Remaining
          </button>
          <button className="table-header-button" onClick={grantedFilterHandler}>
            Granted
          </button>
        </div>

        <button
          className="table-header-button text-white bg-[#0b5394]"
          onClick={() => onSaveHandler(tableData)}
        >
          Save
        </button>
      </div>

      <div className="border border-gray-300 overflow-y-auto rounded-lg min-h-[300px] max-h-[400px]">
        <table className="min-w-full table-fixed">
          <thead className="bg-blue-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-700">
                <div className="flex items-center gap-4">
                  <div className="w-10 text-center font-semibold">#</div>

                  <div className="flex-1 flex items-center justify-between gap-3">
                    {selectedButton === "pageAccess" ? (
                      <>
                        {/* <span>{"Navigation Name"}</span> */}
                        <span className="font-semibold truncate"> {tableName}</span>
                      </>
                    ) : (
                      <span className="font-semibold truncate">{tableName}</span>
                    )}

                    <InputField>
                      <input
                        className="input-field w-40"
                        placeholder="Search..."
                        onChange={onSearchHandler}
                      />
                    </InputField>
                  </div>
                </div>
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700 w-32">
                <div className="flex items-center justify-center gap-2">
                  <ToggleButton
                    checked={
                      filteredData.length > 0 && filteredData.every(item => item.isGranted === 1)
                    }
                    disabled={filteredData.length === 0}
                    onClick={() => toggleAllHandler(filteredData)}
                  />
                  <span>All</span>
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredData && filteredData.length > 0 ? (
              filteredData.map((item, idx) => {
                const name =
                  item?.roleName ||
                  item?.userRightName ||
                  item?.subMenuName ||
                  item?.corporateName ||
                  item?.name;

                return (
                  <tr key={idx} className="hover:bg-gray-100">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-4">
                        <div className="w-10 text-center text-gray-600">{idx + 1}</div>

                        <div className=" flex items-center justify-center gap-3">
                          {selectedButton === "pageAccess" ? (
                            <div className="flex items-center w-full">
                              {/* <h1 className="text-md  truncate">{item?.tabName}</h1> */}
                              <span className="text-md  truncate text-right">{name}</span>
                            </div>
                          ) : (
                            <span className="truncate">{name}</span>
                          )}

                          {selectedButton === "userRight" && (
                            <i
                              className="fa-solid fa-info text-gray-400 hover:text-gray-600"
                              title={item?.description}
                            />
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <ToggleButton
                          checked={item.isGranted === 1}
                          disabled={false}
                          onClick={() => toggleSingleHandler(idx)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={2} className="text-gray-500 text-center p-4">
                  No data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default React.memo(Table);
