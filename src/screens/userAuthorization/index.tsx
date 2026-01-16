import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import Select from "react-select";
import InputField from "../../components/customInputField";
import CustomLoader from "../../components/customLoader";
import { SelectStyles } from "../../components/customSelect";
import { ENDPOINTS } from "../../config/defaults";
import useGetBranchList from "../../hooks/useGetBranchList";
import useGlobalApi from "../../hooks/useGlobalApi";
import { usePickMaster } from "../../hooks/usePickMaster";
import Table from "./components/Table";

import {
  FilteredData,
  PickMasterValueItem,
  RoleDataItem,
  SelectItem,
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
  const [typeId, setTypeId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [roleId, setRoleId] = useState<number | null>(0);
  const [pageView, setPageView] = useState(false);

  const [filteredData, setFilteredData] = useState<FilteredData>([]);
  const [selectedButton, setSelectedButton] = useState("");

  const [userRightsDropdown, setUserRightsDropdown] = useState(false);
  const [userRightsGrantedRoles, setUserRightGrantedRoles] = useState<RoleDataItem[]>([]);

  const [tableData, setTableData] = useState<TableData | null>(null);

  const [selectedUser, setSelectedUser] = useState<SelectItem | null>(null);
  const [selectedRole, setSelectedRole] = useState<SelectItem | null>(null);

  const roleSelectRef = useRef<any>(null);
  const rightSelectRef = useRef<any>(null);

  const branchChangeHandler = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setBranchId(Number(e.target.value));
      setTypeId(null);
      setUserId(null);
      setRoleId(null);
      setSelectedUser(null);
      setSelectedRole(null);
      setPageView(false);
    },
    [branchId]
  );

  // fetch group list
  const getGroupList = async () => {
    const response = await fetchApi("GET", ENDPOINTS.USER_GROUP_LIST);

    if (!response) return;

    setUserGroupGrantedList(response?.data?.filter((g: UserGroupGroupItem) => g.isActive === 1));
  };

  // fetch user list
  const getUserList = async () => {
    const response = await fetchApi("GET", ENDPOINTS.USER_MASTER_LIST);
    if (!response) return;

    setUserGroupGrantedList(response?.data?.filter((u: UserGroupRoleItem) => u.isActive === 1));
  };

  // authorization type for userList or groupList
  const typeHandler = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const id = Number(e.target.value);

      setTypeId(id);

      const selectedType =
        pickMasterValue?.data?.find((t: PickMasterValueItem) => t?.key === String(id)) ?? null;

      setGroupType(selectedType);
      roleSelectRef.current?.clearValue();

      setUserGroupGrantedList([]);
      setFilteredData([]);
      setSelectedButton("");
      setUserRightsDropdown(false);
      setPageView(false);
      setSelectedRole(null);
      setSelectedUser(null);

      if (!selectedType) return;

      selectedType.value === "Group Wise" ? getGroupList() : getUserList();
    },
    [pickMasterValue, getGroupList, getUserList]
  );

  //user group or user master options for select dropdown
  const userSelectOptions = useMemo(() => {
    return (
      userGroupGrantedList?.map((u: UserGroupGroupItem | UserGroupRoleItem) => ({
        value: u?.id,
        label: u?.firstName || u?.groupName,
      })) || []
    );
  }, [userGroupGrantedList]);

  //role dropdown select option
  const roleSelectOption = useMemo(
    () =>
      userRightsGrantedRoles?.map(r => ({
        value: r?.roleId,
        label: r?.roleName,
      })) || [],
    [userRightsGrantedRoles]
  );

  const fetchRolesForUser = useCallback(
    async (uid: number) => {
      const response = await fetchApi(
        "GET",
        ENDPOINTS.GET_ASSIGN_ROLES_FOR_USER_AUTHORIZATION,
        {},
        { params: { branchId, typeId, userId: uid } }
      );

      const data = response?.data ?? [];

      setTableData({
        type: "roleName",
        branchId,
        typeId: typeId!,
        userId: uid,
        data,
      });

      setFilteredData(data);
      setUserRightGrantedRoles(data.filter(r => r.isGranted === 1));
    },
    [branchId, typeId, fetchApi]
  );

  const rolesButtonHandler = useCallback(() => {
    if (!userId) return;

    setSelectedButton("roles");
    setUserRightsDropdown(false);
    setRoleId(0);

    fetchRolesForUser(userId);
  }, [userId, fetchRolesForUser]);

  const selectUserGroupHandlerToBindRoles = useCallback(
    async (selected: { value: number; label: string } | null) => {
      const uid = selected?.value;
      setSelectedUser(selected);
      setSelectedRole(null);
      if (!uid) return;

      setPageView(true);
      setUserId(uid);
      setSelectedButton("roles");
      setUserRightsDropdown(false);
      rightSelectRef.current?.clearValue();

      fetchRolesForUser(uid);
    },
    [fetchRolesForUser]
  );

  const fetchUserRightData = useCallback(
    async (selectedRoleId: number) => {
      const response = await fetchApi(
        "GET",
        ENDPOINTS.GET_ASSIGN_USER_RIGHT_MAPPING,
        {},
        { params: { branchId, typeId, userId, roleId: selectedRoleId } }
      );

      const data = response?.data ?? [];

      setTableData({
        type: "userRightName",
        branchId,
        typeId: typeId!,
        userId: userId!,
        roleId: selectedRoleId,
        data,
      });

      setFilteredData(data);
    },
    [branchId, typeId, userId, fetchApi]
  );

  const userRightsButtonHandler = useCallback(() => {
    setSelectedButton("userRight");
    setUserRightsDropdown(true);
    setRoleId(0);
    rightSelectRef.current?.clearValue();
    setSelectedRole(null);

    if (roleId) fetchUserRightData(roleId);
  }, [roleId, fetchUserRightData]);

  const userRightsDropdownHandler = useCallback(
    (selected: { value: number; label: string } | null) => {
      if (!selected) return;
      setSelectedRole(selected);

      const rid = selected.value;
      setRoleId(rid);

      if (selectedButton === "userRight") {
        fetchUserRightData(rid);
      }

      if (selectedButton === "userDashboard") {
        userDashboardTableData();
      }

      if (selectedButton === "pageAccess") {
        pageAccessTableData();
      }
    },
    [selectedButton, fetchUserRightData]
  );

  //user dashboard table data
  const userDashboardTableData = async () => {
    const response = await fetchApi(
      "GET",
      ENDPOINTS.GET_ASSIGN_DASHBOARD_USER_RIGHT,
      {},
      { params: { branchId, typeId, userId, roleId } }
    );

    setTableData({
      type: "userDashboard",
      branchId,
      typeId: typeId!,
      userId: userId!,
      roleId,
      data: response?.data ?? [],
    });

    setFilteredData(response?.data ?? []);
  };

  //user dashboard handler
  const userDashboardHandler = async () => {
    setSelectedButton("userDashboard");
    setUserRightsDropdown(true);
    setRoleId(0);
    rightSelectRef.current?.clearValue();
    setSelectedRole(null);
  };

  // page access table data
  const pageAccessTableData = async () => {
    const response = await fetchApi(
      "GET",
      ENDPOINTS.GET_USER_WISE_MENU_MASTER,
      {},
      { params: { branchId, typeId, userId, roleId } }
    );

    setTableData({
      type: "pageAccess",
      branchId,
      typeId: typeId!,
      userId: userId!,
      roleId,
      data: response?.data ?? [],
    });

    setFilteredData(response?.data ?? []);
  };

  // page access handler
  const pageAccessHandler = async () => {
    setSelectedButton("pageAccess");
    setUserRightsDropdown(true);
    setRoleId(0);
    rightSelectRef.current?.clearValue();
    setSelectedRole(null);
    setRoleId(null);
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
    setRoleId(0);

    if (!branchId || !typeId || !userId) return;

    const response = await fetchApi(
      "GET",
      ENDPOINTS.GET_USER_WISE_CORPORATE_MAPPING,
      {},
      { params: { branchId, typeId, userId } }
    );

    setTableData({
      type: "corporateMapping",
      branchId,
      typeId,
      userId,
      roleId,
      data: response?.data ?? [],
    });

    setFilteredData(response?.data ?? []);
  };

  // user bed mapping handler
  const userBedMappingHandler = async () => {
    setSelectedButton("bedMapping");
    setUserRightsDropdown(false);
    setRoleId(0);

    const response = await fetchApi(
      "GET",
      ENDPOINTS.GET_USER_WISE_BED_MAPPING,
      {},
      { params: { branchId, typeId, userId } }
    );

    setTableData({
      type: "bedMapping",
      branchId,
      typeId,
      userId,
      data: response?.data ?? [],
    });

    setFilteredData(response?.data ?? []);
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
          <select className="input-field" onChange={branchChangeHandler} value={branchId}>
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

            {pickMasterValue?.data?.map((t: PickMasterValueItem) => (
              <option key={t?.id} value={t?.key}>
                {t?.value}
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
          <Select
            // ref={roleSelectRef}
            value={selectedUser}
            options={userSelectOptions}
            placeholder="Select..."
            isSearchable
            isClearable
            onChange={selectUserGroupHandlerToBindRoles}
            classNames={SelectStyles}
            menuPortalTarget={document?.body}
            menuPosition="fixed"
          />
        </InputField>

        {userRightsDropdown && (
          <InputField label="Role">
            <Select
              // ref={rightSelectRef}
              value={selectedRole}
              options={roleSelectOption}
              placeholder="Select..."
              isSearchable
              isClearable
              onChange={userRightsDropdownHandler}
              classNames={SelectStyles}
              menuPortalTarget={document?.body}
              menuPosition="fixed"
            />
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
              onClick={rolesButtonHandler}
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
              selectedButton={selectedButton}
              setTableData={setTableData}
              onSubmitPage={setSelectedRole}
              onRoleChange={setRoleId}
            />
          )}
        </>
      ) : null}

      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default UserAuthorization;
