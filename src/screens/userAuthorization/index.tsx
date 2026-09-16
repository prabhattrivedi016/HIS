import { showError, showSuccess } from "@/utils/alert";
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
import DischargeProcessMapping from "./components/DischargeProcessMapping";
import PageAccess from "./components/PageAccess";
import RoomMapping from "./components/RoomMapping";
import TabAccess from "./components/TabAccess";
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
  const authValue = usePickMaster("AuthorizationType");
  const authList = authValue?.pickMasterValue ?? [];

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
  const [activeButton, setActiveButton] = useState<string>("");

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
  const authSelectOption = useMemo(() => authList ?? [], [authList]);

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

    const selectedGroup = authList?.find((o: AuthItem) => String(o.key) === selectedKey);

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
      setActiveButton("all");

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

  const tabsAccessHandler = () => {
    setShowRoleSelect(true);
    setSelectedRole(null);
    setRoleId(null);

    setSelectedButton("tabsAccess");
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

  const dischargeProcessMappingHandler = () => {
    setShowRoleSelect(false);
    setSelectedRole(null);
    setRoleId(null);

    setSelectedButton("dischargeProcessMapping");
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
    setActiveButton("all");

    setFilteredData(roleData || []);
  };

  // remaining handler
  const remainingHandler = () => {
    setActiveButton("remaining");
    const remaining = roleData?.filter(r => r?.isGranted === 0) || [];
    setFilteredData(remaining);
  };

  // granted
  const grantedHandler = () => {
    setActiveButton("granted");

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
    if (!resp?.result) {
      showError(error?.message);
      return;
    }
    showSuccess(resp?.message);
  };

  /* render components */
  const renderTableData = (buttonType: string) => {
    switch (buttonType) {
      case "roles": {
        return (
          <div className=" card">
            {/* HEADER */}
            <div className="flex justify-between flex-wrap -mt-3">
              <div className="flex">
                <button
                  className={`table-header-button ${activeButton === "all" ? "save-btn " : "cursor-pointer"}`}
                  onClick={filterAllHandler}
                >
                  All
                </button>
                <button
                  className={`table-header-button ${activeButton === "remaining" ? "save-btn " : "cursor-pointer"}`}
                  onClick={remainingHandler}
                >
                  Remaining
                </button>

                <button
                  className={`table-header-button ${activeButton === "granted" ? "save-btn" : "cursor-pointer"}`}
                  onClick={grantedHandler}
                >
                  Granted
                </button>
              </div>

              <button className="table-header-button save-btn " onClick={saveRoleMappingHandler}>
                Save
              </button>
            </div>

            {/* TABLE */}
            <div className="table-wrapper">
              <table className="data-table">
                <thead className="table-header">
                  <tr>
                    <th className="table-index-header">#</th>

                    <th className="table-name-header">
                      <div className="table-header-content">
                        <span className="table-title">Role Name</span>

                        <input
                          className="table-search-input"
                          placeholder="search role name"
                          onChange={onSearchHandler}
                        />
                      </div>
                    </th>

                    <th className="table-action-header">
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
                      <tr
                        key={item.roleId}
                        className="table-row"
                        onClick={() => toggleSingleHandler(item?.roleId)}
                      >
                        <td className="table-cell">{idx + 1}</td>

                        <td className="table-cell">
                          <span
                            className={`status-badge ${
                              item?.isGranted === 1 ? "status-success" : "status-inactive"
                            }`}
                          >
                            {item.roleName}
                          </span>
                        </td>

                        <td className="table-action-cell">
                          <div onClick={e => e.stopPropagation()}>
                            <ToggleButton
                              checked={item?.isGranted === 1}
                              onClick={() => toggleSingleHandler(item?.roleId)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="table-empty">
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
      case "tabsAccess": {
        return <TabAccess branchId={branchId} typeId={typeId} userId={userId} roleId={roleId} />;
      }
      case "corporateMapping": {
        return <CorporateMapping branchId={branchId} typeId={typeId} userId={userId} />;
      }
      case "roomMapping": {
        return <RoomMapping branchId={branchId} typeId={typeId} userId={userId} />;
      }
      case "dischargeProcessMapping": {
        return <DischargeProcessMapping branchId={branchId} typeId={typeId} userId={userId} />;
      }
      default:
        return;
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-heading">User Authorization</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>User Authorization</span>
      </nav>
      <div className="card">
        <div className="form-grid-4">
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
              styles={SelectStyles}
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
                onChange={(option: any) => roleSelectHandler(option)}
                styles={SelectStyles}
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
          <div className="flex  ">
            <button
              className={`table-header-button ${selectedButton === "roles" ? "save-btn" : "cursor-pointer"}`}
              onClick={roleButtonHandler}
            >
              Roles
            </button>

            <button
              className={`table-header-button ${selectedButton === "userRights" ? "save-btn" : "cursor-pointer"}`}
              onClick={userRightsButtonHandler}
            >
              User Rights
            </button>

            <button
              className={`table-header-button ${
                selectedButton === "userDashboard" ? "save-btn" : "cursor-pointer"
              }`}
              onClick={userDashboardHandler}
            >
              User Dashboard
            </button>

            <button
              className={`table-header-button ${selectedButton === "pageAccess" ? "save-btn" : "cursor-pointer"}`}
              onClick={pageAccessHandler}
            >
              Page Access
            </button>

            <button
              className={`table-header-button ${selectedButton === "tabsAccess" ? "save-btn" : "cursor-pointer"}`}
              onClick={tabsAccessHandler}
            >
              All Tabs
            </button>

            <button
              className={`table-header-button ${
                selectedButton === "corporateMapping" ? "save-btn" : "cursor-pointer"
              }`}
              onClick={corporateMappingHandler}
            >
              Corporate Mapping
            </button>

            <button
              className={`table-header-button ${
                selectedButton === "roomMapping" ? "save-btn" : "cursor-pointer"
              }`}
              onClick={roomMappingHandler}
            >
              Room Mapping
            </button>

            {/* dischargeProcessMapping */}
            <button
              className={`table-header-button ${
                selectedButton === "dischargeProcessMapping" ? "save-btn" : "cursor-pointer"
              }`}
              onClick={dischargeProcessMappingHandler}
            >
              Discharge Process Mapping
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
