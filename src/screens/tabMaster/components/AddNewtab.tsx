import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { useScrollLock } from "@/hooks/useScrollLock";
import { PickMasterItem } from "@/types";
import { allowOnlyNumbers } from "@/utils/inputValidationHandler";
import { TabMasterFormData, tabMasterSchema } from "@/validation/tabMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { AddNewTabProps, GroupTypeItem, RoomTypeItem } from "../types";
import CreateUpdateGroupType from "./CreateUpdateGroupType";

const defaultFormValues: TabMasterFormData = {
  tabId: 0,
  tabType: "",
  tabTypeId: 0,
  groupTypeId: 0,
  roomTypeId: 0,
  tabName: "",
  tabViewURL: "",
  sequenceNo: "",
  isActive: 1,
};

const AddNewtab = ({ isOpen, onClose, data, onSuccess }: AddNewTabProps) => {
  const { loading, fetchApi } = useGlobalApi();
  const tabTypeList = usePickMaster("BillingTabType")?.pickMasterValue ?? [];
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const isEditMode = Boolean(data?.TabId);
  const drawerTitle = isEditMode ? "Update Tab" : "Add New Tab";
  const buttonTitle = isEditMode ? "Update" : "Create";
  const [openAddGroupType, setOpenAddGroupType] = useState<boolean>(false);
  const [renderAddGroupType, setRenderAddGroupType] = useState<boolean>(false);
  const [selectedGroupType, setSelectedGroupType] = useState<GroupTypeItem | null>(null);

  const getGroupTypeList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_TAB_GROUP_TYPE_MASTER,
      {},
      {},
      { component: "AddNewTab" }
    );
    return resp?.data ?? [];
  };

  const { data: groupTypeList = [], refetch: refetchGroupTypeList } = useQuery({
    queryKey: ["getGroupTypeList"],
    queryFn: getGroupTypeList,
  });

  const getRoomTypeList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SERVICE_ITEM_LIST,
      {},
      { params: { categoryTypeId: "10" } },
      { component: "AddNewTab" }
    );
    return resp?.data ?? [];
  };

  const { data: roomTypeList = [] } = useQuery({
    queryKey: ["getRoomTypeList"],
    queryFn: getRoomTypeList,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(tabMasterSchema),
    defaultValues: defaultFormValues,
  });

  useScrollLock(isOpen);

  const selectedTabTypeId = watch("tabTypeId");

  useEffect(() => {
    if (!isOpen) return;

    setSuccessMessage("");
    setErrorMessage("");

    if (!data) {
      reset(defaultFormValues);
      return;
    }

    const matchedTabType = tabTypeList.find(item => Number(item.key) === Number(data.TabTypeId));

    reset({
      tabId: data.TabId ?? 0,
      tabTypeId: data.TabTypeId ?? 0,
      tabType: data.TabType ?? matchedTabType?.value ?? "",
      groupTypeId: data.GroupTypeId ?? 0,
      roomTypeId: data.RoomTypeId ?? 0,
      tabName: data.TabName ?? "",
      tabViewURL: data.TabViewURL ?? "",
      sequenceNo: String(data.SequenceNo ?? ""),
      isActive: data.IsActive ?? 1,
    });
  }, [isOpen, data, reset, tabTypeList]);

  const tabTypeChangeHandler = (value: number) => {
    const matchedType = tabTypeList.find(item => Number(item.key) === value);
    setValue("tabTypeId", value, { shouldValidate: true });
    setValue("tabType", matchedType?.value ?? "", { shouldValidate: true });
  };

  const onSubmit = async (formData: TabMasterFormData) => {
    setErrorMessage("");

    const payload = {
      tabId: Number(formData.tabId ?? 0),
      groupTypeId: Number(formData.groupTypeId),
      tabName: formData.tabName,
      tabViewURL: formData.tabViewURL,
      sequenceNo: Number(formData.sequenceNo),
      tabTypeId: Number(formData.tabTypeId),
      tabType: formData.tabType,
      roomTypeId: Number(formData.roomTypeId),
      isActive: Number(formData.isActive),
    };

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_IPD_TAB_MASTER,
      payload,
      {},
      { component: "AddNewTab" }
    );

    if (!resp?.result) {
      setErrorMessage(resp?.message ?? "Failed to save tab");
      return;
    }

    setSuccessMessage(resp?.message ?? "Tab saved successfully");
    onSuccess?.();

    timerRef.current = setTimeout(() => {
      onClose();
    }, 800);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const selectedGroupTypeId = watch("groupTypeId");

  useEffect(() => {
    if (!selectedGroupTypeId) return;

    const selectedGroupType = groupTypeList.find(
      (item: GroupTypeItem) => item.GroupTypeId === selectedGroupTypeId
    );

    if (!selectedGroupType) return;

    setSelectedGroupType(selectedGroupType);
  }, [selectedGroupTypeId, groupTypeList]);

  const createGroupTypeHandler = () => {
    if (!selectedGroupType) {
      setSelectedGroupType(null);
      setRenderAddGroupType(true);
      setOpenAddGroupType(true);
      return;
    }
    setSelectedGroupType(selectedGroupType);
    setRenderAddGroupType(true);
    setOpenAddGroupType(true);
  };

  const closeGroupTypePopupHandler = () => {
    setOpenAddGroupType(false);
  };

  const groupTypeSuccessHandler = (groupTypeId: number) => {
    if (groupTypeId > 0) {
      setValue("groupTypeId", groupTypeId, { shouldValidate: true });
    }
  };

  return createPortal(
    <div className={`fixed inset-0 z-999 ${isOpen ? "" : "pointer-events-none"}`}>
      <div className="absolute inset-0">
        <div
          className={`drawer-bg-fade ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={onClose}
        />

        <div
          className={`drawer-layout drawer-bg lg:min-w-200 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="drawer-title-border">
            <h2 className="drawer-title">{drawerTitle}</h2>
            <button type="button" onClick={onClose} className="drawer-close-btn">
              ×
            </button>
          </div>

          {!!successMessage && <SuccessMessage text={successMessage} />}
          {!!errorMessage && <ErrorMessage text={errorMessage} />}

          <div className="card m-1">
            <form onSubmit={handleSubmit(onSubmit)}>
              <input type="hidden" {...register("tabId")} />
              <input type="hidden" {...register("tabType")} />

              <div className="form-grid-2">
                <InputField label="Tab Type" required>
                  <select
                    className="input-field"
                    value={selectedTabTypeId ?? 0}
                    onChange={e => tabTypeChangeHandler(Number(e.target.value))}
                  >
                    <option value={0}>Select Tab Type</option>
                    {tabTypeList.map((item: PickMasterItem) => (
                      <option key={item.key} value={item.key}>
                        {item.value}
                      </option>
                    ))}
                  </select>
                  {errors.tabTypeId && (
                    <p className="input-field-error">{errors.tabTypeId.message}</p>
                  )}
                </InputField>

                <InputField label="Group Type" required>
                  <div className="flex gap-2 items-center">
                    <select
                      className="input-field"
                      {...register("groupTypeId", { valueAsNumber: true })}
                    >
                      <option value={0}>Select Group Type</option>
                      {groupTypeList.map((item: GroupTypeItem) => (
                        <option key={item.GroupTypeId} value={item.GroupTypeId}>
                          {item.GroupTypeName}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="active:scale-90"
                      onClick={createGroupTypeHandler}
                    >
                      <i className="fa-solid fa-circle-plus fa-xl"></i>
                    </button>
                  </div>
                  {errors.groupTypeId && (
                    <p className="input-field-error">{errors.groupTypeId.message}</p>
                  )}
                </InputField>

                <InputField label="Room Type" required>
                  <select
                    className="input-field"
                    {...register("roomTypeId", { valueAsNumber: true })}
                  >
                    <option value={0}>Select Room Type</option>
                    {roomTypeList.map((item: RoomTypeItem) => (
                      <option key={item.serviceItemId} value={item.serviceItemId}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  {errors.roomTypeId && (
                    <p className="input-field-error">{errors.roomTypeId.message}</p>
                  )}
                </InputField>

                <InputField label="Tab Name" required>
                  <input
                    className="input-field"
                    placeholder="Enter tab name"
                    {...register("tabName")}
                  />
                  {errors.tabName && <p className="input-field-error">{errors.tabName.message}</p>}
                </InputField>

                <InputField label="Tab View URL" required>
                  <input
                    className="input-field"
                    placeholder="Enter tab view URL"
                    {...register("tabViewURL")}
                  />
                  {errors.tabViewURL && (
                    <p className="input-field-error">{errors.tabViewURL.message}</p>
                  )}
                </InputField>

                <InputField label="Sequence No" required>
                  <input
                    className="input-field"
                    placeholder="Enter sequence no"
                    {...register("sequenceNo")}
                    onInput={allowOnlyNumbers}
                  />
                  {errors.sequenceNo && (
                    <p className="input-field-error">{errors.sequenceNo.message}</p>
                  )}
                </InputField>

                <InputField label="Status">
                  <select
                    className="input-field"
                    {...register("isActive", { valueAsNumber: true })}
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </InputField>
              </div>

              <div className="form-actions-responsive mt-5">
                <button type="submit" className="save-btn">
                  {buttonTitle}
                </button>
                <button type="button" className="cancel-button" onClick={onClose}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {renderAddGroupType && (
        <CreateUpdateGroupType
          isOpen={openAddGroupType}
          onClose={closeGroupTypePopupHandler}
          data={selectedGroupType}
          onSuccess={refetchGroupTypeList}
        />
      )}

      {loading && <CustomLoader isLoading={loading} />}
    </div>,
    document.body
  );
};

export default AddNewtab;
