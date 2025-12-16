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
  const [showIconDropdown, setShowIconDropdown] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [tabUpdateData, setTabUpdateData] = useState<tabDropdownItem[]>([]);
  const [iconSearch, setIconSearch] = useState("");

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
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

  useEffect(() => {
    getTabMasterData();
  }, [tabId]);

  const getIcons = async () => {
    const response = await fetchApi("GET", ENDPOINTS.FA_ICON_LIST);
    if (response) setFaIcons(response.data);
  };

  useEffect(() => {
    getIcons();
  }, []);

  useEffect(() => {
    if (!tabId || !faIcons.length || !tabUpdateData.length) return;

    const selectedTab = tabUpdateData.find(t => t.tabId === tabId);
    if (!selectedTab) return;

    const icon = faIcons.find(i => i.id === selectedTab.faIconId) ?? null;

    setSelectedIcon(icon);

    reset({
      tabId: selectedTab.tabId,
      tabName: selectedTab.tabName,
      faIconId: icon ? String(icon.id) : "",
    });
  }, [tabId, faIcons, tabUpdateData, reset]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowIconDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //submit
  const onSubmit = async (payload: NewTabProps) => {
    const response = await fetchApi("POST", ENDPOINTS.CREATE_UPDATE_NAVIGATION_TAB_MASTER, payload);

    if (!response) return;

    setSuccessMessage(response.message);

    timerRef.current = setTimeout(() => {
      onCloseTab();
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // search icons
  const filteredIcons = faIcons.filter(icon =>
    icon.iconName.toLowerCase().includes(iconSearch.toLowerCase())
  );

  if (!isOpenTab) return null;

  return (
    <>
      {/* Overlay */}
      <div className={`drawer-bg-overlay ${isOpenTab ? "opacity-100 visible" : ""}`} />

      {/* Drawer */}
      <div className={`central-drawer ${isOpenTab ? "opacity-full" : ""}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Add New Tab</h2>
          <button onClick={onCloseTab} className="close-drawer-btn">
            ×
          </button>
        </div>

        {successMessage && <SuccessMessage text={successMessage} />}
        {error && <ErrorMessage text={error} />}

        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <InputField label="Add Tab">
            <input
              type="text"
              placeholder="Add New Tab"
              {...register("tabName")}
              className="input-field"
            />
            {errors.tabName && <p className="input-field-error">{errors.tabName.message}</p>}
          </InputField>

          <InputField label="Add Icon">
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowIconDropdown(p => !p)}
                className="input-field flex justify-between items-center"
              >
                {selectedIcon ? (
                  <div className="flex items-center gap-10">
                    <span>{selectedIcon.iconName}</span>

                    <i className={selectedIcon.iconClass} />
                  </div>
                ) : (
                  <span>Select Icon</span>
                )}
                <span>▾</span>
              </button>

              {showIconDropdown && (
                <div className="absolute z-50 w-full bg-white border rounded shadow">
                  {/* 🔍 Search */}
                  <div className="p-2">
                    <input
                      type="text"
                      placeholder="Search icons..."
                      value={iconSearch}
                      onChange={e => setIconSearch(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  {/* Icon list */}
                  <ul className="max-h-56 overflow-y-auto">
                    {filteredIcons.length > 0 ? (
                      filteredIcons.map(icon => (
                        <li
                          key={icon.id}
                          onClick={() => {
                            setSelectedIcon(icon);
                            setValue("faIconId", String(icon.id), { shouldValidate: true });
                            setShowIconDropdown(false);
                            setIconSearch(""); // reset search
                          }}
                          className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-100"
                        >
                          <i className={icon.iconClass} />
                          <span>{icon.iconName}</span>
                        </li>
                      ))
                    ) : (
                      <li className="px-3 py-2 text-gray-500 text-sm">No icons found</li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* hidden input for RHF */}
            <input type="hidden" {...register("faIconId")} />

            {errors.faIconId && <p className="input-field-error">{errors.faIconId.message}</p>}
          </InputField>

          {/* ACTIONS */}
          <div className="flex gap-2 mt-4">
            <button className="submit-btn">Save</button>
            <button type="button" className="cancel-btn" onClick={onCloseTab}>
              Cancel
            </button>
          </div>
        </form>
      </div>

      {loading && <CustomLoader isLoading />}
    </>
  );
};

export default React.memo(AddNewTabPanel);
