import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import InputField from "../../../components/customInputField";
import CustomLoader from "../../../components/customLoader";
import { ErrorMessage, SuccessMessage } from "../../../components/infoText";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { addNewTabSchema } from "../../../validation/addNewTabSchema";
import { AddNewTabPanelProps, IconListItem, NewTabProps } from "../types";

const AddNewTabPanel = ({ isOpenTab, onCloseTab }: AddNewTabPanelProps) => {
  const { loading, error, fetchApi } = useGlobalApi();
  const [faIcons, setFaIcons] = useState<IconListItem[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  let timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(addNewTabSchema),
    defaultValues: {
      tabId: "0",
      tabName: "",
      faIconId: "",
    },
  });

  // get icons dropdown
  const getIcons = async () => {
    const response = await fetchApi("GET", ENDPOINTS.FA_ICON_LIST);
    if (!response) return;
    setFaIcons(response?.data);
  };

  useEffect(() => {
    getIcons();
  }, []);

  // cancel handler
  const cancelHandler = () => {
    onCloseTab();
  };
  // submit handler
  const onsubmit = async (payload: NewTabProps) => {
    const response = await fetchApi("POST", ENDPOINTS.CREATE_UPDATE_NAVIGATION_TAB_MASTER, payload);
    if (!response) return;

    setSuccessMessage(response?.message);

    timerRef.current = setTimeout(() => {
      onCloseTab();
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!isOpenTab) return null;

  return (
    <>
      {/* Background overlay */}
      <div
        className={`
          drawer-bg-overlay
          ${isOpenTab ? "opacity-100 visible" : "opacity-0 invisible"}
        `}
      />

      {/* Center Drawer Popup */}
      <div
        className={`
          central-drawer 
          ${isOpenTab ? "opacity-full" : "no-opacity"}
        `}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Add New Tab</h2>
          <button onClick={onCloseTab} className="close-drawer-btn">
            ×
          </button>
        </div>

        {successMessage ? <SuccessMessage text={successMessage} /> : <></>}
        {error ? <ErrorMessage text={error} /> : <></>}

        {/* Content */}
        <form className="space-y-3" onSubmit={handleSubmit(onsubmit)}>
          <InputField label="Add Tab">
            <input
              type="text"
              placeholder="Add New Tab"
              {...register("tabName")}
              className="input-field"
            />
            {errors?.tabName && <p className="input-field-error">{errors?.tabName?.message}</p>}
          </InputField>

          <InputField label="Add Icons">
            <select className="input-field" {...register("faIconId")}>
              <option value="">Select</option>
              {faIcons?.map(i => (
                <option key={i.id} value={i.id}>
                  {i.iconName}
                </option>
              ))}
            </select>
            {errors?.faIconId && <p className="input-field-error">{errors?.faIconId?.message}</p>}
          </InputField>

          <div className="flex flex-row m-2 ">
            <button className="submit-btn">Save</button>
            <button type="button" className="cancel-btn" onClick={cancelHandler}>
              Cancel
            </button>
          </div>
        </form>
      </div>
      {loading ? <CustomLoader isLoading={loading} /> : <></>}
    </>
  );
};

export default React.memo(AddNewTabPanel);
