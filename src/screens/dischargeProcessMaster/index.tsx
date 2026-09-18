import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { SelectStyles } from "@/components/customSelect";
import CancelButton from "@/components/globalButtons/CancelButton";
import EditIconButton from "@/components/globalButtons/EditIconButton";
import MappingIconButton from "@/components/globalButtons/MappingIconButton";
import SubmitButton from "@/components/globalButtons/SubmitButton";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { PickMasterItem } from "@/types";
import { showError, showSuccess } from "@/utils/alert";
import {
  dischargeProcessMasterFormData,
  dischargeProcessMasterSchema,
} from "@/validation/dischargeProcessMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
import Select from "react-select";
import CorporateMapping from "./components/CorporateMapping";
import SequenceMappingPopup from "./components/SequenceMappingPopup";
import { DischargeProcessItem, IconListItem } from "./types";

const DischargeProcessMaster = () => {
  const { loading, fetchApi } = useGlobalApi();
  // const [showDetails, setShowDetails] = useState<boolean>(false);

  const processKeyLists = usePickMaster("DischargeProcessKey")?.pickMasterValue ?? [];

  const [openMappingPopup, setOpenMappingPopup] = useState<boolean>(false);
  const [renderMappingPopup, setRenderMappingPopup] = useState<boolean>(false);
  const [selectProcessItem, setSelectedProcessItem] = useState<DischargeProcessItem | null>(null);

  const [openSequenceMapping, setOpenSequenceMapping] = useState<boolean>(false);
  const [renderSequenceMapping, setRenderSequenceMapping] = useState<boolean>(false);

  const [faIcons, setFaIcons] = useState<IconListItem[]>([]);
  const [selectedIcon, setSelectedIcon] = useState<IconListItem | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(dischargeProcessMasterSchema),
    defaultValues: {
      dischargeProcessId: 0,
      processKey: "",
      processName: "",
      sequenceNo: 0,
      faIconId: 0,
      isMandatory: 0,
      isActive: 1,
      isSystemProcess: 0,
    },
  });

  const buttonTitle = Boolean(watch("dischargeProcessId")) ? "Update" : "Create";

  //   submit handler
  const onSubmit = async (formData: dischargeProcessMasterFormData) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_DISCHARGE_PROCESS_MASTER,
      formData,
      {},
      { component: "DischargeProcessMaster" }
    );
    if (!resp?.result) {
      showError(resp?.message ?? "Error while saving discharge process data");
      return;
    }
    showSuccess(resp?.message ?? "Data saved successfully");
    reset({
      dischargeProcessId: 0,
      processKey: "",
      processName: "",
      sequenceNo: 0,
      faIconId: 0,
      isMandatory: 0,
      isActive: 1,
      isSystemProcess: 0,
    });
    setSelectedIcon(null);
    await refetch();
  };

  //   get table list
  const getDischargeProcessList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DISCHARGE_PROCESS_MASTER,
      {},
      {},
      { component: "DischargeProcessMaster" }
    );
    return resp?.data ?? [];
  };

  const { data: dischargeProcessList, refetch } = useQuery({
    queryKey: ["dischargeProcessList"],
    queryFn: getDischargeProcessList,
  });

  // edit handler
  const editHandler = (item: DischargeProcessItem) => {
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
      dischargeProcessId: Number(item?.DischargeProcessId),
      processKey: String(item?.ProcessKey ?? ""),
      processName: String(item?.ProcessName),
      sequenceNo: Number(item?.SequenceNo),
      faIconId: Number(item?.FaIconId ?? matchedIcon?.id ?? 0),
      isMandatory: Number(item?.IsMandatory),
      isSystemProcess: Number(item?.IsSystemProcess),
      isActive: Number(item?.IsActive),
    });
  };

  //   cancel handler

  const cancelHandler = () => {
    reset({
      dischargeProcessId: 0,
      processKey: "",
      processName: "",
      sequenceNo: 0,
      faIconId: 0,
      isMandatory: 0,
      isActive: 1,
      isSystemProcess: 0,
    });
    setSelectedIcon(null);
  };

  // const tablePopupHandler = () => {
  //   setShowDetails(p => !p);
  // };

  //   mapping handler
  const mappingHandler = (item: DischargeProcessItem) => {
    if (!item) {
      setOpenMappingPopup(false);
      setRenderMappingPopup(false);
      setSelectedProcessItem(null);
      return;
    }
    setSelectedProcessItem(item);
    setRenderMappingPopup(true);
    setOpenMappingPopup(true);
  };

  const closeMappingHandler = useCallback(() => {
    setOpenMappingPopup(false);
    setRenderMappingPopup(false);
    setSelectedProcessItem(null);
  }, []);

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
          <h1 className="page-heading">Discharge Process Master</h1>

          <nav className="helper-text">
            <NavLink to="/dashboard" className="hover:underline">
              Home
            </NavLink>
            <span>››</span>
            <span>Discharge Process Master</span>
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
            <select className="input-field" {...register("processKey")}>
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
              placeholder="Enter discharge process name"
            />
            {errors.processName?.message && (
              <p className="input-field-error">{errors.processName.message}</p>
            )}
          </InputField>

          {/* <InputField label="Sequence Number ">
            <input
              className="input-field"
              {...register("sequenceNo")}
              onInput={allowOnlyNumbers}
              placeholder="Enter sequence number"
            />
            {errors.sequenceNo?.message && (
              <p className="input-field-error">{errors.sequenceNo.message}</p>
            )}
          </InputField> */}

          {/* <InputField label="Is Mandatory" required>
            <select className="input-field" {...register("isMandatory")}>
              <option value={1}>Yes</option>
              <option value={0}>No</option>
            </select>
            {errors.isMandatory?.message && (
              <p className="input-field-error">{errors.isMandatory.message}</p>
            )} 
          </InputField>
          */}
          <InputField label="Is System Process" required>
            <select className="input-field" {...register("isSystemProcess")}>
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
            <select className="input-field" {...register("isActive")}>
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
      {/* <div className="card mt-1"> */}
      {/* <div className="card-header">
          <h2 className="card-title ">Discharge Process Master List</h2>

          <button onClick={tablePopupHandler}>
            {showDetails ? <Minus size={30} /> : <Plus size={30} />}
          </button>
        </div> */}
      {/* <Animation isOpen={showDetails}> */}
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
                  <th className="table-th">Mandatory</th>

                  <th className="table-th">System Process</th>
                  <th className="table-th">Active</th>
                  <th className="table-th">Map Corporate</th>
                  <th className="table-th">Created By</th>
                  <th className="table-th">Created On</th>
                  <th className="table-th">Last Modified By</th>
                  <th className="table-th">Last Modified On</th>
                  <th className="table-th">Edit</th>
                </tr>
              </thead>

              <tbody>
                {dischargeProcessList?.length === 0 && (
                  <tr>
                    <td colSpan={13} className="table-empty">
                      No records found
                    </td>
                  </tr>
                )}

                {dischargeProcessList?.map((item: DischargeProcessItem, idx: number) => (
                  <tr key={item?.DischargeProcessId} className="table-row">
                    <td className="table-td">{idx + 1}</td>
                    <td className="table-td">{item?.ProcessKey || "-"}</td>

                    <td className="table-td">
                      {<i className={` text-lg ${item?.IconClass}`}></i>}
                    </td>

                    <td className="table-td">{item?.ProcessName || "-"}</td>
                    <td className="table-td">{item?.SequenceNo || "-"}</td>

                    <td
                      className={`table-td ${
                        Number(item?.IsMandatory) === 1 ? "active-text" : "inactive-text"
                      }`}
                    >
                      {Number(item?.IsMandatory) === 1 ? "Yes" : "No"}
                    </td>
                    <td
                      className={`table-td ${
                        Number(item?.IsSystemProcess) === 1 ? "active-text" : "inactive-text"
                      }`}
                    >
                      {Number(item?.IsSystemProcess) === 1 ? "Yes" : "No"}
                    </td>

                    <td
                      className={`table-td ${
                        Number(item?.IsActive) === 1 ? "active-text" : "inactive-text"
                      }`}
                    >
                      {Number(item?.IsActive) === 1 ? "Active" : "Inactive"}
                    </td>
                    {Number(item?.IsSystemProcess) === 0 ? (
                      <td className="table-td">
                        <MappingIconButton onClick={() => mappingHandler(item)} className="ml-7" />
                      </td>
                    ) : (
                      <td className="table-td"></td>
                    )}
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
            {/* </div> */}
          </div>
        </div>
        {/* </Animation> */}
      </div>

      {/* mapping popup */}
      {renderMappingPopup && (
        <CorporateMapping
          isOpen={openMappingPopup}
          onClose={closeMappingHandler}
          item={selectProcessItem}
        />
      )}

      {/* sequence mapping */}
      {renderSequenceMapping && (
        <SequenceMappingPopup
          isOpen={openSequenceMapping}
          onClose={closeSequenceMappingHandler}
          refetch={refetch}
        />
      )}

      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};
export default DischargeProcessMaster;
