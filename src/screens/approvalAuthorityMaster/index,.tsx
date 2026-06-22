import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { OptionItem, SelectStyles } from "@/components/customSelect";
import MultiCheckboxOption from "@/components/multiSelectCheckBox";
import ToggleButton from "@/components/toggleButton";
import { ENDPOINTS } from "@/config/defaults";
import { ApprovalAuthorityMasterTableHeader } from "@/constants/tableHeaders";
import { AuthContext } from "@/context/AuthContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { PickMasterItem, RoleItem, SelectItem, UserItem } from "@/types";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { allowOnlyNumbers } from "@/utils/inputValidationHandler";
import {
  AMOUNT_REQUIRED_APPROVAL_TYPE_IDS,
  ApprovalAuthorityMasterFormItem,
  approvalAuthorityMasterSchema,
} from "@/validation/approvalAuthorityMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, useContext, useMemo, useState } from "react";
import { Resolver, useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
import Select, { GroupBase, MultiValue, SingleValue, StylesConfig } from "react-select";
import { ApprovalTableItem, LevelVisibility } from "./types";

const APPROVAL_FLOW_OPTIONS: OptionItem[] = [
  { value: 1, label: "Sequential" },
  { value: 2, label: "Parallel" },
];

const EMPTY_LEVEL_VISIBILITY: LevelVisibility = {
  level1: false,
  level2: false,
  level3: false,
  level4: false,
};

const getDefaultFormValues = (branchId: number): ApprovalAuthorityMasterFormItem => ({
  id: 0,
  branchId,
  approvalFlowId: 1,
  approvalFlow: "Sequential",
  isAllApprovalRequired: 1,
  approvalTypeId: 0,
  approvalType: "",
  roleId: 0,
  approvalLevelId: 0,
  approvalLevel: "",
  level1UserId: "",
  level2UserId: "",
  level3UserId: "",
  level4UserId: "",
  isActive: 1,
});

const getLevelVisibility = (approvalLevelId: number): LevelVisibility => {
  switch (Number(approvalLevelId)) {
    case 1:
      return { level1: true, level2: false, level3: false, level4: false };
    case 2:
      return { level1: true, level2: true, level3: false, level4: false };
    case 3:
      return { level1: true, level2: true, level3: true, level4: false };
    case 4:
      return { level1: true, level2: true, level3: true, level4: true };
    default:
      return EMPTY_LEVEL_VISIBILITY;
  }
};

const parseUserIds = (value?: string | null): number[] => {
  if (!value) return [];
  return value
    .split(",")
    .map(item => Number(item.trim()))
    .filter(id => id > 0);
};

const mapUserIdsToOptions = (userIds: number[], options: SelectItem[]): SelectItem[] => {
  return userIds
    .map(id => options.find(option => Number(option.value) === id))
    .filter((option): option is SelectItem => Boolean(option));
};

const ApprovalAuthorityMaster = () => {
  const { loading, fetchApi } = useGlobalApi();
  const queryClient = useQueryClient();
  const branchId = Number(useContext(AuthContext)?.user?.branchId ?? 1);

  const approvalTypeList = usePickMaster("AuthorityApprovalType")?.pickMasterValue ?? [];
  const authorityApprovalLevelList = usePickMaster("AuthorityApprovalLevel")?.pickMasterValue ?? [];

  const [approvalTypeId, setApprovalTypeId] = useState<number>(0);
  const [selectLevel, setSelectedLevel] = useState<LevelVisibility>(EMPTY_LEVEL_VISIBILITY);

  const [selectedApprovalType, setSelectedApprovalType] = useState<SingleValue<OptionItem> | null>(
    null
  );
  const [selectedDepartment, setSelectedDepartment] = useState<SingleValue<OptionItem> | null>({
    value: 0,
    label: "All",
  });
  const [selectedApprovalLevel, setSelectedApprovalLevel] =
    useState<SingleValue<OptionItem> | null>(null);
  const [selectedApprovalFlow, setSelectedApprovalFlow] = useState<SingleValue<OptionItem> | null>(
    APPROVAL_FLOW_OPTIONS[0]
  );

  const [selectedLevel1Users, setSelectedLevel1Users] = useState<SelectItem[]>([]);
  const [selectedLevel2Users, setSelectedLevel2Users] = useState<SelectItem[]>([]);
  const [selectedLevel3Users, setSelectedLevel3Users] = useState<SelectItem[]>([]);
  const [selectedLevel4Users, setSelectedLevel4Users] = useState<SelectItem[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    clearErrors,
    trigger,
    formState: { errors },
  } = useForm<ApprovalAuthorityMasterFormItem>({
    resolver: yupResolver(
      approvalAuthorityMasterSchema
    ) as Resolver<ApprovalAuthorityMasterFormItem>,
    defaultValues: getDefaultFormValues(branchId),
    mode: "onChange",
  });

  const watchedApprovalTypeId = Number(watch("approvalTypeId") ?? 0);
  const watchedAmountUpTo = watch("amountUpTo");
  const isEdit = Boolean(watch("id"));
  const buttonTitle = isEdit ? "Update" : "Create";
  const showAmountUpTo = AMOUNT_REQUIRED_APPROVAL_TYPE_IDS.includes(watchedApprovalTypeId);

  const approvalTypeOptions = useMemo<OptionItem[]>(
    () =>
      approvalTypeList.map((item: PickMasterItem) => ({
        value: Number(item.key),
        label: item.value,
      })),
    [approvalTypeList]
  );

  const approvalLevelOptions = useMemo<OptionItem[]>(
    () =>
      authorityApprovalLevelList.map((item: PickMasterItem) => ({
        value: Number(item.key),
        label: item.value,
      })),
    [authorityApprovalLevelList]
  );

  const getAuthorityTableList = async (typeId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_APPROVAL_AUTHORITY_MASTER_LIST,
      {},
      { params: { approvalTypeId: typeId } },
      { component: "ApprovalAuthorityMaster" }
    );

    return resp?.data ?? [];
  };

  const { data: authorityTableList = [], refetch: refetchAuthorityLists } = useQuery({
    queryKey: ["getAuthorityTableList", approvalTypeId],
    queryFn: () => getAuthorityTableList(approvalTypeId),
    enabled: approvalTypeId > 0,
  });

  const getRoleLists = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.ROLE_MASTER_LIST,
      {},
      {},
      { component: "ApprovalAuthorityMaster" }
    );
    return resp?.data ?? [];
  };

  const { data: roleLists = [] } = useQuery({
    queryKey: ["getRoleLists"],
    queryFn: getRoleLists,
  });

  const getUsersLists = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.USER_MASTER_LIST,
      {},
      {},
      { component: "ApprovalAuthorityMaster" }
    );
    return resp?.data ?? [];
  };

  const { data: usersList = [] } = useQuery({
    queryKey: ["getUsersLists"],
    queryFn: getUsersLists,
  });

  const departmentOptions = useMemo<OptionItem[]>(
    () => [
      { value: 0, label: "All" },
      ...roleLists.map((role: RoleItem) => ({
        value: role.roleId,
        label: role.roleName,
      })),
    ],
    [roleLists]
  );

  const userOptions = useMemo<SelectItem[]>(
    () =>
      usersList.map((user: UserItem) => ({
        value: user.id,
        label: user.userName,
      })),
    [usersList]
  );

  const invalidateAuthorityList = async () => {
    await queryClient.invalidateQueries({ queryKey: ["getAuthorityTableList"] });
  };

  const resetSelectState = (keepApprovalType = false) => {
    if (!keepApprovalType) {
      setSelectedApprovalType(null);
      setApprovalTypeId(0);
    }

    setSelectedDepartment({ value: 0, label: "All" });
    setSelectedApprovalLevel(null);
    setSelectedApprovalFlow(APPROVAL_FLOW_OPTIONS[0]);
    setSelectedLevel1Users([]);
    setSelectedLevel2Users([]);
    setSelectedLevel3Users([]);
    setSelectedLevel4Users([]);
    setSelectedLevel(EMPTY_LEVEL_VISIBILITY);
  };

  const resetFormKeepApprovalType = () => {
    const currentApprovalType = selectedApprovalType;
    const currentApprovalTypeId = Number(watch("approvalTypeId") ?? approvalTypeId ?? 0);
    const currentApprovalTypeLabel = watch("approvalType") ?? currentApprovalType?.label ?? "";

    reset({
      ...getDefaultFormValues(branchId),
      approvalTypeId: currentApprovalTypeId,
      approvalType: currentApprovalTypeLabel,
    });

    resetSelectState(true);
    setSelectedApprovalType(currentApprovalType);
    setApprovalTypeId(currentApprovalTypeId);

    if (AMOUNT_REQUIRED_APPROVAL_TYPE_IDS.includes(currentApprovalTypeId)) {
      setValue("amountUpTo", undefined, { shouldDirty: false });
      clearErrors("amountUpTo");
    }
  };

  const cancelHandler = () => {
    reset(getDefaultFormValues(branchId));
    resetSelectState();
  };

  const applyApprovalLevel = (approvalLevelId: number, approvalLevelLabel = "") => {
    setSelectedLevel(getLevelVisibility(approvalLevelId));
    setValue("approvalLevelId", approvalLevelId, { shouldValidate: true, shouldDirty: true });
    setValue("approvalLevel", approvalLevelLabel, { shouldDirty: true });
    clearErrors("approvalLevelId");
  };

  const approvalTypeSelectHandler = (option: SingleValue<OptionItem>) => {
    setSelectedApprovalType(option);
    const value = Number(option?.value ?? 0);
    setValue("approvalTypeId", value, { shouldValidate: true, shouldDirty: true });
    setValue("approvalType", option?.label ?? "", { shouldDirty: true });
    setApprovalTypeId(value);
    clearErrors("approvalTypeId");

    if (!AMOUNT_REQUIRED_APPROVAL_TYPE_IDS.includes(value)) {
      setValue("amountUpTo", undefined, { shouldDirty: true });
      clearErrors("amountUpTo");
    } else {
      setValue("amountUpTo", undefined, { shouldDirty: true });
      void trigger("amountUpTo");
    }
  };

  const departmentSelectHandler = (option: SingleValue<OptionItem>) => {
    const selected = option ?? { value: 0, label: "All" };
    setSelectedDepartment(selected);
    setValue("roleId", Number(selected.value ?? 0), { shouldValidate: true, shouldDirty: true });
    clearErrors("roleId");
  };

  const approvalLevelSelectHandler = (option: SingleValue<OptionItem>) => {
    setSelectedApprovalLevel(option);
    const value = Number(option?.value ?? 0);
    applyApprovalLevel(value, option?.label ?? "");

    if (value < 2) {
      setSelectedLevel2Users([]);
      setValue("level2UserId", "", { shouldDirty: true });
    }
    if (value < 3) {
      setSelectedLevel3Users([]);
      setValue("level3UserId", "", { shouldDirty: true });
    }
    if (value < 4) {
      setSelectedLevel4Users([]);
      setValue("level4UserId", "", { shouldDirty: true });
    }
  };

  const approvalFlowSelectHandler = (option: SingleValue<OptionItem>) => {
    if (!option) return;
    setSelectedApprovalFlow(option);
    setValue("approvalFlowId", Number(option.value ?? 0), {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue("approvalFlow", option.label ?? "", { shouldDirty: true });
    clearErrors("approvalFlowId");
  };

  const levelUserSelectHandler = (level: 1 | 2 | 3 | 4, options: MultiValue<SelectItem>) => {
    const selectedOptions = [...(options ?? [])];
    const ids = selectedOptions.map(option => Number(option.value)).join(",");

    if (level === 1) setSelectedLevel1Users(selectedOptions);
    if (level === 2) setSelectedLevel2Users(selectedOptions);
    if (level === 3) setSelectedLevel3Users(selectedOptions);
    if (level === 4) setSelectedLevel4Users(selectedOptions);

    setValue(`level${level}UserId`, ids, { shouldValidate: true, shouldDirty: true });
    clearErrors(`level${level}UserId`);
  };

  const amountUpToChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    e.target.value = value;

    if (value === "") {
      setValue("amountUpTo", undefined, {
        shouldValidate: true,
        shouldDirty: true,
      });
      return;
    }

    setValue("amountUpTo", Number(value), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const onSubmit = async (formData: ApprovalAuthorityMasterFormItem) => {
    const payload = {
      ...formData,
      branchId,
      id: Number(formData.id ?? 0),
      approvalFlowId: Number(formData.approvalFlowId),
      isAllApprovalRequired: Number(formData.isAllApprovalRequired),
      approvalTypeId: Number(formData.approvalTypeId),
      roleId: Number(formData.roleId ?? 0),
      approvalLevelId: Number(formData.approvalLevelId),
      amountUpTo: showAmountUpTo ? Number(formData.amountUpTo) : 0,
      isActive: Number(formData.isActive ?? 1),
      level1UserId: selectLevel.level1 ? (formData.level1UserId ?? "") : "",
      level2UserId: selectLevel.level2 ? (formData.level2UserId ?? "") : "",
      level3UserId: selectLevel.level3 ? (formData.level3UserId ?? "") : "",
      level4UserId: selectLevel.level4 ? (formData.level4UserId ?? "") : "",
    };

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_APPROVAL_AUTHORITY_MASTER,
      payload,
      {},
      { component: "ApprovalAuthorityMaster" }
    );

    if (!resp?.result) {
      showWarning(resp?.message ?? "Failed to save approval authority");
      return;
    }

    showSuccess(resp?.message ?? "Approval authority saved successfully");
    await refetchAuthorityLists();
    resetFormKeepApprovalType();
  };

  const editHandler = (item: ApprovalTableItem) => {
    const approvalTypeOption =
      approvalTypeOptions.find(option => Number(option.value) === item.ApprovalTypeId) ?? null;
    const departmentOption =
      departmentOptions.find(option => Number(option.value) === Number(item.RoleId ?? 0)) ??
      departmentOptions[0];
    const approvalLevelOption =
      approvalLevelOptions.find(option => Number(option.value) === item.ApprovalLevelId) ?? null;
    const approvalFlowOption =
      APPROVAL_FLOW_OPTIONS.find(option => Number(option.value) === item.ApprovalFlowId) ??
      APPROVAL_FLOW_OPTIONS[0];

    const level1Users = mapUserIdsToOptions(parseUserIds(item.Level1UserId), userOptions);
    const level2Users = mapUserIdsToOptions(parseUserIds(item.Level2UserId), userOptions);
    const level3Users = mapUserIdsToOptions(parseUserIds(item.Level3UserId), userOptions);
    const level4Users = mapUserIdsToOptions(parseUserIds(item.Level4UserId), userOptions);

    setSelectedApprovalType(approvalTypeOption);
    setSelectedDepartment(departmentOption);
    setSelectedApprovalLevel(approvalLevelOption);
    setSelectedApprovalFlow(approvalFlowOption);
    setSelectedLevel1Users(level1Users);
    setSelectedLevel2Users(level2Users);
    setSelectedLevel3Users(level3Users);
    setSelectedLevel4Users(level4Users);
    setSelectedLevel(getLevelVisibility(item.ApprovalLevelId));
    setApprovalTypeId(item.ApprovalTypeId);

    reset({
      id: item.Id,
      branchId,
      approvalFlowId: item.ApprovalFlowId,
      approvalFlow: item.ApprovalFlow ?? approvalFlowOption.label ?? "",
      isAllApprovalRequired: item.IsAllApprovalRequired,
      approvalTypeId: item.ApprovalTypeId,
      approvalType: item.ApprovalType ?? approvalTypeOption?.label ?? "",
      roleId: Number(item.RoleId ?? 0),
      approvalLevelId: item.ApprovalLevelId,
      approvalLevel: item.ApprovalLevel ?? approvalLevelOption?.label ?? "",
      level1UserId: item.Level1UserId ?? "",
      level2UserId: item.Level2UserId ?? "",
      level3UserId: item.Level3UserId ?? "",
      level4UserId: item.Level4UserId ?? "",
      amountUpTo: Number(item.AmountUpTo ?? 0),
      isActive: item.IsActive,
    });
  };

  const statusUpdateHandler = async (item: ApprovalTableItem) => {
    const resp = await fetchApi(
      "PATCH",
      ENDPOINTS.UPDATE_APPROVAL_AUTHORITY_MASTER_STATUS,
      {},
      { params: { id: item.Id, isActive: item.IsActive === 1 ? 0 : 1 } },
      { component: "ApprovalAuthorityMaster" }
    );

    if (!resp?.result) {
      showError(resp?.message ?? "Failed to update status");
      return;
    }

    showSuccess(resp?.message ?? "Status updated successfully");
    await invalidateAuthorityList();
  };

  return (
    <div className="page-container">
      <h1 className="page-heading">Authority Approval Master</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Authority Approval Master</span>
      </nav>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid-4">
            <InputField label="Approval Type" required>
              <Select<OptionItem, false>
                value={selectedApprovalType}
                options={approvalTypeOptions}
                placeholder="Select approval type"
                isSearchable
                isClearable
                onChange={approvalTypeSelectHandler}
                styles={SelectStyles as StylesConfig<OptionItem, false>}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
              {errors.approvalTypeId && (
                <p className="input-field-error">{errors.approvalTypeId.message}</p>
              )}
            </InputField>

            <InputField label="Department" required>
              <Select<OptionItem, false>
                value={selectedDepartment}
                options={departmentOptions}
                placeholder="Select department"
                isSearchable
                isClearable
                onChange={departmentSelectHandler}
                styles={SelectStyles as StylesConfig<OptionItem, false>}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
              {errors.roleId && <p className="input-field-error">{errors.roleId.message}</p>}
            </InputField>

            <InputField label="Approval Level" required>
              <Select<OptionItem, false>
                value={selectedApprovalLevel}
                options={approvalLevelOptions}
                placeholder="Select approval level"
                isSearchable
                isClearable
                onChange={approvalLevelSelectHandler}
                styles={SelectStyles as StylesConfig<OptionItem, false>}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
              {errors.approvalLevelId && (
                <p className="input-field-error">{errors.approvalLevelId.message}</p>
              )}
            </InputField>

            {selectLevel.level1 && (
              <InputField label="Level 1 User" required>
                <Select<SelectItem, true, GroupBase<SelectItem>>
                  value={selectedLevel1Users}
                  options={userOptions}
                  placeholder="Select level 1 users"
                  isMulti
                  isSearchable
                  isClearable
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                  onChange={options => levelUserSelectHandler(1, options)}
                  components={{ Option: MultiCheckboxOption }}
                  styles={SelectStyles as StylesConfig<SelectItem, true, GroupBase<SelectItem>>}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
                {errors.level1UserId && (
                  <p className="input-field-error">{errors.level1UserId.message}</p>
                )}
              </InputField>
            )}

            {selectLevel.level2 && (
              <InputField label="Level 2 User" required>
                <Select<SelectItem, true, GroupBase<SelectItem>>
                  value={selectedLevel2Users}
                  options={userOptions}
                  placeholder="Select level 2 users"
                  isMulti
                  isSearchable
                  isClearable
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                  onChange={options => levelUserSelectHandler(2, options)}
                  components={{ Option: MultiCheckboxOption }}
                  styles={SelectStyles as StylesConfig<SelectItem, true, GroupBase<SelectItem>>}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
                {errors.level2UserId && (
                  <p className="input-field-error">{errors.level2UserId.message}</p>
                )}
              </InputField>
            )}

            {selectLevel.level3 && (
              <InputField label="Level 3 User" required>
                <Select<SelectItem, true, GroupBase<SelectItem>>
                  value={selectedLevel3Users}
                  options={userOptions}
                  placeholder="Select level 3 users"
                  isMulti
                  isSearchable
                  isClearable
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                  onChange={options => levelUserSelectHandler(3, options)}
                  components={{ Option: MultiCheckboxOption }}
                  styles={SelectStyles as StylesConfig<SelectItem, true, GroupBase<SelectItem>>}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
                {errors.level3UserId && (
                  <p className="input-field-error">{errors.level3UserId.message}</p>
                )}
              </InputField>
            )}

            {selectLevel.level4 && (
              <InputField label="Level 4 User" required>
                <Select<SelectItem, true, GroupBase<SelectItem>>
                  value={selectedLevel4Users}
                  options={userOptions}
                  placeholder="Select level 4 users"
                  isMulti
                  isSearchable
                  isClearable
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                  onChange={options => levelUserSelectHandler(4, options)}
                  components={{ Option: MultiCheckboxOption }}
                  styles={SelectStyles as StylesConfig<SelectItem, true, GroupBase<SelectItem>>}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
                {errors.level4UserId && (
                  <p className="input-field-error">{errors.level4UserId.message}</p>
                )}
              </InputField>
            )}

            <InputField label="Approval Flow" required>
              <Select<OptionItem, false>
                value={selectedApprovalFlow}
                options={APPROVAL_FLOW_OPTIONS}
                placeholder="Select approval flow"
                isSearchable
                isClearable={false}
                onChange={approvalFlowSelectHandler}
                styles={SelectStyles as StylesConfig<OptionItem, false>}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
              {errors.approvalFlowId && (
                <p className="input-field-error">{errors.approvalFlowId.message}</p>
              )}
            </InputField>

            <InputField label="Is All Approval Required" required>
              <select className="input-field" {...register("isAllApprovalRequired")}>
                <option value={1}>Yes</option>
                <option value={0}>No</option>
              </select>
              {errors.isAllApprovalRequired && (
                <p className="input-field-error">{errors.isAllApprovalRequired.message}</p>
              )}
            </InputField>

            {showAmountUpTo && (
              <InputField label="Amount up to" required>
                <input
                  className="input-field"
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter amount up to"
                  value={watchedAmountUpTo != null ? String(watchedAmountUpTo) : ""}
                  onChange={amountUpToChangeHandler}
                  onBlur={() => void trigger("amountUpTo")}
                  onInput={allowOnlyNumbers}
                />
                {errors.amountUpTo && (
                  <p className="input-field-error">{errors.amountUpTo.message}</p>
                )}
              </InputField>
            )}

            <InputField label="Status" required>
              <select className="input-field" {...register("isActive")}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
              {errors.isActive && <p className="input-field-error">{errors.isActive.message}</p>}
            </InputField>
          </div>

          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn">
              {buttonTitle}
            </button>
            <button type="button" className="cancel-button" onClick={cancelHandler}>
              Cancel
            </button>
          </div>
        </form>
      </div>

      {approvalTypeId > 0 && (
        <div className="table-container mt-1">
          <div className="table-scroll-wrapper">
            <div className="table-size lg:min-h-97 lg:max-h-110">
              <table className="base-table">
                <thead className="table-head">
                  <tr>
                    {ApprovalAuthorityMasterTableHeader.map((header, index) => (
                      <th key={index} className="table-th">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {authorityTableList.length === 0 ? (
                    <tr>
                      <td
                        colSpan={ApprovalAuthorityMasterTableHeader.length}
                        className="table-empty"
                      >
                        No records found
                      </td>
                    </tr>
                  ) : (
                    authorityTableList.map((item: ApprovalTableItem, idx: number) => (
                      <tr key={item.Id} className="table-row">
                        <td className="table-td">{idx + 1}</td>
                        <td className="table-td">{item?.ApprovalType ?? "-"}</td>
                        <td className="table-td">{item?.RoleName ?? "-"}</td>
                        <td className="table-td">{item?.Level1UserName ?? "-"}</td>
                        <td className="table-td">{item?.Level2UserName ?? "-"}</td>
                        <td className="table-td">{item?.Level3UserName ?? "-"}</td>
                        <td className="table-td">{item?.Level4UserName ?? "-"}</td>
                        <td className="table-td">{item?.ApprovalFlow ?? "-"}</td>

                        <td
                          className={`table-td ${
                            Number(item.IsAllApprovalRequired) === 1
                              ? "active-text"
                              : "inactive-text"
                          }`}
                        >
                          {Number(item.IsAllApprovalRequired) === 1 ? "Yes" : "No"}
                        </td>
                        <td className="table-td">{item?.AmountUpTo ?? "-"}</td>
                        <td className="table-td">
                          <button type="button" onClick={() => editHandler(item)}>
                            <i className="fa-solid fa-edit icon-color-button" />
                          </button>
                        </td>
                        <td className="table-td">
                          <div onClick={e => e.stopPropagation()}>
                            <ToggleButton
                              checked={item.IsActive === 1}
                              onClick={() => statusUpdateHandler(item)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default ApprovalAuthorityMaster;
