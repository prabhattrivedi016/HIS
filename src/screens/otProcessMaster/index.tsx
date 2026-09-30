import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { SelectStyles } from "@/components/customSelect";
import CancelButton from "@/components/globalButtons/CancelButton";
import EditIconButton from "@/components/globalButtons/EditIconButton";
import SubmitButton from "@/components/globalButtons/SubmitButton";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { PickMasterItem } from "@/types";
import { showError, showSuccess } from "@/utils/alert";
import { otProcessMasterFormData, otProcessMasterSchema } from "@/validation/otProcessMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
import Select from "react-select";
import SequenceMappingPopup from "./components/SequenceMapping";
import { IconListItem, OtProcessMasterItem } from "./types";

const OtProcessMaster = () => {
  const { loading, fetchApi } = useGlobalApi();

  const processKeyLists = usePickMaster("OTProcessKey")?.pickMasterValue ?? [];

  const [otProcessList, setOtProcessList] = useState<OtProcessMasterItem[]>([]);

  const [openSequenceMapping, setOpenSequenceMapping] = useState<boolean>(false);
  const [renderSequenceMapping, setRenderSequenceMapping] = useState<boolean>(false);

  const [faIcons, setFaIcons] = useState<IconListItem[]>([]);
  const [selectedIcon, setSelectedIcon] = useState<IconListItem | null>(null);

  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(otProcessMasterSchema),
    defaultValues: {
      otProcessId: 0,
      processKey: "",
      processName: "",
      faIconId: 0,
      isActive: 1,
      isSystemProcess: 0,
    },
  });

  const isEdit = Boolean(watch("otProcessId"));
  const buttonTitle = isEdit ? "Update" : "Create";

  //   submit handler
  const onSubmit = async (formData: otProcessMasterFormData) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_OT_PROCESS_MASTER,
      formData,
      {},
      { component: "OtProcessMaster" }
    );
    if (!resp?.result) {
      showError(resp?.message ?? "Error while saving discharge process data");
      return;
    }

    showSuccess(resp?.message ?? "Data saved successfully");
    reset({
      otProcessId: 0,
      processKey: "",
      processName: "",
      faIconId: 0,
      isActive: 1,
      isSystemProcess: 0,
    });
    setSelectedIcon(null);
    await getOtProcessList();
  };

  //   get table list
  const getOtProcessList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_OT_PROCESS_MASTER,
      {},
      {},
      { component: "OtProcessMaster" }
    );
    if (!resp?.result) {
      showError(resp?.message ?? "Error while getting ot process list");
      return;
    }

    setOtProcessList(resp?.data ?? []);
  };

  useEffect(() => {
    getOtProcessList();
  }, []);

  // edit handler
  const editHandler = (item: OtProcessMasterItem) => {
    if (!item) return;

    Number(item?.IsSystemProcess) === 1 ? setIsDisabled(true) : setIsDisabled(false);

    const matchedIcon =
      faIcons.find(
        i =>
          (item?.FaIconId && Number(i?.id) === Number(item.FaIconId)) ||
          (item?.IconClass &&
            i?.iconClass?.trim().toLowerCase() === item.IconClass?.trim().toLowerCase()) ||
          (item?.IconName &&
            i?.iconName?.trim().toLowerCase() === item.IconName?.trim().toLowerCase())
      ) ?? null;

    setSelectedIcon(matchedIcon);

    reset({
      otProcessId: Number(item?.OTProcessId),
      processKey: String(item?.ProcessKey ?? ""),
      processName: String(item?.ProcessName),
      faIconId: Number(item?.FaIconId ?? matchedIcon?.id ?? 0),
      isSystemProcess: Number(item?.IsSystemProcess),
      isActive: Number(item?.IsActive),
    });
  };

  //   cancel handler

  const cancelHandler = () => {
    reset({
      otProcessId: 0,
      processKey: "",
      processName: "",
      faIconId: 0,
      isActive: 1,
      isSystemProcess: 0,
    });
    setSelectedIcon(null);
    setIsDisabled(false);
  };

  // handle sequence mapping
  const handleSequenceMapping = () => {
    setOpenSequenceMapping(true);
    setRenderSequenceMapping(true);
  };

  // close sequence mapping
  const closeSequenceMappingHandler = useCallback(() => {
    setOpenSequenceMapping(false);
    setRenderSequenceMapping(false);
  }, []);

  // icons

  // icons
  const getIcons = async () => {
    const response = await fetchApi("GET", ENDPOINTS.FA_ICON_LIST);
    if (response) setFaIcons(response.data ?? []);
  };

  useEffect(() => {
    getIcons();
  }, []);

  const iconOptions = useMemo(() => {
    return faIcons.map(item => ({
      value: item.id,
      label: item.iconName || "-",
      iconClass: item.iconClass,
    }));
  }, [faIcons]);

  const selectedOption = useMemo(() => {
    return selectedIcon
      ? { value: selectedIcon.id, label: selectedIcon.iconName, iconClass: selectedIcon.iconClass }
      : null;
  }, [selectedIcon]);

  const formatOptionLabel = (
    option: {
      label?: string;
      value?: string | number;
      iconClass?: string;
    },
    { context }: { context: "menu" | "value" }
  ) => {
    if (context === "value") {
      return <span>{option.label}</span>;
    }
    return (
      <div className="flex items-center justify-between w-full">
        <span>{option.label}</span>
        {option.iconClass && <i className={option.iconClass} />}
      </div>
    );
  };

  const handleSelectOption = (option: any) => {
    if (!option) {
      setSelectedIcon(null);
      setValue("faIconId", 0, { shouldValidate: true });
      return;
    }
    const matched = faIcons.find(i => i.id === option.value);
    if (matched) {
      setSelectedIcon(matched);
      setValue("faIconId", matched.id, { shouldValidate: true });
    }
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between w-full flex-col lg:flex-row gap-3">
        <div className="flex-1">
          <h1 className="page-heading">OT Process Master</h1>

          <nav className="helper-text">
            <NavLink to="/dashboard" className="hover:underline">
              Home
            </NavLink>
            <span>››</span>
            <span>OT Process Master</span>
          </nav>
        </div>
        <div className="flex justify-end flex-1">
          <button type="button" className="save-btn" onClick={handleSequenceMapping}>
            Sequence Mapping
          </button>
        </div>
      </div>

      <form className="card ">
        <div className="form-grid-4">
          <InputField label="Process Key" required>
            <select
              className={isEdit ? "disabled-input-field cursor-not-allowed" : "input-field"}
              {...register("processKey")}
              disabled={isDisabled}
            >
              <option value="">Select Process Key</option>

              {processKeyLists.map((processKey: PickMasterItem) => (
                <option key={processKey?.key} value={processKey?.key}>
                  {processKey?.value}
                </option>
              ))}
            </select>

            {errors.processKey?.message && (
              <p className="input-field-error">{errors.processKey.message}</p>
            )}
          </InputField>

          <InputField label="Process Name" required>
            <input
              className="input-field"
              {...register("processName")}
              placeholder="Enter OT Process name"
            />
            {errors.processName?.message && (
              <p className="input-field-error">{errors.processName.message}</p>
            )}
          </InputField>

          <InputField label="Is System Process" required>
            <select
              {...register("isSystemProcess")}
              className={isDisabled ? "disabled-input-field cursor-not-allowed" : "input-field"}
              disabled={isDisabled}
            >
              <option value={1}>Yes</option>
              <option value={0}>No</option>
            </select>
            {errors.isSystemProcess?.message && (
              <p className="input-field-error">{errors.isSystemProcess.message}</p>
            )}
          </InputField>

          <InputField label="Icon" required>
            <Select
              value={selectedOption}
              options={iconOptions}
              onChange={handleSelectOption}
              isSearchable
              placeholder="Search or Select Icon..."
              styles={SelectStyles as any}
              menuPortalTarget={document.body}
              formatOptionLabel={formatOptionLabel}
            />
            {errors.faIconId && <p className="input-field-error">{errors.faIconId.message}</p>}
          </InputField>

          <InputField label="Active">
            <select
              {...register("isActive")}
              className={isDisabled ? "disabled-input-field cursor-not-allowed" : "input-field"}
              disabled={isDisabled}
            >
              <option value={1}>Active</option>
              <option value={0}>In-Active</option>
            </select>
            {errors.isActive?.message && (
              <p className="input-validation-error">{errors.isActive.message}</p>
            )}
          </InputField>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 w-full lg:col-start-4 mt-4">
            <SubmitButton
              className="save-btn-color w-full sm:w-auto"
              label={buttonTitle}
              type="submit"
              onClick={handleSubmit(onSubmit)}
            />

            <CancelButton
              label="Cancel"
              className="cancel-btn-color w-full sm:w-auto"
              type="button"
              onClick={cancelHandler}
            />
          </div>
        </div>
      </form>

      {/* table */}

      <div className="table-container mt-1 ">
        <div className="table-scroll-wrapper ">
          <div className="table-size lg:min-h-100 lg:max-h-100">
            <table className="base-table ">
              <thead className="table-head">
                <tr>
                  <th className="table-th m-1">#</th>
                  <th className="table-th">Process Key</th>
                  <th className="table-th">Icon</th>
                  <th className="table-th">Process Name</th>
                  <th className="table-th">Sequence No</th>

                  <th className="table-th">System Process</th>
                  <th className="table-th">Active</th>
                  <th className="table-th">Created By</th>
                  <th className="table-th">Created On</th>
                  <th className="table-th">Last Modified By</th>
                  <th className="table-th">Last Modified On</th>
                  <th className="table-th">Edit</th>
                </tr>
              </thead>

              <tbody>
                {otProcessList?.length === 0 && (
                  <tr>
                    <td colSpan={12} className="table-empty">
                      No records found
                    </td>
                  </tr>
                )}

                {otProcessList?.map((item: OtProcessMasterItem, idx: number) => (
                  <tr key={item?.OTProcessId} className="table-row">
                    <td className="table-td">{idx + 1}</td>
                    <td className="table-td">{item?.ProcessKey || "-"}</td>

                    <td className="table-td ">
                      {<i className={` text-lg  ${item?.IconClass}`}></i>}
                    </td>

                    <td className="table-td">{item?.ProcessName || "-"}</td>
                    <td className="table-td text-center">{item?.SequenceNo || "-"}</td>

                    <td
                      className={`table-td  text-center  ${
                        Number(item?.IsSystemProcess) === 1 ? "active-text" : "inactive-text"
                      }`}
                    >
                      {Number(item?.IsSystemProcess) === 1 ? "Yes" : "No"}
                    </td>

                    <td
                      className={`table-td text-center ${
                        Number(item?.IsActive) === 1 ? "active-text" : "inactive-text"
                      }`}
                    >
                      {Number(item?.IsActive) === 1 ? "Active" : "Inactive"}
                    </td>

                    <td className="table-td">{item?.CreatedBy || "-"}</td>
                    <td className="table-td">{item?.CreatedOn || "-"}</td>
                    <td className="table-td">{item?.ModifiedBy || "-"}</td>
                    <td className="table-td">{item?.ModifiedOn || "-"}</td>
                    <td className="table-td">
                      <EditIconButton onClick={() => editHandler(item)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* sequence mapping */}
      {renderSequenceMapping && (
        <SequenceMappingPopup
          isOpen={openSequenceMapping}
          onClose={closeSequenceMappingHandler}
          refetch={getOtProcessList}
        />
      )}

      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};
export default OtProcessMaster;
