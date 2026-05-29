import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { AntibioticGroupItem } from "@/screens/microReportMaster/types";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { antibioticGroupSchema, AntibioticGroupFormItem } from "@/validation/microReportMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";

const AntibioticGroupPopup = ({
  isOpen,
  onClose,
  data,
  onRefresh,
  initialValue,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: AntibioticGroupItem | null;
  onRefresh: () => Promise<any>;
  initialValue?: (val: AntibioticGroupItem | null) => void;
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
    resolver: yupResolver(antibioticGroupSchema),
    defaultValues: {
      antibioticGroupId: data?.antibioticGroupId ?? 0,
      antibioticGroupName: data?.antibioticGroupName ?? "",
    },
  });

  const buttonTitle = data ? "Update" : "Create";

  // Reset form
  useEffect(() => {
    reset({
      antibioticGroupId: data?.antibioticGroupId ?? 0,
      antibioticGroupName: data?.antibioticGroupName ?? "",
    });
  }, [data, reset]);

  const createUpdateAntibioticGroup = async (data: AntibioticGroupFormItem) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_ANTIBIOTIC_GROUP,
      data,
      {},
      { component: "AntibioticGroupPopup" }
    );
    return resp;
  };

  const mutation = useMutation({
    mutationFn: createUpdateAntibioticGroup,
    onSuccess: resp => {
      if (!resp?.result) {
        showWarning(resp?.message ?? "Failed to update data");
        return;
      }
      showSuccess(resp?.message ?? "Data saved successfully");
      queryClient.invalidateQueries({ queryKey: ["antibioticGroupList"] });
      onRefresh?.();
      initialValue?.(null);
      onClose();
    },
    onError: errors => {
      showError(errors?.message ?? "Something went wrong!");
    },
  });

  //   submit handler
  const onsubmit = (data: AntibioticGroupFormItem) => {
    mutation.mutate(data);
  };

  // cancel handler
  const cancelHandler = () => {
    reset({
      antibioticGroupId: 0,
      antibioticGroupName: "",
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
          <h2 className="popup-helper-text truncate">Antibiotic Group</h2>

          <button onClick={onClose} className="close-drawer-btn shrink-0 ml-3">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onsubmit)}>
          <InputField label="Antibiotic Group Name" required>
            <input type="text" className="input-field" {...register("antibioticGroupName")} />
            {errors.antibioticGroupName && (
              <p className="input-field-error">{errors.antibioticGroupName.message}</p>
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

export default AntibioticGroupPopup;
