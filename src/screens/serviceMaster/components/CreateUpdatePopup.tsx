import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import { ServiceMasterPopupName, Status } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import { SelectItem } from "@/types";
import { allowOnlyText } from "@/utils/inputValidationHandler";
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
import React, {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
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
import DoctorDepartmentPopup from "./DoctorDepartmentPopup";
import PrintPopup from "./PrintPopupGroup";

const CreateUpdatePopup = ({
  isOpen,
  onClose,
  popupName,
  categoryData,
  resetCategoryId,
  resetCategory,
  onCategoryUpdate,
  subCategoryData,
  resetSubCategoryOption,
  resetSubCategoryValue,
  onSubCategoryUpdate,
  subSubCategoryData,
  resetSubSubCategoryOption,
  resetSubSubCategory,
  onSubSubCategoryUpdate,
}: {
  isOpen: boolean;
  onClose: () => void;
  popupName: string;
  categoryData?: CategoryItem | null;
  resetCategoryId: Dispatch<SetStateAction<number>>;
  resetCategory: Dispatch<SetStateAction<CategoryItem | null>>;
  onCategoryUpdate: () => Promise<QueryObserverResult<any, Error>>;
  subCategoryData?: SubCategoryItem;
  refreshSubCategory?: () => Promise<void>;
  resetSubCategoryOption?: Dispatch<SetStateAction<SelectItem | null>>;
  resetSubCategoryValue?: Dispatch<SetStateAction<SubCategoryItem | null>>;
  onSubCategoryUpdate?: () => Promise<QueryObserverResult<any, Error>>;
  subSubCategoryData?: SubSubCategoryItem | null;
  resetSubSubCategoryOption?: Dispatch<SetStateAction<SelectItem | null>>;
  resetSubSubCategory?: Dispatch<SetStateAction<SubSubCategoryItem | null>>;
  onSubSubCategoryUpdate?: () => Promise<QueryObserverResult<any, Error>>;
}) => {
  const { loading, fetchApi } = useGlobalApi();
  const categoryButtonTitle = categoryData === null ? "Create" : "Update";
  const subCategoryButtonTitle = subCategoryData === null ? "Create" : "Update";
  const subSubCategoryButtonTitle = subSubCategoryData?.subSubCategoryId ? "Update" : "Create";

  const [openPrintPopup, setOpenPrintPopup] = useState<boolean>(false);
  const [renderPrintPopup, setRenderPrintPopup] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [printName, setPrintName] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [selectPrintGroupId, setSelectedPrintGroupId] = useState<number>(0);
  const [selectedPrintGroup, setSelectedPrintGroup] = useState<PrintGroupItem | null>(null);

  const [openDoctorDepartmentPopup, setOpenDoctorDepartmentPopup] = useState<boolean>(false);
  const [renderDoctorDepartmentPopup, setRenderDoctorDepartmentPopup] = useState<boolean>(false);
  const [selectedDoctorDepartment, setSelectedDoctorDepartment] =
    useState<DoctorDepartmentList | null>(null);

  // category type list
  const getCategoryTypeList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CATEGORY_TYPE_LIST,
      {},
      { params: { categoryTypeIds: "8,2,1,4,5,10,9" } },
      { component: "CreateUpdatePopup" }
    );
    return resp?.data ?? [];
  };

  const { data: categoryType = [] } = useQuery({
    queryKey: ["getCategoryTypeList"],
    queryFn: getCategoryTypeList,
  });

  // print group list
  const getPrintGroup = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PRINT_GROUP_MASTER,
      {},
      {},
      { component: "CreateUpdatePopup" }
    );
    return resp?.data ?? [];
  };

  const { data: printGroupList = [], refetch } = useQuery({
    queryKey: ["getPrintGroup"],
    queryFn: getPrintGroup,
  });

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
    return resp?.data ?? [];
  };

  const { data: doctorDepartmentList = [], refetch: refetchDoctorDepartment } = useQuery({
    queryKey: ["getDoctorDepartmentList"],
    queryFn: getDoctorDepartmentList,
  });

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
      categoryId: categoryData?.categoryId,
      labTypeId: 0,
      labType: "",
    },
  });

  const subSubCategoryForm = useForm({
    resolver: yupResolver(createUpdateSubSubCategorySchema),
    defaultValues: {
      subSubCategoryId: 0,
      subSubCategoryName: "",
      subCategoryId: subCategoryData?.subCategoryId,
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
    categoryForm.setValue("categoryTypeId", category?.categoryTypeId);
    categoryForm.setValue("categoryTypeName", category?.categoryTypeName);
  }, [popupName, categoryData, categoryType, categoryForm?.reset]);

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
    if (!isOpen || popupName !== ServiceMasterPopupName.SUB_SUB_CATEGORY) return;

    subSubCategoryForm.reset({
      subSubCategoryId: subSubCategoryData?.subSubCategoryId ?? 0,
      subSubCategoryName: subSubCategoryData?.subSubCategoryName ?? "",
      subCategoryId: subSubCategoryData?.subCategoryId ?? subCategoryData?.subCategoryId ?? 0,
      printGroupId: subSubCategoryData?.printGroupId ?? 0,
      departmentId: subSubCategoryData?.departmentId ?? 0,
    });

    if (!subSubCategoryData?.subSubCategoryId) {
      setSelectedPrintGroupId(0);
      setSelectedPrintGroup(null);
      setSelectedDoctorDepartment(null);
      return;
    }

    const printGroup = printGroupList.find(
      (p: PrintGroupItem) => Number(p.PrintGroupId) === Number(subSubCategoryData?.printGroupId)
    );

    if (printGroup) {
      setSelectedPrintGroup(printGroup);
      setSelectedPrintGroupId(printGroup.PrintGroupId);
      subSubCategoryForm.setValue("printGroupId", printGroup.PrintGroupId);
    } else {
      setSelectedPrintGroupId(Number(subSubCategoryData?.printGroupId ?? 0));
    }

    const department = doctorDepartmentList.find(
      (d: DoctorDepartmentList) =>
        Number(d.departmentId) === Number(subSubCategoryData?.departmentId)
    );

    if (department) {
      setSelectedDoctorDepartment(department);
      subSubCategoryForm.setValue("departmentId", department.departmentId);
    }
  }, [
    isOpen,
    popupName,
    subSubCategoryData,
    subCategoryData,
    doctorDepartmentList,
    printGroupList,
    subSubCategoryForm,
  ]);

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
    resetCategoryId?.(0);
    resetCategory?.(null);
    await onCategoryUpdate?.();
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
    resetSubCategoryOption?.(null);
    resetSubCategoryValue?.(null);
    await onSubCategoryUpdate?.();
    setTimeout(() => {
      subCategoryForm.reset({
        subCategoryId: 0,
        subCategoryName: "",
        categoryId: categoryData?.categoryId,
        labTypeId: 0,
        labType: "",
      });
      onClose();
    }, 500);
  };

  // print group select handler
  const printGroupSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    if (!value) {
      setSelectedPrintGroupId(0);
      setSelectedPrintGroup(null);
      subSubCategoryForm?.setValue("printGroupId", 0);
      return;
    }
    setSelectedPrintGroupId(value);
    subSubCategoryForm?.setValue("printGroupId", value);

    const print = printGroupList?.find((p: PrintGroupItem) => p?.PrintGroupId === value);
    setSelectedPrintGroup(print);
  };

  // sub sub category submit handler
  const subSubcategorySubmitHandler = async (formData: CreateUpdateSubSubCategoryFormItem) => {
    const payload = {
      ...formData,
      subCategoryId: subCategoryData?.subCategoryId ?? 0,
    };

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_SUB_SUB_CATEGORY,
      payload,
      {},
      { component: "CreateUpdatePopup" }
    );
    if (!resp?.result) {
      setErrorMessage(resp?.message ?? "Failed to update category");
      return;
    }
    setSuccessMessage(resp?.message ?? "Data saved successfully");
    resetSubSubCategoryOption?.(null);
    resetSubSubCategory?.(null);
    await onSubSubCategoryUpdate?.();
    setTimeout(() => {
      subSubCategoryForm.reset({
        subSubCategoryId: 0,
        subSubCategoryName: "",
        subCategoryId: subCategoryData?.subCategoryId,
        printGroupId: 0,
        departmentId: 0,
      });
      onClose();
    }, 500);
  };

  // category cancel handler
  const categoryCancelHandler = () => {
    categoryForm?.reset({
      categoryId: 0,
      categoryName: "",
      categoryTypeId: 0,
      categoryTypeName: "",
    });
  };

  // sub category cancel handler
  const subCategoryCancelHandler = () => {
    subCategoryForm?.reset({
      subCategoryId: 0,
      subCategoryName: "",
      categoryId: categoryData?.categoryId,
      labTypeId: 0,
      labType: "",
    });
  };

  // sub sub category cancel handler
  const subSubCategoryCancelHandler = () => {
    subSubCategoryForm?.reset({
      subSubCategoryId: 0,
      subSubCategoryName: "",
      subCategoryId: subCategoryData?.subCategoryId,
      printGroupId: 0,
      departmentId: 0,
    });
  };

  // popup handler
  const openPopupHandler = (popupName: string) => {
    switch (popupName) {
      case ServiceMasterPopupName?.PRINT_GROUP: {
        setOpenPrintPopup(true);
        setRenderPrintPopup(true);
        setPrintName(popupName);
        return;
      }
      case ServiceMasterPopupName?.REVENUE_DEPARTMENT: {
        setOpenDoctorDepartmentPopup(true);
        setRenderDoctorDepartmentPopup(true);
        return;
      }
      default:
        return;
    }
  };

  // doctor department handler
  const doctorDepartmentChangeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);

    subSubCategoryForm.setValue("departmentId", value, {
      shouldValidate: true,
      shouldDirty: true,
    });

    const selected = doctorDepartmentList.find(
      (d: DoctorDepartmentList) => Number(d.departmentId) === value
    );

    setSelectedDoctorDepartment(selected ?? null);
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
              <input
                type="text"
                className="input-field"
                placeholder="Enter category name"
                {...register("categoryName")}
                onInput={allowOnlyText}
              />
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

              <button type="button" className="cancel-button" onClick={categoryCancelHandler}>
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
              <input
                type="text"
                className="input-field"
                placeholder="Enter sub category name"
                {...register("subCategoryName")}
                onInput={allowOnlyText}
              />
              {errors.subCategoryName && (
                <p className="input-field-error">{errors.subCategoryName.message}</p>
              )}
            </InputField>

            <div className="form-actions-responsive mt-5">
              <button type="submit" className="save-btn">
                {subCategoryButtonTitle}
              </button>

              <button type="button" className="cancel-button" onClick={subCategoryCancelHandler}>
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
          watch,
          setValue,
          formState: { errors },
        } = subSubCategoryForm;
        return (
          <form onSubmit={handleSubmit(subSubcategorySubmitHandler)}>
            <InputField label="Sub Sub Category Name" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter sub sub category name"
                {...register("subSubCategoryName")}
                onInput={allowOnlyText}
              />
              {errors.subSubCategoryName && (
                <p className="input-field-error">{errors.subSubCategoryName.message}</p>
              )}
            </InputField>

            <InputField label="Revenue Department" required>
              <div className="flex gap-2 items-center">
                <select
                  value={watch("departmentId")}
                  className="input-field"
                  {...register("departmentId")}
                  onChange={doctorDepartmentChangeHandler}
                >
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
                <button
                  type="button"
                  className="-mt-1"
                  onClick={() => openPopupHandler(ServiceMasterPopupName?.REVENUE_DEPARTMENT)}
                >
                  <i className="fa-solid fa-circle-plus add-popup-icon"></i>
                </button>
              </div>
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

              <button type="button" className="cancel-button" onClick={subSubCategoryCancelHandler}>
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

  // close doctor department handler
  const closeDoctorDepartmentHandler = useCallback(() => {
    setOpenDoctorDepartmentPopup(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setRenderDoctorDepartmentPopup(false);
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

      {/* doctor department */}
      {!!renderDoctorDepartmentPopup && (
        <DoctorDepartmentPopup
          isOpen={openDoctorDepartmentPopup}
          onClose={closeDoctorDepartmentHandler}
          data={selectedDoctorDepartment}
          refreshDepartment={refetchDoctorDepartment}
        />
      )}

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>,
    document.body
  );
};

export default React.memo(CreateUpdatePopup);
