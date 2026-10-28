import CentralPopup from "@/components/centralPopup";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showSuccess, showWarning } from "@/utils/alert";
import {
  SampleManagementDocumentNameFormData,
  sampleManagementDocumentNameSchema,
} from "@/validation/sampleManagementSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect, useState } from "react";
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
    refreshName?: () => Promise<void> | void;
    doc?: DocumentNameItem | null;
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
      if (isOpen) {
        const id = doc?.documentId
          ? Number(doc.documentId)
          : (doc as any)?.InvestigationDocumentNameId
            ? Number((doc as any).InvestigationDocumentNameId)
            : 0;
        const name = doc?.name ?? (doc as any)?.documentName ?? "";

        reset({
          documentId: id,
          documentName: name,
        });
        setSuccessMessage("");
      }
    }, [isOpen, doc, reset]);

    const isEdit = Number(watch("documentId") || 0) > 0;
    const buttonTitle = isEdit ? "Update" : "Create";

    // submit handler
    const onSubmit = async (formData: SampleManagementDocumentNameFormData) => {
      const payload = {
        documentId: Number(formData.documentId || 0),
        documentName: formData.documentName.trim(),
      };

      const resp = await fetchApi(
        "POST",
        ENDPOINTS.CREATE_UPDATE_INVESTIGATION_DOCUMENT_NAME_MASTER,
        payload,
        {},
        { component: "DocumentNamePopup" }
      );

      if (!resp?.result) {
        showWarning(resp?.message ?? "Something went wrong");
        return;
      }

      showSuccess(resp?.message ?? `Document name ${isEdit ? "updated" : "created"} successfully`);
      setSuccessMessage(
        resp?.message ?? `Document name ${isEdit ? "updated" : "created"} successfully`
      );

      const newId =
        resp?.data?.documentId ?? (typeof resp?.data === "number" ? resp?.data : undefined);

      await refreshName?.(newId);

      reset({
        documentId: 0,
        documentName: "",
      });

      setTimeout(() => {
        onClose();
        setSuccessMessage("");
      }, 500);
    };

    return (
      <CentralPopup
        title={isEdit ? "Edit Document Name" : "Add Document Name"}
        isOpen={isOpen}
        onClose={onClose}
        className="w-full sm:max-w-md lg:max-w-lg"
      >
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Hidden field for documentId */}
            <input type="hidden" {...register("documentId", { valueAsNumber: true })} />

            <div className="form-grid-1">
              <InputField label="Document Name" required>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter document name"
                  autoFocus
                  {...register("documentName")}
                />
                {errors.documentName && (
                  <p className="input-field-error">{errors.documentName.message}</p>
                )}
              </InputField>
            </div>

            <div className="form-actions-responsive mt-5">
              <button type="submit" className="save-btn" disabled={loading}>
                {buttonTitle}
              </button>
              <button type="button" className="cancel-button" onClick={onClose} disabled={loading}>
                Cancel
              </button>
            </div>
          </form>

          {loading && <CustomLoader isLoading={loading} />}
        </div>
      </CentralPopup>
    );
  }
);

export default DocumentNamePopup;
