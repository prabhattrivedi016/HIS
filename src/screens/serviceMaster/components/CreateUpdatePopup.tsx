import InputField from "@/components/customInputField";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import { ServiceMasterPopupName } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import {
  CreateUpdateCategoryFormItem,
  createUpdateCategorySchema,
  CreateUpdateSubCategoryFormItem,
  createUpdateSubCategorySchema,
  CreateUpdateSubSubCategoryFormItem,
  createUpdateSubSubCategorySchema,
} from "@/validation/serviceMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { QueryObserverResult, useQuery } from "@tanstack/react-query";
import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { CategoryItem, CategoryTypeItem } from "../types";
import PrintPopup from "./PrintPopup";

const CreateUpdatePopup = ({
  isOpen,
  onClose,
  popupName,
  data,
  onCategoryUpdate,
}: {
  isOpen: boolean;
  onClose: () => void;
  popupName: string;
  data?: CategoryItem | null;
  onCategoryUpdate: () => Promise<QueryObserverResult<any, Error>>;
}) => {
  const { loading, fetchApi } = useGlobalApi();
  console.log("data update data of create update", data);
  const buttonTitle = data === null ? "Create" : "Update";
  const [openPrintPopup, setOpenPrintPopup] = useState<boolean>(false);
  const [renderPrintPopup, setRenderPrintPopup] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [printName, setPrintName] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // popup handler
  const openPopupHandler = (popupName: string) => {
    console.log("popup name", popupName);
    setOpenPrintPopup(true);
    setRenderPrintPopup(true);
    setPrintName(popupName);
  };

  // form schema
  const categoryForm = useForm({
    resolver: yupResolver(createUpdateCategorySchema),
    defaultValues: {
      categoryId: 0,
      categoryName: "",
      categoryTypeId: 0,
      categoryTypeName: "",
    },
  });

  const subCategoryForm = useForm({
    resolver: yupResolver(createUpdateSubCategorySchema),
    defaultValues: {
      subCategoryId: null,
      subCategoryName: "",
      categoryId: null,
      labTypeId: null,
      labType: "",
    },
  });

  const subSubCategoryForm = useForm({
    resolver: yupResolver(createUpdateSubSubCategorySchema),
    defaultValues: {
      subSubCategoryId: null,
      subSubCategoryName: "",
      subCategoryId: null,
      printGroupId: 0,
      departmentId: 0,
    },
  });

  useEffect(() => {
    if (popupName === ServiceMasterPopupName?.CATEGORY) {
      categoryForm.reset({
        categoryId: data?.categoryId ?? 0,
        categoryName: data?.categoryName ?? "",
        categoryTypeId: data?.categoryTypeId ?? 0,
        categoryTypeName: data?.categoryTypeName ?? "",
      });
      const category = categoryType.find(
        (c: CategoryTypeItem) => c?.categoryTypeId === data?.categoryTypeId
      );
      categoryForm.setValue("categoryTypeId", category?.categoryTypeId!);
      categoryForm.setValue("categoryTypeName", category?.categoryTypeName!);
    }
  }, [popupName, data, categoryForm.reset]);

  // category type list
  const getCategoryTypeList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CATEGORY_TYPE_LIST,
      {},
      {},
      { component: "CreateUpdatePopup" }
    );
    return resp?.data;
  };

  const { data: categoryType = [] } = useQuery({
    queryKey: ["getCategoryTypeList"],
    queryFn: getCategoryTypeList,
  });

  // category type select handler
  const categoryTypeSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    if (!value) return;
    const category = categoryType.find((c: CategoryTypeItem) => c?.categoryTypeId === value);
    categoryForm.setValue("categoryTypeId", category?.categoryTypeId);
    categoryForm.setValue("categoryTypeName", category?.categoryTypeName);
  };
  // category submit handler
  const categorySubmitHandler = async (formData: CreateUpdateCategoryFormItem) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_CATEGORY,
      formData,
      {},
      { component: "CreateUpdatePopup" }
    );
    if (!resp?.result) {
      setErrorMessage(resp?.message ?? "Failed to update category");
      return;
    }
    setSuccessMessage(resp?.message ?? "Data saved successfully");
    onCategoryUpdate?.();
    setTimeout(() => {
      categoryForm.reset({
        categoryId: 0,
        categoryName: "",
        categoryTypeId: 0,
        categoryTypeName: "",
      });
      onClose();
    }, 500);
  };

  // sub category submit handler
  const subcategorySubmitHandler = (formData: CreateUpdateSubCategoryFormItem) => {
    console.log("form", formData);
  };

  // sub category submit handler
  const subSubcategorySubmitHandler = (formData: CreateUpdateSubSubCategoryFormItem) => {
    console.log("form", formData);
  };

  // render component
  const renderComponent = () => {
    switch (popupName) {
      case ServiceMasterPopupName?.CATEGORY: {
        const {
          register,
          handleSubmit,
          reset,
          setValue,
          watch,
          formState: { errors },
        } = categoryForm;
        return (
          <form onSubmit={handleSubmit(categorySubmitHandler)}>
            <InputField label="Category Name" required>
              <input type="text" className="input-field" {...register("categoryName")} />
              {errors.categoryName && (
                <p className="input-field-error">{errors.categoryName.message}</p>
              )}
            </InputField>

            <InputField label="Category Type" required>
              <select
                className="input-field"
                onChange={categoryTypeSelectHandler}
                value={categoryForm.watch("categoryTypeId")}
              >
                <option>Select Category Type</option>
                {categoryType?.map((c: CategoryTypeItem) => (
                  <option key={c?.categoryTypeId} value={c?.categoryTypeId}>
                    {c?.categoryTypeName}
                  </option>
                ))}
              </select>
              {errors.categoryTypeName && (
                <p className="input-field-error">{errors.categoryTypeName.message}</p>
              )}
            </InputField>

            <div className="form-actions-responsive mt-5">
              <button type="submit" className="save-btn">
                {buttonTitle}
              </button>

              <button type="button" className="cancel-button">
                Cancel
              </button>
            </div>
          </form>
        );
      }

      case ServiceMasterPopupName?.SUB_CATEGORY: {
        const {
          register,
          handleSubmit,
          reset,
          setValue,
          formState: { errors },
        } = subCategoryForm;
        return (
          <form onSubmit={handleSubmit(subcategorySubmitHandler)}>
            <InputField label="Sub Category Name" required>
              <input type="text" className="input-field" />
              {errors.subCategoryName && (
                <p className="input-field-error">{errors.subCategoryName.message}</p>
              )}
            </InputField>

            <div className="form-actions-responsive mt-5">
              <button type="submit" className="save-btn">
                {buttonTitle}
              </button>

              <button type="button" className="cancel-button">
                Cancel
              </button>
            </div>
          </form>
        );
      }

      case ServiceMasterPopupName?.SUB_SUB_CATEGORY: {
        const {
          register,
          handleSubmit,
          reset,
          setValue,
          formState: { errors },
        } = subSubCategoryForm;
        return (
          <form onSubmit={handleSubmit(subSubcategorySubmitHandler)}>
            <InputField label="Sub Sub Category Name" required>
              <input type="text" className="input-field" />
              {errors.subSubCategoryName && (
                <p className="input-field-error">{errors.subSubCategoryName.message}</p>
              )}
            </InputField>

            <InputField label="Revenue Department" required>
              <input type="text" className="input-field" />
              {errors.departmentId && (
                <p className="input-field-error">{errors.departmentId.message}</p>
              )}
            </InputField>

            <InputField label="Print Group" required>
              <div className="flex gap-2 items-center">
                <input type="text" className="input-field" />
                {errors.printGroupId && (
                  <p className="input-field-error">{errors.printGroupId.message}</p>
                )}
                <button
                  type="button"
                  className="-mt-1"
                  onClick={() => openPopupHandler(ServiceMasterPopupName?.PRINT_GROUP)}
                >
                  <i className="fa-solid fa-circle-plus add-popup-icon"></i>
                </button>
              </div>
            </InputField>

            <div className="form-actions-responsive mt-5">
              <button type="submit" className="save-btn">
                {buttonTitle}
              </button>

              <button type="button" className="cancel-button">
                Cancel
              </button>
            </div>
          </form>
        );
      }

      default:
        return <></>;
    }
  };

  // close popup handler
  const closePrintHandler = useCallback(() => {
    setOpenPrintPopup(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setRenderPrintPopup(false);
    }, 100);
  }, []);

  useScrollLock(isOpen);

  return createPortal(
    <div className={`fixed inset-0 z-999 ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      <div
        className={`central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] ${
          isOpen ? "opacity-full" : ""
        }`}
      >
        <div className="popup-header min-w-0">
          <h2 className="popup-helper-text truncate">
            {popupName === ServiceMasterPopupName?.CATEGORY
              ? `${buttonTitle} Category`
              : popupName === ServiceMasterPopupName?.SUB_CATEGORY
                ? `${buttonTitle} Sub Category`
                : `${buttonTitle} Sub Sub Category`}
          </h2>

          <button onClick={onClose} className="close-drawer-btn shrink-0 ml-3">
            ×
          </button>
        </div>

        {!!successMessage && <SuccessMessage text={successMessage} />}
        {!!errorMessage && <ErrorMessage text={errorMessage} />}

        {renderComponent()}
      </div>

      {/* print popup */}
      {!!renderPrintPopup && (
        <PrintPopup isOpen={openPrintPopup} onClose={closePrintHandler} popupName={printName} />
      )}
    </div>,
    document.body
  );
};

export default React.memo(CreateUpdatePopup);
