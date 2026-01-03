import React, { ChangeEvent } from "react";
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
  const { loading, fetchApi } = useGlobalApi();

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

  const allFilterHandler = () => {
    onChangeFilter(tableData.data);
  };

  const remainingFilterHandler = () => {
    onChangeFilter(tableData.data.filter(item => item.isGranted === 0));
  };

  const grantedFilterHandler = () => {
    onChangeFilter(tableData.data.filter(item => item.isGranted === 1));
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
          tableData.data.filter((i: PageAccessItem) => i.subMenuName?.toLowerCase().includes(value))
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
        return onChangeFilter(tableData.data);
    }
  };

  //toggle all
  const toggleAllHandler = () => {
    if (!filteredData.length) return;

    const shouldGrantAll = filteredData.some(i => i.isGranted === 0);

    const updated = tableData.data.map(item => {
      const isMatch = filteredData.some(f => {
        switch (tableData.type) {
          case "corporateMapping":
            return f.corporateId === item.corporateId;
          case "bedMapping":
            return f.serviceItemId === item.serviceItemId;
          case "pageAccess":
            return f.subMenuId === item.subMenuId;
          case "userRightName":
            return f.userRightId === item.userRightId;
          case "userDashboard":
            return f.userRightId === item.userRightId;
          case "roleName":
            return f.roleId === item.roleId;
          default:
            return false;
        }
      });

      return isMatch ? { ...item, isGranted: shouldGrantAll ? 1 : 0 } : item;
    });

    tableData.data = updated;
    onChangeFilter(updated);
  };

  // toggle single
  const toggleSingleHandler = (id: number) => {
    const updated = tableData.data.map(item => {
      switch (tableData.type) {
        case "corporateMapping":
          return item.corporateId === id
            ? { ...item, isGranted: item.isGranted === 1 ? 0 : 1 }
            : item;

        case "bedMapping":
          return item.serviceItemId === id
            ? { ...item, isGranted: item.isGranted === 1 ? 0 : 1 }
            : item;

        case "pageAccess":
          return item.subMenuId === id
            ? { ...item, isGranted: item.isGranted === 1 ? 0 : 1 }
            : item;

        case "userRightName":
          return item.userRightId === id
            ? { ...item, isGranted: item.isGranted === 1 ? 0 : 1 }
            : item;

        case "userDashboard":
          return item.userRightId === id
            ? { ...item, isGranted: item.isGranted === 1 ? 0 : 1 }
            : item;

        case "roleName":
          return item.roleId === id ? { ...item, isGranted: item.isGranted === 1 ? 0 : 1 } : item;

        default:
          return item;
      }
    });

    tableData.data = updated;
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
        if (!tableData?.roleId) return;

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
        if (!tableData?.roleId) return;

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
        const menus = tableData?.data
          .filter((u: PageAccessItem) => u?.isGranted === 1)
          .map(u => ({
            branchId: tableData?.branchId,
            typeId: Number(tableData?.typeId),
            userId: tableData?.userId,
            roleId: tableData?.roleId,
            subMenuId: u?.subMenuId,
          }));
        if (!tableData?.roleId) return;

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
              <th className="px-4 py-3 font-semibold text-gray-700">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate">{tableName}</span>
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

          {/* <tbody>
            {filteredData.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-100">
                <td className="px-4 py-3">
                  {item.roleName ||
                    item.userRightName ||
                    item.subMenuName ||
                    item.corporateName ||
                    item.name}
                </td>

                <td className="px-4 py-3 text-center">
                  <ToggleButton
                    checked={item.isGranted === 1}
                    disabled={false}
                    onClick={() => {
                      if (tableData.type === "corporateMapping")
                        toggleSingleHandler(item.corporateId);
                      else if (tableData.type === "bedMapping")
                        toggleSingleHandler(item.serviceItemId);
                      else if (tableData.type === "pageAccess") toggleSingleHandler(item.subMenuId);
                      else if (tableData.type === "userRightName")
                        toggleSingleHandler(item.userRightId);
                      else if (tableData.type === "roleName") toggleSingleHandler(item.roleId);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody> */}
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-100">
                  <td className="px-4 py-3">
                    {item.roleName ||
                      item.userRightName ||
                      item.subMenuName ||
                      item.corporateName ||
                      item.name}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <ToggleButton
                      checked={item.isGranted === 1}
                      disabled={false}
                      onClick={() => {
                        if (tableData.type === "corporateMapping")
                          toggleSingleHandler(item.corporateId);
                        else if (tableData.type === "bedMapping")
                          toggleSingleHandler(item.serviceItemId);
                        else if (tableData.type === "pageAccess")
                          toggleSingleHandler(item.subMenuId);
                        else if (tableData.type === "userRightName")
                          toggleSingleHandler(item.userRightId);
                        else if (tableData.type === "roleName") toggleSingleHandler(item.roleId);
                      }}
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
};

export default React.memo(Table);
