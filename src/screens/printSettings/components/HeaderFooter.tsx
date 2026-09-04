import TextEditor from "@/components/ckEditor";
import InputField from "@/components/customInputField";
import { SelectStyles } from "@/components/customSelect";
import { ENDPOINTS } from "@/config/defaults";
import { Status } from "@/constants/constants";
import useGetBranchList from "@/hooks/useGetBranchList";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { headerFooterSchema } from "@/validation/printSettingSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import DOMPurify from "dompurify";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import Select from "react-select";
import { InferType } from "yup";

import CustomLoader from "@/components/customLoader";
import { showSuccess, showWarning } from "@/utils/alert";
import { BranchItem, ReportItem, RoleItem, SelectItem, VariableNameItem } from "../types";
type HeaderFooterFormItem = InferType<typeof headerFooterSchema>;

const HeaderFooter = () => {
  const { loading, fetchApi } = useGlobalApi();
  const [content, setContent] = useState<string>("");
  const [defaultBranch, setDefaultBranch] = useState<BranchItem | undefined>();
  const [selectedRole, setSelectedRole] = useState<SelectItem | null>(null);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [selectedVariable, setSelectedVariable] = useState<string>("");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(headerFooterSchema),
    defaultValues: {
      headerId: 0,
      roleId: 0,
      branchId: defaultBranch?.branchId,
      typeId: 0,
      type: "",
      isHeader: 1,
      headerBody: "",
      isActive: 1,
    },
  });

  const branchId = watch("branchId");
  const roleId = watch("roleId");
  const typeId = watch("typeId");
  const isHeader = watch("isHeader");
  const isBody = watch("headerBody");
  const isEdit = Boolean(isBody);
  const buttonTitle = isEdit ? "Update" : "Create";

  // branches
  const branchValues = useGetBranchList();
  const branches = useMemo<BranchItem[]>(
    () => branchValues?.branchList?.data ?? [],
    [branchValues]
  );

  useEffect(() => {
    const selected = branches.find(b => b?.branchId === 1);
    setValue("branchId", selected?.branchId);
    setDefaultBranch(selected);
  }, [branches]);

  // header report types
  const headerReportType = usePickMaster("headerReportType");

  const reportType = useMemo<ReportItem[]>(
    () => headerReportType?.pickMasterValue ?? [],
    [headerReportType]
  );

  const reportTypeByKey = useMemo(() => {
    const map = new Map<number, ReportItem>();
    for (const item of reportType) {
      const key = Number(item.key);
      if (!Number.isNaN(key)) map.set(key, item);
    }
    return map;
  }, [reportType]);

  const resolveTypeName = useCallback(
    (id: number | null | undefined) => reportTypeByKey.get(Number(id))?.value ?? "",
    [reportTypeByKey]
  );

  const syncTypeFields = useCallback(
    (id: number, options?: { shouldDirty?: boolean; shouldTouch?: boolean }) => {
      setValue("typeId", id, {
        shouldValidate: true,
        shouldDirty: options?.shouldDirty ?? true,
        shouldTouch: options?.shouldTouch ?? true,
      });
      setValue("type", resolveTypeName(id), {
        shouldValidate: true,
        shouldDirty: options?.shouldDirty ?? true,
      });
    },
    [resolveTypeName, setValue]
  );

  const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    syncTypeFields(Number(e.target.value));
  };

  useEffect(() => {
    if (!typeId) return;
    const typeName = resolveTypeName(typeId);
    if (typeName) {
      setValue("type", typeName, { shouldDirty: false });
    }
  }, [typeId, resolveTypeName, setValue]);

  //  get roles
  const getRoles = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.ROLE_MASTER_LIST,
      {},
      {},
      { component: "HeaderFooter" }
    );
    const activeRoles = resp?.data?.filter((r: RoleItem) => r.isActive === Status.ACTIVE) ?? [];
    setRoles(activeRoles);
  };

  useEffect(() => {
    getRoles();
  }, []);

  const defaultRoleOption = {
    label: "Default",
    value: 0,
  };

  const roleSelectOption = useMemo(
    () => [
      defaultRoleOption,
      ...(roles?.map(r => ({
        label: r?.roleName,
        value: r?.roleId,
      })) ?? []),
    ],
    [roles]
  );

  useEffect(() => {
    setSelectedRole(defaultRoleOption);

    setValue("roleId", 0, {
      shouldValidate: true,
    });
  }, []);

  const roleChangeHandler = (option: SelectItem | null) => {
    setSelectedRole(option);

    setValue("roleId", option?.value ?? 0, {
      shouldValidate: true,
    });
  };

  //  header variables
  const headerVariables = usePickMaster("headerVariable");

  const variableNames = useMemo<VariableNameItem[]>(
    () => headerVariables?.pickMasterValue ?? [],
    [headerVariables]
  );

  const headerVariableHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedVariable(e.target.value);
  };

  // submit handler
  const onSubmit = async (formData: HeaderFooterFormItem) => {
    const sanitizedHtml = DOMPurify.sanitize(content);

    formData.headerBody = sanitizedHtml;
    formData.type = resolveTypeName(formData.typeId) || formData.type || "";
    if (!branchId || !typeId) return;
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_HEADER_MASTER,
      formData,
      {},
      { component: "HeaderFooter" }
    );
    if (!resp?.result) {
      setContent("");
      showWarning(resp?.message ?? "Something went wrong");
      return;
    }
    if (resp?.result) {
      showSuccess(resp?.message ?? "Data saved successfully");
      reset({
        headerId: 0,
        roleId: 0,
        branchId: defaultBranch?.branchId ?? 1,
        typeId: 0,
        type: "",
        isHeader: 1,
        headerBody: "",
        isActive: 1,
      });
      // reset selected role
      setSelectedRole(defaultRoleOption);

      // reset form role value
      setValue("roleId", 0);
      await getHeaderMaster?.();
    }
  };

  /* -------------------- pre filled data -------------------- */

  const getHeaderMaster = async () => {
    if (!branchId || !typeId) return;

    const response = await fetchApi(
      "GET",
      ENDPOINTS.GET_HEADER_MASTER,
      {},
      {
        params: {
          branchId,
          roleId,
          typeId,
          isHeader,
        },
      },
      { component: "HeaderFooter" }
    );

    const data = response?.data?.[0];

    const resolvedType = resolveTypeName(typeId) || data?.type || "";

    if (!data) {
      setContent("");
      reset({
        headerId: 0,
        roleId: roleId ?? 0,
        branchId: branchId ?? 0,
        typeId: typeId ?? 0,
        type: resolvedType,
        isHeader: isHeader ?? 1,
        headerBody: "",
        isActive: Status.ACTIVE,
      });

      return;
    }

    setContent(data.headerBody);
    reset({
      headerId: data.headerId,
      roleId: roleId ?? 0,
      branchId: branchId ?? 0,
      typeId: typeId ?? 0,
      type: resolvedType,
      isHeader: isHeader ?? 1,
      headerBody: data.headerBody,
      isActive: data.isActive,
    });
  };

  useEffect(() => {
    getHeaderMaster();
  }, [branchId, roleId, typeId, isHeader]);

  /*----------------cancel handler--------------- */
  const cancelHandler = () => {
    reset({
      headerId: 0,
      roleId: 0,
      branchId: defaultBranch?.branchId ?? 1,
      typeId: 0,
      type: "",
      isHeader: 1,
      headerBody: "",
      isActive: 1,
    });

    setSelectedRole(null);
    setContent("");
    setSelectedVariable("");
  };

  const valueChangeHandler = (value: string) => {
    setContent(value);

    setValue("headerBody", value, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <div className="-mt-3">
      <div className="card ">
        <h2 className="card-title ">Header Footer Details</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid-4">
            <InputField label="Branch" required>
              <select className="input-field" {...register("branchId", { valueAsNumber: true })}>
                <option value={0}>Default</option>
                {branches.map(b => (
                  <option key={b.branchId} value={b.branchId}>
                    {b.branchName}
                  </option>
                ))}
              </select>
              {errors.branchId && <p className="input-field-error">{errors.branchId.message}</p>}
            </InputField>

            <InputField label="Header Type" required>
              <select className="input-field" value={typeId ?? 0} onChange={handleTypeChange}>
                <option value={0}>Select</option>
                {reportType.map(h => (
                  <option key={h.id} value={h.key}>
                    {h.value}
                  </option>
                ))}
              </select>
              {errors.typeId && <p className="input-field-error">{errors.typeId.message}</p>}
            </InputField>

            <InputField label="Role">
              <Select
                value={selectedRole}
                options={roleSelectOption}
                placeholder="Select..."
                isSearchable
                isClearable
                onChange={(option: any) => roleChangeHandler(option)}
                styles={SelectStyles}
                menuPortalTarget={document?.body}
                menuPosition="fixed"
              />
            </InputField>

            <InputField label=" Type" required>
              <select className="input-field" {...register("isHeader", { valueAsNumber: true })}>
                <option value={1}>Header</option>
                <option value={0}>Footer</option>
              </select>

              {errors.isHeader && <p className="input-field-error">{errors.isHeader.message}</p>}
            </InputField>

            <InputField label="Status" required>
              <select
                className="input-field"
                required
                {...register("isActive", { valueAsNumber: true })}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
              {errors.isActive && <p className="input-field-error">{errors.isActive.message}</p>}
            </InputField>

            <InputField label="Header Variable" required>
              <select className="input-field" onChange={headerVariableHandler}>
                <option value="">Select</option>
                {variableNames.map(v => (
                  <option key={v?.id} value={v?.key}>
                    {v?.value}
                  </option>
                ))}
              </select>
            </InputField>

            <InputField label="Variable Place Holder" required>
              <input type="text" value={selectedVariable} className="input-field" />
            </InputField>
          </div>
          <div>
            <TextEditor value={content} onChange={valueChangeHandler} />
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
      {loading ? <CustomLoader isLoading={loading} /> : <></>}
    </div>
  );
};

export default HeaderFooter;
