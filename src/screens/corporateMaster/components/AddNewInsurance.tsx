import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import { AddNewInsuranceFormItem, addNewInsuranceSchema } from "@/validation/corporateMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { AddNewInsuranceProps } from "../types";

const resetFormData = () => ({
  insuranceCompanyId: 0,
  insuranceCompanyName: "",
});

const AddNewInsurance = ({ isOpen, onClose, data, refresh }: AddNewInsuranceProps) => {
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
    resolver: yupResolver(addNewInsuranceSchema),
  });

  useEffect(() => {
    if (!isOpen) return;

    reset({
      insuranceCompanyId: data?.insuranceCompanyId ?? 0,
      insuranceCompanyName: data?.insuranceCompanyName ?? "",
    });
  }, [isOpen, data, reset]);

  const onSubmit = async (formData: AddNewInsuranceFormItem) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_INSURANCE_COMPANY_MASTER,
      formData,
      {},
      { component: "AddNewInsurance" }
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
    refresh?.();
  };

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

      <div className={`central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] ${isOpen ? "opacity-full" : ""}`}>
        <div className="popup-header">
          <h2 className="popup-helper-text">{buttonTitle} Insurance Name</h2>
          <button onClick={onClose} className="close-drawer-btn">
            ×
          </button>
        </div>

        {!!successMessage && <SuccessMessage text={successMessage} />}
        {error && <ErrorMessage text={error?.message} />}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid-1">
            <InputField label=" Insurance Company Name" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter insurance company name"
                {...register("insuranceCompanyName")}
              />
              {errors.insuranceCompanyName && (
                <p className="input-field-error">{errors.insuranceCompanyName.message}</p>
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

export default AddNewInsurance;
