import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import { ServiceMasterPopupName, Status } from "@/constants/constants";
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
import {
  CategoryItem,
  CategoryTypeItem,
  DoctorDepartmentList,
  PrintGroupItem,
  SubCategoryItem,
  SubSubCategoryItem,
} from "../types";
import PrintPopup from "./PrintPopupGroup";

const CreateUpdatePopup = ({
  isOpen,
  onClose,
  popupName,
  categoryData,
  onCategoryUpdate,
  subCategoryData,
  subSubCategoryData,
  refreshSubCategory,
}: {
  isOpen: boolean;
  onClose: () => void;
  popupName: string;
  categoryData?: CategoryItem | null;
  onCategoryUpdate: () => Promise<QueryObserverResult<any, Error>>;
  subCategoryData?: SubCategoryItem;
  subSubCategoryData?: SubSubCategoryItem;
  refreshSubCategory?: () => Promise<void>;
}) => {
  const { loading, fetchApi } = useGlobalApi();
  const categoryButtonTitle = categoryData === null ? "Create" : "Update";
  const subCategoryButtonTitle = subCategoryData === null ? "Create" : "Update";
  const subSubCategoryButtonTitle = subSubCategoryData === null ? "Create" : "Update";

  const [openPrintPopup, setOpenPrintPopup] = useState<boolean>(false);
  const [renderPrintPopup, setRenderPrintPopup] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [printName, setPrintName] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [selectPrintGroupId, setSelectedPrintGroupId] = useState<number>(0);
  const [selectedPrintGroup, setSelectedPrintGroup] = useState<PrintGroupItem | null>(null);

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
      subCategoryId: 0,
      subCategoryName: "",
      categoryId: 0,
      labTypeId: 0,
      labType: "",
    },
  });

  const subSubCategoryForm = useForm({
    resolver: yupResolver(createUpdateSubSubCategorySchema),
    defaultValues: {
      subSubCategoryId: 0,
      subSubCategoryName: "",
      subCategoryId: 0,
      printGroupId: 0,
      departmentId: 0,
    },
  });

  // category
  useEffect(() => {
    if (popupName !== ServiceMasterPopupName?.CATEGORY) return;
    categoryForm.reset({
      categoryId: categoryData?.categoryId ?? 0,
      categoryName: categoryData?.categoryName ?? "",
      categoryTypeId: categoryData?.categoryTypeId ?? 0,
      categoryTypeName: categoryData?.categoryTypeName ?? "",
    });
    const category = categoryType.find(
      (c: CategoryTypeItem) => c?.categoryTypeId === categoryData?.categoryTypeId
    );
    categoryForm.setValue("categoryTypeId", category?.categoryTypeId!);
    categoryForm.setValue("categoryTypeName", category?.categoryTypeName!);
  }, [popupName, categoryData, categoryForm?.reset]);

  // sub category
  useEffect(() => {
    if (popupName !== ServiceMasterPopupName?.SUB_CATEGORY) return;
    subCategoryForm?.reset({
      subCategoryId: subCategoryData?.subCategoryId,
      subCategoryName: subCategoryData?.subCategoryName,
      categoryId: subCategoryData?.categoryId,
      labTypeId: subCategoryData?.labTypeId,
      labType: "",
    });
  }, [popupName, subCategoryData, subCategoryForm?.reset]);

  // sub sub category
  useEffect(() => {
    if (popupName !== ServiceMasterPopupName?.SUB_SUB_CATEGORY) return;
    subSubCategoryForm?.reset({
      subSubCategoryId: subSubCategoryData?.subSubCategoryId ?? 0,
      subSubCategoryName: subSubCategoryData?.subSubCategoryName ?? "",
      subCategoryId: subSubCategoryData?.subCategoryId ?? 0,
      printGroupId: subSubCategoryData?.printGroupId ?? 0,
      departmentId: subSubCategoryData?.departmentId ?? 0,
    });
  }, [popupName, subSubCategoryData, subSubCategoryForm?.reset]);

  // category type list
  const getCategoryTypeList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CATEGORY_TYPE_LIST,
      {},
      {},
      { component: "CreateUpdatePopup" }
    );
    return resp?.data ?? [];
  };

  const { data: categoryType = [] } = useQuery({
    queryKey: ["getCategoryTypeList"],
    queryFn: getCategoryTypeList,
  });

  // print group li
  const getPrintGroup = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PRINT_GROUP_MASTER,
      {},
      {},
      { component: "CreateUpdatePopup" }
    );
    console.log("resp of print group", resp?.data);
    return resp?.data ?? [];
  };

  const { data: printGroupList = [], refetch } = useQuery({
    queryKey: ["getPrintGroup"],
    queryFn: getPrintGroup,
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
  const subcategorySubmitHandler = async (formData: CreateUpdateSubCategoryFormItem) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_SUB_CATEGORY,
      formData,
      {},
      { component: "CreateUpdatePopup" }
    );
    if (!resp?.result) {
      setErrorMessage(resp?.message ?? "Failed to update category");
      return;
    }
    setSuccessMessage(resp?.message ?? "Data saved successfully");
    setTimeout(() => {
      subCategoryForm.reset({
        subCategoryId: 0,
        subCategoryName: "",
        categoryId: 0,
        labTypeId: 0,
        labType: "",
      });
      onClose();
    }, 500);
  };

  // doctor department list
  const getDoctorDepartmentList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_DEPARTMENT_LIST,
      {},
      {
        params: { isActive: Status?.ACTIVE },
      },
      { component: "CreateUpdatePopup" }
    );
    console.log("resp of doctor department", resp?.data);
    return resp?.data ?? [];
  };

  const { data: doctorDepartmentList = [] } = useQuery({
    queryKey: ["getDoctorDepartmentList"],
    queryFn: getDoctorDepartmentList,
  });

  // print group select handler
  const printGroupSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    if (!value) {
      setSelectedPrintGroupId(0);
      setSelectedPrintGroup(null);
      return;
    }
    setSelectedPrintGroupId(value);
    const print = printGroupList?.find((p: PrintGroupItem) => p?.PrintGroupId === value);
    setSelectedPrintGroup(print);
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
                {categoryButtonTitle}
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
              <input type="text" className="input-field" {...register("subCategoryName")} />
              {errors.subCategoryName && (
                <p className="input-field-error">{errors.subCategoryName.message}</p>
              )}
            </InputField>

            <div className="form-actions-responsive mt-5">
              <button type="submit" className="save-btn">
                {subCategoryButtonTitle}
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
              <select className="input-field">
                <option value={0}>Select Revenue Department</option>
                {doctorDepartmentList?.map((d: DoctorDepartmentList) => (
                  <option key={d?.departmentId} value={d?.departmentId}>
                    {d?.department}
                  </option>
                ))}
              </select>
              {errors.departmentId && (
                <p className="input-field-error">{errors.departmentId.message}</p>
              )}
            </InputField>

            <InputField label="Print Group" required>
              <div className="flex gap-2 items-center">
                <select
                  className="input-field"
                  onChange={printGroupSelectHandler}
                  value={selectPrintGroupId}
                >
                  <option value={0}>Select Print Group</option>
                  {printGroupList?.map((p: PrintGroupItem) => (
                    <option key={p?.PrintGroupId} value={p?.PrintGroupId}>
                      {p?.PrintGroupName}
                    </option>
                  ))}
                </select>
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
                {subSubCategoryButtonTitle}
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
              ? `${categoryButtonTitle} Category`
              : popupName === ServiceMasterPopupName?.SUB_CATEGORY
                ? `${subCategoryButtonTitle} Sub Category`
                : `${subSubCategoryButtonTitle} Sub Sub Category`}
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
        <PrintPopup
          isOpen={openPrintPopup}
          onClose={closePrintHandler}
          popupName={printName}
          data={selectedPrintGroup}
          refreshData={refetch}
          resetPrintGroupId={setSelectedPrintGroupId}
          resetData={setSelectedPrintGroup}
        />
      )}

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>,
    document.body
  );
};

export default React.memo(CreateUpdatePopup);
