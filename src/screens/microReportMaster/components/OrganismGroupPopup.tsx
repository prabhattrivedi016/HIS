import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { OrganismGroupItem } from "@/screens/microReportMaster/types";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { OrganismGroupFormItem, organismGroupSchema } from "@/validation/microReportMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";

const OrganismGroupPopup = ({
  isOpen,
  onClose,
  data,
  onRefresh,
  initialValue,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: OrganismGroupItem | null;
  onRefresh: () => Promise<any>;
  initialValue?: (val: OrganismGroupItem | null) => void;
}) => {
  const { loading, fetchApi } = useGlobalApi();
  const queryClient = useQueryClient();

  const {
    handleSubmit,
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(organismGroupSchema),
    defaultValues: {
      organismGroupId: data?.organismGroupId ?? 0,
      organismGroupName: data?.organismGroupName ?? "",
    },
  });

  const buttonTitle = data ? "Update" : "Create";

  // Reset form
  useEffect(() => {
    reset({
      organismGroupId: data?.organismGroupId ?? 0,
      organismGroupName: data?.organismGroupName ?? "",
    });
  }, [data, reset]);

  const createUpdateOrganismGroup = async (data: OrganismGroupFormItem) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_ORGANISM_GROUP,
      data,
      {},
      { component: "OrganismGroupPopup" }
    );
    return resp;
  };

  const mutation = useMutation({
    mutationFn: createUpdateOrganismGroup,
    onSuccess: resp => {
      if (!resp?.result) {
        showWarning(resp?.message ?? "Failed to update data");
        return;
      }
      showSuccess(resp?.message ?? "Data saved successfully");
      queryClient.invalidateQueries({ queryKey: ["organismGroupList"] });
      onRefresh?.();
      initialValue?.(null);
      onClose();
    },
    onError: errors => {
      showError(errors?.message ?? "Something went wrong!");
    },
  });

  //   submit handler
  const onsubmit = (data: OrganismGroupFormItem) => {
    mutation.mutate(data);
  };

  // cancel handler
  const cancelHandler = () => {
    reset({
      organismGroupId: 0,
      organismGroupName: "",
    });
    initialValue?.(null);
  };

  return createPortal(
    <div className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      <div
        className={`central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] ${
          isOpen ? "opacity-full" : ""
        }`}
      >
        <div className="popup-header min-w-0">
          <h2 className="popup-helper-text truncate">Organism Group</h2>

          <button onClick={onClose} className="close-drawer-btn shrink-0 ml-3">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onsubmit)}>
          <InputField label="Organism Group Name" required>
            <input type="text" className="input-field" {...register("organismGroupName")} />
            {errors.organismGroupName && (
              <p className="input-field-error">{errors.organismGroupName.message}</p>
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
};

export default OrganismGroupPopup;
