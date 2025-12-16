import { ChangeEvent, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import InputField from "../../components/customInputField";
import CustomLoader from "../../components/customLoader";
import { ENDPOINTS } from "../../config/defaults";
import useGetBranchList from "../../hooks/useGetBranchList";
import useGlobalApi from "../../hooks/useGlobalApi";
import { usePickMaster } from "../../hooks/usePickMaster";
import Table from "./components/Table";

import {
  FilteredData,
  PickMasterValueItem,
  RoleDataItem,
  TableData,
  UserGroupGroupItem,
  UserGroupRoleItem,
} from "./types";

const UserAuthorization = () => {
  const { branchList } = useGetBranchList();
  const { pickMasterValue } = usePickMaster({ fieldName: "AuthorizationType" });
  const { loading, error, fetchApi } = useGlobalApi();

  const [successMessage, setSuccessMessage] = useState<string>("");

  const [groupType, setGroupType] = useState<PickMasterValueItem | null>(null);
  const [userGroupGrantedList, setUserGroupGrantedList] = useState<
    (UserGroupRoleItem | UserGroupGroupItem)[]
  >([]);

  const [branchId, setBranchId] = useState<number>(1);
  const [typeId, setTypeId] = useState<string>();
  const [userId, setUserId] = useState<number | null>(null);
  const [roleId, setRoleId] = useState<number>(0);
  const [pageView, setPageView] = useState(false);

  const [filteredData, setFilteredData] = useState<FilteredData>([]);
  const [selectedButton, setSelectedButton] = useState("");

  const [userRightsDropdown, setUserRightsDropdown] = useState(false);
  const [userRightsGrantedRoles, setUserRightGrantedRoles] = useState<RoleDataItem[]>([]);

  const [tableData, setTableData] = useState<TableData | null>(null);

  // BRANCH
  const branchHandler = (e: ChangeEvent<HTMLSelectElement>) => setBranchId(Number(e.target.value));

  // CHANGE AUTHORIZATION TYPE
  const typeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;

    setTypeId(id);

    const selectedType =
      pickMasterValue?.data?.find((t: PickMasterValueItem) => t.key === id) ?? null;

    setGroupType(selectedType);

    setUserGroupGrantedList([]);
    setFilteredData([]);
    setSelectedButton("");
    setUserRightsDropdown(false);

    if (!selectedType) return;

    if (selectedType.value === "Group Wise") getGroupList(id);
    if (selectedType.value === "User Wise") getUserList(id);
  };

  // fetch group list
  const getGroupList = async (groupId: string) => {
    const response = await fetchApi(
      "GET",
      ENDPOINTS.USER_GROUP_LIST,
      {},
      { params: { id: groupId } }
    );

    if (!response) return;

    setUserGroupGrantedList(response?.data?.filter((g: UserGroupGroupItem) => g.isActive === 1));
  };

  // fetch user list
  const getUserList = async (id: string) => {
    const response = await fetchApi("GET", ENDPOINTS.USER_MASTER_LIST, {}, { params: { id } });
    if (!response) return;

    setUserGroupGrantedList(response.data.filter((u: UserGroupRoleItem) => u.isActive === 1));
  };

  // role button click
  const selectUserGroupHandlerToBindRoles = async (e?: ChangeEvent<HTMLSelectElement> | null) => {
    const selectedId = Number(e?.target?.value);

    setPageView(true);

    setUserId(Number(e?.target?.value));
    setSelectedButton("roles");
    setUserRightsDropdown(false);

    const response = await fetchApi(
      "GET",
      ENDPOINTS.GET_ASSIGN_ROLES_FOR_USER_AUTHORIZATION,
      {},
      { params: { branchId, typeId, userId: selectedId } }
    );

    if (!response) {
      setTableData({
        type: "roleName",
        branchId,
        typeId: typeId!,
        userId: selectedId,
        data: [],
      });
      setFilteredData([]);

      return;
    }

    setTableData({
      type: "roleName",
      branchId,
      typeId: typeId!,
      userId: selectedId,
      data: response.data,
    });

    setFilteredData(response.data);

    setUserRightGrantedRoles(response?.data?.filter((item: RoleDataItem) => item.isGranted === 1));
  };

  // fetch user right data
  const fetchUserRightData = async (selectedRoleId: number) => {
    if (!branchId || !typeId || !userId) return;

    const response = await fetchApi(
      "GET",
      ENDPOINTS.GET_ASSIGN_USER_RIGHT_MAPPING,
      {},
      { params: { branchId, typeId, userId, roleId: selectedRoleId } }
    );

    if (!response) {
      setTableData({
        type: "userRightName",
        branchId,
        typeId,
        userId,
        roleId: selectedRoleId,
        data: [],
      });
      setFilteredData([]);

      return;
    }

    setTableData({
      type: "userRightName",
      branchId,
      typeId,
      userId,
      roleId: selectedRoleId,
      data: response.data,
    });

    setFilteredData(response.data);
  };

  // user right buttons click
  const userRightsButtonHandler = () => {
    setSelectedButton("userRight");
    setUserRightsDropdown(true);

    if (roleId !== null) fetchUserRightData(roleId);
  };

  // user rights dropdown change
  const userRightsDropdownHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const selected = Number(e.target.value);
    setRoleId(selected);
  };

  const userDashboardTableData = async () => {
    if (!branchId || !typeId || !userId) return;

    const response = await fetchApi(
      "GET",
      ENDPOINTS.GET_ASSIGN_DASHBOARD_USER_RIGHT,
      {},
      { params: { branchId, typeId, userId, roleId } }
    );

    if (!response) {
      setTableData({
        type: "userDashboard",
        branchId,
        typeId,
        userId,
        roleId,
        data: [],
      });
      setFilteredData([]);

      return;
    }

    setTableData({
      type: "userDashboard",
      branchId,
      typeId,
      userId,
      roleId,
      data: response?.data,
    });

    setFilteredData(response?.data);
  };

  //user dashboard handler
  const userDashboardHandler = async () => {
    setSelectedButton("userDashboard");
    setUserRightsDropdown(true);
  };

  const pageAccessTableData = async () => {
    const response = await fetchApi(
      "GET",
      ENDPOINTS.GET_USER_WISE_MENU_MASTER,
      {},
      { params: { branchId, typeId, userId, roleId } }
    );

    if (!response) {
      setTableData({
        type: "pageAccess",
        branchId,
        typeId,
        userId,
        roleId,
        data: [],
      });
      setFilteredData([]);
      return;
    }

    setTableData({
      type: "pageAccess",
      branchId,
      typeId,
      userId,
      roleId,
      data: response?.data,
    });

    setFilteredData(response?.data);
  };

  // page access
  const pageAccessHandler = async () => {
    setSelectedButton("pageAccess");
    setUserRightsDropdown(true);
  };

  useEffect(() => {
    if (!branchId || !typeId || !userId) return;

    switch (selectedButton) {
      case "userRight":
        fetchUserRightData(roleId);
        break;

      case "userDashboard":
        userDashboardTableData();
        break;

      case "pageAccess":
        pageAccessTableData();
        break;

      default:
        break;
    }
  }, [selectedButton, roleId, branchId, typeId, userId]);

  // corporate mapping handler
  const corporateMappingHandler = async () => {
    setSelectedButton("corporateMapping");
    setUserRightsDropdown(false);

    if (!branchId || !typeId || !userId) return;

    const response = await fetchApi(
      "GET",
      ENDPOINTS.GET_USER_WISE_CORPORATE_MAPPING,
      {},
      { params: { branchId, typeId, userId } }
    );

    if (!response) {
      setTableData({
        type: "corporateMapping",
        branchId,
        typeId,
        userId,
        roleId,
        data: [],
      });
      setFilteredData([]);

      return;
    }

    setTableData({
      type: "corporateMapping",
      branchId,
      typeId,
      userId,
      roleId,
      data: response?.data,
    });

    setFilteredData(response?.data);
  };

  // user bed mapping handler
  const userBedMappingHandler = async () => {
    setSelectedButton("bedMapping");
    setUserRightsDropdown(false);

    const response = await fetchApi(
      "GET",
      ENDPOINTS.GET_USER_WISE_BED_MAPPING,
      {},
      { params: { branchId, typeId, userId } }
    );

    if (!response) {
      setTableData({
        type: "bedMapping",
        branchId,
        typeId,
        userId,
        data: [],
      });
      setFilteredData([]);

      return;
    }

    setTableData({
      type: "bedMapping",
      branchId,
      typeId,
      userId,
      data: response?.data,
    });

    setFilteredData(response?.data);
  };

  return (
    <div className="bg-gray-50 min-h-screen px-3 py-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">User Authorization</h1>
        <nav className="text-sm text-gray-500 flex gap-2 mt-1">
          <NavLink to="/dashboard" className="hover:underline">
            Home
          </NavLink>
          <span>››</span>
          <span>User Authorization</span>
        </nav>
      </div>

      <div
        className={`grid grid-cols-1 sm:grid-cols-2 ${
          userRightsDropdown ? "lg:grid-cols-4" : "lg:grid-cols-4"
        } gap-4 bg-white rounded-xl p-4 shadow-md`}
      >
        <InputField label="Branch Name">
          <select className="input-field" onChange={branchHandler} value={branchId}>
            {branchList?.data?.map(b => (
              <option key={b.branchId} value={b.branchId}>
                {b.branchName}
              </option>
            ))}
          </select>
        </InputField>

        <InputField label="Authorization Type">
          <select className="input-field" value={typeId || ""} onChange={typeHandler}>
            <option value="">Select Type</option>

            {pickMasterValue?.data?.map(t => (
              <option key={t.id} value={t.key}>
                {t.value}
              </option>
            ))}
          </select>
        </InputField>

        <InputField
          label={
            groupType?.value
              ? groupType.value === "User Wise"
                ? "Users"
                : "Groups"
              : "Select Authorization"
          }
        >
          <select
            className="input-field"
            value={userId || ""}
            onChange={selectUserGroupHandlerToBindRoles}
          >
            <option value="">Select</option>
            {userGroupGrantedList?.map(item => (
              <option key={item.id} value={item.id}>
                {"firstName" in item ? item.firstName : item.groupName}
              </option>
            ))}
          </select>
        </InputField>

        {userRightsDropdown && (
          <InputField label="Role">
            <select className="input-field" onChange={userRightsDropdownHandler}>
              <option value={0}>All</option>
              {userRightsGrantedRoles?.map(role => (
                <option key={role.roleId} value={role.roleId}>
                  {role.roleName}
                </option>
              ))}
            </select>
          </InputField>
        )}
      </div>

      {pageView ? (
        <>
          <div className="flex gap-1 mt-2">
            <button
              className={`table-header-button ${
                selectedButton === "roles" ? "bg-blue-600 text-white" : ""
              }`}
              onClick={() => selectUserGroupHandlerToBindRoles(null)}
            >
              Roles
            </button>

            <button
              className={`table-header-button ${
                selectedButton === "userRight" ? "bg-blue-600 text-white" : ""
              }`}
              onClick={userRightsButtonHandler}
            >
              User Rights
            </button>

            <button
              className={`table-header-button ${
                selectedButton === "userDashboard" ? "bg-blue-600 text-white" : ""
              }`}
              onClick={userDashboardHandler}
            >
              User Dashboard
            </button>

            <button
              className={`table-header-button ${
                selectedButton === "pageAccess" ? "bg-blue-600 text-white" : ""
              }`}
              onClick={pageAccessHandler}
            >
              Page Access
            </button>

            <button
              className={`table-header-button ${
                selectedButton === "corporateMapping" ? "bg-blue-600 text-white" : ""
              }`}
              onClick={corporateMappingHandler}
            >
              Corporate Mapping
            </button>

            <button
              className={`table-header-button ${
                selectedButton === "bedMapping" ? "bg-blue-600 text-white" : ""
              }`}
              onClick={userBedMappingHandler}
            >
              Room Mapping
            </button>
          </div>

          {tableData && (
            <Table
              tableData={tableData}
              filteredData={filteredData}
              onChangeFilter={data => setFilteredData(data)}
              onChangeMessage={setSuccessMessage}
            />
          )}
        </>
      ) : null}

      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default UserAuthorization;
