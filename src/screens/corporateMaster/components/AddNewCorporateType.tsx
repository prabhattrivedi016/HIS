import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";

import {
  AddNewCorporateTypeFormItem,
  addNewCorporateTypeSchema,
} from "@/validation/corporateMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { AddNewCorporateTypeProps } from "../types";

const resetFormData = () => ({
  corporateTypeId: 0,
  corporateTypeName: "",
});

const AddNewCorporateType = ({ isOpen, onClose, data, refreshData }: AddNewCorporateTypeProps) => {
  const { loading, error, fetchApi } = useGlobalApi();
  const buttonTitle = data ? "Update" : "Create";
  const closeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [successMessage, setSuccessMessage] = useState<string>("");

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(addNewCorporateTypeSchema),
    defaultValues: resetFormData(),
  });

  //   edit
  useEffect(() => {
    if (isOpen) {
      reset({
        corporateTypeId: data?.corporateTypeId ?? 0,
        corporateTypeName: data?.corporateTypeName ?? "",
      });
    }
  }, [data, isOpen, reset]);

  //   submit handler
  const onsubmit = async (formData: AddNewCorporateTypeFormItem) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_CORPORATE_TYPE_MASTER,
      formData,
      {},
      { component: "AddNewCorporateType" }
    );
    if (!resp?.result) {
      return;
    }
    setSuccessMessage(resp?.message);
    closeRef.current = setTimeout(() => {
      onClose?.();
      reset(resetFormData());
      setSuccessMessage("");
    }, 1000);
    refreshData?.();
  };

  useEffect(() => {
    return () => {
      if (closeRef.current) {
        clearTimeout(closeRef.current);
      }
    };
  }, []);

  //   cancel handler
  const cancelHandler = () => {
    reset(resetFormData());
  };
  useScrollLock(isOpen);
  return createPortal(
    <div className={`fixed inset-0 z-9999 ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      <div
        className={`central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw]  ${isOpen ? "opacity-full" : ""}`}
      >
        <div className="popup-header">
          <h2 className="popup-helper-text">{buttonTitle} Corporate Type</h2>
          <button onClick={onClose} className="close-drawer-btn">
            ×
          </button>
        </div>

        {!!successMessage && <SuccessMessage text={successMessage} />}
        {error && <ErrorMessage text={error?.message} />}

        <form onSubmit={handleSubmit(onsubmit)}>
          <div className="form-grid-1">
            <InputField label=" Corporate Type Name" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter corporate type name"
                {...register("corporateTypeName")}
              />
              {errors.corporateTypeName && (
                <p className="input-field-error">{errors.corporateTypeName.message}</p>
              )}
            </InputField>
          </div>
          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn">
              {buttonTitle}
            </button>
            <button type="button" className="cancel-button" onClick={cancelHandler}>
              Cancel
            </button>
          </div>
        </form>
      </div>
      {!!loading && <CustomLoader isLoading={loading} />}
    </div>,
    document.body
  );
};

export default AddNewCorporateType;
