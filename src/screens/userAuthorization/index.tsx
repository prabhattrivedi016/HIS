import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import Select from "react-select";
import InputField from "../../components/customInputField";
import CustomLoader from "../../components/customLoader";
import { SelectStyles } from "../../components/customSelect";
import ToggleButton from "../../components/toggleButton";
import { ENDPOINTS } from "../../config/defaults";
import { Active, DefaultBranch } from "../../constants/constants";
import useGetBranchList from "../../hooks/useGetBranchList";
import useGlobalApi from "../../hooks/useGlobalApi";
import { usePickMaster } from "../../hooks/usePickMaster";
import CorporateMapping from "./components/CorporateMapping";
import PageAccess from "./components/PageAccess";
import RoomMapping from "./components/RoomMapping";
import UserDashboard from "./components/UserDashboard";
import UserRightData from "./components/UserRightData";
import {
  AuthItem,
  BranchItem,
  RoleDataItem,
  SelectItem,
  UserGroupGroupItem,
  UserGroupRoleItem,
} from "./types";

const UserAuthorization = () => {
  /*---------------------------branch lists------------------ */

  const { loading, error, fetchApi } = useGlobalApi();

  const branchLists = useGetBranchList();
  const { pickMasterValue } = usePickMaster({ fieldName: "AuthorizationType" });

  const [branchId, setBranchId] = useState<number | null>(null);
  const [typeId, setTypeId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [roleId, setRoleId] = useState<number | null>(null);
  const [groupType, setGroupType] = useState<AuthItem | null>(null);
  const [userGroupGrantedList, setUserGroupGrantedList] = useState<
    UserGroupGroupItem[] | UserGroupRoleItem[] | null
  >(null);
  const [selectedUserGroup, setSelectedUserGroup] = useState<SelectItem | null>(null);
  const [selectedRole, setSelectedRole] = useState<SelectItem | null>(null);
  const [pageView, setPageView] = useState<boolean>(false);
  const [selectedButton, setSelectedButton] = useState<string>("");
  const [filteredData, setFilteredData] = useState<RoleDataItem[]>([]);
  const [showRoleSelect, setShowRoleSelect] = useState<boolean>(false);
  const [roleData, setRoleData] = useState<RoleDataItem[]>([]);

  // branches
  const branches = useMemo(() => branchLists?.branchList?.data, [branchLists]);

  const defaultBranch = useMemo<BranchItem | undefined>(() => {
    return branches?.find((b: BranchItem) => b.branchId === DefaultBranch.BRANCH);
  }, [branches]);

  useEffect(() => {
    if (defaultBranch?.branchId && branchId === null) {
      setBranchId(defaultBranch?.branchId);
    }
  }, [defaultBranch, branchId]);

  //authorization type
  const authSelectOption = useMemo(() => pickMasterValue?.data ?? [], [pickMasterValue]);

  /*------------------------------------ handler------------------------- */
  const branchChangeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    setBranchId(Number(e.target.value) ?? null);
    setPageView(false);
    setSelectedUserGroup(null);
    setSelectedRole(null);
    setTypeId(null);
    setUserId(null);
    setRoleId(null);
    setShowRoleSelect(false);
  };

  const authChangeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedKey = e.target.value;

    setTypeId(Number(selectedKey));

    const selectedGroup = pickMasterValue?.data?.find(
      (o: AuthItem) => String(o.key) === selectedKey
    );

    setGroupType(selectedGroup ?? {});
    setSelectedUserGroup(null);
    setPageView(false);
    setShowRoleSelect(false);
  };

  useEffect(() => {
    if (!groupType?.value) return;

    groupType.value === "Group Wise" ? getGroupList() : getUserList();
  }, [groupType]);

  //user group or user master options for select dropdown
  const userSelectOptions = useMemo(() => {
    return (
      userGroupGrantedList?.map((u: UserGroupGroupItem | UserGroupRoleItem) => ({
        value: u?.id,
        label: "firstName" in u ? u.firstName : u.groupName,
      })) || []
    );
  }, [userGroupGrantedList]);

  //selected user or groups
  const selectUserGroupHandlerToBindRoles = useCallback(
    (option: unknown) => {
      const selectedOption = option as SelectItem | null;
      setSelectedUserGroup(selectedOption);
      setUserId(selectedOption?.value ?? null);
      setSelectedRole(null);
      setShowRoleSelect(false);
    },
    [selectedUserGroup]
  );

  useEffect(() => {
    if (!selectedUserGroup) return;

    fetchRolesForUser(selectedUserGroup?.value);
  }, [selectedUserGroup]);

  /*----------------------------------api calls------------------------------- */
  // fetch group list
  const getGroupList = async () => {
    const response = await fetchApi("GET", ENDPOINTS.USER_GROUP_LIST);

    if (!response) return;

    setUserGroupGrantedList(
      response?.data?.filter((g: UserGroupGroupItem) => g.isActive === Active?.isActive) ?? []
    );
  };

  // fetch user list
  const getUserList = async () => {
    const response = await fetchApi("GET", ENDPOINTS.USER_MASTER_LIST);
    if (!response) return;

    setUserGroupGrantedList(
      response?.data?.filter((u: UserGroupRoleItem) => u.isActive === Active?.isActive) ?? []
    );
  };

  //user list role data
  const fetchRolesForUser = useCallback(
    async (uid: number) => {
      setSelectedButton("roles");
      setPageView(true);
      const response = await fetchApi(
        "GET",
        ENDPOINTS.GET_ASSIGN_ROLES_FOR_USER_AUTHORIZATION,
        {},
        { params: { branchId, typeId, userId: uid } }
      );

      setFilteredData(response?.data ?? []);
      setRoleData(response?.data ?? []);
    },
    [branchId, typeId]
  );

  //select option for roles
  const roleSelectOption = useMemo(() => {
    return (
      roleData?.map((r: RoleDataItem) => ({
        value: r?.roleId,
        label: r?.roleName,
      })) || []
    );
  }, [roleData]);

  const roleSelectHandler = (selected: { label: string; value: number }) => {
    setRoleId(selected?.value);
    setSelectedRole(selected);
  };
  /*---------------------button handlers---------------------- */

  const roleButtonHandler = async () => {
    setSelectedButton("roles");
    setShowRoleSelect(false);
    setRoleId(null);

    if (!selectedUserGroup?.value) return;

    await fetchRolesForUser(selectedUserGroup.value);
  };

  const userRightsButtonHandler = () => {
    setShowRoleSelect(true);
    setSelectedRole(null);
    setRoleId(null);

    setSelectedButton("userRights");
  };

  const userDashboardHandler = () => {
    setShowRoleSelect(true);
    setSelectedRole(null);
    setRoleId(null);

    setSelectedButton("userDashboard");
  };

  const pageAccessHandler = () => {
    setShowRoleSelect(true);
    setSelectedRole(null);
    setRoleId(null);

    setSelectedButton("pageAccess");
  };

  const corporateMappingHandler = () => {
    setShowRoleSelect(false);
    setSelectedRole(null);
    setRoleId(null);

    setSelectedButton("corporateMapping");
  };
  const roomMappingHandler = () => {
    setShowRoleSelect(false);
    setSelectedRole(null);
    setRoleId(null);

    setSelectedButton("roomMapping");
  };

  /*--------------------------role handlers---------------------------- */

  //toggle single handler
  const toggleSingleHandler = (id: number) => {
    setRoleData(prev =>
      prev.map(item =>
        item?.roleId === id ? { ...item, isGranted: item.isGranted === 1 ? 0 : 1 } : item
      )
    );

    setFilteredData(prev =>
      prev.map(item =>
        item?.roleId === id ? { ...item, isGranted: item.isGranted === 1 ? 0 : 1 } : item
      )
    );
  };

  //toggle all handler
  const toggleAllHandler = () => {
    const allGranted = roleData.length > 0 && roleData.every(item => item.isGranted === 1);

    const updated = roleData.map(item => ({
      ...item,
      isGranted: allGranted ? 0 : 1,
    }));

    setRoleData(updated);
    setFilteredData(updated);
  };

  //search handler
  const onSearchHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const filteredRole = roleData?.filter((u: RoleDataItem) =>
      u?.roleName?.toLowerCase()?.includes(value?.toLowerCase())
    );
    setFilteredData(filteredRole);
  };

  //All handler
  const filterAllHandler = () => {
    setFilteredData(roleData || []);
  };

  // remaining handler
  const remainingHandler = () => {
    const remaining = roleData?.filter(r => r?.isGranted === 0) || [];
    setFilteredData(remaining);
  };

  // granted
  const grantedHandler = () => {
    const granted = roleData.filter(item => item.isGranted === 1) || [];
    setFilteredData(granted);
  };

  /* --------------------save------------------------- */
  const saveRoleMappingHandler = async () => {
    const roles = roleData
      .filter(r => r.isGranted === 1)
      .map(r => ({
        branchId,
        typeId,
        userId,
        roleId: r.roleId,
      }));

    const resp = await fetchApi("POST", ENDPOINTS.SAVE_UPDATE_ROLE_MAPPING, {
      branchId,
      typeId,
      userId,
      userRoleMappings: roles,
    });
  };

  /*------------------------------------render components------------------------- */
  const renderTableData = (buttonType: string) => {
    switch (buttonType) {
      case "roles": {
        return (
          <div className="bg-white rounded-2xl shadow-md mt-2 p-2">
            {/* HEADER */}
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
                onClick={saveRoleMappingHandler}
              >
                Save
              </button>
            </div>

            {/* TABLE */}
            <div className="border border-gray-300 overflow-y-auto rounded-lg min-h-[300px] max-h-[400px]">
              <table className="min-w-full table-fixed border-collapse">
                <thead className="bg-blue-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 w-16">#</th>

                    {/* Role Name + small search */}
                    <th className="px-5 py-3 font-semibold text-gray-700">
                      <div className="flex items-center gap-3">
                        <span className="block whitespace-nowrap overflow-hidden text-ellipsis ">
                          Role Name
                        </span>
                        <input
                          className="input-field h-10 max-w-[250px] text-sm ml-20 "
                          placeholder="search..."
                          onChange={onSearchHandler}
                        />
                      </div>
                    </th>

                    {/* Toggle All */}
                    <th className="px-4 py-3 text-center font-semibold text-gray-700 w-32">
                      <ToggleButton
                        disabled={filteredData?.length === 0}
                        checked={
                          filteredData?.length > 0 &&
                          filteredData?.every(item => item?.isGranted === 1)
                        }
                        onClick={toggleAllHandler}
                      />
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((item, idx) => (
                      <tr key={item.roleId} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3">{idx + 1}</td>
                        <td className="px-4 py-3">{item.roleName}</td>
                        <td className="px-4 py-3 text-center">
                          <ToggleButton
                            checked={item?.isGranted === 1}
                            onClick={() => toggleSingleHandler(item?.roleId)}
                          />
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

            {loading && <CustomLoader isLoading={loading} />}
          </div>
        );
      }
      case "userRights": {
        return (
          <UserRightData branchId={branchId} typeId={typeId} userId={userId} roleId={roleId} />
        );
      }
      case "userDashboard": {
        return (
          <UserDashboard branchId={branchId} typeId={typeId} userId={userId} roleId={roleId} />
        );
      }
      case "pageAccess": {
        return <PageAccess branchId={branchId} typeId={typeId} userId={userId} roleId={roleId} />;
      }
      case "corporateMapping": {
        return <CorporateMapping branchId={branchId} typeId={typeId} userId={userId} />;
      }
      case "roomMapping": {
        return <RoomMapping branchId={branchId} typeId={typeId} userId={userId} />;
      }
      default:
        return;
    }
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white rounded-xl p-4 shadow-md mt-4">
          <InputField label="Branch Name" required>
            <select className="input-field" onChange={branchChangeHandler} value={branchId ?? ""}>
              <option value="" disabled>
                Select
              </option>
              {branches?.map((b: BranchItem) => (
                <option key={b.branchId} value={b.branchId}>
                  {b.branchName}
                </option>
              ))}
            </select>
          </InputField>
          <InputField label="Authorization Type" required>
            <select className="input-field" onChange={authChangeHandler} value={typeId ?? ""}>
              <option value="">Select Type</option>
              {authSelectOption?.map((o: AuthItem) => (
                <option key={o.key} value={o.key}>
                  {o.value}
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
              value={selectedUserGroup}
              options={userSelectOptions}
              placeholder="Select..."
              isSearchable
              isClearable
              onChange={selectUserGroupHandlerToBindRoles}
              classNames={SelectStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </InputField>

          {!!showRoleSelect && showRoleSelect ? (
            <InputField label="Role">
              <Select
                value={selectedRole}
                options={roleSelectOption}
                placeholder="Select..."
                isSearchable
                isClearable
                onChange={roleSelectHandler}
                classNames={SelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </InputField>
          ) : (
            <></>
          )}
        </div>
      </div>
      {pageView && (
        <>
          <div className="flex gap-1 mt-3">
            <button
              className={`table-header-button ${
                selectedButton === "roles" ? "bg-blue-600 text-white" : ""
              }`}
              onClick={roleButtonHandler}
            >
              Roles
            </button>

            <button
              className={`table-header-button ${
                selectedButton === "userRights" ? "bg-blue-600 text-white" : ""
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
                selectedButton === "roomMapping" ? "bg-blue-600 text-white" : ""
              }`}
              onClick={roomMappingHandler}
            >
              Room Mapping
            </button>
          </div>
          {/* render components */}
          {renderTableData(selectedButton)}
        </>
      )}

      {/* custom loader */}
      {!!loading ? <CustomLoader isLoading={loading} /> : <></>}
    </div>
  );
};

export default UserAuthorization;
