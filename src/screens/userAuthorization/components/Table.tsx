import React, { ChangeEvent, useMemo } from "react";
import InputField from "../../../components/customInputField";
import CustomLoader from "../../../components/customLoader";
import ToggleButton from "../../../components/toggleButton";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { chunkArray } from "../../../utils/chunkApiData";
import {
  BedMappingItem,
  CorporateMappingItem,
  FilteredData,
  PageAccessItem,
  RoleDataItem,
  TableProps,
  UserDashboardItem,
  UserRightsItem,
} from "../types";

const Table = React.memo(
  ({
    tableData,
    filteredData,
    onChangeFilter,
    onChangeMessage,
    selectedButton,
    setTableData,
    onSubmitPage,
  }: // onRoleChange,
  TableProps) => {
    const { loading, fetchApi } = useGlobalApi();

    console.log("tableDatatableDatatableData", tableData);

    const tableName = useMemo(() => {
      return tableData?.type === "roleName"
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
    }, [tableData?.type]);

    const allFilterHandler = () => {
      onChangeFilter(tableData?.data ?? []);
    };

    const remainingFilterHandler = () => {
      onChangeFilter(tableData?.data?.filter((item: FilteredData) => item.isGranted === 0) || []);
    };

    const grantedFilterHandler = () => {
      onChangeFilter(tableData.data.filter((item: FilteredData) => item.isGranted === 1));
    };

    //search handler
    const onSearchHandler = (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.trim().toLowerCase();

      switch (tableData.type) {
        case "roleName":
          return onChangeFilter(
            tableData.data.filter((i: RoleDataItem) => i.roleName?.toLowerCase().includes(value))
          );

        case "userRightName":
          return onChangeFilter(
            tableData.data.filter((i: UserRightsItem) =>
              i.userRightName?.toLowerCase().includes(value)
            )
          );

        case "userDashboard":
          return onChangeFilter(
            tableData.data.filter((i: UserDashboardItem) =>
              i.userRightName?.toLowerCase().includes(value)
            )
          );

        case "pageAccess":
          return onChangeFilter(
            tableData.data.filter((i: PageAccessItem) =>
              i.subMenuName?.toLowerCase().includes(value)
            )
          );

        case "corporateMapping":
          return onChangeFilter(
            tableData.data.filter((i: CorporateMappingItem) =>
              i.corporateName?.toLowerCase().includes(value)
            )
          );

        case "bedMapping":
          return onChangeFilter(
            tableData.data.filter((i: BedMappingItem) => i.name?.toLowerCase().includes(value))
          );

        default:
          return onChangeFilter(tableData?.data);
      }
    };
    // get Item id
    const getItemId = (item: any): number => {
      switch (tableData.type) {
        case "roleName":
          return item.roleId;

        case "userRightName":
        case "userDashboard":
          return item.userRightId;

        case "pageAccess":
          return item.subMenuId;

        case "corporateMapping":
          return item.corporateId;

        case "bedMapping":
          return item.serviceItemId;

        default:
          throw new Error(`Unknown table type: ${tableData.type}`);
      }
    };

    //toggle all
    const toggleAllHandler = () => {
      if (!filteredData.length) return;

      const shouldGrant = filteredData.some(i => i.isGranted === 0);
      const ids = new Set(filteredData.map(getItemId));

      const updated = tableData.data.map(item =>
        ids.has(getItemId(item)) ? { ...item, isGranted: shouldGrant ? 1 : 0 } : item
      );

      setTableData(prev => (prev ? { ...prev, data: updated } : prev));

      onChangeFilter(updated);
    };

    // toggle single
    const toggleSingleHandler = (id: number) => {
      const updated = tableData.data.map(item =>
        getItemId(item) === id ? { ...item, isGranted: item.isGranted === 1 ? 0 : 1 } : item
      );

      setTableData(prev => (prev ? { ...prev, data: updated } : prev));

      onChangeFilter(updated);
    };

    // save handler
    const onSaveHandler = async () => {
      switch (tableData.type) {
        case "roleName": {
          const roles = tableData.data
            .filter((u: RoleDataItem) => u.isGranted === 1)
            .map(u => ({
              branchId: tableData.branchId,
              typeId: Number(tableData.typeId),
              userId: tableData.userId,
              roleId: u.roleId,
            }));

          await fetchApi("POST", ENDPOINTS.SAVE_UPDATE_ROLE_MAPPING, {
            branchId: tableData.branchId,
            typeId: Number(tableData.typeId),
            userId: tableData.userId,
            userRoleMappings: roles,
          });

          onChangeMessage("Saved successfully");
          return;
        }

        case "userRightName": {
          const rights = tableData?.data
            .filter((u: UserRightsItem) => u?.isGranted === 1)
            .map(u => ({
              branchId: tableData?.branchId,
              typeId: Number(tableData?.typeId),
              userId: tableData?.userId,
              roleId: tableData?.roleId,
              userRightId: u?.userRightId,
            }));

          await fetchApi("POST", ENDPOINTS.SAVE_UPDATE_USER_RIGHT_MAPPING, {
            branchId: tableData.branchId,
            typeId: Number(tableData.typeId),
            userId: tableData.userId,
            roleId: tableData.roleId,
            userRights: rights,
          });

          onChangeMessage("Saved successfully");
          return;
        }

        case "userDashboard": {
          const dashboards = tableData?.data
            .filter((u: UserDashboardItem) => u?.isGranted === 1)
            .map(u => ({
              branchId: tableData?.branchId,
              typeId: Number(tableData?.typeId),
              userId: tableData?.userId,
              roleId: tableData?.roleId,
              userRightId: u?.userRightId,
            }));

          await fetchApi("POST", ENDPOINTS.SAVE_UPDATE_DASHBOARD_USER_RIGHT_MAPPING, {
            branchId: tableData?.branchId,
            typeId: Number(tableData?.typeId),
            userId: tableData?.userId,
            roleId: tableData?.roleId,
            dashboardUserRights: dashboards,
          });

          onChangeMessage("Saved successfully");
          return;
        }

        case "pageAccess": {
          onSubmitPage(null);
          // onRoleChange(null);
          const menus = tableData?.data
            .filter((u: PageAccessItem) => u?.isGranted === 1)
            .map(u => ({
              branchId: tableData?.branchId,
              typeId: Number(tableData?.typeId),
              userId: tableData?.userId,
              roleId: tableData?.roleId,
              subMenuId: u?.subMenuId,
            }));

          const chunks = chunkArray(menus, 50);

          for (let i = 0; i < chunks.length; i++) {
            await fetchApi("POST", ENDPOINTS.SAVE_UPDATE_USER_MENU_MASTER, {
              branchId: tableData.branchId,
              typeId: Number(tableData.typeId),
              userId: tableData.userId,
              roleId: tableData.roleId,
              isFirst: i === 0 ? 1 : 0,
              userMenus: chunks[i],
            });
          }

          onChangeMessage("Saved successfully");
          return;
        }

        case "corporateMapping": {
          const corporates = tableData?.data
            .filter((u: CorporateMappingItem) => u?.isGranted === 1)
            .map(u => ({
              branchId: tableData?.branchId,
              typeId: Number(tableData?.typeId),
              userId: tableData?.userId,
              corporateId: u?.corporateId,
            }));

          const chunks = chunkArray(corporates, 50);

          for (let i = 0; i < chunks.length; i++) {
            await fetchApi("POST", ENDPOINTS.SAVE_UPDATE_USER_CORPORATE_MAPPING, {
              branchId: tableData.branchId,
              typeId: Number(tableData.typeId),
              userId: tableData.userId,
              isFirst: i === 0 ? 1 : 0,
              userCorporates: chunks[i],
            });
          }

          onChangeMessage("Saved successfully");
          return;
        }

        case "bedMapping": {
          const beds = tableData.data
            .filter((u: BedMappingItem) => u?.isGranted === 1)
            .map(u => ({
              branchId: tableData?.branchId,
              typeId: Number(tableData?.typeId),
              userId: tableData?.userId,
              serviceItemId: u?.serviceItemId,
            }));

          const chunks = chunkArray(beds, 50);

          for (let i = 0; i < chunks.length; i++) {
            await fetchApi("POST", ENDPOINTS.SAVE_UPDATE_USER_BED_MAPPING, {
              branchId: tableData?.branchId,
              typeId: Number(tableData?.typeId),
              userId: tableData?.userId,
              isFirst: i === 0 ? 1 : 0,
              userBeds: chunks[i],
            });
          }

          onChangeMessage("Saved successfully");
          return;
        }

        default:
          return;
      }
    };

    const renderCellContent = (item: any) => {
      switch (selectedButton) {
        case "userRight":
          return (
            <div className="flex items-center m-2 gap-2">
              <span className="truncate">{item.userRightName}</span>
              <i
                className="fa-solid fa-info text-gray-500 cursor-pointer"
                title={item?.description}
              />
            </div>
          );

        case "pageAccess":
          return (
            <div className="grid grid-cols-[40px_1fr_600px] gap-6 w-full">
              <span>{/* index handled outside */}</span>
              <span className="truncate ml-2">{item.subMenuName}</span>
              <span className="truncate text-gray-700">{item.tabName}</span>
            </div>
          );

        default:
          return (
            <span className="truncate mt-4 mx-2 items-center">
              {item.roleName ||
                item.userRightName ||
                item.subMenuName ||
                item.corporateName ||
                item.name}
            </span>
          );
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

          <button className="table-header-button text-white bg-[#0b5394]" onClick={onSaveHandler}>
            Save
          </button>
        </div>

        <div className="border border-gray-300 overflow-y-auto rounded-lg min-h-[300px] max-h-[400px]">
          <table className="min-w-full table-fixed">
            <thead className="bg-blue-50 sticky top-0 z-10">
              <tr>
                {/* <th className="px-4 py-3 font-semibold text-gray-700">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex gap-10">
                      <span>{"#"}</span>
                      <span className="truncate">{tableName}</span>
                    </div>
                    <InputField>
                      <input
                        className="input-field w-40"
                        placeholder="Search..."
                        onChange={onSearchHandler}
                      />
                    </InputField>
                  </div>
                </th> */}

                <th className="px-2 py-3 font-semibold text-gray-700">
                  <div className="flex items-center justify-between gap-3">
                    {selectedButton === "pageAccess" ? (
                      <div className="grid grid-cols-[40px_1fr_680px] gap-2 w-full min-w-0">
                        <span>#</span>
                        <span className="ml-10">Page Name</span>
                        <span>Navigation Name</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-6">
                        <span className="w-10">#</span>
                        <span className="truncate">{tableName}</span>
                      </div>
                    )}

                    <InputField>
                      <input
                        className="input-field w-40"
                        placeholder="Search..."
                        onChange={onSearchHandler}
                      />
                    </InputField>
                  </div>
                </th>

                <th className="px-4 py-3 font-semibold text-gray-700 w-32 text-center">
                  <ToggleButton
                    checked={
                      filteredData.length > 0 && filteredData.every(item => item.isGranted === 1)
                    }
                    disabled={filteredData.length === 0}
                    onClick={toggleAllHandler}
                  />
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, idx) => (
                  <tr key={getItemId(item)} className="hover:bg-gray-100">
                    {/* {selectedButton === "userRight" ? (
                      <td className="flex gap-2">
                        <span className=" px-3 py-3">{idx + 1}.</span>
                        <span className="px-4 py-3 ">
                          {item.userRightName}
                          <i className="fa-solid fa-info ml-5" title={item?.description}>
                            {" "}
                          </i>
                        </span>
                      </td>
                    ) : (
                      <td className="flex gap-2">
                        <span className=" px-3 py-3 ">{idx + 1}.</span>
                        <span className="px-4 py-3">
                          {item.roleName ||
                            item.userRightName ||
                            item.subMenuName ||
                            item.corporateName ||
                            item.name}
                        </span>
                      </td>
                    )} */}
                    {/* <td className="flex gap-2">
                      <span className="px-3 py-3">{idx + 1}.</span>
                      <span className="px-4 py-3">{renderCellContent(item)}</span>
                    </td> */}
                    {/* <td className="px-4 py-3 w-full">{renderCellContent(item)}</td> */}

                    <td className="flex gap-3 items-center">
                      <span className="ml-5 text-right">{idx + 1}.</span>

                      <div className="flex-1 ml-5">{renderCellContent(item)}</div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <ToggleButton
                        checked={item.isGranted === 1}
                        disabled={false}
                        onClick={() => toggleSingleHandler(getItemId(item))}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="px-4 py-6 text-center text-gray-500 italic">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {loading && <CustomLoader isLoading />}
      </div>
    );
  }
);

export default Table;
