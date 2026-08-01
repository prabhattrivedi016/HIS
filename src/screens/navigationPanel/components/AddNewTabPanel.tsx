import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { SelectStyles } from "@/components/customSelect";
import Select from "react-select";
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

const AddNewTabPanel = ({
  isOpenTab,
  onCloseTab,
  tabId,
  refreshTabDropdown,
}: AddNewTabPanelProps) => {
  const { loading, fetchApi } = useGlobalApi();

  const [faIcons, setFaIcons] = useState<IconListItem[]>([]);
  const [selectedIcon, setSelectedIcon] = useState<IconListItem | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
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

    if (!response?.result) {
      setErrorMessage(response?.message ?? "Something went wrong");
      return;
    }

    setSuccessMessage(response?.message);
    await refreshTabDropdown();

    timerRef.current = setTimeout(() => {
      onCloseTab();
      reset();
      setSelectedIcon(null);
      setSuccessMessage("");
    }, 1000);
  };

  const handleSelectIcon = (item: IconListItem) => {
    setSelectedIcon(item);
    setValue("faIconId", String(item.id), { shouldValidate: true });
  };

  const iconOptions = React.useMemo(() => {
    return faIcons.map(item => ({
      value: item.id,
      label: item.iconName || "-",
      iconClass: item.iconClass,
    }));
  }, [faIcons]);

  const selectedOption = React.useMemo(() => {
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
      setValue("faIconId", "", { shouldValidate: true });
      return;
    }
    const matched = faIcons.find(i => i.id === option.value);
    if (matched) {
      handleSelectIcon(matched);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className={`popup-bg-overlay ${isOpenTab ? "opacity-100 visible" : ""}`} />

      {/* Drawer */}
      <div
        className={`central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] ${isOpenTab ? "opacity-full" : ""}`}
      >
        {/* Header */}
        <div className="popup-header">
          <h2 className="popup-header">{tabId ? "Update Tab" : "Add New Tab"}</h2>
          <button onClick={onCloseTab} className="close-drawer-btn">
            ×
          </button>
        </div>

        {successMessage && <SuccessMessage text={successMessage} />}
        {errorMessage && <ErrorMessage text={errorMessage} />}

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

          <InputField label="Selected Icon Name">
            <Select
              value={selectedOption}
              options={iconOptions}
              onChange={handleSelectOption}
              isSearchable
              placeholder="Search or Select Icon..."
              styles={SelectStyles as any}
              formatOptionLabel={formatOptionLabel}
            />
            {errors?.faIconId && <p className="input-field-error">{errors?.faIconId?.message}</p>}
          </InputField>

          {/* table */}
          {/* <div className="table-container -mt-3 ">
            <div className="table-scroll-wrapper ">
              <div className="table-size lg:min-h-60 lg:max-h-60">
                <table className="base-table ">
                  <thead className="table-head">
                    <tr>
                      {AddNewTabIconTableHeader.map((h, index) => (
                        <th key={index} className="table-th ">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {faIcons?.length === 0 && (
                      <tr>
                        <td colSpan={AddNewTabIconTableHeader.length} className="table-empty">
                          No records found
                        </td>
                      </tr>
                    )}

                    {faIcons.map((item: IconListItem, idx: number) => {
                      const isSelected = selectedIcon?.id === item?.id;
                      return (
                        <tr
                          key={idx}
                          className={`table-row cursor-pointer transition-colors duration-150 ${
                            isSelected
                              ? "bg-blue-50 font-semibold border-l-4 border-blue-500"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => handleSelectIcon(item)}
                          onDoubleClick={() => handleSelectIcon(item)}
                        >
                          <td className="table-td">{item?.id}</td>
                          <td className="table-td">{item?.iconName || "-"}</td>
                          <td className="table-td text-center">
                            {item?.iconClass ? <i className={`${item?.iconClass} text-lg`} /> : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div> */}

          {/* <InputField label="Icon Preview"> */}
          <div className="grid grid-cols-2">
            {selectedIcon ? (
              <div className="flex items-center justify-between">
                <span className="text-xl">{"Icon Preview :"}</span>
                <i className={`${selectedIcon?.iconClass}  text-4xl`}></i>
              </div>
            ) : (
              <h1>Please select any Icons</h1>
            )}
            {/* </InputField> */}

            <div className="flex justify-center gap-3 p-3">
              <button type="submit" className="save-btn">
                Save
              </button>

              <button type="button" className="cancel-button" onClick={onCloseTab}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>

      {!!loading && <CustomLoader isLoading={loading} />}
    </>
  );
};

export default React.memo(AddNewTabPanel);
