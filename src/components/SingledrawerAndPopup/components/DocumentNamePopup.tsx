import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { SuccessMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showWarning } from "@/utils/alert";
import {
  SampleManagementDocumentNameFormData,
  sampleManagementDocumentNameSchema,
} from "@/validation/sampleManagementSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { DocumentNameItem } from "../types";

const DocumentNamePopup = React.memo(
  ({
    isOpen,
    onClose,
    refreshName,
    doc,
  }: {
    isOpen: boolean;
    onClose: () => void;
    refreshName: () => Promise<void>;
    doc: DocumentNameItem | null;
  }) => {
    const { loading, fetchApi } = useGlobalApi();
    const [successMessage, setSuccessMessage] = useState<string>("");

    const {
      handleSubmit,
      reset,
      formState: { errors },
      register,
      watch,
    } = useForm({
      resolver: yupResolver(sampleManagementDocumentNameSchema),
      defaultValues: {
        documentId: 0,
        documentName: "",
      },
    });

    useEffect(() => {
      reset({
        documentId: doc?.documentId ?? 0,
        documentName: doc?.name ?? "",
      });
    }, [isOpen, document]);
    const isEdit = Boolean(watch("documentId"));
    const buttonTitle = isEdit ? "Update" : "Create";
    //   submit handler
    const onSubmit = async (formData: SampleManagementDocumentNameFormData) => {
      console.log("formdata", formData);
      const resp = await fetchApi(
        "POST",
        ENDPOINTS.CREATE_UPDATE_INVESTIGATION_DOCUMENT_NAME_MASTER,
        formData,
        {},
        { component: "DocumentNamePopup of patient document" }
      );
      if (!resp.result) {
        showWarning(resp?.message ?? "something went wrong");
        return;
      }
      setSuccessMessage(resp?.message);
      setTimeout(() => {
        onClose();
        setSuccessMessage("");
      }, 1000);
      await refreshName?.();
      reset({
        documentId: 0,
        documentName: "",
      });
    };
    return createPortal(
      <div className={`fixed inset-0 z-9999 ${isOpen ? "" : "pointer-events-none"}`}>
        <div
          className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        />

        <div
          className={`central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] lg:min-w-250 ${isOpen ? "opacity-full" : ""}`}
        >
          <div className="popup-header">
            <h2 className="popup-helper-text">{buttonTitle} Pro Name</h2>
            <button onClick={onClose} className="close-drawer-btn">
              ×
            </button>
          </div>

          {successMessage && <SuccessMessage text={successMessage} />}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-grid-1">
              <InputField label=" Document Name" required>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter document name"
                  {...register("documentName")}
                />
                {errors.documentName && (
                  <p className="input-field-error">{errors.documentName.message}</p>
                )}
              </InputField>
            </div>
            <div className="form-actions-responsive mt-5">
              <button type="submit" className="save-btn">
                {buttonTitle}
              </button>
              <button type="button" className="cancel-button" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        </div>
        {loading ? <CustomLoader isLoading={loading} /> : <></>}
      </div>,

      document.body
    );
  }
);

export default DocumentNamePopup;
