import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import { CATEGORY_ID, labTypes } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { subCategoryPopupSchema, subSubCategorySchema } from "@/validation/labInvestigationSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { InferType } from "yup";

type LabInvestigationPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  type?: "subCategory" | "subSubCategory";
  categoryId?: number | null;
  refreshSubCategory?: (savedSubCategoryId?: number) => Promise<void> | void;
  refreshSubSubCategory?: (
    subCategoryId?: number,
    savedSubSubCategoryId?: number
  ) => Promise<void> | void;
  data?:
    | {
        categoryId?: number;
        subCategoryId?: number;
        subCategoryName?: string;
        labTypeId?: number;
        labType?: string;
        value?: number;
        label?: string;
      }
    | {
        subCategoryId?: number;
        subSubCategoryId?: number;
        subSubCategoryName?: string;
        subSubCategoryAlias?: string;
        printOrder?: number | string;
        value?: number;
        label?: string;
      }
    | null;
};

type subcategoryFormItem = InferType<typeof subCategoryPopupSchema>;
type subSubcategoryFormItem = InferType<typeof subSubCategorySchema>;

const getDefaultSubCategoryValues = (categoryId?: number | null): subcategoryFormItem => ({
  subCategoryId: 0,
  subCategoryName: "",
  categoryId: categoryId ?? CATEGORY_ID?.categoryId,
  labTypeId: 1,
  labType: "",
});

const getDefaultSubSubCategoryValues = (subCategoryId?: number): subSubcategoryFormItem => ({
  subSubCategoryId: 0,
  subSubCategoryName: "",
  subCategoryId: subCategoryId ?? 0,
  subSubCategoryAlias: "",
  printOrder: "",
});

const LabInvestigationPopup = ({
  isOpen,
  onClose,
  type,
  data,
  categoryId,
  refreshSubCategory,
  refreshSubSubCategory,
}: LabInvestigationPopupProps) => {
  const { error, loading, fetchApi } = useGlobalApi();
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [successMessage, setSuccessMessage] = useState<string>("");

  const buttonTitle = data ? "Update" : "Create";

  const popupTitle =
    type === "subCategory" ? `${buttonTitle} Sub Type` : `${buttonTitle} Sub Sub Type`;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<subcategoryFormItem>({
    resolver: yupResolver(subCategoryPopupSchema),
    defaultValues: getDefaultSubCategoryValues(categoryId),
  });

  useEffect(() => {
    if (!isOpen) return;

    const seed = {
      subCategoryId: data?.subCategoryId ?? data?.value ?? 0,
      subCategoryName: data?.subCategoryName ?? data?.label ?? "",
      categoryId: data?.categoryId ?? categoryId ?? CATEGORY_ID?.categoryId,
      labTypeId: data?.labTypeId ?? 1,
      labType: data?.labType ?? "",
    };

    reset(seed);
  }, [isOpen, data, reset, categoryId]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      onClose();
      setSuccessMessage("");
      closeTimerRef.current = null;
    }, 1000);
  };

  const resetSubCategoryForm = () => {
    clearCloseTimer();
    setSuccessMessage("");
    reset(getDefaultSubCategoryValues(categoryId));
  };

  const resetSubSubCategoryForm = () => {
    clearCloseTimer();
    setSuccessMessage("");
    subSubReset(getDefaultSubSubCategoryValues(data?.subCategoryId));
  };

  const handleLabTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = Number(e.target.value);
    const selected = labTypes?.find(l => l?.id === val);

    setValue("labTypeId", val);
    setValue("labType", selected?.name ?? "");
  };

  const subCategorySubmitHandler = async (formData: subcategoryFormItem) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_SUB_CATEGORY,
      formData,
      {},
      { component: "LabInvestigationPopup" }
    );
    if (!resp?.result) {
      setSuccessMessage("");
      return;
    }
    setSuccessMessage(resp?.message || "Data saved successfully");
    await refreshSubCategory?.(formData?.subCategoryId ?? 0);
    reset(getDefaultSubCategoryValues(categoryId));
    scheduleClose();
  };

  const {
    register: subSubRegister,
    handleSubmit: subSubHandleSubmit,
    reset: subSubReset,
    formState: { errors: subSubErrors },
  } = useForm<subSubcategoryFormItem>({
    resolver: yupResolver(subSubCategorySchema),
    defaultValues: getDefaultSubSubCategoryValues(),
  });

  useEffect(() => {
    if (!isOpen || type !== "subSubCategory") return;

    subSubReset({
      subSubCategoryId: data?.subSubCategoryId ?? data?.value ?? 0,
      subSubCategoryName: data?.subSubCategoryName ?? data?.label ?? "",
      subCategoryId: data?.subCategoryId ?? 0,
      subSubCategoryAlias: data?.subSubCategoryAlias ?? "",
      printOrder: data?.printOrder?.toString?.() ?? "",
    });
  }, [isOpen, type, data, subSubReset]);

  const subSubcategorySubmitHandler = async (formData: subSubcategoryFormItem) => {
    const payload = {
      subSubCategoryId: formData?.subSubCategoryId ?? 0,
      subSubCategoryName: formData?.subSubCategoryName ?? "",
      subCategoryId: formData?.subCategoryId ?? 0,
      subSubCategoryAlias: formData?.subSubCategoryAlias ?? "",
      printOrder: Number(formData?.printOrder || 0),
    };

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_SUB_SUB_CATEGORY,
      payload,
      {},
      { component: "LabInvestigationPopup" }
    );

    if (!resp?.result) {
      setSuccessMessage("");
      return;
    }

    setSuccessMessage(resp?.message || "data saved successfully");
    await refreshSubSubCategory?.(payload.subCategoryId, payload.subSubCategoryId);
    subSubReset(getDefaultSubSubCategoryValues(data?.subCategoryId));
    scheduleClose();
  };
  const renderComponent = (popupType?: "subCategory" | "subSubCategory") => {
    switch (popupType) {
      case "subCategory":
        return (
          <form onSubmit={handleSubmit(subCategorySubmitHandler)}>
            <div className="form-grid-1">
              <InputField label="Sub Category Name" required>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter sub category name"
                  {...register("subCategoryName")}
                />
                {errors.subCategoryName && (
                  <p className="input-field-error">{errors.subCategoryName.message}</p>
                )}
              </InputField>

              <InputField label="Lab Type Name" required>
                <select
                  className="input-field"
                  {...register("labTypeId")}
                  onChange={handleLabTypeChange}
                >
                  {labTypes?.map(l => (
                    <option key={l?.id} value={l?.id}>
                      {l?.name}
                    </option>
                  ))}
                </select>
                {errors.labTypeId && (
                  <p className="input-field-error">{errors.labTypeId.message}</p>
                )}
              </InputField>
            </div>
            <div className="form-actions-responsive mt-5">
              <button type="submit" className="save-btn">
                {buttonTitle}
              </button>
              <button type="button" className="cancel-button" onClick={resetSubCategoryForm}>
                Cancel
              </button>
            </div>
          </form>
        );

      case "subSubCategory":
        return (
          <form onSubmit={subSubHandleSubmit(subSubcategorySubmitHandler)}>
            <div className="form-grid-1">
              <InputField label="Sub Sub Category Name" required>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter sub sub category name"
                  {...subSubRegister("subSubCategoryName")}
                />
                {subSubErrors.subSubCategoryName && (
                  <p className="input-field-error">{subSubErrors.subSubCategoryName.message}</p>
                )}
              </InputField>
            </div>

            <div className="form-actions-responsive mt-5">
              <button type="submit" className="save-btn">
                {buttonTitle}
              </button>

              <button type="button" className="cancel-button" onClick={resetSubSubCategoryForm}>
                Cancel
              </button>
            </div>
          </form>
        );
      default:
        return null;
    }
  };

  return createPortal(
    <div className={`fixed inset-0 z-9999 ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      <div
        className={`central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] ${isOpen ? "opacity-full" : ""}`}
      >
        <div className="popup-header">
          <h2 className="popup-helper-text">{popupTitle}</h2>
          <button onClick={onClose} className="close-drawer-btn">
            ×
          </button>
        </div>

        {successMessage && <SuccessMessage text={successMessage} />}
        {error && <ErrorMessage text={error?.message} />}

        {renderComponent(type!)}
      </div>
      {!!loading && <CustomLoader isLoading={loading} />}
    </div>,
    document.body
  );
};

export default LabInvestigationPopup;
