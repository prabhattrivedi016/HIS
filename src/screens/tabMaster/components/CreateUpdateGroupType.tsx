import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import { TabGroupTypeFormData, tabGroupTypeSchema } from "@/validation/tabMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { QueryObserverResult } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { GroupTypeItem } from "../types";

const CreateUpdateGroupType = ({
  isOpen,
  onClose,
  data = null,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: GroupTypeItem | null;
  onSuccess: () => Promise<QueryObserverResult<any, Error>>;
}) => {
  const { loading, fetchApi } = useGlobalApi();

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    handleSubmit,
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(tabGroupTypeSchema),
    defaultValues: {
      groupTypeId: 0,
      groupTypeName: "",
    },
  });

  const selectedGroupTypeId = Number(watch("groupTypeId") ?? 0);
  const isEditMode = selectedGroupTypeId > 0;
  const buttonTitle = isEditMode ? "Update" : "Create";
  const popupTitle = isEditMode ? "Update Group Type" : "Create Group Type";

  useEffect(() => {
    if (!isOpen) return;

    setSuccessMessage("");
    setErrorMessage("");
    reset({
      groupTypeId: data?.GroupTypeId ?? 0,
      groupTypeName: data?.GroupTypeName ?? "",
    });
  }, [isOpen, reset, data]);

  const cancelHandler = () => {
    reset({
      groupTypeId: 0,
      groupTypeName: "",
    });
    setSuccessMessage("");
    setErrorMessage("");
  };

  const onSubmit = async (formData: TabGroupTypeFormData) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_TAB_GROUP_TYPE_MASTER,
      formData,
      {},
      { component: "CreateUpdateGroupType" }
    );

    if (!resp?.result) {
      setErrorMessage(resp?.message ?? "Failed to save group type");
      return;
    }

    setSuccessMessage(resp?.message ?? "Group type saved successfully");
    onSuccess?.();
    setTimeout(() => {
      onClose();
      reset({
        groupTypeId: 0,
        groupTypeName: "",
      });
      setSuccessMessage("");
      setErrorMessage("");
    }, 500);
  };

  useScrollLock(isOpen);

  return createPortal(
    <div className={`fixed inset-0 z-9999 ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      <div
        className={`central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw]  ${
          isOpen ? "opacity-full" : ""
        }`}
      >
        <div className="popup-header min-w-0">
          <h2 className="popup-helper-text truncate">{popupTitle}</h2>
          <button type="button" onClick={onClose} className="close-drawer-btn shrink-0 ml-3">
            ×
          </button>
        </div>

        {!!successMessage && <SuccessMessage text={successMessage} />}
        {!!errorMessage && <ErrorMessage text={errorMessage} />}

        <form onSubmit={handleSubmit(onSubmit)}>
          <InputField label="Group Type Name" required>
            <input
              type="text"
              className="input-field"
              placeholder="Enter group type name"
              {...register("groupTypeName")}
            />
            {errors.groupTypeName && (
              <p className="input-field-error">{errors.groupTypeName.message}</p>
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

      {loading && <CustomLoader isLoading={loading} />}
    </div>,
    document.body
  );
};

export default CreateUpdateGroupType;
