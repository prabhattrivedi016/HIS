import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import { ServiceMasterPopupName } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import { allowOnlyNumbers, allowOnlyText } from "@/utils/inputValidationHandler";
import {
  CreateUpdatePrintGroupFormItem,
  createUpdatePrintGroupSchema,
} from "@/validation/serviceMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { PrintGroupItem } from "../types";

const PrintPopup = React.memo(
  ({
    isOpen,
    onClose,
    popupName,
    data,
    refreshData,
    resetPrintGroupId,
    resetData,
  }: {
    isOpen: boolean;
    onClose: () => void;
    popupName: string;
    data: PrintGroupItem | null;
    refreshData: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<any, Error>>;
    resetPrintGroupId: Dispatch<SetStateAction<number>>;
    resetData: Dispatch<SetStateAction<PrintGroupItem | null>>;
  }) => {
    const { loading, fetchApi } = useGlobalApi();
    const buttonTitle = data ? "Update" : "Create";
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");

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
        printOrder: 1,
      },
    });

    useEffect(() => {
      if (!data) return;
      reset({
        printGroupId: data?.PrintGroupId ?? 0,
        printGroupName: data?.PrintGroupName ?? "",
        printOrder: data?.PrintOrder ?? 1,
      });
    }, [data, popupName]);

    // submit handler
    const onSubmit = async (formData: CreateUpdatePrintGroupFormItem) => {
      const resp = await fetchApi(
        "POST",
        ENDPOINTS.CREATE_UPDATE_PRINT_GROUP_MASTER,
        formData,
        {},
        { component: "CreateUpdatePopup" }
      );
      if (!resp?.result) {
        setErrorMessage(resp?.message ?? "Failed to update print group");
        return;
      }
      setSuccessMessage(resp?.message ?? "Data saved successfully");
      refreshData?.();
      resetPrintGroupId(0);
      resetData(null);
      setTimeout(() => {
        reset({
          printGroupId: 0,
          printGroupName: "",
          printOrder: 1,
        });
        onClose();
      }, 500);
    };

    // cancel handler
    const cancelHandler = () => {
      reset({
        printGroupId: 0,
        printGroupName: "",
        printOrder: 1,
      });
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

          {!!successMessage && <SuccessMessage text={successMessage} />}
          {!!errorMessage && <ErrorMessage text={errorMessage} />}

          <form onSubmit={handleSubmit(onSubmit)}>
            <InputField label="Print Group Name" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter print group name"
                {...register("printGroupName")}
                onInput={allowOnlyText}
              />
              {errors.printGroupName && (
                <p className="input-field-error">{errors.printGroupName.message}</p>
              )}
            </InputField>

            <InputField label="Print Order" required>
              <input
                className="input-field"
                type="text"
                placeholder="Enter print order"
                onInput={allowOnlyNumbers}
                {...register("printOrder")}
              />
              {errors.printOrder && (
                <p className="input-field-error">{errors.printOrder.message}</p>
              )}
            </InputField>

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
  }
);

export default PrintPopup;
