import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { SelectStyles } from "@/components/customSelect";
import { ENDPOINTS } from "@/config/defaults";
import { ServiceMasterPopupName } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import { SubCategoryListItem } from "@/screens/labInvestigationMaster/types";
import { SelectItem } from "@/types";
import { showWarning } from "@/utils/alert";
import { useQuery } from "@tanstack/react-query";
import React, { ChangeEvent, useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";
import { CategoryItem, ServiceTableItem, SubCategoryItem, SubSubCategoryItem } from "../types";
import CreateUpdatePopup from "./CreateUpdatePopup";

const AddServiceMaster = ({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: ServiceTableItem | null;
}) => {
  const { loading, fetchApi } = useGlobalApi();
  const buttonTitle = data ? "Update" : "Create";
  const [renderPopup, setRenderPopup] = useState<boolean>(false);
  const [openPopup, setOpenPopup] = useState<boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [popupName, setPopupName] = useState<string>("");

  const [categoryId, setCategoryId] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);

  const [selectSubCategory, setSelectSubCategory] = useState<SubCategoryItem | null>(null);
  const [selectSubCategoryValue, setSelectSubCategoryValue] = useState<SelectItem | null>(null);

  const [selectSubSubCategory, setSelectSubSubCategory] = useState<SubSubCategoryItem | null>(null);
  const [selectSubSubCategoryValue, setSubSelectSubCategoryValue] = useState<SelectItem | null>(
    null
  );

  // get categoryLists
  const getCategories = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CATEGORY_LIST,
      {},
      { params: { categoryTypeIds: "8,2,1,4,5,10,9" } },
      { component: "ServiceMaster" }
    );
    return resp?.data ?? [];
  };

  const { data: categoryList = [], refetch } = useQuery({
    queryKey: ["getCategoryList"],
    queryFn: getCategories,
  });

  //   open popup handler
  const openPopupHandler = (popupName: string) => {
    switch (popupName) {
      case ServiceMasterPopupName?.CATEGORY: {
        setPopupName(ServiceMasterPopupName?.CATEGORY);
        setOpenPopup(true);
        setRenderPopup(true);
        return;
      }
      case ServiceMasterPopupName?.SUB_CATEGORY: {
        if (!selectedCategory?.categoryId || !categoryId) {
          showWarning("Please select category first!");
          return;
        }
        setPopupName(ServiceMasterPopupName?.SUB_CATEGORY);
        setOpenPopup(true);
        setRenderPopup(true);
        return;
      }

      case ServiceMasterPopupName?.SUB_SUB_CATEGORY: {
        if (!selectSubCategory?.subCategoryId || !selectSubCategoryValue?.value) {
          showWarning("Please select category & sub category first!");
          return;
        }
        setPopupName(ServiceMasterPopupName?.SUB_SUB_CATEGORY);
        setOpenPopup(true);
        setRenderPopup(true);
        return;
      }
      default:
        return;
    }
  };

  //   close popup handler
  const closePopupHandler = useCallback(() => {
    setOpenPopup(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setRenderPopup(false);
    }, 100);
  }, []);

  // category select handler
  const categorySelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    if (!value || value === 0) {
      setCategoryId(0);
      setSelectedCategory(null);
      setSelectSubCategory(null);
      setSelectSubCategoryValue(null);
      return;
    }
    setCategoryId(value);
    const category = categoryList?.find((c: CategoryItem) => c?.categoryId === value);
    setSelectedCategory(category);
    setSelectSubCategoryValue(null);
  };

  // sub category
  const getSubCategory = async (id: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SUB_CATEGORY_LIST,
      {},
      {
        params: {
          categoryIds: id,
        },
      },
      { component: "LabInvestigationMaster" }
    );

    return resp?.data ?? [];
  };

  const { data: subCategoryList = [], refetch: refetchSubCategory } = useQuery({
    queryKey: ["fetchSubCategory", categoryId],
    queryFn: () => getSubCategory(categoryId),
    enabled: categoryId > 0,
  });

  const subCategorySelectOption = useMemo(() => {
    return (
      subCategoryList?.map((d: SubCategoryListItem) => ({
        label: d?.subCategoryName,
        value: d?.subCategoryId,
      })) || []
    );
  }, [subCategoryList]);

  // sub category select handler
  const subCategorySelectHandler = (option: SelectItem) => {
    if (!option) return;
    setSelectSubCategoryValue(option);
    const selected = subCategoryList?.find(
      (s: SubCategoryItem) => s?.subCategoryId === Number(option?.value)
    );
    setSelectSubCategory(selected);
  };

  // sub sub category

  const getSubSubCategory = async (subCategoryIds: number) => {
    if (!subCategoryIds) return;
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SUB_SUB_CATEGORY_LIST,
      {},
      { params: { subCategoryIds } },
      {
        component: "LabInvestigationMaster",
      }
    );
    return resp?.data ?? [];
  };

  const { data: subSubCategoryList = [], refetch: refetchSubSubCategory } = useQuery({
    queryKey: ["getSubSubCategory", selectSubCategoryValue?.value],
    queryFn: () => getSubSubCategory(Number(selectSubCategoryValue?.value)),
    enabled: selectSubCategoryValue?.value! > 0,
  });

  const subSubCategorySelectOption = useMemo<SelectItem[]>(() => {
    return (
      subSubCategoryList?.map((d: SubSubCategoryItem) => ({
        label: d?.subSubCategoryName,
        value: d?.subSubCategoryId,
      })) || []
    );
  }, [subSubCategoryList]);

  // sub sub category select handler
  const subSubCategorySelectHandler = (option: SelectItem) => {
    if (!option) {
      setSelectSubSubCategory(null);
      setSubSelectSubCategoryValue(null);
      return;
    }

    setSubSelectSubCategoryValue(option);
    const selected = subSubCategoryList?.find(
      (s: SubSubCategoryItem) => s?.subSubCategoryId === Number(option?.value)
    );
    setSelectSubSubCategory(selected);
  };
  useScrollLock(isOpen);

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
            <h2 className="drawer-title">{buttonTitle} Service</h2>
            <button onClick={onClose} className="drawer-close-btn">
              ×
            </button>
          </div>
          <div className="card m-1">
            <form>
              <div className="form-grid-2">
                <InputField label="Category">
                  <div className="flex gap-2 items-center">
                    <select
                      className="input-field"
                      onChange={categorySelectHandler}
                      value={categoryId}
                    >
                      <option value={0}>Select Category</option>
                      {categoryList?.map((c: CategoryItem) => (
                        <option key={c?.categoryId} value={c?.categoryId}>
                          {c?.categoryName}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="-mt-1"
                      onClick={() => openPopupHandler(ServiceMasterPopupName?.CATEGORY)}
                    >
                      <i className="fa-solid fa-circle-plus add-popup-icon"></i>
                    </button>
                  </div>
                </InputField>

                <InputField label="Sub Category">
                  <div className="flex gap-2 items-center">
                    <Select
                      value={selectSubCategoryValue}
                      options={subCategorySelectOption}
                      placeholder="Select sub category"
                      isSearchable
                      isClearable
                      onChange={(option: any) => subCategorySelectHandler(option)}
                      styles={SelectStyles}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                    <button
                      type="button"
                      className="-mt-1"
                      onClick={() => openPopupHandler(ServiceMasterPopupName?.SUB_CATEGORY)}
                    >
                      <i className="fa-solid fa-circle-plus add-popup-icon"></i>
                    </button>
                  </div>
                </InputField>

                <InputField label="Sub Sub Category">
                  <div className="flex gap-2 items-center">
                    <Select
                      value={selectSubSubCategoryValue}
                      options={subSubCategorySelectOption}
                      placeholder="Select sub category"
                      isSearchable
                      isClearable
                      onChange={(option: any) => subSubCategorySelectHandler(option)}
                      styles={SelectStyles}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                    <button
                      type="button"
                      className="-mt-1"
                      onClick={() => openPopupHandler(ServiceMasterPopupName?.SUB_SUB_CATEGORY)}
                    >
                      <i className="fa-solid fa-circle-plus add-popup-icon"></i>
                    </button>
                  </div>
                </InputField>

                <InputField label="Name">
                  <input type="text" className="input-field" />
                </InputField>

                <InputField label="Code">
                  <input type="text" className="input-field" />
                </InputField>

                <InputField label="Status">
                  <input type="text" className="input-field" />
                </InputField>
              </div>
              <div className="form-actions-responsive mt-5">
                <button type="submit" className="save-btn">
                  Save
                </button>
                <button type="button" className="cancel-button">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* render popup */}
      {!!renderPopup && (
        <CreateUpdatePopup
          isOpen={openPopup}
          onClose={closePopupHandler}
          popupName={popupName}
          categoryData={selectedCategory}
          resetCategoryId={setCategoryId}
          resetCategory={setSelectedCategory}
          onCategoryUpdate={refetch}
          subCategoryData={selectSubCategory!}
          resetSubCategoryOption={setSelectSubCategoryValue}
          resetSubCategoryValue={setSelectSubCategory}
          onSubCategoryUpdate={refetchSubCategory}
          subSubCategoryData={selectSubSubCategory}
          resetSubSubCategoryOption={setSubSelectSubCategoryValue}
          resetSubSubCategory={setSelectSubSubCategory}
          onSubSubCategoryUpdate={refetchSubSubCategory}
        />
      )}

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>,
    document.body
  );
};

export default React.memo(AddServiceMaster);
