import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import InputField from "../../../components/customInputField";
import CustomLoader from "../../../components/customLoader";
import { ErrorMessage, SuccessMessage } from "../../../components/infoText";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { addNewTabSchema } from "../../../validation/addNewTabSchema";

import {
  AddNewTabPanelProps,
  AddTabFormFields,
  IconListItem,
  NewTabProps,
  tabDropdownItem,
} from "../types";

const AddNewTabPanel = ({ isOpenTab, onCloseTab, tabId }: AddNewTabPanelProps) => {
  const { loading, error, fetchApi } = useGlobalApi();

  const [faIcons, setFaIcons] = useState<IconListItem[]>([]);
  const [selectedIcon, setSelectedIcon] = useState<IconListItem | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [tabUpdateData, setTabUpdateData] = useState<tabDropdownItem[]>([]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AddTabFormFields>({
    resolver: yupResolver(addNewTabSchema),
    defaultValues: {
      tabId: "0",
      tabName: "",
      faIconId: "",
    },
  });

  const getTabMasterData = async () => {
    const response = await fetchApi("GET", ENDPOINTS.GET_NAVIGATION_TAB_MASTER);
    if (response) setTabUpdateData(response.data);
  };

  const getIcons = async () => {
    const response = await fetchApi("GET", ENDPOINTS.FA_ICON_LIST);
    if (response) setFaIcons(response.data ?? []);
  };

  useEffect(() => {
    if (isOpenTab) {
      getTabMasterData();
      getIcons();
    }
  }, [isOpenTab]);

  // Edit mode
  useEffect(() => {
    if (!tabId || !faIcons?.length || !tabUpdateData?.length) return;

    const selectedTab = tabUpdateData?.find(t => t?.tabId === tabId);
    if (!selectedTab) return;

    const icon = faIcons?.find(i => i?.id === selectedTab?.faIconId) ?? null;

    setSelectedIcon(icon);

    reset({
      tabId: String(selectedTab?.tabId),
      tabName: selectedTab?.tabName,
      faIconId: icon ? String(icon?.id) : "",
    });
  }, [tabId, faIcons, tabUpdateData, reset]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef?.current) clearTimeout(timerRef?.current);
    };
  }, []);

  const onSubmit = async (payload: NewTabProps) => {
    const response = await fetchApi("POST", ENDPOINTS.CREATE_UPDATE_NAVIGATION_TAB_MASTER, payload);

    if (!response) return;

    setSuccessMessage(response?.message);

    timerRef.current = setTimeout(() => {
      onCloseTab();
      reset();
      setSelectedIcon(null);
      setSuccessMessage("");
    }, 1000);
  };

  if (!isOpenTab) return null;

  return (
    <>
      {/* Overlay */}
      <div className={`popup-bg-overlay ${isOpenTab ? "opacity-100 visible" : ""}`} />

      {/* Drawer */}
      <div className={`central-popup ${isOpenTab ? "opacity-full" : ""}`}>
        {/* Header */}
        <div className="popup-header">
          <h2 className="popup-header">{tabId ? "Update Tab" : "Add New Tab"}</h2>
          <button onClick={onCloseTab} className="close-drawer-btn">
            ×
          </button>
        </div>

        {successMessage && <SuccessMessage text={successMessage} />}
        {error && <ErrorMessage text={error?.message} />}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Tab Name */}
          <InputField label="Tab Name">
            <input
              type="text"
              placeholder="Enter tab name"
              {...register("tabName")}
              className="input-field"
            />
            {errors?.tabName && <p className="input-field-error">{errors?.tabName?.message}</p>}
          </InputField>

          <InputField label="Select Icon">
            <select
              className="input-field"
              {...register("faIconId")}
              onChange={e => {
                setValue("faIconId", e.target.value, { shouldValidate: true });
                const icon = faIcons.find(i => String(i.id) === e.target.value);
                setSelectedIcon(icon ?? null);
              }}
            >
              <option value="">Select icon</option>
              {faIcons?.map(icon => (
                <option key={icon?.id} value={icon?.id}>
                  {icon?.iconName}
                </option>
              ))}
            </select>

            {errors?.faIconId && <p className="input-field-error">{errors?.faIconId?.message}</p>}
          </InputField>

          {/* <InputField label="Icon Preview"> */}
          {selectedIcon ? (
            <div className="flex items-center justify-between">
              <span className="text-xl">{"Icon Preview :"}</span>
              <i className={`${selectedIcon?.iconClass}  text-4xl`}></i>
            </div>
          ) : (
            <h1>Please select any Icons</h1>
          )}
          {/* </InputField> */}

          <div className="flex gap-3 mt-6">
            <button type="submit" className="submit-btn">
              Save
            </button>
            <button type="button" className="cancel-btn" onClick={onCloseTab}>
              Cancel
            </button>
          </div>
        </form>
      </div>

      {loading && <CustomLoader isLoading={loading} />}
    </>
  );
};

export default React.memo(AddNewTabPanel);
