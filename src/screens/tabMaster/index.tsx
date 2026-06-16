import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { TabnameTableHeader } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { PickMasterItem } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, useCallback, useState } from "react";
import { NavLink } from "react-router-dom";
import AddNewtab from "./components/AddNewtab";
import TabMapping from "./components/TabMapping";
import { GroupTypeItem, RoomTypeItem, TabMasterItem } from "./types";

const TabMaster = () => {
  const { loading, fetchApi } = useGlobalApi();
  const queryClient = useQueryClient();
  const tabTypeList = usePickMaster("BillingTabType")?.pickMasterValue ?? [];

  const [queryValue, setQueryValue] = useState<Record<string, string>>({});
  const [renderAddNewTab, setRenderAddNewTab] = useState<boolean>(false);
  const [openAddNewTab, setOpenAddNewTab] = useState<boolean>(false);
  const [renderTabMapping, setRenderTabMapping] = useState<boolean>(false);
  const [openTabMapping, setOpenTabMapping] = useState<boolean>(false);
  const [editableData, setEditableData] = useState<TabMasterItem | null>(null);

  const getGroupTypeList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_TAB_GROUP_TYPE_MASTER,
      {},
      {},
      { component: "TabMaster" }
    );
    return resp?.data ?? [];
  };

  const { data: groupTypeList = [] } = useQuery({
    queryKey: ["getGroupTypeList"],
    queryFn: getGroupTypeList,
  });

  const getRoomTypeList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SERVICE_ITEM_LIST,
      {},
      { params: { categoryTypeId: "10" } },
      { component: "TabMaster" }
    );
    return resp?.data ?? [];
  };

  const { data: roomTypeList = [] } = useQuery({
    queryKey: ["getRoomTypeList"],
    queryFn: getRoomTypeList,
  });

  const createQueryValue = (e: ChangeEvent<HTMLSelectElement> | ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setQueryValue(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const getTabMasterList = async (filters: Record<string, string>) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_IPD_TAB_MASTER,
      {},
      { params: filters },
      { component: "TabMaster" }
    );
    return resp?.data ?? [];
  };

  const { data: tabMasterList = [] } = useQuery({
    queryKey: ["getTabMasterList", queryValue],
    queryFn: () => getTabMasterList(queryValue),
  });

  const refreshTabMasterList = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["getTabMasterList"] });
  }, [queryClient]);

  const openAddTabDrawer = (item: TabMasterItem | null) => {
    setEditableData(item);
    setRenderAddNewTab(true);
    setOpenAddNewTab(true);
  };

  const closeAddTabDrawer = () => {
    setOpenAddNewTab(false);
    setTimeout(() => {
      setRenderAddNewTab(false);
      setEditableData(null);
    }, 500);
  };

  const openTabMappingDrawer = () => {
    setRenderTabMapping(true);
    setOpenTabMapping(true);
  };

  const closeTabMappingDrawer = () => {
    setOpenTabMapping(false);
    setTimeout(() => {
      setRenderTabMapping(false);
    }, 500);
  };

  return (
    <div className="page-container">
      <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4">
        <div>
          <h1 className="page-heading">Tab Master</h1>

          <nav className="helper-text">
            <NavLink to="/dashboard" className="hover:underline">
              Home
            </NavLink>
            <span>››</span>
            <span>Tab Master</span>
          </nav>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto ">
          <button type="button" className="save-btn" onClick={openTabMappingDrawer}>
            Tab Mapping
          </button>

          <button type="button" className="save-btn" onClick={() => openAddTabDrawer(null)}>
            Add New Tab
          </button>
        </div>
      </div>

      <div className="card form-grid-4">
        <InputField label="Tab Type">
          <select
            className="input-field"
            name="tabTypeId"
            value={queryValue.tabTypeId ?? ""}
            onChange={createQueryValue}
          >
            <option value="">Select Tab Type</option>
            {tabTypeList.map((item: PickMasterItem) => (
              <option key={item.key} value={item.key}>
                {item.value}
              </option>
            ))}
          </select>
        </InputField>

        <InputField label="Group Type">
          <select
            className="input-field"
            name="groupTypeId"
            value={queryValue.groupTypeId ?? ""}
            onChange={createQueryValue}
          >
            <option value="">Select Group Type</option>
            {groupTypeList.map((item: GroupTypeItem) => (
              <option key={item.GroupTypeId} value={item.GroupTypeId}>
                {item.GroupTypeName}
              </option>
            ))}
          </select>
        </InputField>

        <InputField label="Room Type">
          <select
            className="input-field"
            name="roomTypeId"
            value={queryValue.roomTypeId ?? ""}
            onChange={createQueryValue}
          >
            <option value="">Select Room Type</option>
            {roomTypeList.map((item: RoomTypeItem) => (
              <option key={item.serviceItemId} value={item.serviceItemId}>
                {item.name}
              </option>
            ))}
          </select>
        </InputField>

        <InputField label="Tab Name">
          <input
            className="input-field"
            placeholder="Enter tab name"
            name="tabName"
            value={queryValue.tabName ?? ""}
            onChange={createQueryValue}
          />
        </InputField>
      </div>

      <div className="table-container -mt-3">
        <div className="table-scroll-wrapper">
          <div className="table-size lg:min-h-155 lg:max-h-155">
            <table className="base-table">
              <thead className="table-head">
                <tr>
                  <th className="table-th w-16">Edit</th>
                  {TabnameTableHeader.map((header, index) => (
                    <th key={index} className="table-th whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {tabMasterList.length === 0 && (
                  <tr>
                    <td colSpan={TabnameTableHeader.length + 1} className="table-empty">
                      No records found
                    </td>
                  </tr>
                )}

                {tabMasterList.map((item: TabMasterItem) => (
                  <tr key={item.TabId} className="table-row">
                    <td className="table-td">
                      <button
                        type="button"
                        className="icon-color-button"
                        onClick={() => openAddTabDrawer(item)}
                      >
                        <i className="fa-solid fa-edit" />
                      </button>
                    </td>
                    <td className="table-td">{item.TabType || "-"}</td>
                    <td className="table-td">{item.GroupTypeName || "-"}</td>
                    <td className="table-td">{item.RoomType || "-"}</td>
                    <td className="table-td">{item.TabName || "-"}</td>
                    <td className="table-td">{item.TabViewURL || "-"}</td>
                    <td className="table-td">{item.SequenceNo ?? "-"}</td>
                    <td
                      className={`table-td ${
                        Number(item.IsActive) === 1 ? "active-text" : "inactive-text"
                      }`}
                    >
                      {Number(item.IsActive) === 1 ? "Active" : "Inactive"}
                    </td>
                    <td className="table-td">{item.CreatedBy || "-"}</td>
                    <td className="table-td">{item.CreatedOn || "-"}</td>
                    <td className="table-td">{item.LastModifiedBy || "-"}</td>
                    <td className="table-td">{item.LastModifiedOn || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {renderAddNewTab && (
        <AddNewtab
          isOpen={openAddNewTab}
          onClose={closeAddTabDrawer}
          data={editableData}
          onSuccess={refreshTabMasterList}
        />
      )}

      {renderTabMapping && <TabMapping isOpen={openTabMapping} onClose={closeTabMappingDrawer} />}

      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default TabMaster;
