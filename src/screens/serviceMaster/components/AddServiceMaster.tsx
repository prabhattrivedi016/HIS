import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { ServiceMasterPopupName } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useQuery } from "@tanstack/react-query";
import React, { ChangeEvent, useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CategoryItem, ServiceTableItem } from "../types";
import CreateUpdatePopup from "./CreateUpdatePopup";

const AddServiceMaster = ({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: ServiceTableItem;
}) => {
  const { loading, fetchApi } = useGlobalApi();
  const buttonTitle = data ? "Update" : "Create";
  const [renderPopup, setRenderPopup] = useState<boolean>(false);
  const [openPopup, setOpenPopup] = useState<boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [popupName, setPopupName] = useState<string>("");

  const [categoryId, setCategoryId] = useState<Number>(0);
  const [selectedData, setSelectedData] = useState<CategoryItem | null>(null);

  // get categoryLists
  const getCategories = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CATEGORY_LIST,
      {},
      { params: { categoryTypeIds: "8,2,1,4,5,10,9" } },
      { component: "ServiceMaster" }
    );
    return resp?.data;
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
        setPopupName(ServiceMasterPopupName?.SUB_CATEGORY);
        setOpenPopup(true);
        setRenderPopup(true);
        return;
      }

      case ServiceMasterPopupName?.SUB_SUB_CATEGORY: {
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
    if (!value) {
      setCategoryId(0);
      setSelectedData(null);
      return;
    }
    setCategoryId(value);
    const category = categoryList?.find((c: CategoryItem) => c?.categoryId === value);
    setSelectedData(category);
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
                    <input className="input-field" />
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
                    <input className="input-field" />
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
          data={selectedData}
          onCategoryUpdate={refetch}
        />
      )}

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>,
    document.body
  );
};

export default React.memo(AddServiceMaster);
