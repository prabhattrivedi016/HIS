import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { SuccessMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showWarning } from "@/utils/alert";
import { lovsPopupFormData, lovsPopupSchema } from "@/validation/investigationInterpretationSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";

type LovsPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  lovId?: number;
  lovName?: string;
  onSaved?: () => void | Promise<void>;
};

const LovsPopup = React.memo(
  ({ isOpen, onClose, lovId = 0, lovName = "", onSaved }: LovsPopupProps) => {
    const { loading, fetchApi } = useGlobalApi();

    const [successMessage, setSuccessMessage] = useState<string>("");

    const {
      register,
      handleSubmit,
      reset,
      watch,
      formState: { errors },
    } = useForm({
      resolver: yupResolver(lovsPopupSchema),
      defaultValues: {
        lovId: 0,
        lovName: "",
      },
    });

    const isEdit = Boolean(watch("lovId"));
    const buttonTitle = isEdit ? "Update" : "Create";

    useEffect(() => {
      if (!isOpen) return;
      reset({
        lovId,
        lovName,
      });
    }, [isOpen, lovId, lovName, reset]);

    const submitHandler = async (formData: lovsPopupFormData) => {
      const payload = {
        lovId: Number(formData?.lovId) || 0,
        lovName: formData?.lovName?.trim() || "",
      };

      const resp = await fetchApi(
        "POST",
        ENDPOINTS.CREATE_UPDATE_OBSERVATION_LOV_MASTER,
        payload,
        {},
        { component: "LovsPopup" }
      );

      if (!resp?.result) {
        showWarning(resp?.message ?? "Something went wrong");
        return;
      }

      setSuccessMessage(resp?.message ?? "LOV saved successfully");
      await onSaved?.();
      onClose();
    };

    // cancel handler
    const cancelHandler = () => {
      reset({
        lovId: 0,
        lovName: "",
      });
    };

    return createPortal(
      <div className={`fixed inset-0 z-999 ${isOpen ? "" : "pointer-events-none"}`}>
        <div
          className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={onClose}
        />

        <div className={`central-popup ${isOpen ? "opacity-full" : ""}`}>
          <div className="popup-header">
            <h2 className="popup-helper-text">{buttonTitle} List of values</h2>

            <button type="button" onClick={onClose} className="close-drawer-btn">
              ×
            </button>
          </div>

          {!!successMessage && <SuccessMessage text={successMessage} />}

          <form onSubmit={handleSubmit(submitHandler)}>
            <input type="hidden" {...register("lovId")} />

            <div className="flex flex-col gap-3">
              <InputField label="List of Values" required>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter list of value"
                  {...register("lovName")}
                />
                {errors.lovName && <p className="input-field-error">{errors.lovName.message}</p>}
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

        {loading ? <CustomLoader isLoading={loading} /> : null}
      </div>,
      document.body
    );
  }
);

export default LovsPopup;
