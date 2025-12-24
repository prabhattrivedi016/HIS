import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Spinner } from "../../../../assets/svgIcons";
import InputField from "../../../components/customInputField/index";
import CustomLoader from "../../../components/customLoader";
import { ErrorMessage, SuccessMessage } from "../../../components/infoText/index";
import useGlobalApi from "../../../hooks/useGlobalApi";

import { yupResolver } from "@hookform/resolvers/yup";
import { useRef, useState } from "react";

import { Plus } from "lucide-react";
import { ENDPOINTS } from "../../../config/defaults";
import { navigationPanelDrawerSchema } from "../../../validation/navigationPanelDrawerSchema";
import {
  NavigationFormFields,
  NavigationPanelDrawerProps,
  SubmitPayload,
  tabDropdownItem,
} from "../types";
import AddNewTabPanel from "./AddNewTabPanel";

const NavigationPanelDrawer = ({
  isOpen,
  onClose,
  buttonTitle,
  drawerTitle,
  onUpdate,
  updatedValue,
}: NavigationPanelDrawerProps) => {
  const { loading, error, fetchApi } = useGlobalApi();

  const [addNewTab, setAddNewTab] = useState(false);
  const [tabDropDown, setTabDropDown] = useState<tabDropdownItem[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [tabId, setTabId] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  //   add new tab handler
  const newTabHandler = () => {
    setAddNewTab(true);
  };

  //navigation tab master dropdown
  const getNavigationTabDropdown = async () => {
    const response = await fetchApi("GET", ENDPOINTS.GET_NAVIGATION_TAB_MASTER);
    if (!response) return;
    setTabDropDown(response?.data);
  };
  useEffect(() => {
    getNavigationTabDropdown();
  }, []);

  //   add new or update department
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<NavigationFormFields>({
    resolver: yupResolver(navigationPanelDrawerSchema),
    defaultValues: {
      subMenuId: 0,
      tabId: 0,
      subMenuName: "",
      url: "",
      isActive: "",
    },
  });

  useEffect(() => {
    if (!updatedValue || !tabDropDown.length) return;

    const normalizedIsActive =
      updatedValue.isActive === 1 || updatedValue.isActive === true
        ? "true"
        : updatedValue.isActive === 0 || updatedValue.isActive === false
        ? "false"
        : "";

    reset({
      subMenuId: updatedValue.subMenuId ?? 0,
      tabId: String(updatedValue.tabId ?? ""),
      subMenuName: updatedValue.subMenuName ?? "",
      url: updatedValue.url ?? "",
      isActive: normalizedIsActive,
    });

    setTabId(Number(updatedValue.tabId));
  }, [updatedValue, tabDropDown.length, reset]);

  const onSubmit = async (data: any) => {
    const payload: SubmitPayload = {
      ...data,
      subMenuId: data.subMenuId ?? 0,
    };
    const response = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_NAVIGATION_SUBMENU_MASTER,
      payload
    );
    if (!response) return;
    setSuccessMessage(response?.message);
    onUpdate();
    timerRef.current = setTimeout(() => {
      onClose();
    }, 1000);
  };

  // clear timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-999">
      <div className="absolute inset-0">
        <div
          className={`drawer-bg-fade
          ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
          onClick={onClose}
        />

        <div className={`drawer-layout drawer-bg ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="drawer-title-border">
            <h2 className="drawer-title">{drawerTitle}</h2>
            <button onClick={onClose} className="drawer-close-btn">
              ×
            </button>
          </div>
          <div className="p-4">
            <div className="mb-4">
              {successMessage ? <SuccessMessage text={successMessage} /> : <></>}
              {error ? <ErrorMessage text={error} /> : <></>}
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="flex items-start gap-2 w-full p-1">
                <div className="flex-1">
                  <InputField label="Tab Name" required={true}>
                    <select
                      className="input-field h-[38px]"
                      {...register("tabId")}
                      value={String(watch("tabId") ?? "")}
                      onChange={e => {
                        const id = Number(e.target.value);
                        setTabId(id);
                        setValue("tabId", id);
                      }}
                    >
                      <option value="">Select</option>

                      {tabDropDown.map(tab => (
                        <option key={tab.tabId} value={tab.tabId}>
                          {tab.tabName}
                        </option>
                      ))}
                    </select>
                  </InputField>

                  {errors.tabId && <p className="input-field-error">{errors.tabId.message}</p>}
                </div>

                <button type="button" className="add-tabPan-btn" onClick={newTabHandler}>
                  <Plus size={20} />
                </button>
              </div>

              <InputField label="Sub Menu Name" required={true}>
                <input
                  placeholder="Enter Sub Menu Name"
                  className="input-field"
                  {...register("subMenuName")}
                />
                {errors.subMenuName && (
                  <p className="input-field-error">{errors.subMenuName.message}</p>
                )}
              </InputField>

              <InputField label="Sub Menu Url" required={true}>
                <input
                  placeholder="Enter Sub Menu Url"
                  className="input-field"
                  {...register("url")}
                />
                {errors.url && <p className="input-field-error">{errors.url.message}</p>}
              </InputField>

              <InputField label="Status" required={true}>
                <select {...register("isActive")} className="input-field">
                  <option value="">Select</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
                {errors.isActive && <p className="input-field-error">{errors.isActive.message}</p>}
              </InputField>

              <button type="submit" className="submit-btn">
                {loading ? (
                  <>
                    <Spinner />
                    <span>Creating...</span>
                  </>
                ) : (
                  buttonTitle
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      {loading ? <CustomLoader isLoading={loading} /> : <></>}

      {/* add new tab popup */}
      {addNewTab ? (
        <AddNewTabPanel
          isOpenTab={addNewTab}
          onCloseTab={() => setAddNewTab(false)}
          tabId={tabId}
        />
      ) : (
        <></>
      )}
    </div>
  );
};

export default React.memo(NavigationPanelDrawer);
