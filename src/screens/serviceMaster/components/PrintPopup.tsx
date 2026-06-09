import InputField from "@/components/customInputField";
import { ServiceMasterPopupName } from "@/constants/constants";
import { useScrollLock } from "@/hooks/useScrollLock";
import { allowOnlyNumbers, allowOnlyText } from "@/utils/inputValidationHandler";
import {
  CreateUpdatePrintGroupFormItem,
  createUpdatePrintGroupSchema,
} from "@/validation/serviceMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import React from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";

const PrintPopup = React.memo(
  ({ isOpen, onClose, popupName }: { isOpen: boolean; onClose: () => void; popupName: string }) => {
    const buttonTitle = "Create";

    const {
      handleSubmit,
      reset,
      setValue,
      register,
      formState: { errors },
    } = useForm({
      resolver: yupResolver(createUpdatePrintGroupSchema),
      defaultValues: {
        printGroupId: 0,
        printGroupName: "",
        printOrder: 0,
      },
    });

    // submit handler
    const onSubmit = (formData: CreateUpdatePrintGroupFormItem) => {
      console.log("formData", formData);
    };

    useScrollLock(isOpen);

    return createPortal(
      <div className={`fixed inset-0 z-9999 ${isOpen ? "" : "pointer-events-none"}`}>
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
              {popupName === ServiceMasterPopupName?.PRINT_GROUP
                ? `${buttonTitle} Print Group`
                : null}
            </h2>

            <button onClick={onClose} className="close-drawer-btn shrink-0 ml-3">
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <InputField label="Print Group Name" required>
              <input type="text" className="input-field" onInput={allowOnlyText} />
              {errors.printGroupName && (
                <p className="input-field-error">{errors.printGroupName.message}</p>
              )}
            </InputField>

            <InputField label="Print Order" required>
              <input className="input-field" type="text" onInput={allowOnlyNumbers} />
              {errors.printOrder && (
                <p className="input-field-error">{errors.printOrder.message}</p>
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
        </div>
      </div>,
      document.body
    );
  }
);

export default PrintPopup;
