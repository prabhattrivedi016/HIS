import Animation from "@/components/animation";
import CustomLoader from "@/components/customLoader";
import { sequenceMappingSchema } from "@/validation/printSettingSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { Minus, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import Select from "react-select";
import { InferType } from "yup";
import InputField from "../../../components/customInputField";
import { SelectStyles } from "../../../components/customSelect";
import { ENDPOINTS } from "../../../config/defaults";
import { sequenceBranchMasterHeader, Status } from "../../../constants/constants";
import useGetBranchList from "../../../hooks/useGetBranchList";
import useGlobalApi from "../../../hooks/useGlobalApi";
import {
  RoleItem,
  SelectItem,
  SequenceDropDownItem,
  SequenceEditItem,
  SequenceMappingItem,
  SequenceTypeItem,
} from "../types";
import SequenceDrawer from "./SequenceDrawer";
type SequenceMappingFormItem = InferType<typeof sequenceMappingSchema>;

const SequenceMapping = () => {
  const { loading, fetchApi } = useGlobalApi();

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(sequenceMappingSchema),
    defaultValues: {
      mappingId: 0,
      branchId: 0,
      roleId: 0,
      typeId: 0,
      sequenceId: 0,
    },
  });
  const mappingId = watch("mappingId");
  const isEditMode = Boolean(mappingId && mappingId > 0);

  const buttonTitle = isEditMode ? "Update" : "Create";

  const [typeId, setTypeId] = useState<number | null>(null);
  const [typeName, setTypeName] = useState<string>("");

  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [selectedRole, setSelectedRole] = useState<SelectItem | null>(null);
  const [selectedSequenceType, setSelectedSequenceType] = useState<SelectItem | null>(null);
  const [sequenceTypeList, setSequenceTypeList] = useState<SequenceTypeItem[]>([]);
  const [sequenceDropDown, setSequenceDropDown] = useState<SequenceDropDownItem[]>([]);
  const [sequenceMapping, setSequenceMapping] = useState<SequenceMappingItem[]>([]);

  const [sequenceToEdit, setSequenceToEdit] = useState<SequenceEditItem | null>(null);

  const [successMessage, setSuccessMessage] = useState<string>("");

  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [typeError, setTypeError] = useState<string>("");

  /*----------------------branch lists------------------------ */
  const branchList = useGetBranchList();

  const branches = useMemo(() => branchList?.branchList?.data, [branchList]);

  /*-------------------roles------------------------ */
  const getRoles = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.ROLE_MASTER_LIST,
      {},
      {},
      { component: "SequenceMapping" }
    );

    const activeRoles = resp?.data?.filter((r: RoleItem) => r.isActive === Status.ACTIVE) ?? [];

    setRoles(activeRoles);
  };

  const roleSelectOption = useMemo(
    () => [
      { label: "Default", value: 0 },
      ...(roles?.map(r => ({
        label: r?.roleName,
        value: r?.roleId,
      })) ?? []),
    ],
    [roles]
  );

  const roleSelectHandler = (option: SelectItem | null) => {
    setSelectedRole(option);

    setValue("roleId", option?.value ?? 0, {
      shouldValidate: true,
    });
  };

  /*----------------------------sequence type------------------------------ */
  const getSequenceType = useCallback(async () => {
    const resp = await fetchApi("GET", ENDPOINTS.GET_SEQUENCE_TYPE_LIST, {}, {});

    setSequenceTypeList(resp?.data ?? []);
  }, []);

  const selectSequenceOption = useMemo(
    () =>
      sequenceTypeList?.map(s => ({
        value: s?.typeId,
        label: s?.typeName,
      })),
    [sequenceTypeList]
  );

  const sequenceTypeChangeHandler = (option: SelectItem | null) => {
    setSelectedSequenceType(option);

    setValue("typeId", option?.value ?? 0, {
      shouldValidate: true,
    });

    setTypeName(option?.label ?? "");
    setTypeId(option?.value ?? null);
  };

  /*-------------------------sequence master--------------- */
  const fetchSequenceMaster = useCallback(async (id: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SEQUENCE_MASTER,
      {},
      {
        params: { sequenceTypeId: id },
      },
      { component: "SequenceMaster" }
    );

    setSequenceDropDown(resp?.data ?? []);
  }, []);

  /*-----------------------------submit handler------------------------- */

  const onSubmit = async (formData: SequenceMappingFormItem) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_BRANCH_SEQUENCE_MAPPING,
      formData,
      {},
      { component: "SequenceMapping" }
    );

    if (resp?.result) {
      setSuccessMessage(resp.message || "Saved successfully");

      reset({
        mappingId: 0,
        branchId: 0,
        roleId: 0,
        typeId: 0,
        sequenceId: 0,
      });

      setSelectedRole(null);
      setSelectedSequenceType(null);

      await getBranchSequence();
    }
  };

  const tablePopupHandler = () => {
    setShowDetails(p => !p);
  };
  /*---------------------get all branch sequence------------------------ */

  const getBranchSequence = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_BRANCH_SEQUENCE_MAPPING,
      {},
      {},
      { component: "SequenceMapping" }
    );
    setSequenceMapping(resp?.data ?? []);
  };

  useEffect(() => {
    if (showDetails) {
      getBranchSequence();
    }
  }, [showDetails]);

  const handleAddSequence = () => {
    if (!typeId) {
      setTypeError("Please select sequence type first");
      return;
    }
    const currentSequenceId = watch("sequenceId");

    const edit = sequenceDropDown.find(s => s?.sequenceId === currentSequenceId) ?? {};

    if (currentSequenceId) {
      setSequenceToEdit({
        ...edit,
        typeId,
        typeName,
      });
    } else {
      setSequenceToEdit({
        typeId,
        typeName,
      });
    }

    setTypeError("");

    setOpenDrawer(true);
  };

  const closeHandler = useCallback(() => {
    setOpenDrawer(false);
    setSequenceToEdit(null);
  }, []);

  /*--------------------------edit handler--------------------------- */

  const sequenceEditHandler = async (item: SequenceMappingItem) => {
    if (!item) return;

    const roleOption = roleSelectOption.find(opt => opt.value === item.roleId) || null;
    setSelectedRole(roleOption);

    const typeOption = selectSequenceOption.find(opt => opt.value === item.typeId) || null;
    setSelectedSequenceType(typeOption);

    setTypeId(item.typeId);
    setTypeName(typeOption?.label ?? "");

    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SEQUENCE_MASTER,
      {},
      { params: { sequenceTypeId: item.typeId } },
      { component: "SequenceMaster" }
    );

    setSequenceDropDown(resp?.data ?? []);

    reset({
      mappingId: item.mappingId ?? 0,
      branchId: item.branchId ?? 0,
      roleId: item.roleId ?? 0,
      typeId: item.typeId ?? 0,
      sequenceId: item.sequenceId ?? 0,
    });
  };

  useEffect(() => {
    getRoles();
    getSequenceType();
  }, []);

  useEffect(() => {
    if (typeId) {
      fetchSequenceMaster(typeId);
    }
  }, [typeId, fetchSequenceMaster]);

  /*-------------------reset values-------------------- */

  const resetSequenceSelection = () => {
    setValue("sequenceId", 0);
  };
  const resetSequenceType = () => {
    setSelectedSequenceType(null);
  };

  /*---------------------cancel handler------------------- */
  const cancelHandler = () => {
    reset({
      mappingId: 0,
      branchId: 0,
      roleId: 0,
      typeId: 0,
      sequenceId: 0,
    });

    setSelectedRole(null);
    setSelectedSequenceType(null);
    setTypeId(null);
    setTypeName("");
    setSequenceDropDown([]);
  };

  return (
    <div className="-mt-3">
      <div className="card mb-1">
        <h2 className="card-title ">Sequence Mapping</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid-4">
            <InputField label="Branch" required>
              <select className="input-field" {...register("branchId", { valueAsNumber: true })}>
                <option value={0}>Default</option>
                {branches?.map(b => (
                  <option key={b?.branchId} value={b?.branchId}>
                    {b?.branchName}
                  </option>
                ))}
              </select>
              {errors.branchId && <p className="input-field-error">{errors.branchId.message}</p>}
            </InputField>

            <InputField label="Role" required={false}>
              <Select
                value={selectedRole}
                options={roleSelectOption}
                placeholder="Select role"
                isSearchable
                isClearable
                onChange={(option: any) => roleSelectHandler(option)}
                styles={SelectStyles}
                menuPortalTarget={document?.body}
                menuPosition="fixed"
              />
              {errors.roleId && <p className="input-field-error">{errors.roleId.message}</p>}
            </InputField>

            <InputField label="Sequence Type" required={false}>
              <Select
                value={selectedSequenceType}
                options={selectSequenceOption}
                placeholder="Select sequence type"
                isSearchable
                isClearable
                onChange={(option: any) => sequenceTypeChangeHandler(option)}
                styles={SelectStyles}
                menuPortalTarget={document?.body}
                menuPosition="fixed"
              />
              {errors.typeId && <p className="input-field-error">{errors.typeId.message}</p>}
              {typeError && <p className="input-field-error">{typeError}</p>}
            </InputField>

            <div className="flex flex-row gap-2 items-end w-full">
              <InputField label="Sequence" className="w-full" required={false}>
                <div className="flex items-center gap-2">
                  <select
                    className="input-field"
                    {...register("sequenceId", { valueAsNumber: true })}
                  >
                    <option value="">Select</option>
                    {sequenceDropDown?.map((v: SequenceDropDownItem) => (
                      <option key={v?.typeId} value={v?.sequenceId}>
                        {v?.preview}
                      </option>
                    ))}
                  </select>

                  <button type="button" onClick={handleAddSequence} className="scale-95">
                    <i className="fa-solid fa-circle-plus fa-xl  "></i>
                  </button>
                </div>
                {errors.sequenceId && (
                  <p className="input-field-error">{errors.sequenceId.message}</p>
                )}
                {typeError && (
                  <p className="input-field-error">{"Please select type before button click"}</p>
                )}
              </InputField>
            </div>
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

        {/* -----------------drawer for add & update sequence----------------- */}
        {openDrawer && sequenceToEdit && (
          <SequenceDrawer
            isOpen={openDrawer}
            data={sequenceToEdit}
            onClose={closeHandler}
            handleRefresh={getBranchSequence}
            resetType={resetSequenceType}
            resetSequence={resetSequenceSelection}
          />
        )}
      </div>

      {/* -----------------------table------------------- */}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title ">Sequence Mapping List</h2>

          <button onClick={tablePopupHandler}>
            {showDetails ? <Minus size={30} /> : <Plus size={30} />}
          </button>
        </div>

        <Animation isOpen={showDetails}>
          <div className="table-container ">
            <div className="table-scroll-wrapper">
              <div className="table-size lg:min-h-80 lg:max-h-80">
                <table className="base-table">
                  <thead className="table-head">
                    <tr>
                      {sequenceBranchMasterHeader.map((h, index) => (
                        <th key={index} className="table-th ">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {sequenceMapping?.length === 0 && (
                      <tr>
                        <td colSpan={sequenceMapping.length} className="table-empty">
                          No records found
                        </td>
                      </tr>
                    )}

                    {sequenceMapping.map((item, idx) => (
                      <tr key={idx} className="table-row">
                        <td className="table-td">{idx + 1}</td>
                        <td className="table-td">{item?.branchName || "-"}</td>

                        <td className="table-td">{item?.roleName || "-"}</td>

                        <td className="table-td">{item?.typeName || "-"}</td>

                        <td className="table-td">{item?.sequencePreview || "-"}</td>

                        <td className="table-td">{item?.createdBy || "-"}</td>
                        <td className="table-td">{item?.createdOn || "-"}</td>
                        <td className="table-td">{item?.lastModifiedBy || "-"}</td>
                        <td className="table-td">{item?.lastModifiedOn || "-"}</td>
                        <td className="table-td" onClick={() => sequenceEditHandler(item)}>
                          <i className="fa-solid fa-edit text-xl text-blue-500 active:scale-90" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Animation>

        {loading && <CustomLoader isLoading={loading} />}
      </div>
    </div>
  );
};

export default SequenceMapping;
