import CentralPopup from "@/components/centralPopup";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showSuccess, showWarning } from "@/utils/alert";
import { templateCategorySchema } from "@/validation/templateMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { TemplateCategoryItem } from "../types";

interface TemplateCategoryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  /** called with the newly-created category so the caller (TemplateMaster's Template Category
   * select) can select it immediately without waiting for a separate list refetch */
  onCreated: (category: TemplateCategoryItem) => void;
}

/**
 * Quick "+" add-a-category popup, opened from TemplateMaster's Template Category select — same
 * inline-create-without-leaving-the-form pattern used throughout this codebase (e.g.
 * serviceMaster/packageMaster's category "+" buttons). Create-only. Category master has no
 * status/isActive concept on the backend, and its save response only echoes back the new id
 * ({templateCategoryId}) — the created category's own display name is stitched back on from what
 * was just submitted, not from the response.
 */
const TemplateCategoryPopup = ({ isOpen, onClose, onCreated }: TemplateCategoryPopupProps) => {
  const { loading, fetchApi } = useGlobalApi();

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(templateCategorySchema),
    defaultValues: {
      templateCategoryId: 0,
      templateCategoryName: "",
    },
  });

  const onSubmit = async (data: { templateCategoryId?: number | null; templateCategoryName: string }) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_TEMPLATE_CATEGORY,
      data,
      {},
      { component: "TemplateCategoryPopup" }
    );

    if (!resp?.result) {
      showWarning(resp?.message ?? "Failed to save template category");
      return;
    }

    showSuccess(resp?.message ?? "Template category saved successfully");

    const saved = resp?.data ?? {};
    onCreated({
      templateCategoryId: Number(saved.templateCategoryId ?? saved.TemplateCategoryId ?? 0),
      templateCategoryName: data.templateCategoryName,
    });

    reset({ templateCategoryId: 0, templateCategoryName: "" });
    onClose();
  };

  return (
    <CentralPopup isOpen={isOpen} onClose={onClose} title="Add Template Category">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-grid-1">
          <InputField label="Category Name" required>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Assessment"
              {...register("templateCategoryName")}
            />
            {errors.templateCategoryName && (
              <p className="input-field-error">{errors.templateCategoryName.message}</p>
            )}
          </InputField>
        </div>

        <div className="form-actions-responsive mt-5">
          <button type="submit" className="save-btn">
            Create
          </button>
          <button type="button" className="cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
      {!!loading && <CustomLoader isLoading={loading} />}
    </CentralPopup>
  );
};

export default TemplateCategoryPopup;
